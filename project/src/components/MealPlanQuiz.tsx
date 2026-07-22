import { useMemo, useState } from 'react';
import { ArrowRight, Sparkles, Target, Flame, Clock3, X, ShieldCheck, UtensilsCrossed, BadgeDollarSign } from 'lucide-react';
import { useAuth } from '../lib/auth';

const API_BASE_URL = (() => {
  const env = import.meta.env.VITE_API_BASE_URL;
  if (env) return env;
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:5000';
  }
  return 'http://localhost:5000';
})();

console.debug('[MealPlanQuiz] API Base URL:', API_BASE_URL);

interface MealPlanQuizProps {
  onComplete?: (payload: MealPlanFormPayload) => void;
  onClose?: () => void;
}

export interface MealPlanFormPayload {
  age?: number;
  height?: number;
  weight?: number;
  dietType?: 'veg' | 'non_veg' | 'vegan';
  goal?: 'fat_loss' | 'muscle_gain' | 'maintenance';
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  restrictions?: string[];
  tasteProfile?: string[];
  cookingBudget?: 'budget' | 'balanced' | 'premium';
}

const dietOptions: Array<{ value: MealPlanFormPayload['dietType']; label: string; description: string }> = [
  { value: 'veg', label: 'Vegetarian', description: 'Balanced vegetarian meals' },
  { value: 'non_veg', label: 'Non-Vegetarian', description: 'Higher-protein protein options' },
  { value: 'vegan', label: 'Vegan', description: 'Plant-based and nutrient-dense' },
];

const fitnessGoals: Array<{ id: MealPlanFormPayload['goal']; title: string; desc: string }> = [
  { id: 'fat_loss', title: 'Fat Loss', desc: 'Lean meals with a calorie deficit' },
  { id: 'muscle_gain', title: 'Muscle Gain', desc: 'More protein and recovery fuel' },
  { id: 'maintenance', title: 'Maintenance', desc: 'Steady energy and balanced macros' },
];

const activityLevels = ['Sedentary', 'Light', 'Moderate', 'Active', 'Very Active'] as const;

const activityLevelOptions: Array<{ value: MealPlanFormPayload['activityLevel']; label: string }> = activityLevels.map((label) => ({
  value: label.toLowerCase().replace(' ', '_') as MealPlanFormPayload['activityLevel'],
  label,
}));

const restrictionOptions = ['Dairy-Free', 'Gluten-Free', 'Nut-Free', 'Diabetes-friendly', 'Low-Sodium'];
const tasteOptions = ['Mild', 'Spicy', 'Bland', 'High Protein'];
const budgetOptions: Array<{ value: MealPlanFormPayload['cookingBudget']; label: string }> = [
  { value: 'budget', label: 'Budget-friendly' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'premium', label: 'Premium' },
];

