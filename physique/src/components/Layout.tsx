import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { Role } from "../lib/types";
import { AnimatedBackground, type BackgroundVariant } from "./AnimatedBackground";
import { Icon, type IconName } from "./Icon";

interface NavItem {
  to: string;
  label: string;
  icon: IconName;
  /** Extra path prefixes that should highlight this item (nested screens). */
  match?: string[];
}

const NAV: Record<Role, NavItem[]> = {
  athlete: [
    { to: "/app/athlete", label: "Dashboard", icon: "home" },
    { to: "/app/workout", label: "Workout", icon: "dumbbell", match: ["/app/program/"] },
    { to: "/app/chat", label: "AI Coach", icon: "sparkle" },
    { to: "/app/progress", label: "Progress", icon: "progress" },
    { to: "/app/checkin", label: "Check-in", icon: "checkin" },
  ],
  coach: [
    { to: "/app/coach", label: "Dashboard", icon: "grid" },
    { to: "/app/programs", label: "Programs", icon: "layers", match: ["/app/program-builder", "/app/program/"] },
    { to: "/app/workouts", label: "Workouts", icon: "dumbbell" },
    { to: "/app/nutrition", label: "Nutrition", icon: "nutrition" },
    { to: "/app/checkins", label: "Check-ins", icon: "checkin" },
  ],
  admin: [{ to: "/app/admin", label: "Dashboard", icon: "shield" }],
};

const ROLE_LABEL: Record<Role, string> = { athlete: "Athlete", coach: "Coach", admin: "Admin" };

function variantFor(path: string, role: Role | null): BackgroundVariant {
  if (path.startsWith("/app/chat")) return "ai";
  if (role === "coach" || role === "admin") return "coach";
  return "athlete";
}

/* ── Brand mark ── */
function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="ada-hairline relative grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-ada-card">
        <svg width="20" height="20" viewBox="0 0 32 32" aria-hidden>
          <path d="M7 25 L16 7 L25 25" fill="none" stroke="#00DCC8" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M11 19h10" stroke="#00DCC8" strokeWidth="3.2" strokeLinecap="round" />
        </svg>
        <span aria-hidden className="absolute inset-0 rounded-[11px] bg-ada-teal/10 blur-md" />
      </span>
      {!compact ? (
        <span className="font-display text-[15px] font-bold tracking-tight text-ada-text">
          Ada<span className="text-ada-teal">2</span>Physique
        </span>
      ) : null}
    </span>
  );
}

function initialsOf(email: string | null | undefined) {
  if (!email) return "A";
  return email.slice(0, 2).toUpperCase();
}

export function Layout() {
  const { role, email, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [signingOut, setSigningOut] = useState(false);

  const items = role ? NAV[role] : [];
  const isActivePath = (it: NavItem) =>
    pathname === it.to || pathname.startsWith(`${it.to}/`) || (it.match ?? []).some((m) => pathname.startsWith(m));
  const activeIndex = Math.max(0, items.findIndex(isActivePath));

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    navigate("/auth", { replace: true });
  };

  return (
    <div className="relative min-h-screen text-ada-text">
      <AnimatedBackground variant={variantFor(pathname, role)} />

      {/* ── Desktop side rail ── */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/[0.05] bg-ada-navy/40 px-4 py-6 backdrop-blur-xl md:flex">
        <div className="mb-10 px-2">
          <BrandMark />
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "group relative flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition-all duration-300",
                  isActive || isActivePath(item) ? "bg-white/[0.07] text-ada-text" : "text-ada-muted hover:bg-white/[0.035] hover:text-ada-text",
                ].join(" ")
              }
            >
              {({ isActive: linkActive }) => {
                const isActive = linkActive || isActivePath(item);
                return (
                <>
                  <Icon name={item.icon} size={20} className={isActive ? "text-ada-teal" : ""} />
                  {item.label}
                  {isActive ? (
                    <span className="absolute inset-y-2.5 -left-4 w-[3px] rounded-r-full bg-ada-teal shadow-[0_0_12px_#00DCC8]" />
                  ) : null}
                </>
                );
              }}
            </NavLink>
          ))}
        </nav>

        <div className="ada-inset rounded-2xl p-3">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-ada-teal-soft to-ada-ocean font-mono-num text-xs font-semibold text-ada-navy">
              {initialsOf(email)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs text-ada-text">{email}</div>
              {role ? <div className="text-[11px] text-ada-muted">{ROLE_LABEL[role]}</div> : null}
            </div>
          </div>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white/[0.03] px-3 py-2 text-xs font-medium text-ada-muted transition hover:bg-ada-red/10 hover:text-ada-red disabled:opacity-50"
          >
            <Icon name="logout" size={14} />
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <header
        className="sticky top-0 z-20 flex items-center justify-between px-4 pb-3 pt-[max(env(safe-area-inset-top),0.875rem)] backdrop-blur-xl md:hidden"
        style={{ background: "linear-gradient(180deg, rgba(5,8,10,0.9) 0%, rgba(5,8,10,0.6) 70%, rgba(5,8,10,0) 100%)" }}
      >
        <BrandMark />
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          aria-label="Sign out"
          className="ada-hairline grid h-10 w-10 place-items-center rounded-full bg-white/[0.04] text-ada-muted disabled:opacity-50"
        >
          <Icon name="logout" size={17} />
        </button>
      </header>

      {/* ── Main content ── */}
      <main className="w-full px-4 pb-32 pt-4 md:pl-64 md:pb-16 md:pt-10">
        <div key={pathname} className="mx-auto w-full max-w-6xl animate-fade md:px-8">
          <Outlet />
        </div>
      </main>

      {/* ── Mobile floating bottom nav ── */}
      <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] md:hidden" aria-label="Primary">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-ada-navy via-ada-navy/80 to-transparent" />
        <div className="ada-glass relative mx-auto flex max-w-md items-stretch rounded-[1.75rem] p-1.5" style={{ background: "rgba(15,21,25,0.75)" }}>
          {items.length ? (
            <span
              aria-hidden
              className="absolute inset-y-1.5 rounded-[1.35rem] bg-white/[0.08] transition-all duration-500 ease-[var(--ease-premium)]"
              style={{
                width: `calc((100% - 0.75rem) / ${items.length})`,
                left: `calc(0.375rem + (100% - 0.75rem) / ${items.length} * ${activeIndex})`,
              }}
            />
          ) : null}
          {items.map((item, i) => {
            const active = i === activeIndex;
            return (
              <NavLink key={item.to} to={item.to} end className="relative flex flex-1 flex-col items-center gap-1 py-2 text-[10.5px] font-medium">
                <Icon name={item.icon} size={21} className={active ? "text-ada-teal" : "text-ada-muted"} />
                <span className={active ? "text-ada-text" : "text-ada-muted"}>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
