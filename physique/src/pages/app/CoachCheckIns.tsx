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
  SectionTitle,
} from "../../components/ui";
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
    return <div className="h-28 w-24 animate-pulse rounded-lg bg-ada-surface" />;
  }
  if (!data) {
    return (
      <div className="flex h-28 w-24 items-center justify-center rounded-lg bg-ada-surface text-xs text-ada-muted">
        —
      </div>
    );
  }
  return (
    <figure className="flex flex-col items-center gap-1">
      <img
        src={data}
        alt={photoLabelFromPath(path)}
        className="h-28 w-24 rounded-lg border border-white/10 object-cover"
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
    <div className="space-y-6">
      <SectionTitle hint="Weekly">Athlete check-ins</SectionTitle>

      {checkins.isLoading ? (
        <LoadingState label="Loading check-ins…" />
      ) : checkins.error ? (
        <ErrorState message={checkins.error.message} />
      ) : !checkins.data?.length ? (
        <Card>
          <EmptyState
            title="No check-ins"
            description="Athletes you coach will appear here once they submit a weekly check-in."
            icon="🗹"
          />
        </Card>
      ) : selected ? (
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <button
                className="text-xs text-ada-teal hover:underline"
                onClick={() => {
                  setSelectedId(null);
                  setFeedback("");
                }}
              >
                ← Back to list
              </button>
              <h3 className="mt-1 text-lg font-bold text-ada-text">
                {selected.athlete?.display_name ?? "Athlete"} ·{" "}
                {selected.check_in_date}
              </h3>
            </div>
            <Badge tone={STATUS_TONE[selected.status]}>{selected.status}</Badge>
          </div>

          {selected.bodyweight_kg != null ? (
            <p className="text-sm text-ada-muted">
              Bodyweight:{" "}
              <span className="font-mono-num text-ada-text">
                {selected.bodyweight_kg} kg
              </span>
            </p>
          ) : null}
          {selected.athlete_notes ? (
            <p className="mt-2 text-sm text-ada-text/80">
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
            <div className="mt-4 rounded-lg border border-ada-teal/15 bg-ada-teal/5 p-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-ada-teal">
                Your previous feedback
              </span>
              <p className="mt-1 text-sm text-ada-text/90">{selected.coach_notes}</p>
            </div>
          ) : null}

          <form
            className="mt-4 space-y-3"
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
              <Button type="submit" loading={review.isPending}>
                Mark reviewed
              </Button>
              {review.isSuccess ? (
                <span className="text-sm text-ada-success">Reviewed ✓</span>
              ) : null}
            </div>
            {review.error ? <ErrorState message={review.error.message} /> : null}
          </form>
        </Card>
      ) : (
        <Card>
          <ul className="divide-y divide-white/5">
            {checkins.data.map((ci) => (
              <li key={ci.id}>
                <button
                  className="flex w-full items-center justify-between gap-3 py-3 text-left"
                  onClick={() => {
                    setSelectedId(ci.id);
                    setFeedback(ci.coach_notes ?? "");
                  }}
                >
                  <span className="min-w-0">
                    <span className="font-semibold text-ada-text">
                      {ci.athlete?.display_name ?? "Athlete"}
                    </span>
                    <span className="ml-2 text-sm text-ada-muted">
                      {ci.check_in_date}
                    </span>
                    {ci.bodyweight_kg != null ? (
                      <span className="ml-2 text-sm text-ada-muted">
                        · {ci.bodyweight_kg} kg
                      </span>
                    ) : null}
                  </span>
                  <Badge tone={STATUS_TONE[ci.status]}>{ci.status}</Badge>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
