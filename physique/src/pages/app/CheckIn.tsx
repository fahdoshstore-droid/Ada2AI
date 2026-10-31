import { useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { useAthleteProfile } from "../../hooks/useProfile";
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
import { HeroBanner } from "../../components/Media";
import type {
  CheckIn,
  CheckInStatus,
  SignUploadResponse,
  SignedUrlResponse,
} from "../../lib/types";
import { photoLabelFromPath } from "../../lib/types";

type PhotoKey = "front" | "side" | "back";

const PHOTOS: { key: PhotoKey; label: string }[] = [
  { key: "front", label: "Front" },
  { key: "side", label: "Side" },
  { key: "back", label: "Back" },
];

const STATUS_TONE: Record<CheckInStatus, "neutral" | "teal" | "success"> = {
  draft: "neutral",
  submitted: "teal",
  reviewed: "success",
};

/** Fetches a short-lived signed download URL for one stored check-in photo. */
function CheckInPhoto({ path }: { path: string }) {
  const { data, isLoading, error } = useQuery<string>({
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
  if (error || !data) {
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

export function CheckIn() {
  const { userId } = useAuth();
  const qc = useQueryClient();
  const { data: profile, isLoading: profileLoading } = useAthleteProfile();

  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [chosen, setChosen] = useState<Record<PhotoKey, string>>({
    front: "",
    side: "",
    back: "",
  });
  const filesRef = useRef<Record<PhotoKey, File | null>>({
    front: null,
    side: null,
    back: null,
  });

  if (!profileLoading && !profile) return <Navigate to="/onboard" replace />;

  const checkins = useQuery<CheckIn[]>({
    queryKey: ["athlete-checkins", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("physique_check_ins")
        .select("*")
        .eq("athlete_id", userId!)
        .order("check_in_date", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as CheckIn[];
    },
  });

  async function uploadOne(file: File, label: PhotoKey): Promise<string> {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const contentType = file.type || "image/jpeg";
    const { path, signed_url } = await api.post<SignUploadResponse>(
      "/uploads/sign",
      { bucket: "physique-photos", ext, content_type: contentType, label },
    );
    const up = await fetch(signed_url, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": contentType },
    });
    if (!up.ok) throw new Error(`Photo upload failed (${up.status})`);
    return path;
  }

  const submit = useMutation<void, Error, void>({
    mutationFn: async () => {
      const photoPaths: string[] = [];
      for (const { key } of PHOTOS) {
        const f = filesRef.current[key];
        if (f) photoPaths.push(await uploadOne(f, key));
      }
      const { error } = await supabase.from("physique_check_ins").insert({
        athlete_id: userId!,
        coach_id: profile?.coach_id ?? null,
        bodyweight_kg: weight ? Number(weight) : null,
        photo_urls: photoPaths,
        athlete_notes: notes.trim() || null,
        status: "submitted",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setWeight("");
      setNotes("");
      setChosen({ front: "", side: "", back: "" });
      filesRef.current = { front: null, side: null, back: null };
      qc.invalidateQueries({ queryKey: ["athlete-checkins", userId] });
    },
  });

  const canSubmit = !!userId && !!weight;

  return (
    <div className="ada-stagger space-y-8 sm:space-y-10">
      <HeroBanner photo="nutrition-prep" alt="Meal prep, water and the Ada2Physique app on a kitchen counter" position="60% 50%">
        <PageHeader
          eyebrow="Weekly"
          title="Check-in"
          subtitle="Weight, photos and how the week went — your coach reviews every submission."
        />
      </HeroBanner>

      <Card className="sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <IconBadge name="checkin" size={40} />
          <h2 className="text-lg font-semibold tracking-tight">This week</h2>
        </div>
        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (canSubmit) submit.mutate();
          }}
        >
          <label className="block">
            <span className="ada-label">Bodyweight (kg)</span>
            <input
              type="number"
              step="0.1"
              min="0"
              inputMode="decimal"
              className="ada-input max-w-56 font-mono-num"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="88.5"
              required
            />
          </label>

          <div>
            <span className="ada-label">Progress photos</span>
            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {PHOTOS.map(({ key, label }) => (
                <label
                  key={key}
                  className="group flex cursor-pointer flex-col gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm transition-colors duration-300 hover:border-ada-teal/40 hover:bg-ada-teal/[0.03]"
                >
                  <span className="flex items-center gap-2 font-medium text-ada-text">
                    <Icon name="camera" size={16} className="text-ada-muted transition-colors group-hover:text-ada-teal" />
                    {label}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="text-xs text-ada-muted file:mr-2 file:rounded-full file:border-0 file:bg-ada-teal/15 file:px-3 file:py-1 file:text-ada-teal"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      filesRef.current[key] = f;
                      setChosen((c) => ({ ...c, [key]: f ? f.name : "" }));
                    }}
                  />
                  {chosen[key] ? (
                    <span className="truncate text-xs text-ada-muted">
                      {chosen[key]}
                    </span>
                  ) : null}
                </label>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="ada-label">Notes (optional)</span>
            <textarea
              rows={3}
              className="ada-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How the week went, energy, adherence…"
            />
          </label>

          <div className="flex items-center gap-3">
            <Button type="submit" loading={submit.isPending} disabled={!canSubmit} className="py-3">
              <Icon name="send" size={15} /> Submit check-in
            </Button>
            {submit.isSuccess ? (
              <span className="inline-flex items-center gap-1.5 text-sm text-ada-success">
                <Icon name="check" size={15} /> Submitted
              </span>
            ) : null}
          </div>
          {submit.error ? <ErrorState message={submit.error.message} /> : null}
        </form>
      </Card>

      <Card>
        <SectionTitle>History</SectionTitle>
        {checkins.isLoading ? (
          <LoadingState label="Loading check-ins…" />
        ) : checkins.error ? (
          <ErrorState message={checkins.error.message} />
        ) : checkins.data?.length ? (
          <ul className="space-y-4">
            {checkins.data.map((ci) => (
              <li
                key={ci.id}
                className="ada-inset rounded-2xl p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono-num font-medium text-ada-text">
                    {ci.check_in_date}
                  </span>
                  <Badge tone={STATUS_TONE[ci.status]}>{ci.status}</Badge>
                </div>
                {ci.bodyweight_kg != null ? (
                  <p className="mt-1 text-sm text-ada-muted">
                    Bodyweight:{" "}
                    <span className="font-mono-num text-ada-text">
                      {ci.bodyweight_kg} kg
                    </span>
                  </p>
                ) : null}
                {ci.athlete_notes ? (
                  <p className="mt-1 text-sm text-ada-text/80">{ci.athlete_notes}</p>
                ) : null}
                {ci.photo_urls?.length ? (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {ci.photo_urls.map((p) => (
                      <CheckInPhoto key={p} path={p} />
                    ))}
                  </div>
                ) : null}
                {ci.coach_notes ? (
                  <div className="mt-4 rounded-2xl border border-ada-teal/20 bg-ada-teal/[0.06] p-4">
                    <span className="ada-eyebrow !text-ada-teal">
                      Coach feedback
                    </span>
                    <p className="mt-1 text-sm text-ada-text/90">{ci.coach_notes}</p>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No check-ins yet"
            description="Submit your first weekly check-in above."
            icon={<Icon name="checkin" size={20} />}
          />
        )}
      </Card>
    </div>
  );
}
