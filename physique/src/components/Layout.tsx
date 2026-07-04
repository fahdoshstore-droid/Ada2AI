import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { Role } from "../lib/types";

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

const NAV: Record<Role, NavItem[]> = {
  athlete: [
    { to: "/app/athlete", label: "Dashboard", icon: "◎" },
    { to: "/app/chat", label: "AI Coach", icon: "✦" },
    { to: "/app/progress", label: "Progress", icon: "↗" },
    { to: "/app/checkin", label: "Check-in", icon: "◴" },
  ],
  coach: [
    { to: "/app/coach", label: "Dashboard", icon: "◎" },
    { to: "/app/programs", label: "Programs", icon: "▤" },
    { to: "/app/checkins", label: "Check-ins", icon: "🗹" },
  ],
  admin: [{ to: "/app/admin", label: "Dashboard", icon: "◎" }],
};

function navLinkClass({ isActive }: { isActive: boolean }) {
  return [
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition",
    isActive
      ? "ada-gradient text-ada-navy"
      : "text-ada-muted hover:bg-white/5 hover:text-ada-text",
  ].join(" ");
}

function tabLinkClass({ isActive }: { isActive: boolean }) {
  return [
    "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-semibold transition",
    isActive ? "text-ada-teal" : "text-ada-muted",
  ].join(" ");
}

export function Layout() {
  const { role, email, signOut } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  const items = role ? NAV[role] : [];

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    navigate("/auth", { replace: true });
  };

  return (
    <div className="min-h-screen bg-ada-navy text-ada-text">
      {/* ── Desktop sidebar ── */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-ada-teal/10 bg-ada-surface/60 px-4 py-5 md:flex">
        <div className="px-2">
          <span className="font-display text-xl font-black tracking-tight text-ada-teal">
            Ada2<span className="text-ada-text">Physique</span>
          </span>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/5 pt-4">
          <div className="mb-3 truncate px-2 text-xs text-ada-muted">{email}</div>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full rounded-lg border border-ada-red/25 bg-ada-red/10 px-3 py-2 text-sm font-semibold text-ada-red transition hover:bg-ada-red/20 disabled:opacity-50"
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-ada-teal/10 bg-ada-navy/90 px-4 py-3 backdrop-blur md:hidden">
        <span className="font-display text-lg font-black tracking-tight text-ada-teal">
          Ada2<span className="text-ada-text">Physique</span>
        </span>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="text-xs font-semibold text-ada-muted disabled:opacity-50"
        >
          {signingOut ? "…" : "Sign out"}
        </button>
      </header>

      {/* ── Main content ── */}
      <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6 md:ml-60 md:pb-10 md:px-8">
        <Outlet />
      </main>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-ada-teal/10 bg-ada-surface/95 backdrop-blur md:hidden">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} end className={tabLinkClass}>
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
