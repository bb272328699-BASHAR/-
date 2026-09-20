import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center gap-2 p-2 rounded-xl border transition-all cursor-pointer ${
        isDark
          ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700 shadow-xs'
          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-2xs'
      } ${className}`}
      title={isDark ? 'التبديل إلى الوضع النهاري (Light Mode)' : 'التبديل إلى الوضع الليلي (Dark Mode)'}
      aria-label="تبديل مظهر الموقع"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 shrink-0" />
      ) : (
        <Moon className="w-4 h-4 text-slate-600 shrink-0" />
      )}
      {showLabel && (
        <span className="text-xs font-bold">
          {isDark ? 'الوضع النهاري' : 'الوضع الليلي'}
        </span>
      )}
    </button>
  );
};
