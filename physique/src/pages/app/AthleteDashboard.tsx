import { getPhysiqueSportIdentity } from "../../lib/sportIdentity";
import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { useAthleteProfile } from "../../hooks/useProfile";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  SectionTitle,
  Stat,
} from "../../components/ui";
import type { Assignment, Bodyweight, WorkoutLog } from "../../lib/types";
import { parseMeals, foodById } from "../../lib/nutrition";

interface AssignmentWithPlan extends Assignment {
  program: { name: string; goal: string | null; duration_weeks: number | null; days_per_week: number | null } | null;
  nutrition_plan: {
    name: string;
    goal: string | null;
    meal_timing_notes: string | null;
    targets: {
      target_date: string;
      calories_kcal: number | null;
      protein_g: number | null;
      carbs_g: number | null;
      fat_g: number | null;
      water_ml: number | null;
      notes: string | null;
    }[];
  } | null;
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
  const { data: profile, isLoading: profileLoading, error: profileError } = useAthleteProfile();
  const sportIdentity = useQuery({
    queryKey: ["physique-sport-identity", userId],
    enabled: !!userId,
    queryFn: () => getPhysiqueSportIdentity(userId!),
  });
  const coachRelationship = useQuery({
    queryKey: ["athlete-active-coach", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("physique_coach_athletes").select("coach_id,status").eq("athlete_id", userId!).eq("status", "active").limit(1);
      if (error) throw error;
      return data?.[0] ?? null;
    },
  });
  const [bwValue, setBwValue] = useState("");
  const [bwError, setBwError] = useState<string | null>(null);

