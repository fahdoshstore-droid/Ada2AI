import { useEffect, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
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
} from "../../components/ui";
import { Icon } from "../../components/Icon";
import type { CheckIn, CheckInStatus, SignedUrlResponse } from "../../lib/types";
import { photoLabelFromPath } from "../../lib/types";

const STATUS_TONE: Record<CheckInStatus, "neutral" | "teal" | "success"> = {
  draft: "neutral",
  submitted: "teal",
  reviewed: "success",
};

interface CoachCheckIn extends CheckIn {
  athlete: { display_name: string | null } | null;
}

/** Fetches a short-lived signed download URL for one stored check-in photo. */
function CheckInPhoto({ path }: { path: string }) {
  const { data, isLoading } = useQuery<string>({
    queryKey: ["photo-signed", path],
    enabled: !!path,
    queryFn: async () => {
      const res = await api.post<SignedUrlResponse>("/uploads/signed-url", {
        bucket: "physique-photos",
        path,
      });
      return res.signed_url;
    },
    staleTime: 5 * 60 * 1000,
  });
  if (isLoading) {
    return <div className="ada-inset h-28 w-24 animate-pulse rounded-2xl" />;
  }
  if (!data) {
    return (
      <div className="ada-inset flex h-28 w-24 items-center justify-center rounded-2xl text-xs text-ada-muted">
        —
      </div>
    );
  }
  return (
    <figure className="flex flex-col items-center gap-1">
      <img
        src={data}
        alt={photoLabelFromPath(path)}
        className="h-28 w-24 rounded-2xl object-cover ring-1 ring-white/10"
      />
      <figcaption className="text-xs text-ada-muted">
        {photoLabelFromPath(path)}
      </figcaption>
    </figure>
  );
}

