import { useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import type { City } from '../types/weather';

interface SearchBarProps {
  matches: City[] | null;
  isLoading: boolean;
  onSearch: (query: string) => void;
  onSelect: (city: City) => void;
}

export default function SearchBar({ matches, isLoading, onSearch, onSelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [dismissedQuery, setDismissedQuery] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const showSuggestions = matches !== null && dismissedQuery !== query;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      setDismissedQuery(null);
      onSearch(trimmedQuery);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement | HTMLButtonElement>) {
    if (event.key === 'Escape' && showSuggestions) {
      event.preventDefault();
      setDismissedQuery(query);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="relative w-full sm:max-w-sm">
      <form aria-busy={isLoading} className="flex gap-2" onSubmit={handleSubmit} role="search">
        <label className="sr-only" htmlFor="city-search">
          Buscar cidade
        </label>
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-white/10 bg-slate-950/40 px-4 transition focus-within:border-cyan-200/50 focus-within:ring-2 focus-within:ring-cyan-200/15">
          <span aria-hidden="true" className="text-lg text-slate-400">
            ⌕
          </span>
          <input
            aria-controls={showSuggestions ? 'city-search-results' : undefined}
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-slate-500"
            id="city-search"
            disabled={isLoading}
            onChange={(event) => {
              setQuery(event.target.value);
              setDismissedQuery(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Buscar cidade"
            ref={inputRef}
            type="search"
            value={query}
          />
        </div>
        <button
          className="rounded-full bg-cyan-100 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isLoading || !query.trim()}
          type="submit"
        >
          Buscar
        </button>
      </form>

      {showSuggestions && matches !== null && (
        <div
          aria-live="polite"
          className="absolute left-0 right-0 top-[calc(100%+0.65rem)] z-20 max-h-80 overflow-y-auto rounded-2xl border border-white/10 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl"
          id="city-search-results"
          role="region"
          aria-label="Resultados da busca"
        >
          {matches.length > 0 ? (
            <ul aria-label="Cidades encontradas" className="space-y-1">
              {matches.map((city) => (
                <li key={city.id}>
                  <button
                    className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200"
                    onClick={() => onSelect(city)}
                    onKeyDown={handleKeyDown}
                    type="button"
                  >
                    <span>
                      <span className="block font-medium text-white">{city.name}</span>
                      <span className="mt-0.5 block text-xs text-slate-400">
                        {[city.admin1, city.country].filter(Boolean).join(', ')}
                      </span>
                    </span>
                    <span aria-hidden="true" className="text-slate-500">
                      ↗
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-4 text-sm text-slate-300">
              Nenhuma cidade encontrada. Tente São Paulo, Lisboa ou Tóquio.
            </p>
          )}
        </div>
      )}
    </div>
  );
}