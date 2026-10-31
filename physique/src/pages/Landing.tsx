import { Link } from "react-router-dom";
import { Button } from "../components/ui";
import { Photo, type PhotoName } from "../components/Media";

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

const SHOWCASE: { photo: PhotoName; alt: string; position: string; eyebrow: string; title: string }[] = [
  {
    photo: "squat-tracking",
    alt: "Athlete squatting with joint-angle tracking overlay",
    position: "58% 40%",
    eyebrow: "Visual AI Analysis",
    title: "Joint angles and range of motion, rep by rep.",
  },
  {
    photo: "coach-portrait",
    alt: "Ada2Physique coach portrait",
    position: "50% 20%",
    eyebrow: "Coach-led",
    title: "Your coach stays in control of every decision.",
  },
  {
    photo: "nutrition-prep",
    alt: "Meal prep with the Ada2Physique app",
    position: "50% 55%",
    eyebrow: "Nutrition Planning",
    title: "Meals, targets and supplements alongside training.",
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
      <section className="relative isolate overflow-hidden px-5 py-20 text-center sm:px-8 sm:py-28 lg:py-36 lg:text-left">
        <Photo
          name="coach-spot-incline"
          alt="Coach spotting an athlete on the incline dumbbell press with AI motion-tracking overlay"
          position="72% 30%"
          priority
          className="absolute inset-0 -z-20 h-full w-full object-cover opacity-60 lg:opacity-100"
        />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-ada-navy via-ada-navy/85 to-ada-navy/10" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-ada-navy via-transparent to-ada-navy/40" />
        <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl lg:max-w-xl">
          <span className="inline-flex items-center rounded-full border border-ada-teal/25 bg-ada-teal/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ada-teal">
            Coach-led · Athlete-focused · AI-assisted
          </span>
          <h1 className="mt-6 font-display text-4xl font-black leading-tight sm:text-6xl">
            AI-powered coaching for <span className="text-ada-teal">physique athletes.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-ada-text-2 sm:text-lg lg:mx-0">
            Professional training, personalized programs, workout tracking, weekly
            check-ins, nutrition planning, and visual AI analysis — with the coach
            always in control.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
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

      {/* ── Showcase ── */}
      <section className="mx-auto grid max-w-6xl gap-4 px-5 pt-16 sm:px-8 md:grid-cols-3">
        {SHOWCASE.map((t) => (
          <figure key={t.photo} className="group relative isolate aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-elev-2)] md:aspect-[3/4]">
            <Photo
              name={t.photo}
              alt={t.alt}
              position={t.position}
              sizes="(min-width: 768px) 380px, 100vw"
              className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-premium)] group-hover:scale-[1.04]"
            />
            <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-ada-navy via-ada-navy/30 to-transparent" />
            <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[var(--radius-card)] ada-hairline" />
            <figcaption className="absolute inset-x-5 bottom-5">
              <span className="ada-eyebrow !text-ada-teal">{t.eyebrow}</span>
              <p className="mt-1.5 text-lg font-semibold leading-snug tracking-tight text-ada-text">{t.title}</p>
            </figcaption>
          </figure>
        ))}
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
