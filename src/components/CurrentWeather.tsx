import { formatTemperature } from '../lib/temperature';
import type { Unit, WeatherData } from '../types/weather';
import WeatherGlyph from './WeatherGlyph';

interface CurrentWeatherProps {
  data: WeatherData;
  unit: Unit;
}

export default function CurrentWeather({ data, unit }: CurrentWeatherProps) {
  const { city, current } = data;

  return (
    <section
      aria-labelledby="current-weather-title"
      className="relative isolate overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.055] p-5 shadow-glass backdrop-blur-xl sm:p-8 lg:p-10"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-2/3 bg-gradient-to-l from-cyan-300/[0.06] to-transparent" />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100/70">
            Condições atuais
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl" id="current-weather-title">
            {city.name}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {[city.admin1, city.country].filter(Boolean).join(', ')}
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
          {current.updatedAt}
        </span>
      </div>

      <div className="mt-8 grid items-center gap-6 sm:mt-10 sm:grid-cols-[1fr_auto]">
        <div>
          <div className="flex items-start gap-1 text-[5.5rem] font-light leading-[0.9] tracking-normal text-white sm:text-[7rem]">
            <span>{formatTemperature(current.temperature, unit).replace(/[°CF]/g, '')}</span>
            <span className="mt-2 text-3xl font-medium text-slate-300 sm:text-4xl">
              {unit === 'celsius' ? '°C' : '°F'}
            </span>
          </div>
          <p className="mt-4 text-base text-slate-300 sm:text-lg">{current.description}</p>
          <p className="mt-1 text-sm text-slate-400">
            Sensação de {formatTemperature(current.feelsLike, unit)}
          </p>
        </div>
        <WeatherGlyph
          className="justify-self-start text-7xl drop-shadow-[0_0_24px_rgba(251,191,36,0.2)] sm:justify-self-end sm:text-8xl"
          condition={current.condition}
        />
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-white/10 pt-5 sm:mt-10 sm:grid-cols-4 sm:pt-6">
        <div>
          <dt className="text-xs text-slate-400">Umidade</dt>
          <dd className="mt-1.5 text-sm font-semibold text-white">
            {current.humidity === null ? '—' : `${current.humidity}%`}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400">Vento</dt>
          <dd className="mt-1.5 text-sm font-semibold text-white">
            {current.windSpeed === null ? '—' : `${current.windSpeed} km/h`}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400">Pressão</dt>
          <dd className="mt-1.5 text-sm font-semibold text-white">
            {current.pressure === null ? '—' : `${current.pressure} hPa`}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400">Precipitação</dt>
          <dd className="mt-1.5 text-sm font-semibold text-white">
            {current.precipitation === null ? '—' : `${current.precipitation} mm`}
          </dd>
        </div>
      </dl>
    </section>
  );
}