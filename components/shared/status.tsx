import React from 'react';
import { useIsMobile } from '@/hooks/use-media-query';
import { Icon } from './icons';
import type { IncidentStatus } from './types';

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
    { id: 'assigned', label: 'Assigned' },
    { id: 'in_progress', label: 'Under Review' },
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
  const mutedText = 'var(--brand-muted)';
  const text = 'var(--brand-ink)';

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
