import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

/* ── Ada2Physique UI primitives — premium, typed, brand-tuned ──
 * Public props of the original primitives (Card, SectionTitle, Button, Stat,
 * Spinner, LoadingState, EmptyState, ErrorState, Badge) are unchanged, so every
 * page inherits the new visual language without logic changes. */

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

/* ───────── hooks ───────── */
export function useCountUp(target: number, duration = 1100, decimals = 0) {
  const [v, setV] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setV(target);
      return;
    }
    const start = performance.now();
    const f0 = from.current;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const e = 1 - Math.pow(1 - p, 4);
      setV(f0 + (target - f0) * e);
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  const m = Math.pow(10, decimals);
  return Math.round(v * m) / m;
}

/* ───────── Card ───────── */
export function Card({
  children,
  className = "",
  glow = false,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={cx(
        "relative isolate overflow-hidden rounded-[var(--radius-card)] p-5 sm:p-6",
        "ada-glass",
        glow && "ada-glow-teal",
        className,
      )}
    >
      {glow ? (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-[10%] -top-24 -z-10 h-56 w-56 rounded-full bg-ada-teal/20 blur-3xl"
        />
      ) : null}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
      />
      {children}
    </div>
  );
}

/* ───────── SectionTitle ───────── */
export function SectionTitle({
  children,
  hint,
}: {
  children: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <h2 className="text-[1.0625rem] font-semibold tracking-tight text-ada-text sm:text-lg">{children}</h2>
      {hint ? <span className="text-sm text-ada-muted">{hint}</span> : null}
    </div>
  );
}

/* ───────── PageHeader ───────── */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-5 pb-2 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <div className="ada-eyebrow mb-3 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-ada-teal" />
            {eyebrow}
          </div>
        ) : null}
        <h1 className="ada-text-gradient text-[2rem] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[2.6rem]">
          {title}
        </h1>
        {subtitle ? <p className="mt-3 max-w-2xl text-[0.9375rem] text-ada-text-2">{subtitle}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div> : null}
    </header>
  );
}

/* ───────── Button ───────── */
type ButtonVariant = "primary" | "ghost" | "danger" | "subtle";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "ada-gradient text-ada-navy font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_10px_30px_-10px_rgba(0,220,200,0.6)] hover:brightness-110",
  ghost:
    "bg-white/[0.04] text-ada-text font-medium ada-hairline hover:bg-white/[0.08]",
  danger:
    "bg-ada-red/10 text-ada-red font-medium border border-ada-red/25 hover:bg-ada-red/20",
  subtle:
    "bg-white/[0.03] text-ada-text-2 font-medium hover:bg-white/[0.06] hover:text-ada-text",
};

export function Button({
  children,
  variant = "primary",
  loading = false,
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
}) {
  return (
    <button
      className={cx(
        "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm",
        "transition-all duration-300 ease-[var(--ease-premium)] active:scale-[0.97]",
        "disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100",
        VARIANT_CLASSES[variant],
        className,
      )}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading ? <Spinner size={16} /> : null}
      {children}
    </button>
  );
}

/* ───────── Stat ───────── */
export function Stat({
  label,
  value,
  unit,
  accent = false,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cx(
        "relative overflow-hidden rounded-[var(--radius-card)] px-5 py-4 sm:py-5",
        "ada-glass transition-transform duration-300 ease-[var(--ease-premium)] hover:-translate-y-0.5",
      )}
    >
      {accent ? (
        <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-ada-teal/15 blur-2xl" />
      ) : null}
      <div className="text-[0.8125rem] text-ada-text-2">{label}</div>
      <div
        className={cx(
          "mt-3 flex items-baseline gap-1 font-mono-num text-[1.9rem] font-medium leading-none sm:text-[2.25rem]",
          accent ? "text-ada-teal" : "text-ada-text",
        )}
      >
        <span className="truncate">{value}</span>
        {unit ? <span className="text-sm font-normal tracking-normal text-ada-muted">{unit}</span> : null}
      </div>
    </div>
  );
}

/* ───────── StatNumber (animated large numeral) ───────── */
export function StatNumber({
  value,
  decimals = 0,
  unit,
  size = "lg",
  className = "",
}: {
  value: number;
  decimals?: number;
  unit?: string;
  size?: "md" | "lg" | "xl";
  className?: string;
}) {
  const shown = useCountUp(value, 1200, decimals);
  const sizes = {
    md: "text-[2rem]",
    lg: "text-[2.75rem] sm:text-[3.5rem]",
    xl: "text-[3.75rem] sm:text-[5rem]",
  } as const;
  return (
    <span className={cx("inline-flex items-baseline gap-1.5 font-mono-num font-medium leading-none tracking-[-0.045em]", sizes[size], className)}>
      <span className="ada-text-gradient">{shown.toFixed(decimals)}</span>
      {unit ? <span className="text-[0.32em] font-medium tracking-normal text-ada-muted">{unit}</span> : null}
    </span>
  );
}

