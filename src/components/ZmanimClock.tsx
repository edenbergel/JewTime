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
const R_HAND = 132;
const R_HAND_NUB = 14;

const GOLD = '#D4930F';
const GOLD_DIM = '#8B5E0A';
const NIGHT = '#1a2d4a';
const TWILIGHT = '#3730a3';
const FACE = '#0c1629';

interface TickMark {
  time: DateTime;
  label: string;
  color: string;
}

function ClockHand({ angle }: { angle: number }) {
  const [hx, hy] = polarToCartesian(CX, CY, R_HAND, angle);
  const [nx, ny] = polarToCartesian(CX, CY, -R_HAND_NUB, angle);
  return (
    <g>
      <line x1={nx} y1={ny} x2={hx} y2={hy} stroke={GOLD_DIM} strokeWidth={4} strokeLinecap="round" />
      <line x1={nx} y1={ny} x2={hx} y2={hy} stroke={GOLD} strokeWidth={2.5} strokeLinecap="round" />
    </g>
  );
}

function TickLabel({ time, label, color }: TickMark) {
  const angle = timeToAngle(time);
  const [ox, oy] = polarToCartesian(CX, CY, R_TICK_OUTER, angle);
  const [ix, iy] = polarToCartesian(CX, CY, R_TICK_INNER, angle);
  const [lx, ly] = polarToCartesian(CX, CY, R_LABEL, angle);
  const textRotation = angle > 180 ? angle - 90 : angle + 90;

  return (
    <g>
      <line x1={ox} y1={oy} x2={ix} y2={iy} stroke={color} strokeWidth={1.5} />
      <text
        x={lx}
        y={ly}
        fill={color}
        fontSize={7.5}
        textAnchor="middle"
        dominantBaseline="middle"
        transform={`rotate(${textRotation}, ${lx}, ${ly})`}
        fontFamily="'Frank Ruhl Libre', serif"
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

  const daytimeArc = useMemo(() => {
    if (!sunrise || !sunset) return null;
    return describeArc(CX, CY, R_ARC, timeToAngle(sunrise), timeToAngle(sunset));
  }, [sunrise, sunset]);

  const nightArc1 = useMemo(() => {
    if (!tzais) return null;
    return describeArc(CX, CY, R_ARC, timeToAngle(tzais), 360);
  }, [tzais]);

  const nightArc2 = useMemo(() => {
    if (!alotHashachar) return null;
    return describeArc(CX, CY, R_ARC, 0, timeToAngle(alotHashachar));
  }, [alotHashachar]);

  const dawnArc = useMemo(() => {
    if (!alotHashachar || !sunrise) return null;
    return describeArc(CX, CY, R_ARC, timeToAngle(alotHashachar), timeToAngle(sunrise));
  }, [alotHashachar, sunrise]);

  const duskArc = useMemo(() => {
    if (!sunset || !tzais) return null;
    return describeArc(CX, CY, R_ARC, timeToAngle(sunset), timeToAngle(tzais));
  }, [sunset, tzais]);

  const hourTicks = useMemo(() =>
    Array.from({ length: 24 }, (_, i) => {
      const angle = (i / 24) * 360;
      const [ox, oy] = polarToCartesian(CX, CY, R_OUTER, angle);
      const [ix, iy] = polarToCartesian(CX, CY, R_OUTER - (i % 6 === 0 ? 12 : 7), angle);
      return (
        <line
          key={i}
          x1={ox} y1={oy} x2={ix} y2={iy}
          stroke={i % 6 === 0 ? '#2d4060' : '#1e2f45'}
          strokeWidth={i % 6 === 0 ? 1.5 : 1}
        />
      );
    }),
  []);

  const ticks: TickMark[] = useMemo(() => {
    const marks: TickMark[] = [];
    if (alotHashachar) marks.push({ time: alotHashachar, label: 'עלות', color: '#64748b' });
    if (sofZmanShma)   marks.push({ time: sofZmanShma,   label: 'שמע',  color: GOLD });
    if (chatzos)       marks.push({ time: chatzos,       label: 'חצות', color: '#cbd5e1' });
    if (minchaGedola)  marks.push({ time: minchaGedola,  label: 'מנחה', color: '#c2813a' });
    if (tzais)         marks.push({ time: tzais,          label: 'צאת',  color: '#6366f1' });
    return marks;
  }, [alotHashachar, sofZmanShma, chatzos, minchaGedola, tzais]);

  return (
    <svg
      viewBox="0 0 400 400"
      className="w-full"
      aria-label="Halachic clock"
    >
      {/* Outer rim */}
      <circle cx={CX} cy={CY} r={R_OUTER + 3} fill="none" stroke="#1a2d4a" strokeWidth={1} />

      {/* Background */}
      <circle cx={CX} cy={CY} r={R_OUTER} fill={FACE} />

      {/* Night arcs */}
      {nightArc1 && <path d={nightArc1} fill="none" stroke={NIGHT}   strokeWidth={22} strokeLinecap="butt" />}
      {nightArc2 && <path d={nightArc2} fill="none" stroke={NIGHT}   strokeWidth={22} strokeLinecap="butt" />}

      {/* Twilight arcs */}
      {dawnArc && <path d={dawnArc} fill="none" stroke={TWILIGHT} strokeWidth={22} strokeLinecap="butt" />}
      {duskArc && <path d={duskArc} fill="none" stroke={TWILIGHT} strokeWidth={22} strokeLinecap="butt" />}

      {/* Daytime arc */}
      {daytimeArc && <path d={daytimeArc} fill="none" stroke={GOLD} strokeWidth={22} strokeLinecap="butt" />}

      {/* Hour ticks */}
      {hourTicks}

      {/* Inner face */}
      <circle cx={CX} cy={CY} r={R_TICK_INNER - 4} fill={FACE} />

      {/* Subtle inner ring */}
      <circle cx={CX} cy={CY} r={R_TICK_INNER - 4} fill="none" stroke="#1e3048" strokeWidth={1} />

      {/* Zmanim tick labels */}
      {ticks.map((t) => <TickLabel key={t.label} {...t} />)}

      {/* 12 o'clock marker */}
      <line
        x1={CX} y1={CY - R_OUTER + 2}
        x2={CX} y2={CY - R_OUTER + 16}
        stroke="#e8e0d0"
        strokeWidth={2}
        strokeLinecap="round"
      />

      {/* Clock hand */}
      <ClockHand angle={nowAngle} />

      {/* Center jewel */}
      <circle cx={CX} cy={CY} r={6}   fill={FACE} />
      <circle cx={CX} cy={CY} r={4}   fill={GOLD} />
      <circle cx={CX} cy={CY} r={1.5} fill="#fde68a" />
    </svg>
  );
}
