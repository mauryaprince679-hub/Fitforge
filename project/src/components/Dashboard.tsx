import { useEffect, useState } from 'react';
import { Flame, Dumbbell, TrendingUp, Calendar, ChevronRight, Trophy, Zap, Target, Clock, BarChart2, Play, Droplets, MessageCircle, Plus, Radio, Users, Info, X, Soup, ArrowRight } from 'lucide-react';
import type { UserProfile, Page } from '../types';
import { WORKOUT_HISTORY, WORKOUT_TEMPLATES, getTodaysAnalytics, getTodaysWorkout, DAILY_MOTIVATION, MOCK_USERS, CURRENT_TRAINER_ID } from '../data';
import { useLive } from '../lib/live';
import { loadStoredPlan } from '../lib/mealPlans';
import OnboardingTour from './OnboardingTour';
import { ThemeToggle } from './ThemeToggle';

interface DashboardProps {
  user: UserProfile;
  onNavigate: (page: Page) => void;
  onTourStateChange: (open: boolean) => void;
}

type Recording = {
  id: string;
  title: string;
  date: string;
  duration: string;
  thumbnail: string;
  videoSrc: string;
};

const RECORDINGS: Recording[] = [
  {
    id: 'rec-1',
    title: 'Full-Body HIIT Circuit',
    date: 'Jul 12, 2026',
    duration: '45 mins',
    thumbnail: 'https://images.unsplash.com/photo-1554284126-aa88f22d8d28?auto=format&fit=crop&w=800&q=80',
    videoSrc: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  },
  {
    id: 'rec-2',
    title: 'Advanced Mobility & Core',
    date: 'Jul 8, 2026',
    duration: '38 mins',
    thumbnail: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80',
    videoSrc: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  },
  {
    id: 'rec-3',
    title: 'Nutrition Q&A Masterclass',
    date: 'Jul 2, 2026',
    duration: '52 mins',
    thumbnail: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    videoSrc: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  },
];

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getWeekWorkouts() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  return weekDays.map((day, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const hasWorkout = WORKOUT_HISTORY.some(w => w.date === dateStr);
    const isToday = dateStr === today.toISOString().split('T')[0];
    const isPast = date < today && !isToday;
    return { day, date: dateStr, hasWorkout, isToday, isPast };
  });
}

const weekWorkouts = getWeekWorkouts();

