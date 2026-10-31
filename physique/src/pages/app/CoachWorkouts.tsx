import { PhysiqueWorkoutVideo } from "../../components/PhysiqueWorkoutVideo";
import { Icon } from "../../components/Icon";
import { HeroBanner } from "../../components/Media";
import { useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { useCoachProfile } from "../../hooks/useProfile";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  SectionTitle,
} from "../../components/ui";
import {
  activeProgramAssignment,
  dateKeyFromIso,
  lastPerformedSummary,
  latestWorkoutContext,
  localDateKey,
  workoutExercisesForDay,
  workoutProgress,
  workoutStatusForAthlete,
  type WorkoutExerciseView,
} from "../../lib/workout";
import { exerciseVisualPath } from "../../lib/exerciseVisuals";
import type {
  Assignment,
  CoachAthlete,
  ExerciseLibrary,
  ProgramBlock,
  ProgramDay,
  WorkoutLog,
} from "../../lib/types";

interface RosterRow extends CoachAthlete {
  athlete: {
    display_name: string | null;
    goal: string | null;
    competition_category: string | null;
    experience_level: string | null;
  } | null;
}

interface AssignmentWithProgram extends Assignment {
  program: {
    id: string;
    name: string;
    goal: string | null;
    duration_weeks: number | null;
    days_per_week: number | null;
  } | null;
}

interface AthleteWorkoutSummary {
  athleteId: string;
  athleteName: string;
  assignmentId: string | null;
  programId: string | null;
  programName: string;
  dayName: string;
  dateKey: string;
  progress: ReturnType<typeof workoutProgress>;
  lastActivity: string | null;
  exercises: WorkoutExerciseView[];
}

const STATUS_META: Record<string, { icon: string; tone: "neutral" | "teal" | "amber" | "success" }> = {
  NOT_STARTED: { icon: "⚪", tone: "neutral" },
  IN_PROGRESS: { icon: "🟡", tone: "amber" },
  COMPLETED: { icon: "🟢", tone: "success" },
  MISSED: { icon: "🔴", tone: "neutral" },
};

function relativeTime(iso: string | null): string {
  if (!iso) return "No activity";
  const then = new Date(iso).getTime();
  const minutes = Math.max(0, Math.round((Date.now() - then) / 60_000));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  return `${days} d ago`;
}

