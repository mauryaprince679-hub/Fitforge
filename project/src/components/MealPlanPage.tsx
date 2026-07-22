import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../lib/auth';
import { CalendarDays, RotateCcw, Save, Soup, Sparkles } from 'lucide-react';
import MealPlanQuiz from './MealPlanQuiz';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';
const STORAGE_KEY = 'fitforge_saved_meal_plan';

interface MealEntry {
  mealType: 'breakfast' | 'lunch' | 'evening_snack' | 'dinner';
  customName: string;
  customNotes?: string;
}

interface MealPlanDay {
  dayLabel: string;
  date: string;
  meals: MealEntry[];
}

interface MealPlanPayload {
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
}

function normalizePlan(payload: unknown): MealPlanPayload | null {
  if (!payload || typeof payload !== 'object') return null;
  const plan = payload as Partial<MealPlanPayload>;
  if (!plan.days && !plan.targetCalories && !plan.recommendationSummary) return null;
  return {
    ...plan,
    targetCalories: plan.targetCalories ?? 1900,
    targetMacros: {
      protein: plan.targetMacros?.protein ?? 120,
      carbs: plan.targetMacros?.carbs ?? 190,
      fats: plan.targetMacros?.fats ?? 60,
    },
    days: plan.days ?? [],
  };
}

function loadStoredPlan(): MealPlanPayload | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return normalizePlan(parsed);
  } catch {
    return null;
  }
}

function saveStoredPlan(plan: MealPlanPayload | null) {
  if (typeof window === 'undefined') return;
  if (!plan) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
}

export default function MealPlanPage() {
  const { profile } = useAuth();
  const [mealPlan, setMealPlan] = useState<MealPlanPayload | null>(() => loadStoredPlan());
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(!loadStoredPlan());

  useEffect(() => {
    if (!mealPlan) {
      const stored = loadStoredPlan();
      if (stored) {
        setMealPlan(stored);
        setShowQuiz(false);
      }
    }
  }, [mealPlan]);

  const summaryLabel = useMemo(() => {
    if (!mealPlan?.goal) return 'Personalized meal plan';
    return String(mealPlan.goal).replace('_', ' ').toUpperCase();
  }, [mealPlan]);

  const handlePlanComplete = (payload: unknown) => {
    const normalized = normalizePlan(payload);
    if (!normalized) return;

    const savedPlan = {
      ...normalized,
      userId: profile?.id ?? 'demo-user',
    };

    setMealPlan(savedPlan);
    saveStoredPlan(savedPlan);
    setShowQuiz(false);
    setSaveMessage('Personalized meal plan generated and saved locally.');
  };

  const handleSavePlan = async () => {
    if (!mealPlan) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      if (profile?.id) {
        await fetch(`${API_BASE_URL}/api/meal-plan/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: profile.id, mealPlan }),
        });
      }

      saveStoredPlan(mealPlan);
      setSaveMessage('Plan successfully saved to your Meal Plan!');
    } catch (error) {
      console.warn('Unable to save meal plan', error);
      saveStoredPlan(mealPlan);
      setSaveMessage('Plan saved locally for this device.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!mealPlan && showQuiz) {
    return (
      <div className="min-h-screen bg-[#030712] px-4 py-6 text-slate-100">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-emerald-500/20 bg-slate-900/70 p-4 shadow-[0_0_50px_rgba(16,185,129,0.08)] md:p-6">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-emerald-300">
            <Sparkles size={14} /> Meal Plan Builder
          </div>
          <MealPlanQuiz onComplete={handlePlanComplete} onClose={() => setShowQuiz(false)} />
        </div>
      </div>
    );
  }

  if (!mealPlan) {
    return (
      <div className="min-h-screen bg-[#030712] px-4 py-10 text-slate-100">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-800 bg-slate-900/70 p-8 text-center">
          <p className="text-lg font-semibold text-white">No meal plan is saved yet.</p>
          <p className="mt-3 text-sm text-slate-400">Complete the quiz to create your personalized meal plan and save it here.</p>
          <button type="button" onClick={() => setShowQuiz(true)} className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950">
            <Sparkles size={16} /> Create meal plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] px-4 py-6 text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="rounded-[2rem] border border-emerald-500/20 bg-slate-900/70 p-6 shadow-[0_0_50px_rgba(16,185,129,0.1)] md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-emerald-300">
                <Sparkles size={14} /> Personalized Meal Plan
              </div>
              <h1 className="mt-4 text-3xl font-bold text-white">{summaryLabel}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">{mealPlan.recommendationSummary || 'A personalized nutrition blueprint tailored to your profile and preferences.'}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setShowQuiz(true)} className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-emerald-400 hover:text-white">
                <RotateCcw size={16} /> Regenerate
              </button>
              <button type="button" onClick={handleSavePlan} disabled={isSaving} className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-cyan-400/30 bg-gradient-to-r from-cyan-500/15 via-emerald-500/15 to-lime-400/15 px-4 py-2 text-sm font-semibold text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.12)] transition hover:border-cyan-300/50 hover:bg-cyan-500/20 disabled:opacity-50">
                {isSaving ? 'Saving…' : 'Save Plan'}
                {isSaving ? <Save size={16} className="animate-pulse" /> : <Save size={16} />}
              </button>
            </div>
          </div>

          {saveMessage && (
            <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {saveMessage}
            </div>
          )}

          <div className="mt-6 grid gap-3 md:grid-cols-4">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Calories</p>
              <p className="mt-3 text-2xl font-bold text-white">{mealPlan.targetCalories ?? 0} kcal</p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Protein</p>
              <p className="mt-3 text-2xl font-bold text-white">{mealPlan.targetMacros?.protein ?? 0} g</p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Carbs</p>
              <p className="mt-3 text-2xl font-bold text-white">{mealPlan.targetMacros?.carbs ?? 0} g</p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Fats</p>
              <p className="mt-3 text-2xl font-bold text-white">{mealPlan.targetMacros?.fats ?? 0} g</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {mealPlan.days?.map((day, index) => (
            <div key={`${day.dayLabel}-${index}`} className="rounded-[1.75rem] border border-slate-800 bg-slate-900/70 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                <CalendarDays size={16} className="text-emerald-400" />
                {day.dayLabel}
              </div>
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {day.meals?.map((meal) => (
                  <div key={`${day.dayLabel}-${meal.mealType}`} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">
                      <Soup size={14} /> {meal.mealType.replace('_', ' ')}
                    </div>
                    <p className="mt-3 text-lg font-semibold text-white">{meal.customName}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{meal.customNotes || 'A tailored meal recommendation based on your profile.'}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
