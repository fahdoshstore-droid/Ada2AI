import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { useCoachProfile } from "../../hooks/useProfile";
import { Badge, Button, Card, ErrorState, LoadingState, SectionTitle } from "../../components/ui";
import { ExercisePicker } from "../../components/ExercisePicker";
import type { ExerciseLibrary, Program, ProgramBlock, ProgramDay } from "../../lib/types";

type ProgramStatus = "draft" | "active" | "archived";

interface BuilderDay extends ProgramDay {
  blocks: ProgramBlock[];
}

const EMPTY_DAY_NAME = "Day";

export function ProgramBuilder() {
  const { programId } = useParams<{ programId: string }>();
  const isNew = programId === "new";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: profile, isLoading } = useCoachProfile();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("hypertrophy");
  const [duration, setDuration] = useState("8");
  const [daysPerWeek, setDaysPerWeek] = useState("3");
  const [isTemplate, setIsTemplate] = useState(true);
  const [days, setDays] = useState<BuilderDay[]>([]);
  const [pickerDayId, setPickerDayId] = useState<string | null>(null);
  const [removedBlockIds, setRemovedBlockIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const program = useQuery<Program>({
    queryKey: ["program-builder", programId],
    enabled: !!programId && !isNew,
    queryFn: async () => {
      const { data, error } = await supabase.from("physique_programs").select("*").eq("id", programId!).single();
      if (error) throw error;
      return data as Program;
    },
  });

  const loadedDays = useQuery<BuilderDay[]>({
    queryKey: ["program-builder-days", programId],
    enabled: !!programId && !isNew,
    queryFn: async () => {
      const { data: dayRows, error } = await supabase.from("physique_program_days").select("*").eq("program_id", programId!).order("day_number");
      if (error) throw error;
      const ids = (dayRows ?? []).map((day) => day.id);
      const { data: blockRows, error: blockError } = await supabase.from("physique_program_blocks").select("*").in("day_id", ids).order("order_index");
      if (blockError) throw blockError;
      return (dayRows ?? []).map((day) => ({ ...day, blocks: (blockRows ?? []).filter((block) => block.day_id === day.id) }) as BuilderDay);
    },
  });

  useEffect(() => {
    if (program.data) {
      setName(program.data.name);
      setDescription(program.data.description ?? "");
      setGoal(program.data.goal ?? "");
      setDuration(String(program.data.duration_weeks ?? ""));
      setDaysPerWeek(String(program.data.days_per_week ?? ""));
      setIsTemplate(program.data.is_template);
    }
  }, [program.data]);

  useEffect(() => {
    if (loadedDays.data) setDays(loadedDays.data);
  }, [loadedDays.data]);

  function updateDay(dayId: string, patch: Partial<BuilderDay>) {
    setDays((current) => current.map((day) => (day.id === dayId ? { ...day, ...patch } : day)));
  }

  function updateBlock(blockId: string, patch: Partial<ProgramBlock>) {
    setDays((current) => current.map((day) => ({
      ...day,
      blocks: day.blocks.map((block) => (block.id === blockId ? { ...block, ...patch } : block)),
    })));
  }

  function addDay() {
    const dayNumber = days.length + 1;
    setDays((current) => [
      ...current,
      {
        id: `new-${Date.now()}-${dayNumber}`,
        program_id: programId ?? "",
        day_number: dayNumber,
        name: `${EMPTY_DAY_NAME} ${dayNumber}`,
        focus: "custom",
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        blocks: [],
      },
    ]);
  }

  function addExercise(dayId: string, exercise: ExerciseLibrary) {
    setDays((current) => current.map((day) => {
      if (day.id !== dayId) return day;
      return {
        ...day,
        blocks: [
          ...day.blocks,
          {
            id: `new-block-${Date.now()}-${day.blocks.length}`,
            day_id: dayId,
            exercise_id: exercise.id,
            exercise_name: exercise.name,
            order_index: day.blocks.length,
            sets: null,
            reps: null,
            rpe: null,
            rest_seconds: null,
            tempo: null,
            technique_notes: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      };
    }));
    setPickerDayId(null);
  }

  function removeBlock(dayId: string, blockId: string) {
    if (!window.confirm("Remove this exercise from the program? Historical workout logs will be preserved.")) return;
    setRemovedBlockIds((current) => (blockId.startsWith("new-block-") ? current : [...current, blockId]));
    setDays((current) => current.map((day) => day.id === dayId
      ? { ...day, blocks: day.blocks.filter((block) => block.id !== blockId).map((block, index) => ({ ...block, order_index: index })) }
      : day));
  }

  function moveBlock(dayId: string, blockId: string, direction: -1 | 1) {
    setDays((current) => current.map((day) => {
      if (day.id !== dayId) return day;
      const index = day.blocks.findIndex((block) => block.id === blockId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= day.blocks.length) return day;
      const blocks = [...day.blocks];
      [blocks[index], blocks[target]] = [blocks[target], blocks[index]];
      return { ...day, blocks: blocks.map((block, order_index) => ({ ...block, order_index })) };
    }));
  }

  const save = useMutation<void, Error, void>({
    mutationFn: async () => {
      setError(null);
      let currentProgramId = programId;
      if (!currentProgramId || isNew) {
        const { data, error } = await supabase.from("physique_programs").insert({
          name,
          description: description || null,
          goal,
          duration_weeks: Number(duration) || null,
          days_per_week: Number(daysPerWeek) || null,
          is_template: isTemplate,
          status: "draft",
        }).select("id").single();
        if (error) throw error;
        currentProgramId = data.id;
      } else {
        const { error } = await supabase.from("physique_programs").update({
          name,
          description: description || null,
          goal,
          duration_weeks: Number(duration) || null,
          days_per_week: Number(daysPerWeek) || null,
          is_template: isTemplate,
          status: "draft" as ProgramStatus,
        }).eq("id", currentProgramId);
        if (error) throw error;
      }

      for (const day of days) {
        let dayId = day.id;
        if (day.id.startsWith("new-")) {
          const { data, error } = await supabase.from("physique_program_days").insert({
            program_id: currentProgramId,
            day_number: day.day_number,
            name: day.name,
            focus: day.focus ?? "custom",
            notes: day.notes ?? null,
          }).select("id").single();
          if (error) throw error;
          dayId = data.id;
        } else {
          const { error } = await supabase.from("physique_program_days").update({
            day_number: day.day_number,
            name: day.name,
            focus: day.focus ?? "custom",
            notes: day.notes ?? null,
          }).eq("id", dayId);
          if (error) throw error;
        }

        for (const block of day.blocks) {
          if (block.id.startsWith("new-block-")) {
            const { error } = await supabase.from("physique_program_blocks").insert({
              day_id: dayId,
              exercise_id: block.exercise_id,
              exercise_name: block.exercise_name,
              order_index: block.order_index,
              sets: block.sets,
              reps: block.reps,
              rpe: block.rpe,
              rest_seconds: block.rest_seconds,
              tempo: block.tempo,
              technique_notes: block.technique_notes,
            });
            if (error) throw error;
          } else {
            const { error } = await supabase.from("physique_program_blocks").update({
              exercise_id: block.exercise_id,
              exercise_name: block.exercise_name,
              order_index: block.order_index,
              sets: block.sets,
              reps: block.reps,
              rpe: block.rpe,
              rest_seconds: block.rest_seconds,
              tempo: block.tempo,
              technique_notes: block.technique_notes,
            }).eq("id", block.id);
            if (error) throw error;
          }
        }
      }
      if (removedBlockIds.length) {
        const { error } = await supabase.from("physique_program_blocks").delete().in("id", removedBlockIds);
        if (error) throw error;
      }
      navigate(`/app/program/${currentProgramId}`);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["coach-programs", profile?.coach_id] });
    },
    onError: (err) => setError(err.message),
  });

  if (isLoading) return <LoadingState />;
  if (!isNew && (program.isLoading || loadedDays.isLoading)) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Program builder · بناء البرنامج</h1>
        <p className="mt-1 text-sm text-ada-muted">Create or edit a training program independently.</p>
      </div>

      <Card>
        <SectionTitle>Program details · تفاصيل البرنامج</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="ada-label">Name</span>
            <input className="ada-input" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            <span className="ada-label">Goal</span>
            <input className="ada-input" value={goal} onChange={(e) => setGoal(e.target.value)} />
          </label>
          <label>
            <span className="ada-label">Duration (weeks)</span>
            <input type="number" className="ada-input" value={duration} onChange={(e) => setDuration(e.target.value)} />
          </label>
          <label>
            <span className="ada-label">Days per week</span>
            <input type="number" className="ada-input" value={daysPerWeek} onChange={(e) => setDaysPerWeek(e.target.value)} />
          </label>
          <label className="sm:col-span-2">
            <span className="ada-label">Description</span>
            <textarea className="ada-input" value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <label className="sm:col-span-2 flex items-center gap-2">
            <input type="checkbox" checked={isTemplate} onChange={(e) => setIsTemplate(e.target.checked)} />
            <span className="text-sm text-ada-text">Save as coach template</span>
          </label>
        </div>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionTitle>Training days · أيام التدريب</SectionTitle>
        <Button variant="ghost" onClick={addDay}>Add day</Button>
      </div>

      <div className="space-y-4">
        {days.map((day) => (
          <Card key={day.id}>
            <SectionTitle hint={<Badge tone="teal">Day {day.day_number}</Badge>}>
              <input className="ada-input" value={day.name ?? ""} onChange={(e) => updateDay(day.id, { name: e.target.value })} />
            </SectionTitle>
            <div className="mb-3 flex flex-wrap gap-2">
              <Button variant="ghost" onClick={() => setPickerDayId(day.id)}>Add exercise</Button>
            </div>
            <div className="space-y-3">
              {day.blocks.map((block) => (
                <div key={block.id} className="rounded-lg border border-white/10 bg-ada-surface p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold text-ada-text">{block.exercise_name}</div>
                    <div className="flex shrink-0 gap-1">
                      <Button variant="ghost" onClick={() => moveBlock(day.id, block.id, -1)} aria-label="Move exercise up">↑</Button>
                      <Button variant="ghost" onClick={() => moveBlock(day.id, block.id, 1)} aria-label="Move exercise down">↓</Button>
                      <Button variant="ghost" onClick={() => removeBlock(day.id, block.id)}>Remove</Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                      <label className="block">
                        <span className="ada-label">Sets</span>
                        <input className="ada-input" type="number" value={block.sets ?? ""} onChange={(e) => updateBlock(block.id, { sets: e.target.value ? Number(e.target.value) : null })} />
                      </label>
                      <label className="block">
                        <span className="ada-label">Reps</span>
                        <input className="ada-input" value={block.reps ?? ""} onChange={(e) => updateBlock(block.id, { reps: e.target.value })} />
                      </label>
                      <label className="block">
                        <span className="ada-label">RPE</span>
                        <input className="ada-input" type="number" step="0.5" value={block.rpe ?? ""} onChange={(e) => updateBlock(block.id, { rpe: e.target.value ? Number(e.target.value) : null })} />
                      </label>
                      <label className="block">
                        <span className="ada-label">Rest</span>
                        <input className="ada-input" type="number" value={block.rest_seconds ?? ""} onChange={(e) => updateBlock(block.id, { rest_seconds: e.target.value ? Number(e.target.value) : null })} />
                      </label>
                      <label className="block">
                        <span className="ada-label">Tempo</span>
                        <input className="ada-input" value={block.tempo ?? ""} onChange={(e) => updateBlock(block.id, { tempo: e.target.value })} />
                      </label>
                    </div>
                  </div>
                  <label className="mt-3 block">
                    <span className="ada-label">Technique notes</span>
                    <textarea className="ada-input" value={block.technique_notes ?? ""} onChange={(e) => updateBlock(block.id, { technique_notes: e.target.value })} />
                  </label>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {pickerDayId ? (
        <ExercisePicker onPick={(exercise) => addExercise(pickerDayId, exercise)} />
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button loading={save.isPending} onClick={() => save.mutate()}>
          Save program
        </Button>
        <Button variant="ghost" onClick={() => navigate("/app/programs")}>Cancel</Button>
      </div>
      {error ? <ErrorState message={error} /> : null}
    </div>
  );
}
