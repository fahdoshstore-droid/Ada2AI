import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { useCoachProfile } from "../../hooks/useProfile";
import {
  Button,
  Card,
  EmptyState,
  LoadingState,
  SectionTitle,
  Stat,
} from "../../components/ui";
import type { CheckInStatus, CoachAthlete } from "../../lib/types";

interface RosterRow extends CoachAthlete {
  athlete: {
    display_name: string | null;
    goal: string | null;
    competition_category: string | null;
    experience_level: string | null;
  } | null;
}

interface CheckInLite {
  id: string;
  athlete_id: string;
  check_in_date: string;
  status: CheckInStatus;
  bodyweight_kg: number | null;
  athlete: { display_name: string | null } | null;
}

/** Coach-facing athlete check-in status (maps to the spec's traffic-light). */
type AthleteCheckInStatus = "reviewed" | "submitted" | "overdue";

const STATUS_META: Record<
  AthleteCheckInStatus,
  { label: string; dot: string; text: string }
> = {
  reviewed: { label: "Reviewed", dot: "bg-ada-success", text: "text-ada-success" },
  submitted: { label: "Submitted", dot: "bg-ada-amber", text: "text-ada-amber" },
  overdue: { label: "Overdue", dot: "bg-ada-red", text: "text-ada-red" },
};

/** Sort rank: pending (submitted) first → overdue → reviewed last. */
const STATUS_RANK: Record<AthleteCheckInStatus, number> = {
  submitted: 0,
  overdue: 1,
  reviewed: 2,
};

const OVERDUE_DAYS = 7;
const MS_PER_DAY = 86_400_000;

/**
 * Derive an athlete's traffic-light status from their latest check-in.
 *  - submitted  → pending coach review (yellow)
 *  - reviewed   → up to date if within the weekly window (green), else overdue (red)
 *  - none/draft → no submitted check-in this week (red)
 */
function athleteStatus(latest: CheckInLite | undefined): AthleteCheckInStatus {
  if (!latest) return "overdue";
  if (latest.status === "submitted") return "submitted";
  if (latest.status === "reviewed") {
    const ageMs =
      Date.now() - new Date(`${latest.check_in_date}T00:00:00`).getTime();
    return ageMs > OVERDUE_DAYS * MS_PER_DAY ? "overdue" : "reviewed";
  }
  return "overdue";
}

function StatusPill({ status }: { status: AthleteCheckInStatus }) {
  const meta = STATUS_META[status];
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
      <span className={`text-xs font-semibold ${meta.text}`}>{meta.label}</span>
    </span>
  );
}

