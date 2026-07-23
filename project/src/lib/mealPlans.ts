export interface MealEntry {
  mealType: 'breakfast' | 'lunch' | 'evening_snack' | 'dinner';
  customName: string;
  customNotes?: string;
  ingredients?: string[];
  image?: string;
  macros?: { protein: number; carbs: number; fats: number; calories: number };
  tag?: string;
}

export interface MealPlanDay {
  dayLabel: string;
  date: string;
  meals: MealEntry[];
  dietaryTag?: string;
}

export interface MealPlanPayload {
  id?: string;
  userId?: string;
  dietType?: 'veg' | 'non_veg' | 'vegan' | string;
  goal?: 'fat_loss' | 'muscle_gain' | 'maintenance' | 'general' | string;
  targetCalories?: number;
  targetMacros?: {
    protein?: number;
    carbs?: number;
    fats?: number;
  };
  recommendationSummary?: string;
  days?: MealPlanDay[];
  savedDietId?: string;
}

export interface SavedDietPlan {
  id: string;
  title: string;
  savedAt: string;
  plan: MealPlanPayload;
  tags: string[];
}

const ACTIVE_PLAN_STORAGE_KEY = 'fitforge_saved_meal_plan';
const SAVED_DIETS_STORAGE_KEY = 'fitforge_saved_diets';

export function normalizePlan(payload: unknown): MealPlanPayload | null {
  if (!payload || typeof payload !== 'object') return null;
  const plan = payload as Partial<MealPlanPayload>;
  if (!plan.days && !plan.targetCalories && !plan.recommendationSummary) return null;
  return {
    ...plan,
    id: plan.id ?? `plan-${Date.now()}`,
    targetCalories: plan.targetCalories ?? 1900,
    targetMacros: {
      protein: plan.targetMacros?.protein ?? 120,
      carbs: plan.targetMacros?.carbs ?? 190,
      fats: plan.targetMacros?.fats ?? 60,
    },
    days: plan.days ?? [],
  };
}

export function loadStoredPlan(): MealPlanPayload | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(ACTIVE_PLAN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return normalizePlan(parsed);
  } catch {
    return null;
  }
}

export function saveStoredPlan(plan: MealPlanPayload | null) {
  if (typeof window === 'undefined') return;
  if (!plan) {
    window.localStorage.removeItem(ACTIVE_PLAN_STORAGE_KEY);
    dispatchMealPlanUpdated();
    return;
  }
  window.localStorage.setItem(ACTIVE_PLAN_STORAGE_KEY, JSON.stringify(plan));
  dispatchMealPlanUpdated();
}

export function loadSavedDiets(): SavedDietPlan[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(SAVED_DIETS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is SavedDietPlan => !!item && typeof item === 'object' && 'id' in item && 'title' in item && 'plan' in item);
  } catch {
    return [];
  }
}

export function saveSavedDiets(diets: SavedDietPlan[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SAVED_DIETS_STORAGE_KEY, JSON.stringify(diets));
  dispatchMealPlanUpdated();
}

export function dispatchMealPlanUpdated() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('fitforge:meal-plan-updated'));
}

export function createDietId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `diet-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getPlanTags(plan: MealPlanPayload | null) {
  const tags: string[] = [];
  const goal = plan?.goal ?? 'maintenance';
  const dietType = plan?.dietType ?? 'veg';

  if (dietType === 'veg' || dietType === 'vegan') tags.push('Veg');
  if (dietType === 'non_veg') tags.push('High Protein');
  if (goal === 'fat_loss') tags.push('Cutting');
  if (goal === 'muscle_gain') tags.push('Bulk');
  if (goal === 'maintenance') tags.push('Maintenance');

  if ((plan?.targetCalories ?? 1900) >= 2600) tags.push('High Cal');
  else if ((plan?.targetCalories ?? 1900) <= 1800) tags.push('Lean');

  return Array.from(new Set(tags));
}
