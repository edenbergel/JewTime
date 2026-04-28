import type { DateTime } from 'luxon';
import type { Zmanim } from '../hooks/useZmanim';

interface ZmanDef {
  key: keyof Zmanim;
  english: string;
  hebrew: string;
}

const ZMANIM_DEFS: ZmanDef[] = [
  { key: 'alotHashachar', english: 'Alot HaShachar',      hebrew: 'עלות השחר'    },
  { key: 'sunrise',       english: 'Netz HaChamah',        hebrew: 'נץ החמה'      },
  { key: 'sofZmanShma',   english: 'Sof Zman Shema (GRA)', hebrew: 'סוף זמן שמע'  },
  { key: 'chatzos',       english: 'Chatzot',              hebrew: 'חצות'         },
  { key: 'minchaGedola',  english: 'Mincha Gedola',        hebrew: 'מנחה גדולה'   },
  { key: 'sunset',        english: 'Shkiat HaChamah',      hebrew: 'שקיעת החמה'   },
  { key: 'tzais',         english: 'Tzeit HaKochavim',     hebrew: 'צאת הכוכבים'  },
  { key: 'chatzotLayla',  english: 'Chatzot Layla',        hebrew: 'חצות לילה'    },
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
  // Find the key of the next upcoming zman
  const nextKey = ZMANIM_DEFS.reduce<keyof Zmanim | null>((found, def) => {
    if (found) return found;
    const t = zmanim[def.key] as DateTime | null;
    return t && t > now ? def.key : null;
  }, null);

  return (
    <div className="w-full max-w-2xl grid grid-cols-2 sm:grid-cols-4 gap-3">
      {ZMANIM_DEFS.map(({ key, english, hebrew }) => {
        const time = zmanim[key] as DateTime | null;
        const isPast = time ? time <= now : false;
        const isNext = key === nextKey;

        return (
          <div
            key={key}
            className={[
              'relative flex flex-col justify-between rounded-xl px-4 py-3 border transition-colors',
              isNext
                ? 'border-amber-400 bg-amber-400/5'
                : 'border-slate-700 bg-slate-800/50',
              isPast && !isNext ? 'opacity-40' : '',
            ].join(' ')}
          >
            {isNext && (
              <span className="absolute top-2 right-2 text-[10px] font-semibold tracking-widest text-amber-400 uppercase">
                Next
              </span>
            )}

            <div>
              <p className={`text-xs font-medium leading-tight ${isNext ? 'text-amber-300' : 'text-slate-300'}`}>
                {english}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 text-right" dir="rtl">
                {hebrew}
              </p>
            </div>

            <p className={`mt-2 text-lg tabular-nums font-light ${isNext ? 'text-amber-400' : 'text-slate-200'}`}>
              {fmt(time)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
