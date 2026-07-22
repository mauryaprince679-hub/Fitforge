import { createMealPlan } from './mealPlanController.js';

function roundTo(value, decimals = 2) {
  return Number(Number(value).toFixed(decimals));
}

function normalizeDietType(value = 'veg') {
  const normalized = String(value || 'veg').toLowerCase();
  if (['veg', 'vegetarian'].includes(normalized)) return 'veg';
  if (['non_veg', 'non-veg', 'nonveg', 'meat', 'omnivore'].includes(normalized)) return 'non_veg';
  if (['vegan'].includes(normalized)) return 'vegan';
  return 'veg';
}

function normalizeGoal(value = 'maintenance') {
  const normalized = String(value || 'maintenance').toLowerCase();
  if (['fat_loss', 'fat-loss', 'fat loss', 'lose_fat', 'weight_loss'].includes(normalized)) return 'fat_loss';
  if (['muscle_gain', 'muscle-gain', 'gain_muscle', 'muscle gain'].includes(normalized)) return 'muscle_gain';
  return 'maintenance';
}

function normalizeGender(value = 'male') {
  const normalized = String(value || 'male').toLowerCase();
  if (['female', 'f', 'woman', 'girl'].includes(normalized)) return 'female';
  if (['other', 'nonbinary', 'non-binary', 'nb'].includes(normalized)) return 'other';
  return 'male';
}

