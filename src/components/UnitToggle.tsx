import type { Unit } from '../types/weather';

interface UnitToggleProps {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

const options: { label: string; value: Unit }[] = [
  { label: '°C', value: 'celsius' },
  { label: '°F', value: 'fahrenheit' },
];

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  return (
    <div
      aria-label="Unidade de temperatura"
      className="inline-flex shrink-0 rounded-full border border-white/10 bg-slate-950/40 p-1"
      role="group"
    >
      {options.map((option) => (
        <button
          key={option.value}
          aria-pressed={unit === option.value}
          className={`min-w-11 rounded-full px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 ${
            unit === option.value
              ? 'bg-white/15 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
          onClick={() => onChange(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}