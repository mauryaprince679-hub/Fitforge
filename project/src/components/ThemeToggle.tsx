import { type ComponentType } from 'react';
import { Monitor, Moon, Sun, type LucideProps } from 'lucide-react';
import { useTheme, type ThemePreference } from '../lib/theme.tsx';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const options: Array<{ id: ThemePreference; icon: ComponentType<LucideProps> }> = [
    { id: 'light', icon: Sun },
    { id: 'dark', icon: Moon },
    { id: 'system', icon: Monitor },
  ];

  return (
    <div className={`flex items-center rounded-[1rem] border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 ${className}`.trim()}>
      {options.map(({ id, icon: Icon }) => {
        const isActive = theme === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setTheme(id)}
            className={`rounded-[0.8rem] p-2 transition ${isActive ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
            aria-label={`Set ${id} theme`}
          >
            <Icon size={14} />
          </button>
        );
      })}
      <span className="ml-2 mr-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-600 dark:text-slate-300">
        {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
      </span>
    </div>
  );
}
