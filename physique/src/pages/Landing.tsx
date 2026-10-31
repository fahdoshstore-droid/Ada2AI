import { Link } from "react-router-dom";
import { Button } from "../components/ui";

const MODULES = [
  {
    icon: "🏋️",
    title: "Coach-led Training",
    desc: "Create and assign personalized training programs, organize exercises by training day, and keep every athlete on the program selected by their coach.",
  },
  {
    icon: "📊",
    title: "Workout Tracking",
    desc: "Track exercises, sets, reps, weight, RPE, notes, and completion — giving the coach a clear view of how the athlete is actually training.",
  },
  {
    icon: "📦",
    title: "Weekly Check-ins",
    desc: "Athletes submit their weight, notes, and front, side, and back progress photos so the coach can review changes week by week.",
  },
  {
    icon: "🔍",
    title: "Visual AI Analysis",
    desc: "AI-assisted visual analysis compares current and previous check-ins and highlights observable changes with confidence and uncertainty indicators.",
  },
  {
    icon: "🥗",
    title: "Nutrition Planning",
    desc: "Create and assign structured nutrition plans alongside training, with meals, portions, targets, and supplements defined by the coach.",
  },
  {
    icon: "🧠",
    title: "Coach Intelligence",
    desc: "Keep the athlete's program, workout execution, progress, check-ins, feedback, and visual analysis connected in one place.",
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
          <Link to="/injury-prevention" className="hidden text-sm font-semibold text-ada-muted hover:text-ada-text sm:inline">
            التوعية والتعافي
          </Link>
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
            Coach-led · Athlete-focused · AI-assisted
          </span>
          <h1 className="mt-6 font-display text-4xl font-black leading-tight sm:text-6xl">
            AI-powered coaching for <span className="text-ada-teal">physique athletes.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-ada-muted sm:text-lg">
            Professional training, personalized programs, workout tracking, weekly
            check-ins, nutrition planning, and visual AI analysis — with the coach
            always in control.
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

      {/* ── Positioning ── */}
      <section className="border-y border-ada-teal/10 bg-ada-card/40 px-5 py-10 text-center sm:px-8">
        <h2 className="mx-auto max-w-3xl font-display text-xl font-bold sm:text-2xl">
          Built for serious coaching. Designed around the athlete.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-ada-muted sm:text-base">
          Bring training, execution, progress, check-ins, and coaching feedback into
          one connected workflow.
        </p>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-ada-teal">
          AI-assisted insights. Coach-led decisions.
        </p>
      </section>

      {/* ── Features ── */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <h2 className="text-center font-display text-2xl font-bold sm:text-3xl">
          Everything your coaching workflow needs
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-ada-muted">
          One platform for programming, training execution, athlete progress,
          check-ins, feedback, and AI-assisted insights.
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

      {/* ── Bottom CTA ── */}
      <section className="border-t border-ada-teal/10 bg-ada-card/40 px-5 py-12 text-center sm:px-8">
        <h2 className="mx-auto max-w-3xl font-display text-xl font-bold sm:text-2xl">
          Train smarter. Coach with more clarity. Build better physiques.
        </h2>
        <div className="mt-5">
          <Link to="/auth">
            <Button className="px-6 py-3 text-base ada-glow-teal">Start training smarter</Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-ada-teal/10 px-5 py-8 text-center text-xs text-ada-muted sm:px-8">
        Ada2Physique — coach-led physique coaching with AI-assisted insights.
      </footer>
    </div>
  );
}
