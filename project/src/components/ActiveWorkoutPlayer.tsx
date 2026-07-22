import { useState, useEffect } from 'react';
import {
  Play, Pause, Check, ChevronLeft, ChevronRight, X, Clock, Dumbbell,
  Timer, CheckCircle2, Camera,
} from 'lucide-react';
import type { Workout } from '../types';
import { getTodaysWorkout } from '../data';

interface ActiveWorkoutPlayerProps {
  onClose: () => void;
}

const REST_SECONDS = 90;

function RestTimer({ onComplete }: { onComplete: () => void }) {
  const [seconds, setSeconds] = useState(REST_SECONDS);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (seconds <= 0) { onComplete(); return; }
    const t = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds, paused, onComplete]);

  const pct = ((REST_SECONDS - seconds) / REST_SECONDS) * 100;
  const mm = Math.floor(seconds / 60);
  const ss = seconds % 60;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 modal-backdrop">
      <div className="card p-8 text-center max-w-sm w-full">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Timer size={18} className="text-teal-400" />
          <span className="text-sm font-semibold text-teal-400 uppercase tracking-wider">Rest Timer</span>
        </div>
        <div className="relative w-40 h-40 mx-auto mb-4">
          <svg width={160} height={160} className="-rotate-90">
            <circle cx={80} cy={80} r={70} fill="none" stroke="#334155" strokeWidth={8} />
            <circle
              cx={80} cy={80} r={70} fill="none" stroke="#14B8A6" strokeWidth={8}
              strokeDasharray={2 * Math.PI * 70}
              strokeDashoffset={2 * Math.PI * 70 - (pct / 100) * 2 * Math.PI * 70}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-white tabular-nums">{mm}:{ss.toString().padStart(2, '0')}</span>
          </div>
        </div>
        <div className="flex gap-2 justify-center">
          <button onClick={() => setPaused(p => !p)} className="btn-secondary px-4 py-2 text-sm flex items-center gap-2">
            {paused ? <><Play size={14} /> Resume</> : <><Pause size={14} /> Pause</>}
          </button>
          <button onClick={() => setSeconds(REST_SECONDS)} className="btn-secondary px-4 py-2 text-sm">
            Reset
          </button>
          <button onClick={onComplete} className="btn-primary px-4 py-2 text-sm">
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

function FormCheckUpload({ exerciseName }: { exerciseName: string }) {
  const [uploaded, setUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);

  const simulateUpload = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setUploaded(true);
    }, 1800);
  };

  if (uploaded) {
    return (
      <div className="mt-3 p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl flex items-center gap-2">
        <CheckCircle2 size={16} className="text-teal-400 shrink-0" />
        <span className="text-xs text-teal-300">Form check video uploaded for {exerciseName}. Your coach will review it shortly.</span>
      </div>
    );
  }

  return (
    <button
      onClick={simulateUpload}
      disabled={uploading}
      className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-slate-600 hover:border-teal-500/50 text-slate-400 hover:text-teal-400 rounded-xl transition-all text-xs font-medium disabled:opacity-60"
    >
      {uploading ? (
        <><div className="w-3.5 h-3.5 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" /> Uploading...</>
      ) : (
        <><Camera size={14} /> Upload Form Check Video</>
      )}
    </button>
  );
}

