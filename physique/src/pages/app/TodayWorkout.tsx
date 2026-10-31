import { ownedPhysiqueMediaPath } from "../../lib/physiqueMedia";
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { useAthleteProfile } from "../../hooks/useProfile";
import { Badge, Card, EmptyState, ErrorState, LoadingState, PageHeader, ProgressRing, SectionTitle } from "../../components/ui";
import { Icon } from "../../components/Icon";
import { ExerciseDetail } from "../../components/ExerciseDetail";
import { SetLogForm, type SetLogValues } from "../../components/SetLogForm";
import {
  activeProgramAssignment,
  dateKeyFromIso,
  isRestDay,
  lastPerformedSummary,
  localDateKey,
  programDayForDate,
  workoutExercisesForDay,
  workoutProgress,
  type WorkoutExerciseView,
} from "../../lib/workout";
import type {
  Assignment,
  ExerciseLibrary,
  ProgramBlock,
  ProgramDay,
  WorkoutLog,
} from "../../lib/types";

interface AssignmentWithProgram extends Assignment {
  program: {
    id: string;
    name: string;
    goal: string | null;
    duration_weeks: number | null;
    days_per_week: number | null;
  } | null;
}

interface TodayWorkoutData {
  day: ProgramDay | null;
  restDay: boolean;
  exercises: WorkoutExerciseView[];
  logs: WorkoutLog[];
}

const STATUS_META: Record<string, { label: string; pill: string; dot: string }> = {
  NOT_STARTED: { label: "Not started", pill: "bg-white/[0.05] text-ada-text-2", dot: "bg-white/30" },
  IN_PROGRESS: { label: "In progress", pill: "bg-ada-teal/12 text-ada-teal", dot: "bg-ada-teal" },
  COMPLETED: { label: "Completed", pill: "bg-ada-success/12 text-ada-success", dot: "bg-ada-success" },
  MISSED: { label: "Missed", pill: "bg-ada-red/12 text-ada-red", dot: "bg-ada-red" },
};
const statusMeta = (status: string) => STATUS_META[status] ?? STATUS_META.NOT_STARTED;

const fmtClock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/** Client-only rest countdown shown after a set is saved (UI state, not persisted). */
function useRestTimer() {
  const [rest, setRest] = useState<{ total: number; endsAt: number; label: string } | null>(null);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!rest) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [rest]);
  const left = rest ? Math.max(0, Math.ceil((rest.endsAt - now) / 1000)) : 0;
  useEffect(() => {
    if (rest && left === 0) setRest(null);
  }, [rest, left]);
  return {
    rest,
    left,
    start: (seconds: number | null | undefined, label: string) => {
      if (!seconds || seconds <= 0) return;
      setNow(Date.now());
      setRest({ total: seconds, endsAt: Date.now() + seconds * 1000, label });
    },
    skip: () => setRest(null),
  };
}

