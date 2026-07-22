import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getFitnessProgramById, getTrainerById } from '../data';
import { ArrowLeft, Calendar, Users, Sparkles, BookOpen, Play } from 'lucide-react';

export default function ProgramDetails() {
  const navigate = useNavigate();
  const { programId } = useParams();
  const program = useMemo(() => getFitnessProgramById(programId ?? ''), [programId]);
  const trainer = useMemo(() => program?.trainers.map(id => getTrainerById(id)).filter(Boolean) as ReturnType<typeof getTrainerById>[], [program]);

  if (!program) {
    return (
      <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/80 p-8 text-center text-slate-400">
        <p className="text-lg font-semibold text-white">Program not found</p>
        <button onClick={() => navigate('/programs')} className="mt-5 rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950">Browse programs</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      <div className="space-y-4 rounded-[1.75rem] border border-emerald-500/15 bg-[#08111f]/90 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.22)] backdrop-blur-xl">
        <button onClick={() => navigate('/programs')} className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 transition hover:text-emerald-200">
          <ArrowLeft size={16} /> Back to programs
        </button>
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-emerald-300">
              <BookOpen size={14} /> Program details
            </div>
            <h1 className="text-3xl font-semibold text-white">{program.title}</h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-400">{program.description}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-[#030712]/80 p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Monthly price</div>
                <div className="mt-2 text-2xl font-semibold text-white">₹{program.priceMonthly}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#030712]/80 p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Trial sessions</div>
                <div className="mt-2 text-2xl font-semibold text-white">{program.trialClasses.length}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#030712]/80 p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Trainer</div>
                <div className="mt-2 text-2xl font-semibold text-white">{trainer?.map(t => t?.name).join(', ')}</div>
              </div>
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Schedule</div>
                <div className="mt-2 text-lg font-semibold text-white">Weekly plan</div>
              </div>
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">{program.schedule.length} days</span>
            </div>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              {program.schedule.map(item => (
                <li key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#030712]/80 px-3 py-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300"><Calendar size={16} /></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4 rounded-[1.5rem] border border-white/10 bg-[#091124]/80 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
          <div className="flex items-center gap-3 text-sm font-semibold text-emerald-300"><Sparkles size={16} /> Trial class highlights</div>
          <div className="grid gap-3">
            {program.trialClasses.map(trial => (
              <article key={trial.id} className="rounded-2xl border border-white/10 bg-[#030712]/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{trial.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{trial.category}</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-300">{trial.duration}</span>
                </div>
                <button
                  type="button"
                  onClick={() => window.open(trial.videoUrl, '_blank')}
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-200"
                >
                  <Play size={16} /> Watch preview
                </button>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-4 rounded-[1.5rem] border border-emerald-500/15 bg-[#091124]/80 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
          <div className="flex items-center gap-3 text-sm font-semibold text-emerald-300"><Users size={16} /> Coach team</div>
          {trainer?.map(trainerInfo => (
            <div key={trainerInfo?.id} className="rounded-2xl border border-white/10 bg-[#030712]/80 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-sm font-semibold text-white">{trainerInfo?.avatar}</div>
                <div>
                  <div className="text-sm font-semibold text-white">{trainerInfo?.name}</div>
                  <p className="text-xs text-slate-500">{trainerInfo?.category}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-400">{trainerInfo?.bio}</p>
            </div>
          ))}
        </aside>
      </section>
    </div>
  );
}
