import { useMemo, useState } from 'react';
import { Search, Users, Sparkles, Play, ArrowRight, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TRAINERS, FITNESS_PROGRAMS, LIVE_SESSIONS, getProgramsByTrainer } from '../data';

export default function TrainerDirectory() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const trainerResults = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return TRAINERS;
    return TRAINERS.filter(trainer =>
      [trainer.name, trainer.bio, trainer.category].some(value => value.toLowerCase().includes(normalized))
    );
  }, [query]);

  const featuredPrograms = FITNESS_PROGRAMS.slice(0, 3);
  const upcomingSessions = LIVE_SESSIONS.filter(session => session.status !== 'ended').slice(0, 3);

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      <header className="space-y-3 rounded-[2rem] border border-emerald-500/15 bg-[#08111f]/90 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.24)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-300">Trainer Directory</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Find your next coach with confidence.</h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">Browse top trainers, explore their programs, and preview live fitness class highlights in a modern education-style experience.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300"><Users size={16} /> Trainers</div>
              <div className="mt-2 text-2xl font-semibold text-white">{TRAINERS.length}</div>
              <p className="mt-1 text-xs text-slate-500">Expert coaches across strength, mobility, and nutrition.</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300"><BookOpen size={16} /> Programs</div>
              <div className="mt-2 text-2xl font-semibold text-white">{FITNESS_PROGRAMS.length}</div>
              <p className="mt-1 text-xs text-slate-500">Curated training tracks for every goal.</p>
            </div>
          </div>
        </div>
      </header>

      <section className="space-y-4">
        <div className="rounded-[1.5rem] border border-emerald-500/15 bg-[#091124]/80 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#030712]/80 px-3 py-2.5 text-sm text-slate-300">
              <Search size={16} />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Search trainers, specialties, or workouts..."
                className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
              />
            </div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-emerald-300">
              <Sparkles size={14} /> Live fitness class preview
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            {trainerResults.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {trainerResults.map(trainer => (
                  <article key={trainer.id} className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-900/80 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.24)] transition hover:-translate-y-0.5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-lg font-semibold text-white">{trainer.avatar}</div>
                        <div>
                          <h2 className="text-lg font-semibold text-white">{trainer.name}</h2>
                          <p className="text-sm text-slate-400">{trainer.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-white">{trainer.rating.toFixed(1)}</div>
                        <div className="text-xs text-slate-500">{trainer.followerCount.toLocaleString()} followers</div>
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-slate-300">{trainer.bio}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {getProgramsByTrainer(trainer.id).slice(0, 2).map(program => (
                        <span key={program.id} className="rounded-full border border-emerald-500/10 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-300">{program.title}</span>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(`/trainers/${trainer.id}`)}
                      className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                    >
                      View profile <ArrowRight size={16} />
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-8 text-center text-slate-400">No matching trainers found. Try a different keyword.</div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-[1.5rem] border border-emerald-500/15 bg-[#091124]/80 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
              <div className="flex items-center gap-3 text-sm font-semibold text-emerald-300"><Play size={16} /> Live Fitness Classes</div>
              <p className="mt-3 text-sm leading-6 text-slate-400">Preview upcoming coach-led live sessions and jump into a summary lesson before you train.</p>
              <div className="mt-5 space-y-3">
                {upcomingSessions.map(session => (
                  <div key={session.id} className="rounded-2xl border border-white/10 bg-[#030712]/80 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{session.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{session.topic} · {session.time}</p>
                      </div>
                      <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-300">{session.status}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(`/sessions/${session.id}/summary`)}
                      className="mt-3 w-full rounded-2xl border border-emerald-500/20 bg-transparent px-3 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/10"
                    >
                      View summary
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-[#091124]/80 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
              <div className="flex items-center gap-3 text-sm font-semibold text-emerald-300"><Sparkles size={16} /> Featured programs</div>
              <div className="mt-4 space-y-3">
                {featuredPrograms.map(program => (
                  <button
                    key={program.id}
                    type="button"
                    onClick={() => navigate(`/programs/${program.id}`)}
                    className="w-full rounded-2xl border border-white/10 bg-[#030712]/80 px-3 py-3 text-left text-sm text-slate-100 transition hover:border-emerald-400/30 hover:bg-[#0f1724]"
                  >
                    <div className="font-semibold text-white">{program.title}</div>
                    <p className="mt-1 text-xs text-slate-500">{program.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
