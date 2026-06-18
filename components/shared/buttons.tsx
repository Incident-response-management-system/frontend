import React from 'react';

// ============================================================
// BUTTONS
// ============================================================
export interface ButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  full?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
}

export function PrimaryButton({ children, onClick, full, size = 'md', style }: ButtonProps) {
  const sizes = { sm: { p: '8px 14px', fs: 13 }, md: { p: '11px 18px', fs: 14 }, lg: { p: '14px 24px', fs: 15 } };
  const s = sizes[size];
  return (
    <button onClick={onClick} style={{
      background: 'var(--status-red)', color: 'white', padding: s.p, borderRadius: 9,
      fontWeight: 600, fontSize: s.fs, letterSpacing: '0.005em',
      width: full ? '100%' : 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      transition: 'transform 0.1s, background 0.15s', boxShadow: '0 1px 2px rgba(40, 35, 20, 0.04)',
      ...style,
    }}
      onMouseEnter={e => { e.currentTarget.style.background = '#B23B33'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'var(--status-red)'; }}
      onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.98)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
    >{children}</button>
  );
}

export function InkButton({ children, onClick, full, size = 'md', style }: ButtonProps) {
  const sizes = { sm: { p: '8px 14px', fs: 13 }, md: { p: '11px 18px', fs: 14 }, lg: { p: '14px 24px', fs: 15 } };
  const s = sizes[size];
  return (
    <button onClick={onClick} style={{
      background: 'var(--brand-ink)', color: 'var(--brand-cream)', padding: s.p, borderRadius: 9,
      fontWeight: 600, fontSize: s.fs, letterSpacing: '0.005em',
      width: full ? '100%' : 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      transition: 'transform 0.1s, background 0.15s', boxShadow: '0 1px 2px rgba(40, 35, 20, 0.04)',
      ...style,
    }}
      onMouseEnter={e => { e.currentTarget.style.background = '#232118'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'var(--brand-ink)'; }}
      onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.98)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
    >{children}</button>
  );
}

export function GhostButton({ children, onClick, theme = 'dark', size = 'md', style }: ButtonProps & { theme?: 'light' | 'dark' }) {
  const isLight = theme === 'light';
  const sizes = { sm: { p: '7px 12px', fs: 13 }, md: { p: '10px 16px', fs: 14 }, lg: { p: '13px 20px', fs: 15 } };
  const s = sizes[size];
  return (
    <button onClick={onClick} style={{
      background: isLight ? 'var(--brand-white)' : 'var(--brand-white)',
      color: isLight ? 'var(--brand-ink)' : 'var(--brand-ink)',
      border: `1px solid ${isLight ? 'var(--brand-hairline)' : 'var(--brand-divider)'}`,
      padding: s.p, borderRadius: 9, fontWeight: 500, fontSize: s.fs,
      display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'all 0.15s',
      boxShadow: '0 1px 2px rgba(40, 35, 20, 0.04)',
      ...style,
    }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = isLight ? 'var(--brand-divider)' : 'var(--brand-muted)';
        e.currentTarget.style.background = isLight ? 'var(--brand-surface-alt)' : 'var(--brand-cream)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = isLight ? 'var(--brand-hairline)' : 'var(--brand-divider)';
        e.currentTarget.style.background = isLight ? 'var(--brand-white)' : 'var(--brand-white)';
      }}
    >{children}</button>
  );
}
