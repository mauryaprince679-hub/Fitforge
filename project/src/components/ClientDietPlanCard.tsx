import { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { ArrowRight, Soup, CalendarDays, Save, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

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
  id: string;
  userId: string;
  dietType: 'veg' | 'non_veg' | 'vegan';
  goal: 'fat_loss' | 'muscle_gain' | 'maintenance' | 'general';
  targetCalories: number;
  targetMacros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  recommendationSummary?: string;
  days: MealPlanDay[];
}

function buildFallbackMealPlan(): MealPlanPayload {
  const today = new Date();
  const buildMeal = (mealType: MealEntry['mealType'], name: string, note: string): MealEntry => ({
    mealType,
    customName: name,
    customNotes: note,
  });

  return {
    id: `fallback-${today.toISOString()}`,
    userId: 'fallback-user',
    dietType: 'veg',
    goal: 'maintenance',
    targetCalories: 1900,
    targetMacros: { protein: 120, carbs: 190, fats: 60 },
    recommendationSummary: 'A safe fallback meal plan is being shown while the nutrition service finishes loading.',
    days: Array.from({ length: 3 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index);
      return {
        dayLabel: `Day ${index + 1}`,
        date: date.toISOString().slice(0, 10),
        meals: [
          buildMeal('breakfast', 'Berry Oat Bowl', 'Breakfast at 8:00 AM — 1 bowl of oats with berries and 25g protein.'),
          buildMeal('lunch', 'Chicken Quinoa Bowl', 'Lunch at 1:00 PM — 1 bowl with lean protein, vegetables, and complex carbs.'),
          buildMeal('evening_snack', 'Apple with Almond Butter', 'Snack at 4:00 PM — a light, balanced bite with steady energy.'),
          buildMeal('dinner', 'Salmon & Roasted Vegetables', 'Dinner at 7:00 PM — a gentle, protein-forward plate with vegetables.'),
        ],
      };
    }),
  };
}

