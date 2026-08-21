'use client';

import { useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('new850-theme') as Theme | null;
    const initial = saved === 'light' || saved === 'dark' ? saved
      : window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    document.documentElement.dataset.theme = initial;
    setTheme(initial);
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('new850-theme', next);
    setTheme(next);
  }

  return (
    <button className="themeToggle" type="button" onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} aria-pressed={theme === 'light'} data-no-translate>
      <span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span>
      <strong>{theme === 'dark' ? 'Light' : 'Dark'}</strong>
    </button>
  );
}
