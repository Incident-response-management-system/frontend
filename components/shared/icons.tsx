import React from 'react';

// Custom siren/civic mark — original IRMS glyph
export function IRMSMark({ size = 24, color = '#E84A3F' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M16 3 L27 9 L27 19 C27 24 22 28.5 16 30 C10 28.5 5 24 5 19 L5 9 Z"
        stroke={color} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="16" cy="15" r="3" fill={color} />
      <path d="M16 18 L16 23" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IRMSLogo({ color = 'white', size = 18 }: { color?: string; size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <IRMSMark size={size + 6} color="#E84A3F" />
      <span style={{ fontWeight: 800, letterSpacing: '-0.01em', fontSize: size, color }}>IRMS</span>
    </div>
  );
}

// ============================================================
// ICONS — minimal line glyphs, all hand-drawn, no emoji
// ============================================================
export const Icon = {
  arrow: (p: React.SVGProps<SVGSVGElement>) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  back: (p: React.SVGProps<SVGSVGElement>) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}><path d="M19 12H5M11 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  close: (p: React.SVGProps<SVGSVGElement>) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}><path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
  plus: (p: React.SVGProps<SVGSVGElement>) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
  check: (p: React.SVGProps<SVGSVGElement>) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}><path d="M4 12l5 5L20 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  pin: (p: React.SVGProps<SVGSVGElement>) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}><path d="M12 22s-7-7.5-7-13a7 7 0 1 1 14 0c0 5.5-7 13-7 13z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.8" /></svg>,
  upload: (p: React.SVGProps<SVGSVGElement>) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}><path d="M12 16V4M6 10l6-6 6 6M4 20h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  eye: (p: React.SVGProps<SVGSVGElement>) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...p}><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="1.6" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" /></svg>,
  eyeOff: (p: React.SVGProps<SVGSVGElement>) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...p}><path d="M3 3l18 18M10 5.5A11 11 0 0 1 23 12s-1.5 2.5-4 4.5M6 6.5C3 8.5 1 12 1 12s4 7 11 7c2 0 4-.6 5.5-1.5M9.5 9.5a3 3 0 0 0 4.2 4.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>,
  search: (p: React.SVGProps<SVGSVGElement>) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...p}><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" /><path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>,
  clock: (p: React.SVGProps<SVGSVGElement>) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" /><path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  filter: (p: React.SVGProps<SVGSVGElement>) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...p}><path d="M3 5h18l-7 9v6l-4-2v-4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>,
  download: (p: React.SVGProps<SVGSVGElement>) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...p}><path d="M12 4v12M6 14l6 6 6-6M4 22h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  chevDown: (p: React.SVGProps<SVGSVGElement>) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" {...p}><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  chev: (p: React.SVGProps<SVGSVGElement>) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" {...p}><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  menu: (p: React.SVGProps<SVGSVGElement>) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}><path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
  more: (p: React.SVGProps<SVGSVGElement>) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...p}><circle cx="5" cy="12" r="1.5" fill="currentColor" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /><circle cx="19" cy="12" r="1.5" fill="currentColor" /></svg>,
  // Sidebar nav
  grid: (p: React.SVGProps<SVGSVGElement>) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...p}><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" /><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" /><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" /><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" /></svg>,
  map: (p: React.SVGProps<SVGSVGElement>) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...p}><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>,
  list: (p: React.SVGProps<SVGSVGElement>) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...p}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>,
  settings: (p: React.SVGProps<SVGSVGElement>) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" stroke="currentColor" strokeWidth="1.4" /></svg>,
  logout: (p: React.SVGProps<SVGSVGElement>) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  bell: (p: React.SVGProps<SVGSVGElement>) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  // Incident type icons — custom line glyphs
  car: (p: React.SVGProps<SVGSVGElement>) => <svg width="28" height="28" viewBox="0 0 32 32" fill="none" {...p}><path d="M6 20v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3M29 20v3a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-3M4 20h24M6 20l2-7a3 3 0 0 1 3-2h10a3 3 0 0 1 3 2l2 7M4 20a2 2 0 0 1 2-2h20a2 2 0 0 1 2 2v0M9 17h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><circle cx="9" cy="20" r="1.5" fill="currentColor" /><circle cx="23" cy="20" r="1.5" fill="currentColor" /></svg>,
  person: (p: React.SVGProps<SVGSVGElement>) => <svg width="28" height="28" viewBox="0 0 32 32" fill="none" {...p}><circle cx="16" cy="11" r="4.5" stroke="currentColor" strokeWidth="1.6" /><path d="M6 28c0-5 4.5-8 10-8s10 3 10 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M22 6l4 4M26 6l-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>,
  crowd: (p: React.SVGProps<SVGSVGElement>) => <svg width="28" height="28" viewBox="0 0 32 32" fill="none" {...p}><circle cx="11" cy="11" r="3" stroke="currentColor" strokeWidth="1.6" /><circle cx="21" cy="11" r="3" stroke="currentColor" strokeWidth="1.6" /><path d="M5 22c0-3 2.5-5 6-5s6 2 6 5M15 22c0-3 2.5-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>,
  medical: (p: React.SVGProps<SVGSVGElement>) => <svg width="28" height="28" viewBox="0 0 32 32" fill="none" {...p}><rect x="4" y="8" width="24" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" /><path d="M16 13v8M12 17h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M11 8V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3" stroke="currentColor" strokeWidth="1.6" /></svg>,
  flood: (p: React.SVGProps<SVGSVGElement>) => <svg width="28" height="28" viewBox="0 0 32 32" fill="none" {...p}><path d="M3 22c2 0 3-2 5-2s3 2 5 2 3-2 5-2 3 2 5 2 3-2 5-2M3 27c2 0 3-2 5-2s3 2 5 2 3-2 5-2 3 2 5 2 3-2 5-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><path d="M11 14L16 4l5 10" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>,
  fire: (p: React.SVGProps<SVGSVGElement>) => <svg width="28" height="28" viewBox="0 0 32 32" fill="none" {...p}><path d="M16 3s2 4 2 7c0 2-2 3-2 5 0 1.5 2 2 2 4M16 28c-5 0-9-3.5-9-9 0-3 2-5 3-7 1 2 2 3 3 3 0-3 1-6 3-9 0 2 4 4 4 9 0 1 1 0 2-1 1 2 3 3 3 6 0 5-4 8-9 8z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>,
};