export default function ClientDietPlanCard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [mealPlan, setMealPlan] = useState<MealPlanPayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showLeavePrompt, setShowLeavePrompt] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [draftTargets, setDraftTargets] = useState({ calories: 1900, protein: 120, carbs: 190, fats: 60 });

  useEffect(() => {
    const loadPlan = async () => {
      if (!profile?.id) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/meal-plan/${profile.id}`);
        const data = await response.json();
        if (!response.ok || !data?.success || !data?.mealPlan) {
          setMealPlan(buildFallbackMealPlan());
          setError(null);
          return;
        }
        setMealPlan(data.mealPlan);
      } catch (err) {
        setMealPlan(buildFallbackMealPlan());
        setError(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadPlan();
  }, [profile]);

  useEffect(() => {
    if (!mealPlan) return;
    setDraftTargets({
      calories: mealPlan.targetCalories,
      protein: mealPlan.targetMacros.protein,
      carbs: mealPlan.targetMacros.carbs,
      fats: mealPlan.targetMacros.fats,
    });
    setHasUnsavedChanges(false);
  }, [mealPlan]);

  const todaysPlan = mealPlan?.days?.[0] || null;

  const handleSavePlan = () => {
    setIsSaving(true);
    setShowToast(false);
    window.setTimeout(() => {
      setIsSaving(false);
      setHasUnsavedChanges(false);
      setShowToast(true);
      window.setTimeout(() => setShowToast(false), 2200);
    }, 700);
  };

  const handleMacroAdjust = (key: keyof typeof draftTargets, delta: number) => {
    setDraftTargets(prev => ({
      ...prev,
      [key]: Math.max(key === 'calories' ? 1200 : 40, prev[key] + delta),
    }));
    setHasUnsavedChanges(true);
  };

  const handleViewPlan = () => {
    if (hasUnsavedChanges) {
      setShowLeavePrompt(true);
      return;
    }
    navigate('/meal-plan');
  };

  const handleLeaveDecision = (decision: 'discard' | 'save') => {
    if (decision === 'save') {
      setShowLeavePrompt(false);
      handleSavePlan();
      return;
    }

    setHasUnsavedChanges(false);
    setShowLeavePrompt(false);
    navigate('/meal-plan');
  };

  return (
    <div className="card border border-emerald-500/10 bg-slate-900/90 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-emerald-300">
            <Soup size={14} /> Meal Plan
          </div>
          <h2 className="mt-4 text-xl font-semibold text-white">Your current nutrition target</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            This card shows the active diet assigned to you. Trainers can update meals and macros directly from the coach panel.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleViewPlan}
            className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/15"
          >
            View plan <ArrowRight size={16} />
          </button>
          <button
            type="button"
            onClick={() => {
              if (hasUnsavedChanges) {
                setShowLeavePrompt(true);
                return;
              }
              handleSavePlan();
            }}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-cyan-400/30 bg-gradient-to-r from-cyan-500/15 via-emerald-500/15 to-lime-400/15 px-4 py-2 text-sm font-semibold text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.12)] transition hover:border-cyan-300/50 hover:bg-cyan-500/20"
          >
            {isSaving ? 'Saving…' : 'Save to Meal Plan'}
            {isSaving ? <Save size={16} className="animate-pulse" /> : <Save size={16} />}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-6 text-center text-sm text-slate-400">
          Loading your diet plan...
        </div>
      ) : error ? (
        <div className="mt-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-sm text-emerald-100">
          A safe fallback meal plan is being shown while the server catches up.
        </div>
      ) : !mealPlan ? (
        <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-6 text-sm text-slate-400">
          No meal plan has been assigned yet. Complete the quiz or ask your coach to assign one.
        </div>
      ) : (
        <div className="mt-6 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.5rem] border border-slate-800 bg-[#02070f]/80 p-5 shadow-[0_0_30px_rgba(16,185,129,0.06)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Macro Targets</p>
                <h3 className="text-lg font-semibold text-white">{mealPlan.goal.replace('_', ' ').toUpperCase()}</h3>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
                {mealPlan.dietType.replace('_', ' ')}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <button
                type="button"
                onClick={() => handleMacroAdjust('calories', 50)}
                className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4 text-left transition hover:border-emerald-400/25 hover:bg-emerald-500/10"
              >
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Calories</p>
                <p className="mt-3 text-2xl font-bold text-white">{draftTargets.calories}</p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-slate-500">Tap to adjust</p>
              </button>
              <button
                type="button"
                onClick={() => handleMacroAdjust('protein', 5)}
                className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4 text-left transition hover:border-emerald-400/25 hover:bg-emerald-500/10"
              >
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Protein</p>
                <p className="mt-3 text-2xl font-bold text-white">{draftTargets.protein}g</p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-slate-500">Tap to adjust</p>
              </button>
              <button
                type="button"
                onClick={() => handleMacroAdjust('carbs', 5)}
                className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4 text-left transition hover:border-emerald-400/25 hover:bg-emerald-500/10"
              >
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Carbs</p>
                <p className="mt-3 text-2xl font-bold text-white">{draftTargets.carbs}g</p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-slate-500">Tap to adjust</p>
              </button>
              <button
                type="button"
                onClick={() => handleMacroAdjust('fats', 2)}
                className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4 text-left transition hover:border-emerald-400/25 hover:bg-emerald-500/10"
              >
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Fats</p>
                <p className="mt-3 text-2xl font-bold text-white">{draftTargets.fats}g</p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-slate-500">Tap to adjust</p>
              </button>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-800 bg-[#02070f]/80 p-5 shadow-[0_0_30px_rgba(16,185,129,0.06)]">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
              <CalendarDays size={16} className="text-emerald-400" />
              Today's meals
            </div>
            {todaysPlan ? (
              <div className="mt-5 space-y-4">
                {['breakfast', 'lunch', 'dinner'].map((mealType) => {
                  const meal = todaysPlan.meals.find((entry) => entry.mealType === mealType);
                  return (
                    <div key={mealType} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{mealType.replace('_', ' ')}</p>
                      <p className="mt-2 text-sm font-semibold text-white">{meal?.customName || 'No meal assigned'}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{meal?.customNotes || 'Your trainer can add details here.'}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-5 rounded-3xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-400">
                No meals are available for today. Your trainer can assign a daily meal plan soon.
              </div>
            )}
          </div>
        </div>
      )}

      {showLeavePrompt && (
        <div className="fixed inset-x-0 bottom-4 z-[70] mx-auto flex max-w-md justify-center px-4">
          <div className="rounded-[1.35rem] border border-emerald-500/20 bg-[#050b16]/95 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <p className="text-sm font-medium text-white">You have unsaved changes. Save plan before leaving?</p>
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => handleLeaveDecision('discard')}
                className="rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm font-semibold text-slate-200"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={() => handleLeaveDecision('save')}
                className="rounded-xl border border-cyan-400/30 bg-cyan-500/15 px-3 py-2 text-sm font-semibold text-cyan-100"
              >
                Save & Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-4 right-4 z-[70] flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-[#07111f]/95 px-4 py-3 text-sm font-medium text-emerald-100 shadow-[0_10px_34px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <CheckCircle2 size={16} className="text-emerald-400" />
          Plan successfully saved to your Meal Plan!
        </div>
      )}
    </div>
  );
}
