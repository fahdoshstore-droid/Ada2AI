import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { useCoachProfile } from "../../hooks/useProfile";
import { Button, Card, EmptyState, ErrorState, LoadingState, SectionTitle } from "../../components/ui";
import { NUTRITION_FOODS, type Meal, type MealItem } from "../../lib/nutrition";
import { localDateKey } from "../../lib/workout";

interface RosterItem { athlete_id: string; athlete: { display_name: string | null } | null }

export function CoachNutrition() {
  const { userId } = useAuth();
  const qc = useQueryClient();
  const { data: profile, isLoading } = useCoachProfile();

  const [athleteId, setAthleteId] = useState("");
  const [name, setName] = useState("Hypertrophy Nutrition");
  const [goal, setGoal] = useState<"bulk" | "cut" | "recomp" | "maintain" | "prep">("bulk");
  const [calories, setCalories] = useState("2800");
  const [protein, setProtein] = useState("220");
  const [carbs, setCarbs] = useState("300");
  const [fat, setFat] = useState("80");
  const [startsOn, setStartsOn] = useState(localDateKey());
  const [meals, setMeals] = useState<Meal[]>([
    { name: "Meal 1", items: [] },
    { name: "Meal 2", items: [] },
    { name: "Meal 3", items: [] },
    { name: "Meal 4", items: [] },
  ]);

  const roster = useQuery<RosterItem[]>({
    queryKey: ["nutrition-roster", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("physique_coach_athletes")
        .select("athlete_id, athlete:physique_athletes(display_name)")
        .eq("coach_id", userId!)
        .eq("status", "active");
      if (error) throw error;
      return (data ?? []) as unknown as RosterItem[];
    },
  });

  const plans = useQuery({
    queryKey: ["coach-nutrition-plans", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("physique_nutrition_plans")
        .select("*")
        .eq("created_by", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const createAndAssign = useMutation<void, Error, void>({
    mutationFn: async () => {
      const mealTimingNotes = JSON.stringify({ meals });
      const { data: plan, error: planError } = await supabase
        .from("physique_nutrition_plans")
        .insert({
          created_by: userId!,
          athlete_id: athleteId,
          name,
          goal,
          protein_ratio_pct: Math.round((Number(protein) * 4 * 100) / Math.max(Number(calories), 1)),
          carb_ratio_pct: Math.round((Number(carbs) * 4 * 100) / Math.max(Number(calories), 1)),
          fat_ratio_pct: Math.round((Number(fat) * 9 * 100) / Math.max(Number(calories), 1)),
          meal_timing_notes: mealTimingNotes,
          is_template: false,
          status: "active",
        })
        .select("id")
        .single();
      if (planError) throw planError;

      const { error: targetError } = await supabase.from("physique_nutrition_targets").insert({
        plan_id: plan.id,
        target_date: startsOn,
        calories_kcal: Number(calories),
        protein_g: Number(protein),
        carbs_g: Number(carbs),
        fat_g: Number(fat),
      });
      if (targetError) throw targetError;

      const { data: existing, error: existingError } = await supabase
        .from("physique_assignments")
        .select("id")
        .eq("athlete_id", athleteId)
        .eq("assignment_type", "nutrition")
        .eq("is_active", true);
      if (existingError) throw existingError;
      if (existing?.length) {
        const { error: archiveError } = await supabase
          .from("physique_assignments")
          .update({ is_active: false, ends_on: startsOn })
          .in("id", existing.map((row) => row.id));
        if (archiveError) throw archiveError;
      }

      const { error: assignError } = await supabase.from("physique_assignments").insert({
        coach_id: userId,
        athlete_id: athleteId,
        assignment_type: "nutrition",
        nutrition_plan_id: plan.id,
        starts_on: startsOn,
        is_active: true,
      });
      if (assignError) throw assignError;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coach-nutrition-plans", userId] }),
  });

  if (isLoading) return <LoadingState />;
  if (!profile) return <Navigate to="/onboard" replace />;

  function updateMeal(index: number, meal: Meal) {
    setMeals((current) => current.map((item, i) => (i === index ? meal : item)));
  }

  function addItem(index: number, item: MealItem) {
    updateMeal(index, { ...meals[index], items: [...meals[index].items, item] });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nutrition plans · الخطط الغذائية</h1>
        <p className="mt-1 text-sm text-ada-muted">
          Create and assign a coach-defined daily meal structure to a rostered athlete.
        </p>
      </div>

      <Card>
        <SectionTitle>New nutrition plan · خطة غذائية جديدة</SectionTitle>
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (athleteId) createAndAssign.mutate();
          }}
        >
          <label className="block">
            <span className="ada-label">Athlete</span>
            <select className="ada-input" value={athleteId} onChange={(e) => setAthleteId(e.target.value)} required>
              <option value="" disabled>Select athlete</option>
              {roster.data?.map((row) => (
                <option key={row.athlete_id} value={row.athlete_id}>
                  {row.athlete?.display_name ?? row.athlete_id}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="ada-label">Plan name</span>
            <input className="ada-input" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label className="block">
            <span className="ada-label">Goal</span>
            <select className="ada-input" value={goal} onChange={(e) => setGoal(e.target.value as typeof goal)}>
              {["bulk", "cut", "recomp", "maintain", "prep"].map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="ada-label">Effective from</span>
            <input type="date" className="ada-input" value={startsOn} onChange={(e) => setStartsOn(e.target.value)} required />
          </label>
          <div className="grid grid-cols-4 gap-2">
            <label className="block">
              <span className="ada-label">Calories</span>
              <input type="number" className="ada-input" value={calories} onChange={(e) => setCalories(e.target.value)} />
            </label>
            <label className="block">
              <span className="ada-label">Protein</span>
              <input type="number" className="ada-input" value={protein} onChange={(e) => setProtein(e.target.value)} />
            </label>
            <label className="block">
              <span className="ada-label">Carbs</span>
              <input type="number" className="ada-input" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
            </label>
            <label className="block">
              <span className="ada-label">Fat</span>
              <input type="number" className="ada-input" value={fat} onChange={(e) => setFat(e.target.value)} />
            </label>
          </div>

          {meals.map((meal, mealIndex) => (
            <div key={meal.name} className="rounded-lg border border-white/10 bg-ada-surface p-3 sm:col-span-2">
              <div className="text-sm font-semibold text-ada-text">{meal.name}</div>
              <ul className="mt-2 space-y-2">
                {meal.items.map((item, itemIndex) => {
                  const food = NUTRITION_FOODS.find((f) => f.id === item.foodId);
                  return (
                    <li key={`${item.foodId}-${itemIndex}`} className="flex items-center justify-between gap-2 text-sm">
                      <span>{food?.name} · {item.quantity} {item.unit}</span>
                      <button
                        type="button"
                        className="text-xs text-ada-red"
                        onClick={() => updateMeal(mealIndex, { ...meal, items: meal.items.filter((_, i) => i !== itemIndex) })}
                      >
                        Remove
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-3 flex flex-wrap gap-2">
                {NUTRITION_FOODS.map((food) => (
                  <button
                    key={food.id}
                    type="button"
                    className="rounded-lg border border-white/10 px-2 py-1 text-xs text-ada-teal"
                    onClick={() => addItem(mealIndex, { foodId: food.id, quantity: 200, unit: food.defaultUnit })}
                  >
                    + {food.name}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="sm:col-span-2">
            <Button type="submit" loading={createAndAssign.isPending} disabled={!athleteId}>
              Save & assign · حفظ وتعيين
            </Button>
          </div>
        </form>
        {createAndAssign.error ? <div className="mt-3"><ErrorState message={createAndAssign.error.message} /></div> : null}
      </Card>

      <Card>
        <SectionTitle>Saved nutrition plans · الخطط الغذائية المحفوظة</SectionTitle>
        {plans.isLoading ? <LoadingState label="Loading plans…" /> : plans.data?.length ? (
          <ul className="divide-y divide-white/5">
            {plans.data.map((plan) => (
              <li key={plan.id} className="py-2 text-sm">
                <span className="font-semibold text-ada-text">{plan.name}</span>
                <span className="ml-2 text-ada-muted">{plan.goal} · {plan.status}</span>
              </li>
            ))}
          </ul>
        ) : <EmptyState title="No nutrition plans yet · لا توجد خطط غذائية بعد" icon="🍽️" />}
      </Card>
    </div>
  );
}
