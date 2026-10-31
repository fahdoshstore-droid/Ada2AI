import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { useAthleteProfile } from "../../hooks/useProfile";
import { LineChart } from "../../components/LineChart";
import {
  Badge,
  Card,
  Delta,
  EmptyState,
  LoadingState,
  PageHeader,
  SectionTitle,
  Stat,
  StatNumber,
} from "../../components/ui";
import { Icon } from "../../components/Icon";
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

  const bwList = bodyweight.data ?? [];
  const bwLatest = bwList.length ? Number(bwList.at(-1)!.weight_kg) : null;
  const bwChange = bwList.length > 1 ? Number(bwList.at(-1)!.weight_kg) - Number(bwList[0].weight_kg) : null;
  const avgSleep = sleep.data?.length
    ? sleep.data.reduce((acc, s) => acc + Number(s.duration_hours ?? 0), 0) / sleep.data.length
    : null;

  return (
    <div className="ada-stagger space-y-8 sm:space-y-10">
      <PageHeader
        eyebrow="Progress"
        title="Progress intelligence"
        subtitle="Real trends from your logs — no estimates, no mock data."
      />

      {/* ── Bodyweight hero ── */}
      <Card className="sm:p-8">
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="ada-eyebrow mb-3">Bodyweight trend</div>
            <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
              {bwLatest != null ? (
                <StatNumber value={bwLatest} decimals={1} unit="kg" size="lg" />
              ) : (
                <span className="font-mono-num text-[3rem] leading-none text-ada-faint">—</span>
              )}
              {bwChange != null ? (
                <span className="pb-1.5">
                  <Delta value={bwChange} unit=" kg" goodWhen="neutral" />
                </span>
              ) : null}
            </div>
          </div>
          <span className="text-sm text-ada-muted">last 14 entries</span>
        </div>
        <LineChart data={bwPoints} unit="kg" height={220} />
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat label="Bodyweight" value={bwLatest != null ? bwLatest.toFixed(1) : "—"} unit="kg" />
        <Stat label="Weigh-ins" value={bwList.length} />
        <Stat label="PRs (recent)" value={prCount} accent />
        <Stat label="Avg sleep" value={avgSleep != null ? avgSleep.toFixed(1) : "—"} unit="h" />
      </div>

      <Card className="sm:p-8">
        <SectionTitle hint="last 14 nights">Sleep duration</SectionTitle>
        <LineChart data={sleepPoints} unit="h" color="#5CC8FF" />
      </Card>

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <Card>
          <SectionTitle>Recent lifts</SectionTitle>
          {workouts.data?.length ? (
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
                    {w.reps ?? "—"}
                    {w.is_pr ? <Badge tone="amber">PR</Badge> : null}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No lifts logged" icon={<Icon name="dumbbell" size={20} />} />
          )}
        </Card>

        <Card>
          <SectionTitle hint={m ? fmtDay(m.measured_on) : undefined}>Latest measurements</SectionTitle>
          {m ? (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
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
                  <div key={label} className="ada-inset rounded-2xl px-4 py-3">
                    <div className="text-xs text-ada-muted">{label}</div>
                    <div className="mt-1 font-mono-num text-xl text-ada-text">
                      {Number(v!).toFixed(1)}
                      <span className="ml-1 text-xs text-ada-muted">cm</span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <EmptyState title="No measurements logged" icon={<Icon name="target" size={20} />} />
          )}
        </Card>
      </div>
    </div>
  );
}
