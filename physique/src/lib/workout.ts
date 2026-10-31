import type {
  Assignment,
  ExerciseLibrary,
  ProgramBlock,
  ProgramDay,
  WorkoutLog,
} from "./types";

export type WorkoutExerciseStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
export type WorkoutStatus = WorkoutExerciseStatus | "MISSED";

export interface WorkoutExerciseView {
  block: ProgramBlock;
  exercise: ExerciseLibrary | null;
  logs: WorkoutLog[];
  prescribedSets: number;
  completedSets: number;
  status: WorkoutExerciseStatus;
}

export interface WorkoutProgress {
  completed: number;
  total: number;
  percent: number;
  status: WorkoutStatus;
}

export function localDateKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

export function dateKeyFromIso(iso: string): string {
  return localDateKey(new Date(iso));
}

export function activeProgramAssignment<T extends Assignment>(
  assignments: T[] | undefined,
): T | undefined {
  return assignments?.find(
    (assignment) =>
      assignment.assignment_type === "program" &&
      assignment.is_active &&
      assignment.program_id,
  );
}

function assignmentStartDate(assignment: Assignment): Date {
  return new Date(`${assignment.starts_on}T00:00:00`);
}

function daysSinceStart(assignment: Assignment, now: Date = new Date()): number {
  const start = assignmentStartDate(assignment);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = today.getTime() - start.getTime();
  return Math.max(0, Math.floor(diff / 86_400_000));
}

export function programDayForDate(
  programDays: ProgramDay[],
  assignment: Assignment,
  now: Date = new Date(),
): ProgramDay | null {
  const days = [...programDays].sort((a, b) => a.day_number - b.day_number);
  if (!days.length) return null;
  const offset = daysSinceStart(assignment, now);
  return days[offset % days.length] ?? null;
}

export function isRestDay(day: ProgramDay | null, blocks: ProgramBlock[]): boolean {
  if (!day) return true;
  return !blocks.some((block) => block.day_id === day.id);
}

export function completedSetsForExercise(
  block: ProgramBlock,
  logs: WorkoutLog[],
): number {
  const setNumbers = new Set<number>();
  for (const log of logs) {
    if (
      log.exercise_id === block.exercise_id &&
      log.set_number != null &&
      Number.isFinite(log.set_number)
    ) {
      setNumbers.add(log.set_number);
    }
  }
  return setNumbers.size;
}

export function exerciseStatus(
  block: ProgramBlock,
  logs: WorkoutLog[],
): WorkoutExerciseStatus {
  const prescribed = block.sets ?? 0;
  const completed = completedSetsForExercise(block, logs);
  if (prescribed <= 0) return completed > 0 ? "COMPLETED" : "NOT_STARTED";
  if (completed === 0) return "NOT_STARTED";
  if (completed < prescribed) return "IN_PROGRESS";
  return "COMPLETED";
}

export function workoutExercisesForDay(
  blocks: ProgramBlock[],
  day: ProgramDay | null,
  logs: WorkoutLog[],
  exerciseMap: Record<string, ExerciseLibrary>,
): WorkoutExerciseView[] {
  if (!day) return [];
  return blocks
    .filter((block) => block.day_id === day.id)
    .sort((a, b) => a.order_index - b.order_index)
    .map((block) => {
      const exerciseLogs = logs.filter((log) => log.exercise_id === block.exercise_id);
      return {
        block,
        exercise: block.exercise_id ? exerciseMap[block.exercise_id] ?? null : null,
        logs: exerciseLogs,
        prescribedSets: block.sets ?? 0,
        completedSets: completedSetsForExercise(block, exerciseLogs),
        status: exerciseStatus(block, exerciseLogs),
      };
    });
}

export function workoutProgress(
  exercises: WorkoutExerciseView[],
): WorkoutProgress {
  const total = exercises.length;
  const completed = exercises.filter((exercise) => exercise.status === "COMPLETED").length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  let status: WorkoutStatus = "NOT_STARTED";
  if (total > 0 && completed === total) status = "COMPLETED";
  else if (completed > 0 || exercises.some((exercise) => exercise.status === "IN_PROGRESS")) {
    status = "IN_PROGRESS";
  }
  return { completed, total, percent, status };
}

export function latestWorkoutContext(
  programDays: ProgramDay[],
  blocks: ProgramBlock[],
  assignment: Assignment,
  now: Date = new Date(),
): { day: ProgramDay; dateKey: string } | null {
  const days = [...programDays].sort((a, b) => a.day_number - b.day_number);
  if (!days.length) return null;
  const start = assignmentStartDate(assignment);
  let cursor = daysSinceStart(assignment, now);
  while (cursor >= 0) {
    const index = cursor % days.length;
    const day = days[index];
    if (blocks.some((block) => block.day_id === day.id)) {
      const date = new Date(start);
      date.setDate(date.getDate() + cursor);
      return { day, dateKey: localDateKey(date) };
    }
    cursor -= 1;
  }
  return null;
}

export function workoutStatusForAthlete({
  exercises,
  latestWorkoutDateKey,
  todayKey,
  hasLogs,
}: {
  exercises: WorkoutExerciseView[];
  latestWorkoutDateKey: string | null;
  todayKey: string;
  hasLogs: boolean;
}): WorkoutProgress {
  const progress = workoutProgress(exercises);
  if (
    latestWorkoutDateKey &&
    latestWorkoutDateKey < todayKey &&
    !hasLogs &&
    progress.status !== "COMPLETED"
  ) {
    return { ...progress, status: "MISSED" };
  }
  return progress;
}

export function lastPerformedSummary(logs: WorkoutLog[]): string | null {
  if (!logs.length) return null;
  const latest = [...logs].sort(
    (a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime(),
  )[0];
  if (!latest) return null;
  const parts: string[] = [];
  if (latest.weight_kg != null) parts.push(`${latest.weight_kg}kg`);
  if (latest.reps != null) parts.push(`× ${latest.reps}`);
  if (latest.rpe != null) parts.push(`RPE ${latest.rpe}`);
  return parts.join(" ");
}
