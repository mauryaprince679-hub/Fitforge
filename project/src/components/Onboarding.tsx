import { useState } from 'react';
import { ArrowRight, ArrowLeft, Flame, CheckCircle2 } from 'lucide-react';
import type { UserProfile, Goal, ExperienceLevel, Equipment, TrainingSplit, DietType, FitnessGoal, CuisineType } from '../types';

interface OnboardingProps {
  onComplete: (profile: Partial<UserProfile>) => void;
}

const goals: { id: Goal; label: string; desc: string; emoji: string }[] = [
  { id: 'muscle_gain', label: 'Build Muscle', desc: 'Focus on muscle building and strength', emoji: '💪' },
  { id: 'fat_loss', label: 'Lose Fat', desc: 'Drop body fat while preserving muscle', emoji: '🔥' },
  { id: 'strength', label: 'Get Stronger', desc: 'Increase maximal strength', emoji: '🏋️' },
  { id: 'endurance', label: 'Build Endurance', desc: 'Improve cardiovascular fitness', emoji: '🏃' },
  { id: 'general_fitness', label: 'General Fitness', desc: 'Look, feel, and move better', emoji: '⚡' },
];

const experienceLevels: { id: ExperienceLevel; label: string; desc: string; years: string }[] = [
  { id: 'beginner', label: 'Beginner', desc: 'New to structured training', years: '< 1 year' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Consistent training background', years: '1–3 years' },
  { id: 'advanced', label: 'Advanced', desc: 'Serious, experienced lifter', years: '3+ years' },
];

const equipmentOptions: { id: Equipment; label: string; desc: string }[] = [
  { id: 'full_gym', label: 'Full Gym', desc: 'Access to barbells, machines, cables' },
  { id: 'home_gym', label: 'Home Gym', desc: 'Barbells, racks, and some machines' },
  { id: 'dumbbells_only', label: 'Dumbbells Only', desc: 'Limited to free weights' },
  { id: 'bodyweight', label: 'Bodyweight', desc: 'No equipment needed' },
];

const trainingSplits: { id: TrainingSplit; label: string; days: string; desc: string }[] = [
  { id: 'full_body', label: 'Full Body', days: '3 days/week', desc: 'Train all muscle groups each session' },
  { id: 'upper_lower', label: 'Upper / Lower', days: '4 days/week', desc: 'Alternate upper and lower body days' },
  { id: 'ppl', label: 'Push Pull Legs', days: '5-6 days/week', desc: 'Classic PPL split for advanced trainees' },
  { id: 'bro_split', label: 'Bro Split', days: '5 days/week', desc: 'One muscle group per day' },
];

const dietOptions: { id: DietType; label: string; desc: string }[] = [
  { id: 'veg', label: 'Vegetarian', desc: 'Vegetables, dairy, and eggs' },
  { id: 'non_veg', label: 'Non-Vegetarian', desc: 'Includes meat and fish' },
  { id: 'vegan', label: 'Vegan', desc: 'Plant-based only' },
];

const nutritionGoals: { id: FitnessGoal; label: string; desc: string }[] = [
  { id: 'fat_loss', label: 'Fat Loss', desc: 'Leaner meals with a calorie deficit' },
  { id: 'muscle_gain', label: 'Muscle Gain', desc: 'Higher protein, more recovery fuel' },
];

const cuisineOptions: { id: CuisineType; label: string }[] = [
  { id: 'indian', label: 'Indian' },
  { id: 'continental', label: 'Continental' },
  { id: 'asian', label: 'Asian' },
  { id: 'mediterranean', label: 'Mediterranean' },
  { id: 'mexican', label: 'Mexican' },
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<Goal[]>([]);
  const [experience, setExperience] = useState<ExperienceLevel | null>(null);
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [split, setSplit] = useState<TrainingSplit | null>(null);
  const [dietType, setDietType] = useState<DietType | null>(null);
  const [nutritionGoal, setNutritionGoal] = useState<FitnessGoal | null>(null);
  const [cuisineType, setCuisineType] = useState<CuisineType | null>(null);

  const totalSteps = 6;

  const toggleGoal = (goal: Goal) => {
    setSelectedGoals(prev =>
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const canProceed = () => {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return selectedGoals.length > 0;
    if (step === 2) return experience !== null;
    if (step === 3) return equipment !== null;
    if (step === 4) return split !== null;
    if (step === 5) return dietType !== null && nutritionGoal !== null && cuisineType !== null;
    return false;
  };

  const handleComplete = () => {
    onComplete({
      name: name.trim(),
      goals: selectedGoals,
      experience: experience!,
      equipment: equipment!,
      trainingSplit: split!,
      dietType: dietType!,
      nutritionGoal: nutritionGoal!,
      cuisineType: cuisineType!,
    });
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center glow-teal">
            <Flame size={22} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-white">FitForge</span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-1.5 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${i <= step ? 'bg-teal-500' : 'bg-slate-700'}`}
            />
          ))}
        </div>

        <div className="card p-6 md:p-8">
          {step === 0 && (
            <div className="animate-slide-up">
              <h1 className="text-2xl font-bold text-white mb-1">Welcome to FitForge</h1>
              <p className="text-slate-400 mb-6">We will keep things simple and help you get started fast. What should we call you?</p>
              <label className="block text-sm font-medium text-slate-300 mb-2">Your name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && canProceed() && setStep(1)}
                placeholder="Enter your first name"
                className="input-field w-full text-lg"
                autoFocus
              />
            </div>
          )}

          {step === 1 && (
            <div className="animate-slide-up">
              <h2 className="text-2xl font-bold text-white mb-1">What do you want to improve?</h2>
              <p className="text-slate-400 mb-6">Pick the areas that matter most to you. We will guide you from there.</p>
              <div className="grid grid-cols-1 gap-2.5">
                {goals.map(g => (
                  <button
                    key={g.id}
                    onClick={() => toggleGoal(g.id)}
                    className={`flex items-center gap-4 p-3.5 rounded-xl border text-left transition-all duration-200 ${
                      selectedGoals.includes(g.id)
                        ? 'bg-teal-500/15 border-teal-500/50 text-white'
                        : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <span className="text-2xl">{g.emoji}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{g.label}</div>
                      <div className="text-xs text-slate-400">{g.desc}</div>
                    </div>
                    {selectedGoals.includes(g.id) && <CheckCircle2 size={18} className="text-teal-400 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-slide-up">
              <h2 className="text-2xl font-bold text-white mb-1">How experienced are you?</h2>
              <p className="text-slate-400 mb-6">This helps us choose workouts that feel comfortable and challenging.</p>
              <div className="grid grid-cols-1 gap-2.5">
                {experienceLevels.map(e => (
                  <button
                    key={e.id}
                    onClick={() => setExperience(e.id)}
                    className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-200 ${
                      experience === e.id
                        ? 'bg-teal-500/15 border-teal-500/50 text-white'
                        : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{e.label}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{e.desc}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 font-medium">{e.years}</span>
                      {experience === e.id && <CheckCircle2 size={18} className="text-teal-400" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-slide-up">
              <h2 className="text-2xl font-bold text-white mb-1">What equipment do you have?</h2>
              <p className="text-slate-400 mb-6">We will only suggest exercises you can actually do.</p>
              <div className="grid grid-cols-1 gap-2.5">
                {equipmentOptions.map(e => (
                  <button
                    key={e.id}
                    onClick={() => setEquipment(e.id)}
                    className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-200 ${
                      equipment === e.id
                        ? 'bg-teal-500/15 border-teal-500/50 text-white'
                        : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{e.label}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{e.desc}</div>
                    </div>
                    {equipment === e.id && <CheckCircle2 size={18} className="text-teal-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-slide-up">
              <h2 className="text-2xl font-bold text-white mb-1">How often can you train?</h2>
              <p className="text-slate-400 mb-6">Choose a schedule that fits your week.</p>
              <div className="grid grid-cols-1 gap-2.5">
                {trainingSplits.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSplit(s.id)}
                    className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-200 ${
                      split === s.id
                        ? 'bg-teal-500/15 border-teal-500/50 text-white'
                        : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="font-semibold">{s.label}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{s.desc}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-teal-400 font-semibold">{s.days}</span>
                      {split === s.id && <CheckCircle2 size={18} className="text-teal-400" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="animate-slide-up">
              <h2 className="text-2xl font-bold text-white mb-1">Personalize your meal plan</h2>
              <p className="text-slate-400 mb-6">These preferences will help us suggest a tailored meal plan later.</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Diet type</label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {dietOptions.map(option => (
                      <button
                        key={option.id}
                        onClick={() => setDietType(option.id)}
                        className={`rounded-xl border p-3 text-left transition-all ${dietType === option.id ? 'bg-teal-500/15 border-teal-500/50 text-white' : 'bg-slate-800/50 border-slate-700 text-slate-300'}`}
                      >
                        <div className="font-semibold">{option.label}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{option.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Fitness goal</label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {nutritionGoals.map(option => (
                      <button
                        key={option.id}
                        onClick={() => setNutritionGoal(option.id)}
                        className={`rounded-xl border p-3 text-left transition-all ${nutritionGoal === option.id ? 'bg-teal-500/15 border-teal-500/50 text-white' : 'bg-slate-800/50 border-slate-700 text-slate-300'}`}
                      >
                        <div className="font-semibold">{option.label}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{option.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Preferred cuisine</label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {cuisineOptions.map(option => (
                      <button
                        key={option.id}
                        onClick={() => setCuisineType(option.id)}
                        className={`rounded-xl border p-3 text-left transition-all ${cuisineType === option.id ? 'bg-teal-500/15 border-teal-500/50 text-white' : 'bg-slate-800/50 border-slate-700 text-slate-300'}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-700/50">
            <button
              onClick={() => setStep(s => s - 1)}
              disabled={step === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                step === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-white btn-secondary'
              }`}
            >
              <ArrowLeft size={16} /> Back
            </button>

            <span className="text-sm text-slate-500">{step + 1} of {totalSteps}</span>

            {step < totalSteps - 1 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed()}
                className={`flex items-center gap-2 btn-primary text-sm ${!canProceed() ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                Continue <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={!canProceed()}
                className={`flex items-center gap-2 btn-primary text-sm ${!canProceed() ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                Let's Go! <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
