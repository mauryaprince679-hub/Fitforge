import {
  LayoutDashboard,
  Dumbbell,
  BookOpen,
  Star,
  Play,
  Video,
  TrendingUp,
  User,
  Flame,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  MessageCircle,
  LogOut,
  Soup,
} from 'lucide-react';
import type { Page } from '../types';
import type { LucideIcon } from 'lucide-react';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isSubscribed: boolean;
  collapsed: boolean;
  onToggle: () => void;
  onSignOut: () => void | Promise<void>;
}

const navItems: { id: Page; label: string; icon: LucideIcon }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'workout', label: 'Log Workout', icon: Dumbbell },
  { id: 'programs', label: 'Programs', icon: BookOpen },
  { id: 'coach', label: 'Coach', icon: Star },
  { id: 'live', label: 'Live', icon: Video },
  { id: 'recordings', label: 'Recorded Sessions', icon: Play },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'meal_plan', label: 'Meal Plan', icon: Soup },
  { id: 'messages', label: 'Messages', icon: MessageCircle },
  { id: 'profile', label: 'Profile', icon: User },
];

export default function Sidebar({ currentPage, onNavigate, collapsed, onToggle, onSignOut }: SidebarProps) {
  return (
    <aside
      className={`
        fixed left-0 top-0 z-40 flex h-full flex-col
        border-r border-emerald-500/10 bg-[#030712]/95 backdrop-blur-xl
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-16' : 'w-60'}
      `}
    >
      <div className={`flex h-16 items-center border-b border-emerald-500/10 px-4 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/15 shadow-[0_0_20px_rgba(16,185,129,0.16)]">
              <Flame size={18} className="text-emerald-300" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">FitForge</span>
          </div>
        )}
        {collapsed && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/15 shadow-[0_0_20px_rgba(16,185,129,0.16)]">
            <Flame size={18} className="text-emerald-300" />
          </div>
        )}
        {!collapsed && (
          <button
            onClick={onToggle}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-emerald-500/10 hover:text-emerald-200"
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = currentPage === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`w-full text-left ${isActive ? 'nav-item-active' : 'nav-item'} ${collapsed ? 'justify-center px-2' : ''}`}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className={isActive ? 'text-emerald-400' : 'text-slate-400'} />
              {!collapsed && <span>{label}</span>}
              {!collapsed && id === 'coach' && (
                <span className="ml-auto badge">PRO</span>
              )}
              {!collapsed && id === 'live' && (
                <span className="ml-auto flex h-2 w-2">
                  <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-amber-400/80 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                </span>
              )}
              {!collapsed && id === 'messages' && (
                <span className="ml-auto badge">1</span>
              )}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => void onSignOut()}
          title={collapsed ? 'Sign Out' : undefined}
          aria-label="Sign Out"
          className={`w-full text-left ${collapsed ? 'nav-item justify-center px-2' : 'nav-item'}`}
        >
          <LogOut size={18} className="text-slate-400" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </nav>

      {collapsed && (
        <div className="border-t border-emerald-500/10 px-2 py-3">
          <button
            onClick={onToggle}
            className="flex w-full items-center justify-center rounded-lg p-2 text-slate-400 transition-colors hover:bg-emerald-500/10 hover:text-emerald-200"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {!collapsed && (
        <div className="border-t border-emerald-500/10 p-3">
          <div className="rounded-[1.2rem] border border-emerald-500/15 bg-[#091124]/70 p-3 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-400">Unlock Coaching</p>
            <p className="mb-2 text-xs leading-relaxed text-slate-400">Get a dedicated coach & custom programs.</p>
            <button onClick={() => onNavigate('coach')} className="btn-primary w-full rounded-lg py-1.5 text-xs">
              Upgrade Now
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

interface MobileNavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void | Promise<void>;
}

export function MobileNav({ currentPage, onNavigate, isOpen, onClose, onSignOut }: MobileNavProps) {
  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onClose} />}
      <aside className={`fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r border-emerald-500/10 bg-[#030712]/95 backdrop-blur-xl transition-transform duration-300 lg:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between border-b border-emerald-500/10 px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/15 shadow-[0_0_20px_rgba(16,185,129,0.16)]">
              <Flame size={18} className="text-emerald-300" />
            </div>
            <span className="text-lg font-bold text-white">FitForge</span>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-200">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
        {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = currentPage === id;
            return (
              <button
                key={id}
                onClick={() => { onNavigate(id); onClose(); }}
                className={`w-full text-left ${isActive ? 'nav-item-active' : 'nav-item'}`}
              >
                <Icon size={18} />
                <span>{label}</span>
                {id === 'coach' && <span className="ml-auto badge">PRO</span>}
                {id === 'messages' && <span className="ml-auto badge">1</span>}
              </button>
          );
        })}
        <button
          type="button"
          onClick={() => { onClose(); void onSignOut(); }}
          className="w-full text-left nav-item"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </nav>
      </aside>
    </>
  );
}

export function MobileHeader({ onMenuOpen, title }: { onMenuOpen: () => void; title: string }) {
  return (
    <header className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center gap-4 border-b border-emerald-500/10 bg-[#030712]/95 px-4 backdrop-blur-xl lg:hidden">
      <button onClick={onMenuOpen} className="rounded-lg p-2 text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-200">
        <Menu size={22} />
      </button>
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-md border border-emerald-500/20 bg-emerald-500/15">
          <Flame size={13} className="text-emerald-300" />
        </div>
        <span className="text-sm font-bold text-white">{title}</span>
      </div>
    </header>
  );
}
