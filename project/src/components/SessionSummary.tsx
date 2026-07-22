import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LIVE_SESSIONS, getTrainerById } from '../data';
import { ArrowLeft, Clock, Calendar, Users, Sparkles, Play, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function SessionSummary() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const session = useMemo(() => LIVE_SESSIONS.find(item => item.id === sessionId), [sessionId]);
  const trainer = useMemo(() => session?.trainerId ? getTrainerById(session.trainerId) : null, [session]);

  if (!session) {
    return (
      <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/80 p-8 text-center text-slate-400">
        <p className="text-lg font-semibold text-white">Session not found</p>
        <button onClick={() => navigate('/trainers')} className="mt-5 rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950">Back to Directory</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      <div className="space-y-4 rounded-[2rem] border border-emerald-500/15 bg-[#08111f]/90 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.22)] backdrop-blur-xl">
        <button onClick={() => navigate('/trainers')} className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 transition hover:text-emerald-200">
          <ArrowLeft size={16} /> Back to Directory
        </button>
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-emerald-300">
              <Play size={14} /> Live session recap
            </div>
            <h1 className="text-3xl font-semibold text-white">{session.title}</h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-400">{session.summary ?? 'A fast-paced live session with actionable coaching notes, movement cues, and performance insights.'}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-[#030712]/80 p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Coach</div>
                <div className="mt-2 text-lg font-semibold text-white">{trainer?.name ?? session.coach}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#030712]/80 p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Status</div>
                <div className="mt-2 text-lg font-semibold text-white">{session.status}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#030712]/80 p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Duration</div>
                <div className="mt-2 text-lg font-semibold text-white">{session.duration} mins</div>
              </div>
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-[#091124]/80 p-5">
            <div className="flex items-center justify-between gap-3 text-sm text-emerald-300">
              <span className="inline-flex items-center gap-2"><Clock size={16} /> Session details</span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-300">{session.categoryTag}</span>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-400">
              <div className="rounded-2xl border border-white/10 bg-[#030712]/80 p-4">
                <div className="flex items-center gap-2 text-white"><Calendar size={14} className="text-emerald-300" /> {session.date}</div>
                <div className="mt-1 text-slate-400">{session.time}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#030712]/80 p-4">
                <div className="flex items-center gap-2 text-white"><Users size={14} className="text-emerald-300" /> Spots left</div>
                <div className="mt-1 text-slate-400">{session.spotsRemaining} of {session.spotsTotal}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#030712]/80 p-4">
                <div className="flex items-center gap-2 text-white"><ShieldCheck size={14} className="text-emerald-300" /> Session type</div>
                <div className="mt-1 text-slate-400">{session.isFree ? 'Free access' : session.isPremium ? 'Premium session' : 'Paid access'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4 rounded-[1.5rem] border border-white/10 bg-[#091124]/80 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
          <div className="flex items-center gap-3 text-sm font-semibold text-emerald-300"><Sparkles size={16} /> Key takeaways</div>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="rounded-2xl border border-white/10 bg-[#030712]/80 p-4"><span className="inline-flex items-center gap-2 text-emerald-300"><CheckCircle2 size={14} /> Movement cues</span><p className="mt-2">Maintain tight core and focus on a controlled tempo during each rep.</p></li>
            <li className="rounded-2xl border border-white/10 bg-[#030712]/80 p-4"><span className="inline-flex items-center gap-2 text-emerald-300"><CheckCircle2 size={14} /> Progress focus</span><p className="mt-2">Prioritize slight load increases week over week while preserving excellent form.</p></li>
            <li className="rounded-2xl border border-white/10 bg-[#030712]/80 p-4"><span className="inline-flex items-center gap-2 text-emerald-300"><CheckCircle2 size={14} /> Recovery note</span><p className="mt-2">Use active rest and mobility drills on off days to reduce fatigue and improve performance.</p></li>
          </ul>
        </div>

        <aside className="space-y-4 rounded-[1.5rem] border border-emerald-500/15 bg-[#08111f]/90 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
          <div className="flex items-center gap-3 text-sm font-semibold text-emerald-300"><Sparkles size={16} /> Session story</div>
          <div className="rounded-2xl border border-white/10 bg-[#030712]/80 p-4 text-sm text-slate-400">
            <p className="text-sm text-white">Session summary</p>
            <p className="mt-3 leading-7">{session.summary ?? 'This session delivered a focused strength segment with live coaching points for technique, breathing, and tempo control.'}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/trainers/${session.trainerId}`)}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            View Coach Profile
          </button>
        </aside>
      </section>
    </div>
  );
}
