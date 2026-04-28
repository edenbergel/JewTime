import { useMemo } from 'react';
import { GeoLocation, ZmanimCalendar } from 'kosher-zmanim';
import type { DateTime } from 'luxon';

export interface Zmanim {
  alotHashachar: DateTime | null;
  sunrise: DateTime | null;
  sofZmanShma: DateTime | null;
  chatzos: DateTime | null;
  minchaGedola: DateTime | null;
  sunset: DateTime | null;
  tzais: DateTime | null;
}

export function useZmanim(lat: number, lng: number, timeZoneId: string): Zmanim {
  return useMemo(() => {
    const geoLocation = new GeoLocation(null, lat, lng, 0, timeZoneId);
    const cal = new ZmanimCalendar(geoLocation);

    return {
      alotHashachar: cal.getAlosHashachar(),
      sunrise: cal.getSunrise(),
      sofZmanShma: cal.getSofZmanShmaGRA(),
      chatzos: cal.getChatzos(),
      minchaGedola: cal.getMinchaGedola(),
      sunset: cal.getSunset(),
      tzais: cal.getTzais(),
    };
  }, [lat, lng, timeZoneId]);
}
