import type { DateTime } from 'luxon';
import type { Zmanim } from '../hooks/useZmanim';

interface ZmanDef {
  key: keyof Zmanim;
  english: string;
  hebrew: string;
}

const ZMANIM_DEFS: ZmanDef[] = [
  { key: 'alotHashachar', english: 'Alot HaShachar',      hebrew: 'עלות השחר'   },
  { key: 'sunrise',       english: 'Netz HaChamah',        hebrew: 'נץ החמה'     },
  { key: 'sofZmanShma',   english: 'Sof Zman Shema (GRA)', hebrew: 'סוף זמן שמע' },
  { key: 'chatzos',       english: 'Chatzot',              hebrew: 'חצות'        },
  { key: 'minchaGedola',  english: 'Mincha Gedola',        hebrew: 'מנחה גדולה'  },
  { key: 'sunset',        english: 'Shkiat HaChamah',      hebrew: 'שקיעת החמה'  },
  { key: 'tzais',         english: 'Tzeit HaKochavim',     hebrew: 'צאת הכוכבים' },
  { key: 'chatzotLayla',  english: 'Chatzot Layla',        hebrew: 'חצות לילה'   },
];

function fmt(dt: DateTime | null): string {
  if (!dt) return '—';
  return dt.toFormat('h:mm a');
}

interface ZmanimListProps {
  zmanim: Zmanim;
  now: DateTime;
}

export function ZmanimList({ zmanim, now }: ZmanimListProps) {
  const nextKey = ZMANIM_DEFS.reduce<keyof Zmanim | null>((found, def) => {
    if (found) return found;
    const t = zmanim[def.key] as DateTime | null;
    return t && t > now ? def.key : null;
  }, null);

  return (
    <div className="w-full max-w-2xl grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      {ZMANIM_DEFS.map(({ key, english, hebrew }) => {
        const time = zmanim[key] as DateTime | null;
        const isPast = time ? time <= now : false;
        const isNext = key === nextKey;

        return (
          <div
            key={key}
            style={isNext ? {
              borderColor: '#D4930F',
              backgroundColor: 'rgba(212, 147, 15, 0.06)',
              boxShadow: '0 0 0 1px rgba(212, 147, 15, 0.2), 0 4px 12px rgba(212, 147, 15, 0.08)',
            } : {
              borderColor: '#1e3048',
              backgroundColor: 'rgba(19, 31, 53, 0.7)',
            }}
            className={[
              'relative flex flex-col justify-between rounded-xl px-4 py-3 border transition-all duration-300',
              isPast && !isNext ? 'opacity-35' : '',
            ].join(' ')}
          >
            {isNext && (
              <span
                style={{ color: '#D4930F', borderColor: 'rgba(212,147,15,0.35)', backgroundColor: 'rgba(212,147,15,0.1)' }}
                className="absolute top-2 right-2 text-[9px] font-semibold tracking-[0.12em] uppercase px-1.5 py-0.5 rounded border"
              >
                NEXT
              </span>
            )}

            <div>
              <p
                style={{ color: isNext ? '#D4930F' : '#94a3b8' }}
                className="text-[11px] font-medium leading-snug tracking-wide"
              >
                {english}
              </p>
              <p
                dir="rtl"
                className="text-[12px] mt-0.5 text-right leading-snug"
                style={{ color: isNext ? 'rgba(212,147,15,0.65)' : '#475569' }}
              >
                {hebrew}
              </p>
            </div>

            <p
              style={{ color: isNext ? '#E8A820' : '#e8e0d0' }}
              className="mt-2.5 text-xl tabular-nums font-light tracking-tight"
            >
              {fmt(time)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
