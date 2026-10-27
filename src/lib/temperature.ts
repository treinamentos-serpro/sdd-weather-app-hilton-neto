import type { Unit } from '../types/weather';

export function convertTemperature(value: number | null, unit: Unit): number | null {
  if (value === null) return null;
  return unit === 'fahrenheit' ? (value * 9) / 5 + 32 : value;
}

export function formatTemperature(value: number | null, unit: Unit): string {
  if (value === null) return '—';
  const converted = convertTemperature(value, unit);
  if (converted === null) return '—';
  const suffix = unit === 'celsius' ? 'C' : 'F';
  return `${Math.round(converted)}°${suffix}`;
}