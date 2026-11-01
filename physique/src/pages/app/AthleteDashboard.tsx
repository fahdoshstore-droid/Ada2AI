import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { useAthleteProfile } from "../../hooks/useProfile";
import { useMyCoachingState, useCancelRequest } from "../../hooks/useRequests";
import {
  Badge,
  Button,
  Card,
  Delta,
  EmptyState,
  ErrorState,
  IconBadge,
  LoadingState,
  PageHeader,
  SectionTitle,
  Stat,
  StatNumber,
} from "../../components/ui";
import { Icon } from "../../components/Icon";
import { HeroBanner, Photo } from "../../components/Media";
import type { Assignment, Bodyweight, WorkoutLog } from "../../lib/types";

interface AssignmentWithPlan extends Assignment {
  program: { name: string; goal: string | null; duration_weeks: number | null; days_per_week: number | null } | null;
  nutrition_plan: { name: string; goal: string | null } | null;
}

const GOAL_LABEL: Record<string, string> = {
  bulk: "Bulking",
  cut: "Cutting",
  recomp: "Recomp",
  maintain: "Maintain",
  prep: "Prep",
  offseason: "Off-season",
};

export function AthleteDashboard() {
  const { userId } = useAuth();
  const qc = useQueryClient();
  const { data: profile, isLoading: profileLoading } = useAthleteProfile();
  const { data: coaching } = useMyCoachingState();
  const cancelRequest = useCancelRequest();
  const [bwValue, setBwValue] = useState("");
  const [bwError, setBwError] = useState<string | null>(null);

  const assignments = useQuery<AssignmentWithPlan[]>({
    queryKey: ["athlete-assignments", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("physique_assignments")
        .select(
          "*, program:physique_programs(name, goal, duration_weeks, days_per_week), nutrition_plan:physique_nutrition_plans(name, goal)",
        )
        .eq("athlete_id", userId!)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as AssignmentWithPlan[];
    },
  });

  const bodyweight = useQuery<Bodyweight[]>({
    queryKey: ["athlete-bodyweight", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("physique_bodyweight")
        .select("*")
        .eq("athlete_id", userId!)
        .order("weighed_at", { ascending: false })
        .limit(7);
      if (error) throw error;
      return data ?? [];
    },
  });

  const workouts = useQuery<WorkoutLog[]>({
    queryKey: ["athlete-workouts", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("physique_workout_logs")
        .select("*")
        .eq("athlete_id", userId!)
        .order("logged_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data ?? [];
    },
  });

  const logBw = useMutation({
    mutationFn: async (kg: number) => {
      const { error } = await supabase
        .from("physique_bodyweight")
        .insert({ athlete_id: userId!, weight_kg: kg });
      if (error) throw error;
    },
    onSuccess: () => {
      setBwValue("");
      setBwError(null);
      qc.invalidateQueries({ queryKey: ["athlete-bodyweight", userId] });
    },
    onError: (err: unknown) =>
      setBwError(err instanceof Error ? err.message : "Could not log weight."),
  });

  if (profileLoading) return <LoadingState />;
  if (!profile) return <Navigate to="/onboard" replace />;

  const activeProgram = assignments.data?.find((a) => a.assignment_type === "program");
  const activeNutrition = assignments.data?.find((a) => a.assignment_type === "nutrition");
  const latestBw = bodyweight.data?.[0];
  const firstBw = bodyweight.data?.[bodyweight.data.length - 1];
  const bwTrend =
    latestBw && firstBw && latestBw.id !== firstBw.id
      ? Number(latestBw.weight_kg) - Number(firstBw.weight_kg)
      : null;

  const trendGood: "up" | "down" | "neutral" =
    profile.goal === "cut" || profile.goal === "prep" ? "down" : profile.goal === "bulk" || profile.goal === "offseason" ? "up" : "neutral";

  return (
    <div className="ada-stagger space-y-8 sm:space-y-10">
      <HeroBanner photo="coach-spot-incline" alt="Coach spotting an athlete on the incline dumbbell press with motion-tracking overlay" position="72% 18%">
        <PageHeader
          eyebrow={`Athlete · ${GOAL_LABEL[profile.goal ?? ""] ?? "No goal set"}`}
          title={profile.display_name ? `Welcome, ${profile.display_name}` : "Athlete dashboard"}
          subtitle={
            <>
              {(profile.competition_category ?? "none").replace(/_/g, " ")} · {profile.experience_level ?? "—"} ·{" "}
              {profile.training_frequency ?? "—"} days/wk
            </>
          }
          action={
            <>
              <Link to="/app/checkin">
                <Button className="py-3">
                  <Icon name="checkin" size={16} /> Weekly check-in
                </Button>
              </Link>
              <Link to="/app/chat">
                <Button variant="ghost" className="py-3">
                  <Icon name="sparkle" size={16} className="text-ada-teal" /> Ask AI Coach
                </Button>
              </Link>
            </>
          }
        />
      </HeroBanner>

      {/* ── Coaching state machine (spec §22): NO_COACH / PENDING / ACCEPTED / REJECTED ── */}
      {coaching?.state === "ACCEPTED" ? (
        <section className="ada-glass relative overflow-hidden rounded-[var(--radius-panel)] p-6 sm:p-8">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-ada-teal/15 blur-3xl" />
          <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="ada-eyebrow mb-2">تم قبول طلبك 🎉</div>
              <h2 className="text-xl font-semibold text-ada-text sm:text-2xl">
                مدربك: {coaching.coachName ?? "مدربك"}
              </h2>
              <p className="mt-1.5 max-w-xl text-sm text-ada-muted">
                مدربك جاهز للبدء. استعرض خطتك التدريبية وتواصل معه مباشرة.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/coaches">
                <Button variant="ghost" className="py-3">
                  عرض ملف المدرب
                </Button>
              </Link>
            </div>
          </div>
        </section>
      ) : coaching?.state === "PENDING_REQUEST" ? (
        <section className="ada-glass relative overflow-hidden rounded-[var(--radius-panel)] p-6 sm:p-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="ada-eyebrow mb-2">طلبك قيد المراجعة</div>
              <h2 className="text-xl font-semibold text-ada-text sm:text-2xl">
                أرسلت طلب التدريب إلى{" "}
                {coaching.request?.coach_name ?? "المدرب"}
              </h2>
              <p className="mt-1.5 max-w-xl text-sm text-ada-muted">
                بانتظار موافقة المدرب.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {coaching.request?.coach_id ? (
                <Link to={`/coaches/${coaching.request.coach_id}`}>
                  <Button variant="ghost" className="py-3">
                    عرض المدرب
                  </Button>
                </Link>
              ) : null}
              <Button
                variant="ghost"
                className="py-3"
                loading={cancelRequest.isPending}
                onClick={() => {
                  if (coaching.request?.id) cancelRequest.mutate(coaching.request.id);
                }}
              >
                إلغاء الطلب
              </Button>
            </div>
          </div>
        </section>
      ) : coaching?.state === "REJECTED" ? (
        <section className="ada-glass relative overflow-hidden rounded-[var(--radius-panel)] p-6 sm:p-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="ada-eyebrow mb-2">لم تتم الموافقة</div>
              <h2 className="text-xl font-semibold text-ada-text sm:text-2xl">
                لم تتم الموافقة على طلب التدريب مع{" "}
                {coaching.request?.coach_name ?? "المدرب"}
              </h2>
              {coaching.request?.rejection_reason ? (
                <p className="mt-1.5 max-w-xl text-sm text-ada-muted">
                  {coaching.request.rejection_reason}
                </p>
              ) : null}
            </div>
            <Link to="/coaches">
              <Button className="shrink-0 py-3">اختيار مدرب آخر</Button>
            </Link>
          </div>
        </section>
      ) : (
        <section className="ada-glass relative overflow-hidden rounded-[var(--radius-panel)] p-6 sm:p-8">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-ada-teal/15 blur-3xl" />
          <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="ada-eyebrow mb-2">ابدأ رحلتك</div>
              <h2 className="text-xl font-semibold text-ada-text sm:text-2xl">
                اختر مدربك
              </h2>
              <p className="mt-1.5 max-w-xl text-sm text-ada-muted">
                اعثر على المدرب المناسب لأهدافك وأرسل له طلب تدريب للبدء.
              </p>
            </div>
            <Link to="/coaches">
              <Button className="shrink-0 py-3">
                استعرض المدربين <Icon name="arrow" size={15} />
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* ── Hero: bodyweight + quick log ── */}
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr] lg:gap-6">
        <Card glow className="sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="ada-eyebrow mb-4">Bodyweight</div>
              {latestBw ? (
                <StatNumber value={Number(latestBw.weight_kg)} decimals={1} unit="kg" size="xl" />
              ) : (
                <span className="font-mono-num text-[3.75rem] leading-none text-ada-faint">—</span>
              )}
            </div>
            {bwTrend != null ? (
              <div className="text-right">
                <div className="mb-1.5 text-xs text-ada-muted">Last {bodyweight.data?.length ?? 0} weigh-ins</div>
                <Delta value={bwTrend} unit=" kg" goodWhen={trendGood} />
              </div>
            ) : null}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const kg = Number(bwValue);
              if (bwValue && !Number.isNaN(kg)) logBw.mutate(kg);
            }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <div className="relative">
              <input
                type="number"
                step="0.1"
                inputMode="decimal"
                className="ada-input max-w-44 pr-10 font-mono-num"
                value={bwValue}
                onChange={(e) => setBwValue(e.target.value)}
                placeholder="Today's weight"
                aria-label="Log bodyweight in kg"
              />
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-ada-muted">kg</span>
            </div>
            <Button type="submit" loading={logBw.isPending} className="py-3">
              <Icon name="plus" size={15} /> Log weigh-in
            </Button>
            {bwError ? <ErrorState message={bwError} /> : null}
          </form>
        </Card>

        <Card className="flex flex-col sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconBadge name="dumbbell" />
              <span className="ada-eyebrow">Training program</span>
            </div>
            {activeProgram ? <Badge tone="success">Active</Badge> : null}
          </div>
          {activeProgram?.program ? (
            <div className="flex flex-1 flex-col">
              <div className="text-[1.6rem] font-semibold leading-tight tracking-tight">{activeProgram.program.name}</div>
              <p className="mt-2 text-sm capitalize text-ada-text-2">{activeProgram.program.goal ?? "—"}</p>
              <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
                <div className="ada-inset rounded-2xl px-4 py-3">
                  <div className="font-mono-num text-2xl text-ada-text">{activeProgram.program.duration_weeks ?? "—"}</div>
                  <div className="text-xs text-ada-muted">weeks</div>
                </div>
                <div className="ada-inset rounded-2xl px-4 py-3">
                  <div className="font-mono-num text-2xl text-ada-text">{activeProgram.program.days_per_week ?? "—"}</div>
                  <div className="text-xs text-ada-muted">days / week</div>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              title="No active program"
              description="Your coach will assign a program. Ask the AI Coach for guidance in the meantime."
              icon={<Icon name="layers" size={20} />}
              action={
                <Link to="/app/chat">
                  <Button variant="ghost">Ask AI Coach</Button>
                </Link>
              }
            />
          )}
        </Card>
      </div>

      {/* ── Profile stats ── */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat
          label="Trend"
          value={bwTrend == null ? "—" : `${bwTrend >= 0 ? "+" : ""}${bwTrend.toFixed(1)}`}
          unit="kg"
        />
        <Stat label="Height" value={profile.height_cm ? Number(profile.height_cm).toFixed(0) : "—"} unit="cm" />
        <Stat label="Goal" value={GOAL_LABEL[profile.goal ?? ""] ?? "—"} accent />
        <Stat label="Frequency" value={profile.training_frequency ?? "—"} unit="days/wk" />
      </div>

      {/* ── Nutrition & recent lifts ── */}
      <div className="grid items-start gap-4 lg:grid-cols-[1fr_1.4fr] lg:gap-6">
        <Card>
          <div className="relative -mx-5 -mt-5 mb-6 h-36 overflow-hidden sm:-mx-6 sm:-mt-6 sm:h-40">
            <Photo
              name="nutrition-prep"
              alt="Meal prep with grilled chicken, rice, vegetables and the Ada2Physique app"
              position="50% 60%"
              sizes="(min-width: 1024px) 480px, 100vw"
              className="h-full w-full object-cover"
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#0d1317] via-[#0d1317]/30 to-transparent" />
          </div>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconBadge name="nutrition" tone="amber" />
              <span className="ada-eyebrow">Nutrition plan</span>
            </div>
            {activeNutrition ? <Badge tone="success">Active</Badge> : null}
          </div>
          {activeNutrition?.nutrition_plan ? (
            <div>
              <div className="text-[1.4rem] font-semibold leading-tight tracking-tight">{activeNutrition.nutrition_plan.name}</div>
              <p className="mt-2 text-sm text-ada-text-2">
                {GOAL_LABEL[activeNutrition.nutrition_plan.goal ?? ""] ?? "—"}
              </p>
            </div>
          ) : (
            <EmptyState
              title="No active nutrition plan"
              description="Track your progress and check in weekly so your coach can dial in macros."
              icon={<Icon name="nutrition" size={20} />}
            />
          )}
        </Card>

        <Card>
          <SectionTitle
            hint={
              <Link to="/app/progress" className="inline-flex items-center gap-1 text-ada-teal transition-opacity hover:opacity-80">
                View progress <Icon name="arrow" size={14} />
              </Link>
            }
          >
            Recent lifts
          </SectionTitle>
          {workouts.isLoading ? (
            <LoadingState label="Loading lifts…" />
          ) : workouts.data?.length ? (
            <ul className="space-y-2">
              {workouts.data.map((w) => (
                <li key={w.id} className="ada-inset flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm">
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/[0.04] text-ada-muted">
                      <Icon name="dumbbell" size={15} />
                    </span>
                    <span className="truncate font-medium text-ada-text">{w.exercise_name}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2 font-mono-num text-ada-text-2">
                    {w.weight_kg != null ? `${w.weight_kg} kg × ` : ""}
                    {w.reps ?? "—"} reps
                    {w.is_pr ? <Badge tone="amber">PR</Badge> : null}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No lifts logged yet" icon={<Icon name="dumbbell" size={20} />} />
          )}
        </Card>
      </div>

      {assignments.error ? <ErrorState message="Could not load assignments." /> : null}
    </div>
  );
}
