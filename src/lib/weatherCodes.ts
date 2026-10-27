import type { WeatherCondition } from '../types/weather';

export interface WeatherDescription {
  condition: WeatherCondition;
  description: string;
}

const descriptions: Record<number, WeatherDescription> = {
  0: { condition: 'sunny', description: 'Céu limpo' },
  1: { condition: 'partly-cloudy', description: 'Predominantemente limpo' },
  2: { condition: 'partly-cloudy', description: 'Parcialmente nublado' },
  3: { condition: 'cloudy', description: 'Nublado' },
  45: { condition: 'cloudy', description: 'Nevoeiro' },
  48: { condition: 'cloudy', description: 'Nevoeiro com geada' },
  51: { condition: 'rainy', description: 'Garoa leve' },
  53: { condition: 'rainy', description: 'Garoa moderada' },
  55: { condition: 'rainy', description: 'Garoa intensa' },
  56: { condition: 'rainy', description: 'Garoa congelante leve' },
  57: { condition: 'rainy', description: 'Garoa congelante intensa' },
  61: { condition: 'rainy', description: 'Chuva leve' },
  63: { condition: 'rainy', description: 'Chuva moderada' },
  65: { condition: 'rainy', description: 'Chuva intensa' },
  66: { condition: 'rainy', description: 'Chuva congelante leve' },
  67: { condition: 'rainy', description: 'Chuva congelante intensa' },
  71: { condition: 'cloudy', description: 'Neve leve' },
  73: { condition: 'cloudy', description: 'Neve moderada' },
  75: { condition: 'cloudy', description: 'Neve intensa' },
  77: { condition: 'cloudy', description: 'Grãos de neve' },
  80: { condition: 'rainy', description: 'Pancadas de chuva leves' },
  81: { condition: 'rainy', description: 'Pancadas de chuva moderadas' },
  82: { condition: 'rainy', description: 'Pancadas de chuva intensas' },
  85: { condition: 'cloudy', description: 'Pancadas de neve leves' },
  86: { condition: 'cloudy', description: 'Pancadas de neve intensas' },
  95: { condition: 'storm', description: 'Trovoada' },
  96: { condition: 'storm', description: 'Trovoada com granizo leve' },
  99: { condition: 'storm', description: 'Trovoada com granizo intenso' },
};

export function describeWeatherCode(code: number | null): WeatherDescription {
  return code === null
    ? { condition: 'cloudy', description: 'Condição indisponível' }
    : (descriptions[code] ?? { condition: 'cloudy', description: 'Condição desconhecida' });
}