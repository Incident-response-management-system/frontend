import React from 'react';
import { Icon } from '@/components/irms-shared';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAgencyProfile } from './context';
import { useIsMobile, useIsTablet } from '@/hooks/use-media-query';

const AGENCY_TYPE_LABELS: Record<string, string> = {
  police: 'Police Service',
  hospital: 'Hospital / Medical',
  fire_rescue: 'Fire & Rescue',
  private_security: 'Private Security',
};

function getAgencyTypeKey(type?: string | null): string {
  if (!type) return '';
  return type.toLowerCase().trim().replace(/[\s-]/g, '_');
}

export interface DashTopBarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function DashTopBar({ title, subtitle, actions }: DashTopBarProps) {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const profile = useAgencyProfile();
  const padding = isMobile ? '18px 16px 18px 56px' : (isTablet ? '20px 20px 20px 60px' : '24px 32px');
  const agencyName = profile?.agencyName || 'Your Agency';
  const agencyInitials = (profile?.agencyName || 'AG')
    .split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'AG';
  const typeLabel = profile?.agencyType ? (AGENCY_TYPE_LABELS[getAgencyTypeKey(profile.agencyType)] || profile.agencyType) : 'Agency';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      padding, borderBottom: '1px solid var(--brand-hairline)', background: 'var(--brand-white)',
    }}>
      <div style={{ minWidth: 0 }}>
        <h1 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, letterSpacing: '-0.015em', margin: '0 0 4px' }}>{title}</h1>
        {subtitle && <div style={{ fontSize: 13, color: 'var(--brand-muted)' }}>{subtitle}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12, flexShrink: 0 }}>
        {/* On mobile, drop the per-tab actions and bell to keep the row from overflowing */}
        {!isMobile && actions}
        <ThemeToggle />
        {!isMobile && (
          <button type="button" aria-label="Notifications" style={{ position: 'relative', width: 38, height: 38, borderRadius: 10, border: '1px solid var(--brand-hairline)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-ink)', background: 'var(--brand-white)', cursor: 'pointer' }}>
            <Icon.bell />
            <span style={{ position: 'absolute', top: 8, right: 9, width: 8, height: 8, borderRadius: '50%', background: 'var(--status-red)', border: '2px solid white' }}/>
          </button>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: isMobile ? 0 : 12, borderLeft: isMobile ? 'none' : '1px solid var(--brand-hairline)' }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--brand-ink)', color: 'var(--brand-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>{agencyInitials}</div>
          {!isMobile && (
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{agencyName}</div>
              <div style={{ fontSize: 11, color: 'var(--brand-muted)' }}>{typeLabel}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
