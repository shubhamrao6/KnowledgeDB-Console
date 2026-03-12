'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const saved = localStorage.getItem('kdb_theme') || 'dark';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('kdb_theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg hover:bg-bg-hover transition-colors"
      title="Toggle theme"
      aria-label="Toggle light/dark mode"
    >
      {theme === 'dark' ? <Sun size={18} className="text-text-secondary" /> : <Moon size={18} className="text-text-secondary" />}
    </button>
  );
}