export function CoachDashboard() {
  const { userId } = useAuth();
  const { data: profile, isLoading } = useCoachProfile();

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

  const programs = useQuery<number>({
    queryKey: ["coach-programs-count", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("physique_programs")
        .select("*", { count: "exact", head: true })
        .eq("created_by", userId!);
      if (error) throw error;
      return count ?? 0;
    },
  });

  // RLS auto-filters to check-ins of athletes assigned to this coach.
  const checkins = useQuery<CheckInLite[]>({
    queryKey: ["coach-dashboard-checkins", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("physique_check_ins")
        .select(
          "id, athlete_id, check_in_date, status, bodyweight_kg, athlete:physique_athletes(display_name)",
        )
        .order("check_in_date", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as unknown as CheckInLite[];
    },
  });

  // Latest check-in per athlete (data is already ordered by date desc).
  const latestByAthlete = new Map<string, CheckInLite>();
  for (const ci of checkins.data ?? []) {
    if (!latestByAthlete.has(ci.athlete_id)) latestByAthlete.set(ci.athlete_id, ci);
  }
  const latestOverall = checkins.data?.[0] ?? null;
  const checkinsLoading = checkins.isLoading;
  const pendingCount = checkinsLoading
    ? null
    : [...latestByAthlete.values()].filter((c) => c.status === "submitted")
        .length;

  // ── Add athlete to roster (Freeze Exception 001) ──
  const queryClient = useQueryClient();
  const [assignEmail, setAssignEmail] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignMsg, setAssignMsg] = useState<
    { tone: "ok" | "err" | "info"; text: string } | null
  >(null);

  async function assignAthlete(e: React.FormEvent) {
    e.preventDefault();
    const email = assignEmail.trim().toLowerCase();
    setAssignMsg(null);
    if (!email) {
      setAssignMsg({ tone: "err", text: "Enter an athlete email." });
      return;
    }
    if (!userId) {
      setAssignMsg({ tone: "err", text: "Not signed in." });
      return;
    }
    setAssigning(true);
    try {
      // 1. Query profiles by email.
      const { data: prof, error: profErr } = await supabase
        .from("profiles")
        .select("id, user_type")
        .eq("email", email)
        .maybeSingle();
      if (profErr) throw profErr;
      // 2. Verify the profile exists.
      if (!prof) {
        setAssignMsg({ tone: "err", text: "Athlete not found for that email." });
        return;
      }
      // 3. Verify the role is athlete.
      if (prof.user_type !== "athlete") {
        setAssignMsg({
          tone: "err",
          text: `That user is not an athlete (role: ${prof.user_type ?? "none"}).`,
        });
        return;
      }
      // 4. Check already assigned (RLS: coach can read own roster rows).
      const { data: existing, error: existErr } = await supabase
        .from("physique_coach_athletes")
        .select("id")
        .eq("coach_id", userId)
        .eq("athlete_id", prof.id)
        .maybeSingle();
      if (existErr) throw existErr;
      if (existing) {
        setAssignMsg({ tone: "info", text: "That athlete is already on your roster." });
        return;
      }
      // 5. Insert the assignment (RLS: physique_coach_athletes_insert_coach).
      const { error: insErr } = await supabase
        .from("physique_coach_athletes")
        .insert({ coach_id: userId, athlete_id: prof.id, status: "active" });
      if (insErr) {
        // 23505 unique_violation → already assigned (race).
        if (insErr.code === "23505") {
          setAssignMsg({ tone: "info", text: "That athlete is already on your roster." });
          return;
        }
        // 23503 foreign_key_violation → athlete has no physique_athletes row yet.
        if (insErr.code === "23503") {
          setAssignMsg({
            tone: "err",
            text: "That athlete hasn't completed their profile yet.",
          });
          return;
        }
        throw insErr;
      }
      setAssignMsg({ tone: "ok", text: "Athlete added to your roster." });
      setAssignEmail("");
      queryClient.invalidateQueries({ queryKey: ["coach-roster", userId] });
      queryClient.invalidateQueries({ queryKey: ["coach-dashboard-checkins", userId] });
    } catch (err: unknown) {
      setAssignMsg({
        tone: "err",
        text: err instanceof Error ? err.message : "Could not assign athlete.",
      });
    } finally {
      setAssigning(false);
    }
  }

  if (isLoading) return <LoadingState />;
  if (!profile) return <Navigate to="/onboard" replace />;

  const sortedRoster = [...(roster.data ?? [])].sort(
    (a, b) =>
      STATUS_RANK[athleteStatus(latestByAthlete.get(a.athlete_id))] -
      STATUS_RANK[athleteStatus(latestByAthlete.get(b.athlete_id))],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            {profile.display_name ? `Coach ${profile.display_name}` : "Coach dashboard"}
          </h1>
          <p className="mt-1 text-sm text-ada-muted">
            {profile.specialties.length ? profile.specialties.join(" · ") : "Set your specialties"} ·{" "}
            {profile.years_experience ?? "—"} yrs experience
          </p>
        </div>
        <Link to="/app/programs">
          <Button className="ada-glow-teal">+ Generate program</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Athletes" value={roster.data?.length ?? "—"} accent />
        <Stat label="Programs" value={programs.data ?? "—"} />
        <Stat label="Verified" value={profile.is_verified ? "Yes" : "No"} />
        <Stat label="Accepting" value={profile.is_accepting_athletes ? "Yes" : "No"} />
      </div>

      {/* ── Pending check-ins counter + latest check-in widget ── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link to="/app/checkins" className="block">
          <Card
            className={
              pendingCount && pendingCount > 0
                ? "border-ada-red/30 transition hover:border-ada-red/50"
                : "transition hover:border-ada-teal/25"
            }
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-ada-muted">
                  Pending check-ins
                </div>
                <div
                  className={`mt-1 font-mono-num text-3xl ${
                    pendingCount === null
                      ? "text-ada-muted"
                      : pendingCount > 0
                        ? "text-ada-red"
                        : "text-ada-success"
                  }`}
                >
                  {pendingCount === null ? "—" : pendingCount}
                </div>
              </div>
              <span className="text-2xl">
                {pendingCount && pendingCount > 0 ? "▮" : "✓"}
              </span>
            </div>
            <div
              className={`mt-2 text-xs ${
                pendingCount && pendingCount > 0 ? "text-ada-red" : "text-ada-muted"
              }`}
            >
              {pendingCount === null
                ? "Loading…"
                : pendingCount > 0
                  ? "Awaiting your review →"
                  : "All caught up"}
            </div>
          </Card>
        </Link>

        <Card>
          <SectionTitle hint="Latest">Latest check-in</SectionTitle>
          {checkinsLoading ? (
            <LoadingState label="Loading latest check-in…" />
          ) : latestOverall ? (
            <Link
              to={`/app/checkins?athlete=${latestOverall.athlete_id}`}
              className="-mx-1 block rounded-lg px-1 py-1 transition hover:bg-white/5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-semibold text-ada-text">
                    {latestOverall.athlete?.display_name ?? "Athlete"}
                  </div>
                  <div className="text-xs text-ada-muted">
                    {latestOverall.check_in_date}
                    {latestOverall.bodyweight_kg != null
                      ? ` · ${latestOverall.bodyweight_kg} kg`
                      : ""}
                  </div>
                </div>
                <StatusPill status={athleteStatus(latestOverall)} />
              </div>
              <div className="mt-2 text-xs text-ada-teal">Open →</div>
            </Link>
          ) : (
            <EmptyState
              title="No check-ins yet"
              description="Athletes will appear here once they submit a weekly check-in."
              icon="◴"
            />
          )}
        </Card>
      </div>

      {/* ── Add athlete to roster ── */}
      <Card>
        <SectionTitle hint="By email">Add athlete</SectionTitle>
        <form
          onSubmit={assignAthlete}
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <label className="block flex-1">
            <span className="ada-label">Athlete email</span>
            <input
              type="email"
              className="ada-input"
              value={assignEmail}
              onChange={(e) => setAssignEmail(e.target.value)}
              placeholder="athlete@example.com"
              autoComplete="off"
            />
          </label>
          <Button type="submit" loading={assigning} className="sm:whitespace-nowrap">
            Assign athlete
          </Button>
        </form>
        {assignMsg ? (
          <div
            className={`mt-3 rounded-lg border px-3 py-2 text-sm ${
              assignMsg.tone === "ok"
                ? "border-ada-success/25 bg-ada-success/10 text-ada-success"
                : assignMsg.tone === "info"
                  ? "border-ada-amber/25 bg-ada-amber/10 text-ada-amber"
                  : "border-ada-red/25 bg-ada-red/10 text-ada-red"
            }`}
          >
            {assignMsg.text}
          </div>
        ) : null}
      </Card>

      {/* ── Roster with check-in status ── */}
      <Card>
        <SectionTitle hint="Pending first">Your athletes</SectionTitle>
        {roster.isLoading ? (
          <LoadingState label="Loading roster…" />
        ) : sortedRoster.length ? (
          <ul className="divide-y divide-white/5">
            {sortedRoster.map((row) => {
              const status = athleteStatus(latestByAthlete.get(row.athlete_id));
              return (
                <li key={row.id}>
                  <Link
                    to={`/app/checkins?athlete=${row.athlete_id}`}
                    className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-3 transition hover:bg-white/5"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-ada-text">
                        {row.athlete?.display_name ?? "Unnamed athlete"}
                      </div>
                      <div className="truncate text-xs text-ada-muted">
                        {(row.athlete?.competition_category ?? "none").replace(/_/g, " ")} ·{" "}
                        {row.athlete?.experience_level ?? "—"} ·{" "}
                        {row.athlete?.goal ?? "—"}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {checkinsLoading ? (
                        <span className="text-xs text-ada-muted">…</span>
                      ) : (
                        <StatusPill status={status} />
                      )}
                      <span className="whitespace-nowrap text-xs text-ada-teal">Open →</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState
            title="No athletes assigned yet"
            description="Assign athletes from the roster or invite them to sign up with the athlete role."
            icon="👥"
            action={
              <Link to="/app/programs">
                <Button variant="ghost">Build a program</Button>
              </Link>
            }
          />
        )}
      </Card>
    </div>
  );
}
