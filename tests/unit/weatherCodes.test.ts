import { describe, expect, it } from 'vitest';
import { describeWeatherCode } from '../../src/lib/weatherCodes';

describe('descrição dos códigos meteorológicos WMO', () => {
  it.each([
    [0, 'sunny', 'Céu limpo'],
    [2, 'partly-cloudy', 'Parcialmente nublado'],
    [61, 'rainy', 'Chuva leve'],
    [95, 'storm', 'Trovoada'],
  ] as const)('mapeia o código %i', (code, condition, description) => {
    expect(describeWeatherCode(code)).toEqual({ condition, description });
  });

  it('fornece fallback para código desconhecido ou ausente', () => {
    expect(describeWeatherCode(999).description).toBe('Condição desconhecida');
    expect(describeWeatherCode(null).description).toBe('Condição indisponível');
  });
});