export function TodayWorkout() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const { data: profile, isLoading: profileLoading } = useAthleteProfile();
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const restTimer = useRestTimer();

  const assignments = useQuery<AssignmentWithProgram[]>({
    queryKey: ["athlete-assignments", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("physique_assignments")
        .select(
          "*, program:physique_programs(id, name, goal, duration_weeks, days_per_week)",
        )
        .eq("athlete_id", userId!)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as AssignmentWithProgram[];
    },
  });

  const activeAssignment = activeProgramAssignment(assignments.data);

  const workout = useQuery<TodayWorkoutData>({
    queryKey: ["today-workout", userId, activeAssignment?.id],
    enabled: !!userId && !!activeAssignment?.program_id,
    queryFn: async () => {
      const programId = activeAssignment!.program_id!;
      const { data: dayRows, error: dayError } = await supabase
        .from("physique_program_days")
        .select("*")
        .eq("program_id", programId)
        .order("day_number", { ascending: true });
      if (dayError) throw dayError;
      const days = (dayRows ?? []) as ProgramDay[];

      const today = programDayForDate(days, activeAssignment!);
      const dayIds = days.map((day) => day.id);
      const { data: blockRows, error: blockError } = await supabase
        .from("physique_program_blocks")
        .select("*")
        .in("day_id", dayIds)
        .order("order_index", { ascending: true });
      if (blockError) throw blockError;
      const blocks = (blockRows ?? []) as ProgramBlock[];

      const exerciseIds = blocks
        .map((block) => block.exercise_id)
        .filter((id): id is string => id !== null);
      const { data: exerciseRows, error: exerciseError } = await supabase
        .from("physique_exercise_library")
        .select("*")
        .in("id", exerciseIds);
      if (exerciseError) throw exerciseError;
      const exerciseMap = Object.fromEntries(
        ((exerciseRows ?? []) as ExerciseLibrary[]).map((exercise) => [exercise.id, exercise]),
      );

      const { data: logRows, error: logError } = await supabase
        .from("physique_workout_logs")
        .select("*")
        .eq("athlete_id", userId!)
        .in("day_id", dayIds)
        .order("logged_at", { ascending: false });
      if (logError) throw logError;
      const todayKey = localDateKey();
      const logs = ((logRows ?? []) as WorkoutLog[]).filter(
        (log) => dateKeyFromIso(log.logged_at) === todayKey,
      );

      const exercises = workoutExercisesForDay(blocks, today, logs, exerciseMap);
      return {
        day: today,
        restDay: isRestDay(today, blocks),
        exercises,
        logs,
      };
    },
  });

  const progress = workoutProgress(workout.data?.exercises ?? []);
  const selectedExercise =
    workout.data?.exercises.find((exercise) => exercise.block.id === selectedExerciseId) ?? null;

  const saveSet = useMutation({
    mutationFn: async ({
      exercise,
      values,
    }: {
      exercise: WorkoutExerciseView;
      values: SetLogValues;
    }) => {
      if (!userId || !activeAssignment?.program_id || !workout.data?.day) return;
      const existingLog = exercise.logs.find(
        (log) =>
          log.exercise_id === exercise.block.exercise_id &&
          log.set_number === values.setNumber,
      );
      const videoPath = values.videoUrl ? ownedPhysiqueMediaPath(values.videoUrl, "physique-videos", userId, import.meta.env.VITE_SUPABASE_URL) : null;
      if (values.videoUrl && !videoPath) throw new Error("Use your own private workout video from Physique storage.");
      const payload = {
        athlete_id: userId,
        program_id: activeAssignment.program_id,
        day_id: workout.data.day.id,
        exercise_id: exercise.block.exercise_id,
        exercise_name: exercise.block.exercise_name,
        set_number: values.setNumber,
        weight_kg: values.weightKg,
        reps: values.reps,
        rpe: values.rpe,
        notes: values.notes,
        video_url: videoPath,
      };
      if (existingLog) {
        const { error } = await supabase
          .from("physique_workout_logs")
          .update({
            weight_kg: values.weightKg,
            reps: values.reps,
            rpe: values.rpe,
            notes: values.notes,
            video_url: videoPath,
          })
          .eq("id", existingLog.id).eq("athlete_id", userId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("physique_workout_logs").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      setSaveError(null);
      void queryClient.invalidateQueries({
        queryKey: ["today-workout", userId, activeAssignment?.id],
      });
      void queryClient.invalidateQueries({ queryKey: ["athlete-workouts", userId] });
    },
    onError: (error: unknown) => {
      setSaveError(error instanceof Error ? error.message : "Could not save the set. Please try again.");
    },
  });

  if (profileLoading) return <LoadingState />;
  if (!profile) return <Navigate to="/onboard" replace />;

  const exerciseList: WorkoutExerciseView[] = workout.data?.exercises ?? [];
  const nextExercise = exerciseList.find((exercise: WorkoutExerciseView) => exercise.status !== "COMPLETED") ?? null;
  const dayLabel = workout.data?.day
    ? workout.data.day.name ?? `Day ${workout.data.day.day_number}`
    : null;

  return (
    <div className="ada-stagger space-y-8 sm:space-y-10">
      <Link
        to="/app/athlete"
        className="inline-flex items-center gap-1.5 text-sm text-ada-muted transition-colors hover:text-ada-text"
      >
        <Icon name="chevron" size={16} className="rotate-180" />
        Back to dashboard
      </Link>

      <PageHeader
        eyebrow="Today's workout · تمرين اليوم"
        title={dayLabel ?? activeAssignment?.program?.name ?? "Today's workout"}
        subtitle={activeAssignment?.program?.name ?? "No active training program"}
      />

      {assignments.isLoading || workout.isLoading ? (
        <LoadingState label="Loading today's workout · جارٍ التحميل" />
      ) : assignments.isError || workout.isError ? (
        <ErrorState message="Could not load today's workout." />
      ) : !activeAssignment?.program ? (
        <EmptyState
          title="No training program assigned · لا يوجد برنامج تدريبي معيّن"
          description="Your coach will assign your training program."
          icon={<Icon name="dumbbell" size={20} />}
        />
      ) : workout.data?.restDay ? (
        <Card glow className="sm:p-8">
          <SectionTitle hint={<Badge tone="success">Rest</Badge>}>Rest day · يوم راحة</SectionTitle>
          <p className="text-sm text-ada-text-2">
            Today is scheduled as a rest or cardio day. No lifting checklist is required.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:gap-8">
          {/* ── Exercise checklist ── */}
          <div className="min-w-0">
            <SectionTitle hint="Tap an exercise to log sets">Exercise checklist · قائمة التمارين</SectionTitle>
            {exerciseList.length ? (
              <ul className="space-y-3">
                {exerciseList.map((exercise: WorkoutExerciseView, index: number) => {
                  const meta = statusMeta(exercise.status);
                  const last = lastPerformedSummary(exercise.logs);
                  const complete = exercise.status === "COMPLETED";
                  const selected = selectedExerciseId === exercise.block.id;
                  const segments = Math.max(1, Number(exercise.prescribedSets) || 0);
                  return (
                    <li key={exercise.block.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedExerciseId(exercise.block.id)}
                        aria-pressed={selected}
                        className={[
                          "group relative w-full overflow-hidden rounded-[var(--radius-card)] p-4 text-left transition-all duration-300 ease-[var(--ease-premium)] sm:p-5",
                          selected
                            ? "ada-glass shadow-[var(--shadow-teal)]"
                            : "ada-inset hover:-translate-y-0.5 hover:bg-white/[0.045]",
                        ].join(" ")}
                      >
                        {selected ? (
                          <span aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_0%_0%,rgba(0,220,200,0.10),transparent)]" />
                        ) : null}
                        <div className="relative flex items-center gap-4">
                          <span
                            className={[
                              "grid h-11 w-11 shrink-0 place-items-center rounded-2xl font-mono-num text-sm font-semibold transition-colors",
                              complete
                                ? "bg-ada-success/15 text-ada-success"
                                : selected
                                  ? "bg-ada-teal text-ada-navy"
                                  : "bg-white/[0.05] text-ada-text-2",
                            ].join(" ")}
                          >
                            {complete ? <Icon name="check" size={18} /> : String(index + 1).padStart(2, "0")}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className={`truncate font-semibold ${complete ? "text-ada-text-2" : "text-ada-text"}`}>
                              {exercise.exercise?.name ?? exercise.block.exercise_name}
                            </div>
                            {exercise.exercise?.name_ar ? (
                              <div className="truncate text-sm text-ada-teal" dir="rtl">
                                {exercise.exercise.name_ar}
                              </div>
                            ) : null}
                            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 font-mono-num text-xs text-ada-muted">
                              <span className="text-ada-text-2">
                                {exercise.prescribedSets} × {exercise.block.reps ?? "—"}
                              </span>
                              {exercise.block.rpe != null ? <span>RPE {exercise.block.rpe}</span> : null}
                              {exercise.block.rest_seconds != null ? <span>Rest {exercise.block.rest_seconds}s</span> : null}
                              {last ? <span className="font-sans">Last: {last}</span> : null}
                            </div>
                          </div>
                          <div className="hidden shrink-0 flex-col items-end gap-2 sm:flex">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${meta.pill}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                              {meta.label}
                            </span>
                            <span className="font-mono-num text-sm text-ada-text">
                              {exercise.completedSets}/{exercise.prescribedSets}
                            </span>
                          </div>
                          <Icon name="chevron" size={18} className="shrink-0 text-ada-muted transition-transform group-hover:translate-x-0.5" />
                        </div>
                        {/* set progress segments */}
                        <div className="relative mt-4 flex gap-1.5">
                          {Array.from({ length: segments }).map((_, i) => (
                            <span
                              key={i}
                              className={[
                                "h-1.5 flex-1 rounded-full transition-colors duration-500",
                                i < Number(exercise.completedSets)
                                  ? complete
                                    ? "bg-ada-success"
                                    : "bg-ada-teal shadow-[0_0_10px_rgba(0,220,200,0.45)]"
                                  : "bg-white/10",
                              ].join(" ")}
                            />
                          ))}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState title="No exercises today · لا توجد تمارين اليوم" icon={<Icon name="layers" size={20} />} />
            )}

            {saveError ? <div className="mt-4"><ErrorState message={saveError} /></div> : null}

            {selectedExercise ? (
              <div className="mt-6 animate-rise">
                <ExerciseDetail
                  block={selectedExercise.block}
                  exercise={selectedExercise.exercise}
                  onClose={() => setSelectedExerciseId(null)}
                >
                  <SetLogForm
                    block={selectedExercise.block}
                    logs={selectedExercise.logs}
                    saving={saveSet.isPending}
                    onSave={(values: SetLogValues) =>
                      saveSet.mutateAsync({ exercise: selectedExercise, values }).then((result) => {
                        restTimer.start(
                          selectedExercise.block.rest_seconds,
                          selectedExercise.exercise?.name ?? selectedExercise.block.exercise_name,
                        );
                        return result;
                      })
                    }
                  />
                </ExerciseDetail>
              </div>
            ) : null}
          </div>

          {/* ── Session rail ── */}
          <aside className="order-first lg:order-none">
            <div className="space-y-4 lg:sticky lg:top-10">
              <Card glow className="flex items-center gap-5 lg:flex-col lg:items-stretch lg:gap-6 lg:p-7">
                <ProgressRing value={Number(progress.percent) || 0} size={104} stroke={8}>
                  <span className="font-mono-num text-xl font-semibold text-ada-text">{progress.percent}%</span>
                </ProgressRing>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="ada-eyebrow">Workout progress · تقدم التمرين</span>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-xs text-ada-muted">Exercises</span>
                    <span className="font-mono-num text-sm font-semibold text-ada-text">
                      {progress.completed} / {progress.total}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-xs text-ada-muted">Status</span>
                    <Badge tone={progress.status === "COMPLETED" ? "success" : "teal"}>
                      {String(progress.status).replace(/_/g, " ")}
                    </Badge>
                  </div>
                  {progress.status === "COMPLETED" ? (
                    <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-ada-success">
                      <Icon name="check" size={15} /> Workout complete · اكتمل التمرين
                    </p>
                  ) : null}
                </div>
              </Card>

              {restTimer.rest ? (
                <div className="ada-glass flex animate-rise items-center gap-4 rounded-[var(--radius-card)] p-4">
                  <ProgressRing value={(restTimer.left / restTimer.rest.total) * 100} size={56} stroke={4} color="#5CC8FF">
                    <Icon name="timer" size={17} className="text-ada-info" />
                  </ProgressRing>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs text-ada-muted">Rest · {restTimer.rest.label}</div>
                    <div className="font-mono-num text-2xl text-ada-text">{fmtClock(restTimer.left)}</div>
                  </div>
                  <button
                    type="button"
                    onClick={restTimer.skip}
                    className="ada-hairline rounded-full bg-white/[0.04] px-4 py-2 text-xs font-medium text-ada-text transition-colors hover:bg-white/[0.08]"
                  >
                    Skip
                  </button>
                </div>
              ) : null}

              {exerciseList.length ? (
                <div className="hidden space-y-1 lg:block">
                  {exerciseList.map((exercise: WorkoutExerciseView) => {
                    const meta = statusMeta(exercise.status);
                    return (
                      <button
                        key={exercise.block.id}
                        type="button"
                        onClick={() => setSelectedExerciseId(exercise.block.id)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                          selectedExerciseId === exercise.block.id ? "bg-white/[0.06] text-ada-text" : "text-ada-muted hover:text-ada-text"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${meta.dot}`} />
                        <span className="flex-1 truncate">{exercise.exercise?.name ?? exercise.block.exercise_name}</span>
                        <span className="font-mono-num">{exercise.completedSets}/{exercise.prescribedSets}</span>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </aside>

          {/* ── Mobile: one obvious next step ── */}
          {nextExercise && selectedExerciseId !== nextExercise.block.id ? (
            <div className="fixed inset-x-4 bottom-[calc(max(env(safe-area-inset-bottom),0.75rem)+5.5rem)] z-30 animate-rise md:hidden">
              <button
                type="button"
                onClick={() => setSelectedExerciseId(nextExercise.block.id)}
                className="ada-gradient flex w-full items-center justify-center gap-2 rounded-full px-5 py-4 text-sm font-semibold text-ada-navy shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_10px_30px_-10px_rgba(0,220,200,0.6)]"
              >
                <Icon name="play" size={14} />
                <span className="truncate">Continue · {nextExercise.exercise?.name ?? nextExercise.block.exercise_name}</span>
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
