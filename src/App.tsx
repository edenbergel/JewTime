import { useState, useEffect, useCallback } from 'react';
import { DateTime } from 'luxon';
import { useZmanim } from './hooks/useZmanim';
import { useGeolocation } from './hooks/useGeolocation';
import { ZmanimClock } from './components/ZmanimClock';
import { ZmanimList } from './components/ZmanimList';
import { CitySearch } from './components/CitySearch';
import { getTimezone } from './utils/getTimezone';
import type { CitySuggestion } from './hooks/useCitySearch';

const JERUSALEM = { lat: 31.7683, lng: 35.2137, timeZoneId: 'Asia/Jerusalem', label: 'Jerusalem' };

interface Location {
  lat: number;
  lng: number;
  timeZoneId: string;
  label: string;
}

type GpsStatus = 'idle' | 'pending' | 'denied';

function useNow() {
  const [now, setNow] = useState(() => DateTime.now());
  useEffect(() => {
    const id = setInterval(() => setNow(DateTime.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default function App() {
  const now = useNow();
  const [location, setLocation] = useState<Location>(JERUSALEM);
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('idle');

  const handleGpsLocation = useCallback(({ lat, lng, timeZoneId }: { lat: number; lng: number; timeZoneId: string }) => {
    setLocation({ lat, lng, timeZoneId, label: `${lat.toFixed(3)}°, ${lng.toFixed(3)}°` });
    setGpsStatus('idle');
  }, []);

  const handleGpsError = useCallback(() => {
    setGpsStatus('denied');
  }, []);

  const requestGps = useGeolocation(handleGpsLocation, handleGpsError);

  const triggerGps = useCallback(() => {
    setGpsStatus('pending');
    requestGps();
  }, [requestGps]);

  // Auto-request GPS on mount
  useEffect(() => {
    triggerGps();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCitySelect = useCallback(async (s: CitySuggestion) => {
    // Use first part of display_name as a readable label
    const label = s.displayName.split(',')[0].trim();
    // Optimistically update coords; fetch timezone in parallel
    setLocation((prev) => ({ ...prev, lat: s.lat, lng: s.lng, label }));
    const timeZoneId = await getTimezone(s.lat, s.lng);
    setLocation({ lat: s.lat, lng: s.lng, timeZoneId, label });
  }, []);

  const zmanim = useZmanim(location.lat, location.lng, location.timeZoneId);
  const hebrewDate = now.setLocale('he').toLocaleString(DateTime.DATE_FULL);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-4 py-10">
      <header className="text-center">
        <h1 className="text-4xl font-light tracking-widest text-amber-400" dir="rtl">
          זמנים
        </h1>
        <p className="text-slate-400 text-sm mt-1">{hebrewDate}</p>
        <p className="text-slate-500 text-xs mt-0.5">
          {now.toFormat('h:mm:ss a')} · {location.timeZoneId}
        </p>
      </header>

      <CitySearch
        currentLabel={location.label}
        gpsStatus={gpsStatus}
        onSelect={handleCitySelect}
        onGps={triggerGps}
      />

      <div className="flex flex-col items-center gap-10">
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

        <ZmanimList zmanim={zmanim} now={now} />
      </div>

      <footer className="text-slate-600 text-xs mt-8">
        GRA method · {location.label} · kosher-zmanim
      </footer>
    </div>
  );
}
