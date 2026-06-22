import React from 'react';
import { Icon, StatusBadge, getIncidentType } from '@/components/irms-shared';
import type { Incident } from '@/components/irms-shared';
import { useIsMobile } from '@/hooks/use-media-query';

export interface IncidentsTableProps {
  rows: Incident[];
  onView: (inc: Incident) => void;
  showAssigned?: boolean;
}

function NavIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 11 22 2 13 21 11 13 3 11"/>
    </svg>
  );
}

export function IncidentsTable({ rows, onView, showAssigned = false }: IncidentsTableProps) {
  const isMobile = useIsMobile();
  const cellPad = isMobile ? '12px 14px' : '14px 24px';
  const headPad = isMobile ? '12px 14px' : '12px 24px';
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--brand-cream)', borderBottom: '1px solid var(--brand-hairline)' }}>
            {['Reference', 'Type', 'Location', 'Status', 'Reported', showAssigned && 'Assigned to', 'Directions', 'Action'].filter(Boolean).map(h => (
              <th key={h as string} style={{
                padding: headPad, textAlign: 'left', fontSize: 11, fontWeight: 600,
                color: 'var(--brand-muted)', letterSpacing: '0.05em', textTransform: 'uppercase',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(r => {
            const t = getIncidentType(r.type);
            const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lng}&travelmode=driving`;
            return (
              <tr key={r.ref} style={{ borderBottom: '1px solid var(--brand-hairline)', transition: 'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-cream)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: cellPad, fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600 }}>{r.ref}</td>
                <td style={{ padding: cellPad }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: 7, flexShrink: 0,
                      background: 'var(--brand-cream)', border: '1px solid var(--brand-hairline)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-ink)',
                    }}><t.icon style={{ width: 16, height: 16 }} /></div>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{t.short}</span>
                  </div>
                </td>
                <td style={{ padding: cellPad, fontSize: 13, color: 'var(--brand-ink)', maxWidth: isMobile ? 150 : 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.location}</td>
                <td style={{ padding: cellPad }}><StatusBadge status={r.status} size="sm"/></td>
                <td style={{ padding: cellPad, fontSize: 12, color: 'var(--brand-muted)', fontFamily: 'var(--font-mono)' }}>{r.reported}</td>
                {showAssigned && <td style={{ padding: cellPad, fontSize: 13, color: r.assignedTo ? 'var(--brand-ink)' : 'var(--brand-muted)' }}>{r.assignedTo || '— unassigned'}</td>}
                <td style={{ padding: cellPad }}>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Directions to ${r.location}`}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '6px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600,
                      color: '#1A73E8', background: 'rgba(26,115,232,0.07)',
                      border: '1px solid rgba(26,115,232,0.2)',
                      textDecoration: 'none', transition: 'all 0.1s', whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#1A73E8'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#1A73E8'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(26,115,232,0.07)'; e.currentTarget.style.color = '#1A73E8'; e.currentTarget.style.borderColor = 'rgba(26,115,232,0.2)'; }}
                  >
                    <NavIcon /> Directions
                  </a>
                </td>
                <td style={{ padding: cellPad, textAlign: 'right' }}>
                  <button onClick={() => onView(r)} style={{
                    padding: '6px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600,
                    color: 'var(--brand-ink)', background: 'var(--brand-cream)',
                    border: '1px solid var(--brand-hairline)', transition: 'all 0.1s', cursor: 'pointer'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-ink)'; e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--brand-cream)'; e.currentTarget.style.color = 'var(--brand-ink)'; }}
                  >View</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