function normalizeList(value) {
  if (Array.isArray(value)) return value.map((entry) => String(entry).trim()).filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(/[,;|]/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeBudget(value) {
  const normalized = String(value || '').toLowerCase();
  if (['premium', 'luxury', 'high-end'].includes(normalized)) return 'premium';
  if (['budget', 'budget-friendly', 'affordable', 'cheap'].includes(normalized)) return 'budget';
  return 'balanced';
}

function containsRestriction(restrictions = [], values = []) {
  const normalized = restrictions.map((entry) => String(entry).toLowerCase());
  return normalized.some((entry) => values.includes(entry));
}

const MEAL_DATABASE = {
  breakfast: [
    { id: 'bf-01', label: 'Greek Yogurt Protein Bowl', dietTypes: ['veg', 'non_veg'], goalTags: ['muscle_gain', 'maintenance'], calories: 360, macros: { protein: 30, carbs: 35, fats: 12 }, restrictions: ['dairy-free'], taste: ['mild', 'high protein'], budget: 'balanced', timing: '8:00 AM', portion: '1 bowl + 1 fruit' },
    { id: 'bf-02', label: 'Berry Chia Overnight Oats', dietTypes: ['veg', 'vegan'], goalTags: ['fat_loss', 'maintenance'], calories: 320, macros: { protein: 18, carbs: 42, fats: 10 }, restrictions: ['dairy-free', 'gluten-free'], taste: ['mild'], budget: 'budget', timing: '8:00 AM', portion: '1 jar' },
    { id: 'bf-03', label: 'Egg White Spinach Scramble', dietTypes: ['non_veg'], goalTags: ['muscle_gain', 'fat_loss'], calories: 290, macros: { protein: 27, carbs: 14, fats: 11 }, restrictions: ['gluten-free'], taste: ['mild'], budget: 'balanced', timing: '7:30 AM', portion: '2 eggs + vegetables' },
    { id: 'bf-04', label: 'Protein Oats Bowl', dietTypes: ['veg', 'non_veg'], goalTags: ['muscle_gain', 'maintenance'], calories: 410, macros: { protein: 29, carbs: 48, fats: 13 }, restrictions: [], taste: ['mild', 'high protein'], budget: 'budget', timing: '8:00 AM', portion: '1 large bowl' },
    { id: 'bf-05', label: 'Tropical Smoothie Bowl', dietTypes: ['veg', 'vegan'], goalTags: ['maintenance', 'fat_loss'], calories: 340, macros: { protein: 20, carbs: 40, fats: 12 }, restrictions: ['dairy-free'], taste: ['mild'], budget: 'balanced', timing: '8:15 AM', portion: '1 bowl' },
    { id: 'bf-06', label: 'Turkey & Veggie Breakfast Wrap', dietTypes: ['non_veg'], goalTags: ['muscle_gain', 'maintenance'], calories: 390, macros: { protein: 32, carbs: 30, fats: 15 }, restrictions: ['gluten-free'], taste: ['spicy'], budget: 'balanced', timing: '7:45 AM', portion: '1 wrap' },
    { id: 'bf-07', label: 'Vegan Tofu Breakfast Bowl', dietTypes: ['vegan'], goalTags: ['maintenance', 'fat_loss'], calories: 330, macros: { protein: 24, carbs: 25, fats: 15 }, restrictions: ['dairy-free', 'nut-free'], taste: ['mild'], budget: 'budget', timing: '8:00 AM', portion: '1 bowl' },
    { id: 'bf-08', label: 'Greek Yogurt Berry Parfait', dietTypes: ['veg'], goalTags: ['maintenance', 'fat_loss'], calories: 310, macros: { protein: 24, carbs: 29, fats: 10 }, restrictions: [], taste: ['mild'], budget: 'budget', timing: '8:00 AM', portion: '1 parfait' },
  ],
  lunch: [
    { id: 'lu-01', label: 'Quinoa Chickpea Power Bowl', dietTypes: ['veg', 'vegan'], goalTags: ['maintenance', 'fat_loss'], calories: 480, macros: { protein: 24, carbs: 55, fats: 15 }, restrictions: ['gluten-free'], taste: ['mild'], budget: 'balanced', timing: '1:00 PM', portion: '1 bowl' },
    { id: 'lu-02', label: 'Paneer Quinoa Salad', dietTypes: ['veg'], goalTags: ['muscle_gain', 'maintenance'], calories: 520, macros: { protein: 30, carbs: 48, fats: 18 }, restrictions: [], taste: ['mild'], budget: 'balanced', timing: '1:00 PM', portion: '1 large salad' },
    { id: 'lu-03', label: 'Grilled Chicken Rice Bowl', dietTypes: ['non_veg'], goalTags: ['muscle_gain', 'maintenance'], calories: 560, macros: { protein: 42, carbs: 45, fats: 20 }, restrictions: ['gluten-free'], taste: ['mild'], budget: 'balanced', timing: '1:00 PM', portion: '1 bowl' },
    { id: 'lu-04', label: 'Tofu Stir-Fry Bowl', dietTypes: ['vegan', 'veg'], goalTags: ['fat_loss', 'maintenance'], calories: 470, macros: { protein: 26, carbs: 46, fats: 16 }, restrictions: ['dairy-free', 'nut-free'], taste: ['spicy'], budget: 'budget', timing: '1:10 PM', portion: '1 bowl' },
    { id: 'lu-05', label: 'Salmon & Roasted Veggie Plate', dietTypes: ['non_veg'], goalTags: ['fat_loss', 'maintenance'], calories: 510, macros: { protein: 36, carbs: 26, fats: 24 }, restrictions: ['gluten-free'], taste: ['mild'], budget: 'premium', timing: '1:00 PM', portion: '1 plate' },
    { id: 'lu-06', label: 'Lentil Protein Salad', dietTypes: ['veg', 'vegan'], goalTags: ['fat_loss', 'maintenance'], calories: 430, macros: { protein: 22, carbs: 40, fats: 14 }, restrictions: ['dairy-free'], taste: ['mild'], budget: 'budget', timing: '1:00 PM', portion: '1 salad' },
    { id: 'lu-07', label: 'Chicken Pesto Pasta', dietTypes: ['non_veg'], goalTags: ['muscle_gain', 'maintenance'], calories: 630, macros: { protein: 40, carbs: 58, fats: 22 }, restrictions: [], taste: ['mild'], budget: 'premium', timing: '1:00 PM', portion: '1 serving' },
    { id: 'lu-08', label: 'Mediterranean Chickpea Plate', dietTypes: ['veg', 'vegan'], goalTags: ['maintenance', 'fat_loss'], calories: 460, macros: { protein: 20, carbs: 46, fats: 17 }, restrictions: ['dairy-free'], taste: ['mild'], budget: 'balanced', timing: '1:00 PM', portion: '1 plate' },
  ],
  snack: [
    { id: 'sn-01', label: 'Apple with Almond Butter', dietTypes: ['veg', 'vegan', 'non_veg'], goalTags: ['fat_loss', 'maintenance'], calories: 220, macros: { protein: 6, carbs: 24, fats: 12 }, restrictions: ['nut-free'], taste: ['mild'], budget: 'budget', timing: '4:00 PM', portion: '1 apple + 1 tbsp' },
    { id: 'sn-02', label: 'Cottage Cheese & Berries', dietTypes: ['veg', 'non_veg'], goalTags: ['muscle_gain', 'maintenance'], calories: 220, macros: { protein: 24, carbs: 15, fats: 8 }, restrictions: [], taste: ['mild'], budget: 'balanced', timing: '4:00 PM', portion: '1 bowl' },
    { id: 'sn-03', label: 'Hummus & Veggie Sticks', dietTypes: ['veg', 'vegan'], goalTags: ['fat_loss', 'maintenance'], calories: 180, macros: { protein: 7, carbs: 20, fats: 8 }, restrictions: ['dairy-free'], taste: ['mild'], budget: 'budget', timing: '4:00 PM', portion: '1 cup hummus + veggies' },
    { id: 'sn-04', label: 'Turkey Roll-Ups', dietTypes: ['non_veg'], goalTags: ['muscle_gain', 'fat_loss'], calories: 190, macros: { protein: 22, carbs: 8, fats: 9 }, restrictions: ['gluten-free'], taste: ['spicy'], budget: 'balanced', timing: '4:00 PM', portion: '3 rolls' },
    { id: 'sn-05', label: 'Protein Smoothie', dietTypes: ['veg', 'vegan', 'non_veg'], goalTags: ['muscle_gain', 'maintenance'], calories: 260, macros: { protein: 25, carbs: 24, fats: 8 }, restrictions: ['dairy-free'], taste: ['mild'], budget: 'balanced', timing: '4:15 PM', portion: '1 shake' },
  ],
  dinner: [
    { id: 'dn-01', label: 'Salmon with Roasted Vegetables', dietTypes: ['non_veg'], goalTags: ['fat_loss', 'maintenance'], calories: 560, macros: { protein: 38, carbs: 28, fats: 26 }, restrictions: ['gluten-free'], taste: ['mild'], budget: 'premium', timing: '7:00 PM', portion: '1 plate' },
    { id: 'dn-02', label: 'Lentil Curry with Brown Rice', dietTypes: ['veg', 'vegan'], goalTags: ['maintenance', 'fat_loss'], calories: 540, macros: { protein: 24, carbs: 62, fats: 18 }, restrictions: ['dairy-free'], taste: ['spicy'], budget: 'balanced', timing: '7:00 PM', portion: '1 bowl' },
    { id: 'dn-03', label: 'Chicken Stir-Fry with Rice', dietTypes: ['non_veg'], goalTags: ['muscle_gain', 'maintenance'], calories: 590, macros: { protein: 42, carbs: 48, fats: 20 }, restrictions: [], taste: ['spicy'], budget: 'balanced', timing: '7:00 PM', portion: '1 bowl' },
    { id: 'dn-04', label: 'Tofu Peanut Stew', dietTypes: ['vegan', 'veg'], goalTags: ['muscle_gain', 'maintenance'], calories: 550, macros: { protein: 28, carbs: 44, fats: 22 }, restrictions: ['nut-free'], taste: ['mild'], budget: 'budget', timing: '7:00 PM', portion: '1 bowl' },
    { id: 'dn-05', label: 'Lean Turkey Chili Bowl', dietTypes: ['non_veg'], goalTags: ['fat_loss', 'maintenance'], calories: 500, macros: { protein: 35, carbs: 34, fats: 18 }, restrictions: ['gluten-free'], taste: ['spicy'], budget: 'balanced', timing: '7:00 PM', portion: '1 bowl' },
    { id: 'dn-06', label: 'Paneer Veggie Skillet', dietTypes: ['veg'], goalTags: ['muscle_gain', 'maintenance'], calories: 560, macros: { protein: 32, carbs: 34, fats: 22 }, restrictions: [], taste: ['mild'], budget: 'balanced', timing: '7:00 PM', portion: '1 skillet' },
  ],
};

function scoreMealCandidate(candidate, { goal, dietType, restrictions = [], tasteProfile = [], budget = 'balanced' }) {
  const normalizedRestrictions = normalizeList(restrictions).map((entry) => entry.toLowerCase());
  const normalizedTaste = normalizeList(tasteProfile).map((entry) => entry.toLowerCase());
  const resolvedBudget = normalizeBudget(budget);
  let score = 0;

  if (candidate.dietTypes.includes(dietType)) score += 20;
  if (candidate.goalTags.includes(goal)) score += 15;
  if (candidate.budget === resolvedBudget || candidate.budget === 'balanced') score += 8;
  if (candidate.restrictions.length === 0) score += 5;
  for (const restriction of normalizedRestrictions) {
    if (candidate.restrictions.includes(restriction)) score -= 10;
  }
  for (const taste of normalizedTaste) {
    if (candidate.taste.includes(taste)) score += 6;
  }
  return score;
}

function buildScientificMealPlan({ dietType = 'veg', goal = 'maintenance', targetCalories = 2000, targetMacros = { protein: 100, carbs: 220, fats: 70 }, startDate = '', restrictions = [], tasteProfile = [], budget = 'balanced' }) {
  const normalizedGoal = normalizeGoal(goal);
  const normalizedDietType = normalizeDietType(dietType);
  const normalizedRestrictions = normalizeList(restrictions).map((entry) => entry.toLowerCase());
  const normalizedTaste = normalizeList(tasteProfile).map((entry) => entry.toLowerCase());
  const resolvedBudget = normalizeBudget(budget);
  const start = startDate ? new Date(startDate) : new Date();

  const mealTypes = [
    { key: 'breakfast', candidates: MEAL_DATABASE.breakfast },
    { key: 'lunch', candidates: MEAL_DATABASE.lunch },
    { key: 'snack', candidates: MEAL_DATABASE.snack },
    { key: 'dinner', candidates: MEAL_DATABASE.dinner },
  ];

  const days = Array.from({ length: 7 }, (_, dayIndex) => {
    const dayMeals = mealTypes.map((mealType, mealIndex) => {
      const eligible = mealType.candidates.filter((candidate) => {
        if (!candidate.dietTypes.includes(normalizedDietType)) return false;
        if (normalizedRestrictions.some((restriction) => candidate.restrictions.includes(restriction))) return false;
        return true;
      });

      const scored = eligible
        .map((candidate) => ({ candidate, score: scoreMealCandidate(candidate, { goal: normalizedGoal, dietType: normalizedDietType, restrictions: normalizedRestrictions, tasteProfile: normalizedTaste, budget: resolvedBudget }) }))
        .sort((left, right) => right.score - left.score);

      const pickIndex = (dayIndex + mealIndex) % Math.max(scored.length, 1);
      const selected = scored[pickIndex]?.candidate || eligible[0] || mealType.candidates[0];
      const suffix = mealIndex === 0 ? 'for a fresh start' : mealIndex === 1 ? 'for steady energy' : mealIndex === 2 ? 'with light recovery support' : 'for a restorative finish';
      return {
        mealType: mealType.key === 'snack' ? 'evening_snack' : mealType.key,
        customName: selected.label,
        customNotes: `${selected.timing} — ${selected.portion}. ${selected.label} is tuned for ${normalizedGoal.replace('_', ' ')} support and ${selected.budget} budgeting. ${suffix}`,
      };
    });

    const date = new Date(start);
    date.setDate(start.getDate() + dayIndex);
    return {
      dayLabel: `Day ${dayIndex + 1}`,
      date: date.toISOString().slice(0, 10),
      meals: dayMeals,
    };
  });

  const summary = [
    `A ${resolvedBudget} ${normalizedGoal.replace('_', ' ')} plan`,
    `for ${normalizedDietType.replace('_', ' ')}`,
    normalizedRestrictions.length ? `with ${normalizedRestrictions.join(', ')} safeguards` : 'with balanced nutrition',
    normalizedTaste.length ? `and ${normalizedTaste.join(', ')} flavor preferences` : '',
  ].filter(Boolean).join(' ');

  return {
    goal: normalizedGoal,
    dietType: normalizedDietType,
    targetCalories: roundTo(targetCalories),
    targetMacros: {
      protein: roundTo(targetMacros?.protein || 100),
      carbs: roundTo(targetMacros?.carbs || 220),
      fats: roundTo(targetMacros?.fats || 70),
    },
    recommendationSummary: `Scientific nutrition database plan prepared for ${summary}.`,
    days,
  };
}

function calculateBMR({ weightKg, heightCm, age, gender = 'male', activityLevel = 'moderate', goal = 'maintenance' }) {
  const numericWeight = Number(weightKg);
  const numericHeight = Number(heightCm);
  const numericAge = Number(age);
  if ([numericWeight, numericHeight, numericAge].some((value) => Number.isNaN(value) || value <= 0)) {
    throw new Error('weightKg, heightCm, and age must be valid positive numbers.');
  }

  const normalizedGender = normalizeGender(gender);
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  const multiplier = activityMultipliers[String(activityLevel).toLowerCase()] || 1.2;

  let bmr;
  if (normalizedGender === 'female') {
    bmr = 10 * numericWeight + 6.25 * numericHeight - 5 * numericAge - 161;
  } else if (normalizedGender === 'male') {
    bmr = 10 * numericWeight + 6.25 * numericHeight - 5 * numericAge + 5;
  } else {
    const maleBmr = 10 * numericWeight + 6.25 * numericHeight - 5 * numericAge + 5;
    const femaleBmr = 10 * numericWeight + 6.25 * numericHeight - 5 * numericAge - 161;
    bmr = (maleBmr + femaleBmr) / 2;
  }

  const tdee = roundTo(bmr * multiplier);
  const normalizedGoal = normalizeGoal(goal);
  let calorieTarget = tdee;
  if (normalizedGoal === 'fat_loss') calorieTarget = roundTo(tdee - 500);
  if (normalizedGoal === 'muscle_gain') calorieTarget = roundTo(tdee + 250);

  const proteinTarget = roundTo(numericWeight * 2.2);
  const fatTarget = roundTo((calorieTarget * 0.25) / 9);
  const carbTarget = roundTo((calorieTarget - proteinTarget * 4 - fatTarget * 9) / 4);

  return {
    bmr: roundTo(bmr),
    tdee,
    targetCalories: roundTo(calorieTarget),
    targetMacros: {
      protein: roundTo(proteinTarget),
      carbs: roundTo(Math.max(carbTarget, 0)),
      fats: roundTo(Math.max(fatTarget, 0)),
    },
  };
}

function extractJsonString(text) {
  if (typeof text !== 'string') return null;
  const trimmed = text.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed;

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }
  return null;
}

async function callExternalAI({ systemMessage, userMessage }) {
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const openAiKey = process.env.OPENAI_API_KEY?.trim();

  if (geminiKey) {
    const url = 'https://gemini.googleapis.com/v1/models/chat-bison-001:generate';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${geminiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: {
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: userMessage },
          ],
        },
        temperature: 0.25,
        max_output_tokens: 1200,
      }),
    });

    const payload = await response.json();
    const rawText = payload?.candidates?.[0]?.content?.[0]?.text || payload?.output?.[0]?.content?.[0]?.text || payload?.candidates?.[0]?.content || null;
    if (!rawText) {
      throw new Error('Gemini returned an unexpected response format.');
    }
    return String(rawText);
  }

  if (openAiKey) {
    const url = 'https://api.openai.com/v1/chat/completions';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.25,
        max_tokens: 1200,
      }),
    });

    const payload = await response.json();
    const rawText = payload?.choices?.[0]?.message?.content;
    if (!rawText) {
      throw new Error('OpenAI returned an unexpected response format.');
    }
    return String(rawText);
  }

  throw new Error('No AI API key configured. Set GEMINI_API_KEY or OPENAI_API_KEY in the environment.');
}

