import { useState } from "react";
import type { ReactNode } from "react";
import type { ExerciseLibrary, ProgramBlock } from "../lib/types";
import { Badge } from "./ui";
import { exerciseVisualPath } from "../lib/exerciseVisuals";

interface ExerciseDetailProps {
  block: ProgramBlock;
  exercise: ExerciseLibrary | null;
  onClose: () => void;
  children?: ReactNode;
}

export function ExerciseDetail({ block, exercise, onClose, children }: ExerciseDetailProps) {
  const [showVideo, setShowVideo] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const name = exercise?.name ?? block.exercise_name;
  const nameAr = exercise?.name_ar ?? null;
  const image = exercise?.image_url ?? exerciseVisualPath(exercise?.name);
  const video = exercise?.video_demo_url ?? null;
  const instructions = exercise?.instructions ?? null;
  const mistakes = exercise?.common_mistakes ?? null;
  const coachNote = block.technique_notes ?? exercise?.coach_note ?? null;
  const equipment = exercise?.equipment ?? null;
  const mediaReady = Boolean(image) && Boolean(video);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-ada-teal/20 bg-ada-card p-5 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-ada-text">{name}</h3>
            {nameAr ? (
              <p className="mt-0.5 text-base text-ada-teal" dir="rtl">{nameAr}</p>
            ) : null}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ada-muted hover:bg-white/5 hover:text-ada-text"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Hero image */}
        {image && !imageError ? (
          <div className="mb-4 overflow-hidden rounded-lg border border-white/5">
            <img
              src={image}
              alt={name}
              className="h-48 w-full object-cover sm:h-56"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          <div className="mb-4 flex h-32 items-center justify-center rounded-lg border border-dashed border-white/10 bg-ada-surface px-4 text-center text-sm text-ada-muted">
            Coach content coming soon
          </div>
        )}

        {/* Media status */}
        <div className="mb-4">
          <Badge tone={mediaReady ? "success" : "amber"}>
            {mediaReady ? "Media ready" : "Media coming soon"}
          </Badge>
        </div>

        {/* Demo video */}
        {video && !videoError ? (
          <div className="mb-4">
            {showVideo ? (
              <video
                src={video}
                controls
                className="w-full rounded-lg border border-white/5"
                preload="metadata"
                onError={() => setVideoError(true)}
              />
            ) : (
              <button
                onClick={() => setShowVideo(true)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-ada-teal/30 bg-ada-teal/10 py-2.5 text-sm font-medium text-ada-teal hover:bg-ada-teal/15"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Play demonstration video
              </button>
            )}
          </div>
        ) : (
          <div className="mb-4 flex items-center justify-center rounded-lg border border-dashed border-white/10 bg-ada-surface px-4 py-3 text-center text-xs text-ada-muted">
            Coach content coming soon
          </div>
        )}

        {/* Prescription */}
        <div className="mb-4 grid grid-cols-3 gap-2 rounded-lg bg-ada-surface p-3 text-center">
          <div>
            <div className="text-xs text-ada-muted">Sets</div>
            <div className="text-lg font-bold text-ada-text">{block.sets ?? "-"}</div>
          </div>
          <div>
            <div className="text-xs text-ada-muted">Reps</div>
            <div className="text-lg font-bold text-ada-text">{block.reps ?? "-"}</div>
          </div>
          <div>
            <div className="text-xs text-ada-muted">Rest</div>
            <div className="text-lg font-bold text-ada-text">
              {block.rest_seconds ? `${block.rest_seconds}s` : "-"}
            </div>
          </div>
        </div>

        {block.rpe ? (
          <div className="mb-4">
            <Badge tone="teal">RPE {block.rpe}</Badge>
            {block.tempo ? <Badge tone="neutral">Tempo {block.tempo}</Badge> : null}
          </div>
        ) : null}

        {/* Technique instructions */}
        {instructions ? (
          <div className="mb-4">
            <h4 className="mb-2 text-sm font-bold text-ada-teal">Technique</h4>
            <p className="whitespace-pre-line text-sm text-ada-text/80">{instructions}</p>
          </div>
        ) : (
          <div className="mb-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-400/80">
            Coach content coming soon
          </div>
        )}

        {/* Common mistakes */}
        {mistakes ? (
          <div className="mb-4">
            <h4 className="mb-2 text-sm font-bold text-ada-red">Common Mistakes</h4>
            <p className="whitespace-pre-line text-sm text-ada-text/80">{mistakes}</p>
          </div>
        ) : (
          <div className="mb-4 rounded-lg border border-white/10 bg-ada-surface p-3 text-xs text-ada-muted">
            Coach content coming soon
          </div>
        )}

        {/* Coach note */}
        {coachNote ? (
          <div className="mb-4 rounded-lg border border-ada-teal/15 bg-ada-teal/5 p-3">
            <h4 className="mb-1 text-sm font-bold text-ada-teal">Coach Note</h4>
            <p className="whitespace-pre-line text-sm text-ada-text/80">{coachNote}</p>
          </div>
        ) : (
          <div className="mb-4 rounded-lg border border-white/10 bg-ada-surface p-3 text-xs text-ada-muted">
            Coach content coming soon
          </div>
        )}

        {/* Equipment */}
        {equipment ? (
          <div className="mb-4">
            <Badge tone="neutral">{equipment}</Badge>
          </div>
        ) : null}

        {/* Muscle groups */}
        {exercise?.muscle_groups?.length ? (
          <div className="flex flex-wrap gap-1.5">
            {exercise.muscle_groups.map((mg) => (
              <Badge key={mg} tone="neutral">{mg}</Badge>
            ))}
          </div>
        ) : null}

        {children}
      </div>
    </div>
  );
}
