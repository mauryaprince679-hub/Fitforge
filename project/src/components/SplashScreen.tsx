import { useEffect, useState } from 'react';
import { Flame, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const showTimer = window.setTimeout(() => setIsExiting(true), 1500);
    const finishTimer = window.setTimeout(onFinish, 2200);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className={`relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.24),_transparent_35%),linear-gradient(135deg,_#020617_0%,_#0F172A_45%,_#111C3A_100%)] transition-opacity duration-700 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(56,189,248,0.16),_transparent_25%)]" />
      <div className="absolute left-[-10%] top-[15%] h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl splash-float" />
      <div className="absolute bottom-[-8%] right-[-4%] h-72 w-72 rounded-full bg-blue-500/20 blur-3xl splash-float" />
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 sm:py-10">
        <div className="w-full max-w-3xl rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-5 shadow-[0_0_80px_rgba(14,165,233,0.15)] backdrop-blur-xl sm:rounded-[2rem] sm:p-8 md:p-12">
          <div className="flex flex-col items-center text-center md:flex-row md:items-center md:text-left">
            <div className="relative mb-6 md:mb-0 md:mr-10">
              <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-2xl splash-ring" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-cyan-400/30 bg-gradient-to-br from-cyan-400/30 to-blue-500/30 shadow-[0_0_40px_rgba(34,211,238,0.3)] sm:h-24 sm:w-24">
                <Flame className="h-9 w-9 text-cyan-300 sm:h-11 sm:w-11" />
              </div>
            </div>

            <div className="w-full max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-cyan-200 sm:text-[11px]">
                <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                FitForge Studio
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:mt-5 sm:text-4xl lg:text-5xl">
                Your new <span className="text-cyan-300">training experience</span> is live.
              </h1>

              <p className="mt-3 text-sm leading-7 text-slate-300 sm:mt-4 sm:text-base lg:text-lg">
                Premium coaching, live sessions, and clearer progress tracking now feel smoother, brighter, and easier to use.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center">
                <div className="w-full overflow-hidden rounded-full border border-white/10 bg-slate-900/60 sm:flex-1">
                  <div className="h-2 w-[38%] rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 splash-shimmer" />
                </div>
                <span className="text-xs font-medium text-slate-400 sm:text-sm">Preparing your experience</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
