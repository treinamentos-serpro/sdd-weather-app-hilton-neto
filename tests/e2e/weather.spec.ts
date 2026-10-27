import { expect, test, type Page } from '@playwright/test';

const lisbon = {
  id: 1,
  name: 'Lisboa',
  country: 'Portugal',
  admin1: 'Lisboa',
  latitude: 38.7,
  longitude: -9.1,
};

const forecast = {
  current: {
    time: '2026-10-27T12:30',
    temperature_2m: 18,
    apparent_temperature: 17,
    relative_humidity_2m: 60,
    wind_speed_10m: 11,
    surface_pressure: 1018,
    precipitation: 0,
    weather_code: 2,
  },
  daily: {
    time: ['2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31'],
    weather_code: [2, 0, 61, 3, 95],
    temperature_2m_max: [22, 23, 20, 19, 18],
    temperature_2m_min: [15, 16, 14, 13, 12],
    precipitation_probability_max: [10, 0, 80, 20, 65],
  },
};

async function routeSuccessfulWeather(page: Page) {
  await page.route('**/v1/search?**', (route) => route.fulfill({ json: { results: [lisbon] } }));
  await page.route('**/v1/forecast?**', (route) => route.fulfill({ json: forecast }));
}

async function searchForLisbon(page: Page) {
  await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('Lisboa');
  await page.getByRole('button', { name: 'Buscar' }).click();
}

test('fluxo principal: busca, clima atual, cinco dias e alternância de unidade', async ({ page }) => {
  await routeSuccessfulWeather(page);
  await page.goto('/');
  await searchForLisbon(page);

  await expect(page.getByRole('heading', { name: 'Lisboa' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Previsão de 5 dias' })).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(5);
  await expect(page.getByText('18', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: '°F' }).click();
  await expect(page.getByText('64', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '°F' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('heading', { name: 'Lisboa' })).toBeVisible();
});

test('busca vazia não inicia consulta', async ({ page }) => {
  let geocodingRequests = 0;
  await page.route('**/v1/search?**', (route) => {
    geocodingRequests += 1;
    return route.fulfill({ json: { results: [lisbon] } });
  });
  await page.goto('/');

  await expect(page.getByRole('button', { name: 'Buscar' })).toBeDisabled();
  expect(geocodingRequests).toBe(0);
  await expect(page.getByRole('heading', { name: 'Pesquise uma cidade' })).toBeVisible();
});

test('cidade sem correspondência exibe estado vazio', async ({ page }) => {
  await page.route('**/v1/search?**', (route) => route.fulfill({ json: {} }));
  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('Cidade inexistente');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Lisboa' })).toHaveCount(0);
});

test('cidade ambígua exige seleção antes de carregar a previsão', async ({ page }) => {
  let forecastRequests = 0;
  await page.route('**/v1/search?**', (route) =>
    route.fulfill({
      json: {
        results: [
          lisbon,
          { ...lisbon, id: 2, name: 'Lisboa', country: 'Brasil', admin1: 'Minas Gerais', latitude: -19.9 },
        ],
      },
    }),
  );
  await page.route('**/v1/forecast?**', (route) => {
    forecastRequests += 1;
    return route.fulfill({ json: forecast });
  });
  await page.goto('/');
  await searchForLisbon(page);

  await expect(page.getByRole('heading', { name: 'Selecione uma cidade' })).toBeVisible();
  expect(forecastRequests).toBe(0);
  await page.getByRole('button', { name: /Lisboa.*Minas Gerais, Brasil/ }).click();
  await expect(page.getByRole('heading', { name: 'Lisboa' })).toBeVisible();
  expect(forecastRequests).toBe(1);
});

test('resultados de cidade podem ser fechados com Escape e o foco volta à busca', async ({ page }) => {
  await page.route('**/v1/search?**', (route) =>
    route.fulfill({ json: { results: [lisbon, { ...lisbon, id: 2, country: 'Brasil' }] } }),
  );
  await page.goto('/');
  await searchForLisbon(page);

  const searchbox = page.getByRole('searchbox', { name: 'Buscar cidade' });
  const results = page.getByRole('region', { name: 'Resultados da busca' });
  await expect(results).toBeVisible();
  await searchbox.press('Escape');
  await expect(results).toHaveCount(0);
  await expect(searchbox).toBeFocused();
});

test('falha de forecast mostra erro e permite tentar novamente', async ({ page }) => {
  let forecastRequests = 0;
  await page.route('**/v1/search?**', (route) => route.fulfill({ json: { results: [lisbon] } }));
  await page.route('**/v1/forecast?**', (route) => {
    forecastRequests += 1;
    return forecastRequests === 1
      ? route.fulfill({ status: 503, body: 'Indisponível' })
      : route.fulfill({ json: forecast });
  });
  await page.goto('/');
  await searchForLisbon(page);

  await expect(page.getByText(/serviço de clima está indisponível/i)).toBeVisible();
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByRole('heading', { name: 'Lisboa' })).toBeVisible();
  expect(forecastRequests).toBe(2);
});

test('fluxo principal permanece utilizável em viewport móvel', async ({ page }) => {
  await routeSuccessfulWeather(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await searchForLisbon(page);

  await expect(page.getByRole('heading', { name: 'Lisboa' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Previsão de 5 dias' })).toBeVisible();
  await page.getByRole('button', { name: '°F' }).click();
  await expect(page.getByRole('button', { name: '°F' })).toHaveAttribute('aria-pressed', 'true');
});