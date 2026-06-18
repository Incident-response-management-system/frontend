import React from 'react';
import { Icon, getIncidentType, StatusBadge } from '@/components/irms-shared';
import { useIsMobile } from '@/hooks/use-media-query';

export function IncidentDetailPanel({ incident, onClose, navigate }: any) {
  const isMobile = useIsMobile();
  const t = getIncidentType(incident.incident_type);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: isMobile ? '20px 16px 28px' : '20px 28px 32px' }}>
      {/* Drag handle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--brand-hairline)' }} />
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'white' }}>
              <t.icon style={{ width: 18, height: 18 }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: t.color, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {t.label}
            </span>
          </div>
        </div>
        <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid var(--brand-divider)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', cursor: 'pointer' }}>
          <Icon.close />
        </button>
      </div>

      {/* Incident Details */}
      <div style={{
        background: 'var(--brand-cream)', border: '1px solid var(--brand-divider)',
        borderRadius: 12, padding: isMobile ? '20px' : '24px', marginBottom: 20,
      }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: isMobile ? 18 : 20, fontWeight: 600, marginBottom: 12, lineHeight: 1.3 }}>
          {incident.location_name || 'Unknown location'}
        </div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--brand-muted)' }}>
            Lat: {incident.latitude?.toFixed(5)} · Lng: {incident.longitude?.toFixed(5)}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <StatusBadge status={incident.status} />
          <span style={{ fontSize: 13, color: 'var(--brand-muted)' }}>
            {incident.reference}
          </span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--brand-muted)' }}>
          Reported: {new Date(incident.created_at).toLocaleDateString()} at {new Date(incident.created_at).toLocaleTimeString()}
        </div>
      </div>

      {/* Description */}
      {incident.description && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-muted)', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Description
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--brand-ink)' }}>
            {incident.description}
          </div>
        </div>
      )}

      {/* Assigned Agency */}
      {incident.assigned_agency && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-muted)', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Assigned Agency
          </div>
          <div style={{ fontSize: 14, color: 'var(--brand-ink)' }}>
            {incident.assigned_agency}
          </div>
        </div>
      )}

      {/* Track link */}
      {incident.reference && navigate && (
        <button
          type="button"
          onClick={() => navigate('track', { ref: incident.reference })}
          style={{
            width: '100%',
            background: 'var(--brand-ink)',
            color: 'var(--brand-cream)',
            padding: '14px 24px',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 15,
            border: 'none',
            cursor: 'pointer',
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          Track this report <Icon.arrow style={{ width: 16, height: 16 }} />
        </button>
      )}

      {/* Close Button */}
      <button
        onClick={onClose}
        style={{
          width: '100%',
          background: 'var(--brand-surface-alt)',
          color: 'var(--brand-ink)',
          padding: '14px 24px',
          borderRadius: 8,
          fontWeight: 600,
          fontSize: 15,
          border: '1px solid var(--brand-divider)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        Close
      </button>
    </div>
  );
}
