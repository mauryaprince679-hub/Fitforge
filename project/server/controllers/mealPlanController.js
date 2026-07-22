import mongoose from 'mongoose';
import { MealPlan, Recipe } from '../db/mealPlanSchema.js';

const inMemoryRecipes = [];
const inMemoryMealPlans = [];

function roundTo(value, decimals = 2) {
  return Number(value.toFixed(decimals));
}

function buildMealPlanDays({ dietType = 'veg', goal = 'maintenance', targetCalories = 2000, targetMacros = { protein: 100, carbs: 220, fats: 70 }, startDate = '' }) {
  const templates = {
    veg: {
      breakfast: { name: 'Protein Oats Bowl', note: 'Oats, nuts, and milk for long-lasting energy.' },
      lunch: { name: 'Paneer & Quinoa Salad', note: 'High-protein vegetarian lunch with greens.' },
      evening_snack: { name: 'Greek Yogurt Parfait', note: 'A light, nutrient-dense snack.' },
      dinner: { name: 'Lentil Curry with Brown Rice', note: 'A balanced, fiber-rich dinner.' },
    },
    non_veg: {
      breakfast: { name: 'Egg White Veggie Wrap', note: 'Lean protein plus veggies to start strong.' },
      lunch: { name: 'Grilled Chicken Bowl', note: 'Balanced macros for muscle recovery.' },
      evening_snack: { name: 'Cottage Cheese & Fruit', note: 'A clean protein-packed snack.' },
      dinner: { name: 'Salmon & Roasted Veggies', note: 'Healthy fats and steady carbohydrates.' },
    },
    vegan: {
      breakfast: { name: 'Chia Almond Smoothie', note: 'Plant-based protein with fiber-rich seeds.' },
      lunch: { name: 'Tofu Stir-fry Bowl', note: 'Vegan protein and colorful vegetables.' },
      evening_snack: { name: 'Hummus & Veggie Sticks', note: 'Simple, satisfying plant-powered snack.' },
      dinner: { name: 'Lentil & Sweet Potato Stew', note: 'High-fiber dinner with healthy carbs.' },
    },
  };

  const selectedTemplate = templates[dietType] || templates.veg;
  const start = startDate ? new Date(startDate) : new Date();

  return [1, 2, 3].map((dayNumber) => {
    const date = new Date(start);
    date.setDate(start.getDate() + dayNumber - 1);
    return {
      dayLabel: `Day ${dayNumber}`,
      date: date.toISOString().slice(0, 10),
      meals: [
        {
          mealType: 'breakfast',
          customName: selectedTemplate.breakfast.name,
          customNotes: `${selectedTemplate.breakfast.note} ${goal === 'fat_loss' ? 'This meal is calibrated for a lean calorie target.' : goal === 'muscle_gain' ? 'A protein-rich start to support growth.' : 'Balanced for steady energy and recovery.'}`,
        },
        {
          mealType: 'lunch',
          customName: selectedTemplate.lunch.name,
          customNotes: `${selectedTemplate.lunch.note} ${goal === 'fat_loss' ? 'Keep portions nutrient-dense and filling.' : goal === 'muscle_gain' ? 'This meal supports muscle repair and strength.' : 'A stable midday boost to keep you fueled.'}`,
        },
        {
          mealType: 'evening_snack',
          customName: selectedTemplate.evening_snack.name,
          customNotes: `${selectedTemplate.evening_snack.note} ${goal === 'fat_loss' ? 'A snack that keeps cravings in check.' : goal === 'muscle_gain' ? 'The perfect protein topping between meals.' : 'A light, satisfying energy bridge.'}`,
        },
        {
          mealType: 'dinner',
          customName: selectedTemplate.dinner.name,
          customNotes: `${selectedTemplate.dinner.note} ${goal === 'fat_loss' ? 'A lighter evening plate to aid recovery.' : goal === 'muscle_gain' ? 'Rich in protein and healthy fats for overnight repair.' : 'A balanced finish to your nutrition day.'}`,
        },
      ],
    };
  });
}