export function CoachCheckIns() {
  const { userId } = useAuth();
  const qc = useQueryClient();
  const { data: profile, isLoading: profileLoading } = useCoachProfile();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  if (!profileLoading && !profile) return <Navigate to="/onboard" replace />;

  const checkins = useQuery<CoachCheckIn[]>({
    queryKey: ["coach-checkins", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("physique_check_ins")
        .select("*, athlete:physique_athletes(display_name)")
        .order("check_in_date", { ascending: false })
        .limit(40);
      if (error) throw error;
      return (data ?? []) as unknown as CoachCheckIn[];
    },
  });

  const selected = checkins.data?.find((c) => c.id === selectedId) ?? null;

  const review = useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from("physique_check_ins")
        .update({ coach_notes: feedback.trim() || null, status: "reviewed" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      setFeedback("");
      qc.invalidateQueries({ queryKey: ["coach-checkins", userId] });
    },
  });

  // Quick-open: the coach dashboard links here with ?athlete=<id> to jump
  // straight to that athlete's latest check-in. Auto-select it, then clear the
  // param so the "Back to list" button is not overridden on re-render.
  const [searchParams, setSearchParams] = useSearchParams();
  const deepAthlete = searchParams.get("athlete");
  useEffect(() => {
    if (!deepAthlete || !checkins.data || selectedId) return;
    const latest = checkins.data.find((c) => c.athlete_id === deepAthlete);
    if (latest) {
      setSelectedId(latest.id);
      setFeedback(latest.coach_notes ?? "");
    }
    setSearchParams({}, { replace: true });
  }, [deepAthlete, checkins.data, selectedId, setSearchParams]);

  return (
    <div className="ada-stagger space-y-8 sm:space-y-10">
      <PageHeader
        eyebrow="Weekly review"
        title="Athlete check-ins"
        subtitle="Review weight, photos and notes, then send feedback to close the loop."
      />

      {checkins.isLoading ? (
        <LoadingState label="Loading check-ins…" />
      ) : checkins.error ? (
        <ErrorState message={checkins.error.message} />
      ) : !checkins.data?.length ? (
        <Card>
          <EmptyState
            title="No check-ins"
            description="Athletes you coach will appear here once they submit a weekly check-in."
            icon={<Icon name="checkin" size={20} />}
          />
        </Card>
      ) : selected ? (
        <Card className="sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <button
                className="inline-flex items-center gap-1 text-xs font-medium text-ada-teal transition-opacity hover:opacity-80"
                onClick={() => {
                  setSelectedId(null);
                  setFeedback("");
                }}
              >
                <Icon name="chevron" size={14} className="rotate-180" /> Back to list
              </button>
              <h3 className="mt-2 text-[1.5rem] font-semibold tracking-tight text-ada-text">
                {selected.athlete?.display_name ?? "Athlete"} ·{" "}
                {selected.check_in_date}
              </h3>
            </div>
            <Badge tone={STATUS_TONE[selected.status]}>{selected.status}</Badge>
          </div>

          {selected.bodyweight_kg != null ? (
            <div className="ada-inset inline-flex items-baseline gap-2 rounded-2xl px-4 py-3">
              <span className="text-xs text-ada-muted">Bodyweight</span>
              <span className="font-mono-num text-2xl text-ada-text">{selected.bodyweight_kg}</span>
              <span className="text-xs text-ada-muted">kg</span>
            </div>
          ) : null}
          {selected.athlete_notes ? (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ada-text-2">
              {selected.athlete_notes}
            </p>
          ) : null}

          {selected.photo_urls?.length ? (
            <div className="mt-4 flex flex-wrap gap-3">
              {selected.photo_urls.map((p) => (
                <CheckInPhoto key={p} path={p} />
              ))}
            </div>
          ) : null}

          {selected.coach_notes ? (
            <div className="mt-5 rounded-2xl border border-ada-teal/20 bg-ada-teal/[0.06] p-4">
              <span className="ada-eyebrow !text-ada-teal">
                Your previous feedback
              </span>
              <p className="mt-1 text-sm text-ada-text/90">{selected.coach_notes}</p>
            </div>
          ) : null}

          <form
            className="mt-6 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (selectedId) review.mutate(selectedId);
            }}
          >
            <label className="block">
              <span className="ada-label">Feedback</span>
              <textarea
                rows={3}
                className="ada-input"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Coach notes for the athlete…"
              />
            </label>
            <div className="flex items-center gap-3">
              <Button type="submit" loading={review.isPending} className="py-3">
                <Icon name="check" size={15} /> Mark reviewed
              </Button>
              {review.isSuccess ? (
                <span className="inline-flex items-center gap-1.5 text-sm text-ada-success">
                  <Icon name="check" size={15} /> Reviewed
                </span>
              ) : null}
            </div>
            {review.error ? <ErrorState message={review.error.message} /> : null}
          </form>
        </Card>
      ) : (
        <Card>
          <ul className="space-y-2">
            {checkins.data.map((ci) => (
              <li key={ci.id}>
                <button
                  className="ada-inset group flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3.5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.05]"
                  onClick={() => {
                    setSelectedId(ci.id);
                    setFeedback(ci.coach_notes ?? "");
                  }}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-ada-teal-soft to-ada-ocean font-mono-num text-xs font-semibold text-ada-navy">
                      {(ci.athlete?.display_name ?? "A").slice(0, 2).toUpperCase()}
                    </span>
                    <span className="min-w-0">
                    <span className="block truncate font-semibold text-ada-text">
                      {ci.athlete?.display_name ?? "Athlete"}
                    </span>
                    <span className="font-mono-num text-xs text-ada-muted">
                      {ci.check_in_date}
                    </span>
                    {ci.bodyweight_kg != null ? (
                      <span className="ml-2 font-mono-num text-xs text-ada-muted">
                        · {ci.bodyweight_kg} kg
                      </span>
                    ) : null}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <Badge tone={STATUS_TONE[ci.status]}>{ci.status}</Badge>
                    <Icon name="chevron" size={16} className="text-ada-muted transition-transform group-hover:translate-x-0.5" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
