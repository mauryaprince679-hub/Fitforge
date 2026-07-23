import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../lib/auth';
import { CalendarDays, RotateCcw, Save, Soup, Sparkles, Check, ChevronDown, ChevronUp, ShoppingBasket, Leaf, Bookmark, Trash2, Copy, Plus } from 'lucide-react';
import MealPlanQuiz from './MealPlanQuiz';
import { createDietId, getPlanTags, loadSavedDiets, loadStoredPlan, normalizePlan, saveSavedDiets, saveStoredPlan, type MealEntry, type MealPlanPayload, type SavedDietPlan } from '../lib/mealPlans';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEAL_TITLES: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  evening_snack: 'Afternoon Snack',
  dinner: 'Dinner',
};
const MEAL_ICONS: Record<string, string> = {
  breakfast: '🍳',
  lunch: '🥗',
  evening_snack: '🍎',
  dinner: '🍲',
};

export default function MealPlanPage() {
  const { profile } = useAuth();
  const [mealPlan, setMealPlan] = useState<MealPlanPayload | null>(() => loadStoredPlan());
  const [savedDiets, setSavedDiets] = useState<SavedDietPlan[]>(() => loadSavedDiets());
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(!loadStoredPlan());
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [openMeals, setOpenMeals] = useState<Record<string, boolean>>({});
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [consumedMeals, setConsumedMeals] = useState<Record<string, boolean>>({});
  const [activeView, setActiveView] = useState<'plan' | 'saved'>('plan');
  const [customTitle, setCustomTitle] = useState('');

  useEffect(() => {
    if (!mealPlan) {
      const stored = loadStoredPlan();
      if (stored) {
        setMealPlan(stored);
        setShowQuiz(false);
      }
    }
  }, [mealPlan]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const summaryLabel = useMemo(() => {
    if (!mealPlan?.goal) return 'Personalized meal plan';
    return String(mealPlan.goal).replace('_', ' ').toUpperCase();
  }, [mealPlan]);

  const planTags = useMemo(() => getPlanTags(mealPlan), [mealPlan]);

  const currentDay = mealPlan?.days?.[selectedDayIndex] ?? mealPlan?.days?.[0];

  const todaysProgress = useMemo(() => {
    const selectedMeals = currentDay?.meals ?? [];
    const totals = selectedMeals.reduce((acc, meal) => {
      const consumed = consumedMeals[`${currentDay?.dayLabel ?? 'day'}-${meal.mealType}`];
      if (!consumed) return acc;
      const macros = meal.macros ?? { protein: 18, carbs: 20, fats: 10, calories: 260 };
      return {
        protein: acc.protein + macros.protein,
        carbs: acc.carbs + macros.carbs,
        fats: acc.fats + macros.fats,
        calories: acc.calories + macros.calories,
      };
    }, { protein: 0, carbs: 0, fats: 0, calories: 0 });

    const targets = {
      protein: mealPlan?.targetMacros?.protein ?? 120,
      carbs: mealPlan?.targetMacros?.carbs ?? 190,
      fats: mealPlan?.targetMacros?.fats ?? 60,
      calories: mealPlan?.targetCalories ?? 1900,
    };

    return {
      ...totals,
      proteinPct: Math.min(100, Math.round((totals.protein / targets.protein) * 100)),
      carbsPct: Math.min(100, Math.round((totals.carbs / targets.carbs) * 100)),
      fatsPct: Math.min(100, Math.round((totals.fats / targets.fats) * 100)),
      caloriesPct: Math.min(100, Math.round((totals.calories / targets.calories) * 100)),
    };
  }, [consumedMeals, currentDay, mealPlan]);

  const groceryItems = useMemo(() => {
    return (mealPlan?.days ?? []).flatMap((day) =>
      (day.meals ?? []).flatMap((meal) => meal.ingredients ?? [])
    );
  }, [mealPlan]);

  const toggleMeal = (mealId: string) => {
    setConsumedMeals((prev) => ({ ...prev, [mealId]: !prev[mealId] }));
  };

  const toggleMealCard = (mealKey: string) => {
    setOpenMeals((prev) => ({ ...prev, [mealKey]: !prev[mealKey] }));
  };

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
    setToast('Plan generated and ready to review.');
  };

  const handleSavePlan = async () => {
    if (!mealPlan) return;

    setIsSaving(true);

    try {
      if (profile?.id) {
        await fetch(`${API_BASE_URL}/api/meal-plan/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: profile.id, mealPlan }),
        });
      }

      saveStoredPlan(mealPlan);
      setToast('Current plan saved locally.');
    } catch (error) {
      console.warn('Unable to save meal plan', error);
      saveStoredPlan(mealPlan);
      setToast('Plan saved locally for this device.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBookmarkPlan = () => {
    if (!mealPlan) return;
    const title = customTitle.trim() || `Default ${mealPlan.goal ? String(mealPlan.goal).replace('_', ' ') : 'Coach'} Diet`;
    const nextDiet: SavedDietPlan = {
      id: createDietId(),
      title,
      savedAt: new Date().toISOString(),
      plan: { ...mealPlan, id: mealPlan.id ?? createDietId() },
      tags: getPlanTags(mealPlan),
    };

    const nextDiets = [nextDiet, ...savedDiets.filter((diet) => diet.id !== nextDiet.id)];
    setSavedDiets(nextDiets);
    saveSavedDiets(nextDiets);
    setCustomTitle('');
    setToast(`Saved “${title}” to your library.`);
  };

  const handleActivateDiet = (diet: SavedDietPlan) => {
    const normalized = normalizePlan(diet.plan);
    if (!normalized) return;
    setMealPlan(normalized);
    saveStoredPlan(normalized);
    setActiveView('plan');
    setToast(`Activated “${diet.title}”.`);
  };

  const handleDeleteDiet = (dietId: string) => {
    const nextDiets = savedDiets.filter((diet) => diet.id !== dietId);
    setSavedDiets(nextDiets);
    saveSavedDiets(nextDiets);
    setToast('Saved diet removed.');
  };

  const handleDuplicateDiet = (diet: SavedDietPlan) => {
    const duplicate = {
      ...diet,
      id: createDietId(),
      title: `${diet.title} Copy`,
      savedAt: new Date().toISOString(),
    };
    const nextDiets = [duplicate, ...savedDiets.filter((item) => item.id !== diet.id)];
    setSavedDiets(nextDiets);
    saveSavedDiets(nextDiets);
    setToast(`Duplicated “${diet.title}”.`);
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
      {toast && (
        <div className="fixed right-4 top-4 z-50 rounded-2xl border border-emerald-500/20 bg-slate-900/95 px-4 py-3 text-sm text-emerald-200 shadow-xl">
          {toast}
        </div>
      )}

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
              <button type="button" onClick={() => setActiveView(activeView === 'plan' ? 'saved' : 'plan')} className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-emerald-400 hover:text-white">
                <Bookmark size={16} /> {activeView === 'plan' ? 'My Saved Plans' : 'Current Plan'}
              </button>
              <button type="button" onClick={() => setShowQuiz(true)} className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-emerald-400 hover:text-white">
                <RotateCcw size={16} /> Regenerate
              </button>
              <button type="button" onClick={handleSavePlan} disabled={isSaving} className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-cyan-400/30 bg-gradient-to-r from-cyan-500/15 via-emerald-500/15 to-lime-400/15 px-4 py-2 text-sm font-semibold text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.12)] transition hover:border-cyan-300/50 hover:bg-cyan-500/20 disabled:opacity-50">
                {isSaving ? 'Saving…' : 'Save Plan'}
                {isSaving ? <Save size={16} className="animate-pulse" /> : <Save size={16} />}
              </button>
            </div>
          </div>

          {toast && (
            <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {toast}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-3xl border border-slate-800 bg-slate-950/70 p-3">
            <input
              value={customTitle}
              onChange={(event) => setCustomTitle(event.target.value)}
              placeholder="e.g. 3000 kcal High-Protein Bulk"
              className="min-w-[220px] flex-1 rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none ring-0"
            />
            <button type="button" onClick={handleBookmarkPlan} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-3.5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">
              <Bookmark size={15} /> Save Diet
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {planTags.map((tag) => (
              <span key={tag} className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {WEEK_DAYS.map((day, index) => {
              const isActive = selectedDayIndex === index;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDayIndex(index)}
                  className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${isActive ? 'bg-emerald-500 text-slate-950' : 'border border-slate-700 bg-slate-950/70 text-slate-300 hover:border-emerald-500/40 hover:text-white'}`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Today’s progress</p>
              <p className="mt-1 text-lg font-semibold text-white">{currentDay?.dayLabel ?? 'Today'}</p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
              <Leaf size={14} /> {currentDay?.dietaryTag ?? 'Veg'}
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Calories</p>
              <p className="mt-3 text-2xl font-bold text-white">{todaysProgress.calories} / {mealPlan.targetCalories ?? 0} kcal</p>
              <div className="mt-3 h-2 rounded-full bg-slate-800"><div className="h-2 rounded-full bg-emerald-500" style={{ width: `${todaysProgress.caloriesPct}%` }} /></div>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Protein</p>
              <p className="mt-3 text-2xl font-bold text-emerald-400">{todaysProgress.protein} / {mealPlan.targetMacros?.protein ?? 0} g</p>
              <div className="mt-3 h-2 rounded-full bg-slate-800"><div className="h-2 rounded-full bg-emerald-500" style={{ width: `${todaysProgress.proteinPct}%` }} /></div>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Carbs</p>
              <p className="mt-3 text-2xl font-bold text-amber-400">{todaysProgress.carbs} / {mealPlan.targetMacros?.carbs ?? 0} g</p>
              <div className="mt-3 h-2 rounded-full bg-slate-800"><div className="h-2 rounded-full bg-amber-400" style={{ width: `${todaysProgress.carbsPct}%` }} /></div>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Fats</p>
              <p className="mt-3 text-2xl font-bold text-sky-400">{todaysProgress.fats} / {mealPlan.targetMacros?.fats ?? 0} g</p>
              <div className="mt-3 h-2 rounded-full bg-slate-800"><div className="h-2 rounded-full bg-sky-400" style={{ width: `${todaysProgress.fatsPct}%` }} /></div>
            </div>
          </div>
        </div>

        {activeView === 'saved' ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {savedDiets.map((diet) => (
              <div key={diet.id} className="rounded-[1.75rem] border border-slate-800 bg-slate-900/70 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-white">{diet.title}</p>
                    <p className="mt-1 text-sm text-slate-400">Saved {new Date(diet.savedAt).toLocaleDateString()}</p>
                  </div>
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
                    {diet.tags[0] ?? 'Coach'}
                  </span>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3 text-sm">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Calories</p>
                    <p className="mt-1 font-semibold text-white">{diet.plan.targetCalories ?? 0} kcal</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3 text-sm">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Protein</p>
                    <p className="mt-1 font-semibold text-emerald-400">{diet.plan.targetMacros?.protein ?? 0}g</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3 text-sm">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">C / F</p>
                    <p className="mt-1 font-semibold text-amber-300">{diet.plan.targetMacros?.carbs ?? 0}g / {diet.plan.targetMacros?.fats ?? 0}g</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {diet.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-slate-700 bg-slate-950/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-300">{tag}</span>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={() => handleActivateDiet(diet)} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950">
                    <Check size={15} /> Activate Plan
                  </button>
                  <button type="button" onClick={() => handleDuplicateDiet(diet)} className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm font-semibold text-slate-300">
                    <Copy size={15} /> Duplicate
                  </button>
                  <button type="button" onClick={() => handleDeleteDiet(diet.id)} className="inline-flex items-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-300">
                    <Trash2 size={15} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.4rem] border border-slate-800 bg-slate-900/70 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                <ShoppingBasket size={16} className="text-emerald-400" />
                Grocery View
              </div>
              <button type="button" onClick={() => setShowShoppingList((prev) => !prev)} className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20">
                {showShoppingList ? 'Show Meal Timeline' : 'Shopping List / Grocery View'}
              </button>
            </div>

            {!showShoppingList ? (
              <div className="space-y-4">
                {currentDay?.meals?.map((meal) => {
                  const mealKey = `${currentDay.dayLabel}-${meal.mealType}`;
                  const isOpen = openMeals[mealKey] ?? false;
                  const isConsumed = consumedMeals[mealKey] ?? false;
                  return (
                    <div key={mealKey} className="rounded-[1.75rem] border border-slate-800 bg-slate-900/70 p-4">
                      <button type="button" onClick={() => toggleMealCard(mealKey)} className="flex w-full items-start justify-between gap-3 text-left">
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-lg">{MEAL_ICONS[meal.mealType] ?? '🍽️'}</div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">{MEAL_TITLES[meal.mealType] ?? 'Meal'}</p>
                              {meal.tag && <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300">{meal.tag}</span>}
                            </div>
                            <p className="mt-1 text-lg font-semibold text-white">{meal.customName}</p>
                          </div>
                        </div>
                        {isOpen ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                      </button>

                      {isOpen && (
                        <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                          <div className="overflow-hidden rounded-2xl border border-slate-800">
                            <img src={meal.image ?? 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=900&q=80'} alt={meal.customName} className="h-40 w-full object-cover" />
                          </div>
                          <div className="space-y-3">
                            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
                              <div className="flex items-center justify-between text-sm font-semibold text-slate-300">
                                <span>Macro breakdown</span>
                                <span className="text-emerald-300">{meal.macros?.calories ?? 260} kcal</span>
                              </div>
                              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2">
                                  <p className="font-semibold text-emerald-300">P</p>
                                  <p className="mt-1 text-sm font-bold text-white">{meal.macros?.protein ?? 18}g</p>
                                </div>
                                <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-2">
                                  <p className="font-semibold text-amber-300">C</p>
                                  <p className="mt-1 text-sm font-bold text-white">{meal.macros?.carbs ?? 26}g</p>
                                </div>
                                <div className="rounded-xl border border-sky-400/20 bg-sky-400/10 p-2">
                                  <p className="font-semibold text-sky-300">F</p>
                                  <p className="mt-1 text-sm font-bold text-white">{meal.macros?.fats ?? 9}g</p>
                                </div>
                              </div>
                            </div>
                            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
                              <p className="text-sm font-semibold text-white">Ingredients</p>
                              <ul className="mt-2 space-y-1 text-sm text-slate-400">
                                {(meal.ingredients ?? ['Greek yogurt', 'Blueberries', 'Granola', 'Chia seeds']).map((item) => (
                                  <li key={item} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />{item}</li>
                                ))}
                              </ul>
                            </div>
                            <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-3 text-sm font-semibold text-slate-300">
                              <input type="checkbox" checked={isConsumed} onChange={() => toggleMeal(mealKey)} className="h-4 w-4 rounded border-slate-700 bg-slate-900" />
                              <span>Mark as consumed</span>
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[1.75rem] border border-slate-800 bg-slate-900/70 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Weekly grocery checklist</h3>
                  <span className="text-sm text-slate-400">{groceryItems.length} items</span>
                </div>
                <div className="mt-4 grid gap-2 md:grid-cols-2">
                  {groceryItems.map((item) => (
                    <label key={item} className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-300">
                      <input type="checkbox" className="h-4 w-4 rounded border-slate-700 bg-slate-900" />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
