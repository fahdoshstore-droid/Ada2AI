import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { useCoachProfile } from "../../hooks/useProfile";
import {
  useCoachPendingRequests,
  useAcceptRequest,
  useRejectRequest,
} from "../../hooks/useRequests";
import {
  Button,
  Card,
  EmptyState,
  IconBadge,
  LoadingState,
  PageHeader,
  SectionTitle,
  StatNumber,
} from "../../components/ui";
import { Icon } from "../../components/Icon";
import { HeroBanner } from "../../components/Media";
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
  reviewed: { label: "Reviewed", dot: "bg-ada-success", text: "text-ada-success bg-ada-success/10" },
  submitted: { label: "Submitted", dot: "bg-ada-amber", text: "text-ada-amber bg-ada-amber/10" },
  overdue: { label: "Overdue", dot: "bg-ada-red", text: "text-ada-red bg-ada-red/10" },
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
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${meta.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

export function CoachDashboard() {
  const { userId } = useAuth();
  const { data: profile, isLoading } = useCoachProfile();

  const pendingRequests = useCoachPendingRequests();
  const acceptRequest = useAcceptRequest();
  const rejectRequest = useRejectRequest();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

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

  if (isLoading) return <LoadingState />;
  if (!profile) return <Navigate to="/onboard" replace />;

  const sortedRoster = [...(roster.data ?? [])].sort(
    (a, b) =>
      STATUS_RANK[athleteStatus(latestByAthlete.get(a.athlete_id))] -
      STATUS_RANK[athleteStatus(latestByAthlete.get(b.athlete_id))],
  );

  const kpis: { label: string; value: number | null; sub: string; tone?: "alert" | "teal" }[] = [
    { label: "Athletes", value: roster.data?.length ?? null, sub: "on your roster", tone: "teal" },
    { label: "Programs", value: typeof programs.data === "number" ? programs.data : null, sub: "created" },
    {
      label: "Pending check-ins",
      value: pendingCount,
      sub: pendingCount ? "awaiting review" : "all caught up",
      tone: pendingCount ? "alert" : undefined,
    },
  ];

  return (
    <div className="ada-stagger space-y-8 sm:space-y-10">
      <HeroBanner photo="coach-portrait" alt="Ada2Physique coach portrait in the gym" position="50% 8%">
        <PageHeader
          eyebrow="Command center"
          title={profile.display_name ? `Coach ${profile.display_name}` : "Coach dashboard"}
          subtitle={
            <>
              {profile.specialties.length ? profile.specialties.join(" · ") : "Set your specialties"} ·{" "}
              {profile.years_experience ?? "—"} yrs experience
            </>
          }
          action={
            <>
              <Link to="/app/checkins">
                <Button className="py-3">
                  <Icon name="checkin" size={16} /> Review check-ins
                  {pendingCount ? (
                    <span className="rounded-full bg-ada-navy/15 px-2 py-0.5 font-mono-num text-xs">{pendingCount}</span>
                  ) : null}
                </Button>
              </Link>
              <Link to="/app/programs">
                <Button variant="ghost" className="py-3">
                  <Icon name="plus" size={15} /> Generate program
                </Button>
              </Link>
            </>
          }
        />
      </HeroBanner>

      {/* ── Coaching requests ── */}
      <section className="ada-glass rounded-[var(--radius-panel)] p-6 sm:p-7">
        <SectionTitle
          hint={
            pendingRequests.data?.length
              ? String(pendingRequests.data.length)
              : undefined
          }
        >
          طلبات التدريب
        </SectionTitle>
        {pendingRequests.isLoading ? (
          <LoadingState label="جارٍ تحميل الطلبات…" />
        ) : pendingRequests.data?.length ? (
          <ul className="mt-4 space-y-3">
            {pendingRequests.data.map((req) => (
              <li key={req.id} className="ada-inset rounded-2xl p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-ada-teal-soft to-ada-ocean font-mono-num text-xs font-semibold text-ada-navy">
                    {(req.athleteName ?? "م").slice(0, 2)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-ada-text">
                      {req.athleteName ?? "متدرب جديد"}
                    </div>
                    <div className="text-xs text-ada-muted">طلب تدريب جديد</div>
                    {req.message ? (
                      <p className="mt-2 rounded-xl bg-white/[0.03] px-3 py-2 text-sm text-ada-text-2">
                        {req.message}
                      </p>
                    ) : null}
                  </div>
                </div>

                {rejectingId === req.id ? (
                  <div className="mt-4 rounded-xl bg-ada-navy/40 p-3">
                    <div className="text-sm font-medium text-ada-text">
                      رفض طلب التدريب؟
                    </div>
                    <input
                      className="ada-input mt-2"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="سبب الرفض (اختياري)"
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        variant="danger"
                        className="py-2"
                        loading={rejectRequest.isPending}
                        onClick={async () => {
                          try {
                            await rejectRequest.mutateAsync({
                              requestId: req.id,
                              reason: rejectReason,
                            });
                          } catch {
                            /* spec §27 — no raw errors surfaced */
                          }
                          setRejectingId(null);
                          setRejectReason("");
                        }}
                      >
                        رفض الطلب
                      </Button>
                      <Button
                        variant="ghost"
                        className="py-2"
                        onClick={() => {
                          setRejectingId(null);
                          setRejectReason("");
                        }}
                      >
                        إلغاء
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      className="py-2"
                      loading={acceptRequest.isPending}
                      onClick={() => acceptRequest.mutate(req.id)}
                    >
                      قبول الطلب
                    </Button>
                    <Button
                      variant="ghost"
                      className="py-2"
                      onClick={() => {
                        setRejectingId(req.id);
                        setRejectReason("");
                      }}
                    >
                      رفض
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="لا توجد طلبات جديدة"
            description="ستظهر هنا طلبات التدريب التي يرسلها المتدربون."
            icon={<Icon name="users" size={20} />}
          />
        )}
      </section>

      {/* ── KPI strip: one surface, not many cards ── */}
      <section className="ada-glass overflow-hidden rounded-[var(--radius-panel)]">
        <div className="grid grid-cols-2 divide-white/[0.06] sm:grid-cols-4 sm:divide-x">
          {kpis.map((k) => (
            <div key={k.label} className="relative px-5 py-6 sm:px-7 sm:py-8">
              {k.tone === "alert" ? (
                <span aria-hidden className="absolute right-5 top-6 h-2 w-2 rounded-full bg-ada-red shadow-[0_0_12px_#FF5A52]" />
              ) : null}
              <div className="text-[0.8125rem] text-ada-text-2">{k.label}</div>
              <div className="mt-4">
                {k.value == null ? (
                  <span className="font-mono-num text-[2.75rem] leading-none text-ada-faint">—</span>
                ) : (
                  <StatNumber value={k.value} size="lg" />
                )}
              </div>
              <div className={`mt-2 text-xs ${k.tone === "alert" ? "text-ada-red" : "text-ada-muted"}`}>{k.sub}</div>
            </div>
          ))}
          <div className="relative px-5 py-6 sm:px-7 sm:py-8">
            <div className="text-[0.8125rem] text-ada-text-2">Status</div>
            <div className="mt-4 flex flex-col gap-2 text-sm">
              <span className={`inline-flex items-center gap-2 ${profile.is_verified ? "text-ada-success" : "text-ada-muted"}`}>
                <Icon name={profile.is_verified ? "check" : "minus"} size={15} /> {profile.is_verified ? "Verified" : "Not verified"}
              </span>
              <span className={`inline-flex items-center gap-2 ${profile.is_accepting_athletes ? "text-ada-teal" : "text-ada-muted"}`}>
                <Icon name={profile.is_accepting_athletes ? "users" : "minus"} size={15} />
                {profile.is_accepting_athletes ? "Accepting athletes" : "Roster closed"}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px] xl:gap-8">
        {/* ── Roster with check-in status ── */}
        <Card className="sm:p-7">
          <SectionTitle hint="Pending first">Your athletes</SectionTitle>
          {roster.isLoading ? (
            <LoadingState label="Loading roster…" />
          ) : sortedRoster.length ? (
            <ul className="space-y-2">
              {sortedRoster.map((row) => {
                const status = athleteStatus(latestByAthlete.get(row.athlete_id));
                const name = row.athlete?.display_name ?? "Unnamed athlete";
                return (
                  <li key={row.id}>
                    <Link
                      to={`/app/checkins?athlete=${row.athlete_id}`}
                      className="ada-inset group flex items-center justify-between gap-3 rounded-2xl px-4 py-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.05]"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-ada-teal-soft to-ada-ocean font-mono-num text-xs font-semibold text-ada-navy">
                          {name.slice(0, 2).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-ada-text">{name}</div>
                          <div className="truncate text-xs capitalize text-ada-muted">
                            {(row.athlete?.competition_category ?? "none").replace(/_/g, " ")} ·{" "}
                            {row.athlete?.experience_level ?? "—"} · {row.athlete?.goal ?? "—"}
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        {checkinsLoading ? <span className="text-xs text-ada-muted">…</span> : <StatusPill status={status} />}
                        <Icon name="chevron" size={16} className="text-ada-muted transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              title="لا يوجد متدربون حالياً"
              description="سيظهر المتدربون هنا فور قبول طلبات التدريب الخاصة بهم."
              icon={<Icon name="users" size={20} />}
              action={
                <Link to="/coaches">
                  <Button variant="ghost">عرض ملفك العام</Button>
                </Link>
              }
            />
          )}
        </Card>

        <div className="space-y-6">
          {/* ── Latest check-in ── */}
          <Card>
            <SectionTitle hint="Latest">Latest check-in</SectionTitle>
            {checkinsLoading ? (
              <LoadingState label="Loading latest check-in…" />
            ) : latestOverall ? (
              <Link
                to={`/app/checkins?athlete=${latestOverall.athlete_id}`}
                className="ada-inset group block rounded-2xl p-4 transition hover:bg-white/[0.05]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <IconBadge name="checkin" />
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-ada-text">
                        {latestOverall.athlete?.display_name ?? "Athlete"}
                      </div>
                      <div className="font-mono-num text-xs text-ada-muted">
                        {latestOverall.check_in_date}
                        {latestOverall.bodyweight_kg != null ? ` · ${latestOverall.bodyweight_kg} kg` : ""}
                      </div>
                    </div>
                  </div>
                  <StatusPill status={athleteStatus(latestOverall)} />
                </div>
                <div className="mt-3 inline-flex items-center gap-1 text-xs text-ada-teal">
                  Open <Icon name="arrow" size={13} />
                </div>
              </Link>
            ) : (
              <EmptyState
                title="No check-ins yet"
                description="Athletes will appear here once they submit a weekly check-in."
                icon={<Icon name="checkin" size={20} />}
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
