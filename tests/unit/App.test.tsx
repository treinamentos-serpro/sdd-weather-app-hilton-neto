import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import type { City, WeatherData } from '../../src/types/weather';

const { searchCities, getWeather } = vi.hoisted(() => ({
  searchCities: vi.fn(),
  getWeather: vi.fn(),
}));

vi.mock('../../src/services/weatherService', () => ({ searchCities, getWeather }));

const lisbon: City = {
  id: 1,
  name: 'Lisboa',
  country: 'Portugal',
  admin1: 'Lisboa',
  latitude: 38.7,
  longitude: -9.1,
};

const weather: WeatherData = {
  city: lisbon,
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
  forecast: [
    {
      id: '2026-10-27',
      label: 'Hoje',
      date: '27 de out',
      condition: 'sunny',
      min: 15,
      max: 22,
      precipitationProbability: 0,
    },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  searchCities.mockResolvedValue([lisbon]);
  getWeather.mockResolvedValue(weather);
});

describe('WeatherView', () => {
  it('busca uma cidade e mostra o clima recebido pelo serviço', async () => {
    let resolveWeather: (value: WeatherData) => void = () => undefined;
    getWeather.mockImplementationOnce(() => new Promise<WeatherData>((resolve) => (resolveWeather = resolve)));
    render(<App />);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar cidade' }), {
      target: { value: 'Lisboa' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Buscando condições atuais');
    expect(searchCities).toHaveBeenCalledWith('Lisboa', expect.any(AbortSignal));
    expect(getWeather).toHaveBeenCalledWith(lisbon, expect.any(AbortSignal));

    await act(async () => resolveWeather(weather));
    expect(await screen.findByRole('heading', { name: 'Lisboa' })).toBeInTheDocument();
  });

  it('exige seleção quando o geocoding retorna cidades ambíguas', async () => {
    const brazilianLisbon = { ...lisbon, id: 2, country: 'Brasil', admin1: 'Minas Gerais' };
    searchCities.mockResolvedValue([lisbon, brazilianLisbon]);
    render(<App />);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar cidade' }), {
      target: { value: 'Lisboa' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(await screen.findByRole('heading', { name: 'Selecione uma cidade' })).toBeInTheDocument();
    const searchbox = screen.getByRole('searchbox', { name: 'Buscar cidade' });
    const resultsRegion = screen.getByRole('region', { name: 'Resultados da busca' });
    fireEvent.keyDown(searchbox, { key: 'Escape' });
    expect(screen.queryByRole('region', { name: 'Resultados da busca' })).not.toBeInTheDocument();
    expect(searchbox).toHaveFocus();
    fireEvent.change(searchbox, { target: { value: 'Lisboa, região' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(await screen.findByRole('region', { name: 'Resultados da busca' })).toBeInTheDocument();
    expect(resultsRegion).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Lisboa.*Minas Gerais, Brasil/ }));
    await waitFor(() => expect(getWeather).toHaveBeenCalledWith(brazilianLisbon, expect.any(AbortSignal)));
  });

  it('converte a temperatura atual e a previsão para Fahrenheit', async () => {
    render(<App />);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar cidade' }), {
      target: { value: 'Lisboa' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    await screen.findByRole('heading', { name: 'Lisboa' });
    fireEvent.click(screen.getByRole('button', { name: '°F' }));

    expect(screen.getByText('66', { exact: true })).toBeInTheDocument();
    expect(screen.getByRole('article', { name: /hoje, máxima 72°F, mínima 59°F/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '°F' })).toHaveAttribute('aria-pressed', 'true');
    expect(getWeather).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status')).toHaveTextContent('Previsão disponível para 1 de 5 dias.');
  });

  it('comunica ausência de cidades correspondentes', async () => {
    searchCities.mockResolvedValue([]);
    render(<App />);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar cidade' }), {
      target: { value: 'Reykjavik' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(await screen.findByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeInTheDocument();
  });

  it('oferece retry e carrega o clima após uma falha', async () => {
    getWeather.mockRejectedValueOnce(new Error('Falha de conexão'));
    render(<App />);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar cidade' }), {
      target: { value: 'Lisboa' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(await screen.findByText('Falha de conexão')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByRole('heading', { name: 'Lisboa' })).toBeInTheDocument();
    expect(getWeather).toHaveBeenCalledTimes(2);
  });

  it('representa campos meteorológicos ausentes sem exibir null', async () => {
    getWeather.mockResolvedValueOnce({
      ...weather,
      current: { ...weather.current, humidity: null, windSpeed: null },
      forecast: [{ ...weather.forecast[0], max: null, precipitationProbability: null }],
    });
    render(<App />);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar cidade' }), {
      target: { value: 'Lisboa' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    await screen.findByRole('heading', { name: 'Lisboa' });
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(3);
    expect(document.body.textContent).not.toContain('null');
  });
});