"use client";

import React from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'irms-theme';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

/** Apply the theme class to <html> and persist it. */
function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* localStorage may be blocked — fall through to system preference */
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // The inline anti-FOUC script (in layout) has already set the .dark class
  // before paint. We read it back here so React state matches the DOM.
  const [theme, setThemeState] = React.useState<Theme>('light');

  React.useEffect(() => {
    const initial = getInitialTheme();
    setThemeState(initial);
    applyTheme(initial);
  }, []);

  // Keep in sync if the OS preference changes AND the user hasn't made an explicit choice.
  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      try {
        if (window.localStorage.getItem(STORAGE_KEY)) return; // explicit choice wins
      } catch { /* ignore */ }
      const next: Theme = e.matches ? 'dark' : 'light';
      setThemeState(next);
      applyTheme(next);
    };
    if (mql.addEventListener) {
      mql.addEventListener('change', handler);
      return () => mql.removeEventListener('change', handler);
    }
    mql.addListener(handler);
    return () => mql.removeListener(handler);
  }, []);

  const setTheme = React.useCallback((t: Theme) => {
    setThemeState(t);
    applyTheme(t);
    try {
      window.localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* ignore persistence failure */
    }
  }, []);

  const toggleTheme = React.useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const value = React.useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) {
    // Safe fallback so a stray useTheme() outside the provider doesn't crash —
    // returns light and no-ops. (Shouldn't happen; provider wraps the whole app.)
    return { theme: 'light', setTheme: () => {}, toggleTheme: () => {} };
  }
  return ctx;
}

/**
 * Inline script string injected into <head> to set the theme class BEFORE
 * first paint, preventing a flash of the wrong theme (FOUC). Mirrors
 * getInitialTheme() but runs synchronously with no React.
 */
export const THEME_INIT_SCRIPT = `
(function() {
  try {
    var k = '${STORAGE_KEY}';
    var s = localStorage.getItem(k);
    var dark = s === 'dark' || (!s && window.matchMedia('(prefers-color-scheme: dark)').matches);
    var el = document.documentElement;
    if (dark) { el.classList.add('dark'); el.style.colorScheme = 'dark'; }
    else { el.classList.remove('dark'); el.style.colorScheme = 'light'; }
  } catch (e) {}
})();
`;
