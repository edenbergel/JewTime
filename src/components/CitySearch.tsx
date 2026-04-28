import { useState, useRef, useEffect, useId } from 'react';
import { useCitySearch, type CitySuggestion } from '../hooks/useCitySearch';

interface CitySearchProps {
  currentLabel: string;
  gpsStatus: 'idle' | 'pending' | 'denied';
  onSelect: (suggestion: CitySuggestion) => void;
  onGps: () => void;
}

export function CitySearch({ currentLabel, gpsStatus, onSelect, onGps }: CitySearchProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { suggestions, loading } = useCitySearch(query);

  useEffect(() => {
    setOpen(suggestions.length > 0);
    setActiveIndex(-1);
  }, [suggestions]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      commit(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  function commit(s: CitySuggestion) {
    setQuery('');
    setOpen(false);
    onSelect(s);
    inputRef.current?.blur();
  }

  const gpsBtnLabel =
    gpsStatus === 'pending' ? 'Locating…' : gpsStatus === 'denied' ? 'GPS denied' : 'Use GPS';

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <div className="flex gap-2">
        {/* Search input */}
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#475569' }}>
            {loading ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            )}
          </span>
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-activedescendant={activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder={currentLabel}
            style={{
              backgroundColor: '#131f35',
              borderColor: '#1e3048',
              color: '#e8e0d0',
              outline: 'none',
            }}
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm placeholder:text-slate-600 transition-colors focus:border-gold focus:[box-shadow:0_0_0_1px_rgba(212,147,15,0.3)]"
          />
        </div>

        {/* GPS button */}
        <button
          type="button"
          onClick={onGps}
          disabled={gpsStatus === 'pending'}
          title={gpsBtnLabel}
          style={{ backgroundColor: '#131f35', borderColor: '#1e3048', color: '#94a3b8' }}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg border text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:border-gold hover:text-gold"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          </svg>
          <span className="hidden sm:inline">{gpsStatus === 'pending' ? 'Locating…' : 'GPS'}</span>
        </button>
      </div>

      {/* Dropdown */}
      {open && (
        <ul
          id={listboxId}
          role="listbox"
          style={{ backgroundColor: '#131f35', borderColor: '#1e3048' }}
          className="absolute z-10 mt-1 w-full rounded-xl border shadow-2xl overflow-hidden"
        >
          {suggestions.map((s, i) => (
            <li
              key={s.placeId}
              id={`${listboxId}-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              onMouseDown={(e) => { e.preventDefault(); commit(s); }}
              onMouseEnter={() => setActiveIndex(i)}
              style={i === activeIndex
                ? { backgroundColor: '#D4930F', color: '#0f172a' }
                : { color: '#94a3b8' }
              }
              className="px-4 py-2.5 text-sm cursor-pointer truncate transition-colors hover:bg-navy-border"
            >
              {s.displayName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
