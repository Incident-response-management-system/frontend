"use client";

import React from 'react';
import { useTheme } from '@/hooks/use-theme';

/**
 * Theme toggle button — sun in dark mode (tap to go light), moon in light mode
 * (tap to go dark). Sized to sit alongside the existing icon buttons (~36-38px).
 * Uses CSS vars so it recolors with the theme automatically.
 */
export function ThemeToggle({ size = 36 }: { size?: number }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        width: size, height: size, borderRadius: 10,
        border: '1px solid var(--brand-divider)',
        background: 'var(--brand-white)',
        color: 'var(--brand-ink)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', flexShrink: 0,
        transition: 'background 0.15s, border-color 0.15s, transform 0.1s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-surface-alt)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'var(--brand-white)'; }}
      onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.94)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {isDark ? (
        // Sun
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        // Moon
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  );
}
