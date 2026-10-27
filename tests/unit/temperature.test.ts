import { describe, expect, it } from 'vitest';
import { convertTemperature, formatTemperature } from '../../src/lib/temperature';

describe('conversão de temperatura', () => {
  it.each([
    [0, 32],
    [100, 212],
    [-40, -40],
  ])('converte %i°C para %i°F', (celsius, fahrenheit) => {
    expect(convertTemperature(celsius, 'fahrenheit')).toBe(fahrenheit);
  });

  it('mantém Celsius sem conversão e arredonda para exibição', () => {
    expect(convertTemperature(18.5, 'celsius')).toBe(18.5);
    expect(formatTemperature(18.5, 'celsius')).toBe('19°C');
  });

  it('representa temperatura ausente sem inventar um valor', () => {
    expect(convertTemperature(null, 'fahrenheit')).toBeNull();
    expect(formatTemperature(null, 'fahrenheit')).toBe('—');
  });
});