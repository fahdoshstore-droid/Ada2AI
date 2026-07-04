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
  LoadingState,
  SectionTitle,
} from "../../components/ui";
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Programs</h1>
        <p className="mt-1 text-sm text-ada-muted">
          Generate a personalized program with the AI Program Generator, then save it to a
          rostered athlete.
        </p>
      </div>

      <Card>
        <SectionTitle>AI Program Generator</SectionTitle>
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
            <Button type="submit" loading={generate.isPending} disabled={!canGenerate}>
              Generate program
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
        <Card glow>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-ada-teal">{res.name}</h3>
              <p className="mt-1 text-sm text-ada-muted">
                {res.goal} · {res.duration_weeks} weeks · {res.days.length} training days ·{" "}
                <span className="text-ada-muted/70">{res.model}</span>
              </p>
            </div>
            <Button
              variant="subtle"
              loading={saveProgram.isPending}
              onClick={() => saveProgram.mutate(res)}
            >
              {saveProgram.isSuccess ? "Saved ✓" : "Save as program"}
            </Button>
          </div>

          {saveProgram.error ? <div className="mt-3"><ErrorState message={saveProgram.error.message} /></div> : null}

          <p className="mt-3 text-sm text-ada-text/80">{res.rationale}</p>

          <div className="mt-4 space-y-3">
            {res.days.map((day) => (
              <div key={day.day_number} className="rounded-lg border border-white/5 bg-ada-surface p-3">
                <div className="mb-2 flex items-center gap-2">
                  <Badge tone="teal">Day {day.day_number}</Badge>
                  <span className="font-semibold">{day.name}</span>
                  <span className="text-xs text-ada-muted">· {day.focus}</span>
                </div>
                <ul className="divide-y divide-white/5 text-sm">
                  {day.blocks.map((b, i) => (
                    <li key={i} className="flex flex-wrap items-center justify-between gap-2 py-1.5">
                      <span className="font-semibold text-ada-text">{b.exercise_name}</span>
                      <span className="font-mono-num text-ada-muted">
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
          <ul className="divide-y divide-white/5">
            {programs.data.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="font-semibold text-ada-text">{p.name}</span>
                <span className="text-ada-muted">
                  {p.goal ?? "—"} · {p.duration_weeks ?? "—"}w · <Badge>{p.status}</Badge>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No saved programs yet"
            description="Generate a program above and save it to build your library."
            icon="▤"
          />
        )}
      </Card>
    </div>
  );
}
