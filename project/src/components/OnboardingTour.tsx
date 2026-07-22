import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, SkipForward } from 'lucide-react';

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onFinish: () => void;
}

type TourStepConfig = {
  id: number;
  title: string;
  description: string;
  targetId: string;
};

const TOUR_STEPS: TourStepConfig[] = [
  {
    id: 1,
    title: 'Today’s Activity',
    description: 'Check your daily targets for Calories, Water, and Steps at a glance.',
    targetId: 'dashboard-activity-card',
  },
  {
    id: 2,
    title: 'Programs',
    description: 'Tap here to find structured workout schedules and personalized muscle-building programs.',
    targetId: 'bottom-nav-programs',
  },
  {
    id: 3,
    title: 'Progress',
    description: 'Monitor your consistency, tracking charts, and Personal Records (PR) cleanly.',
    targetId: 'bottom-nav-progress',
  },
  {
    id: 4,
    title: 'Coach (PRO)',
    description: 'Unlock premium access to chat 1-on-1 with expert trainers.',
    targetId: 'bottom-nav-coach',
  },
];

export default function OnboardingTour({ isOpen, onClose, onFinish }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [highlight, setHighlight] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ left: number; top: number }>({ left: 16, top: 16 });
  const [connector, setConnector] = useState<{ d: string; dotX: number; dotY: number } | null>(null);

  const stepConfig = TOUR_STEPS.find(step => step.id === currentStep) ?? TOUR_STEPS[0];

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const updateTarget = () => {
      const target = document.getElementById(stepConfig.targetId);
      if (!target) {
        setHighlight(null);
        setTooltipPosition({ left: 16, top: 16 });
        return;
      }

      const rect = target.getBoundingClientRect();
      const left = rect.left - 12;
      const top = rect.top - 12;
      const width = rect.width + 24;
      const height = rect.height + 24;

      setHighlight({ left, top, width, height });

      if (stepConfig.id === 1) {
        const cardWidth = 272;
        const desiredLeft = rect.left + rect.width / 2 - cardWidth / 2;
        const clampedLeft = Math.max(16, Math.min(window.innerWidth - cardWidth - 16, desiredLeft));
        const guideCardTop = rect.bottom + 16;
        setTooltipPosition({ left: clampedLeft, top: guideCardTop });

        const startX = clampedLeft + 24;
        const startY = guideCardTop;
        const endX = rect.left + rect.width / 2;
        const endY = rect.bottom + 8;
        const midX = (startX + endX) / 2;
        setConnector({
          d: `M ${startX} ${startY} L ${midX} ${startY + 28} L ${endX} ${endY}`,
          dotX: endX,
          dotY: endY,
        });
      } else {
        const guideCardLeft = window.innerWidth / 2 - 136;
        const guideCardTop = window.innerHeight - 260;
        setTooltipPosition({ left: guideCardLeft, top: guideCardTop });

        const startX = guideCardLeft + 136;
        const startY = guideCardTop + 64;
        const endX = rect.left + rect.width / 2;
        const endY = rect.bottom + 8;
        setConnector({
          d: `M ${startX} ${startY} L ${startX} ${startY - 56} L ${endX} ${endY}`,
          dotX: endX,
          dotY: endY,
        });
      }
    };

    const scrollAndUpdate = () => {
      const target = document.getElementById(stepConfig.targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      window.setTimeout(() => {
        updateTarget();
      }, 280);
    };

    scrollAndUpdate();
    updateTarget();
    window.addEventListener('resize', updateTarget);
    window.addEventListener('scroll', updateTarget, { passive: true });

    return () => {
      window.removeEventListener('resize', updateTarget);
      window.removeEventListener('scroll', updateTarget);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [currentStep, isOpen, stepConfig]);

  useEffect(() => {
    if (!isOpen) return;
    setCurrentStep(1);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handleComplete = () => {
    onFinish();
    onClose();
  };

  const isLastStep = currentStep === TOUR_STEPS.length;
  const isBottomNavStep = stepConfig.id > 1;

  return (
    <div className="pointer-events-none fixed inset-0 z-[40] bg-black/75 transition-opacity duration-300">
      <div className="absolute inset-0" />

      {highlight && (
        <div
          className="pointer-events-none absolute z-[41] rounded-2xl border-2 border-cyan-300/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.72)]"
          style={{ left: highlight.left, top: highlight.top, width: highlight.width, height: highlight.height }}
        />
      )}

      <div className="pointer-events-none absolute inset-0 z-[42]">
        {connector && (
          <svg className="pointer-events-none absolute inset-0 h-full w-full transition-all duration-300 ease-in-out" viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`} preserveAspectRatio="none">
            <path d={connector.d} fill="none" stroke="#22d3ee" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="4 4" className="transition-all duration-300 ease-in-out" />
            <circle cx={connector.dotX} cy={connector.dotY} r="4.2" fill="#22d3ee" className="transition-all duration-300 ease-in-out shadow-[0_0_10px_#22d3ee]" />
          </svg>
        )}

        <div
          className="pointer-events-auto absolute z-[50] w-[min(100%,20rem)] max-w-[20rem] min-h-fit rounded-2xl border border-slate-700/50 bg-slate-900/90 p-5 text-white shadow-2xl backdrop-blur"
          style={isBottomNavStep ? { left: '50%', top: 'auto', bottom: '9rem', transform: 'translateX(-50%)' } : { left: tooltipPosition.left, top: tooltipPosition.top }}
        >
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">
            Step {stepConfig.id} of {TOUR_STEPS.length}
          </div>
          <div className="mt-2 text-sm font-semibold text-white">{stepConfig.title}</div>
          <p className="mt-2 text-sm leading-6 text-slate-300">{stepConfig.description}</p>

          <div className="mt-4 flex flex-row items-center justify-between w-full gap-3">
            <button
              type="button"
              onClick={handleComplete}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-600/70 bg-slate-800/80 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-400/40 hover:text-white"
            >
              <SkipForward size={14} /> Skip
            </button>
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-600/70 bg-slate-800/80 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-400/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft size={14} /> Back
            </button>
            <button
              type="button"
              onClick={isLastStep ? handleComplete : handleNext}
              className="flex min-w-[90px] items-center justify-center gap-2 rounded-lg bg-cyan-400/20 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-400/30"
            >
              {isLastStep ? 'Finish' : 'Next'}
              {!isLastStep && <ArrowRight size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