async function generateAIJsonResponse(metrics) {
  const restrictions = normalizeList(metrics.restrictions).join(', ');
  const tasteProfile = normalizeList(metrics.tasteProfile).join(', ');
  const budget = normalizeBudget(metrics.cookingBudget || metrics.budget);

  const systemMessage = `Act as an elite clinical sports nutritionist. You are provided with a client profile containing strict variables: Metrics [age: ${metrics.age}, height: ${metrics.heightCm}, weight: ${metrics.weightKg}, activityLevel: ${metrics.activityLevel}, fitnessGoal: ${metrics.goal}], Allergies/Conditions [${restrictions || 'none'}], Budget [${budget}], Taste [${tasteProfile || 'mild'}]. Cross-reference every data combination. If a medical condition like 'Diabetes-friendly' or an allergy like 'Dairy-Free' is checked, you MUST strictly omit restricted ingredients. Adjust macro and calorie targets based on the Fitness Goal and Activity Level. Return a clean, fully validated JSON object containing breakfast, lunch, snack, and dinner with precise advice, portion sizing, and timing. Do not include any markdown or explanation.`;

  const userMessage = `
Generate a personalized meal plan using the following client profile:
- weightKg: ${metrics.weightKg}
- heightCm: ${metrics.heightCm}
- age: ${metrics.age}
- gender: ${metrics.gender}
- activityLevel: ${metrics.activityLevel}
- fitnessGoal: ${metrics.goal}
- dietaryPreference: ${metrics.dietType}
- restrictions: ${restrictions || 'none'}
- tasteProfile: ${tasteProfile || 'mild'}
- cookingBudget: ${budget}
- targetCalories: ${metrics.targetCalories}
- protein: ${metrics.targetMacros.protein}
- carbs: ${metrics.targetMacros.carbs}
- fats: ${metrics.targetMacros.fats}
- startDate: ${metrics.startDate}

Respond with a JSON object containing these properties:
{
  "goal": "fat_loss|muscle_gain|maintenance",
  "dietType": "veg|non_veg|vegan",
  "targetCalories": number,
  "targetMacros": { "protein": number, "carbs": number, "fats": number },
  "recommendationSummary": string,
  "days": [
    {
      "dayLabel": "Day 1",
      "date": "YYYY-MM-DD",
      "meals": [
        { "mealType": "breakfast", "customName": string, "customNotes": string },
        { "mealType": "lunch", "customName": string, "customNotes": string },
        { "mealType": "evening_snack", "customName": string, "customNotes": string },
        { "mealType": "dinner", "customName": string, "customNotes": string }
      ]
    }
  ]
}

The response must be valid JSON only. Do not add any commentary.`;

  const raw = await callExternalAI({ systemMessage, userMessage });
  const jsonString = extractJsonString(raw);
  if (!jsonString) {
    throw new Error('Unable to extract JSON from AI response.');
  }
  return JSON.parse(jsonString);
}

