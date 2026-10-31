import { useEffect, useId, useMemo, useRef, useState } from "react";

interface Point {
  label: string;
  value: number | null;
}

/** Catmull-Rom → cubic bezier: smooth but honest through every point. */
function smooth(pts: { x: number; y: number }[]) {
  if (!pts.length) return "";
  let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const t = 0.18;
    d += ` C${(p1.x + (p2.x - p0.x) * t).toFixed(1)} ${(p1.y + (p2.y - p0.y) * t).toFixed(1)} ${(p2.x - (p3.x - p1.x) * t).toFixed(1)} ${(p2.y - (p3.y - p1.y) * t).toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

/**
 * Dependency-free SVG trend chart — brand-tuned.
 * Smooth line + gradient area, draw-in animation, hover crosshair & tooltip,
 * null-safe gaps (each defined run is drawn as its own segment).
 * Public props unchanged: { data, height?, unit? }.
 */
export function LineChart({
  data,
  height = 180,
  unit,
  color = "#00DCC8",
}: {
  data: Point[];
  height?: number;
  unit?: string;
  color?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const wrap = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const W = 600;
  const H = height;
  const padX = 12;
  const padTop = 18;
  const padBottom = 26;

  useEffect(() => {
    const el = wrap.current;
    if (!el || !("IntersectionObserver" in window)) {
      setDrawn(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setDrawn(true);
        io.disconnect();
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const { segments, pts, min, max, last } = useMemo(() => {
    const defined = data.map((d) => d.value).filter((v): v is number => v != null);
    const min = defined.length ? Math.min(...defined) : 0;
    const max = defined.length ? Math.max(...defined) : 1;
    const span = max - min || 1;
    const lo = min - span * 0.15;
    const hi = max + span * 0.15;
    const innerW = W - padX * 2;
    const innerH = H - padTop - padBottom;
    const xFor = (i: number) => padX + (data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
    const yFor = (v: number) => padTop + innerH - ((v - lo) / (hi - lo)) * innerH;

    const pts = data.map((d, i) => ({ x: xFor(i), y: d.value == null ? null : yFor(d.value), value: d.value, label: d.label }));
    const baseY = padTop + innerH;
    const segments: { line: string; area: string }[] = [];
    let run: { x: number; y: number }[] = [];
    const flush = () => {
      if (run.length) {
        const line = smooth(run);
        const area = `${line} L${run[run.length - 1].x.toFixed(1)} ${baseY} L${run[0].x.toFixed(1)} ${baseY} Z`;
        segments.push({ line, area });
      }
      run = [];
    };
    pts.forEach((p) => {
      if (p.y == null) flush();
      else run.push({ x: p.x, y: p.y });
    });
    flush();
    const lastIdx = [...pts].reverse().findIndex((p) => p.y != null);
    const last = lastIdx === -1 ? null : pts.length - 1 - lastIdx;
    return { segments, pts, min, max, last };
  }, [data, H]);

  if (!data.length || data.every((d) => d.value == null)) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-[var(--radius-control)] border border-dashed border-white/10 bg-white/[0.015] text-sm text-ada-muted">
        <svg width="40" height="20" viewBox="0 0 40 20" aria-hidden>
          <path d="M2 16 C10 16 12 6 20 8 S30 4 38 4" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 4" />
        </svg>
        No data yet
      </div>
    );
  }

  const active = hover ?? last;
  const activePt = active != null ? pts[active] : null;

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const rel = (e.clientX - rect.left) / rect.width;
    let i = Math.round(rel * (data.length - 1));
    i = Math.max(0, Math.min(data.length - 1, i));
    // snap to nearest defined point
    if (pts[i].y == null) {
      let best: number | null = null;
      pts.forEach((p, j) => {
        if (p.y != null && (best == null || Math.abs(j - i) < Math.abs(best - i))) best = j;
      });
      if (best == null) return;
      i = best;
    }
    setHover(i);
  };

  const labelEvery = Math.max(1, Math.ceil(data.length / 7));

  return (
    <div ref={wrap} className="relative">
      <div className="mb-3 flex items-center justify-between font-mono-num text-xs text-ada-muted">
        <span>
          min <span className="text-ada-text-2">{min.toFixed(1)}{unit}</span>
        </span>
        <span>
          max <span className="text-ada-text-2">{max.toFixed(1)}{unit}</span>
        </span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full touch-pan-y overflow-visible"
        role="img"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={`${uid}-area`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
          <clipPath id={`${uid}-clip`}>
            <rect x="0" y="0" height={H} width={drawn ? W : 0} style={{ transition: "width 1600ms cubic-bezier(0.22,1,0.36,1)" }} />
          </clipPath>
        </defs>

        {[0.25, 0.5, 0.75].map((g) => {
          const y = padTop + g * (H - padTop - padBottom);
          return <line key={g} x1={padX} x2={W - padX} y1={y} y2={y} stroke="rgba(255,255,255,0.05)" strokeDasharray="2 6" />;
        })}

        <g clipPath={`url(#${uid}-clip)`}>
          {segments.map((s, i) => (
            <g key={i}>
              <path d={s.area} fill={`url(#${uid}-area)`} />
              <path
                d={s.line}
                fill="none"
                stroke={color}
                strokeWidth="2.25"
                strokeLinejoin="round"
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}
              />
            </g>
          ))}
        </g>

        {activePt && activePt.y != null ? (
          <g style={{ opacity: drawn ? 1 : 0, transition: "opacity 400ms" }}>
            <line x1={activePt.x} x2={activePt.x} y1={padTop} y2={H - padBottom} stroke="rgba(255,255,255,0.12)" />
            <circle cx={activePt.x} cy={activePt.y} r="9" fill={color} opacity="0.15" />
            <circle cx={activePt.x} cy={activePt.y} r="4" fill="#05080A" stroke={color} strokeWidth="2" />
          </g>
        ) : null}

        {data.map((d, i) =>
          i % labelEvery === 0 || i === data.length - 1 ? (
            <text key={i} x={pts[i].x} y={H - 6} textAnchor="middle" fontSize="9.5" fill="#7A8891">
              {d.label}
            </text>
          ) : null,
        )}
      </svg>

      {activePt && activePt.value != null ? (
        <div
          className="pointer-events-none absolute top-6 -translate-x-1/2 rounded-xl bg-ada-card-2/90 px-3 py-2 text-xs shadow-[var(--shadow-elev-2)] backdrop-blur transition-all duration-200 ada-hairline"
          style={{ left: `${(activePt.x / W) * 100}%`, opacity: hover == null ? 0 : 1 }}
        >
          <div className="text-ada-muted">{activePt.label}</div>
          <div className="font-mono-num text-ada-text">
            {activePt.value.toFixed(1)}
            {unit}
          </div>
        </div>
      ) : null}
    </div>
  );
}
