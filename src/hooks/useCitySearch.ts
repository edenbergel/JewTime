import { useState, useEffect } from 'react';

export interface CitySuggestion {
  placeId: number;
  lat: number;
  lng: number;
  displayName: string;
}

export function useCitySearch(query: string) {
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();
    const controller = new AbortController();

    // Run inside setTimeout so setState is never called synchronously in the effect body
    const timer = setTimeout(async () => {
      if (q.length < 2) {
        setSuggestions([]);
        return;
      }
      setLoading(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&accept-language=en`;
        const res = await fetch(url, {
          signal: controller.signal,
          headers: { 'Accept-Language': 'en' },
        });
        const data: Array<{ place_id: number; lat: string; lon: string; display_name: string }> =
          await res.json();
        setSuggestions(
          data.map((item) => ({
            placeId: item.place_id,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            displayName: item.display_name,
          })),
        );
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setSuggestions([]);
        }
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return { suggestions, loading };
}
