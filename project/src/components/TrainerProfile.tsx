import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTrainerById, getProgramsByTrainer } from '../data';
import { ArrowLeft, Star, Sparkles, BookOpen } from 'lucide-react';

export default function TrainerProfile() {
  const navigate = useNavigate();
  const { trainerId } = useParams();
  const trainer = useMemo(() => getTrainerById(trainerId ?? ''), [trainerId]);
  const programs = useMemo(() => (trainer ? getProgramsByTrainer(trainer.id) : []), [trainer]);

  if (!trainer) {
    return (
      <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/80 p-8 text-center text-slate-400">
        <p className="text-lg font-semibold text-white">Trainer not found</p>
        <button onClick={() => navigate('/trainers')} className="mt-5 rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950">Back to directory</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      <div className="relative overflow-hidden rounded-[2rem] border border-emerald-500/15 bg-[#08111f]/90 shadow-[0_10px_30px_rgba(0,0,0,0.24)]">
        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${trainer.coverImage})` }} />
        <div className="relative rounded-[2rem] bg-[#01080f]/95 p-6 sm:p-8">
          <button onClick={() => navigate('/trainers')} className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 transition hover:text-emerald-200">
            <ArrowLeft size={16} /> Back to directory
          </button>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-emerald-500 to-cyan-500 text-3xl font-semibold text-white">{trainer.avatar}</div>
                <div>
                  <h1 className="text-3xl font-semibold text-white">{trainer.name}</h1>
                  <p className="mt-2 text-sm uppercase tracking-[0.3em] text-emerald-300">{trainer.category}</p>
                </div>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-slate-300">{trainer.bio}</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-[#030712]/80 p-4 text-sm text-slate-300">
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Followers</div>
                  <div className="mt-2 text-2xl font-semibold text-white">{trainer.followerCount.toLocaleString()}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#030712]/80 p-4 text-sm text-slate-300">
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Rating</div>
                  <div className="mt-2 text-2xl font-semibold text-white">{trainer.rating.toFixed(1)}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#030712]/80 p-4 text-sm text-slate-300">
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Programs</div>
                  <div className="mt-2 text-2xl font-semibold text-white">{programs.length}</div>
                </div>
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-emerald-500/15 bg-[#091124]/80 p-5">
              <div className="flex items-center justify-between gap-3 text-sm text-emerald-300">
                <span className="inline-flex items-center gap-2"><Star size={16} /> Coach highlights</span>
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[11px] uppercase tracking-[0.24em] text-emerald-300">Top rated</span>
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-400">
                <div className="rounded-2xl border border-white/10 bg-[#030712]/80 p-3">
                  <div className="font-semibold text-white">Personalized form feedback</div>
                  <p className="mt-1">Smart coaching with video analysis and technique cues.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#030712]/80 p-3">
                  <div className="font-semibold text-white">Weekly check-ins</div>
                  <p className="mt-1">Progress review, programming updates, and accountability.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#030712]/80 p-3">
                  <div className="font-semibold text-white">Proven results</div>
                  <p className="mt-1">Trusted by athletes seeking strength, mobility, and recovery improvements.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4 rounded-[1.5rem] border border-white/10 bg-[#091124]/80 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
          <div className="flex items-center gap-3 text-sm font-semibold text-emerald-300"><BookOpen size={16} /> Programs by {trainer.name}</div>
          <div className="grid gap-3">
            {programs.map(program => (
              <button
                key={program.id}
                type="button"
                onClick={() => navigate(`/programs/${program.id}`)}
                className="rounded-2xl border border-white/10 bg-[#030712]/80 p-4 text-left transition hover:border-emerald-400/30 hover:bg-[#0f1724]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{program.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{program.description}</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-300">₹{program.priceMonthly}/mo</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <aside className="space-y-4 rounded-[1.5rem] border border-emerald-500/15 bg-[#08111f]/90 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
          <div className="flex items-center gap-3 text-sm font-semibold text-emerald-300"><Sparkles size={16} /> Trainer overview</div>
          <div className="rounded-2xl border border-white/10 bg-[#030712]/80 p-4 text-sm text-slate-400">
            <p className="leading-7">{trainer.bio}</p>
            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl border border-white/10 bg-[#08111f]/80 p-3">
                <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Coaching style</div>
                <div className="mt-2 text-sm text-white">Evidence-backed programming with high-touch feedback and cross-modal training support.</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#08111f]/80 p-3">
                <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Best for</div>
                <div className="mt-2 text-sm text-white">Clients seeking structured progress, form mastery, and consistent accountability.</div>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
