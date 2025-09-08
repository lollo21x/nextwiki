import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="
        p-2 rounded-lg transition-colors duration-200 backdrop-blur-md
        hover:bg-gray-100/80 dark:hover:bg-gray-800/80
        text-gray-600 dark:text-gray-300
      "
      style={{ outline: 'none', boxShadow: 'none' }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
};