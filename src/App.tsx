import { useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import UnitToggle from './components/UnitToggle';
import { useWeather } from './hooks/useWeather';
import type { Unit } from './types/weather';

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const { status, data, cities, query, error, search, selectCity, retry } = useWeather();
  const isLoading = status === 'searching' || status === 'loadingWeather';
  const isEmpty = status === 'empty';

  return (
    <div className="min-h-screen px-4 pb-10 text-white sm:px-6 lg:px-8">
      <header className="mx-auto flex max-w-6xl flex-col gap-4 py-5 sm:py-7 lg:flex-row lg:items-center lg:justify-between">
        <a aria-label="WeatherView, página inicial" className="flex w-fit items-center gap-3" href="/">
          <span className="grid size-10 place-items-center rounded-2xl border border-white/10 bg-white/5 text-xl text-sun">
            ☼
          </span>
          <span className="text-lg font-semibold tracking-normal text-white">WeatherView</span>
        </a>
        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto lg:items-center">
          <SearchBar
            isLoading={isLoading}
            matches={status === 'selecting' ? cities : null}
            onSearch={search}
            onSelect={selectCity}
          />
          <UnitToggle onChange={setUnit} unit={unit} />
        </div>
      </header>

      <main className="mx-auto max-w-6xl pt-4 sm:pt-7">
        {data && status === 'success' ? (
          <>
            <CurrentWeather data={data} unit={unit} />
            <ForecastList forecast={data.forecast} unit={unit} />
          </>
        ) : (
          <section
            aria-live={status === 'error' ? 'assertive' : 'polite'}
            aria-atomic="true"
            className="flex min-h-64 flex-col items-center justify-center rounded-[1.75rem] border border-white/10 bg-white/[0.055] px-6 py-12 text-center shadow-glass backdrop-blur-xl"
            role={isLoading ? 'status' : status === 'error' ? 'alert' : undefined}
          >
            <span aria-hidden="true" className="text-4xl text-cyan-100">
              {isLoading ? (
                <span className="inline-block animate-spin motion-reduce:animate-none">◌</span>
              ) : status === 'error' ? (
                '!'
              ) : (
                '⌕'
              )}
            </span>
            <h1 className="mt-4 text-xl font-semibold text-white">
              {isLoading
                ? 'Buscando condições atuais'
                : status === 'error'
                  ? 'Não foi possível carregar o clima'
                  : isEmpty
                    ? 'Nenhuma cidade encontrada'
                    : status === 'selecting'
                      ? 'Selecione uma cidade'
                      : 'Pesquise uma cidade'}
            </h1>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
              {status === 'error'
                ? error
                : isEmpty
                  ? `Não encontramos resultados para “${query}”. Confira a grafia e tente novamente.`
                  : status === 'selecting'
                    ? 'Há mais de uma cidade com esse nome. Escolha a localidade nos resultados da busca.'
                    : isLoading
                      ? 'Os dados são fornecidos pela Open-Meteo.'
                      : 'Busque pelo nome da cidade para consultar as condições atuais e a previsão de cinco dias.'}
            </p>
            {status === 'error' && (
              <button
                className="mt-5 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200"
                onClick={retry}
                type="button"
              >
                Tentar novamente
              </button>
            )}
          </section>
        )}
      </main>

      <footer className="mx-auto mt-10 max-w-6xl border-t border-white/[0.07] pt-5 text-xs text-slate-500">
        Dados meteorológicos por{' '}
        <a className="text-cyan-100 hover:underline" href="https://open-meteo.com/" rel="noreferrer" target="_blank">
          Open-Meteo
        </a>
      </footer>
    </div>
  );
}