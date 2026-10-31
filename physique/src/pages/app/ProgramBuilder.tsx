import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { useCoachProfile } from "../../hooks/useProfile";
import { Badge, Button, Card, ErrorState, LoadingState, PageHeader, SectionTitle } from "../../components/ui";
import { Icon } from "../../components/Icon";
import { ExercisePicker } from "../../components/ExercisePicker";
import type { ExerciseLibrary, Program, ProgramBlock, ProgramDay } from "../../lib/types";

type ProgramStatus = "draft" | "active" | "archived";

interface BuilderDay extends ProgramDay {
  blocks: ProgramBlock[];
}

const EMPTY_DAY_NAME = "Day";

/** Compact numeric stepper (UI only) — emits the same values the plain inputs did. */
function Stepper({
  label,
  value,
  step = 1,
  min = 0,
  suffix,
  onChange,
}: {
  label: string;
  value: number | null;
  step?: number;
  min?: number;
  suffix?: string;
  onChange: (value: number | null) => void;
}) {
  const bump = (dir: 1 | -1) => {
    const next = Math.max(min, +((value ?? 0) + dir * step).toFixed(1));
    onChange(next);
  };
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-medium uppercase tracking-wider text-ada-faint">{label}</span>
      <span className="flex items-center rounded-xl bg-black/25 ada-hairline focus-within:shadow-[var(--shadow-teal)]">
        <button type="button" aria-label={`Decrease ${label}`} onClick={() => bump(-1)} className="grid h-9 w-8 place-items-center text-ada-muted transition-colors hover:text-ada-text">
          <Icon name="minus" size={12} />
        </button>
        <input
          type="number"
          inputMode="decimal"
          step={step}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
          className="w-11 bg-transparent text-center font-mono-num text-sm font-semibold text-ada-text outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        {suffix ? <span className="-ml-1 pr-0.5 text-[10px] text-ada-muted">{suffix}</span> : null}
        <button type="button" aria-label={`Increase ${label}`} onClick={() => bump(1)} className="grid h-9 w-8 place-items-center text-ada-muted transition-colors hover:text-ada-text">
          <Icon name="plus" size={12} />
        </button>
      </span>
    </label>
  );
}

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
  const [activeDayId, setActiveDayId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(isNew);

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

  const activeDay = days.find((day) => day.id === activeDayId) ?? days[0] ?? null;
  const totalSets = (day: BuilderDay) => day.blocks.reduce((sum, block) => sum + (block.sets ?? 0), 0);
  const estMinutes = (day: BuilderDay) =>
    Math.round(day.blocks.reduce((sum, block) => sum + (block.sets ?? 0) * (45 + (block.rest_seconds ?? 90)), 0) / 60);
  const addDayAndSelect = () => {
    addDay();
    setActiveDayId(`pending-${days.length + 1}`);
  };
  // After addDay() the newest day becomes active.
  const resolvedActive =
    activeDayId?.startsWith("pending-") ? days[days.length - 1] ?? activeDay : activeDay;

  return (
    <div className="ada-stagger space-y-8">
      <PageHeader
        eyebrow="Program builder · بناء البرنامج"
        title={name || (isNew ? "New program" : "Untitled program")}
        subtitle="Create or edit a training program independently."
        action={
          <>
            <Button loading={save.isPending} onClick={() => save.mutate()} className="py-3">
              <Icon name="check" size={15} /> Save program
            </Button>
            <Button variant="ghost" onClick={() => navigate("/app/programs")} className="py-3">
              Cancel
            </Button>
          </>
        }
      />
      {error ? <ErrorState message={error} /> : null}

      {/* ── Program details (progressive disclosure) ── */}
      <Card className="sm:p-7">
        <button
          type="button"
          onClick={() => setDetailsOpen((open) => !open)}
          aria-expanded={detailsOpen}
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <span className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-ada-teal/12 text-ada-teal">
              <Icon name="layers" size={18} />
            </span>
            <span>
              <span className="block text-lg font-semibold tracking-tight">Program details · تفاصيل البرنامج</span>
              <span className="block font-mono-num text-xs text-ada-muted">
                {goal || "—"} · {duration || "—"} weeks · {daysPerWeek || "—"} days/wk{isTemplate ? " · template" : ""}
              </span>
            </span>
          </span>
          <Icon name="chevronDown" size={18} className={`text-ada-muted transition-transform duration-300 ${detailsOpen ? "rotate-180" : ""}`} />
        </button>
        <div className={`grid transition-[grid-template-rows] duration-500 ease-[var(--ease-premium)] ${detailsOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
          <div className="overflow-hidden">
            <div className="grid gap-4 pt-6 sm:grid-cols-2">
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
                <input type="number" className="ada-input font-mono-num" value={duration} onChange={(e) => setDuration(e.target.value)} />
              </label>
              <label>
                <span className="ada-label">Days per week</span>
                <input type="number" className="ada-input font-mono-num" value={daysPerWeek} onChange={(e) => setDaysPerWeek(e.target.value)} />
              </label>
              <label className="sm:col-span-2">
                <span className="ada-label">Description</span>
                <textarea className="ada-input" value={description} onChange={(e) => setDescription(e.target.value)} />
              </label>
              <label className="flex cursor-pointer items-center gap-3 sm:col-span-2">
                <input type="checkbox" className="h-4 w-4 accent-[#00DCC8]" checked={isTemplate} onChange={(e) => setIsTemplate(e.target.checked)} />
                <span className="text-sm text-ada-text">Save as coach template</span>
              </label>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* ── Days rail ── */}
        <div className="min-w-0">
          <div className="ada-eyebrow mb-3">Training days · أيام التدريب</div>
          <div className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0">
            {days.map((day) => {
              const active = resolvedActive?.id === day.id;
              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => setActiveDayId(day.id)}
                  aria-pressed={active}
                  className={`relative flex min-w-[11rem] shrink-0 snap-start items-center gap-3 rounded-2xl p-3 text-left transition-all duration-300 lg:min-w-0 ${
                    active ? "bg-white/[0.07] shadow-[var(--shadow-elev-2)] ada-hairline" : "hover:bg-white/[0.035]"
                  }`}
                >
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl font-mono-num text-xs font-semibold ${active ? "bg-ada-teal text-ada-navy" : "bg-white/[0.05] text-ada-text-2"}`}>
                    D{day.day_number}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ada-text">{day.name || `Day ${day.day_number}`}</span>
                    <span className="block font-mono-num text-xs text-ada-muted">
                      {day.blocks.length} ex · {totalSets(day)} sets
                    </span>
                  </span>
                  {active ? <span aria-hidden className="absolute inset-y-3 left-0 hidden w-0.5 rounded-full bg-ada-teal lg:block" /> : null}
                </button>
              );
            })}
            <button
              type="button"
              onClick={addDayAndSelect}
              className="flex min-w-[8rem] shrink-0 items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 p-3 text-sm text-ada-muted transition-colors hover:border-ada-teal/40 hover:text-ada-teal lg:mt-2 lg:min-w-0"
            >
              <Icon name="plus" size={15} /> Add day
            </button>
          </div>
        </div>

        {/* ── Day editor ── */}
        {resolvedActive ? (
          <Card className="min-w-0 sm:p-7">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <Badge tone="teal">Day {resolvedActive.day_number}</Badge>
                </div>
                <input
                  aria-label="Day name"
                  className="w-full bg-transparent text-[1.5rem] font-semibold tracking-tight text-ada-text outline-none placeholder:text-ada-faint"
                  value={resolvedActive.name ?? ""}
                  placeholder={`Day ${resolvedActive.day_number}`}
                  onChange={(e) => updateDay(resolvedActive.id, { name: e.target.value })}
                />
              </div>
              <div className="flex shrink-0 gap-5 font-mono-num text-xs text-ada-muted">
                <span><b className="block text-xl font-medium text-ada-text">{resolvedActive.blocks.length}</b>exercises</span>
                <span><b className="block text-xl font-medium text-ada-text">{totalSets(resolvedActive)}</b>sets</span>
                <span><b className="block text-xl font-medium text-ada-text">~{estMinutes(resolvedActive)}</b>min</span>
              </div>
            </div>

            <div className="space-y-2.5">
              {resolvedActive.blocks.map((block, index) => (
                <div key={block.id} className="group ada-inset animate-rise rounded-2xl p-3.5 transition-colors hover:bg-white/[0.04] sm:p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col text-ada-faint">
                      <button type="button" disabled={index === 0} onClick={() => moveBlock(resolvedActive.id, block.id, -1)} aria-label="Move exercise up" className="rounded p-0.5 hover:text-ada-text disabled:opacity-20">
                        <Icon name="chevronDown" size={14} className="rotate-180" />
                      </button>
                      <button type="button" disabled={index === resolvedActive.blocks.length - 1} onClick={() => moveBlock(resolvedActive.id, block.id, 1)} aria-label="Move exercise down" className="rounded p-0.5 hover:text-ada-text disabled:opacity-20">
                        <Icon name="chevronDown" size={14} />
                      </button>
                    </div>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[0.05] font-mono-num text-xs font-semibold text-ada-text-2">{index + 1}</span>
                    <div className="min-w-0 flex-1 truncate text-sm font-semibold text-ada-text">{block.exercise_name}</div>
                    <button
                      type="button"
                      onClick={() => removeBlock(resolvedActive.id, block.id)}
                      aria-label="Remove exercise"
                      className="rounded-lg p-2 text-ada-muted transition-colors hover:bg-ada-red/10 hover:text-ada-red"
                    >
                      <Icon name="trash" size={15} />
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap items-end gap-2.5 pl-1 sm:pl-[4.25rem]">
                    <Stepper label="Sets" value={block.sets} min={0} onChange={(v) => updateBlock(block.id, { sets: v })} />
                    <label className="flex flex-col gap-1">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-ada-faint">Reps</span>
                      <input className="h-9 w-[4.75rem] rounded-xl bg-black/25 text-center font-mono-num text-sm font-semibold text-ada-text outline-none ada-hairline focus:shadow-[var(--shadow-teal)]" value={block.reps ?? ""} onChange={(e) => updateBlock(block.id, { reps: e.target.value })} />
                    </label>
                    <Stepper label="RPE" value={block.rpe} step={0.5} onChange={(v) => updateBlock(block.id, { rpe: v })} />
                    <Stepper label="Rest" value={block.rest_seconds} step={15} suffix="s" onChange={(v) => updateBlock(block.id, { rest_seconds: v })} />
                    <label className="flex flex-col gap-1">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-ada-faint">Tempo</span>
                      <input className="h-9 w-[5.25rem] rounded-xl bg-black/25 text-center font-mono-num text-sm font-semibold text-ada-text outline-none ada-hairline focus:shadow-[var(--shadow-teal)]" value={block.tempo ?? ""} placeholder="3-1-1-0" onChange={(e) => updateBlock(block.id, { tempo: e.target.value })} />
                    </label>
                  </div>
                  <label className="mt-3 block sm:pl-[4.25rem]">
                    <span className="sr-only">Technique notes</span>
                    <textarea
                      rows={1}
                      className="ada-input min-h-[2.5rem] resize-y py-2 text-sm"
                      placeholder="Technique notes"
                      value={block.technique_notes ?? ""}
                      onChange={(e) => updateBlock(block.id, { technique_notes: e.target.value })}
                    />
                  </label>
                </div>
              ))}
              {resolvedActive.blocks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-ada-muted">
                  No exercises yet — add the first one.
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => setPickerDayId(resolvedActive.id)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 py-4 text-sm text-ada-muted transition-colors hover:border-ada-teal/40 hover:text-ada-teal"
            >
              <Icon name="plus" size={15} /> Add exercise
            </button>
          </Card>
        ) : (
          <Card className="sm:p-7">
            <SectionTitle>Training days · أيام التدريب</SectionTitle>
            <p className="mb-4 text-sm text-ada-muted">Add the first training day to start building.</p>
            <Button variant="ghost" onClick={addDayAndSelect}>
              <Icon name="plus" size={15} /> Add day
            </Button>
          </Card>
        )}
      </div>

      {/* ── Exercise picker: bottom sheet on mobile, centered panel on desktop ── */}
      {pickerDayId ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center" role="dialog" aria-modal="true" aria-label="Exercise library">
          <button type="button" aria-label="Close exercise library" onClick={() => setPickerDayId(null)} className="absolute inset-0 animate-fade bg-black/60 backdrop-blur-sm" />
          <div className="ada-glass relative flex max-h-[82vh] w-full animate-rise flex-col rounded-t-[2rem] p-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] md:max-w-2xl md:rounded-[var(--radius-panel)] md:p-7" style={{ background: "rgba(15,21,25,0.94)" }}>
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20 md:hidden" />
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">Exercise library</h2>
              <button type="button" onClick={() => setPickerDayId(null)} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.06] text-ada-text-2 hover:text-ada-text">
                <Icon name="close" size={16} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <ExercisePicker onPick={(exercise: ExerciseLibrary) => addExercise(pickerDayId, exercise)} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
