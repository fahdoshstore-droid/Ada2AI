import { Link } from "react-router-dom";
import { useCoaches } from "../hooks/useMarketplace";
import { useAuth } from "../hooks/useAuth";
import { Badge, Button, EmptyState, LoadingState } from "../components/ui";
import { Icon } from "../components/Icon";
import type { CoachCard } from "../lib/types";

function CoachCardView({ coach }: { coach: CoachCard }) {
  const name = coach.display_name?.trim() || "مدرب";
  return (
    <Link
      to={`/coaches/${coach.coach_id}`}
      className="ada-glass group flex flex-col rounded-[var(--radius-panel)] p-5 transition-all duration-300 ease-[var(--ease-premium)] hover:-translate-y-1 hover:shadow-[0_20px_60px_-20px_rgba(0,220,200,0.25)] sm:p-6"
    >
      <div className="flex items-center gap-4">
        {coach.avatar_url ? (
          <img
            src={coach.avatar_url}
            alt={name}
            className="h-14 w-14 shrink-0 rounded-2xl object-cover"
          />
        ) : (
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-ada-teal-soft to-ada-ocean font-display text-lg font-bold text-ada-navy">
            {name.slice(0, 2)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-semibold text-ada-text">{name}</h3>
            {coach.is_verified ? <Badge tone="teal">موثّق</Badge> : null}
          </div>
          <p className="mt-0.5 text-sm text-ada-muted">
            {coach.years_experience
              ? `${coach.years_experience} سنوات خبرة`
              : "مدرب جديد"}
          </p>
        </div>
      </div>

      {coach.specialties.length ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {coach.specialties.slice(0, 3).map((s) => (
            <span
              key={s}
              className="rounded-full bg-white/[0.05] px-2.5 py-1 text-xs text-ada-text-2"
            >
              {s}
            </span>
          ))}
        </div>
      ) : null}

      {coach.bio ? (
        <p className="mt-3 line-clamp-2 text-sm text-ada-muted">{coach.bio}</p>
      ) : null}

      <div className="mt-auto flex items-center justify-between pt-5">
        <span className="inline-flex items-center gap-1 text-sm font-medium text-ada-teal">
          عرض المدرب
          <Icon
            name="arrow"
            size={15}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </Link>
  );
}

export function Coaches() {
  const { data: coaches, isLoading, error } = useCoaches();
  const { userId } = useAuth();

  return (
    <div className="min-h-screen bg-ada-navy text-ada-text">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/[0.05] bg-ada-navy/80 px-5 py-4 backdrop-blur-xl sm:px-8">
        <Link
          to="/"
          className="font-display text-xl font-black tracking-tight text-ada-teal"
        >
          Ada2<span className="text-ada-text">Physique</span>
        </Link>
        {userId ? (
          <Link to="/app">
            <Button variant="ghost">لوحة التحكم</Button>
          </Link>
        ) : (
          <Link to="/auth">
            <Button>تسجيل الدخول</Button>
          </Link>
        )}
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-8 sm:py-14">
        <div className="max-w-2xl">
          <div className="ada-eyebrow mb-3 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-ada-teal" />
            المدربون
          </div>
          <h1 className="ada-text-gradient text-[2.25rem] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[3rem]">
            اختر مدربك
          </h1>
          <p className="mt-4 text-[0.9375rem] text-ada-text-2">
            تصفّح المدربين المتاحين، وشاهد ملفاتهم، ثم أرسل طلب تدريب للبدء.
          </p>
        </div>

        {isLoading ? (
          <div className="mt-16">
            <LoadingState label="جارٍ تحميل المدربين…" />
          </div>
        ) : error ? (
          <div className="mt-16">
            <EmptyState
              title="تعذر تحميل المدربين"
              description="حاول مرة أخرى بعد لحظات."
              icon={<Icon name="alert" size={20} />}
            />
          </div>
        ) : coaches && coaches.length ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {coaches.map((c) => (
              <CoachCardView key={c.coach_id} coach={c} />
            ))}
          </div>
        ) : (
          <div className="mt-16">
            <EmptyState
              title="لا يوجد مدربون متاحون حالياً"
              description="سيظهر المدربون هنا فور نشر ملفاتهم."
              icon={<Icon name="users" size={20} />}
            />
          </div>
        )}
      </main>
    </div>
  );
}
