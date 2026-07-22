import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../lib/auth';
import { useNavigate } from 'react-router-dom';
import { Plus, Save, Trash2, ShieldCheck } from 'lucide-react';

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

interface TrainerDietManagerProps {
  clientId?: string;
  clientName?: string;
}

export default function TrainerDietManager({ clientId, clientName }: TrainerDietManagerProps) {
  const displayClientName = clientName || 'selected client';
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [mealPlan, setMealPlan] = useState<MealPlanPayload | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selectedDay = mealPlan?.days?.[selectedDayIndex] || null;

  useEffect(() => {
    const loadPlan = async () => {
      if (!clientId) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/meal-plan/${clientId}`);
        const data = await response.json();
        if (response.ok && data.success) {
          setMealPlan(data.mealPlan);
        }
      } catch (error) {
        console.error('Unable to load plan', error);
      }
    };
    loadPlan();
  }, [clientId]);

  const handleUpdateMeal = (mealType: MealEntry['mealType'], field: 'customName' | 'customNotes', value: string) => {
    if (!mealPlan) return;
    setMealPlan((current) => {
      if (!current) return null;
      const next = { ...current };
      next.days = next.days.map((day, index) => {
        if (index !== selectedDayIndex) return day;
        return {
          ...day,
          meals: day.meals.map(meal => meal.mealType === mealType ? { ...meal, [field]: value } : meal),
        };
      });
      return next;
    });
  };

  const handleSwapMeal = (mealType: MealEntry['mealType']) => {
    if (!mealPlan) return;
    const newMealName = window.prompt('Enter the new meal name:', 'Protein Bowl');
    if (!newMealName) return;
    handleUpdateMeal(mealType, 'customName', newMealName);
  };

  const handleAddMeal = () => {
    if (!mealPlan) return;
    setMealPlan((current) => {
      if (!current) return null;
      const next = { ...current };
      const currentDay = next.days[selectedDayIndex];
      const newMealType = `custom_${Date.now()}` as MealEntry['mealType'];
      currentDay.meals.push({ mealType: newMealType, customName: 'Custom Meal', customNotes: '' });
      next.days[selectedDayIndex] = currentDay;
      return next;
    });
  };

  const handleDeleteMeal = (mealType: MealEntry['mealType']) => {
    if (!mealPlan) return;
    setMealPlan((current) => {
      if (!current) return null;
      const next = { ...current };
      next.days = next.days.map((day, index) => {
        if (index !== selectedDayIndex) return day;
        return {
          ...day,
          meals: day.meals.filter((meal) => meal.mealType !== mealType),
        };
      });
      return next;
    });
  };

  const handleTargetChange = (field: 'targetCalories' | 'protein' | 'carbs' | 'fats', value: number) => {
    if (!mealPlan) return;
    setMealPlan((current) => {
      if (!current) return null;
      const next = { ...current };
      if (field === 'targetCalories') {
        next.targetCalories = value;
      } else {
        next.targetMacros = {
          ...next.targetMacros,
          [field]: value,
        } as MealPlanPayload['targetMacros'];
      }
      return next;
    });
  };

  const canSave = !!mealPlan && profile?.role !== 'client';

  const savePlan = async () => {
    if (!mealPlan || !profile) return;
    setIsSaving(true);
    setMessage(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/meals/edit`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainerId: profile.id,
          userId: clientId,
          mealPlan,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setMessage(data.message || 'Unable to save meal plan.');
      } else {
        setMessage('Meal plan updated successfully.');
      }
    } catch (error) {
      setMessage('Unable to save meal plan.');
    } finally {
      setIsSaving(false);
    }
  };

  const dayTabs = useMemo(() => mealPlan?.days.map((day, index) => ({ label: day.dayLabel, index })) || [], [mealPlan]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">Trainer Diet Manager</p>
          <h1 className="text-2xl font-semibold text-white">Edit diet plan for {displayClientName}</h1>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            Update calories, macros, and individual meals. Only trainers can save changes to a client's assigned diet.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/coach')}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-2 text-sm text-slate-200 transition hover:border-emerald-500/30"
        >
          Back to coach dashboard
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-[1.6rem] border border-slate-800 bg-[#02070f]/90 p-6 shadow-[0_0_30px_rgba(16,185,129,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-400 uppercase tracking-[0.24em]">Selected Day</p>
              <h2 className="text-xl font-semibold text-white">{selectedDay?.dayLabel || 'No day selected'}</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {dayTabs.map(({ label, index }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setSelectedDayIndex(index)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${selectedDayIndex === index ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Target Calories</p>
              <input
                type="number"
                value={mealPlan?.targetCalories ?? 0}
                onChange={(event) => handleTargetChange('targetCalories', Number(event.target.value))}
                className="mt-3 w-full rounded-2xl border border-slate-800 bg-[#02070f] px-4 py-3 text-lg font-semibold text-white outline-none focus:border-emerald-400"
              />
            </div>
            <div className="grid gap-3">
              {['protein', 'carbs', 'fats'].map((macro) => (
                <div key={macro} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{macro}</p>
                  <input
                    type="number"
                    value={(mealPlan?.targetMacros as any)?.[macro] ?? 0}
                    onChange={(event) => handleTargetChange(macro as any, Number(event.target.value))}
                    className="mt-3 w-full rounded-2xl border border-slate-800 bg-[#02070f] px-4 py-3 text-lg font-semibold text-white outline-none focus:border-emerald-400"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-[1.4rem] border border-slate-800 bg-[#041115]/80 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">Meals</p>
                <p className="text-sm text-slate-500">Edit breakfast, lunch, and dinner or add custom meals.</p>
              </div>
              <button
                type="button"
                onClick={handleAddMeal}
                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200 transition hover:bg-emerald-500/15"
              >
                <Plus size={16} /> Add meal
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {selectedDay?.meals.map((meal) => (
                <div key={meal.mealType} className="rounded-3xl border border-slate-800 bg-slate-900/90 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                        {meal.mealType === 'evening_snack' ? 'Snacks' : meal.mealType.replace('_', ' ')}
                      </p>
                      <input
                        type="text"
                        value={meal.customName}
                        onChange={(event) => handleUpdateMeal(meal.mealType, 'customName', event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-800 bg-[#02070f] px-4 py-3 text-sm font-semibold text-white outline-none focus:border-emerald-400"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleSwapMeal(meal.mealType)}
                        className="rounded-2xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-sm text-slate-300 transition hover:border-emerald-500/20"
                      >
                        Swap
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMeal(meal.mealType)}
                        className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200 transition hover:bg-rose-500/20"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={meal.customNotes}
                    onChange={(event) => handleUpdateMeal(meal.mealType, 'customNotes', event.target.value)}
                    placeholder="Add notes or recipe details"
                    className="mt-4 min-h-[96px] w-full resize-none rounded-3xl border border-slate-800 bg-[#02070f] px-4 py-3 text-sm text-slate-200 outline-none focus:border-emerald-400"
                  />
                </div>
              ))}
            </div>
          </div>

          {message && (
            <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
              {message}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={savePlan}
              disabled={!canSave || isSaving || !clientId}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={16} /> {isSaving ? 'Saving...' : 'Save updates'}
            </button>
            <span className="text-sm text-slate-400">
              {clientId ? 'Only trainers can apply changes to the assigned plan.' : 'Select a client to start managing their nutrition plan.'}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[1.5rem] border border-slate-800 bg-[#02070f]/90 p-5">
            <div className="flex items-center gap-3 text-slate-400">
              <ShieldCheck size={16} className="text-emerald-400" />
              <p className="text-sm font-semibold text-white">Trainer Control Panel</p>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <p>Review client macros and make quick adjustments for changes in goals or training phase.</p>
              <p>Updates are saved directly to the assigned meal plan and reflected in the client experience.</p>
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-slate-800 bg-[#02070f]/90 p-5">
            <h3 className="text-sm font-semibold text-white">Daily Summary</h3>
            <p className="mt-3 text-sm text-slate-400">Client:</p>
            <p className="text-base font-semibold text-white">{clientName}</p>
            <p className="mt-4 text-sm text-slate-400">Assigned Goal:</p>
            <p className="text-base font-semibold text-white">{mealPlan?.goal.replace('_', ' ') || 'Not assigned'}</p>
            <p className="mt-4 text-sm text-slate-400">Diet type:</p>
            <p className="text-base font-semibold text-white">{mealPlan?.dietType.replace('_', ' ') || 'Not assigned'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