function calculateTDEE({ weightKg, heightCm, age, gender, activityLevel, goal }) {
  if (!weightKg || !heightCm || !age || !gender || !activityLevel || !goal) {
    throw new Error('weightKg, heightCm, age, gender, activityLevel, and goal are required.');
  }

  const numericWeight = Number(weightKg);
  const numericHeight = Number(heightCm);
  const numericAge = Number(age);

  if ([numericWeight, numericHeight, numericAge].some((value) => Number.isNaN(value) || value <= 0)) {
    throw new Error('Weight, height, and age must be positive numbers.');
  }

  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const multiplier = activityMultipliers[activityLevel.toLowerCase()] ?? 1.2;

  let bmr;
  if (gender.toLowerCase() === 'male') {
    bmr = 10 * numericWeight + 6.25 * numericHeight - 5 * numericAge + 5;
  } else if (gender.toLowerCase() === 'female') {
    bmr = 10 * numericWeight + 6.25 * numericHeight - 5 * numericAge - 161;
  } else {
    bmr = (10 * numericWeight + 6.25 * numericHeight - 5 * numericAge + 5 + (10 * numericWeight + 6.25 * numericHeight - 5 * numericAge - 161)) / 2;
  }

  const tdee = roundTo(bmr * multiplier);

  let calorieTarget = tdee;
  if (goal === 'fat_loss') {
    calorieTarget = roundTo(tdee - 500);
  } else if (goal === 'muscle_gain') {
    calorieTarget = roundTo(tdee + 250);
  } else if (goal === 'maintenance') {
    calorieTarget = roundTo(tdee);
  }

  const proteinTarget = roundTo(numericWeight * 2.2);
  const fatTarget = roundTo((calorieTarget * 0.25) / 9);
  const carbTarget = roundTo((calorieTarget - (proteinTarget * 4) - (fatTarget * 9)) / 4);

  return {
    tdee,
    calorieTarget,
    macroTargets: {
      protein: proteinTarget,
      carbs: carbTarget,
      fats: fatTarget,
    },
  };
}

async function createRecipe(recipePayload) {
  if (mongoose.connection.readyState !== 1) {
    const recipe = {
      id: `local-recipe-${Date.now()}`,
      ...recipePayload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemoryRecipes.push(recipe);
    return { success: true, recipe };
  }

  try {
    const recipe = new Recipe(recipePayload);
    await recipe.save();
    return { success: true, recipe };
  } catch (error) {
    throw new Error(`Unable to create recipe: ${error.message}`);
  }
}

async function createMealPlan({ userId, goal = 'maintenance', startDate = '', dietType = 'veg', targetCalories = 0, targetMacros = { protein: 0, carbs: 0, fats: 0 }, days = [] }) {
  if (!userId) {
    throw new Error('userId is required.');
  }

  const normalizedDiet = ['veg', 'non_veg', 'vegan'].includes(dietType) ? dietType : 'veg';
  const generatedDays = days.length > 0 ? days : buildMealPlanDays({ dietType: normalizedDiet, goal, targetCalories: targetCalories || 2000, targetMacros: targetMacros.protein ? targetMacros : { protein: 100, carbs: 220, fats: 70 }, startDate });
  const mealPlanPayload = {
    userId,
    goal,
    dietType: normalizedDiet,
    startDate: startDate || '',
    days: generatedDays,
    targetCalories: targetCalories || 0,
    targetMacros: targetMacros.protein ? targetMacros : { protein: 0, carbs: 0, fats: 0 },
    recommendationSummary: `Personalized ${normalizedDiet.replace('_', ' ')} meal plan for ${goal.replace('_', ' ')} with ${targetCalories || 0} target calories.`,
  };

  if (mongoose.connection.readyState !== 1) {
    const mealPlan = {
      id: `local-meal-plan-${Date.now()}`,
      ...mealPlanPayload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemoryMealPlans.push(mealPlan);
    return { success: true, mealPlan };
  }

  const mealPlan = new MealPlan(mealPlanPayload);
  await mealPlan.save();
  return { success: true, mealPlan };
}

async function updateMealPlan(userId, payload) {
  if (!userId) {
    throw new Error('userId is required.');
  }

  if (mongoose.connection.readyState !== 1) {
    const index = inMemoryMealPlans.findIndex((entry) => entry.userId === userId);
    if (index === -1) {
      const mealPlan = {
        id: `local-meal-plan-${Date.now()}`,
        userId,
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      inMemoryMealPlans.push(mealPlan);
      return { success: true, mealPlan };
    }
    const existing = inMemoryMealPlans[index];
    const updated = {
      ...existing,
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    inMemoryMealPlans[index] = updated;
    return { success: true, mealPlan: updated };
  }

  const mealPlan = await MealPlan.findOneAndUpdate(
    { userId },
    { $set: { ...payload, updatedAt: new Date() } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  return { success: true, mealPlan };
}

async function getMealPlanByUserId(userId) {
  if (!userId) {
    throw new Error('userId is required.');
  }

  if (mongoose.connection.readyState !== 1) {
    const mealPlan = [...inMemoryMealPlans].reverse().find((entry) => entry.userId === userId);
    return { success: true, mealPlan: mealPlan || null };
  }

  const mealPlan = await MealPlan.findOne({ userId }).sort({ createdAt: -1 }).lean();
  return { success: true, mealPlan };
}

async function getRecipesByDiet(dietType) {
  if (mongoose.connection.readyState !== 1) {
    const recipes = dietType
      ? inMemoryRecipes.filter((entry) => entry.dietType === dietType)
      : inMemoryRecipes;
    return { success: true, recipes };
  }

  const recipes = await Recipe.find({ dietType }).lean();
  return { success: true, recipes };
}

export {
  calculateTDEE,
  createRecipe,
  createMealPlan,
  getMealPlanByUserId,
  getRecipesByDiet,
  updateMealPlan,
};
