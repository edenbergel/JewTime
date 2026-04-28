import { useState, useEffect } from 'react';
import { DateTime } from 'luxon';
import { useZmanim } from './hooks/useZmanim';
import { useGeolocation } from './hooks/useGeolocation';
import { ZmanimClock } from './components/ZmanimClock';
import { ZmanimTable } from './components/ZmanimTable';

function useNow() {
  const [now, setNow] = useState(() => DateTime.now());
  useEffect(() => {
    const id = setInterval(() => setNow(DateTime.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Locating…',
  granted: '',
  denied: 'Using Jerusalem (location denied)',
  unavailable: 'Using Jerusalem (geolocation unavailable)',
};

export default function App() {
  const now = useNow();
  const geo = useGeolocation();
  const zmanim = useZmanim(geo.lat, geo.lng, geo.timeZoneId);

  const hebrewDate = now.setLocale('he').toLocaleString(DateTime.DATE_FULL);
  const locationLabel =
    geo.status === 'granted'
      ? `${geo.lat.toFixed(3)}°, ${geo.lng.toFixed(3)}°`
      : 'Jerusalem';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-4 py-10">
      <header className="text-center">
        <h1 className="text-4xl font-light tracking-widest text-amber-400" dir="rtl">
          זמנים
        </h1>
        <p className="text-slate-400 text-sm mt-1">{hebrewDate}</p>
        <p className="text-slate-500 text-xs mt-0.5">
          {now.toFormat('h:mm:ss a')} · {geo.timeZoneId}
        </p>
        {STATUS_LABEL[geo.status] && (
          <p className="text-slate-600 text-xs mt-1 italic">{STATUS_LABEL[geo.status]}</p>
        )}
      </header>

      <div className="flex flex-col md:flex-row items-center gap-10">
        <div className="relative">
          <ZmanimClock zmanim={zmanim} now={now} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-8 flex gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-1 rounded" style={{ background: '#d97706' }} />
              Day
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-1 rounded" style={{ background: '#4338ca' }} />
              Twilight
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-1 rounded" style={{ background: '#1e3a5f' }} />
              Night
            </span>
          </div>
        </div>

        <ZmanimTable zmanim={zmanim} now={now} />
      </div>

      <footer className="text-slate-600 text-xs mt-8">
        GRA method · {locationLabel} · kosher-zmanim
      </footer>
    </div>
  );
}