function ExerciseCarousel({ workout, onClose }: { workout: Workout; onClose: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exercises, setExercises] = useState(workout.exercises);
  const [showRest, setShowRest] = useState(false);
  const [completedSets, setCompletedSets] = useState(0);
  const [totalSets] = useState(workout.exercises.reduce((a, e) => a + e.sets.length, 0));
  const [workoutDone, setWorkoutDone] = useState(false);

  const current = exercises[currentIndex];

  const updateSet = (setIdx: number, field: 'reps' | 'weight', value: number) => {
    setExercises(prev => {
      const next = [...prev];
      const sets = [...next[currentIndex].sets];
      sets[setIdx] = { ...sets[setIdx], [field]: value };
      next[currentIndex] = { ...next[currentIndex], sets };
      return next;
    });
  };

  const toggleComplete = (setIdx: number) => {
    setExercises(prev => {
      const next = [...prev];
      const sets = [...next[currentIndex].sets];
      const wasComplete = sets[setIdx].completed;
      sets[setIdx] = { ...sets[setIdx], completed: !wasComplete };
      next[currentIndex] = { ...next[currentIndex], sets };
      return next;
    });
    setCompletedSets(prev => {
      const isNowComplete = !exercises[currentIndex].sets[setIdx].completed;
      return isNowComplete ? prev + 1 : Math.max(0, prev - 1);
    });
    // Trigger rest timer when completing a set
    const wasComplete = exercises[currentIndex].sets[setIdx].completed;
    if (!wasComplete) {
      setShowRest(true);
    }
  };

  const allSetsDone = exercises.every(ex => ex.sets.every(s => s.completed));

  useEffect(() => {
    if (allSetsDone && !workoutDone) {
      setWorkoutDone(true);
    }
  }, [allSetsDone, workoutDone]);

  const goNext = () => setCurrentIndex(i => Math.min(i + 1, exercises.length - 1));
  const goPrev = () => setCurrentIndex(i => Math.max(i - 1, 0));

  return (
    <div className="fixed inset-0 bg-[#0F172A] z-50 flex flex-col modal-backdrop">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-[#1E2937]/50 shrink-0">
        <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700/50 transition-all">
          <X size={20} />
        </button>
        <div className="text-center">
          <div className="text-sm font-bold text-white">{workout.title}</div>
          <div className="text-xs text-slate-400">{completedSets}/{totalSets} sets completed</div>
        </div>
        <div className="w-9" />
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-slate-800 shrink-0">
        <div className="h-full bg-teal-500 transition-all duration-500" style={{ width: `${(completedSets / totalSets) * 100}%` }} />
      </div>

      {/* Exercise carousel */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-md mx-auto">
          {/* Carousel nav */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className={`p-2 rounded-lg transition-all ${currentIndex === 0 ? 'text-slate-700 cursor-not-allowed' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
            >
              <ChevronLeft size={22} />
            </button>
            <span className="text-xs text-slate-400 font-medium">
              Exercise {currentIndex + 1} of {exercises.length}
            </span>
            <button
              onClick={goNext}
              disabled={currentIndex === exercises.length - 1}
              className={`p-2 rounded-lg transition-all ${currentIndex === exercises.length - 1 ? 'text-slate-700 cursor-not-allowed' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
            >
              <ChevronRight size={22} />
            </button>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-1.5 mb-5">
            {exercises.map((ex, i) => {
              const allDone = ex.sets.every(s => s.completed);
              return (
                <button
                  key={ex.id}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${i === currentIndex ? 'w-6 bg-teal-500' : allDone ? 'w-1.5 bg-teal-500/50' : 'w-1.5 bg-slate-700'}`}
                />
              );
            })}
          </div>

          {/* Exercise card */}
          <div className="card p-5 animate-fade-in" key={currentIndex}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center">
                <Dumbbell size={18} className="text-teal-400" />
              </div>
              <div>
                <h2 className="font-bold text-white text-lg">{current.name}</h2>
                <p className="text-xs text-slate-400">{current.sets.length} sets</p>
              </div>
            </div>

            {/* Set table */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-2 text-xs text-slate-500 font-medium">
                <span className="w-5 text-center">#</span>
                <span className="flex-1 text-center">Weight (lbs)</span>
                <span className="flex-1 text-center">Reps</span>
                <span className="w-8 text-center">Done</span>
              </div>
              {current.sets.map((set, si) => (
                <div
                  key={si}
                  className={`flex items-center gap-2 p-2.5 rounded-xl transition-all ${set.completed ? 'bg-teal-500/10' : 'bg-slate-800/50'}`}
                >
                  <span className="w-5 text-center text-xs text-slate-500 font-medium">{si + 1}</span>
                  <input
                    type="number"
                    value={set.weight || ''}
                    onChange={e => updateSet(si, 'weight', Number(e.target.value))}
                    placeholder={String(set.weight)}
                    className="flex-1 bg-transparent text-sm text-center text-slate-200 border border-slate-600 rounded-lg py-1.5 focus:outline-none focus:border-teal-500 w-0"
                  />
                  <input
                    type="number"
                    value={set.reps || ''}
                    onChange={e => updateSet(si, 'reps', Number(e.target.value))}
                    placeholder={String(set.reps)}
                    className="flex-1 bg-transparent text-sm text-center text-slate-200 border border-slate-600 rounded-lg py-1.5 focus:outline-none focus:border-teal-500 w-0"
                  />
                  <button
                    onClick={() => toggleComplete(si)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${set.completed ? 'bg-teal-500 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                  >
                    <Check size={14} />
                  </button>
                </div>
              ))}
            </div>

            <FormCheckUpload exerciseName={current.name} />
          </div>

          {/* Next button */}
          {currentIndex < exercises.length - 1 ? (
            <button onClick={goNext} className="w-full btn-secondary py-3 mt-4 text-sm">
              Next Exercise <ChevronRight size={14} className="inline" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className={`w-full py-3 mt-4 rounded-xl text-sm font-semibold transition-all ${workoutDone ? 'btn-primary' : 'btn-secondary'}`}
            >
              {workoutDone ? 'Finish Workout' : 'Finish Workout'}
            </button>
          )}
        </div>
      </div>

      {showRest && <RestTimer onComplete={() => setShowRest(false)} />}
    </div>
  );
}

export default function ActiveWorkoutPlayer({ onClose }: ActiveWorkoutPlayerProps) {
  const todaysWorkout = getTodaysWorkout('u_client_1');
  const [started, setStarted] = useState(false);

  if (!todaysWorkout) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 modal-backdrop" onClick={onClose}>
        <div className="card p-8 text-center max-w-sm">
          <Dumbbell size={32} className="text-slate-500 mx-auto mb-3" />
          <h2 className="font-bold text-white mb-1">No Workout Today</h2>
          <p className="text-sm text-slate-400 mb-4">Your coach hasn't assigned a workout for today. Check back later or browse programs.</p>
          <button onClick={onClose} className="btn-primary text-sm w-full">Go Back</button>
        </div>
      </div>
    );
  }

  if (started) {
    return <ExerciseCarousel workout={todaysWorkout} onClose={onClose} />;
  }

  // Pre-workout summary
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 modal-backdrop">
      <div className="card p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-teal-400" />
            <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">Today's Workout</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1"><X size={18} /></button>
        </div>

        <h2 className="text-xl font-bold text-white mb-1">{todaysWorkout.title}</h2>
        <p className="text-sm text-slate-400 mb-5">Assigned by Coach Marcus · {todaysWorkout.exercises.length} exercises</p>

        <div className="space-y-2 mb-6">
          {todaysWorkout.exercises.map((ex, i) => (
            <div key={ex.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
              <span className="text-xs text-slate-500 font-medium w-5">{i + 1}</span>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{ex.name}</div>
                <div className="text-xs text-slate-400">{ex.sets.length} sets · {ex.sets[0].reps} reps @ {ex.sets[0].weight}lbs</div>
              </div>
              <Dumbbell size={15} className="text-slate-500" />
            </div>
          ))}
        </div>

        <button onClick={() => setStarted(true)} className="w-full btn-primary py-3 text-sm font-semibold flex items-center justify-center gap-2">
          <Play size={16} className="fill-current" /> Start Workout
        </button>
      </div>
    </div>
  );
}