/* ───────── Delta ───────── */
export function Delta({
  value,
  unit = "",
  goodWhen = "up",
  decimals = 1,
}: {
  value: number;
  unit?: string;
  goodWhen?: "up" | "down" | "neutral";
  decimals?: number;
}) {
  const good = value === 0 || goodWhen === "neutral" ? null : goodWhen === "up" ? value > 0 : value < 0;
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono-num text-xs font-medium",
        good === null ? "bg-white/[0.05] text-ada-text-2" : good ? "bg-ada-success/10 text-ada-success" : "bg-ada-red/10 text-ada-red",
      )}
    >
      <svg width="8" height="8" viewBox="0 0 8 8" className={value < 0 ? "rotate-180" : ""} aria-hidden>
        <path d="M4 1 7 6H1z" fill="currentColor" />
      </svg>
      {value > 0 ? "+" : ""}
      {value.toFixed(decimals)}
      {unit}
    </span>
  );
}

/* ───────── ProgressRing ───────── */
export function ProgressRing({
  value,
  size = 120,
  stroke = 8,
  color = "#00DCC8",
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  children?: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={mounted ? c * (1 - pct / 100) : c}
          style={{
            transition: "stroke-dashoffset 1400ms cubic-bezier(0.22,1,0.36,1)",
            filter: `drop-shadow(0 0 ${stroke}px ${color}55)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

/* ───────── ProgressBar ───────── */
export function ProgressBar({ value, color = "#00DCC8", height = 6 }: { value: number; color?: string; height?: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div className="w-full overflow-hidden rounded-full bg-white/[0.06]" style={{ height }}>
      <div
        className="h-full rounded-full"
        style={{
          width: mounted ? `${Math.max(0, Math.min(100, value))}%` : "0%",
          background: `linear-gradient(90deg, ${color}99, ${color})`,
          boxShadow: `0 0 12px ${color}55`,
          transition: "width 1200ms cubic-bezier(0.22,1,0.36,1)",
        }}
      />
    </div>
  );
}

/* ───────── IconBadge ───────── */
export function IconBadge({
  name,
  tone = "teal",
  size = 36,
}: {
  name: IconName;
  tone?: "teal" | "ai" | "amber" | "info" | "neutral";
  size?: number;
}) {
  const tones = {
    teal: "bg-ada-teal/12 text-ada-teal",
    ai: "bg-ada-ai/15 text-[#B7AEFF]",
    amber: "bg-ada-amber/12 text-ada-amber",
    info: "bg-ada-info/12 text-ada-info",
    neutral: "bg-white/[0.05] text-ada-text-2",
  } as const;
  return (
    <span className={cx("grid shrink-0 place-items-center rounded-full", tones[tone])} style={{ width: size, height: size }}>
      <Icon name={name} size={Math.round(size * 0.46)} />
    </span>
  );
}

/* ───────── Spinner / states ───────── */
export function Spinner({ size = 24 }: { size?: number }) {
  return (
    <span
      className="inline-block animate-spin rounded-full border-2 border-ada-teal/25 border-t-ada-teal"
      style={{ width: size, height: size }}
      aria-label="loading"
    />
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-ada-muted">
      <div className="relative grid place-items-center">
        <span aria-hidden className="absolute h-14 w-14 animate-breathe rounded-full bg-ada-teal/15 blur-xl" />
        <Spinner size={28} />
      </div>
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon = "—",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-white/10 bg-white/[0.015] px-6 py-10 text-center">
      <div className="ada-hairline mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-ada-teal/10 text-xl text-ada-teal">
        {icon}
      </div>
      <h3 className="text-[0.9375rem] font-semibold text-ada-text">{title}</h3>
      {description ? <p className="mt-1.5 max-w-sm text-sm text-ada-muted">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-[var(--radius-control)] border border-ada-red/25 bg-ada-red/[0.08] px-4 py-3 text-sm text-ada-red">
      <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "teal" | "amber" | "success";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-white/[0.05] text-ada-text-2",
    teal: "bg-ada-teal/12 text-ada-teal",
    amber: "bg-ada-amber/12 text-ada-amber",
    success: "bg-ada-success/12 text-ada-success",
  };
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", tones[tone])}>
      {tone !== "neutral" ? <span className="h-1.5 w-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}
