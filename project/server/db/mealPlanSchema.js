import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  ingredients: { type: [String], default: [] },
  instructions: { type: [String], default: [] },
  imageUrl: { type: String, default: '' },
  dietType: { type: String, enum: ['veg', 'non_veg', 'vegan'], required: true },
  calories: { type: Number, required: true, min: 0 },
  protein: { type: Number, required: true, min: 0 },
  carbs: { type: Number, required: true, min: 0 },
  fats: { type: Number, required: true, min: 0 },
  prepTimeMinutes: { type: Number, default: 0, min: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { collection: 'recipes' });

recipeSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const mealEntrySchema = new mongoose.Schema({
  mealType: { type: String, required: true },
  recipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', default: null },
  customName: { type: String, default: '' },
  customNotes: { type: String, default: '' },
}, { _id: false });

const dayPlanSchema = new mongoose.Schema({
  dayLabel: { type: String, required: true },
  date: { type: String, default: '' },
  meals: { type: [mealEntrySchema], default: [] },
}, { _id: false });

const mealPlanSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  name: { type: String, default: 'My Personalized Meal Plan' },
  goal: { type: String, enum: ['fat_loss', 'muscle_gain', 'maintenance', 'general'], default: 'maintenance' },
  dietType: { type: String, enum: ['veg', 'non_veg', 'vegan'], default: 'veg' },
  targetCalories: { type: Number, default: 0, min: 0 },
  targetMacros: {
    protein: { type: Number, default: 0, min: 0 },
    carbs: { type: Number, default: 0, min: 0 },
    fats: { type: Number, default: 0, min: 0 },
  },
  startDate: { type: String, default: '' },
  days: { type: [dayPlanSchema], default: [] },
  recommendationSummary: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { collection: 'meal_plans' });

mealPlanSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Recipe = mongoose.model('Recipe', recipeSchema);
const MealPlan = mongoose.model('MealPlan', mealPlanSchema);

export { Recipe, MealPlan };
