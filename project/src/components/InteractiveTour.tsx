import { useEffect, useState } from 'react';
import { ArrowRight, Sparkles, SkipForward } from 'lucide-react';
import type { Page } from '../types';

interface InteractiveTourProps {
  isOpen: boolean;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onClose: () => void;
  onComplete: () => void;
}

const tourSteps = [
  {
    page: 'dashboard' as const,
    title: 'Start with your dashboard',
    description: 'This is your fitness overview. You will see your plan, quick actions, and what to do next.',
    badge: '1 / 3',
  },
  {
    page: 'workout' as const,
    title: 'Log your first workout',
    description: 'Tap here to record what you did today. It is the easiest way to build momentum.',
    badge: '2 / 3',
  },
  {
    page: 'coach' as const,
    title: 'Meet your coach',
    description: 'Open Coach (PRO) when you want guidance, live sessions, or a clearer plan.',
    badge: '3 / 3',
  },
];

export default function InteractiveTour({ isOpen, currentPage: _currentPage, onNavigate, onClose, onComplete }: InteractiveTourProps) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    setStepIndex(0);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    onNavigate(tourSteps[stepIndex].page);
  }, [isOpen, stepIndex, onNavigate]);

  if (!isOpen) return null;

  const step = tourSteps[stepIndex];

  const handleNext = () => {
    if (stepIndex === tourSteps.length - 1) {
      onComplete();
      return;
    }
    setStepIndex(prev => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-slate-950/70 px-3 pb-4 pt-16 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-[1.35rem] border border-cyan-400/20 bg-[#07111f]/95 p-4 shadow-[0_0_50px_rgba(34,211,238,0.16)]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-200">
            <Sparkles size={12} /> Guided tour
          </div>
          <div className="text-[11px] font-semibold text-slate-400">{step.badge}</div>
        </div>

        <div className="mt-4 rounded-[1rem] border border-white/10 bg-slate-900/80 p-4">
          <h3 className="text-lg font-semibold text-white">{step.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">{step.description}</p>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
            We’ll keep this short and helpful.
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-800/80 px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700/80"
          >
            <SkipForward size={14} /> Skip tour
          </button>
          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-3.5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            {stepIndex === tourSteps.length - 1 ? 'Finish' : 'Next'}
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
