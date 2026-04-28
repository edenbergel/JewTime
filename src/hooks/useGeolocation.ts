import { useState, useEffect } from 'react';

const JERUSALEM = { lat: 31.7683, lng: 35.2137 };

type Status = 'pending' | 'granted' | 'denied' | 'unavailable';

export interface GeolocationState {
  lat: number;
  lng: number;
  timeZoneId: string;
  status: Status;
}

export function useGeolocation(): GeolocationState {
  const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [state, setState] = useState<GeolocationState>({
    lat: JERUSALEM.lat,
    lng: JERUSALEM.lng,
    timeZoneId: browserTz,
    status: 'pending',
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, status: 'unavailable' }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          timeZoneId: browserTz,
          status: 'granted',
        });
      },
      () => {
        setState((s) => ({ ...s, status: 'denied' }));
      },
      { timeout: 10_000 },
    );
  // browserTz is stable — derived once from Intl, never changes during a session
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}