async function generateMealPlan(payload) {
  const safePayload = payload || {};
  const {
    userId,
    weightKg,
    heightCm,
    age,
    gender = 'male',
    activityLevel = 'moderate',
    goal = 'maintenance',
    dietType = 'veg',
    dietaryPreference,
    restrictions,
    tasteProfile,
    cookingBudget,
    budget,
    startDate = new Date().toISOString().slice(0, 10),
  } = safePayload;

  const safeRestrictions = Array.isArray(restrictions) ? restrictions : Array.isArray(safePayload.allergies) ? safePayload.allergies : Array.isArray(safePayload.medicalConditions) ? safePayload.medicalConditions : [];
  const safeTasteProfile = Array.isArray(tasteProfile) ? tasteProfile : [];

  if (!userId) {
    throw new Error('userId is required to generate a meal plan.');
  }

  try {
    if (!userId) {
      throw new Error('userId is required to generate a meal plan.');
    }
  } catch (err) {
    console.warn('Payload validation:', err.message);
  }

  const normalizedDietType = normalizeDietType(dietaryPreference || dietType);
  const normalizedGoal = normalizeGoal(goal);
  const bmrResult = calculateBMR({ weightKg, heightCm, age, gender, activityLevel, goal: normalizedGoal });

  const fallbackPlan = buildScientificMealPlan({
    dietType: normalizedDietType,
    goal: normalizedGoal,
    targetCalories: bmrResult.targetCalories,
    targetMacros: bmrResult.targetMacros,
    startDate,
    restrictions: safeRestrictions,
    tasteProfile: safeTasteProfile,
    budget: cookingBudget || budget,
  });

  let generatedDays = fallbackPlan.days;
  let recommendationSummary = fallbackPlan.recommendationSummary;

  try {
    const aiResult = await generateAIJsonResponse({
      weightKg,
      heightCm,
      age,
      gender,
      activityLevel,
      goal: normalizedGoal,
      dietType: normalizedDietType,
      restrictions: safeRestrictions,
      tasteProfile: safeTasteProfile,
      cookingBudget: cookingBudget || budget,
      budget: cookingBudget || budget,
      targetCalories: bmrResult.targetCalories,
      targetMacros: bmrResult.targetMacros,
      startDate,
    });

    if (Array.isArray(aiResult)) {
      generatedDays = aiResult.map((day, index) => ({
        dayLabel: String(day.dayLabel || `Day ${index + 1}`),
        date: String(day.date || new Date(startDate).toISOString().slice(0, 10)),
        meals: Array.isArray(day.meals)
          ? day.meals.map((meal) => ({
              mealType: String(meal.mealType),
              customName: String(meal.customName || ''),
              customNotes: String(meal.customNotes || ''),
            }))
          : [],
      }));
    } else if (aiResult?.days?.length) {
      generatedDays = aiResult.days.map((day, index) => ({
        dayLabel: String(day.dayLabel || `Day ${index + 1}`),
        date: String(day.date || new Date(startDate).toISOString().slice(0, 10)),
        meals: Array.isArray(day.meals)
          ? day.meals.map((meal) => ({
              mealType: String(meal.mealType),
              customName: String(meal.customName || ''),
              customNotes: String(meal.customNotes || ''),
            }))
          : [],
      }));
    }

    if (aiResult?.recommendationSummary) {
      recommendationSummary = String(aiResult.recommendationSummary);
    }
  } catch (error) {
    console.warn('AI nutrition generation skipped, using local fallback:', error instanceof Error ? error.message : String(error));
    generatedDays = fallbackPlan.days;
    recommendationSummary = fallbackPlan.recommendationSummary;
  }

  const mealPlanPayload = {
    userId: userId || `user-${Date.now()}`,
    goal: normalizedGoal,
    dietType: normalizedDietType,
    targetCalories: fallbackPlan.targetCalories,
    targetMacros: fallbackPlan.targetMacros,
    startDate,
    days: generatedDays,
    recommendationSummary,
  };

  try {
    const result = await createMealPlan(mealPlanPayload);
    return { success: true, mealPlan: result.mealPlan || mealPlanPayload };
  } catch (persistError) {
    console.debug('Meal plan persistence skipped, returning local plan:', persistError instanceof Error ? persistError.message : String(persistError));
    return { success: true, mealPlan: mealPlanPayload };
  }
}

export { calculateBMR, generateMealPlan };
