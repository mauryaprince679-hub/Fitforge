import type { DietType } from './Recipe';

export type MealSlot = 'breakfast' | 'lunch' | 'evening_snack' | 'dinner';
export type MealPlanGoal = 'fat_loss' | 'muscle_gain' | 'maintenance' | 'general';

export interface MacroTargets {
  protein: number;
  carbs: number;
  fats: number;
}

export interface MealEntry {
  mealType: MealSlot;
  recipeId?: string;
  customName: string;
  customNotes?: string;
}

export interface DayMealPlan {
  dayLabel: string;
  date?: string;
  meals: MealEntry[];
}

export interface MealPlanDocument {
  id?: string;
  userId: string;
  name: string;
  goal: MealPlanGoal;
  dietType: DietType;
  startDate?: string;
  days: DayMealPlan[];
  targetCalories: number;
  targetMacros: MacroTargets;
  recommendationSummary?: string;
  createdAt?: string;
  updatedAt?: string;
}
