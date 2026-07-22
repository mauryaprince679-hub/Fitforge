import { ArrowLeft, Clock, Film, Play, Sparkles } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { programs as programCatalog } from './Programs';

export default function ProgramExerciseLibraryPage() {
  const navigate = useNavigate();
  const { programId, videoId } = useParams();

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="sticky top-0 z-20 -mx-1 mb-2 rounded-[1.25rem] border border-white/10 bg-slate-950/80 px-3 py-3 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => navigate('/programs')}
          className="flex items-center gap-2 text-sm font-medium text-slate-200 transition hover:text-emerald-300"
        >
          <ArrowLeft size={16} /> Back to Program
        </button>
      </div>

      <section className="overflow-hidden rounded-[2rem] border border-emerald-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 shadow-[0_0_60px_rgba(16,185,129,0.12)]">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-400">
              Exercise Library
            </span>
            <span className="rounded-full border border-white/10 bg-slate-800/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-300">
              {program.category}
            </span>
          </div>

          <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black">
            <video className="aspect-video w-full" controls preload="metadata" poster="https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80">
              <source src={activeVideo.url} type="video/mp4" />
            </video>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <h1 className="text-2xl font-semibold text-white">{activeVideo.title}</h1>
              <p className="mt-2 text-sm text-slate-400">{activeVideo.subtitle}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
              <span className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-800/80 px-3 py-1.5">
                <Clock size={14} className="text-emerald-400" /> {activeVideo.duration}
              </span>
              <span className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-800/80 px-3 py-1.5">
                <Film size={14} className="text-emerald-400" /> Premium form preview
              </span>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Sparkles size={15} className="text-emerald-400" /> Movement focus
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-400">
                This exercise preview is designed to help you understand the setup, tempo, and positioning before you train. Use it as a quick refresher while you move through the program.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">More in this program</p>
            <h2 className="text-lg font-semibold text-white">Related exercise clips</h2>
          </div>
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-400">
            {program.featuredVideos.length} total
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {program.featuredVideos.map(video => (
            <button
              key={video.id}
              type="button"
              onClick={() => navigate(`/programs/${program.id}/exercises/${video.id}`)}
              className={`group rounded-2xl border p-3 text-left transition ${video.id === activeVideo.id ? 'border-emerald-400/40 bg-emerald-500/10' : 'border-white/10 bg-slate-950/50 hover:border-emerald-400/30 hover:bg-slate-800/70'}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-emerald-400">
                  <Play size={16} className="ml-0.5 fill-current" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{video.title}</p>
                  <p className="mt-1 truncate text-xs text-slate-400">{video.subtitle}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
