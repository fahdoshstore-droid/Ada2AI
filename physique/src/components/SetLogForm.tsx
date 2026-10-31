import { useMemo, useState } from "react";
import type { ProgramBlock, WorkoutLog } from "../lib/types";
import { Button } from "./ui";

export interface SetLogValues {
  setNumber: number;
  weightKg: number | null;
  reps: number | null;
  rpe: number | null;
  notes: string | null;
  videoUrl: string | null;
}

interface SetLogFormProps {
  block: ProgramBlock;
  logs: WorkoutLog[];
  saving?: boolean;
  onSave: (values: SetLogValues) => Promise<void> | void;
}

export function SetLogForm({ block, logs, saving = false, onSave }: SetLogFormProps) {
  const prescribedSets = Math.max(block.sets ?? 0, 1);
  const firstIncompleteSet = useMemo(() => {
    const completed = new Set(
      logs
        .map((log) => log.set_number)
        .filter((setNumber): setNumber is number => setNumber != null),
    );
    for (let setNumber = 1; setNumber <= prescribedSets; setNumber += 1) {
      if (!completed.has(setNumber)) return setNumber;
    }
    return prescribedSets;
  }, [logs, prescribedSets]);

  const [activeSet, setActiveSet] = useState(firstIncompleteSet);
  const currentLog = useMemo(
    () =>
      logs.find(
        (log) =>
          log.set_number === activeSet &&
          log.exercise_id === block.exercise_id,
      ) ?? null,
    [activeSet, block.exercise_id, logs],
  );

  const [weight, setWeight] = useState(currentLog?.weight_kg?.toString() ?? "");
  const [reps, setReps] = useState(currentLog?.reps?.toString() ?? "");
  const [rpe, setRpe] = useState(currentLog?.rpe?.toString() ?? "");
  const [notes, setNotes] = useState(currentLog?.notes ?? "");
  const [videoUrl, setVideoUrl] = useState(currentLog?.video_url ?? "");

  function selectSet(setNumber: number) {
    setActiveSet(setNumber);
    const existing = logs.find(
      (log) => log.set_number === setNumber && log.exercise_id === block.exercise_id,
    );
    setWeight(existing?.weight_kg?.toString() ?? "");
    setReps(existing?.reps?.toString() ?? "");
    setRpe(existing?.rpe?.toString() ?? "");
    setNotes(existing?.notes ?? "");
    setVideoUrl(existing?.video_url ?? "");
  }

  async function saveSet() {
    const parsedWeight = weight.trim() === "" ? null : Number(weight);
    const parsedReps = reps.trim() === "" ? null : Number(reps);
    const parsedRpe = rpe.trim() === "" ? null : Number(rpe);
    if (parsedWeight == null || !Number.isFinite(parsedWeight) || parsedWeight < 0) {
      return;
    }
    if (parsedReps == null || !Number.isFinite(parsedReps) || parsedReps < 0) {
      return;
    }
    if (parsedRpe != null && (parsedRpe < 0 || parsedRpe > 10)) return;

    await onSave({
      setNumber: activeSet,
      weightKg: parsedWeight,
      reps: parsedReps,
      rpe: parsedRpe,
      notes: notes.trim() || null,
      videoUrl: videoUrl.trim() || null,
    });

    const nextSet = Math.min(activeSet + 1, prescribedSets);
    if (nextSet !== activeSet) {
      selectSet(nextSet);
    }
  }

  return (
    <div className="mt-5 border-t border-white/10 pt-4">
      <div className="mb-3 flex flex-wrap gap-2">
        {Array.from({ length: prescribedSets }, (_, index) => index + 1).map((setNumber) => {
          const isComplete = logs.some(
            (log) => log.set_number === setNumber && log.exercise_id === block.exercise_id,
          );
          return (
            <button
              key={setNumber}
              type="button"
              onClick={() => selectSet(setNumber)}
              className={`min-h-11 min-w-11 rounded-lg border px-3 text-sm font-semibold transition ${
                activeSet === setNumber
                  ? "border-ada-teal bg-ada-teal/15 text-ada-teal"
                  : isComplete
                    ? "border-ada-success/30 bg-ada-success/10 text-ada-success"
                    : "border-white/10 bg-ada-surface text-ada-muted"
              }`}
            >
              {setNumber}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="ada-label">Weight (kg)</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            className="ada-input h-12 text-base"
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
            placeholder="80"
          />
        </label>
        <label className="col-span-2 block">
          <span className="ada-label">Video URL (optional)</span>
          <input
            type="url"
            className="ada-input h-12 text-base"
            value={videoUrl}
            onChange={(event) => setVideoUrl(event.target.value)}
            placeholder="https://"
          />
        </label>
        <label className="block">
          <span className="ada-label">Reps</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            className="ada-input h-12 text-base"
            value={reps}
            onChange={(event) => setReps(event.target.value)}
            placeholder="10"
          />
        </label>
        <label className="block">
          <span className="ada-label">RPE (optional)</span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            max="10"
            step="0.5"
            className="ada-input h-12 text-base"
            value={rpe}
            onChange={(event) => setRpe(event.target.value)}
            placeholder="8"
          />
        </label>
        <label className="block">
          <span className="ada-label">Notes (optional)</span>
          <input
            type="text"
            className="ada-input h-12 text-base"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Felt strong"
          />
        </label>
      </div>

      <div className="sticky bottom-0 mt-4 border-t border-white/10 bg-ada-card pt-3">
        <Button
          type="button"
          className="w-full"
          loading={saving}
          disabled={!weight.trim() || !reps.trim()}
          onClick={() => void saveSet()}
        >
          {activeSet < prescribedSets ? "Save set & next" : "Save set"}
        </Button>
      </div>
    </div>
  );
}
