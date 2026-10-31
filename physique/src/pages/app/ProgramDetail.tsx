import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { useAthleteProfile } from "../../hooks/useProfile";
import { Badge, Button, Card, EmptyState, ErrorState, LoadingState, SectionTitle } from "../../components/ui";
import { ExerciseDetail } from "../../components/ExerciseDetail";
import type { ProgramBlockWithExercise, ProgramDay, ExerciseLibrary } from "../../lib/types";

interface DayWithBlocks {
  day: ProgramDay;
  blocks: ProgramBlockWithExercise[];
}

export function ProgramDetail() {
  const { programId } = useParams<{ programId: string }>();
  
  const { data: profile, isLoading: profileLoading } = useAthleteProfile();
  const [selectedBlock, setSelectedBlock] = useState<ProgramBlockWithExercise | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseLibrary | null>(null);

  const program = useQuery({
    queryKey: ["program-detail", programId],
    enabled: !!programId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("physique_programs")
        .select("*")
        .eq("id", programId!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const days = useQuery<DayWithBlocks[]>({
    queryKey: ["program-days-blocks", programId],
    enabled: !!programId,
    queryFn: async () => {
      // Fetch days
      const { data: dayRows, error: dayErr } = await supabase
        .from("physique_program_days")
        .select("*")
        .eq("program_id", programId!)
        .order("day_number", { ascending: true });
      if (dayErr) throw dayErr;

      if (!dayRows?.length) return [];

      // Fetch blocks for all days
      const dayIds = dayRows.map((d) => d.id);
      const { data: blockRows, error: blockErr } = await supabase
        .from("physique_program_blocks")
        .select("*")
        .in("day_id", dayIds)
        .order("order_index", { ascending: true });
      if (blockErr) throw blockErr;

      // Fetch exercise library entries for blocks with exercise_id
      const exerciseIds = (blockRows ?? [])
        .map((b) => b.exercise_id)
        .filter((id): id is string => id !== null);

      let exerciseMap: Record<string, ExerciseLibrary> = {};
      if (exerciseIds.length) {
        const { data: exerciseRows, error: exErr } = await supabase
          .from("physique_exercise_library")
          .select("*")
          .in("id", exerciseIds);
        if (!exErr && exerciseRows) {
          exerciseMap = Object.fromEntries(exerciseRows.map((e) => [e.id, e]));
        }
      }

      // Group blocks by day
      return dayRows.map((day) => ({
        day: day as ProgramDay,
        blocks: (blockRows ?? [])
          .filter((b) => b.day_id === day.id)
          .map((b) => ({
            ...b,
            exercise: b.exercise_id ? exerciseMap[b.exercise_id] ?? null : null,
          })) as ProgramBlockWithExercise[],
      }));
    },
  });

  if (profileLoading) return <LoadingState />;
  if (!profile) return <Navigate to="/onboard" replace />;

  if (program.isLoading || days.isLoading) return <LoadingState label="Loading training program · جارٍ التحميل" />;
  if (program.isError) return <ErrorState message="Could not load the training program. Please try again." />;
  if (!program.data) return <EmptyState title="Training program not found · البرنامج غير موجود" icon="..." />;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <a
        href="/app/athlete"
        className="inline-flex items-center gap-1 text-sm text-ada-muted hover:text-ada-text"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to dashboard
      </a>

      {/* Program header */}
      <div>
        <h1 className="text-2xl font-bold text-ada-text">{program.data.name}</h1>
        <p className="mt-1 text-sm text-ada-muted">
          {program.data.goal ?? "-"} · {program.data.duration_weeks ?? "-"} weeks ·{" "}
          {program.data.days_per_week ?? "-"} days/week
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={program.data.status === "active" ? "success" : program.data.status === "draft" ? "teal" : "neutral"}>
          {program.data.status.toUpperCase()}
        </Badge>
        {program.data.is_template ? <Badge>DRAFT TEMPLATE</Badge> : null}
        <Link to={`/app/program-builder/${program.data.id}`}>
          <Button variant="ghost">Edit program</Button>
        </Link>
        <Link to={`/app/programs?assign=${program.data.id}`}>
          <Button variant="subtle">Assign program</Button>
        </Link>
      </div>

      <Link
        to="/app/workout"
        className="block rounded-lg border border-ada-teal/20 bg-ada-teal/5 p-4 transition hover:border-ada-teal/40"
      >
        <div className="font-semibold text-ada-text">Today's workout</div>
        <p className="mt-1 text-sm text-ada-muted">
          Log your sets and track exercise completion.
        </p>
        <span className="mt-2 inline-block text-xs text-ada-teal">Start workout →</span>
      </Link>

      {/* Days */}
      {days.data?.length ? (
        <div className="space-y-4">
          {days.data.map(({ day, blocks }) => (
            <Card key={day.id}>
              <SectionTitle hint={<Badge tone="teal">Day {day.day_number}</Badge>}>
                {day.name ?? `Day ${day.day_number}`}
              </SectionTitle>
              {day.focus ? (
                <p className="mb-3 text-xs text-ada-muted capitalize">
                  Focus: {day.focus.replace(/_/g, " ")}
                </p>
              ) : null}

              {blocks.length ? (
                <ul className="divide-y divide-white/5">
                  {blocks.map((block) => {
                    const hasDetails = block.exercise !== null;
                    const missingContent =
                      hasDetails &&
                      (!block.exercise!.instructions ||
                       !block.exercise!.image_url ||
                       !block.exercise!.video_demo_url ||
                       !block.exercise!.common_mistakes ||
                       !block.exercise!.coach_note);

                    return (
                      <li key={block.id}>
                        <button
                          onClick={() => {
                            setSelectedBlock(block);
                            setSelectedExercise(block.exercise);
                          }}
                          className="flex w-full items-center justify-between gap-3 py-3 text-left hover:bg-white/5 -mx-2 px-2 rounded-lg transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-ada-text">
                              {block.exercise_name}
                            </div>
                            {block.exercise?.name_ar ? (
                              <div className="text-sm text-ada-teal" dir="rtl">
                                {block.exercise.name_ar}
                              </div>
                            ) : null}
                            {missingContent ? (
                              <span className="text-xs text-amber-400/70">
                                Coach content coming soon
                              </span>
                            ) : null}
                          </div>
                          <div className="text-right font-mono-num text-sm text-ada-muted">
                            <div>{block.sets ?? "-"} × {block.reps ?? "-"}</div>
                            {block.rest_seconds ? (
                              <div className="text-xs">{block.rest_seconds}s rest</div>
                            ) : null}
                          </div>
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="shrink-0 text-ada-muted"
                          >
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-ada-muted">No exercises assigned · لا توجد تمارين معيّنة</p>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No training days · لا توجد أيام تدريب"
          description="This training program has no days configured yet."
          icon="..."
        />
      )}

      {/* Exercise detail modal */}
      {selectedBlock ? (
        <ExerciseDetail
          block={selectedBlock}
          exercise={selectedExercise}
          onClose={() => {
            setSelectedBlock(null);
            setSelectedExercise(null);
          }}
        />
      ) : null}
    </div>
  );
}
