import type { WeatherCondition } from '../types/weather';

interface WeatherGlyphProps {
  condition: WeatherCondition;
  className?: string;
}

const glyphs: Record<Exclude<WeatherCondition, 'partly-cloudy'>, string> = {
  sunny: '☀',
  cloudy: '☁',
  rainy: '☂',
  storm: 'ϟ',
};

export default function WeatherGlyph({ condition, className = '' }: WeatherGlyphProps) {
  if (condition === 'partly-cloudy') {
    return (
      <span aria-hidden="true" className={`relative inline-block ${className}`}>
        <span className="text-sun">☀</span>
        <span className="absolute -bottom-1 -right-3 text-[0.58em] text-slate-300">☁</span>
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`${condition === 'sunny' ? 'text-sun' : 'text-cyan-100'} ${className}`}
    >
      {glyphs[condition]}
    </span>
  );
}