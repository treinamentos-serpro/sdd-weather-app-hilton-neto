import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWeather } from '../../src/hooks/useWeather';
import type { City, WeatherData } from '../../src/types/weather';

const { searchCities, getWeather } = vi.hoisted(() => ({
  searchCities: vi.fn(),
  getWeather: vi.fn(),
}));

vi.mock('../../src/services/weatherService', () => ({ searchCities, getWeather }));

const lisboa: City = {
  id: 1,
  name: 'Lisboa',
  country: 'Portugal',
  admin1: 'Lisboa',
  latitude: 38.7,
  longitude: -9.1,
};

const tokyo: City = {
  id: 2,
  name: 'Tóquio',
  country: 'Japão',
  admin1: 'Tóquio',
  latitude: 35.6,
  longitude: 139.7,
};

const weather: WeatherData = {
  city: lisboa,
  current: {
    temperature: 19,
    feelsLike: 18,
    condition: 'sunny',
    description: 'Céu limpo',
    humidity: 54,
    windSpeed: 9,
    pressure: 1021,
    precipitation: 0,
    updatedAt: 'Atualizado às 10:20',
  },
  forecast: [],
};

beforeEach(() => {
  vi.clearAllMocks();
  searchCities.mockResolvedValue([lisboa]);
  getWeather.mockResolvedValue(weather);
});

describe('useWeather', () => {
  it('aborta o request ativo quando o hook é desmontado', async () => {
    let activeSignal: AbortSignal | undefined;
    searchCities.mockImplementation((_query: string, signal: AbortSignal) => {
      activeSignal = signal;
      return new Promise<City[]>(() => undefined);
    });
    const { result, unmount } = renderHook(() => useWeather());

    act(() => {
      void result.current.search('Lisboa');
    });
    expect(activeSignal?.aborted).toBe(false);

    unmount();

    expect(activeSignal?.aborted).toBe(true);
  });

  it('transiciona para vazio quando a busca não encontra cidades', async () => {
    searchCities.mockResolvedValue([]);
    const { result } = renderHook(() => useWeather());

    await act(async () => result.current.search('Cidade inexistente'));

    expect(result.current.status).toBe('empty');
    expect(result.current.data).toBeNull();
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('aguarda seleção explícita quando há mais de uma cidade', async () => {
    searchCities.mockResolvedValue([lisboa, tokyo]);
    const { result } = renderHook(() => useWeather());

    await act(async () => result.current.search('Lis'));

    expect(result.current.status).toBe('selecting');
    expect(result.current.cities).toEqual([lisboa, tokyo]);
    expect(getWeather).not.toHaveBeenCalled();

    await act(async () => result.current.selectCity(tokyo));

    expect(result.current.status).toBe('success');
    expect(getWeather).toHaveBeenCalledWith(tokyo, expect.any(AbortSignal));
  });

  it('recarrega a última cidade selecionada após erro e retry', async () => {
    getWeather.mockRejectedValueOnce(new Error('Serviço indisponível')).mockResolvedValueOnce(weather);
    const { result } = renderHook(() => useWeather());

    await act(async () => result.current.search('Lisboa'));
    expect(result.current.status).toBe('error');
    expect(result.current.data).toBeNull();

    await act(async () => result.current.retry());

    expect(result.current.status).toBe('success');
    expect(result.current.data).toEqual(weather);
    expect(getWeather).toHaveBeenCalledTimes(2);
  });

  it('ignora respostas de busca obsoletas', async () => {
    let resolveOldSearch: (cities: City[]) => void = () => undefined;
    searchCities
      .mockImplementationOnce(() => new Promise<City[]>((resolve) => (resolveOldSearch = resolve)))
      .mockResolvedValueOnce([lisboa]);
    const { result } = renderHook(() => useWeather());
    let oldSearch: Promise<void> = Promise.resolve();

    act(() => {
      oldSearch = result.current.search('Busca antiga');
    });
    await act(async () => result.current.search('Lisboa'));
    expect(result.current.data?.city).toEqual(lisboa);

    await act(async () => {
      resolveOldSearch([tokyo]);
      await oldSearch;
    });

    await waitFor(() => expect(result.current.data?.city).toEqual(lisboa));
    expect(getWeather).toHaveBeenCalledTimes(1);
    expect(getWeather).toHaveBeenCalledWith(lisboa, expect.any(AbortSignal));
  });
});