  const assignments = useQuery<AssignmentWithPlan[]>({
    queryKey: ["athlete-assignments", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("physique_assignments")
        .select(
          "*, program:physique_programs(name, goal, duration_weeks, days_per_week), nutrition_plan:physique_nutrition_plans(name, goal, meal_timing_notes, targets:physique_nutrition_targets(target_date, calories_kcal, protein_g, carbs_g, fat_g, water_ml, notes))",
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
  if (profileError) return <ErrorState message="Could not load your athlete profile. Please try again." />;
  if (!profile) return <Navigate to="/onboard" replace />;
  if (!coachRelationship.isLoading && !coachRelationship.data) {
    return <div className="space-y-6"><Card glow><h1 className="text-2xl font-bold">ابدأ رحلتك التدريبية</h1><p className="mt-2 text-sm text-ada-muted">ملفك جاهز. اختر مدربك الآن وابدأ برنامجك التدريبي.</p><div className="mt-5 flex flex-wrap gap-3"><Link to="/app/coaches"><Button>اختيار المدرب</Button></Link><Link to="/onboard"><Button variant="ghost">استكمال الملف</Button></Link></div></Card></div>;
  }

  const activeProgram = assignments.data?.find((a) => a.assignment_type === "program");
  const activeNutrition = assignments.data?.find((a) => a.assignment_type === "nutrition");
  const nutritionMeals = parseMeals(activeNutrition?.nutrition_plan?.meal_timing_notes);
  const nutritionTarget = activeNutrition?.nutrition_plan?.targets
    ?.slice()
    .sort((a, b) => a.target_date.localeCompare(b.target_date))
    .at(-1);
  const latestBw = bodyweight.data?.[0];
  const firstBw = bodyweight.data?.[bodyweight.data.length - 1];
  const bwTrend =
    latestBw && firstBw && latestBw.id !== firstBw.id
      ? Number(latestBw.weight_kg) - Number(firstBw.weight_kg)
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {profile.display_name ? `Welcome, ${profile.display_name}` : "Athlete dashboard"}
        </h1>
          <p className="mt-1 text-sm text-ada-muted">
          {GOAL_LABEL[profile.goal ?? ""] ?? "No goal set"} ·{" "}
          {(profile.competition_category ?? "none").replace(/_/g, " ")} ·{" "}
          {profile.experience_level ?? "—"} · {profile.training_frequency ?? "—"} days/wk
        </p>
      </div>

      {sportIdentity.data && <p className="text-sm text-ada-teal">Sport ID: {sportIdentity.data.identity.sport_id}</p>}

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Bodyweight" value={latestBw ? Number(latestBw.weight_kg).toFixed(1) : "—"} unit="kg" accent />
        <Stat
          label="Trend"
          value={
            bwTrend == null
              ? "—"
              : `${bwTrend >= 0 ? "+" : ""}${bwTrend.toFixed(1)}`
          }
          unit="kg"
        />
        <Stat label="Height" value={profile.height_cm ? Number(profile.height_cm).toFixed(0) : "—"} unit="cm" />
        <Stat label="Goal" value={GOAL_LABEL[profile.goal ?? ""] ?? "—"} />
      </div>

      {/* ── Today's workout ── */}
      <Card>
        <SectionTitle hint="Today">Today's workout · تمرين اليوم</SectionTitle>
        {activeProgram?.program ? (
          <Link
            to="/app/workout"
            className="block rounded-lg border border-ada-teal/20 bg-ada-teal/5 p-4 transition hover:border-ada-teal/40"
          >
            <div className="font-semibold text-ada-text">Today's workout</div>
            <p className="mt-1 text-sm text-ada-muted">
              Open your checklist, log sets, and track completion.
            </p>
            <span className="mt-2 inline-block text-xs text-ada-teal">Start workout →</span>
          </Link>
        ) : (
          <EmptyState
            title="No workout scheduled today · لا يوجد تمرين مجدول اليوم"
            description="Your coach will assign your training program before workout tracking begins."
            icon="🏋️"
          />
        )}
      </Card>

      {/* ── Quick log bodyweight ── */}
      <Card>
        <SectionTitle hint="Daily">Bodyweight · الوزن</SectionTitle>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const kg = Number(bwValue);
            if (bwValue && !Number.isNaN(kg)) logBw.mutate(kg);
          }}
          className="flex flex-wrap items-center gap-3"
        >
          <input
            type="number"
            step="0.1"
            inputMode="decimal"
            className="ada-input max-w-40"
            value={bwValue}
            onChange={(e) => setBwValue(e.target.value)}
            placeholder="kg"
          />
          <Button type="submit" loading={logBw.isPending}>
            Save
          </Button>
          {bwError ? <ErrorState message={bwError} /> : null}
        </form>
      </Card>

      {/* ── Active program & nutrition ── */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <SectionTitle hint={activeProgram ? <Badge tone="success">Active</Badge> : undefined}>
            My training program · برنامجي التدريبي
          </SectionTitle>
          {activeProgram?.program ? (
            <Link to={`/app/program/${activeProgram.program_id}`}>
              <div className="hover:text-ada-teal transition-colors">
                <div className="text-lg font-bold">{activeProgram.program.name}</div>
                <p className="mt-1 text-sm text-ada-muted">
                  {activeProgram.program.goal ?? "—"} ·{" "}
                  {activeProgram.program.duration_weeks ?? "—"} weeks ·{" "}
                  {activeProgram.program.days_per_week ?? "—"} days/wk
                </p>
                <span className="mt-2 inline-block text-xs text-ada-teal">View exercises →</span>
              </div>
            </Link>
          ) : (
            <EmptyState
              title="No training program assigned · لا يوجد برنامج تدريبي معيّن"
              description="Your coach will assign your next training program."
              icon="▤"
              action={
                <Link to="/app/chat">
                  <Button variant="ghost">Ask AI Coach</Button>
                </Link>
              }
            />
          )}
        </Card>

        <Card>
          <SectionTitle hint={activeNutrition ? <Badge tone="success">Active</Badge> : undefined}>
            My nutrition plan · خطتي الغذائية
          </SectionTitle>
          {activeNutrition?.nutrition_plan ? (
            <div>
              <div className="text-lg font-bold">{activeNutrition.nutrition_plan.name}</div>
              <p className="mt-1 text-sm text-ada-muted">
                {GOAL_LABEL[activeNutrition.nutrition_plan.goal ?? ""] ?? "—"}
              </p>
              {nutritionTarget ? (
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-ada-muted sm:grid-cols-4">
                  <span>Calories: <strong className="text-ada-text">{nutritionTarget.calories_kcal ?? "—"}</strong></span>
                  <span>Protein: <strong className="text-ada-text">{nutritionTarget.protein_g ?? "—"}g</strong></span>
                  <span>Carbs: <strong className="text-ada-text">{nutritionTarget.carbs_g ?? "—"}g</strong></span>
                  <span>Fat: <strong className="text-ada-text">{nutritionTarget.fat_g ?? "—"}g</strong></span>
                </div>
              ) : null}
              <p className="mt-2 text-xs text-ada-muted">Effective from: {activeNutrition.starts_on}</p>
              {nutritionMeals.length ? (
                <ul className="mt-3 space-y-2">
                  {nutritionMeals.map((meal) => (
                    <li key={meal.name} className="rounded-lg border border-white/10 bg-ada-surface p-3">
                      <div className="text-sm font-semibold text-ada-text">{meal.name}</div>
                      <div className="mt-1 text-xs text-ada-muted">
                        {meal.items.map((item) => {
                          const food = foodById(item.foodId);
                          return `${food?.name ?? item.foodId} ${item.quantity}${item.unit}`;
                        }).join(" · ")}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : (
            <EmptyState
              title="No nutrition plan assigned · لا توجد خطة غذائية معيّنة"
              description="Your coach will assign a nutrition plan when it is needed."
              icon="🥩"
            />
          )}
        </Card>
      </div>

      {/* ── Recent workouts ── */}
      <Card>
        <SectionTitle hint={<Link to="/app/progress" className="text-ada-teal hover:underline">View progress →</Link>}>
          Recent lifts · أحدث الأداء
        </SectionTitle>
        {workouts.isLoading ? (
          <LoadingState label="Loading lifts…" />
        ) : workouts.data?.length ? (
          <ul className="divide-y divide-white/5">
            {workouts.data.map((w) => (
              <li key={w.id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="font-semibold text-ada-text">{w.exercise_name}</span>
                <span className="font-mono-num text-ada-muted">
                  {w.weight_kg != null ? `${w.weight_kg}kg × ` : ""}
                  {w.reps ?? "—"} reps
                  {w.is_pr ? <span className="ml-2 text-ada-amber">PR</span> : null}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="No lifts logged yet · لا توجد تدريبات مسجلة" icon="🏋️" />
        )}
      </Card>

      {assignments.error ? <ErrorState message="Could not load assignments." /> : null}
    </div>
  );
}
