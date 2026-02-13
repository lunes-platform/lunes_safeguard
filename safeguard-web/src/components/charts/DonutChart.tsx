import { useMemo } from 'react';

export type DonutDatum = {
  label: string;
  value: number;
  color?: string;
};

type Props = {
  data: DonutDatum[];
  size?: number; // px
  thickness?: number; // stroke width
  ariaLabel?: string;
  showLegend?: boolean;
};

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = (angle - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export function DonutChart({ data, size = 200, thickness = 24, ariaLabel = 'Donut chart', showLegend = true }: Props) {
  const total = Math.max(0, data.reduce((acc, d) => acc + Math.max(0, d.value), 0));
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - thickness) / 2;

  const segments = useMemo(() => {
    if (total === 0) return [] as Array<{ path: string; color: string; pct: number; label: string; start: number; end: number }>;
    let angle = 0;
    return data.map((d, i) => {
      const pct = d.value / total;
      const deg = pct * 360;
      const start = angle;
      const end = angle + deg;
      angle = end;
      const path = arcPath(cx, cy, r, start, end);
      const color = d.color ?? defaultColors[i % defaultColors.length];
      return { path, color, pct, label: d.label, start, end };
    });
  }, [data, total, cx, cy, r]);

  const percentText = useMemo(() => {
    const top = [...data].sort((a, b) => b.value - a.value)[0];
    if (!top || total === 0) return '0%';
    return `${Math.round((top.value / total) * 100)}%`;
  }, [data, total]);

  return (
    <div className="w-full">
      <div className="relative mx-auto" style={{ width: size, height: size }} role="img" aria-label={ariaLabel}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background ring */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth={thickness} />

          {/* Segments as strokes using paths */}
          {segments.map((s, idx) => (
            <g key={idx}>
              <path
                d={s.path}
                fill="none"
                stroke={s.color}
                strokeWidth={thickness}
                strokeLinecap="butt"
              >
                <title>{`${s.label}: ${Math.round(s.pct * 100)}%`}</title>
              </path>
            </g>
          ))}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-semibold text-white">{percentText}</div>
            <div className="text-xs text-neutral-400">maior fatia</div>
          </div>
        </div>
      </div>

      {showLegend && (
        <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
          {segments.map((s, idx) => (
            <li key={idx} className="flex items-center text-sm text-neutral-300">
              <span className="inline-block w-3 h-3 mr-2 rounded" style={{ backgroundColor: s.color }} />
              <span className="mr-1">{s.label}</span>
              <span className="text-neutral-400">{Math.round(s.pct * 100)}%</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const defaultColors = [
  'rgb(var(--primary-600))', // primary-600
  'rgb(var(--secondary-500))', // secondary-500
  'rgb(var(--success-500))', // success-500
  'rgb(var(--warning-500))', // warning-500
  'rgb(var(--critical-500))', // critical-500
  'rgb(var(--neutral-400))', // neutral-400
  'rgb(var(--primary-400))', // primary-400
  'rgb(var(--secondary-400))', // secondary-400
];

export default DonutChart;