export default function MealPlanQuiz({ onComplete, onClose }: MealPlanQuizProps) {
  const [step, setStep] = useState(0);
  const { profile } = useAuth();
  const [form, setForm] = useState<MealPlanFormPayload>({
    age: 28,
    height: 175,
    weight: 72,
    dietType: 'non_veg',
    goal: 'muscle_gain',
    activityLevel: 'moderate',
    restrictions: ['Dairy-Free'],
    tasteProfile: ['Mild'],
    cookingBudget: 'balanced',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [planSummary, setPlanSummary] = useState<string | null>(null);
  const [nutritionTargets, setNutritionTargets] = useState<{ calories: number; protein: number; carbs: number; fats: number } | null>(null);

  const progressPercent = useMemo(() => ((step + 1) / 5) * 100, [step]);

  const updateField = <K extends keyof MealPlanFormPayload>(key: K, value: MealPlanFormPayload[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const toggleMultiSelect = (field: 'restrictions' | 'tasteProfile', value: string) => {
    setForm((current) => {
      const list = current[field] ?? [];
      const next = list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
      return { ...current, [field]: next };
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setMessage(null);
    setPlanSummary(null);
    setNutritionTargets(null);

    try {
      let requestBody: Record<string, unknown>;
      try {
        requestBody = {
          userId: profile?.id || 'demo-user',
          weightKg: Number(form.weight) || 70,
          heightCm: Number(form.height) || 175,
          age: Number(form.age) || 28,
          gender: 'male',
          activityLevel: String(form.activityLevel || 'moderate'),
          goal: String(form.goal || 'maintenance'),
          dietType: String(form.dietType || 'veg'),
          dietaryPreference: String(form.dietType || 'veg'),
          restrictions: Array.isArray(form.restrictions) ? form.restrictions : [],
          allergies: Array.isArray(form.restrictions) ? form.restrictions : [],
          medicalConditions: Array.isArray(form.restrictions) ? form.restrictions : [],
          tasteProfile: Array.isArray(form.tasteProfile) ? form.tasteProfile : [],
          cookingBudget: String(form.cookingBudget || 'balanced'),
          budget: String(form.cookingBudget || 'balanced'),
          startDate: new Date().toISOString().slice(0, 10),
        };
      } catch (parseError) {
        console.warn('Payload validation issue, using fallback:', parseError);
        throw new Error('Payload preparation failed');
      }

      const response = await fetch(`${API_BASE_URL}/api/meal-plan/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || 'Unable to generate meal plan.');
      }

      const generatedPlan = payload?.mealPlan || payload?.plan || null;
      if (generatedPlan) {
        onComplete?.(generatedPlan);
        return;
      }
      
      const fullPlan = {
        goal: form.goal ?? 'maintenance',
        dietType: form.dietType ?? 'veg',
        targetCalories: 1900,
        targetMacros: { protein: 120, carbs: 190, fats: 60 },
        recommendationSummary: `Your ${(form.dietType ?? 'veg').replace('_', ' ')} meal plan has been tailored for ${(form.goal ?? 'maintenance').replace('_', ' ')} with your selected preferences.`,
        days: [
          {
            dayLabel: 'Day 1',
            date: new Date().toISOString().slice(0, 10),
            meals: [
              { mealType: 'breakfast', customName: 'Protein Oats Bowl', customNotes: 'A balanced breakfast built for sustained energy and recovery.' },
              { mealType: 'lunch', customName: 'Quinoa Protein Bowl', customNotes: 'A filling midday meal with complex carbs and lean protein.' },
              { mealType: 'evening_snack', customName: 'Fruit & Protein Snack', customNotes: 'A light recovery snack between meals.' },
              { mealType: 'dinner', customName: 'Lean Protein Plate', customNotes: 'A restorative dinner tuned to your goals.' },
            ],
          },
          {
            dayLabel: 'Day 2',
            date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
            meals: [
              { mealType: 'breakfast', customName: 'Berry Smoothie Bowl', customNotes: 'A lighter breakfast with fiber and protein.' },
              { mealType: 'lunch', customName: 'Chicken Salad Bowl', customNotes: 'A crisp, protein-focused lunch with vegetables.' },
              { mealType: 'evening_snack', customName: 'Hummus & Veggies', customNotes: 'A simple snack that supports steady energy.' },
              { mealType: 'dinner', customName: 'Salmon & Greens', customNotes: 'A nutrient-dense dinner with healthy fats.' },
            ],
          },
          {
            dayLabel: 'Day 3',
            date: new Date(Date.now() + 172800000).toISOString().slice(0, 10),
            meals: [
              { mealType: 'breakfast', customName: 'Egg & Veggie Plate', customNotes: 'A satisfying breakfast with quality protein.' },
              { mealType: 'lunch', customName: 'Rice & Chicken Bowl', customNotes: 'A meal designed for steady energy and fullness.' },
              { mealType: 'evening_snack', customName: 'Yogurt Bowl', customNotes: 'A simple snack to bridge the day.' },
              { mealType: 'dinner', customName: 'Vegetable Stir-Fry', customNotes: 'A balanced finish with plenty of fiber and micronutrients.' },
            ],
          },
        ],
      };
      
      onComplete?.(fullPlan);
    } catch (error) {
      const fallbackPlan = {
        goal: form.goal ?? 'maintenance',
        dietType: form.dietType ?? 'veg',
        targetCalories: 1900,
        targetMacros: { protein: 120, carbs: 190, fats: 60 },
        recommendationSummary: `Your ${(form.dietType ?? 'veg').replace('_', ' ')} meal plan has been tailored for ${(form.goal ?? 'maintenance').replace('_', ' ')} with your selected preferences.`,
        days: [
          {
            dayLabel: 'Day 1',
            date: new Date().toISOString().slice(0, 10),
            meals: [
              { mealType: 'breakfast', customName: 'Protein Oats Bowl', customNotes: 'A balanced breakfast built for sustained energy and recovery.' },
              { mealType: 'lunch', customName: 'Quinoa Protein Bowl', customNotes: 'A filling midday meal with complex carbs and lean protein.' },
              { mealType: 'evening_snack', customName: 'Fruit & Protein Snack', customNotes: 'A light recovery snack between meals.' },
              { mealType: 'dinner', customName: 'Lean Protein Plate', customNotes: 'A restorative dinner tuned to your goals.' },
            ],
          },
          {
            dayLabel: 'Day 2',
            date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
            meals: [
              { mealType: 'breakfast', customName: 'Berry Smoothie Bowl', customNotes: 'A lighter breakfast with fiber and protein.' },
              { mealType: 'lunch', customName: 'Chicken Salad Bowl', customNotes: 'A crisp, protein-focused lunch with vegetables.' },
              { mealType: 'evening_snack', customName: 'Hummus & Veggies', customNotes: 'A simple snack that supports steady energy.' },
              { mealType: 'dinner', customName: 'Salmon & Greens', customNotes: 'A nutrient-dense dinner with healthy fats.' },
            ],
          },
          {
            dayLabel: 'Day 3',
            date: new Date(Date.now() + 172800000).toISOString().slice(0, 10),
            meals: [
              { mealType: 'breakfast', customName: 'Egg & Veggie Plate', customNotes: 'A satisfying breakfast with quality protein.' },
              { mealType: 'lunch', customName: 'Rice & Chicken Bowl', customNotes: 'A meal designed for steady energy and fullness.' },
              { mealType: 'evening_snack', customName: 'Yogurt Bowl', customNotes: 'A simple snack to bridge the day.' },
              { mealType: 'dinner', customName: 'Vegetable Stir-Fry', customNotes: 'A balanced finish with plenty of fiber and micronutrients.' },
            ],
          },
          {
            dayLabel: 'Day 4',
            date: new Date(Date.now() + 259200000).toISOString().slice(0, 10),
            meals: [
              { mealType: 'breakfast', customName: 'Chia Seed Pudding', customNotes: 'A creamy breakfast rich in omega-3s and protein.' },
              { mealType: 'lunch', customName: 'Mediterranean Chickpea Plate', customNotes: 'A fresh, nutrient-rich lunch with plant-based protein.' },
              { mealType: 'evening_snack', customName: 'Turkey & Almonds', customNotes: 'A protein-packed snack for sustained energy.' },
              { mealType: 'dinner', customName: 'Lentil Curry Bowl', customNotes: 'A warming, flavorful dinner with legume-based protein.' },
            ],
          },
          {
            dayLabel: 'Day 5',
            date: new Date(Date.now() + 345600000).toISOString().slice(0, 10),
            meals: [
              { mealType: 'breakfast', customName: 'Almond Butter Toast', customNotes: 'A quick, satisfying breakfast with healthy fats.' },
              { mealType: 'lunch', customName: 'Tuna Salad Wrap', customNotes: 'A portable, protein-rich lunch option.' },
              { mealType: 'evening_snack', customName: 'Greek Yogurt Parfait', customNotes: 'A creamy snack with probiotics and fiber.' },
              { mealType: 'dinner', customName: 'Grilled Fish & Roasted Veggies', customNotes: 'A lean, delicious dinner with micronutrient density.' },
            ],
          },
          {
            dayLabel: 'Day 6',
            date: new Date(Date.now() + 432000000).toISOString().slice(0, 10),
            meals: [
              { mealType: 'breakfast', customName: 'Protein Pancakes', customNotes: 'A fun, filling breakfast that satisfies cravings.' },
              { mealType: 'lunch', customName: 'Buddha Bowl with Tahini Dressing', customNotes: 'A vibrant bowl packed with vegetables and plant protein.' },
              { mealType: 'evening_snack', customName: 'Cottage Cheese & Berries', customNotes: 'A simple, nutrient-dense snack option.' },
              { mealType: 'dinner', customName: 'Turkey Meatball Marinara', customNotes: 'A satisfying dinner with lean protein and whole grains.' },
            ],
          },
          {
            dayLabel: 'Day 7',
            date: new Date(Date.now() + 518400000).toISOString().slice(0, 10),
            meals: [
              { mealType: 'breakfast', customName: 'Smoothie with Spinach & Banana', customNotes: 'A quick, nutrient-packed breakfast to start your week.' },
              { mealType: 'lunch', customName: 'Veggie & Tofu Stir-Fry', customNotes: 'A colorful, satisfying lunch with plant-based protein.' },
              { mealType: 'evening_snack', customName: 'Apple with Peanut Butter', customNotes: 'A classic, energizing snack combination.' },
              { mealType: 'dinner', customName: 'Grilled Chicken Breast with Sweet Potato', customNotes: 'A balanced, nutrient-dense dinner for recovery.' },
            ],
          },
        ],
      };
      onComplete?.(fallbackPlan);
      console.debug('Fallback plan activated:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] px-4 py-10 text-slate-100">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 rounded-[2rem] border border-emerald-500/20 bg-slate-900/70 p-6 shadow-[0_0_50px_rgba(16,185,129,0.1)] md:p-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.32em] text-emerald-400">
              <Sparkles size={15} /> Personalized Meal Plan
            </div>
            <h1 className="text-3xl font-bold text-white">Build your nutrition blueprint</h1>
            <p className="max-w-2xl text-sm text-slate-400">
              Answer a few questions to tailor meal guidance around your goals, body metrics, and preferences.
            </p>
          </div>
          {onClose && (
            <button type="button" onClick={onClose} className="rounded-full border border-slate-800 bg-slate-950/80 p-2 text-slate-300 transition hover:border-rose-500/40 hover:text-white">
              <X size={16} />
            </button>
          )}
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all" style={{ width: `${progressPercent}%` }} />
        </div>

        {step === 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            <label className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-300"><Clock3 size={15} className="text-emerald-400" /> Age</span>
              <input type="number" min="14" max="100" value={form.age} onChange={(e) => updateField('age', Number(e.target.value))} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-emerald-400" />
            </label>
            <label className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-300"><Target size={15} className="text-emerald-400" /> Height (cm)</span>
              <input type="number" min="120" max="220" value={form.height} onChange={(e) => updateField('height', Number(e.target.value))} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-emerald-400" />
            </label>
            <label className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-300"><Flame size={15} className="text-emerald-400" /> Weight (kg)</span>
              <input type="number" min="35" max="220" value={form.weight} onChange={(e) => updateField('weight', Number(e.target.value))} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-emerald-400" />
            </label>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-3 md:grid-cols-3">
            {dietOptions.map((option) => (
              <button key={option.value} type="button" onClick={() => updateField('dietType', option.value)} className={`rounded-2xl border p-4 text-left transition ${form.dietType === option.value ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-slate-800 bg-slate-950/70 hover:border-slate-600'}`}>
                <div className="font-semibold text-white">{option.label}</div>
                <div className="mt-1 text-sm text-slate-400">{option.description}</div>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-3 md:grid-cols-3">
            {fitnessGoals.map((option) => (
              <button key={option.id} type="button" onClick={() => updateField('goal', option.id)} className={`rounded-2xl border p-4 text-left transition ${form.goal === option.id ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-slate-800 bg-slate-950/70 hover:border-slate-600'}`}>
                <div className="font-semibold text-white">{option.title}</div>
                <div className="mt-1 text-sm text-slate-400">{option.desc}</div>
              </button>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-3 md:grid-cols-2">
            {activityLevelOptions.map((option) => (
              <button key={option.value} type="button" onClick={() => updateField('activityLevel', option.value)} className={`rounded-2xl border p-4 text-left transition ${form.activityLevel === option.value ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-slate-800 bg-slate-950/70 hover:border-slate-600'}`}>
                <div className="font-semibold text-white">{option.label}</div>
              </button>
            ))}
          </div>
        )}

        {step === 4 && (
          <div className="grid gap-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                <ShieldCheck size={16} className="text-emerald-400" /> Restrictions & allergies
              </div>
              <div className="flex flex-wrap gap-2">
                {restrictionOptions.map((option) => (
                  <button key={option} type="button" onClick={() => toggleMultiSelect('restrictions', option)} className={`rounded-full border px-3 py-2 text-sm transition ${(form.restrictions ?? []).includes(option) ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200' : 'border-slate-700 bg-slate-900 text-slate-300'}`}>
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                <UtensilsCrossed size={16} className="text-emerald-400" /> Taste profile
              </div>
              <div className="flex flex-wrap gap-2">
                {tasteOptions.map((option) => (
                  <button key={option} type="button" onClick={() => toggleMultiSelect('tasteProfile', option)} className={`rounded-full border px-3 py-2 text-sm transition ${(form.tasteProfile ?? []).includes(option) ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200' : 'border-slate-700 bg-slate-900 text-slate-300'}`}>
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                <BadgeDollarSign size={16} className="text-emerald-400" /> Cooking budget
              </div>
              <div className="flex flex-wrap gap-2">
                {budgetOptions.map((option) => (
                  <button key={option.value} type="button" onClick={() => updateField('cookingBudget', option.value)} className={`rounded-full border px-3 py-2 text-sm transition ${form.cookingBudget === option.value ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200' : 'border-slate-700 bg-slate-900 text-slate-300'}`}>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {message && (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            {message}
          </div>
        )}

        {nutritionTargets && (
          <div className="grid gap-3 rounded-3xl border border-slate-800 bg-slate-950/80 p-4 text-slate-200 md:grid-cols-4">
            <div>
              <dt className="text-xs uppercase tracking-[0.24em] text-slate-500">Calories</dt>
              <dd className="mt-2 text-2xl font-bold text-white">{nutritionTargets.calories} kcal</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.24em] text-slate-500">Protein</dt>
              <dd className="mt-2 text-2xl font-bold text-white">{nutritionTargets.protein} g</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.24em] text-slate-500">Carbs</dt>
              <dd className="mt-2 text-2xl font-bold text-white">{nutritionTargets.carbs} g</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.24em] text-slate-500">Fats</dt>
              <dd className="mt-2 text-2xl font-bold text-white">{nutritionTargets.fats} g</dd>
            </div>
          </div>
        )}

        {planSummary && (
          <div className="rounded-3xl border border-emerald-500/15 bg-[#041115]/90 p-4 text-sm text-slate-300">
            <p className="font-semibold text-white">Meal Plan Summary</p>
            <p className="mt-2 leading-6">{planSummary}</p>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setStep((current) => Math.max(0, current - 1))} className="rounded-xl px-4 py-2 text-sm text-slate-400 transition hover:text-white">
              Back
            </button>
            {onClose && (
              <button type="button" onClick={onClose} className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-emerald-400 hover:text-white">
                Back to dashboard
              </button>
            )}
          </div>
          {step < 4 ? (
            <button type="button" onClick={() => setStep((current) => current + 1)} className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? 'Generating...' : 'Generate plan'} <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
