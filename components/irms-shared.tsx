import React from 'react';
import { useIsMobile } from '@/hooks/use-media-query';

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

export interface IncidentType {
  id: string;
  label: string;
  short: string;
  icon: (p: React.SVGProps<SVGSVGElement>) => React.JSX.Element;
  color: string;
}

// Incident types config - matches API values
export const INCIDENT_TYPES: IncidentType[] = [
  { id: 'road_traffic_accident', label: 'Road Traffic Accident', short: 'Traffic', icon: Icon.car, color: '#E84A3F' },
  { id: 'missing_person', label: 'Missing Person Case', short: 'Missing', icon: Icon.person, color: '#3B82F6' },
  { id: 'civil_disturbance', label: 'Civil Disturbance / Crowd Riot', short: 'Civil', icon: Icon.crowd, color: '#F59E0B' },
  { id: 'medical_emergency', label: 'Medical Emergency', short: 'Medical', icon: Icon.medical, color: '#DC2626' },
  { id: 'flood', label: 'Flood Incident', short: 'Flood', icon: Icon.flood, color: '#0EA5E9' },
  { id: 'fire_outbreak', label: 'Fire Outbreak', short: 'Fire', icon: Icon.fire, color: '#EF4444' },
];

export type IncidentStatus = 'pending' | 'in_progress' | 'assigned' | 'resolved' | 'closed';

export interface Incident {
  ref: string;
  type: string;
  location: string;
  lat: number;
  lng: number;
  status: IncidentStatus;
  reported: string;
  reportedAt: string;
  desc: string;
  media: number;
  assignedTo: string | null;
  // Backend-provided extras (optional — absent on seeded/mock data).
  id?: string;            // backend incident UUID, used for PATCH /incidents/{id}/
  distanceKm?: number;    // distance from the agency, when provided by /agencies/incidents
  isMine?: boolean;       // true when this agency has claimed the incident
}

// ============================================================
// STATUS BADGE — used everywhere, consistent palette
// ============================================================
export function StatusBadge({ status, size = 'md' }: { status: IncidentStatus; size?: 'sm' | 'md' }) {
  const map = {
    pending: { label: 'Received', color: 'var(--status-red)', bg: 'var(--status-red-bg)', bd: 'var(--status-red-bd)' },
    in_progress: { label: 'Under Review', color: 'var(--status-amber)', bg: 'var(--status-amber-bg)', bd: 'var(--status-amber-bd)' },
    assigned: { label: 'Assigned', color: 'var(--status-blue)', bg: 'var(--status-blue-bg)', bd: 'var(--status-blue-bd)' },
    resolved: { label: 'Resolved', color: 'var(--status-green)', bg: 'var(--status-green-bg)', bd: 'var(--status-green-bd)' },
    closed: { label: 'Closed', color: 'var(--brand-muted)', bg: 'var(--brand-surface-alt)', bd: 'var(--brand-divider)' },
  };
  const s = map[status] || map.pending;
  const small = size === 'sm';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: small ? '3px 8px' : '4px 10px',
      borderRadius: 999, fontSize: small ? 11 : 12, fontWeight: 600,
      color: s.color, background: s.bg, border: `1px solid ${s.bd}`,
      letterSpacing: '0.01em', whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color }} />
      {s.label}
    </span>
  );
}

