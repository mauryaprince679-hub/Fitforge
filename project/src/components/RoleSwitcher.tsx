import { Users, User } from 'lucide-react';
import type { Role } from '../types';

interface RoleSwitcherProps {
  role: Role;
  onSwitch: (role: Role) => void;
}

export default function RoleSwitcher({ role, onSwitch }: RoleSwitcherProps) {
  return (
    <div className="fixed top-3 right-3 z-[100] flex items-center gap-1 bg-[#1E2937]/95 backdrop-blur-md border border-slate-600/50 rounded-full p-1 shadow-xl">
      <div className="flex items-center gap-1 px-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:flex">
        Dev
      </div>
      <button
        onClick={() => onSwitch('client')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
          role === 'client'
            ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <User size={13} />
        Client
      </button>
      <button
        onClick={() => onSwitch('trainer')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
          role === 'trainer'
            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Users size={13} />
        Trainer
      </button>
    </div>
  );
}
