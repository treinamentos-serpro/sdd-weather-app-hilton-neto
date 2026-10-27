import { formatForecastDate, formatUpdateTime } from '../lib/format';
import { describeWeatherCode } from '../lib/weatherCodes';
import type { City, CurrentWeather, ForecastDay, WeatherData } from '../types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const REQUEST_TIMEOUT_MS = 10_000;

export class WeatherServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nullableNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function requiredNumber(value: unknown, field: string): number {
  const parsed = nullableNumber(value);
  if (parsed === null) throw new WeatherServiceError(`Resposta inválida: campo ${field} ausente.`);
  return parsed;
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new WeatherServiceError(`Resposta inválida: campo ${field} ausente.`);
  }
  return value;
}

async function fetchJson(url: string, signal?: AbortSignal): Promise<unknown> {
  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);
  const abortRequest = () => controller.abort();

  signal?.addEventListener('abort', abortRequest, { once: true });
  if (signal?.aborted) abortRequest();

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new WeatherServiceError('O serviço de clima está indisponível. Tente novamente.');
    }

    try {
      return (await response.json()) as unknown;
    } catch {
      throw new WeatherServiceError('O serviço retornou uma resposta inválida. Tente novamente.');
    }
  } catch (error) {
    if (error instanceof WeatherServiceError) throw error;
    if (timedOut) {
      throw new WeatherServiceError('A consulta demorou demais. Tente novamente.');
    }
    if (signal?.aborted) throw error;
    throw new WeatherServiceError('Não foi possível conectar ao serviço de clima. Verifique sua conexão.');
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', abortRequest);
  }
}

function mapCity(value: unknown): City {
  if (!isRecord(value)) throw new WeatherServiceError('O serviço retornou uma cidade inválida.');

  const id = requiredNumber(value.id, 'id');
  const name = requiredString(value.name, 'name');
  const latitude = requiredNumber(value.latitude, 'latitude');
  const longitude = requiredNumber(value.longitude, 'longitude');

  return {
    id,
    name,
    country: typeof value.country === 'string' ? value.country : 'País não informado',
    admin1: typeof value.admin1 === 'string' ? value.admin1 : null,
    latitude,
    longitude,
  };
}

export async function searchCities(name: string, signal?: AbortSignal): Promise<City[]> {
  const query = name.trim();
  if (!query) return [];

  const params = new URLSearchParams({ name: query, count: '5', language: 'pt', format: 'json' });
  const payload = await fetchJson(`${GEOCODING_URL}?${params.toString()}`, signal);
  if (!isRecord(payload)) throw new WeatherServiceError('O serviço retornou uma resposta inválida.');
  if (payload.results === undefined) return [];
  if (!Array.isArray(payload.results)) {
    throw new WeatherServiceError('O serviço retornou uma lista de cidades inválida.');
  }

  return payload.results.map(mapCity);
}

function mapCurrent(value: unknown): CurrentWeather {
  if (!isRecord(value)) throw new WeatherServiceError('O clima atual não está disponível.');

  const time = requiredString(value.time, 'current.time');
  const description = describeWeatherCode(nullableNumber(value.weather_code));

  return {
    temperature: nullableNumber(value.temperature_2m),
    feelsLike: nullableNumber(value.apparent_temperature),
    condition: description.condition,
    description: description.description,
    humidity: nullableNumber(value.relative_humidity_2m),
    windSpeed: nullableNumber(value.wind_speed_10m),
    pressure: nullableNumber(value.surface_pressure),
    precipitation: nullableNumber(value.precipitation),
    updatedAt: formatUpdateTime(time),
  };
}

function readDailySeries(value: unknown): unknown[] | null {
  return Array.isArray(value) ? value : null;
}

function dailyValue(series: unknown[] | null, index: number): number | null {
  return series ? nullableNumber(series[index]) : null;
}

function mapForecast(value: unknown): ForecastDay[] {
  if (!isRecord(value) || !Array.isArray(value.time)) {
    throw new WeatherServiceError('A previsão não está disponível.');
  }

  const dates = value.time.map((date) => requiredString(date, 'daily.time'));
  if (dates.length === 0) throw new WeatherServiceError('A previsão não está disponível.');

  const codes = readDailySeries(value.weather_code);
  const minima = readDailySeries(value.temperature_2m_min);
  const maxima = readDailySeries(value.temperature_2m_max);
  const precipitation = readDailySeries(value.precipitation_probability_max);

  return dates.map((date, index) => {
    const { label, date: formattedDate } = formatForecastDate(date, index);
    return {
      id: date,
      label,
      date: formattedDate,
      condition: describeWeatherCode(nullableNumber(codes?.[index])).condition,
      min: dailyValue(minima, index),
      max: dailyValue(maxima, index),
      precipitationProbability: dailyValue(precipitation, index),
    };
  });
}

export async function getWeather(city: City, signal?: AbortSignal): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current:
      'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,surface_pressure,precipitation,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    forecast_days: '5',
    timezone: 'auto',
    wind_speed_unit: 'kmh',
  });

  const payload = await fetchJson(`${FORECAST_URL}?${params.toString()}`, signal);
  if (!isRecord(payload)) throw new WeatherServiceError('O serviço retornou uma resposta inválida.');

  return {
    city,
    current: mapCurrent(payload.current),
    forecast: mapForecast(payload.daily),
  };
}