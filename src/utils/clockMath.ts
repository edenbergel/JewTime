import type { DateTime } from 'luxon';

// Returns angle in degrees (0° = top/midnight, clockwise) for a given time.
export function timeToAngle(dt: DateTime): number {
  const totalMinutes = dt.hour * 60 + dt.minute + dt.second / 60;
  return (totalMinutes / (24 * 60)) * 360;
}

// Returns [startAngle, endAngle] as SVG arc params (degrees, clockwise from top).
export function arcAngles(start: DateTime, end: DateTime): [number, number] {
  return [timeToAngle(start), timeToAngle(end)];
}

// Polar to Cartesian (cx, cy = center, r = radius, angleDeg clockwise from top)
export function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
): [number, number] {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

// SVG arc path between two angles
export function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const [sx, sy] = polarToCartesian(cx, cy, r, startAngle);
  const [ex, ey] = polarToCartesian(cx, cy, r, endAngle);
  const span = ((endAngle - startAngle) + 360) % 360;
  const largeArc = span > 180 ? 1 : 0;
  return `M ${sx} ${sy} A ${r} ${r} 0 ${largeArc} 1 ${ex} ${ey}`;
}
