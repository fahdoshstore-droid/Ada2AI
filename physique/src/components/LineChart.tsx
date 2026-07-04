import { useMemo } from "react";

interface Point {
  label: string;
  value: number | null;
}

/**
 * Lightweight dependency-free SVG line chart (no recharts) — brand-tuned.
 * Renders a smooth polyline over time with a gradient area fill, min/max
 * hints, and null-safe gaps. Responsive via viewBox.
 */
export function LineChart({
  data,
  height = 180,
  unit,
}: {
  data: Point[];
  height?: number;
  unit?: string;
}) {
  const W = 600;
  const H = height;
  const padX = 8;
  const padTop = 16;
  const padBottom = 26;

  const { points, areaPath, linePath, min, max } = useMemo(() => {
    const values = data.map((d) => d.value);
    const defined = values.filter((v): v is number => v != null);
    const min = defined.length ? Math.min(...defined) : 0;
    const max = defined.length ? Math.max(...defined) : 1;
    const span = max - min || 1;
    const innerW = W - padX * 2;
    const innerH = H - padTop - padBottom;

    const xFor = (i: number) => padX + (data.length <= 1 ? 0 : (i / (data.length - 1)) * innerW);
    const yFor = (v: number) => padTop + innerH - ((v - min) / span) * innerH;

    let linePath = "";
    let areaPath = "";
    const pts: { x: number; y: number; defined: boolean }[] = [];
    let started = false;

    data.forEach((d, i) => {
      const x = xFor(i);
      if (d.value == null) {
        pts.push({ x, y: 0, defined: false });
        started = false;
        return;
      }
      const y = yFor(d.value);
      pts.push({ x, y, defined: true });
      linePath += `${started ? " L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
      started = true;
    });

    if (pts.length) {
      const firstDefined = pts.find((p) => p.defined);
      const lastDefined = [...pts].reverse().find((p) => p.defined);
      if (firstDefined && lastDefined) {
        const baseY = padTop + (H - padTop - padBottom);
        areaPath =
          `M${firstDefined.x.toFixed(1)} ${baseY} ` +
          linePath.replace(/^M/, "L") +
          ` L${lastDefined.x.toFixed(1)} ${baseY} Z`;
      }
    }

    return { points: pts, areaPath, linePath, min, max };
  }, [data, H]);

  if (!data.length || data.every((d) => d.value == null)) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-white/5 bg-ada-surface text-sm text-ada-muted">
        No data yet
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/5 bg-ada-surface p-3">
      <div className="mb-2 flex items-center justify-between text-xs text-ada-muted">
        <span>
          {min.toFixed(1)}
          {unit}
        </span>
        <span>
          {max.toFixed(1)}
          {unit}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" role="img">
        <defs>
          <linearGradient id="ada-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00DCC8" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#00DCC8" stopOpacity="0" />
          </linearGradient>
        </defs>
        {areaPath ? <path d={areaPath} fill="url(#ada-area)" /> : null}
        {linePath ? (
          <path d={linePath} fill="none" stroke="#00DCC8" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        ) : null}
        {points.filter((p) => p.defined).map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#00DCC8" />
        ))}
        {data.map((d, i) => (
          <text
            key={i}
            x={padX + ((data.length <= 1 ? 0 : i / (data.length - 1)) * (W - padX * 2))}
            y={H - 8}
            textAnchor="middle"
            fontSize="9"
            fill="#6B8099"
          >
            {d.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
