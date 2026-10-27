import type { ForecastDay, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  forecast: ForecastDay[];
  unit: Unit;
}

export default function ForecastList({ forecast, unit }: ForecastListProps) {
  const visibleForecast = forecast.slice(0, 5);

  return (
    <section aria-labelledby="forecast-title" className="mt-8 sm:mt-10">
      <div className="mb-4 flex items-end justify-between gap-4 sm:mb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Próximos dias
          </p>
          <h2 className="mt-1.5 text-xl font-semibold text-white sm:text-2xl" id="forecast-title">
            Previsão de 5 dias
          </h2>
        </div>
        <span aria-hidden="true" className="pb-1 text-sm text-slate-500">°</span>
      </div>
      {visibleForecast.length < 5 && (
        <p className="mb-4 text-sm text-slate-400" role="status">
          Previsão disponível para {visibleForecast.length} de 5 dias.
        </p>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {visibleForecast.map((day, index) => (
          <ForecastCard day={day} isToday={index === 0} key={day.id} unit={unit} />
        ))}
      </div>
    </section>
  );
}