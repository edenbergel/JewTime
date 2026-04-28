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

  useEffect(() => {
    triggerGps();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCitySelect = useCallback(async (s: CitySuggestion) => {
    const label = s.displayName.split(',')[0].trim();
    setLocation((prev) => ({ ...prev, lat: s.lat, lng: s.lng, label }));
    const timeZoneId = await getTimezone(s.lat, s.lng);
    setLocation({ lat: s.lat, lng: s.lng, timeZoneId, label });
  }, []);

  const zmanim = useZmanim(location.lat, location.lng, location.timeZoneId);
  const hebrewDate = now.setLocale('he').toLocaleString(DateTime.DATE_FULL);

  return (
    <div className="w-full flex flex-col items-center gap-10 px-4 py-12">

      {/* Header */}
      <header className="text-center space-y-1">
        <h1
          dir="rtl"
          className="text-5xl font-light tracking-widest"
          style={{ color: '#D4930F' }}
        >
          זמנים
        </h1>
        <p className="text-sm tracking-wide" style={{ color: '#475569' }}>
          {hebrewDate}
        </p>
        <p className="text-xs tabular-nums" style={{ color: '#334155' }}>
          {now.toFormat('h:mm:ss a')} · {location.timeZoneId}
        </p>
      </header>

      {/* City search */}
      <CitySearch
        currentLabel={location.label}
        gpsStatus={gpsStatus}
        onSelect={handleCitySelect}
        onGps={triggerGps}
      />

      {/* Clock */}
      <div className="w-full max-w-105 mx-auto">
        <ZmanimClock zmanim={zmanim} now={now} />
      </div>

      {/* Legend */}
      <div className="flex gap-5 text-xs" style={{ color: '#334155' }}>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-0.75 rounded-full" style={{ background: '#D4930F' }} />
          Day
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-0.75 rounded-full" style={{ background: '#3730a3' }} />
          Twilight
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-0.75 rounded-full" style={{ background: '#1a2d4a' }} />
          Night
        </span>
      </div>

      {/* Zmanim cards */}
      <ZmanimList zmanim={zmanim} now={now} />

      <footer className="text-xs pb-4" style={{ color: '#1e3048' }}>
        GRA method · {location.label} · kosher-zmanim
      </footer>
    </div>
  );
}
