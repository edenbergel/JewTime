import { useCallback, useRef } from 'react';
import { getTimezone } from '../utils/getTimezone';

export interface GPSLocation {
  lat: number;
  lng: number;
  timeZoneId: string;
}

type OnLocation = (loc: GPSLocation) => void;
type OnError = () => void;

export function useGeolocation(onLocation: OnLocation, onError?: OnError) {
  const onLocationRef = useRef(onLocation);
  onLocationRef.current = onLocation;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      onErrorRef.current?.();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const timeZoneId = await getTimezone(lat, lng);
        onLocationRef.current({ lat, lng, timeZoneId });
      },
      () => {
        onErrorRef.current?.();
      },
      { timeout: 10_000 },
    );
  }, []);

  return request;
}
