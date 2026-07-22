import { useState, useEffect, useCallback } from 'react';
import {
  X,
  Send,
  Users,
  Volume2,
  Maximize,
  Radio,
  Hand,
  Mic,
  MicOff,
  Sparkles,
} from 'lucide-react';
import { useLive } from '../lib/live';
import { useAuth } from '../lib/auth';
import { getWorkoutById, MOCK_USERS } from '../data';

const EMOJI_REACTIONS = ['🔥', '💪', '💯'];

export default function ClientViewerRoom() {
  const { activeSession, leaveStream, chatMessages, addChatMessage, viewerCount } = useLive();
  const { profile } = useAuth();

  const [chatOpen, setChatOpen] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [routineOpen, setRoutineOpen] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const linkedWorkout = activeSession?.linkedWorkoutId ? getWorkoutById(activeSession.linkedWorkoutId) : null;
  const trainer = MOCK_USERS.find(u => u.id === 'u_trainer_1');
  const shouldShowRoutine = routineOpen && Boolean(linkedWorkout);

  useEffect(() => {
    if (!activeSession) return;
    const simMessages = [
      { name: 'Sarah Chen', role: 'client' as const, msg: 'This is brutal!' },
      { name: 'Tom Reyes', role: 'client' as const, msg: 'On round 3 now 🔥' },
      { name: 'Jake Morrison', role: 'client' as const, msg: 'Coach, what muscle group next?' },
    ];
    const interval = window.setInterval(() => {
      const m = simMessages[Math.floor(Math.random() * simMessages.length)];
      addChatMessage({ userId: 'sim', userName: m.name, userRole: m.role, message: m.msg });
    }, 10000);
    return () => window.clearInterval(interval);
  }, [activeSession, addChatMessage]);

  const sendReaction = useCallback((emoji: string) => {
    const id = `r_${Date.now()}_${Math.random()}`;
    void emoji;
    window.setTimeout(() => {
      void id;
    }, 3000);
  }, []);

  const sendChat = () => {
    if (!chatInput.trim() || !profile) return;
    addChatMessage({ userId: profile.id, userName: profile.name, userRole: 'client', message: chatInput.trim() });
    setChatInput('');
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartY(event.touches[0].clientY);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartY === null) return;
    const deltaY = touchStartY - event.changedTouches[0].clientY;
    if (deltaY > 70) {
      setChatOpen(false);
    } else if (deltaY < -40) {
      setChatOpen(true);
    }
    setTouchStartY(null);
  };

  if (!activeSession) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#020617]">
      <div className="relative flex-1 overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(139,92,246,0.22),_transparent_30%),linear-gradient(145deg,_#020617_0%,_#111827_45%,_#030712_100%)] px-2 py-2 sm:px-3 sm:py-3 lg:px-4 lg:py-4">
        <div className="relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 shadow-[0_0_120px_rgba(34,211,238,0.13)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-[6px] rounded-[1.7rem] border border-cyan-400/25 neon-outline" />

          <div className="relative flex-1 overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_35%),linear-gradient(140deg,_#0f172a_0%,_#111827_60%,_#020617_100%)]">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:34px_34px]" />

            <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 py-16 text-center sm:px-6 sm:py-24">
              <div className="mb-5 flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.35em] text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.18)]">
                <Radio size={12} className="text-cyan-300" />
                Live now
              </div>
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[1.2rem] border border-fuchsia-400/30 bg-gradient-to-br from-fuchsia-500/30 to-cyan-400/30 shadow-[0_0_35px_rgba(34,211,238,0.24)] sm:h-20 sm:w-20">
                <Sparkles size={26} className="text-cyan-200 sm:text-3xl" />
              </div>
              <p className="max-w-md text-sm leading-7 text-slate-400 sm:text-base">
                {trainer?.name} is running a high-intensity session with cinematic energy and next-level coaching.
              </p>
            </div>

            <div className="absolute inset-x-0 top-0 z-20 flex flex-col gap-3 p-3 sm:p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/70 px-3 py-2.5 shadow-[0_0_40px_rgba(34,211,238,0.12)] backdrop-blur-xl">
                <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-fuchsia-400" />
                  FitForge Live
                </div>
                <h1 className="bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 bg-clip-text text-2xl font-black tracking-[0.12em] text-transparent drop-shadow-[0_0_18px_rgba(34,211,238,0.35)] sm:text-3xl lg:text-[2rem]">
                  FITFORGE LIVE
                </h1>
              </div>

              <div className="flex items-center gap-2 rounded-[1.25rem] border border-white/10 bg-slate-950/60 px-3 py-2 text-sm font-semibold text-slate-200 shadow-[0_0_20px_rgba(15,23,42,0.35)] backdrop-blur-xl">
                <Users size={15} className="text-cyan-300" />
                {viewerCount} hype members
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 z-20 p-2 sm:p-3 lg:p-4">
              {chatOpen && (
                <div
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  className="mb-3 flex max-h-64 flex-col overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-900/70 shadow-[0_0_40px_rgba(2,8,23,0.35)] backdrop-blur-xl"
                >
                  <div className="flex items-center justify-between border-b border-white/10 px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-cyan-400/15 p-1.5 text-cyan-300">
                        <Users size={13} />
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Hype Mode Chat</div>
                        <div className="text-sm font-semibold text-white">{activeSession.title}</div>
                      </div>
                    </div>
                    <button onClick={() => setChatOpen(false)} className="rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
                    {chatMessages.map(m => (
                      <div key={m.id} className="animate-[fadeIn_0.35s_ease-out] rounded-[1rem] border border-white/10 bg-white/10 px-3 py-2.5 shadow-[0_0_20px_rgba(34,211,238,0.08)] backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                          <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold ${m.userRole === 'trainer' ? 'bg-gradient-to-br from-fuchsia-500 to-cyan-400 text-white' : 'bg-slate-700 text-slate-200'}`}>
                            {m.userName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className={`text-[11px] font-semibold ${m.userRole === 'trainer' ? 'text-cyan-300' : 'text-slate-300'}`}>{m.userName}</div>
                            <div className="text-sm text-slate-200">{m.message}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 border-t border-white/10 bg-slate-950/40 p-2">
                    <input
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendChat()}
                      placeholder="Drop a hype note..."
                      className="flex-1 rounded-[0.95rem] border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
                    />
                    <button onClick={sendChat} disabled={!chatInput.trim()} className="rounded-[0.95rem] bg-gradient-to-r from-fuchsia-500 to-cyan-400 p-2.5 text-white shadow-[0_0_20px_rgba(34,211,238,0.2)] transition hover:scale-[1.02] disabled:opacity-40">
                      <Send size={15} />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-2 shadow-[0_0_35px_rgba(2,8,23,0.35)] backdrop-blur-xl">
                <div className="flex flex-wrap items-center gap-2">
                  {EMOJI_REACTIONS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => sendReaction(emoji)}
                      className="action-pill flex h-11 w-11 items-center justify-center rounded-[1rem] border border-white/10 bg-slate-800/70 text-lg transition hover:bg-slate-700/70"
                    >
                      {emoji}
                    </button>
                  ))}
                  <button
                    onClick={() => setHandRaised(v => !v)}
                    className={`action-pill flex items-center gap-2 rounded-[1rem] border px-3 py-2 text-sm font-semibold transition ${handRaised ? 'border-cyan-400/40 bg-cyan-400/15 text-cyan-200' : 'border-white/10 bg-slate-800/70 text-slate-200'}`}
                  >
                    <Hand size={16} />
                    {handRaised ? 'Hand raised' : 'Raise hand'}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setIsMuted(v => !v)}
                    className={`action-pill flex items-center gap-2 rounded-[1rem] border px-3 py-2 text-sm font-semibold transition ${isMuted ? 'border-fuchsia-400/40 bg-fuchsia-400/15 text-fuchsia-200' : 'border-white/10 bg-slate-800/70 text-slate-200'}`}
                  >
                    {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                    {isMuted ? 'Unmute' : 'Mute'}
                  </button>
                  <button
                    onClick={() => setChatOpen(v => !v)}
                    className={`action-pill flex items-center gap-2 rounded-[1rem] border px-3 py-2 text-sm font-semibold transition ${chatOpen ? 'border-cyan-400/40 bg-cyan-400/15 text-cyan-200' : 'border-white/10 bg-slate-800/70 text-slate-200'}`}
                  >
                    <Send size={16} />
                    {chatOpen ? 'Chat open' : 'Open chat'}
                  </button>
                  <button className="action-pill flex h-11 w-11 items-center justify-center rounded-[1rem] border border-white/10 bg-slate-800/70 text-slate-200 transition hover:bg-slate-700/70">
                    <Volume2 size={16} />
                  </button>
                  <button className="action-pill flex h-11 w-11 items-center justify-center rounded-[1rem] border border-white/10 bg-slate-800/70 text-slate-200 transition hover:bg-slate-700/70">
                    <Maximize size={16} />
                  </button>
                  <button
                    onClick={leaveStream}
                    className="action-pill flex items-center gap-2 rounded-[1rem] border border-rose-400/30 bg-rose-500/15 px-3 py-2 text-sm font-semibold text-rose-200 transition"
                  >
                    <X size={14} /> Leave
                  </button>
                </div>
              </div>
            </div>
          </div>

          {shouldShowRoutine && linkedWorkout && (
            <>
              <div className="fixed inset-0 z-20 bg-black/40" onClick={() => setRoutineOpen(false)} />
              <div className="fixed bottom-0 right-0 top-0 z-30 flex w-full max-w-sm flex-col border-l border-white/10 bg-slate-950/90 p-4 shadow-[0_0_60px_rgba(2,8,23,0.35)] backdrop-blur-xl animate-slide-in-right">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-300">Routine</div>
                    <h3 className="text-lg font-semibold text-white">{linkedWorkout.title}</h3>
                  </div>
                  <button onClick={() => setRoutineOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white">
                    <X size={18} />
                  </button>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {linkedWorkout.exercises.map((ex, i) => (
                    <div key={ex.id} className="rounded-[1.1rem] border border-white/10 bg-slate-900/70 p-3">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-400/15 text-xs font-bold text-cyan-300">
                          {i + 1}
                        </span>
                        <span className="text-sm font-semibold text-white">{ex.name}</span>
                      </div>
                      <div className="ml-8 flex flex-wrap gap-1.5">
                        {ex.sets.map((s, si) => (
                          <span key={si} className="rounded-lg border border-white/10 bg-slate-800/70 px-2 py-1 text-xs text-slate-300">
                            Set {si + 1}: {s.reps} reps @ {s.weight}lbs
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
