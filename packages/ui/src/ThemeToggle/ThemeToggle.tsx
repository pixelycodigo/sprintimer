import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '../utils/cn';

export interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const isDark = typeof window !== 'undefined' && 
    (document.documentElement.classList.contains('dark') || 
     localStorage.getItem('theme-storage')?.includes('dark'));
  const [isDarkState, setIsDarkState] = React.useState(isDark);

  React.useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkState) {
      root.classList.add('dark');
      localStorage.setItem('theme-storage', JSON.stringify({ state: { theme: 'dark' } }));
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme-storage', JSON.stringify({ state: { theme: 'light' } }));
    }
  }, [isDarkState]);

  const toggleTheme = () => setIsDarkState(!isDarkState);

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'relative inline-flex items-center justify-center',
        'w-10 h-10 rounded-md',
        'bg-slate-100 dark:bg-zinc-800',
        'hover:bg-slate-200 dark:hover:bg-zinc-700',
        'transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-zinc-100',
        className
      )}
      aria-label={`Cambiar a modo ${isDarkState ? 'claro' : 'oscuro'}`}
    >
      <Sun
        className={cn(
          'absolute w-5 h-5 transition-all duration-200',
          isDarkState
            ? 'opacity-0 rotate-90 scale-0'
            : 'opacity-100 rotate-0 scale-100'
        )}
        aria-hidden="true"
      />
      <Moon
        className={cn(
          'absolute w-5 h-5 transition-all duration-200',
          isDarkState
            ? 'opacity-100 rotate-0 scale-100'
            : 'opacity-0 -rotate-90 scale-0'
        )}
        aria-hidden="true"
      />
    </button>
  );
}
