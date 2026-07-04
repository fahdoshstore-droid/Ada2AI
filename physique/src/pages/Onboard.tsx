import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { roleHome } from "../components/ProtectedRoute";
import { Button, ErrorState, LoadingState } from "../components/ui";
import type {
  CompetitionCategory,
  ExperienceLevel,
  Goal,
  Sex,
} from "../lib/types";

const CATEGORIES: CompetitionCategory[] = [
  "none",
  "classic_physique",
  "mens_open",
  "mens_physique",
  "212",
  "bikini",
  "figure",
  "womens_physique",
  "wellness",
];
const EXPERIENCE: ExperienceLevel[] = ["beginner", "intermediate", "advanced", "competitor"];
const GOALS: Goal[] = ["bulk", "cut", "recomp", "maintain", "prep", "offseason"];
const SEXES: Sex[] = ["male", "female"];

const toList = (raw: string): string[] =>
  raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="ada-label">{label}</span>
      {children}
    </label>
  );
}

export function Onboard() {
  const { userId, role } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  // Guard against React 18 Strict Mode double-invoke causing duplicate navigations
  const navigatedRef = useRef(false);

  // ── Athlete form state ──
  const [aName, setAName] = useState("");
  const [aSex, setASex] = useState<Sex>("male");
  const [aDob, setADob] = useState("");
  const [aHeight, setAHeight] = useState("");
  const [aCategory, setACategory] = useState<CompetitionCategory>("none");
  const [aExperience, setAExperience] = useState<ExperienceLevel>("beginner");
  const [aGoal, setAGoal] = useState<Goal>("bulk");
  const [aFreq, setAFreq] = useState("5");
  const [aEquipment, setAEquipment] = useState("gym");
  const [aWeak, setAWeak] = useState("");

  // ── Coach form state ──
  const [cName, setCName] = useState("");
  const [cBio, setCBio] = useState("");
  const [cSpecialties, setCSpecialties] = useState("");
  const [cYears, setCYears] = useState("");
  const [cBackground, setCBackground] = useState("");

  // ── Onboarded check ──
  const profileCheck = useQuery({
    queryKey: ["onboard-check", userId, role],
    enabled: !!userId && !!role,
    queryFn: async () => {
      if (role === "athlete") {
        const { data } = await supabase
          .from("physique_athletes")
          .select("athlete_id")
          .eq("athlete_id", userId!)
          .maybeSingle();
        return !!data;
      }
      if (role === "coach") {
        const { data } = await supabase
          .from("physique_coaches")
          .select("coach_id")
          .eq("coach_id", userId!)
          .maybeSingle();
        return !!data;
      }
      return false;
    },
  });

  useEffect(() => {
    if (profileCheck.data && !navigatedRef.current) {
      navigatedRef.current = true;
      navigate(roleHome(role), { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileCheck.data, navigate]);

  if (!userId || !role) return <LoadingState />;
  if (profileCheck.isLoading) return <LoadingState label="Checking profile…" />;
  if (role === "admin") {
    // Admins need no physique onboarding.
    return <Navigate to={roleHome(role)} replace />;
  }

  const submitAthlete = async () => {
    const { error: insertError } = await supabase.from("physique_athletes").insert({
      athlete_id: userId,
      display_name: aName || null,
      sex: aSex,
      date_of_birth: aDob || null,
      height_cm: aHeight ? Number(aHeight) : null,
      competition_category: aCategory,
      experience_level: aExperience,
      goal: aGoal,
      training_frequency: Number(aFreq) || 5,
      equipment: toList(aEquipment),
      weak_body_parts: toList(aWeak),
    });
    if (insertError) {
      // Duplicate key = already onboarded, treat as success
      const code = (insertError as { code?: string }).code;
      if (code !== "23505") throw insertError;
    }
    // Invalidate so profileCheck picks up the new row
    queryClient.invalidateQueries({ queryKey: ["onboard-check", userId, "athlete"] });
  };

  const submitCoach = async () => {
    const { error: insertError } = await supabase.from("physique_coaches").insert({
      coach_id: userId,
      display_name: cName || null,
      bio: cBio || null,
      specialties: toList(cSpecialties),
      years_experience: cYears ? Number(cYears) : null,
      competition_background: cBackground || null,
    });
    if (insertError) {
      // Duplicate key = already onboarded, treat as success
      const code = (insertError as { code?: string }).code;
      if (code !== "23505") throw insertError;
    }
    // Invalidate so profileCheck picks up the new row
    queryClient.invalidateQueries({ queryKey: ["onboard-check", userId, "coach"] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return; // Guard against double-submit
    setSubmitting(true);
    setError(null);
    try {
      if (role === "athlete") await submitAthlete();
      else if (role === "coach") await submitCoach();
    } catch (err: unknown) {
      setError(
        (err as { code?: string }).code === "23505"
          ? "Profile already exists — redirecting…"
          : (err instanceof Error ? err.message : "Onboarding failed."),
      );
      setSubmitting(false);
      return;
    }
    // Navigate after successful submit; do NOT setSubmitting(false) here
    // to avoid state update while component may be unmounting
    navigate(roleHome(role), { replace: true });
  };

  return (
    <div className="min-h-screen bg-ada-navy px-4 py-10">
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-bold">Complete your profile</h1>
        <p className="mt-1 text-sm text-ada-muted">
          {role === "athlete"
            ? "Tell us about your training so AI can personalize your coaching."
            : "Set up your coach profile to start managing athletes."}
        </p>

        {error ? <div className="mt-4"><ErrorState message={error} /></div> : null}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {role === "athlete" ? (
            <>
              <Field label="Display name">
                <input className="ada-input" value={aName} onChange={(e) => setAName(e.target.value)} placeholder="Your name" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Sex">
                  <select className="ada-input" value={aSex} onChange={(e) => setASex(e.target.value as Sex)}>
                    {SEXES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Date of birth">
                  <input type="date" className="ada-input" value={aDob} onChange={(e) => setADob(e.target.value)} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Height (cm)">
                  <input type="number" className="ada-input" value={aHeight} onChange={(e) => setAHeight(e.target.value)} placeholder="175" />
                </Field>
                <Field label="Training days / week">
                  <input type="number" min={1} max={7} className="ada-input" value={aFreq} onChange={(e) => setAFreq(e.target.value)} />
                </Field>
              </div>
              <Field label="Competition category">
                <select className="ada-input" value={aCategory} onChange={(e) => setACategory(e.target.value as CompetitionCategory)}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Experience">
                  <select className="ada-input" value={aExperience} onChange={(e) => setAExperience(e.target.value as ExperienceLevel)}>
                    {EXPERIENCE.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </Field>
                <Field label="Goal">
                  <select className="ada-input" value={aGoal} onChange={(e) => setAGoal(e.target.value as Goal)}>
                    {GOALS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Equipment (comma separated)">
                <input className="ada-input" value={aEquipment} onChange={(e) => setAEquipment(e.target.value)} placeholder="gym, dumbbells, bands" />
              </Field>
              <Field label="Weak body parts (comma separated)">
                <input className="ada-input" value={aWeak} onChange={(e) => setAWeak(e.target.value)} placeholder="calves, side delts" />
              </Field>
            </>
          ) : (
            <>
              <Field label="Display name">
                <input className="ada-input" value={cName} onChange={(e) => setCName(e.target.value)} placeholder="Coach name" />
              </Field>
              <Field label="Bio">
                <textarea className="ada-input min-h-24" value={cBio} onChange={(e) => setCBio(e.target.value)} placeholder="Your coaching philosophy and credentials" />
              </Field>
              <Field label="Specialties (comma separated)">
                <input className="ada-input" value={cSpecialties} onChange={(e) => setCSpecialties(e.target.value)} placeholder="classic physique, prep, posing" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Years experience">
                  <input type="number" className="ada-input" value={cYears} onChange={(e) => setCYears(e.target.value)} placeholder="10" />
                </Field>
              </div>
              <Field label="Competition background">
                <textarea className="ada-input min-h-20" value={cBackground} onChange={(e) => setCBackground(e.target.value)} placeholder="Your competitive history" />
              </Field>
            </>
          )}

          <Button type="submit" loading={submitting} className="mt-2 w-full py-3">
            Save & continue
          </Button>
        </form>
      </div>
    </div>
  );
}
