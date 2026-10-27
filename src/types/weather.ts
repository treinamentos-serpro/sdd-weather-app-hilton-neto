export type Unit = 'celsius' | 'fahrenheit';

export type WeatherCondition = 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy' | 'storm';

export interface City {
  id: number;
  name: string;
  country: string;
  admin1: string | null;
  latitude: number;
  longitude: number;
}

export interface CurrentWeather {
  temperature: number | null;
  feelsLike: number | null;
  condition: WeatherCondition;
  description: string;
  humidity: number | null;
  windSpeed: number | null;
  pressure: number | null;
  precipitation: number | null;
  updatedAt: string;
}

export interface ForecastDay {
  id: string;
  label: string;
  date: string;
  condition: WeatherCondition;
  min: number | null;
  max: number | null;
  precipitationProbability: number | null;
}

export interface WeatherData {
  city: City;
  current: CurrentWeather;
  forecast: ForecastDay[];
}