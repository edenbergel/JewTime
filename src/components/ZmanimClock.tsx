import { useMemo } from 'react';
import type { DateTime } from 'luxon';
import type { Zmanim } from '../hooks/useZmanim';
import { timeToAngle, polarToCartesian, describeArc } from '../utils/clockMath';

const CX = 200;
const CY = 200;
const R_OUTER = 170;
const R_ARC = 148;
const R_TICK_OUTER = 162;
const R_TICK_INNER = 140;
const R_LABEL = 122;
const R_HAND = 130;
const R_HAND_NUB = 12;

interface TickMark {
  time: DateTime;
  label: string;
  color: string;
}

function ClockHand({ angle }: { angle: number }) {
  const [hx, hy] = polarToCartesian(CX, CY, R_HAND, angle);
  const [nx, ny] = polarToCartesian(CX, CY, -R_HAND_NUB, angle);
  return (
    <line
      x1={nx}
      y1={ny}
      x2={hx}
      y2={hy}
      stroke="#f5f0e8"
      strokeWidth={2.5}
      strokeLinecap="round"
    />
  );
}

function TickMark({ time, label, color }: TickMark) {
  const angle = timeToAngle(time);
  const [ox, oy] = polarToCartesian(CX, CY, R_TICK_OUTER, angle);
  const [ix, iy] = polarToCartesian(CX, CY, R_TICK_INNER, angle);
  const [lx, ly] = polarToCartesian(CX, CY, R_LABEL, angle);

  // Rotate label to be readable (tangential)
  const textRotation = angle > 180 ? angle - 90 : angle + 90;

  return (
    <g>
      <line x1={ox} y1={oy} x2={ix} y2={iy} stroke={color} strokeWidth={2} />
      <text
        x={lx}
        y={ly}
        fill={color}
        fontSize={8}
        textAnchor="middle"
        dominantBaseline="middle"
        transform={`rotate(${textRotation}, ${lx}, ${ly})`}
        fontFamily="system-ui, sans-serif"
      >
        {label}
      </text>
    </g>
  );
}

interface ZmanimClockProps {
  zmanim: Zmanim;
  now: DateTime;
}

export function ZmanimClock({ zmanim, now }: ZmanimClockProps) {
  const { alotHashachar, sunrise, sofZmanShma, chatzos, minchaGedola, sunset, tzais } = zmanim;

  const nowAngle = timeToAngle(now);

  // Daytime arc: sunrise → sunset (gold)
  const daytimeArc = useMemo(() => {
    if (!sunrise || !sunset) return null;
    return describeArc(CX, CY, R_ARC, timeToAngle(sunrise), timeToAngle(sunset));
  }, [sunrise, sunset]);

  // Nighttime arcs: tzais → alot (next day, navy) — two segments: tzais→midnight, midnight→alot
  const nightArc1 = useMemo(() => {
    if (!tzais) return null;
    return describeArc(CX, CY, R_ARC, timeToAngle(tzais), 360);
  }, [tzais]);

  const nightArc2 = useMemo(() => {
    if (!alotHashachar) return null;
    return describeArc(CX, CY, R_ARC, 0, timeToAngle(alotHashachar));
  }, [alotHashachar]);

  // Twilight arcs: alot→sunrise and sunset→tzais (dusk/dawn)
  const dawnArc = useMemo(() => {
    if (!alotHashachar || !sunrise) return null;
    return describeArc(CX, CY, R_ARC, timeToAngle(alotHashachar), timeToAngle(sunrise));
  }, [alotHashachar, sunrise]);

  const duskArc = useMemo(() => {
    if (!sunset || !tzais) return null;
    return describeArc(CX, CY, R_ARC, timeToAngle(sunset), timeToAngle(tzais));
  }, [sunset, tzais]);

  // 24 hour tick marks (thin, dim)
  const hourTicks = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const angle = (i / 24) * 360;
      const [ox, oy] = polarToCartesian(CX, CY, R_OUTER, angle);
      const [ix, iy] = polarToCartesian(CX, CY, R_OUTER - 8, angle);
      return <line key={i} x1={ox} y1={oy} x2={ix} y2={iy} stroke="#334155" strokeWidth={1} />;
    });
  }, []);

  const ticks: TickMark[] = useMemo(() => {
    const marks: TickMark[] = [];
    if (alotHashachar) marks.push({ time: alotHashachar, label: 'עלות', color: '#94a3b8' });
    if (sofZmanShma) marks.push({ time: sofZmanShma, label: 'שמע', color: '#fbbf24' });
    if (chatzos) marks.push({ time: chatzos, label: 'חצות', color: '#f5f0e8' });
    if (minchaGedola) marks.push({ time: minchaGedola, label: 'מנחה', color: '#fb923c' });
    if (tzais) marks.push({ time: tzais, label: 'צאת', color: '#818cf8' });
    return marks;
  }, [alotHashachar, sofZmanShma, chatzos, minchaGedola, tzais]);

  return (
    <svg
      viewBox="0 0 400 400"
      width={400}
      height={400}
      aria-label="Halachic clock"
    >
      {/* Background circle */}
      <circle cx={CX} cy={CY} r={R_OUTER} fill="#0f172a" stroke="#1e293b" strokeWidth={2} />

      {/* Night arcs (deep navy) */}
      {nightArc1 && (
        <path d={nightArc1} fill="none" stroke="#1e3a5f" strokeWidth={20} strokeLinecap="butt" />
      )}
      {nightArc2 && (
        <path d={nightArc2} fill="none" stroke="#1e3a5f" strokeWidth={20} strokeLinecap="butt" />
      )}

      {/* Dawn / dusk twilight (indigo) */}
      {dawnArc && (
        <path d={dawnArc} fill="none" stroke="#4338ca" strokeWidth={20} strokeLinecap="butt" />
      )}
      {duskArc && (
        <path d={duskArc} fill="none" stroke="#4338ca" strokeWidth={20} strokeLinecap="butt" />
      )}

      {/* Daytime arc (gold) */}
      {daytimeArc && (
        <path d={daytimeArc} fill="none" stroke="#d97706" strokeWidth={20} strokeLinecap="butt" />
      )}

      {/* Hour tick marks */}
      {hourTicks}

      {/* Zmanim tick marks */}
      {ticks.map((t) => (
        <TickMark key={t.label} {...t} />
      ))}

      {/* Inner face */}
      <circle cx={CX} cy={CY} r={R_TICK_INNER - 6} fill="#0f172a" />

      {/* Clock hand */}
      <ClockHand angle={nowAngle} />

      {/* Center dot */}
      <circle cx={CX} cy={CY} r={4} fill="#f5f0e8" />

      {/* 12 o'clock marker (midnight) */}
      <line
        x1={CX}
        y1={CY - R_OUTER + 2}
        x2={CX}
        y2={CY - R_OUTER + 14}
        stroke="#f5f0e8"
        strokeWidth={2}
      />
    </svg>
  );
}
