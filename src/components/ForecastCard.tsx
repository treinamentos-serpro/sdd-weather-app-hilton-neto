import { formatTemperature } from '../lib/temperature';
import type { ForecastDay, Unit } from '../types/weather';
import WeatherGlyph from './WeatherGlyph';

interface ForecastCardProps {
  day: ForecastDay;
  unit: Unit;
  isToday: boolean;
}

export default function ForecastCard({ day, unit, isToday }: ForecastCardProps) {
  return (
    <article
      aria-label={`${day.label}, máxima ${formatTemperature(day.max, unit)}, mínima ${formatTemperature(day.min, unit)}`}
      className={`rounded-2xl border p-4 transition-colors sm:p-5 ${
        isToday
          ? 'border-cyan-100/25 bg-cyan-100/[0.08]'
          : 'border-white/[0.08] bg-white/[0.035] hover:bg-white/[0.07]'
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-white">{day.label}</h3>
        <span className="text-[0.7rem] text-slate-500">{day.date}</span>
      </div>
      <WeatherGlyph
        className="mt-5 block text-4xl sm:mt-6 sm:text-5xl"
        condition={day.condition}
      />
      <div className="mt-5 flex items-baseline gap-2 sm:mt-6">
        <span className="text-lg font-semibold text-white">{formatTemperature(day.max, unit)}</span>
        <span className="text-sm text-slate-400">{formatTemperature(day.min, unit)}</span>
      </div>
      <p className="mt-3 text-xs text-slate-400">
        <span aria-hidden="true" className="mr-1 text-cyan-200">◌</span>
        {day.precipitationProbability === null ? '—' : `${day.precipitationProbability}%`} de chuva
      </p>
    </article>
  );
}