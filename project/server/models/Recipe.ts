export type DietType = 'veg' | 'non_veg' | 'vegan';

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface RecipeDocument {
  id?: string;
  name: string;
  ingredients: string[];
  instructions: string[];
  imageUrl?: string;
  dietType: DietType;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  prepTimeMinutes: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface RecipeModel extends RecipeDocument {
  _id?: string;
}
