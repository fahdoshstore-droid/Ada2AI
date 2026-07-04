import type { ButtonHTMLAttributes, ReactNode } from "react";

/* ── Ada2Physique UI primitives — production-ready, typed, brand-tuned ── */

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
      className={`rounded-[var(--radius-card)] border border-ada-teal/12 bg-ada-card p-5 ${
        glow ? "ada-glow-teal" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  children,
  hint,
}: {
  children: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <h2 className="text-lg font-bold text-ada-text sm:text-xl">{children}</h2>
      {hint ? <span className="text-sm text-ada-muted">{hint}</span> : null}
    </div>
  );
}

type ButtonVariant = "primary" | "ghost" | "danger" | "subtle";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "ada-gradient text-ada-navy font-bold hover:opacity-90",
  ghost:
    "border border-ada-teal/30 text-ada-teal hover:bg-ada-teal/10 bg-transparent",
  danger: "bg-ada-red/15 text-ada-red border border-ada-red/30 hover:bg-ada-red/25",
  subtle: "bg-ada-card-2 text-ada-text hover:bg-ada-card-2/70 border border-white/5",
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
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${className}`}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading ? <Spinner size={16} /> : null}
      {children}
    </button>
  );
}

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
    <div className="rounded-xl border border-white/5 bg-ada-surface px-4 py-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-ada-muted">
        {label}
      </div>
      <div
        className={`mt-1 font-mono-num text-2xl ${
          accent ? "text-ada-teal" : "text-ada-text"
        }`}
      >
        {value}
        {unit ? <span className="ml-1 text-sm text-ada-muted">{unit}</span> : null}
      </div>
    </div>
  );
}

export function Spinner({ size = 24 }: { size?: number }) {
  return (
    <span
      className="inline-block animate-spin rounded-full border-2 border-ada-teal/30 border-t-ada-teal"
      style={{ width: size, height: size }}
      aria-label="loading"
    />
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-ada-muted">
      <Spinner />
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
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ada-teal/15 bg-ada-surface/50 px-6 py-10 text-center">
      <div className="mb-3 text-3xl text-ada-teal/60">{icon}</div>
      <h3 className="text-base font-bold text-ada-text">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-ada-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-ada-red/25 bg-ada-red/10 px-4 py-3 text-sm text-ada-red">
      {message}
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
    neutral: "bg-white/5 text-ada-muted border-white/10",
    teal: "bg-ada-teal/12 text-ada-teal border-ada-teal/25",
    amber: "bg-ada-amber/12 text-ada-amber border-ada-amber/25",
    success: "bg-ada-success/12 text-ada-success border-ada-success/25",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
