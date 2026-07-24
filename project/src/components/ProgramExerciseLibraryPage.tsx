import React, { useState } from 'react';
import { 
  ArrowLeft, 
  X, 
  Video, 
  Play, 
  Sparkles, 
  Dumbbell, 
  Clock, 
  Film,
  CheckCircle2
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { programs as programCatalog } from './Programs';

export default function ProgramExerciseLibraryPage() {
  const navigate = useNavigate();
  const { programId, videoId } = useParams();
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  const program = programCatalog.find(item => item.id === programId);
  const activeVideo = program?.featuredVideos.find(video => video.id === videoId) ?? program?.featuredVideos[0] ?? null;

  if (!program || !activeVideo) {
    return (
      <div className="space-y-6 rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-[0_0_50px_rgba(16,185,129,0.08)]">
        <button
          type="button"
          onClick={() => navigate('/programs')}
          className="flex items-center gap-2 text-sm font-medium text-emerald-400 transition hover:text-emerald-300"
        >
          <ArrowLeft size={16} /> Back to Programs
        </button>
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-8 text-center">
          <p className="text-lg font-semibold text-white">Program not found</p>
          <p className="mt-2 text-sm text-slate-400">The selected training plan could not be loaded.</p>
        </div>
      </div>
    );
  }

  // Mocked metadata for demonstration matching the screenshot layout
  const exerciseDetails = {
    title: activeVideo.title || "Incline Dumbbell Press",
    category: "CHEST",
    equipment: "DUMBBELL",
    level: "BEGINNER",
    targetMuscles: ["Upper Chest", "Triceps"],
    instructions: [
      "Set your stance so your feet are planted firmly under your shoulders.",
      "Brace your core and keep the movement controlled through the full range of motion.",
      "Focus on form first, then add load gradually as comfort and stability improve."
    ]
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-md mx-auto pb-10">
      {/* HEADER / NAVIGATION BAR */}
      <div className="sticky top-0 z-20 flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3 backdrop-blur-xl">
        <div>
          <h1 className="text-lg font-black text-white">Exercise Guide</h1>
          <p className="text-xs font-semibold text-emerald-400">{exerciseDetails.title}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-full border border-slate-800 bg-slate-900 p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>

      {/* TOP METRICS & CATEGORY CARD */}
      <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
        {/* TAG BADGES */}
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400">
            {exerciseDetails.category}
          </span>
          <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-300">
            {exerciseDetails.equipment}
          </span>
          <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-300">
            {exerciseDetails.level}
          </span>
        </div>

        {/* TARGET MUSCLES */}
        <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/80 p-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">TARGET MUSCLES</p>
          <div className="flex flex-wrap gap-2">
            {exerciseDetails.targetMuscles.map((muscle) => (
              <span key={muscle} className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-medium text-slate-200">
                {muscle}
              </span>
            ))}
          </div>
        </div>

        {/* EQUIPMENT NEEDED */}
        <div className="space-y-1 rounded-xl border border-slate-800 bg-slate-950/80 p-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">EQUIPMENT</p>
          <p className="text-xs font-semibold text-white">Dumbbell</p>
        </div>
      </div>

      {/* HOW TO PERFORM IT CARD */}
      <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
        <div className="flex items-center gap-2 text-emerald-400">
          <Video className="h-4 w-4" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">How to perform it</h2>
        </div>

        <ol className="space-y-3 pt-1">
          {exerciseDetails.instructions.map((step, idx) => (
            <li key={idx} className="flex gap-3 text-xs leading-relaxed text-slate-300">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/20 text-[11px] font-bold text-emerald-400">
                {idx + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* WATCH VIDEO / DEMO CARD */}
      <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Watch Video / Demo</h3>
            <p className="mt-0.5 text-[11px] text-slate-400">
              A quick preview is loaded directly from the exercise database.
            </p>
          </div>
          <button 
            type="button"
            onClick={() => setIsPlayingDemo(!isPlayingDemo)}
            className="flex items-center gap-1 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-md transition-all hover:bg-emerald-400"
          >
            <Play className="h-3 w-3 fill-slate-950" />
            Watch
          </button>
        </div>

        {/* DEMO VIDEO OR GIF BOX */}
        <div className="relative flex h-48 flex-col items-center justify-center overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
          {isPlayingDemo ? (
            <video className="h-full w-full object-cover" controls autoPlay>
              <source src={activeVideo.url} type="video/mp4" />
            </video>
          ) : (
            <button 
              type="button"
              onClick={() => setIsPlayingDemo(true)}
              className="group flex flex-col items-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/20 text-emerald-400 transition-transform group-hover:scale-110">
                <Play className="ml-0.5 h-5 w-5 fill-emerald-400" />
              </div>
              <p className="mt-3 text-xs font-medium text-slate-400">
                Tap the button to preview a movement demo.
              </p>
            </button>
          )}
        </div>
      </div>

      {/* OTHER EXERCISES IN PROGRAM */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <p className="text-[10px] uppercase tracking-wider text-slate-400">More in this program</p>
        <div className="mt-3 grid gap-2">
          {program.featuredVideos.map(video => (
            <button
              key={video.id}
              type="button"
              onClick={() => navigate(`/programs/${program.id}/exercises/${video.id}`)}
              className={`flex items-center gap-3 rounded-xl border p-2.5 text-left transition ${
                video.id === activeVideo.id 
                  ? 'border-emerald-500/40 bg-emerald-500/10' 
                  : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800'
              }`}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-emerald-400">
                <Play size={14} className="ml-0.5 fill-current" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white">{video.title}</p>
                <p className="truncate text-[10px] text-slate-400">{video.duration}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}