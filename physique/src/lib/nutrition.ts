export type FoodCategory = "protein" | "carb" | "vegetable" | "supplement";

export interface NutritionFood {
  id: string;
  name: string;
  nameAr: string;
  category: FoodCategory;
  defaultUnit: string;
}

export const NUTRITION_FOODS: NutritionFood[] = [
  { id: "egg_whites", name: "Egg Whites", nameAr: "بياض البيض", category: "protein", defaultUnit: "g" },
  { id: "chicken_breast", name: "Chicken Breast", nameAr: "صدر الدجاج", category: "protein", defaultUnit: "g" },
  { id: "meat", name: "Meat", nameAr: "اللحم", category: "protein", defaultUnit: "g" },
  { id: "fish", name: "Fish", nameAr: "السمك", category: "protein", defaultUnit: "g" },
  { id: "protein_supplement", name: "Protein", nameAr: "بروتين", category: "supplement", defaultUnit: "serving" },
  { id: "white_rice", name: "White Rice", nameAr: "الأرز الأبيض", category: "carb", defaultUnit: "g" },
  { id: "vegetables", name: "Vegetables", nameAr: "خضار", category: "vegetable", defaultUnit: "g" },
  { id: "vitamins", name: "Vitamins", nameAr: "الفيتامينات", category: "supplement", defaultUnit: "serving" },
];

export interface MealItem {
  foodId: string;
  quantity: number;
  unit: string;
}

export interface Meal {
  name: string;
  items: MealItem[];
}

export interface NutritionPlanMeals {
  meals: Meal[];
}

export function serializeMeals(meals: Meal[]): string {
  return JSON.stringify({ meals });
}

export function parseMeals(raw: string | null | undefined): Meal[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as NutritionPlanMeals;
    return Array.isArray(parsed.meals) ? parsed.meals : [];
  } catch {
    return [];
  }
}

export function foodById(id: string): NutritionFood | undefined {
  return NUTRITION_FOODS.find((food) => food.id === id);
}
