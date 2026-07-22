import { useState } from 'react';
import { Plus, X, ChevronLeft, ChevronRight, Trash2, Dumbbell, Calendar, Check } from 'lucide-react';
import type { Workout } from '../types';
import { getTrainerClients, CURRENT_TRAINER_ID, MOCK_WORKOUTS } from '../data';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getWeekDates(weekOffset: number) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + weekOffset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      label: weekDays[i],
      date: d.toISOString().split('T')[0],
      dayNum: d.getDate(),
      isToday: d.toISOString().split('T')[0] === today.toISOString().split('T')[0],
    };
  });
}

interface BuilderExercise {
  name: string;
  sets: number;
  reps: string;
  weight: string;
}

export default function TrainerProgramBuilder() {
  const clients = getTrainerClients(CURRENT_TRAINER_ID);
  const [selectedClientId, setSelectedClientId] = useState(clients[0].id);
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekDates, setWeekDates] = useState(getWeekDates(0));
  const [selectedDate, setSelectedDate] = useState(weekDates[0].date);
  const [showBuilder, setShowBuilder] = useState(false);
  const [workoutTitle, setWorkoutTitle] = useState('');
  const [builderExercises, setBuilderExercises] = useState<BuilderExercise[]>([{ name: '', sets: 3, reps: '8-10', weight: '' }]);
  const [assignedWorkouts, setAssignedWorkouts] = useState<Workout[]>(MOCK_WORKOUTS);
  const [savedFlash, setSavedFlash] = useState(false);

  const changeWeek = (dir: number) => {
    const newOffset = weekOffset + dir;
    setWeekOffset(newOffset);
    setWeekDates(getWeekDates(newOffset));
  };

  const addExercise = () => setBuilderExercises(prev => [...prev, { name: '', sets: 3, reps: '8-10', weight: '' }]);
  const removeExercise = (i: number) => setBuilderExercises(prev => prev.filter((_, idx) => idx !== i));
  const updateExercise = (i: number, field: keyof BuilderExercise, value: string | number) => {
    setBuilderExercises(prev => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  };

  const assignWorkout = () => {
    if (!workoutTitle.trim() || builderExercises.every(e => !e.name.trim())) return;
    const newWorkout: Workout = {
      id: `wk_assigned_${Date.now()}`,
      title: workoutTitle.trim(),
      targetDate: selectedDate,
      clientId: selectedClientId,
      createdByTrainerId: CURRENT_TRAINER_ID,
      status: 'pending',
      exercises: builderExercises.filter(e => e.name.trim()).map((e, i) => ({
        id: `ex_${Date.now()}_${i}`,
        workoutId: `wk_assigned_${Date.now()}`,
        name: e.name,
        sets: Array.from({ length: e.sets }, () => ({ reps: parseInt(e.reps) || 8, weight: parseInt(e.weight) || 0, completed: false })),
      })),
    };
    setAssignedWorkouts(prev => [...prev, newWorkout]);
    setShowBuilder(false);
    setWorkoutTitle('');
    setBuilderExercises([{ name: '', sets: 3, reps: '8-10', weight: '' }]);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2500);
  };

  const getWorkoutsForCell = (clientId: string, date: string) => {
    return assignedWorkouts.filter(w => w.clientId === clientId && w.targetDate === date);
  };

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const monthLabel = new Date(weekDates[0].date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Program Builder</h1>
          <p className="text-slate-400 text-sm mt-1">Assign workouts to clients on a weekly calendar.</p>
        </div>
        {savedFlash && (
          <span className="flex items-center gap-1.5 text-sm text-teal-400 bg-teal-500/10 border border-teal-500/20 px-3 py-1.5 rounded-lg">
            <Check size={14} /> Assigned!
          </span>
        )}
      </div>

      {/* Client selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs text-slate-400 font-medium shrink-0">Client:</span>
        {clients.map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedClientId(c.id)}
            className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedClientId === c.id ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-[10px] font-bold">{c.avatarInitials}</span>
            {c.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Calendar */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white text-sm flex items-center gap-2">
            <Calendar size={15} className="text-blue-400" />
            {monthLabel} — {selectedClient?.name}
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={() => changeWeek(-1)} className="p-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-all">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => { setWeekOffset(0); setWeekDates(getWeekDates(0)); }} className="text-xs text-slate-400 hover:text-white px-2">
              Today
            </button>
            <button onClick={() => changeWeek(1)} className="p-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-all">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Calendar grid */}
        <div className="overflow-x-auto -mx-4 px-4 pb-1">
        <div className="grid grid-cols-7 gap-2 min-w-[480px]">
          {weekDates.map(({ label, date, dayNum, isToday }) => {
            const cellWorkouts = getWorkoutsForCell(selectedClientId, date);
            const isSel = date === selectedDate;
            return (
              <div key={date}>
                <div className="text-center mb-1.5">
                  <div className="text-[10px] text-slate-500 uppercase font-medium">{label}</div>
                  <div className={`text-sm font-bold ${isToday ? 'text-blue-400' : 'text-slate-300'}`}>{dayNum}</div>
                </div>
                <button
                  onClick={() => { setSelectedDate(date); setShowBuilder(true); }}
                  className={`w-full min-h-[80px] rounded-xl border p-1.5 transition-all text-left ${
                    isSel ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600'
                  }`}
                >
                  <div className="space-y-1">
                    {cellWorkouts.map(w => (
                      <div key={w.id} className={`text-[10px] px-1.5 py-1 rounded-md truncate ${
                        w.status === 'completed' ? 'bg-teal-500/20 text-teal-300' : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {w.title}
                      </div>
                    ))}
                    {cellWorkouts.length === 0 && (
                      <div className="text-[10px] text-slate-600 flex items-center justify-center h-6">
                        <Plus size={12} />
                      </div>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
        </div>
      </div>

      {/* Builder modal */}
      {showBuilder && (
        <div className="modal-backdrop fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E2937] border border-slate-700/50 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-700/50 shrink-0">
              <div>
                <h2 className="font-bold text-white">Assign Workout</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedClient?.name} · {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
              </div>
              <button onClick={() => setShowBuilder(false)} className="text-slate-400 hover:text-slate-200 p-2">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Workout Title</label>
                <input
                  value={workoutTitle}
                  onChange={e => setWorkoutTitle(e.target.value)}
                  placeholder="e.g. Push Day A"
                  className="input-field w-full"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-slate-400">Exercises</label>
                  <button onClick={addExercise} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                    <Plus size={12} /> Add Exercise
                  </button>
                </div>
                <div className="space-y-2.5">
                  {builderExercises.map((ex, i) => (
                    <div key={i} className="bg-slate-800/60 rounded-xl p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <Dumbbell size={14} className="text-blue-400 shrink-0" />
                        <input
                          value={ex.name}
                          onChange={e => updateExercise(i, 'name', e.target.value)}
                          placeholder="Exercise name"
                          className="flex-1 bg-transparent text-sm text-slate-200 border-b border-slate-600 pb-1 focus:outline-none focus:border-blue-500"
                        />
                        <button onClick={() => removeExercise(i)} className="text-slate-500 hover:text-red-400 p-2">
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-0.5">Sets</label>
                          <input
                            type="number"
                            value={ex.sets}
                            onChange={e => updateExercise(i, 'sets', Number(e.target.value))}
                            className="w-full bg-slate-900/50 text-sm text-center text-slate-200 border border-slate-600 rounded-lg py-1.5 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-0.5">Reps</label>
                          <input
                            value={ex.reps}
                            onChange={e => updateExercise(i, 'reps', e.target.value)}
                            placeholder="8-10"
                            className="w-full bg-slate-900/50 text-sm text-center text-slate-200 border border-slate-600 rounded-lg py-1.5 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-0.5">Weight</label>
                          <input
                            value={ex.weight}
                            onChange={e => updateExercise(i, 'weight', e.target.value)}
                            placeholder="lbs"
                            className="w-full bg-slate-900/50 text-sm text-center text-slate-200 border border-slate-600 rounded-lg py-1.5 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-700/50 shrink-0">
              <button
                onClick={assignWorkout}
                disabled={!workoutTitle.trim() || builderExercises.every(e => !e.name.trim())}
                className="w-full btn-primary py-3 text-sm font-semibold disabled:opacity-40"
              >
                Assign to {selectedClient?.name.split(' ')[0]}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