export function CoachWorkouts() {
  const { userId } = useAuth();
  const { data: profile, isLoading: profileLoading } = useCoachProfile();
  const queryClient = useQueryClient();
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [assignProgramId, setAssignProgramId] = useState("");
  const [scheduleDate, setScheduleDate] = useState(localDateKey());
  const [actionError, setActionError] = useState<string | null>(null);

  const roster = useQuery<RosterRow[]>({
    queryKey: ["coach-roster", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("physique_coach_athletes")
        .select(
          "*, athlete:physique_athletes(display_name, goal, competition_category, experience_level)",
        )
        .eq("coach_id", userId!)
        .eq("status", "active")
        .order("started_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as RosterRow[];
    },
  });

  const athleteIds = useMemo(
    () => (roster.data ?? []).map((row) => row.athlete_id),
    [roster.data],
  );

  const assignments = useQuery<AssignmentWithProgram[]>({
    queryKey: ["coach-workout-assignments", userId, athleteIds],
    enabled: athleteIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("physique_assignments")
        .select(
          "*, program:physique_programs(id, name, goal, duration_weeks, days_per_week)",
        )
        .in("athlete_id", athleteIds)
        .eq("assignment_type", "program")
        .eq("is_active", true);
      if (error) throw error;
      return (data ?? []) as unknown as AssignmentWithProgram[];
    },
  });

  const workoutData = useQuery({
    queryKey: ["coach-workout-data", userId, athleteIds, assignments.data],
    enabled: athleteIds.length > 0 && !!assignments.data,
    queryFn: async () => {
      const activeAssignments = (assignments.data ?? []).filter((assignment) => assignment.program_id);
      const programIds = [...new Set(activeAssignments.map((assignment) => assignment.program_id!))];
      if (!programIds.length) {
        return { days: [] as ProgramDay[], blocks: [] as ProgramBlock[], exercises: [] as ExerciseLibrary[], logs: [] as WorkoutLog[] };
      }

      const { data: dayRows, error: dayError } = await supabase
        .from("physique_program_days")
        .select("*")
        .in("program_id", programIds)
        .order("day_number", { ascending: true });
      if (dayError) throw dayError;
      const days = (dayRows ?? []) as ProgramDay[];

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
      const exercises = (exerciseRows ?? []) as ExerciseLibrary[];

      const { data: logRows, error: logError } = await supabase
        .from("physique_workout_logs")
        .select("*")
        .in("athlete_id", athleteIds)
        .in("day_id", dayIds)
        .order("logged_at", { ascending: false });
      if (logError) throw logError;
      const logs = (logRows ?? []) as WorkoutLog[];

      return { days, blocks, exercises, logs };
    },
  });

  const programs = useQuery({
    queryKey: ["coach-workout-programs", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("physique_programs")
        .select("id, name, status, days_per_week")
        .eq("created_by", userId!)
        .neq("status", "archived")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const summaries = useMemo<AthleteWorkoutSummary[]>(() => {
    const exerciseMap = Object.fromEntries(
      (workoutData.data?.exercises ?? []).map((exercise) => [exercise.id, exercise]),
    );
    const todayKey = localDateKey();
    return (roster.data ?? []).map((row) => {
      const assignment = activeProgramAssignment(
        (assignments.data ?? []).filter((item) => item.athlete_id === row.athlete_id),
      );
      const programDays = (workoutData.data?.days ?? []).filter(
        (day) => day.program_id === assignment?.program_id,
      );
      const blocks = (workoutData.data?.blocks ?? []).filter((block) =>
        programDays.some((day) => day.id === block.day_id),
      );
      const context = assignment
        ? latestWorkoutContext(programDays, blocks, assignment)
        : null;
      const athleteLogs = (workoutData.data?.logs ?? []).filter(
        (log) => log.athlete_id === row.athlete_id,
      );
      const workoutLogs = context
        ? athleteLogs.filter((log) => log.day_id === context.day.id && dateKeyFromIso(log.logged_at) === context.dateKey)
        : [];
      const exercises = context
        ? workoutExercisesForDay(blocks, context.day, workoutLogs, exerciseMap)
        : [];
      const progress = workoutStatusForAthlete({
        exercises,
        latestWorkoutDateKey: context?.dateKey ?? null,
        todayKey,
        hasLogs: workoutLogs.length > 0,
      });
      const latestLog = athleteLogs[0] ?? null;
      return {
        athleteId: row.athlete_id,
        athleteName: row.athlete?.display_name ?? "Unnamed athlete",
        assignmentId: assignment?.id ?? null,
        programId: assignment?.program_id ?? null,
        programName: assignment?.program?.name ?? "No active program",
        dayName: context?.day.name ?? `Day ${context?.day.day_number ?? "—"}`,
        dateKey: context?.dateKey ?? todayKey,
        progress,
        lastActivity: latestLog?.logged_at ?? null,
        exercises,
      };
    });
  }, [assignments.data, roster.data, workoutData.data]);

  const selected = summaries.find((summary) => summary.athleteId === selectedAthleteId) ?? null;

  const assignProgram = useMutation({
    mutationFn: async () => {
      if (!userId || !selected || !assignProgramId) throw new Error("Select a program and athlete first.");
      const { data: existing, error: existingError } = await supabase
        .from("physique_assignments")
        .select("id")
        .eq("athlete_id", selected.athleteId)
        .eq("assignment_type", "program")
        .eq("is_active", true);
      if (existingError) throw existingError;
      if (existing?.length) {
        const { error } = await supabase
          .from("physique_assignments")
          .update({ is_active: false, ends_on: scheduleDate })
          .in("id", existing.map((row) => row.id));
        if (error) throw error;
      }
      const { error } = await supabase.from("physique_assignments").insert({
        coach_id: userId,
        athlete_id: selected.athleteId,
        assignment_type: "program",
        program_id: assignProgramId,
        starts_on: scheduleDate,
        is_active: true,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      setActionError(null);
      setAssignProgramId("");
      await queryClient.invalidateQueries({ queryKey: ["coach-workout-assignments", userId, athleteIds] });
      await queryClient.invalidateQueries({ queryKey: ["athlete-assignments", selected?.athleteId] });
    },
    onError: (error: Error) => setActionError(error.message),
  });

  const reschedule = useMutation({
    mutationFn: async () => {
      if (!selected?.assignmentId) throw new Error("No active program assignment to reschedule.");
      const { error } = await supabase
        .from("physique_assignments")
        .update({ starts_on: scheduleDate })
        .eq("id", selected.assignmentId);
      if (error) throw error;
    },
    onSuccess: async () => {
      setActionError(null);
      await queryClient.invalidateQueries({ queryKey: ["coach-workout-assignments", userId, athleteIds] });
      await queryClient.invalidateQueries({ queryKey: ["athlete-assignments", selected?.athleteId] });
    },
    onError: (error: Error) => setActionError(error.message),
  });

  if (profileLoading) return <LoadingState />;
  if (!profile) return <Navigate to="/onboard" replace />;

  return (
    <div className="ada-stagger space-y-8 sm:space-y-10">
      <Link
        to="/app/coach"
        className="inline-flex items-center gap-1.5 text-sm text-ada-muted transition-colors hover:text-ada-text"
      >
        <Icon name="chevron" size={16} className="rotate-180" />
        Back to dashboard
      </Link>

      <HeroBanner photo="squat-tracking" alt="Athlete squatting with joint-angle tracking overlay" position="60% 10%">
        <PageHeader
          eyebrow="Coach · Workouts"
          title="Athlete workouts · تمارين المتدربين"
          subtitle="Track completion, actual performance, and execution quality for assigned athletes."
        />
      </HeroBanner>

      {roster.isLoading || assignments.isLoading || workoutData.isLoading ? (
        <LoadingState label="Loading athlete workouts · جارٍ التحميل" />
      ) : roster.isError || assignments.isError || workoutData.isError ? (
        <ErrorState message="Could not load athlete workouts. Please try again." />
      ) : !roster.data?.length ? (
        <EmptyState
          title="No assigned athletes · لا يوجد متدربون معيّنون"
          description="Assign athletes from the coach dashboard to track their workouts."
          icon={<Icon name="users" size={20} />}
        />
      ) : (
        <>
          <Card>
            <SectionTitle hint="Assigned athletes only">Workout status · حالة التمارين</SectionTitle>
            <ul className="divide-y divide-white/[0.05]">
              {summaries.map((summary) => {
                const meta = STATUS_META[summary.progress.status] ?? STATUS_META.NOT_STARTED;
                return (
                  <li key={summary.athleteId}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAthleteId(summary.athleteId);
                        setExpandedExerciseId(null);
                      }}
                      className="-mx-2 flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-3.5 text-left transition-all duration-300 hover:bg-white/[0.045]"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-ada-text">{summary.athleteName}</div>
                        <div className="truncate text-xs text-ada-muted">
                          {summary.programName} · {summary.dayName} ·{" "}
                          {summary.progress.completed}/{summary.progress.total} ·{" "}
                          {summary.progress.percent}%
                        </div>
                        <div className="text-xs text-ada-muted">
                          Last activity: {relativeTime(summary.lastActivity)}
                        </div>
                      </div>
                      <Badge tone={meta.tone}>
                        {meta.icon} {summary.progress.status.replace(/_/g, " ")}
                      </Badge>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>

          {selected ? (
            <Card>
              <SectionTitle
                hint={
                  <Badge
                    tone={
                      selected.progress.status === "COMPLETED"
                        ? "success"
                        : selected.progress.status === "IN_PROGRESS"
                          ? "amber"
                          : "neutral"
                    }
                  >
                    {selected.progress.status.replace(/_/g, " ")}
                  </Badge>
                }
              >
                {selected.athleteName} · {selected.dayName}
              </SectionTitle>

              <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-ada-muted">Workout · التمرين</div>
                  <div className="font-semibold text-ada-text">{selected.programName}</div>
                </div>
                <div>
                  <div className="text-xs text-ada-muted">Date</div>
                  <div className="font-semibold text-ada-text">{selected.dateKey}</div>
                </div>
                <div>
                  <div className="text-xs text-ada-muted">Progress</div>
                  <div className="font-semibold text-ada-text">
                    {selected.progress.completed}/{selected.progress.total} ·{" "}
                    {selected.progress.percent}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-ada-muted">Status</div>
                  <div className="font-semibold text-ada-text">
                    {selected.progress.status.replace(/_/g, " ")}
                  </div>
                </div>
              </div>

              <div className="mb-5 ada-inset rounded-2xl border border-ada-teal/15 p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-ada-text">Workout management</div>
                  {selected.programId ? (
                    <Link to={`/app/program-builder/${selected.programId}`}>
                      <Badge tone="teal">Edit program / workout</Badge>
                    </Link>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-end gap-3">
                  <label className="min-w-48 flex-1">
                    <span className="ada-label">Schedule / effective date</span>
                    <input type="date" className="ada-input" value={scheduleDate} onChange={(event) => setScheduleDate(event.target.value)} />
                  </label>
                  {selected.assignmentId ? (
                    <Button variant="ghost" loading={reschedule.isPending} onClick={() => reschedule.mutate()}>
                      Reschedule
                    </Button>
                  ) : null}
                </div>
                {!selected.assignmentId ? (
                  <div className="mt-4 flex flex-wrap items-end gap-3">
                    <label className="min-w-56 flex-1">
                      <span className="ada-label">Assign existing program</span>
                      <select className="ada-input" value={assignProgramId} onChange={(event) => setAssignProgramId(event.target.value)}>
                        <option value="">Select program</option>
                        {(programs.data ?? []).map((program) => (
                          <option key={program.id} value={program.id}>{program.name}</option>
                        ))}
                      </select>
                    </label>
                    <Button loading={assignProgram.isPending} disabled={!assignProgramId} onClick={() => assignProgram.mutate()}>
                      Assign Program
                    </Button>
                    <Link to={`/app/programs?athlete=${selected.athleteId}`} className="text-xs text-ada-teal hover:underline">Open program library</Link>
                  </div>
                ) : null}
                {actionError ? <div className="mt-3"><ErrorState message={actionError} /></div> : null}
              </div>

              <ul className="divide-y divide-white/[0.05]">
                {selected.exercises.map((exercise) => {
                  const isOpen = expandedExerciseId === exercise.block.id;
                  const statusMeta =
                    STATUS_META[exercise.status] ?? STATUS_META.NOT_STARTED;
                  return (
                    <li key={exercise.block.id}>
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedExerciseId(isOpen ? null : exercise.block.id)
                        }
                        className="-mx-2 flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-3.5 text-left transition-all duration-300 hover:bg-white/[0.045]"
                      >
                        <div className="min-w-0">
                          {(() => {
                            const visual = exerciseVisualPath(exercise.exercise?.name);
                            return visual ? (
                              <img
                                src={visual}
                                alt={`${exercise.exercise?.name ?? exercise.block.exercise_name} illustration`}
                                className="mb-2 h-20 w-full rounded-2xl object-cover ring-1 ring-white/10"
                                loading="lazy"
                              />
                            ) : null;
                          })()}
                          <div className="font-semibold text-ada-text">
                            {exercise.exercise?.name ?? exercise.block.exercise_name}
                          </div>
                          <div className="text-xs text-ada-muted">
                            Prescription: {exercise.prescribedSets} sets ·{" "}
                            {exercise.block.reps ?? "—"}
                          </div>
                          <div className="text-xs text-ada-muted">
                            Actual: {exercise.completedSets} sets
                          </div>
                        </div>
                        <Badge tone={statusMeta.tone}>
                          {statusMeta.icon} {exercise.status.replace(/_/g, " ")}
                        </Badge>
                      </button>

                      {isOpen ? (
                        <div className="mt-2 space-y-2 ada-inset rounded-2xl p-4">
                          <div className="text-sm font-semibold text-ada-text">
                            Actual performance
                          </div>
                          {exercise.logs.length ? (
                            [...exercise.logs]
                              .sort((a, b) => (a.set_number ?? 0) - (b.set_number ?? 0))
                              .map((log) => (
                                <div
                                  key={log.id}
                                  className="ada-inset rounded-2xl p-3.5 text-sm text-ada-text"
                                >
                                  <div className="font-semibold">
                                    Set {log.set_number ?? "—"}
                                  </div>
                                  <div className="mt-1 text-ada-muted">
                                    {log.weight_kg != null ? `${log.weight_kg}kg` : "—"} ×{" "}
                                    {log.reps ?? "—"}
                                    {log.rpe != null ? ` · RPE ${log.rpe}` : ""}
                                  </div>
                                  {log.notes ? (
                                    <div className="mt-1 text-xs text-ada-muted">
                                      Notes: {log.notes}
                                    </div>
                                  ) : null}
                                  <PhysiqueWorkoutVideo log={log} />
                                </div>
                              ))
                          ) : (
                            <div className="text-sm text-ada-muted">
                              No sets logged for this exercise · لا توجد مجموعات مسجلة
                            </div>
                          )}
                          <div className="text-xs text-ada-muted">
                            Last performed: {lastPerformedSummary(exercise.logs) ?? "—"}
                          </div>
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </Card>
          ) : null}
        </>
      )}
    </div>
  );
}
