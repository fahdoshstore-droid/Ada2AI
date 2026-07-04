import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { useAthleteProfile } from "../../hooks/useProfile";
import { LineChart } from "../../components/LineChart";
import {
  Badge,
  Card,
  EmptyState,
  LoadingState,
  SectionTitle,
  Stat,
} from "../../components/ui";
import type { Bodyweight, Measurement, SleepLog, WorkoutLog } from "../../lib/types";

const fmtDay = (iso: string): string => {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

export function Progress() {
  const { userId } = useAuth();
  const { data: profile, isLoading } = useAthleteProfile();

  const bodyweight = useQuery<Bodyweight[]>({
    queryKey: ["progress-bodyweight", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("physique_bodyweight")
        .select("*")
        .eq("athlete_id", userId!)
        .order("weighed_at", { ascending: true })
        .limit(14);
      if (error) throw error;
      return data ?? [];
    },
  });

  const sleep = useQuery<SleepLog[]>({
    queryKey: ["progress-sleep", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("physique_sleep_logs")
        .select("*")
        .eq("athlete_id", userId!)
        .order("slept_on", { ascending: true })
        .limit(14);
      if (error) throw error;
      return data ?? [];
    },
  });

  const workouts = useQuery<WorkoutLog[]>({
    queryKey: ["progress-workouts", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("physique_workout_logs")
        .select("*")
        .eq("athlete_id", userId!)
        .order("logged_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data ?? [];
    },
  });

  const measurements = useQuery<Measurement | null>({
    queryKey: ["progress-measurements", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("physique_measurements")
        .select("*")
        .eq("athlete_id", userId!)
        .order("measured_on", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as Measurement | null;
    },
  });

  if (isLoading) return <LoadingState />;
  if (!profile) return <Navigate to="/onboard" replace />;

  const bwPoints = (bodyweight.data ?? []).map((b) => ({
    label: fmtDay(b.weighed_at),
    value: Number(b.weight_kg),
  }));
  const sleepPoints = (sleep.data ?? []).map((s) => ({
    label: fmtDay(s.slept_on),
    value: s.duration_hours != null ? Number(s.duration_hours) : null,
  }));
  const prCount = (workouts.data ?? []).filter((w) => w.is_pr).length;
  const m = measurements.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Progress intelligence</h1>
        <p className="mt-1 text-sm text-ada-muted">
          Real trends from your logs — no estimates, no mock data.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Bodyweight"
          value={bodyweight.data?.length ? Number(bodyweight.data.at(-1)!.weight_kg).toFixed(1) : "—"}
          unit="kg"
          accent
        />
        <Stat label="Weigh-ins" value={bodyweight.data?.length ?? 0} />
        <Stat label="PRs (recent)" value={prCount} accent />
        <Stat
          label="Avg sleep"
          value={
            sleep.data?.length
              ? (
                  sleep.data.reduce((acc, s) => acc + Number(s.duration_hours ?? 0), 0) /
                  sleep.data.length
                ).toFixed(1)
              : "—"
          }
          unit="h"
        />
      </div>

      <Card>
        <SectionTitle hint="last 14 entries">Bodyweight trend</SectionTitle>
        <LineChart data={bwPoints} unit="kg" />
      </Card>

      <Card>
        <SectionTitle hint="last 14 nights">Sleep duration</SectionTitle>
        <LineChart data={sleepPoints} unit="h" />
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <SectionTitle>Recent lifts</SectionTitle>
          {workouts.data?.length ? (
            <ul className="divide-y divide-white/5">
              {workouts.data.map((w) => (
                <li key={w.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="font-semibold text-ada-text">{w.exercise_name}</span>
                  <span className="font-mono-num text-ada-muted">
                    {w.weight_kg != null ? `${w.weight_kg}kg × ` : ""}
                    {w.reps ?? "—"}
                    {w.is_pr ? <span className="ml-2"><Badge tone="amber">PR</Badge></span> : null}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No lifts logged" icon="🏋️" />
          )}
        </Card>

        <Card>
          <SectionTitle hint={m ? fmtDay(m.measured_on) : undefined}>Latest measurements</SectionTitle>
          {m ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {([
                ["Chest", m.chest_cm],
                ["Waist", m.waist_cm],
                ["Hip", m.hip_cm],
                ["Arm", m.arm_cm],
                ["Thigh", m.thigh_cm],
                ["Calf", m.calf_cm],
                ["Neck", m.neck_cm],
                ["Shoulder", m.shoulder_cm],
                ["Forearm", m.forearm_cm],
              ] as [string, number | null][])
                .filter(([, v]) => v != null)
                .map(([label, v]) => (
                  <Stat key={label} label={label} value={Number(v!).toFixed(1)} unit="cm" />
                ))}
            </div>
          ) : (
            <EmptyState title="No measurements logged" icon="📏" />
          )}
        </Card>
      </div>
    </div>
  );
}
