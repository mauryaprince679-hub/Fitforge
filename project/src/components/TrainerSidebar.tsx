import {
  Calendar, Video, MessageSquare, Users, Flame, Soup, Radio,
  ChevronLeft, ChevronRight, LogOut, Menu, X,
} from 'lucide-react';
import type { TrainerPage } from '../types';
import type { LucideIcon } from 'lucide-react';
import { useLive } from '../lib/live';

interface TrainerSidebarProps {
  currentPage: TrainerPage;
  onNavigate: (page: TrainerPage) => void;
  collapsed: boolean;
  onToggle: () => void;
  onSignOut: () => void | Promise<void>;
}

const navItems: { id: TrainerPage; label: string; icon: LucideIcon }[] = [
  { id: 'roster', label: 'Client Roster', icon: Users },
  { id: 'program', label: 'Program Builder', icon: Calendar },
  { id: 'nutrition', label: 'Nutrition', icon: Soup },
  { id: 'studio', label: 'Live Studio', icon: Radio },
  { id: 'formcheck', label: 'Form Check Desk', icon: Video },
  { id: 'inbox', label: 'Unified Inbox', icon: MessageSquare },
];

const coreNavItems = navItems.slice(0, 3);
const drawerNavItems = [navItems[0], navItems[1], navItems[2], navItems[3], navItems[4]];

export function TrainerSidebar({ currentPage, onNavigate, collapsed, onToggle, onSignOut }: TrainerSidebarProps) {
  const { activeSession } = useLive();
  return (
    <aside className={`fixed left-0 top-0 z-40 flex h-full flex-col border-r border-emerald-500/10 bg-[#030712]/95 backdrop-blur-xl transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
      <div className={`flex h-16 items-center border-b border-emerald-500/10 px-4 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed ? (
          <>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/15 shadow-[0_0_20px_rgba(16,185,129,0.16)]">
                <Flame size={18} className="text-emerald-300" />
              </div>
              <div>
                <span className="block text-sm font-bold leading-tight text-white">FitForge</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-400">Trainer</span>
              </div>
            </div>
            <button onClick={onToggle} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-emerald-500/10 hover:text-emerald-200">
              <ChevronLeft size={18} />
            </button>
          </>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/15 shadow-[0_0_20px_rgba(16,185,129,0.16)]">
            <Flame size={18} className="text-emerald-300" />
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
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
              {!collapsed && id === 'inbox' && <span className="ml-auto rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">3</span>}
              {!collapsed && id === 'studio' && activeSession && (
                <span className="ml-auto flex items-center gap-1 rounded px-1.5 py-0.5 bg-amber-500/10 text-[9px] font-bold uppercase tracking-[0.2em] text-amber-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" /> LIVE
                </span>
              )}
              {!collapsed && id === 'formcheck' && <span className="ml-auto rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">2</span>}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-emerald-500/10 p-2">
        <button
          type="button"
          onClick={() => void onSignOut()}
          title={collapsed ? 'Sign Out' : undefined}
          aria-label="Sign Out"
          className={`flex w-full items-center justify-center rounded-xl px-2.5 py-2.5 text-sm font-medium text-slate-400 transition-all duration-200 hover:bg-emerald-500/10 hover:text-emerald-400 ${collapsed ? 'h-10' : 'justify-start gap-2 border border-transparent hover:border-emerald-500/20'}`}
        >
          <LogOut size={16} className="shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

      {collapsed && (
        <div className="border-t border-emerald-500/10 px-2 py-3">
          <button onClick={onToggle} className="flex w-full items-center justify-center rounded-lg p-2 text-slate-400 transition-colors hover:bg-emerald-500/10 hover:text-emerald-200">
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </aside>
  );
}

interface TrainerMobileBottomNavProps {
  currentPage: TrainerPage;
  onNavigate: (page: TrainerPage) => void;
}

export function TrainerMobileBottomNav({ currentPage, onNavigate }: TrainerMobileBottomNavProps) {
  return (
    <nav aria-label="Mobile trainer navigation" className="fixed bottom-0 left-0 right-0 z-40 border-t border-emerald-500/10 bg-[#030712]/95 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-5xl items-stretch justify-between gap-2">
        {coreNavItems.map(({ id, label, icon: Icon }) => {
          const isActive = currentPage === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex min-h-[3.3rem] flex-1 flex-col items-center justify-center rounded-2xl px-2 py-2 text-[10px] font-semibold leading-tight transition-all ${isActive ? 'bg-emerald-500/10 text-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.16)]' : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'}`}
            >
              <Icon size={17} />
              <span className="mt-1 text-[10px] leading-tight">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

interface TrainerMobileDrawerNavProps {
  currentPage: TrainerPage;
  onNavigate: (page: TrainerPage) => void;
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void | Promise<void>;
}

export function TrainerMobileDrawerNav({ currentPage, onNavigate, isOpen, onClose, onSignOut }: TrainerMobileDrawerNavProps) {
  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden" onClick={onClose} />}
      <aside className={`fixed left-0 top-0 z-50 flex h-full w-76 flex-col border-r border-emerald-500/10 bg-[#030712]/95 px-3 py-4 backdrop-blur-xl transition-transform duration-300 lg:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/15 shadow-[0_0_20px_rgba(16,185,129,0.16)]">
              <Flame size={16} className="text-emerald-300" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald-400">FitForge</p>
              <p className="text-sm font-semibold text-white">Trainer Menu</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 transition hover:bg-emerald-500/10 hover:text-emerald-200">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          {drawerNavItems.map(({ id, label, icon: Icon }) => {
            const isActive = currentPage === id;
            return (
              <button
                key={id}
                onClick={() => {
                  onNavigate(id);
                  onClose();
                }}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium transition ${isActive ? 'bg-emerald-500/10 text-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.16)]' : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'}`}
              >
                <Icon size={18} className={isActive ? 'text-emerald-400' : 'text-slate-400'} />
                <span>{label}</span>
                {id === 'inbox' && <span className="ml-auto rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">3</span>}
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => {
            onClose();
            void onSignOut();
          }}
          className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-3 text-sm font-semibold text-emerald-300"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </aside>
    </>
  );
}

export function TrainerMobileHeader({ onMenuOpen, title }: { onMenuOpen: () => void; title: string }) {
  return (
    <header className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-emerald-500/10 bg-[#030712]/95 px-4 backdrop-blur-xl lg:hidden">
      <button onClick={onMenuOpen} className="rounded-xl p-2 text-slate-400 transition hover:bg-emerald-500/10 hover:text-emerald-200">
        <Menu size={20} />
      </button>

      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/15 shadow-[0_0_20px_rgba(16,185,129,0.16)]">
          <Flame size={14} className="text-emerald-300" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald-400">FitForge</p>
          <p className="truncate text-sm font-semibold text-white">{title}</p>
        </div>
      </div>

      <div className="relative flex items-center">
        <button
          type="button"
          aria-label="Profile"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-950/40 text-sm font-semibold text-emerald-300 shadow-sm transition-all duration-200 hover:bg-emerald-900/40 focus:outline-none"
        >
          P
        </button>
      </div>
    </header>
  );
}
