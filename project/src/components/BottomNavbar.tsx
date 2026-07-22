import { useEffect, useState } from 'react';
import { LayoutDashboard, BookOpen, TrendingUp, MessageCircle, Star, Play } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Page } from '../types';

interface BottomNavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isSubscribed: boolean;
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  forceVisible?: boolean;
}

type NavItem = {
  id: Page;
  label: string;
  icon: LucideIcon;
  highlight?: boolean;
  badge?: boolean;
};

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'programs', label: 'Programs', icon: BookOpen },
  { id: 'recordings', label: 'Recorded', icon: Play },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'messages', label: 'Messages', icon: MessageCircle, badge: true },
  { id: 'coach', label: 'Coach', icon: Star, highlight: true },
];

export default function BottomNavbar({ currentPage, onNavigate, scrollContainerRef, forceVisible = false }: BottomNavbarProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollTop, setLastScrollTop] = useState(0);

  useEffect(() => {
    const container = scrollContainerRef?.current;
    const target = container ?? window;

    const handleScroll = () => {
      const currentTop = container instanceof HTMLElement ? container.scrollTop : window.scrollY;
      const delta = currentTop - lastScrollTop;

      if (Math.abs(delta) < 8) return;

      if (delta > 0) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollTop(currentTop);
    };

    target.addEventListener('scroll', handleScroll, { passive: true });
    return () => target.removeEventListener('scroll', handleScroll);
  }, [lastScrollTop, scrollContainerRef]);

  const shouldHide = !forceVisible && !isVisible;

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-emerald-500/10 bg-[#060b16]/90 backdrop-blur-md lg:hidden transition-transform duration-300 ${shouldHide ? 'translate-y-full' : 'translate-y-0'}`}>
      <div className="flex w-full items-center justify-between gap-1.5 px-2 py-2">
          {navItems.map(({ id, label, icon: Icon, highlight, badge }) => {
            const isActive = currentPage === id;

            if (highlight) {
              return (
                <button
                  key={id}
                  id={id === 'coach' ? 'bottom-nav-coach' : undefined}
                  onClick={() => onNavigate(id)}
                  className={`group relative flex min-h-12 min-w-[70px] flex-1 items-center justify-center rounded-[1rem] border border-emerald-500/20 bg-gradient-to-r from-emerald-500/90 via-emerald-400/90 to-lime-400/90 px-2 py-2.5 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all ${isActive ? 'scale-[1.02]' : 'hover:scale-[1.01]'}`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="rounded-full bg-white/20 p-1">
                      <Icon size={16} />
                    </span>
                    <span className="text-[10px] font-semibold tracking-[0.12em]">{label}</span>
                    <span className="rounded-full border border-white/30 bg-white/15 px-1.5 py-[1px] text-[8px] font-bold uppercase tracking-[0.2em] text-slate-950">
                      PRO
                    </span>
                  </div>
                </button>
              );
            }

            return (
              <button
                key={id}
                id={id === 'programs' ? 'bottom-nav-programs' : id === 'progress' ? 'bottom-nav-progress' : undefined}
                onClick={() => onNavigate(id)}
                className={`group flex min-h-12 min-w-[58px] flex-1 flex-col items-center justify-center rounded-[1rem] px-2 py-2.5 transition-all ${isActive ? 'bg-emerald-500/10 text-emerald-200' : 'text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-200'}`}
              >
                <div className="relative flex items-center justify-center">
                  <Icon size={18} className={isActive ? 'text-emerald-300' : 'text-slate-300'} />
                  {badge && (
                    <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-lime-400" />
                  )}
                </div>
                <span className={`mt-1 text-[10px] font-semibold ${isActive ? 'text-emerald-200' : 'text-slate-400'}`}>{label}</span>
              </button>
            );
          })}
        </div>
    </nav>
  );
}
