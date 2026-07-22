import { useState, useCallback, useMemo } from 'react';
import { Search, Plus, X, ChevronDown, ChevronUp, Trash2, Check, Clock, Dumbbell, BookOpen, History, BarChart2, Play, Sparkles, Loader2, Video } from 'lucide-react';
import ActiveWorkoutPlayer from './ActiveWorkoutPlayer';
import Modal from './Modal';
import { getTodaysWorkout } from '../data';
import type { Exercise, ExerciseSet, WorkoutExercise } from '../types';
import { EXERCISE_LIBRARY, WORKOUT_HISTORY, WORKOUT_TEMPLATES } from '../data';

type WorkoutTab = 'log' | 'library' | 'history' | 'templates';

const CATEGORIES = ['All', 'Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core'];
const EQUIPMENT_FILTERS = ['All', 'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight'];

function ExerciseLibraryPanel({ onOpenGuide }: { onOpenGuide: (e: Exercise) => void }) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [eqFilter, setEqFilter] = useState('All');

  const filtered = EXERCISE_LIBRARY.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.muscleGroup.some(m => m.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = catFilter === 'All' || e.category === catFilter;
    const matchesEq = eqFilter === 'All' || e.equipment === eqFilter;
    return matchesSearch && matchesCat && matchesEq;
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search exercises..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field w-full pl-9"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCatFilter(c)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${catFilter === c ? 'bg-teal-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {EQUIPMENT_FILTERS.map(e => (
          <button
            key={e}
            onClick={() => setEqFilter(e)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${eqFilter === e ? 'bg-blue-500/80 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            {e}
          </button>
        ))}
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {filtered.length === 0 && (
          <div className="text-center text-slate-500 py-8 text-sm">No exercises found</div>
        )}
        {filtered.map(e => (
          <button
            key={e.id}
            onClick={() => onOpenGuide(e)}
            className="w-full flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl text-left transition-all group"
          >
            <div className="w-9 h-9 bg-teal-500/10 rounded-lg flex items-center justify-center shrink-0">
              <Dumbbell size={15} className="text-teal-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white">{e.name}</div>
              <div className="text-xs text-slate-400">{e.muscleGroup.join(', ')}</div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded-md">{e.category}</span>
              <span className="text-xs text-slate-500">{e.equipment}</span>
            </div>
            <Plus size={14} className="text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

function SetRow({
  setIndex,
  set,
  onChange,
  onRemove,
}: {
  setIndex: number;
  set: ExerciseSet;
  onChange: (s: ExerciseSet) => void;
  onRemove: () => void;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-1.5 sm:gap-2 py-2.5 px-3 rounded-xl transition-all ${set.completed ? 'bg-teal-500/10' : 'bg-slate-800/50'}`}>
      <span className="text-xs text-slate-500 w-5 text-center font-medium">{setIndex + 1}</span>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={set.weight || ''}
          onChange={e => onChange({ ...set, weight: Number(e.target.value) })}
          placeholder="0"
          className="w-14 sm:w-16 bg-transparent text-sm text-center text-slate-200 border border-slate-600 rounded-lg py-1.5 focus:outline-none focus:border-teal-500"
        />
        <span className="text-xs text-slate-500">lbs</span>
      </div>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={set.reps || ''}
          onChange={e => onChange({ ...set, reps: Number(e.target.value) })}
          placeholder="0"
          className="w-12 sm:w-14 bg-transparent text-sm text-center text-slate-200 border border-slate-600 rounded-lg py-1.5 focus:outline-none focus:border-teal-500"
        />
        <span className="text-xs text-slate-500">reps</span>
      </div>
      <div className="flex items-center gap-1 ml-auto sm:ml-0">
        <input
          type="number"
          value={set.rpe || ''}
          onChange={e => onChange({ ...set, rpe: Number(e.target.value) })}
          placeholder="RPE"
          min="1" max="10"
          className="w-14 sm:w-16 bg-transparent text-sm text-center text-slate-200 border border-slate-600 rounded-lg py-1.5 focus:outline-none focus:border-teal-500"
        />
        <button
          onClick={() => onChange({ ...set, completed: !set.completed })}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${set.completed ? 'bg-teal-500 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
        >
          <Check size={14} />
        </button>
        <button onClick={onRemove} className="text-slate-600 hover:text-red-400 transition-colors p-2 -mr-1">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function ExerciseBlock({
  we,
  index,
  onChange,
  onRemove,
}: {
  we: WorkoutExercise;
  index: number;
  onChange: (we: WorkoutExercise) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(true);

  const addSet = () => {
    const lastSet = we.sets[we.sets.length - 1];
    onChange({
      ...we,
      sets: [...we.sets, { reps: lastSet?.reps || 0, weight: lastSet?.weight || 0, rpe: lastSet?.rpe, completed: false }],
    });
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium w-5">{index + 1}</span>
          <div>
            <div className="font-semibold text-white text-sm">{we.exercise.name}</div>
            <div className="text-xs text-slate-400">{we.exercise.muscleGroup.join(', ')}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setExpanded(!expanded)} className="text-slate-400 hover:text-slate-200 p-2">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button onClick={onRemove} className="text-slate-600 hover:text-red-400 p-2 transition-colors">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-1.5">
          <div className="hidden sm:flex items-center gap-2 px-3 mb-2">
            <span className="text-xs text-slate-500 w-5">#</span>
            <span className="text-xs text-slate-500 w-16 text-center">Weight</span>
            <span className="w-5" />
            <span className="w-4" />
            <span className="text-xs text-slate-500 w-14 text-center">Reps</span>
            <span className="text-xs text-slate-500 w-16 text-center">RPE</span>
          </div>
          {we.sets.map((set, si) => (
            <SetRow
              key={si}
              setIndex={si}
              set={set}
              onChange={updated => {
                const sets = [...we.sets];
                sets[si] = updated;
                onChange({ ...we, sets });
              }}
              onRemove={() => {
                const sets = we.sets.filter((_, i) => i !== si);
                onChange({ ...we, sets });
              }}
            />
          ))}
          <button
            onClick={addSet}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-teal-400 hover:text-teal-300 border border-dashed border-teal-500/30 hover:border-teal-500/60 rounded-xl transition-all mt-2"
          >
            <Plus size={13} /> Add Set
          </button>
        </div>
      )}
    </div>
  );
}

export default function WorkoutTracker() {
  const [activeTab, setActiveTab] = useState<WorkoutTab>('log');
  const [workoutName, setWorkoutName] = useState('Push Day A');
  const [exercises, setExercises] = useState<WorkoutExercise[]>([
    {
      exercise: EXERCISE_LIBRARY[0],
      sets: [
        { reps: 5, weight: 225, rpe: 8, completed: false },
        { reps: 5, weight: 225, rpe: 8, completed: false },
        { reps: 5, weight: 225, rpe: 0, completed: false },
        { reps: 5, weight: 225, rpe: 0, completed: false },
      ],
    },
  ]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [elapsedDisplay] = useState('0:00');
  const [workoutSaved, setWorkoutSaved] = useState(false);
  const [showActivePlayer, setShowActivePlayer] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  const [demoMediaUrl, setDemoMediaUrl] = useState('');
  const todaysWorkout = getTodaysWorkout('u_client_1');

  const addExercise = useCallback((e: Exercise) => {
    setExercises(prev => [...prev, {
      exercise: e,
      sets: [{ reps: 0, weight: 0, completed: false }],
    }]);
    setShowExercisePicker(false);
  }, []);

  const saveWorkout = () => {
    setWorkoutSaved(true);
    setTimeout(() => setWorkoutSaved(false), 3000);
  };

  const completedSets = exercises.flatMap(e => e.sets).filter(s => s.completed).length;
  const totalSets = exercises.flatMap(e => e.sets).length;
  const totalVolume = exercises.flatMap(e => e.sets.filter(s => s.completed)).reduce((acc, s) => acc + s.weight * s.reps, 0);

  const tabs = [
    { id: 'log' as WorkoutTab, label: 'Log', icon: Dumbbell },
    { id: 'library' as WorkoutTab, label: 'Exercises', icon: BookOpen },
    { id: 'history' as WorkoutTab, label: 'History', icon: History },
    { id: 'templates' as WorkoutTab, label: 'Templates', icon: BarChart2 },
  ];

  const openExerciseGuide = useCallback((exercise: Exercise) => {
    setSelectedExercise(exercise);
    setMediaLoading(false);
    setMediaError(false);
    setDemoMediaUrl('');
  }, []);

  const resolveExerciseByName = useCallback((name: string): Exercise => {
    const match = EXERCISE_LIBRARY.find(exercise => exercise.name.toLowerCase() === name.toLowerCase());
    if (match) return match;

    return {
      id: `fallback-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name,
      category: 'General',
      muscleGroup: ['Full Body'],
      equipment: 'Bodyweight',
      difficulty: 'beginner',
    };
  }, []);

  const loadDemoMedia = useCallback((exercise: Exercise) => {
    const normalizedName = exercise.name.replace(/\s+/g, '_');
    const mediaUrl = `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${exercise.id}/${normalizedName}.gif`;
    setMediaLoading(true);
    setMediaError(false);
    setDemoMediaUrl(mediaUrl);

    const img = new Image();
    img.src = mediaUrl;
    img.onload = () => setMediaLoading(false);
    img.onerror = () => {
      setMediaLoading(false);
      setMediaError(true);
    };
  }, []);

  const exerciseInstructions = useMemo(() => {
    if (!selectedExercise) return [];
    return [
      `Set your stance so your feet are planted firmly under your shoulders.`,
      `Brace your core and keep the movement controlled through the full range of motion.`,
      `Focus on form first, then add load gradually as comfort and stability improve.`,
    ];
  }, [selectedExercise]);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Workout Tracker</h1>
        {workoutSaved && (
          <span className="flex items-center gap-1.5 text-sm text-teal-400 bg-teal-500/10 border border-teal-500/20 px-3 py-1.5 rounded-lg">
            <Check size={14} /> Saved!
          </span>
        )}
      </div>

      {/* Today's assigned workout CTA */}
      {todaysWorkout && activeTab === 'log' && (
        <div className="card p-4 bg-gradient-to-r from-teal-500/10 to-cyan-600/5 border-teal-500/20 flex items-center gap-4">
          <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center shrink-0">
            <Sparkles size={18} className="text-teal-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-teal-400 uppercase tracking-wider">Coach Assigned</div>
            <div className="font-semibold text-white text-sm truncate">{todaysWorkout.title}</div>
            <div className="text-xs text-slate-400">{todaysWorkout.exercises.length} exercises · Follow along with simple guidance</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {todaysWorkout.exercises.slice(0, 4).map(exercise => {
                const matchedExercise = resolveExerciseByName(exercise.name);
                return (
                  <button
                    key={exercise.id}
                    type="button"
                    onClick={() => openExerciseGuide(matchedExercise)}
                    className="rounded-full border border-teal-500/20 bg-slate-900/60 px-2.5 py-1 text-[11px] font-medium text-slate-200 transition hover:border-teal-400/40 hover:text-white"
                  >
                    {exercise.name}
                  </button>
                );
              })}
            </div>
          </div>
          <button
            onClick={() => setShowActivePlayer(true)}
            className="btn-primary text-xs px-4 py-2.5 shrink-0 flex items-center gap-1.5"
          >
            <Play size={13} className="fill-current" /> Start
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/50 p-1 rounded-xl">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === id ? 'bg-teal-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon size={14} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'log' && (
        <div className="space-y-4">
          {/* Workout header */}
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <input
                value={workoutName}
                onChange={e => setWorkoutName(e.target.value)}
                className="flex-1 bg-transparent text-lg font-bold text-white focus:outline-none focus:text-teal-300 transition-colors"
              />
              <div className="flex items-center gap-4 text-xs text-slate-400 shrink-0">
                <span className="flex items-center gap-1"><Clock size={12} /> {elapsedDisplay}</span>
                <span className="text-teal-400 font-semibold">{completedSets}/{totalSets} sets</span>
                {totalVolume > 0 && <span>{(totalVolume / 1000).toFixed(1)}k lbs</span>}
              </div>
            </div>
            {totalSets > 0 && (
              <div className="mt-3 h-1.5 bg-slate-700 rounded-full">
                <div
                  className="h-full bg-teal-500 rounded-full transition-all duration-500"
                  style={{ width: `${(completedSets / totalSets) * 100}%` }}
                />
              </div>
            )}
          </div>

          {/* Exercise blocks */}
          {exercises.map((we, i) => (
            <ExerciseBlock
              key={`${we.exercise.id}-${i}`}
              we={we}
              index={i}
              onChange={updated => {
                const updated_arr = [...exercises];
                updated_arr[i] = updated;
                setExercises(updated_arr);
              }}
              onRemove={() => setExercises(prev => prev.filter((_, idx) => idx !== i))}
            />
          ))}

          {/* Add exercise */}
          {showExercisePicker ? (
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white text-sm">Add Exercise</h3>
                <button onClick={() => setShowExercisePicker(false)} className="text-slate-400 hover:text-slate-200">
                  <X size={16} />
                </button>
              </div>
              <ExerciseLibraryPanel onOpenGuide={exercise => {
                setShowExercisePicker(false);
                openExerciseGuide(exercise);
              }} />
            </div>
          ) : (
            <button
              onClick={() => setShowExercisePicker(true)}
              className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-slate-600 hover:border-teal-500/50 text-slate-400 hover:text-teal-400 rounded-2xl transition-all text-sm font-medium"
            >
              <Plus size={16} /> Add Exercise
            </button>
          )}

          {exercises.length > 0 && (
            <button
              onClick={saveWorkout}
              className="w-full btn-primary py-3 text-sm font-semibold"
            >
              Save Workout
            </button>
          )}
        </div>
      )}

      {activeTab === 'library' && (
        <div className="card p-5">
          <h2 className="font-semibold text-white mb-4">Exercise Library</h2>
          <ExerciseLibraryPanel onOpenGuide={exercise => {
            addExercise(exercise);
            setActiveTab('log');
            openExerciseGuide(exercise);
          }} />
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-3">
          {WORKOUT_HISTORY.map(w => (
            <div key={w.id} className="card p-4 hover:border-slate-600 transition-all cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white">{w.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(w.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-teal-400">{w.duration} min</div>
                  <div className="text-xs text-slate-400">{(w.totalVolume / 1000).toFixed(1)}k lbs</div>
                </div>
              </div>
              {w.exercises.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {w.exercises.map(({ exercise }) => (
                    <span key={exercise.id} className="text-xs bg-slate-700/60 text-slate-400 px-2 py-0.5 rounded-md">
                      {exercise.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="space-y-4">
          {WORKOUT_TEMPLATES.map(t => (
            <div key={t.id} className="card p-5 hover:border-slate-600 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{t.name}</h3>
                    <span className="badge bg-teal-500/20 text-teal-400">{t.category}</span>
                  </div>
                  <p className="text-xs text-slate-400">{t.description}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
                  <Clock size={12} />
                  <span>~{t.estimatedDuration} min</span>
                </div>
              </div>

              <div className="space-y-1.5 mb-4">
                {t.exercises.map(({ exercise, sets, reps, restSeconds }) => (
                  <div key={exercise.id} className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">{exercise.name}</span>
                    <span className="text-slate-500">{sets}×{reps} — {restSeconds}s rest</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setWorkoutName(t.name);
                  setExercises(t.exercises.map(({ exercise, sets, reps }) => ({
                    exercise,
                    sets: Array.from({ length: sets }, () => ({
                      reps: parseInt(reps) || 8,
                      weight: 0,
                      completed: false,
                    })),
                  })));
                  setActiveTab('log');
                }}
                className="btn-primary text-sm w-full"
              >
                Load Template
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={Boolean(selectedExercise)}
        onClose={() => setSelectedExercise(null)}
        title="Exercise Guide"
        description={selectedExercise?.name}
        size="lg"
        variant="white"
      >
        {selectedExercise && (
          <div className="space-y-5">
            <div className="rounded-[1.25rem] border border-white/10 bg-slate-900/70 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-teal-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-300">
                  {selectedExercise.category}
                </span>
                <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  {selectedExercise.equipment}
                </span>
                <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  {selectedExercise.difficulty}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-800 bg-[#030712]/70 p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Target muscles</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedExercise.muscleGroup.map(muscle => (
                      <span key={muscle} className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300">{muscle}</span>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-[#030712]/70 p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Equipment</div>
                  <p className="mt-2 text-sm text-slate-300">{selectedExercise.equipment}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.25rem] border border-white/10 bg-slate-900/70 p-4">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-emerald-500/10 p-2 text-emerald-300">
                  <Video size={16} />
                </div>
                <h4 className="text-sm font-semibold text-white">How to perform it</h4>
              </div>
              <ol className="mt-3 space-y-2 text-sm text-slate-300">
                {exerciseInstructions.map((step, index) => (
                  <li key={step} className="flex gap-2">
                    <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-teal-500/15 text-center text-[11px] font-semibold leading-5 text-teal-300">{index + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-[1.25rem] border border-white/10 bg-slate-900/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-white">Watch Video / Demo</div>
                  <div className="text-xs text-slate-400">A quick GIF preview is loaded directly from the exercise database.</div>
                </div>
                <button
                  type="button"
                  onClick={() => loadDemoMedia(selectedExercise)}
                  className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
                >
                  Watch Video / Demo
                </button>
              </div>

              <div className="mt-4 min-h-[220px] rounded-[1.1rem] border border-dashed border-slate-700 bg-[#030712]/70 p-3">
                {mediaLoading && (
                  <div className="flex h-full min-h-[180px] items-center justify-center rounded-[0.9rem] bg-slate-900/50">
                    <div className="flex flex-col items-center gap-3 text-center">
                      <Loader2 size={24} className="animate-spin text-teal-400" />
                      <p className="text-sm text-slate-400">Loading demo media...</p>
                    </div>
                  </div>
                )}

                {!mediaLoading && demoMediaUrl && !mediaError && (
                  <img
                    src={demoMediaUrl}
                    alt={`${selectedExercise.name} demo`}
                    className="h-full max-h-[220px] w-full rounded-[0.9rem] object-contain"
                    onError={() => setMediaError(true)}
                  />
                )}

                {!mediaLoading && !demoMediaUrl && !mediaError && (
                  <div className="flex h-full min-h-[180px] items-center justify-center rounded-[0.9rem] border border-slate-800 bg-slate-900/40 text-center text-sm text-slate-400">
                    Tap the button to preview a movement demo.
                  </div>
                )}

                {!mediaLoading && mediaError && (
                  <div className="flex h-full min-h-[180px] items-center justify-center rounded-[0.9rem] border border-amber-500/20 bg-amber-500/10 text-center text-sm text-amber-300">
                    Demo media could not be loaded right now. Try again in a moment.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {showActivePlayer && (
        <ActiveWorkoutPlayer onClose={() => setShowActivePlayer(false)} />
      )}
    </div>
  );
}