// Activity Ring component
function ActivityRing({ progress, color, label, value, sub, size = 90, tooltipText, tooltipKey, activeTooltip, onToggleTooltip }: {
  progress: number; color: string; label: string; value: string; sub: string; size?: number; tooltipText: string; tooltipKey: string; activeTooltip: string | null; onToggleTooltip: (key: string) => void;
}) {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(progress, 100) / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
        <div className="relative">
          <button
            type="button"
            onClick={() => onToggleTooltip(tooltipKey)}
            className="rounded-full border border-slate-300 bg-white/80 p-1 text-slate-500 transition hover:border-emerald-400/50 hover:text-emerald-500 dark:border-slate-700/70 dark:bg-slate-800/70 dark:text-slate-400"
          >
            <Info size={11} />
          </button>
          {activeTooltip === tooltipKey && (
            <div className="absolute left-1/2 top-full z-20 mt-2 w-48 -translate-x-1/2 rounded-xl border border-slate-200 bg-white/95 p-2 text-[11px] leading-relaxed text-slate-700 shadow-lg dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-300">
              {tooltipText}
            </div>
          )}
        </div>
      </div>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#cbd5e1" strokeWidth={stroke} />
          <circle
            cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={stroke}
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-slate-900 dark:text-white">{value}</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">{sub}</span>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ user, onNavigate, onTourStateChange }: DashboardProps) {
  const { activeSession, joinStream } = useLive();
  const [waterMl, setWaterMl] = useState(() => getTodaysAnalytics('u_client_1')?.waterMl ?? 1200);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [nutritionSnapshot, setNutritionSnapshot] = useState(() => {
    const activePlan = loadStoredPlan();
    return {
      calories: activePlan?.targetCalories ?? 1860,
      protein: activePlan?.targetMacros?.protein ?? 118,
      carbs: activePlan?.targetMacros?.carbs ?? 172,
      fats: activePlan?.targetMacros?.fats ?? 58,
      tag: activePlan?.days?.[0]?.dietaryTag ?? 'High Protein',
    };
  });
  const analytics = getTodaysAnalytics('u_client_1');
  const todaysWorkout = getTodaysWorkout('u_client_1');
  const nextWorkout = WORKOUT_TEMPLATES[0];
  const recentWorkouts = WORKOUT_HISTORY.slice(0, 3);
  const totalVolumeThisWeek = WORKOUT_HISTORY.slice(0, 3).reduce((acc, w) => acc + w.totalVolume, 0);
  const completedThisWeek = weekWorkouts.filter(d => d.hasWorkout).length;
  const trainer = MOCK_USERS.find(u => u.id === CURRENT_TRAINER_ID);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasCompletedTour = localStorage.getItem('hasCompletedTour');
    if (!hasCompletedTour || hasCompletedTour === 'false') {
      setIsTourOpen(true);
      onTourStateChange(true);
    }
  }, [onTourStateChange]);

  useEffect(() => {
    const syncNutrition = () => {
      const activePlan = loadStoredPlan();
      setNutritionSnapshot({
        calories: activePlan?.targetCalories ?? 1860,
        protein: activePlan?.targetMacros?.protein ?? 118,
        carbs: activePlan?.targetMacros?.carbs ?? 172,
        fats: activePlan?.targetMacros?.fats ?? 58,
        tag: activePlan?.days?.[0]?.dietaryTag ?? 'High Protein',
      });
    };

    syncNutrition();
    window.addEventListener('fitforge:meal-plan-updated', syncNutrition);
    return () => window.removeEventListener('fitforge:meal-plan-updated', syncNutrition);
  }, []);

  const toggleTooltip = (key: string) => {
    setActiveTooltip(current => current === key ? null : key);
  };

  const closeTour = () => {
    setIsTourOpen(false);
    onTourStateChange(false);
  };

  const handleTourFinish = () => {
    localStorage.setItem('hasCompletedTour', 'true');
    closeTour();
  };

  const openRecording = (recording: Recording) => {
    setSelectedRecording(recording);
  };

  const closeRecording = () => {
    setSelectedRecording(null);
  };

  const calorieGoal = 600;
  const caloriePct = ((analytics?.caloriesBurned ?? 0) / calorieGoal) * 100;
  const waterGoal = 3000;
  const waterPct = (waterMl / waterGoal) * 100;
  const stepGoal = 10000;
  const stepPct = ((analytics?.steps ?? 0) / stepGoal) * 100;

  return (
    <div className="space-y-6 animate-fade-in bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#0a0f1d] dark:text-slate-100">
      <OnboardingTour
        isOpen={isTourOpen}
        onClose={closeTour}
        onFinish={handleTourFinish}
      />

      {/* Header */}
      <div className="relative overflow-hidden rounded-[1.6rem] border border-slate-200/80 bg-white/90 p-4 shadow-sm transition-colors duration-300 dark:border-emerald-500/20 dark:bg-[#0f1728]/95 dark:shadow-[0_0_40px_rgba(16,185,129,0.08)] md:p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),_transparent_45%)]" />
        <div className="absolute right-4 top-3 h-2 w-2 rounded-full bg-emerald-400/70 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
        <div className="absolute bottom-4 right-20 h-1.5 w-1.5 rounded-full bg-amber-400/60 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-500 dark:text-emerald-400/80">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              Neural Fitness Console
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Welcome back, <span className="text-gradient">{user.name.split(' ')[0]}</span>
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Your Fitness Overview · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-[1rem] border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.15)] dark:bg-emerald-950/20">
              <Flame size={16} className="animate-pulse text-emerald-500 dark:text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="font-mono text-sm font-semibold tracking-[0.25em] text-emerald-700 dark:text-emerald-300">{user.streakDays}</span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-400/80">Day Streak</span>
            </div>
            <div className="hidden h-8 w-px bg-slate-300 dark:bg-emerald-500/10 md:block" />
            <ThemeToggle />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          setIsTourOpen(true);
          onTourStateChange(true);
        }}
        className="self-start rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-400/20"
      >
        Open quick guide
      </button>

      {/* Live session banner */}
      {activeSession && (
        <button
          onClick={() => { joinStream(activeSession.id); onNavigate('live'); }}
          className="w-full text-left relative overflow-hidden bg-gradient-to-r from-red-500/20 to-orange-500/10 border border-red-500/30 rounded-2xl p-4 group hover:border-red-500/50 transition-all"
        >
          <div className="absolute inset-0 bg-red-500/5 animate-pulse-slow" />
          <div className="relative flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-red-500 rounded-2xl animate-ping opacity-30" />
              <div className="relative w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/40">
                <Radio size={22} className="text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="flex items-center gap-1 text-xs font-bold text-red-400 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> Live Now
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Users size={11} /> {activeSession.viewerCount} watching
                </span>
              </div>
              <div className="font-bold text-white text-sm truncate">{activeSession.title}</div>
              <div className="text-xs text-slate-400">Your trainer is live — tap to join!</div>
            </div>
            <div className="flex items-center gap-1 bg-red-500 group-hover:bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all shrink-0">
              Join <ChevronRight size={15} />
            </div>
          </div>
        </button>
      )}

      {/* Activity Rings */}
      <div id="dashboard-activity-card" className="relative overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-[#131b2e] dark:shadow-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.08),_transparent_40%)]" />
        <h2 className="relative mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-400">Today's Activity</h2>
        <div className="relative flex items-center justify-around gap-2">
          <ActivityRing progress={caloriePct} color="#34D399" label="Calories" value={`${analytics?.caloriesBurned ?? 0}`} sub={`/ ${calorieGoal}`} tooltipText="Shows the energy you burned today. Your daily target is 600 kcal." tooltipKey="calories" activeTooltip={activeTooltip} onToggleTooltip={toggleTooltip} />
          <ActivityRing progress={waterPct} color="#A3E635" label="Water" value={`${(waterMl / 1000).toFixed(1)}L`} sub={`/ 3.0L`} tooltipText="Tracks how much water you drank today. A good goal is about 3.0 liters." tooltipKey="water" activeTooltip={activeTooltip} onToggleTooltip={toggleTooltip} />
          <ActivityRing progress={stepPct} color="#10B981" label="Steps" value={`${((analytics?.steps ?? 0) / 1000).toFixed(1)}k`} sub={`/ 10k`} tooltipText="Shows how active you were today. Try to reach 10,000 steps for a solid daily goal." tooltipKey="steps" activeTooltip={activeTooltip} onToggleTooltip={toggleTooltip} />
        </div>

        {/* Water quick-add */}
        <div className="relative mt-4 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-emerald-500/10">
          <div className="flex items-center gap-2">
            <Droplets size={16} className="text-emerald-500 dark:text-emerald-400" />
            <span className="text-sm text-slate-700 dark:text-slate-300">Water Intake</span>
            <span className="metric-number text-sm text-slate-900 dark:text-white">{waterMl}ml</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setWaterMl(w => Math.max(0, w - 250))}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition-all hover:bg-slate-100 hover:text-emerald-600 active:scale-90 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-emerald-200"
            >
              <span className="text-lg leading-none">−</span>
            </button>
            <button
              onClick={() => setWaterMl(w => w + 250)}
              className="flex h-10 items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-500/15 px-4 text-sm font-semibold text-emerald-600 transition-all hover:bg-emerald-500/20 active:scale-95 dark:text-emerald-400"
            >
              <Plus size={14} /> 250ml
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-[1.4rem] border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-300 dark:border-emerald-500/20 dark:bg-[#131b2e]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-400">
              <Soup size={14} /> Nutrition Snapshot
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Today’s Macro Ring</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">A concise view of your nutrition targets with a quick path into the full plan.</p>
          </div>
          <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-500">
            {nutritionSnapshot.tag}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {[
            { label: 'Calories', value: `${nutritionSnapshot.calories.toLocaleString()}`, unit: 'kcal', tone: 'text-emerald-500' },
            { label: 'Protein', value: `${nutritionSnapshot.protein}g`, unit: 'goal', tone: 'text-emerald-500' },
            { label: 'Carbs', value: `${nutritionSnapshot.carbs}g`, unit: 'goal', tone: 'text-amber-400' },
            { label: 'Fats', value: `${nutritionSnapshot.fats}g`, unit: 'goal', tone: 'text-sky-400' },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/70">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">{item.label}</p>
              <p className={`mt-2 text-lg font-bold ${item.tone}`}>{item.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{item.unit}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="text-sm text-slate-600 dark:text-slate-400">You’ve matched 92% of today’s planned macros.</div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => onNavigate('meal_plan')} className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-3.5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">
              Log Today’s Meals <ArrowRight size={15} />
            </button>
            <button onClick={() => onNavigate('meal_plan')} className="rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-500/40 hover:text-emerald-500 dark:border-slate-700 dark:text-slate-300">
              View Full Nutrition Plan
            </button>
          </div>
        </div>
      </div>

      {/* Coach's Corner */}
      <div className="rounded-[1.4rem] border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-300 dark:border-emerald-500/20 dark:bg-[#131b2e] dark:bg-gradient-to-br dark:from-emerald-500/10 dark:to-lime-600/5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/20 to-lime-400/20 text-sm font-bold text-white">
            {trainer?.avatarInitials}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-400">Coach's Corner</span>
              <MessageCircle size={13} className="text-emerald-500/60 dark:text-emerald-400/60" />
            </div>
            <p className="text-sm text-slate-700 leading-relaxed italic dark:text-slate-200">"{DAILY_MOTIVATION}"</p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">— {trainer?.name}</p>
          </div>
        </div>
      </div>

      {/* Weekly Activity */}
      <div className="rounded-[1.4rem] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 dark:border-slate-800 dark:bg-[#131b2e] dark:shadow-none">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">This Week</h2>
          <span className="metric-number text-xs text-slate-700 dark:text-slate-300">{completedThisWeek}/5 sessions</span>
        </div>
        <div className="mb-4 flex items-end justify-between gap-2">
          {weekWorkouts.map(({ day, hasWorkout, isToday }) => (
            <div key={day} className="flex flex-col items-center gap-2 flex-1">
              <div
                className={`w-full rounded-lg border border-emerald-500/10 transition-all ${
                  hasWorkout ? 'bg-emerald-500/20 shadow-[0_0_18px_rgba(16,185,129,0.14)]' : isToday ? 'border-emerald-500/30 bg-emerald-500/10' : 'bg-slate-100 dark:bg-slate-900/70'
                }`}
                style={{ height: hasWorkout ? '48px' : '32px' }}
              />
              <span className={`text-xs font-medium ${isToday ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>{day}</span>
            </div>
          ))}
        </div>
        <div className="h-1 rounded-full bg-slate-200 dark:bg-slate-800/80">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 transition-all duration-1000" style={{ width: `${(completedThisWeek / 5) * 100}%` }} />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Workouts', value: completedThisWeek.toString(), sub: 'this week', icon: Dumbbell, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Volume', value: `${(totalVolumeThisWeek / 1000).toFixed(1)}k`, sub: 'lbs lifted', icon: BarChart2, color: 'text-lime-400', bg: 'bg-lime-500/10' },
          { label: 'Streak', value: `${user.streakDays}`, sub: 'consecutive days', icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10' },
          { label: 'PRs', value: '2', sub: 'this week', icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
        ].map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-[1.2rem] border border-slate-200 bg-white p-4 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-[#131b2e]">
            <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${bg}`}>
              <Icon size={18} className={color} />
            </div>
            <div className="metric-number text-2xl text-slate-900 dark:text-white">{value}</div>
            <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{sub}</div>
            <div className="mt-0.5 text-xs text-slate-600 dark:text-slate-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Today's Workout / Next Workout */}
      <div className="relative overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-[#131b2e] dark:bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.08),_transparent_40%)]">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {todaysWorkout ? "Today's Workout" : 'Next Workout'}
            </span>
            <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{todaysWorkout?.title ?? nextWorkout.name}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {todaysWorkout ? `${todaysWorkout.exercises.length} exercises assigned by your coach` : nextWorkout.description}
            </p>
          </div>
          <div className="mt-1 flex shrink-0 items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <Clock size={13} />
            <span>~{todaysWorkout ? 65 : nextWorkout.estimatedDuration} min</span>
          </div>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          {(todaysWorkout ? todaysWorkout.exercises.slice(0, 4).map(ex => ex.name) : nextWorkout.exercises.slice(0, 4).map(ex => ex.exercise.name)).map((name, i) => (
            <span key={i} className="rounded-lg border border-emerald-500/10 bg-slate-100 px-2.5 py-1 text-xs text-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
              {name}
            </span>
          ))}
        </div>
        <button onClick={() => onNavigate('workout')} className="btn-primary flex items-center gap-2 rounded-lg text-sm">
          <Play size={14} className="fill-current" />
          {todaysWorkout ? 'Start Workout' : 'View Workout'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Recent Workouts */}
        <div className="rounded-[1.4rem] border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-[#131b2e]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-400">Recent Workouts</h2>
            <button onClick={() => onNavigate('workout')} className="flex items-center gap-1 text-xs text-emerald-600 transition-colors hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300">
              View all <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {recentWorkouts.map(w => (
              <div key={w.id} className="flex items-center gap-3 rounded-[1.15rem] border border-slate-200 bg-slate-50 p-3 transition-colors duration-300 dark:border-emerald-500/10 dark:bg-[#08101f]/70">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-500/10 bg-emerald-500/10">
                  <Dumbbell size={16} className="text-emerald-500 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm font-medium text-slate-900 dark:text-white">{w.name}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">{new Date(w.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="metric-number text-[11px] text-slate-900 dark:text-white">{w.duration} min</div>
                  <div className="text-xs text-slate-500 dark:text-slate-500">{(w.totalVolume / 1000).toFixed(1)}k lbs</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-[1.4rem] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 dark:border-slate-800 dark:bg-[#131b2e] dark:shadow-none">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-400">Quick Actions</h2>
          <div className="space-y-2.5">
            {[
              { label: 'Log a Workout', desc: 'Record what you did today', icon: Dumbbell, page: 'workout' as Page, color: 'text-emerald-400 bg-emerald-500/10' },
              { label: 'View Programs', desc: 'Browse simple training plans', icon: Calendar, page: 'programs' as Page, color: 'text-lime-400 bg-lime-500/10' },
              { label: 'Track Progress', desc: 'See your progress clearly', icon: TrendingUp, page: 'progress' as Page, color: 'text-green-400 bg-green-500/10' },
              { label: 'Chat with Coach', desc: 'Get support and guidance', icon: Zap, page: 'coach' as Page, color: 'text-yellow-400 bg-yellow-500/10' },
              { label: 'Start Live Session', desc: 'Join the coach live', icon: Target, page: 'live' as Page, color: 'text-red-400 bg-red-500/10' },
            ].map(({ label, desc, icon: Icon, page, color }) => (
              <button key={label} onClick={() => onNavigate(page)} className="group flex w-full items-center gap-3 rounded-[1.15rem] border border-slate-200 bg-slate-50 p-3 transition-all hover:border-emerald-400/30 hover:bg-emerald-500/10 dark:border-emerald-500/10 dark:bg-[#08101f]/70">
                <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center shrink-0`}>
                  <Icon size={15} />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-slate-800 transition-colors group-hover:text-slate-950 dark:text-slate-200 dark:group-hover:text-white">{label}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-500">{desc}</div>
                </div>
                <ChevronRight size={14} className="text-slate-500 transition-colors group-hover:text-slate-700 dark:text-slate-600 dark:group-hover:text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-400">Past Live Sessions & Recordings</h2>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-500">Rewatch premium livestream workouts, Q&amp;A, and recovery sessions on demand.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {RECORDINGS.map(recording => (
            <button
              key={recording.id}
              type="button"
              onClick={() => openRecording(recording)}
              className="group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-0 text-left shadow-sm transition-transform duration-300 hover:-translate-y-0.5 hover:border-emerald-500/30 dark:border-slate-700/70 dark:bg-slate-950/80 dark:shadow-[0_20px_60px_rgba(0,0,0,0.22)]"
            >
              <div className="relative h-48 overflow-hidden bg-slate-900">
                <img src={recording.thumbnail} alt={recording.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/35" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/90 text-white shadow-lg shadow-emerald-500/20 transition-transform duration-300 group-hover:scale-105">
                    <Play size={18} />
                  </div>
                </div>
              </div>
              <div className="space-y-2 p-4">
                <div className="text-sm font-semibold text-slate-900 dark:text-white">{recording.title}</div>
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>{recording.date}</span>
                  <span>{recording.duration}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedRecording && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-slate-700/80 bg-slate-950/95 shadow-2xl">
            <button
              type="button"
              onClick={closeRecording}
              className="absolute right-4 top-4 z-10 rounded-full border border-slate-700/80 bg-slate-900/90 p-2 text-slate-200 transition hover:border-emerald-400/60 hover:text-white"
            >
              <X size={18} />
            </button>
            <div className="p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">{selectedRecording.title}</h3>
                  <p className="text-sm text-slate-400">{selectedRecording.date} · {selectedRecording.duration}</p>
                </div>
              </div>
              <div className="overflow-hidden rounded-[1.5rem] border border-slate-800 bg-black">
                <video
                  src={selectedRecording.videoSrc}
                  controls
                  className="h-full w-full bg-black"
                  poster={selectedRecording.thumbnail}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
