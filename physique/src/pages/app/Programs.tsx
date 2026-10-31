import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { useCoachProfile } from "../../hooks/useProfile";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  IconBadge,
  LoadingState,
  PageHeader,
  SectionTitle,
} from "../../components/ui";
import { Icon } from "../../components/Icon";
import type {
  ExperienceLevel,
  GeneratedDay,
  ProgramGenerateResponse,
  ProgramFocus,
} from "../../lib/types";

const GOALS = ["bulk", "cut", "recomp", "prep", "maintain", "offseason"] as const;
const EXPERIENCE: ExperienceLevel[] = ["beginner", "intermediate", "advanced", "competitor"];
const FOCUS_SET: ReadonlySet<string> = new Set([
  "push",
  "pull",
  "legs",
  "upper",
  "lower",
  "full_body",
  "rest",
  "cardio",
  "custom",
]);

const toList = (raw: string): string[] =>
  raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const normalizeFocus = (raw: string): ProgramFocus => {
  const key = raw.toLowerCase().replace(/\s+/g, "_");
  return FOCUS_SET.has(key) ? (key as ProgramFocus) : "custom";
};

interface RosterItem {
  athlete_id: string;
  athlete: { display_name: string | null } | null;
}

export function Programs() {
  const { userId } = useAuth();
  const qc = useQueryClient();
  const { data: profile, isLoading } = useCoachProfile();

  const [athleteId, setAthleteId] = useState("");
  const [goal, setGoal] = useState<(typeof GOALS)[number]>("bulk");
  const [experience, setExperience] = useState<ExperienceLevel>("intermediate");
  const [freq, setFreq] = useState("5");
  const [equipment, setEquipment] = useState("gym");
  const [weak, setWeak] = useState("");
  const [recovery, setRecovery] = useState("");

  const roster = useQuery<RosterItem[]>({
    queryKey: ["programs-roster", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("physique_coach_athletes")
        .select("athlete_id, athlete:physique_athletes(display_name)")
        .eq("coach_id", userId!)
        .eq("status", "active")
        .order("started_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as RosterItem[];
    },
  });

  const programs = useQuery({
    queryKey: ["coach-programs", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("physique_programs")
        .select("*")
        .eq("created_by", userId!)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });

  const generate = useMutation<ProgramGenerateResponse, ApiError, void>({
    mutationFn: () =>
      api.post<ProgramGenerateResponse>("/programs/generate", {
        athlete_id: athleteId,
        goal,
        experience_level: experience,
        equipment: toList(equipment),
        weak_body_parts: toList(weak),
        training_frequency: Number(freq) || 5,
        recovery_note: recovery || null,
      }),
  });

  const saveProgram = useMutation<void, Error, ProgramGenerateResponse>({
    mutationFn: async (res) => {
      // Insert program root.
      const { data: progRow, error: progErr } = await supabase
        .from("physique_programs")
        .insert({
          created_by: userId!,
          athlete_id: athleteId || null,
          name: res.name,
          goal: res.goal,
          duration_weeks: res.duration_weeks,
          days_per_week: res.days.length,
          is_template: !athleteId,
          status: "draft",
        })
        .select("id")
        .single();
      if (progErr) throw progErr;
      const programId = progRow.id;

      // Insert days + blocks.
      for (const day of res.days as GeneratedDay[]) {
        const { data: dayRow, error: dayErr } = await supabase
          .from("physique_program_days")
          .insert({
            program_id: programId,
            day_number: day.day_number,
            name: day.name,
            focus: normalizeFocus(day.focus),
          })
          .select("id")
          .single();
        if (dayErr) throw dayErr;

        if (day.blocks.length) {
          const blocks = day.blocks.map((b, i) => ({
            day_id: dayRow.id,
            exercise_name: b.exercise_name,
            order_index: i,
            sets: b.sets ?? null,
            reps: b.reps ?? null,
            rpe: b.rpe ?? null,
            rest_seconds: b.rest_seconds ?? null,
            tempo: b.tempo ?? null,
            technique_notes: b.technique_notes ?? null,
          }));
          const { error: blockErr } = await supabase
            .from("physique_program_blocks")
            .insert(blocks);
          if (blockErr) throw blockErr;
        }
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coach-programs", userId] }),
  });

  if (isLoading) return <LoadingState />;
  if (!profile) return <Navigate to="/onboard" replace />;

  const res = generate.data;
  const canGenerate = athleteId && !generate.isPending;

  return (
    <div className="ada-stagger space-y-8 sm:space-y-10">
      <PageHeader
        eyebrow="Programs"
        title="Program studio"
        subtitle="Generate a personalized program with the AI Program Generator, then save it to a rostered athlete."
      />

      <Card className="sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <IconBadge name="sparkle" tone="ai" size={40} />
          <div>
            <h2 className="text-lg font-semibold tracking-tight">AI Program Generator</h2>
            <p className="text-sm text-ada-muted">Tuned to goal, experience, equipment and weak points.</p>
          </div>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (canGenerate) generate.mutate();
          }}
          className="grid gap-4 sm:grid-cols-2"
        >
          <label className="block sm:col-span-2">
            <span className="ada-label">Athlete</span>
            <select
              className="ada-input"
              value={athleteId}
              onChange={(e) => setAthleteId(e.target.value)}
              required
            >
              <option value="" disabled>
                Select an athlete from your roster
              </option>
              {roster.data?.map((r) => (
                <option key={r.athlete_id} value={r.athlete_id}>
                  {r.athlete?.display_name ?? r.athlete_id}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="ada-label">Goal</span>
            <select className="ada-input" value={goal} onChange={(e) => setGoal(e.target.value as (typeof GOALS)[number])}>
              {GOALS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="ada-label">Experience</span>
            <select className="ada-input" value={experience} onChange={(e) => setExperience(e.target.value as ExperienceLevel)}>
              {EXPERIENCE.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="ada-label">Training days / week</span>
            <input type="number" min={2} max={7} className="ada-input" value={freq} onChange={(e) => setFreq(e.target.value)} />
          </label>

          <label className="block">
            <span className="ada-label">Equipment (comma separated)</span>
            <input className="ada-input" value={equipment} onChange={(e) => setEquipment(e.target.value)} />
          </label>

          <label className="block">
            <span className="ada-label">Weak body parts (comma separated)</span>
            <input className="ada-input" value={weak} onChange={(e) => setWeak(e.target.value)} placeholder="calves, side delts" />
          </label>

          <label className="block sm:col-span-2">
            <span className="ada-label">Recovery note (optional)</span>
            <input className="ada-input" value={recovery} onChange={(e) => setRecovery(e.target.value)} placeholder="Sleeping 6h, mild lower-back fatigue" />
          </label>

          <div className="sm:col-span-2">
            <Button type="submit" loading={generate.isPending} disabled={!canGenerate} className="py-3">
              <Icon name="sparkle" size={16} /> Generate program
            </Button>
            {!roster.data?.length ? (
              <p className="mt-2 text-xs text-ada-muted">
                Assign at least one athlete to your roster before generating.
              </p>
            ) : null}
          </div>
        </form>

        {generate.error ? (
          <div className="mt-4">
            <ErrorState
              message={
                generate.error.status === 503
                  ? "AI provider unavailable. Try again shortly."
                  : generate.error.message
              }
            />
          </div>
        ) : null}
      </Card>

      {/* ── Generated result ── */}
      {res ? (
        <Card glow className="sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="ada-eyebrow mb-2">Generated program</div>
              <h3 className="text-[1.6rem] font-semibold leading-tight tracking-tight text-ada-text">{res.name}</h3>
              <p className="mt-2 text-sm capitalize text-ada-text-2">
                {res.goal} · {res.duration_weeks} weeks · {res.days.length} training days ·{" "}
                <span className="text-ada-muted/70">{res.model}</span>
              </p>
            </div>
            <Button
              variant={saveProgram.isSuccess ? "ghost" : "primary"}
              loading={saveProgram.isPending}
              onClick={() => saveProgram.mutate(res)}
            >
              {saveProgram.isSuccess ? "Saved ✓" : "Save as program"}
            </Button>
          </div>

          {saveProgram.error ? <div className="mt-3"><ErrorState message={saveProgram.error.message} /></div> : null}

          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-ada-text-2">{res.rationale}</p>

          <div className="mt-6 grid gap-3 lg:grid-cols-2">
            {res.days.map((day) => (
              <div key={day.day_number} className="ada-inset rounded-2xl p-4">
                <div className="mb-3 flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ada-teal font-mono-num text-xs font-semibold text-ada-navy">
                    D{day.day_number}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{day.name}</div>
                    <div className="truncate text-xs text-ada-muted">{day.focus}</div>
                  </div>
                </div>
                <ul className="divide-y divide-white/[0.05] text-sm">
                  {day.blocks.map((b, i) => (
                    <li key={i} className="flex flex-wrap items-center justify-between gap-2 py-2">
                      <span className="font-medium text-ada-text">{b.exercise_name}</span>
                      <span className="font-mono-num text-xs text-ada-text-2">
                        {b.sets} × {b.reps}
                        {b.rpe ? ` @ RPE ${b.rpe}` : ""}
                        {b.rest_seconds ? ` · ${b.rest_seconds}s rest` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {/* ── Saved programs ── */}
      <Card>
        <SectionTitle>Your programs</SectionTitle>
        {programs.isLoading ? (
          <LoadingState label="Loading programs…" />
        ) : programs.data?.length ? (
          <ul className="space-y-2">
            {programs.data.map((p) => (
              <li key={p.id} className="ada-inset flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm">
                <span className="flex min-w-0 items-center gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/[0.04] text-ada-muted">
                    <Icon name="layers" size={15} />
                  </span>
                  <span className="truncate font-medium text-ada-text">{p.name}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2 text-ada-muted">
                  <span className="capitalize">{p.goal ?? "—"}</span>
                  <span className="font-mono-num">· {p.duration_weeks ?? "—"}w</span>
                  <Badge tone={p.status === "active" ? "success" : "neutral"}>{p.status}</Badge>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No saved programs yet"
            description="Generate a program above and save it to build your library."
            icon={<Icon name="layers" size={20} />}
          />
        )}
      </Card>
    </div>
  );
}
