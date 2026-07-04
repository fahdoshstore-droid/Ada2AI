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

      {/* ── Quick log bodyweight ── */}
      <Card>
        <SectionTitle hint="Daily weigh-in">Log bodyweight</SectionTitle>
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
            Training program
          </SectionTitle>
          {activeProgram?.program ? (
            <div>
              <div className="text-lg font-bold">{activeProgram.program.name}</div>
              <p className="mt-1 text-sm text-ada-muted">
                {activeProgram.program.goal ?? "—"} ·{" "}
                {activeProgram.program.duration_weeks ?? "—"} weeks ·{" "}
                {activeProgram.program.days_per_week ?? "—"} days/wk
              </p>
            </div>
          ) : (
            <EmptyState
              title="No active program"
              description="Your coach will assign a program. Ask the AI Coach for guidance in the meantime."
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
            Nutrition plan
          </SectionTitle>
          {activeNutrition?.nutrition_plan ? (
            <div>
              <div className="text-lg font-bold">{activeNutrition.nutrition_plan.name}</div>
              <p className="mt-1 text-sm text-ada-muted">
                {GOAL_LABEL[activeNutrition.nutrition_plan.goal ?? ""] ?? "—"}
              </p>
            </div>
          ) : (
            <EmptyState
              title="No active nutrition plan"
              description="Track your progress and check in weekly so your coach can dial in macros."
              icon="🥩"
            />
          )}
        </Card>
      </div>

      {/* ── Recent workouts ── */}
      <Card>
        <SectionTitle hint={<Link to="/app/progress" className="text-ada-teal hover:underline">View progress →</Link>}>
          Recent lifts
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
          <EmptyState title="No lifts logged yet" icon="🏋️" />
        )}
      </Card>

      {assignments.error ? <ErrorState message="Could not load assignments." /> : null}
    </div>
  );
}
