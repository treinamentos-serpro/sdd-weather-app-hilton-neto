import { afterEach, describe, expect, it, vi } from 'vitest';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

const city: City = {
  id: 1,
  name: 'Lisboa',
  country: 'Portugal',
  admin1: 'Lisboa',
  latitude: 38.7,
  longitude: -9.1,
};

function mockResponse(body: unknown, ok = true): Response {
  return { ok, json: async () => body } as Response;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('weatherService', () => {
  it('busca e mapeia cidades usando o endpoint de geocoding', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockResponse({
        results: [
          { id: 1, name: 'Lisboa', country: 'Portugal', admin1: 'Lisboa', latitude: 38.7, longitude: -9.1 },
        ],
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities(' Lisboa ')).resolves.toEqual([city]);
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.hostname).toBe('geocoding-api.open-meteo.com');
    expect(url.searchParams.get('name')).toBe('Lisboa');
    expect(url.searchParams.get('language')).toBe('pt');
  });

  it('não chama a rede para uma busca vazia', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('   ')).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('mapeia clima atual e cinco dias preservando valores ausentes', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockResponse({
        current: {
          time: '2026-10-27T12:30',
          temperature_2m: 19,
          apparent_temperature: 18,
          relative_humidity_2m: 54,
          wind_speed_10m: 9,
          surface_pressure: 1021,
          precipitation: 0,
          weather_code: 0,
        },
        daily: {
          time: ['2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31'],
          weather_code: [0, 2, 3, 61, 95],
          temperature_2m_max: [22, 23, 21, 20, null],
          temperature_2m_min: [15, 16, 15, 14, 14],
          precipitation_probability_max: [0, 5, 15, 45, null],
        },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await getWeather(city);

    expect(result.city).toEqual(city);
    expect(result.current.temperature).toBe(19);
    expect(result.current.description).toBe('Céu limpo');
    expect(result.forecast).toHaveLength(5);
    expect(result.forecast[4].max).toBeNull();
    expect(result.forecast[4].precipitationProbability).toBeNull();
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.hostname).toBe('api.open-meteo.com');
    expect(url.searchParams.get('latitude')).toBe(String(city.latitude));
    expect(url.searchParams.get('forecast_days')).toBe('5');
  });

  it('converte falha HTTP em erro de serviço', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse({}, false)));

    await expect(searchCities('Lisboa')).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it('rejeita uma resposta de geocoding com estrutura inválida', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse({ results: 'Lisboa' })));

    await expect(searchCities('Lisboa')).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it('rejeita uma resposta de previsão sem clima atual ou datas diárias', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse({ current: {}, daily: {} })));

    await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it('converte uma consulta que excede o timeout em erro recuperável', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn((_url: RequestInfo | URL, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'));
        });
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const request = searchCities('Lisboa');
    const assertion = expect(request).rejects.toThrow('A consulta demorou demais');
    await vi.advanceTimersByTimeAsync(10_000);
    await assertion;
  });
});