import React from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle({ theme, toggleTheme }) {
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-surface-container-high text-on-surface hover:bg-surface-tint hover:text-on-primary transition-colors shadow-sm"
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
