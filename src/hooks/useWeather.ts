import { useCallback, useEffect, useRef, useState } from 'react';
import { getWeather, searchCities } from '../services/weatherService';
import type { City, WeatherData } from '../types/weather';

export type WeatherStatus =
  | 'idle'
  | 'searching'
  | 'selecting'
  | 'loadingWeather'
  | 'success'
  | 'empty'
  | 'error';

interface UseWeatherResult {
  status: WeatherStatus;
  data: WeatherData | null;
  cities: City[];
  query: string;
  error: string | null;
  search: (name: string) => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  retry: () => Promise<void>;
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Não foi possível carregar os dados. Tente novamente.';
}

export function useWeather(): UseWeatherResult {
  const [status, setStatus] = useState<WeatherStatus>('idle');
  const [data, setData] = useState<WeatherData | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const lastCity = useRef<City | null>(null);

  useEffect(
    () => () => {
      requestId.current += 1;
      controller.current?.abort();
    },
    [],
  );

  const beginRequest = useCallback(() => {
    controller.current?.abort();
    controller.current = new AbortController();
    requestId.current += 1;
    return { id: requestId.current, signal: controller.current.signal };
  }, []);

  const loadCity = useCallback(
    async (city: City) => {
      const request = beginRequest();
      lastCity.current = city;
      setStatus('loadingWeather');
      setData(null);
      setCities([]);
      setError(null);

      try {
        const weather = await getWeather(city, request.signal);
        if (request.id !== requestId.current) return;
        setData(weather);
        setStatus('success');
      } catch (requestError) {
        if (request.id !== requestId.current || request.signal.aborted) return;
        setError(errorMessage(requestError));
        setStatus('error');
      }
    },
    [beginRequest],
  );

  const search = useCallback(
    async (name: string) => {
      const trimmedName = name.trim();
      if (!trimmedName) return;

      const request = beginRequest();
      setQuery(trimmedName);
      setStatus('searching');
      setData(null);
      setCities([]);
      setError(null);
      lastCity.current = null;

      try {
        const results = await searchCities(trimmedName, request.signal);
        if (request.id !== requestId.current) return;

        if (results.length === 0) {
          lastCity.current = null;
          setStatus('empty');
          return;
        }

        if (results.length === 1) {
          await loadCity(results[0]);
          return;
        }

        lastCity.current = null;
        setCities(results);
        setStatus('selecting');
      } catch (requestError) {
        if (request.id !== requestId.current || request.signal.aborted) return;
        setError(errorMessage(requestError));
        setStatus('error');
      }
    },
    [beginRequest, loadCity],
  );

  const selectCity = useCallback(
    async (city: City) => {
      await loadCity(city);
    },
    [loadCity],
  );

  const retry = useCallback(async () => {
    if (lastCity.current) {
      await loadCity(lastCity.current);
    } else if (query) {
      await search(query);
    }
  }, [loadCity, query, search]);

  return { status, data, cities, query, error, search, selectCity, retry };
}