// ============================================================
// STATUS STEPPER — the canonical 4-step flow
// ============================================================
export function StatusStepper({ current = 'pending', timestamps = {}, theme = 'dark' }: {
  current?: IncidentStatus;
  timestamps?: Record<string, string | null>;
  theme?: 'light' | 'dark';
}) {
  const steps = [
    { id: 'pending', label: 'Received' },
    { id: 'in_progress', label: 'Under Review' },
    { id: 'assigned', label: 'Assigned' },
    { id: 'resolved', label: 'Resolved' },
  ];
  const colors = { pending: 'var(--status-red)', in_progress: 'var(--status-amber)', assigned: 'var(--status-blue)', resolved: 'var(--status-green)', closed: 'var(--brand-muted)' };
  // Handle 'closed' status by treating it as 'resolved' for the stepper
  const displayCurrent = current === 'closed' ? 'resolved' : current;
  const currentIdx = steps.findIndex(s => s.id === displayCurrent);
  const isMobile = useIsMobile();
  // Shrink per-step label width on phones so all 4 steps fit at ~375px without horizontal scroll
  const labelMinWidth = isMobile ? 56 : 90;
  const isLight = theme === 'light';
  const muted = isLight ? 'var(--brand-divider)' : 'var(--brand-muted)';
  const mutedText = isLight ? 'var(--brand-muted)' : 'var(--brand-divider)';
  const text = isLight ? 'var(--brand-ink)' : 'var(--brand-cream)';

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, width: '100%' }}>
      {steps.map((step, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        const future = i > currentIdx;
        const color = (active || done) ? colors[step.id as IncidentStatus] : muted;
        const activeColor = colors[current];
        return (
          <React.Fragment key={step.id}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0, flex: '0 0 auto' }}>
              <div style={{ position: 'relative', width: 28, height: 28 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: active ? activeColor : done ? color : 'transparent',
                  border: future ? `2px solid ${muted}` : `2px solid ${active ? activeColor : color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', transition: 'all 0.3s ease',
                }}>
                  {done && <Icon.check style={{ width: 14, height: 14 }} />}
                  {active && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                </div>
                {active && (
                  <div style={{
                    position: 'absolute', inset: -4, borderRadius: '50%',
                    border: `2px solid ${activeColor}`, opacity: 0.3, animation: 'pulse 2s ease-out infinite',
                  }} />
                )}
              </div>
              <div style={{ marginTop: 10, textAlign: 'center', minWidth: labelMinWidth }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: (active || done) ? text : mutedText, letterSpacing: '0.01em' }}>{step.label}</div>
                {timestamps[step.id] && (
                  <div style={{ fontSize: 10, color: mutedText, marginTop: 3, fontFamily: 'var(--font-mono)' }}>{timestamps[step.id]}</div>
                )}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: muted, marginTop: 13, position: 'relative', overflow: 'hidden', minWidth: isMobile ? 8 : 20 }}>
                <div style={{
                  position: 'absolute', inset: 0, background: done ? color : 'transparent',
                  transform: done ? 'scaleX(1)' : 'scaleX(0)', transformOrigin: 'left',
                  transition: 'transform 0.6s ease',
                }} />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ============================================================
// BUTTONS
// ============================================================
interface ButtonProps {
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

// ============================================================
// SAMPLE INCIDENTS — used across dashboard
// ============================================================
export const SAMPLE_INCIDENTS: Incident[] = [
  { ref: 'INC-2026-00148', type: 'medical_emergency', location: 'Auditorium 3, Main Bowl', lat: 6.8932, lng: 3.1721, status: 'pending', reported: '2 min ago', reportedAt: 'Today · 14:32', desc: 'Elderly man collapsed during service. Witnesses report chest pain. Crowd gathered, space cleared.', media: 2, assignedTo: null },
  { ref: 'INC-2026-00147', type: 'road_traffic_accident', location: 'Lagos-Ibadan Expressway, Mile 46', lat: 6.8865, lng: 3.1812, status: 'pending', reported: '6 min ago', reportedAt: 'Today · 14:28', desc: 'Two-vehicle collision near camp gate. One vehicle overturned. Possible injuries.', media: 3, assignedTo: null },
  { ref: 'INC-2026-00146', type: 'fire_outbreak', location: 'Workers Quarters, Block C', lat: 6.8901, lng: 3.1689, status: 'in_progress', reported: '18 min ago', reportedAt: 'Today · 14:16', desc: 'Smoke reported from kitchen unit. No flames visible yet. Residents evacuating.', media: 1, assignedTo: null },
  { ref: 'INC-2026-00145', type: 'civil_disturbance', location: 'Camp Gate 2, Outer Perimeter', lat: 6.8954, lng: 3.1745, status: 'assigned', reported: '34 min ago', reportedAt: 'Today · 14:00', desc: 'Disorderly crowd near vehicle screening point. Security on scene.', media: 0, assignedTo: 'Camp Security Unit' },
  { ref: 'INC-2026-00144', type: 'medical_emergency', location: 'Tabernacle North Wing', lat: 6.8920, lng: 3.1701, status: 'assigned', reported: '52 min ago', reportedAt: 'Today · 13:42', desc: 'Fainting reported. Person breathing, conscious. Awaiting medical team.', media: 1, assignedTo: 'RCCG Medical Centre' },
  { ref: 'INC-2026-00143', type: 'flood', location: 'Drainage Channel B, Workers Village', lat: 6.8878, lng: 3.1656, status: 'in_progress', reported: '1 hr ago', reportedAt: 'Today · 13:31', desc: 'Water overflow blocking pedestrian path after morning rain.', media: 2, assignedTo: null },
  { ref: 'INC-2026-00142', type: 'missing_person', location: "Children's Pavilion", lat: 6.8945, lng: 3.1733, status: 'resolved', reported: '2 hr ago', reportedAt: 'Today · 12:45', desc: 'Child separated from family during service. Description: 7-year-old boy, blue shirt.', media: 1, assignedTo: 'RCCG Security' },
  { ref: 'INC-2026-00141', type: 'road_traffic_accident', location: 'Mowe-Ibafo Road, Junction', lat: 6.8812, lng: 3.1798, status: 'resolved', reported: '3 hr ago', reportedAt: 'Today · 11:20', desc: 'Motorcycle and tricycle minor collision. Both riders ambulatory.', media: 2, assignedTo: 'Federal Road Safety' },
];

export function getIncidentType(id: string): IncidentType {
  const normalizedId = id === 'rta' ? 'road_traffic_accident' :
                       id === 'missing' ? 'missing_person' :
                       id === 'civil' ? 'civil_disturbance' :
                       id === 'medical' ? 'medical_emergency' :
                       id === 'fire' ? 'fire_outbreak' :
                       id;
  return INCIDENT_TYPES.find(t => t.id === normalizedId || t.id === id) || INCIDENT_TYPES[0];
}

// SVG path markup for Leaflet divIcon markers (matches Icon.* glyphs above).
const INCIDENT_ICON_PATHS: Record<string, string> = {
  road_traffic_accident:
    '<path d="M6 20v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3M29 20v3a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-3M4 20h24M6 20l2-7a3 3 0 0 1 3-2h10a3 3 0 0 1 3 2l2 7M4 20a2 2 0 0 1 2-2h20a2 2 0 0 1 2 2v0M9 17h14" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="20" r="1.5" fill="currentColor"/><circle cx="23" cy="20" r="1.5" fill="currentColor"/>',
  missing_person:
    '<circle cx="16" cy="11" r="4.5"/><path d="M6 28c0-5 4.5-8 10-8s10 3 10 8" stroke-linecap="round"/><path d="M22 6l4 4M26 6l-4 4" stroke-linecap="round"/>',
  civil_disturbance:
    '<circle cx="11" cy="11" r="3"/><circle cx="21" cy="11" r="3"/><path d="M5 22c0-3 2.5-5 6-5s6 2 6 5M15 22c0-3 2.5-5 6-5s6 2 6 5" stroke-linecap="round"/>',
  medical_emergency:
    '<rect x="4" y="8" width="24" height="18" rx="2"/><path d="M16 13v8M12 17h8" stroke-width="2" stroke-linecap="round"/><path d="M11 8V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3"/>',
  flood:
    '<path d="M3 22c2 0 3-2 5-2s3 2 5 2 3-2 5-2 3 2 5 2 3-2 5-2M3 27c2 0 3-2 5-2s3 2 5 2 3-2 5-2 3 2 5 2 3-2 5-2" stroke-linecap="round" stroke-linejoin="round"/><path d="M11 14L16 4l5 10" stroke-linejoin="round"/>',
  fire_outbreak:
    '<path d="M16 3s2 4 2 7c0 2-2 3-2 5 0 1.5 2 2 2 4M16 28c-5 0-9-3.5-9-9 0-3 2-5 3-7 1 2 2 3 3 3 0-3 1-6 3-9 0 2 4 4 4 9 0 1 1 0 2-1 1 2 3 3 3 6 0 5-4 8-9 8z" stroke-linejoin="round"/>',
};

function incidentTrackHref(reference: string): string {
  return `/track?ref=${encodeURIComponent(reference)}`;
}

/** Leaflet divIcon HTML — dark tile with the incident-type glyph (matches the type picker). */
export function buildIncidentMarkerHtml(incidentType: string): string {
  const t = getIncidentType(incidentType);
  const paths = INCIDENT_ICON_PATHS[t.id] || INCIDENT_ICON_PATHS.road_traffic_accident;
  return `<div class="irms-incident-marker" style="--marker-accent:${t.color}">
    <div class="irms-incident-marker__inner">
      <svg width="20" height="20" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6">${paths}</svg>
    </div>
  </div>`;
}

/** Leaflet divIcon HTML for agency side — outer ring is status color (+ pulse if pending), inner icon is incident type. */
export function buildAgencyIncidentMarkerHtml(incidentType: string, status: IncidentStatus): string {
  const t = getIncidentType(incidentType);
  const paths = INCIDENT_ICON_PATHS[t.id] || INCIDENT_ICON_PATHS.road_traffic_accident;
  
  const statusColors: Record<IncidentStatus, string> = {
    pending: 'var(--status-red, #C8463C)',
    in_progress: 'var(--status-amber, #B97A2A)',
    assigned: 'var(--status-blue, #3B6FB8)',
    resolved: 'var(--status-green, #3E8657)',
    closed: 'var(--brand-muted, #6D6A5E)',
  };
  const ringColor = statusColors[status] || statusColors.pending;
  const pulseHtml = status === 'pending' ? `<div class="pulse" style="color: var(--status-red);"></div>` : '';

  return `<div class="irms-incident-marker" style="--marker-accent:${ringColor}; color:${t.color}; position:relative;">
    ${pulseHtml}
    <div class="irms-incident-marker__inner">
      <svg width="20" height="20" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6">${paths}</svg>
    </div>
  </div>`;
}


export interface IncidentMapCardData {
  reference: string;
  incident_type: string;
  incident_type_display?: string;
  status?: string;
  status_display?: string;
  location_name?: string;
  description?: string;
  created_at?: string;
}

/** Compact hover tooltip for map markers. */
export function buildIncidentMapTooltipHtml(incident: IncidentMapCardData): string {
  const t = getIncidentType(incident.incident_type);
  const label = incident.incident_type_display || t.short;
  const href = incidentTrackHref(incident.reference);
  return `<div class="irms-incident-tooltip__inner">
    <div class="irms-incident-tooltip__title">${label}</div>
    <div class="irms-incident-tooltip__ref">${incident.reference}</div>
    <a href="${href}" class="irms-incident-tooltip__link">Track report →</a>
  </div>`;
}

/** Click popup for map markers. */
export function buildIncidentMapPopupHtml(incident: IncidentMapCardData): string {
  const t = getIncidentType(incident.incident_type);
  const label = incident.incident_type_display || t.label;
  const href = incidentTrackHref(incident.reference);
  const desc = incident.description
    ? `<div class="irms-incident-popup__desc">${incident.description.substring(0, 100)}${incident.description.length > 100 ? '…' : ''}</div>`
    : '';
  const date = incident.created_at
    ? `<div class="irms-incident-popup__meta">${new Date(incident.created_at).toLocaleDateString()}</div>`
    : '';
  return `<div class="irms-incident-popup">
    <div class="irms-incident-popup__type" style="color:${t.color}">${label}</div>
    <div class="irms-incident-popup__ref">Ref: ${incident.reference}</div>
    <div class="irms-incident-popup__meta">${incident.status_display || incident.status || ''}</div>
    <div class="irms-incident-popup__meta">${incident.location_name || 'Unknown location'}</div>
    ${desc}
    ${date}
    <a href="${href}" class="irms-incident-popup__link">Track this report →</a>
  </div>`;
}
