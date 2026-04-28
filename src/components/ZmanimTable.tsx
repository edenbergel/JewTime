import type { DateTime } from 'luxon';
import type { Zmanim } from '../hooks/useZmanim';

interface Row {
  label: string;
  hebrew: string;
  time: DateTime | null;
  color: string;
}

function fmt(dt: DateTime | null): string {
  if (!dt) return '—';
  return dt.toFormat('h:mm a');
}

interface ZmanimTableProps {
  zmanim: Zmanim;
  now: DateTime;
}

export function ZmanimTable({ zmanim, now }: ZmanimTableProps) {
  const rows: Row[] = [
    { label: 'Alot HaShachar', hebrew: 'עלות השחר', time: zmanim.alotHashachar, color: '#94a3b8' },
    { label: 'Sunrise', hebrew: 'הנץ החמה', time: zmanim.sunrise, color: '#fcd34d' },
    { label: 'Sof Zman Shema', hebrew: 'סוף זמן שמע', time: zmanim.sofZmanShma, color: '#fbbf24' },
    { label: 'Chatzos', hebrew: 'חצות', time: zmanim.chatzos, color: '#f5f0e8' },
    { label: 'Mincha Gedola', hebrew: 'מנחה גדולה', time: zmanim.minchaGedola, color: '#fb923c' },
    { label: 'Sunset', hebrew: 'שקיעה', time: zmanim.sunset, color: '#f97316' },
    { label: "Tzeit HaKochavim", hebrew: 'צאת הכוכבים', time: zmanim.tzais, color: '#818cf8' },
  ];

  return (
    <div className="w-64">
      <table className="w-full text-sm">
        <tbody>
          {rows.map(({ label, hebrew, time, color }) => {
            const isPast = time ? now > time : false;
            return (
              <tr
                key={label}
                style={{ opacity: isPast ? 0.45 : 1 }}
                className="border-b border-slate-800"
              >
                <td className="py-2 pr-3">
                  <div style={{ color }} className="font-medium">{label}</div>
                  <div className="text-slate-500 text-xs text-right" dir="rtl">{hebrew}</div>
                </td>
                <td className="py-2 tabular-nums text-right" style={{ color }}>
                  {fmt(time)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
