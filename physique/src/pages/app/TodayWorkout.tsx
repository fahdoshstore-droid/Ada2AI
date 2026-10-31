import { ownedPhysiqueMediaPath } from "../../lib/physiqueMedia";
import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { useAthleteProfile } from "../../hooks/useProfile";
import { Badge, Card, EmptyState, ErrorState, LoadingState, SectionTitle } from "../../components/ui";
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

const STATUS_META: Record<string, { icon: string; className: string }> = {
  NOT_STARTED: { icon: "☐", className: "text-ada-muted" },
  IN_PROGRESS: { icon: "◐", className: "text-ada-amber" },
  COMPLETED: { icon: "✅", className: "text-ada-success" },
  MISSED: { icon: "🔴", className: "text-ada-red" },
};

export function TodayWorkout() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const { data: profile, isLoading: profileLoading } = useAthleteProfile();
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

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

  return (
    <div className="space-y-6">
      <Link
        to="/app/athlete"
        className="inline-flex items-center gap-1 text-sm text-ada-muted hover:text-ada-text"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Today's workout · تمرين اليوم</h1>
        <p className="mt-1 text-sm text-ada-muted">
          {activeAssignment?.program?.name ?? "No active training program"}
          {workout.data?.day ? ` · ${workout.data.day.name ?? `Day ${workout.data.day.day_number}`}` : ""}
        </p>
      </div>

      {assignments.isLoading || workout.isLoading ? (
        <LoadingState label="Loading today's workout · جارٍ التحميل" />
      ) : assignments.isError || workout.isError ? (
        <ErrorState message="Could not load today's workout." />
      ) : !activeAssignment?.program ? (
        <EmptyState
          title="No training program assigned · لا يوجد برنامج تدريبي معيّن"
          description="Your coach will assign your training program."
          icon="🏋️"
        />
      ) : workout.data?.restDay ? (
        <Card>
          <SectionTitle hint={<Badge tone="success">Rest</Badge>}>Rest day · يوم راحة</SectionTitle>
          <p className="text-sm text-ada-muted">
            Today is scheduled as a rest or cardio day. No lifting checklist is required.
          </p>
        </Card>
      ) : (
        <>
          <Card>
            <SectionTitle
              hint={
                <Badge tone={progress.status === "COMPLETED" ? "success" : "teal"}>
                  {progress.status.replace(/_/g, " ")}
                </Badge>
              }
            >
              Workout progress · تقدم التمرين
            </SectionTitle>
            <div className="flex items-end justify-between gap-3">
              <div className="font-mono-num text-3xl font-bold text-ada-text">
                {progress.completed} / {progress.total}
              </div>
              <div className="text-sm text-ada-muted">{progress.percent}%</div>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-ada-surface">
              <div
                className="h-full rounded-full bg-ada-teal transition-all"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            {progress.status === "COMPLETED" ? (
              <p className="mt-3 text-sm font-semibold text-ada-success">
                Workout complete · اكتمل التمرين
              </p>
            ) : null}
          </Card>

          <Card>
            <SectionTitle hint="Tap an exercise to log sets">Exercise checklist · قائمة التمارين</SectionTitle>
            {workout.data?.exercises.length ? (
              <ul className="divide-y divide-white/5">
                {workout.data.exercises.map((exercise) => {
                  const status = STATUS_META[exercise.status];
                  const last = lastPerformedSummary(exercise.logs);
                  return (
                    <li key={exercise.block.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedExerciseId(exercise.block.id)}
                        className="-mx-2 flex w-full items-start justify-between gap-3 rounded-lg px-2 py-3 text-left transition hover:bg-white/5"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xl ${status.className}`}>{status.icon}</span>
                            <div className="min-w-0">
                              <div className="truncate font-semibold text-ada-text">
                                {exercise.exercise?.name ?? exercise.block.exercise_name}
                              </div>
                              {exercise.exercise?.name_ar ? (
                                <div className="truncate text-sm text-ada-teal" dir="rtl">
                                  {exercise.exercise.name_ar}
                                </div>
                              ) : null}
                            </div>
                          </div>
                          <div className="mt-1 text-xs text-ada-muted">
                            {exercise.prescribedSets} sets · {exercise.block.reps ?? "—"}
                            {last ? ` · Last: ${last}` : ""}
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="font-mono-num text-sm text-ada-text">
                            {exercise.completedSets}/{exercise.prescribedSets}
                          </div>
                          <div className="text-xs text-ada-muted">
                            {exercise.status.replace(/_/g, " ")}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState title="No exercises today · لا توجد تمارين اليوم" icon="📋" />
            )}
          </Card>

          {saveError ? <ErrorState message={saveError} /> : null}

          {selectedExercise ? (
            <ExerciseDetail
              block={selectedExercise.block}
              exercise={selectedExercise.exercise}
              onClose={() => setSelectedExerciseId(null)}
            >
              <SetLogForm
                block={selectedExercise.block}
                logs={selectedExercise.logs}
                saving={saveSet.isPending}
                onSave={(values) =>
                  saveSet.mutateAsync({ exercise: selectedExercise, values })
                }
              />
            </ExerciseDetail>
          ) : null}
        </>
      )}
    </div>
  );
}
