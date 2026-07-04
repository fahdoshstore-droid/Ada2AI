import { Link } from "react-router-dom";
import { Button } from "../components/ui";

const MODULES = [
  {
    icon: "🎬",
    title: "AI Exercise Coach",
    desc: "Computer-vision rep counting, ROM, tempo, joint angles, technique mistakes and injury-risk flags from uploaded lifts.",
  },
  {
    icon: "🧍",
    title: "AI Physique Analyzer",
    desc: "Symmetry, muscle balance, shoulder-to-waist ratio, conditioning and weak-point detection from posing photos.",
  },
  {
    icon: "📈",
    title: "AI Progress Engine",
    desc: "Plateau detection, strength progression, body-composition trends and future-progress forecasting.",
  },
  {
    icon: "🥩",
    title: "AI Nutrition Coach",
    desc: "Calories, macros, protein targets and water intake — adjusted automatically as you progress.",
  },
  {
    icon: "🌙",
    title: "AI Recovery Engine",
    desc: "Sleep, fatigue and training-readiness tracking with deload, rest and volume recommendations.",
  },
  {
    icon: "✦",
    title: "AI Program Generator",
    desc: "Personalized training programs built from goal, experience, equipment, weak muscles and recovery.",
  },
];

export function Landing() {
  return (
    <div className="min-h-screen bg-ada-navy text-ada-text">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-10 flex items-center justify-between border-b border-ada-teal/10 bg-ada-navy/90 px-5 py-4 backdrop-blur sm:px-8">
        <span className="font-display text-xl font-black tracking-tight text-ada-teal">
          Ada2<span className="text-ada-text">Physique</span>
        </span>
        <div className="flex items-center gap-3">
          <Link to="/auth" className="text-sm font-semibold text-ada-muted hover:text-ada-text">
            Sign in
          </Link>
          <Link to="/auth">
            <Button>Get started</Button>
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="ada-gradient-dark px-5 py-20 text-center sm:px-8 sm:py-28">
        <div className="mx-auto max-w-3xl">
          <span className="inline-flex items-center rounded-full border border-ada-teal/25 bg-ada-teal/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ada-teal">
            AI Bodybuilding Intelligence
          </span>
          <h1 className="mt-6 font-display text-4xl font-black leading-tight sm:text-6xl">
            One coach. <span className="text-ada-teal">Thousands of athletes.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-ada-muted sm:text-lg">
            The “Hudl + WHOOP + Coach + ChatGPT” for bodybuilding. Elite coaching
            knowledge, computer vision, biomechanics and personalized intelligence —
            scaled by AI.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/auth">
              <Button className="px-6 py-3 text-base ada-glow-teal">Start training smarter</Button>
            </Link>
            <Link to="/auth">
              <Button variant="ghost" className="px-6 py-3 text-base">
                I'm a coach
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── AI Modules ── */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <h2 className="text-center font-display text-2xl font-bold sm:text-3xl">
          Every AI module earns its place
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-ada-muted">
          No feature exists because other apps have it. Each one reduces coaching time
          or improves athlete performance.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => (
            <div
              key={m.title}
              className="rounded-[var(--radius-card)] border border-ada-teal/12 bg-ada-card p-6 transition hover:border-ada-teal/30 hover:ada-glow-teal"
            >
              <div className="text-3xl">{m.icon}</div>
              <h3 className="mt-4 text-lg font-bold text-ada-teal">{m.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ada-muted">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-ada-teal/10 px-5 py-8 text-center text-xs text-ada-muted sm:px-8">
        Ada2Physique — built on Ada2AI infrastructure. Classic Physique expertise, scaled.
      </footer>
    </div>
  );
}
