import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { Badge, Button, Card, ErrorState, LoadingState } from "./ui";
import { exerciseVisualPath } from "../lib/exerciseVisuals";
import type { ExerciseLibrary } from "../lib/types";

interface ExercisePickerProps {
  onPick: (exercise: ExerciseLibrary) => void;
}

export function ExercisePicker({ onPick }: ExercisePickerProps) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newArabic, setNewArabic] = useState("");
  const [newCategory, setNewCategory] = useState("compound");
  const [equipment, setEquipment] = useState("machine");
  const [muscleGroups, setMuscleGroups] = useState("");
  const [instructions, setInstructions] = useState("");
  const [mistakes, setMistakes] = useState("");
  const [coachNote, setCoachNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const exercises = useQuery<ExerciseLibrary[]>({
    queryKey: ["exercise-library-picker"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("physique_exercise_library")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = useMemo(() => {
    const values = exercises.data ?? [];
    const term = search.trim().toLowerCase();
    return values.filter((exercise) => {
      const matchesSearch =
        !term ||
        exercise.name.toLowerCase().includes(term) ||
        (exercise.name_ar ?? "").toLowerCase().includes(term);
      const matchesCategory = category === "all" || exercise.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [category, exercises.data, search]);

  const createExercise = async () => {
    setError(null);
    const name = newName.trim();
    if (!name) return;
    const existing = (exercises.data ?? []).some(
      (exercise) => exercise.name.toLowerCase() === name.toLowerCase(),
    );
    if (existing) {
      setError("An exercise with that name already exists.");
      return;
    }
    const { error: insertError } = await supabase
      .from("physique_exercise_library")
      .insert({
        name,
        name_ar: newArabic.trim() || null,
        category: newCategory,
        equipment: equipment.trim() || null,
        muscle_groups: muscleGroups
          .split(",")
          .map((part) => part.trim())
          .filter(Boolean),
        instructions: instructions.trim() || null,
        common_mistakes: mistakes.trim() || null,
        coach_note: coachNote.trim() || null,
        is_cv_supported: false,
      });
    if (insertError) {
      setError("Could not create the exercise.");
      return;
    }
    setNewName("");
    setNewArabic("");
    setMuscleGroups("");
    setInstructions("");
    setMistakes("");
    setCoachNote("");
    setShowCreate(false);
    await qc.invalidateQueries({ queryKey: ["exercise-library-picker"] });
  };

  return (
    <Card>
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-[240px] flex-1">
          <span className="ada-label">Search exercise</span>
          <input
            className="ada-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Machine Fly, Weighted Crunches…"
          />
        </label>
        <label className="block">
          <span className="ada-label">Category</span>
          <select className="ada-input" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">All</option>
            <option value="compound">Compound</option>
            <option value="isolation">Isolation</option>
            <option value="accessory">Accessory</option>
            <option value="mobility">Mobility</option>
            <option value="cardio">Cardio</option>
          </select>
        </label>
        <Button variant="ghost" onClick={() => setShowCreate((value) => !value)}>
          Add new exercise
        </Button>
      </div>

      {showCreate ? (
        <div className="mt-4 grid gap-3 rounded-lg border border-white/10 bg-ada-surface p-4 sm:grid-cols-2">
          <label>
            <span className="ada-label">Name</span>
            <input className="ada-input" value={newName} onChange={(event) => setNewName(event.target.value)} />
          </label>
          <label>
            <span className="ada-label">Arabic name</span>
            <input className="ada-input" value={newArabic} onChange={(event) => setNewArabic(event.target.value)} />
          </label>
          <label>
            <span className="ada-label">Category</span>
            <select className="ada-input" value={newCategory} onChange={(event) => setNewCategory(event.target.value)}>
              <option value="compound">compound</option>
              <option value="isolation">isolation</option>
              <option value="accessory">accessory</option>
              <option value="mobility">mobility</option>
              <option value="cardio">cardio</option>
            </select>
          </label>
          <label>
            <span className="ada-label">Equipment</span>
            <input className="ada-input" value={equipment} onChange={(event) => setEquipment(event.target.value)} />
          </label>
          <label className="sm:col-span-2">
            <span className="ada-label">Muscle groups</span>
            <input className="ada-input" value={muscleGroups} onChange={(event) => setMuscleGroups(event.target.value)} placeholder="chest, triceps" />
          </label>
          <label className="sm:col-span-2">
            <span className="ada-label">Instructions</span>
            <textarea className="ada-input" value={instructions} onChange={(event) => setInstructions(event.target.value)} />
          </label>
          <label className="sm:col-span-2">
            <span className="ada-label">Common mistakes</span>
            <textarea className="ada-input" value={mistakes} onChange={(event) => setMistakes(event.target.value)} />
          </label>
          <label className="sm:col-span-2">
            <span className="ada-label">Coach note</span>
            <textarea className="ada-input" value={coachNote} onChange={(event) => setCoachNote(event.target.value)} />
          </label>
          <div className="sm:col-span-2">
            <Button onClick={() => void createExercise()}>Save exercise</Button>
          </div>
        </div>
      ) : null}

      {error ? <div className="mt-3"><ErrorState message={error} /></div> : null}
      {exercises.isLoading ? (
        <LoadingState label="Loading exercise library" />
      ) : (
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((exercise) => {
            const visual = exerciseVisualPath(exercise.name);
            return (
              <button
                key={exercise.id}
                onClick={() => onPick(exercise)}
                className="flex items-center gap-3 rounded-lg border border-white/10 bg-ada-surface p-3 text-left transition hover:border-ada-teal/40"
              >
                {visual ? (
                  <img src={visual} alt={`${exercise.name} illustration`} className="h-12 w-16 rounded object-cover" loading="lazy" />
                ) : (
                  <div className="flex h-12 w-16 items-center justify-center rounded bg-ada-card text-xs text-ada-muted">
                    No image
                  </div>
                )}
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-ada-text">{exercise.name}</div>
                  {exercise.name_ar ? (
                    <div className="truncate text-xs text-ada-teal" dir="rtl">{exercise.name_ar}</div>
                  ) : null}
                  <div className="mt-1 flex flex-wrap gap-1">
                    {exercise.equipment ? <Badge tone="neutral">{exercise.equipment}</Badge> : null}
                    {exercise.muscle_groups?.slice(0, 2).map((group) => (
                      <Badge key={group} tone="neutral">{group}</Badge>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}
