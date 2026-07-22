import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Sparkles, Soup, Check } from 'lucide-react';
import { useAuth } from '../lib/auth';

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

export default function MealPlanResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [mealPlan, setMealPlan] = useState<MealPlanPayload | null>(location.state?.mealPlan ?? null);
  const [isLoading, setIsLoading] = useState(!location.state?.mealPlan);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveAndExit = async () => {
    if (!mealPlan || !profile?.id) {
      navigate('/');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        userId: profile.id,
        mealPlan,
      };

      const response = await fetch(`${API_BASE_URL}/api/meal-plan/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok || response.status === 201) {
        setSaveSuccess(true);
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 500);
      } else {
        console.warn('Save response status:', response.status);
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.warn('Error saving meal plan:', error);
      navigate('/', { replace: true });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const loadPlan = async () => {
      if (mealPlan || !profile?.id) return;
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/meal-plan/${profile.id}`);
        const data = await response.json();
        if (response.ok && data?.success && data?.mealPlan) {
          setMealPlan(data.mealPlan);
        }
      } catch (error) {
        console.error('Failed to load meal plan detail', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlan();
  }, [mealPlan, profile]);

  const summaryLabel = useMemo(() => {
    if (!mealPlan?.goal) return 'Personalized meal plan';
    return String(mealPlan.goal).replace('_', ' ').toUpperCase();
  }, [mealPlan]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030712] px-4 py-10 text-slate-100">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-emerald-500/20 bg-slate-900/70 p-6 text-center text-slate-300">
          Loading your full meal plan...
        </div>
      </div>
    );
  }

  if (!mealPlan) {
    return (
      <div className="min-h-screen bg-[#030712] px-4 py-10 text-slate-100">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-800 bg-slate-900/70 p-8 text-center">
          <p className="text-lg font-semibold text-white">No meal plan is available yet.</p>
          <p className="mt-3 text-sm text-slate-400">Generate a plan from the quiz first and you will see your full nutrition blueprint here.</p>
          <button type="button" onClick={() => navigate('/meal-plan')} className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950">
            <ArrowLeft size={16} /> Go back to quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] px-4 py-10 text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="rounded-[2rem] border border-emerald-500/20 bg-slate-900/70 p-6 shadow-[0_0_50px_rgba(16,185,129,0.1)] md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-emerald-300">
                <Sparkles size={14} /> Your personalized plan
              </div>
              <h1 className="mt-4 text-3xl font-bold text-white">{summaryLabel}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">{mealPlan.recommendationSummary || 'A detailed nutrition blueprint tailored to your profile and preferences.'}</p>
            </div>
            <button 
              type="button" 
              onClick={handleSaveAndExit}
              disabled={isSaving}
              className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                saveSuccess 
                  ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-300' 
                  : 'border-slate-700 bg-slate-950/70 text-slate-300 hover:border-emerald-400 hover:text-white disabled:opacity-50'
              }`}
            >
              {saveSuccess ? (
                <>
                  <Check size={16} /> Saved & Exiting
                </>
              ) : isSaving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-emerald-400" />
                  Saving...
                </>
              ) : (
                <>
                  <ArrowLeft size={16} /> Save & Exit
                </>
              )}
            </button>
          </div>

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
