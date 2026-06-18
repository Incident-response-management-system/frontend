import React from 'react';
import { IRMSMark, Icon } from '@/components/irms-shared';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAgencyProfile } from './context';
import { useIsTablet } from '@/hooks/use-media-query';

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

export interface DashboardShellProps {
  navigate: (to: string, params?: Record<string, any>) => void;
  currentTab: string;
  children: React.ReactNode;
  onTabChange: (tab: string) => void;
}

export function DashboardShell({ navigate, currentTab, children, onTabChange }: DashboardShellProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const isTablet = useIsTablet();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  // In drawer mode (tablet/mobile) the sidebar is always shown expanded.
  const drawerCollapsed = isTablet ? false : collapsed;

  const profile = useAgencyProfile();
  const agencyName = profile?.agencyName || 'Your Agency';
  const agencyInitials = (profile?.agencyName || 'AG')
    .split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'AG';
  const typeLabel = profile?.agencyType ? (AGENCY_TYPE_LABELS[getAgencyTypeKey(profile.agencyType)] || profile.agencyType) : '';
  const agencyMeta = [typeLabel, profile?.radius ? `${profile.radius}km` : '']
    .filter(Boolean).join(' · ') || 'Agency';
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Icon.grid },
    { id: 'map', label: 'Map View', icon: Icon.map },
    { id: 'reports', label: 'All Reports', icon: Icon.list },
    { id: 'settings', label: 'Settings', icon: Icon.settings },
  ];
  const handleNav = (id: string) => { onTabChange(id); if (isTablet) setMobileOpen(false); };
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--brand-cream)', color: 'var(--brand-ink)' }}>
      {/* Backdrop (drawer mode only) */}
      {isTablet && mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'var(--scrim)', zIndex: 1999,
        }} />
      )}

      {/* Fixed hamburger button (drawer mode, drawer closed) */}
      {isTablet && !mobileOpen && (
        <button onClick={() => setMobileOpen(true)} aria-label="Open menu" style={{
          position: 'fixed', top: 14, left: 12, zIndex: 1500,
          width: 40, height: 40, borderRadius: 10,
          background: 'var(--brand-white)', border: '1px solid var(--brand-hairline)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--brand-ink)', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
        </button>
      )}

      {/* SIDEBAR */}
      <aside style={{
        width: isTablet ? 248 : (collapsed ? 72 : 248), flexShrink: 0,
        background: 'var(--brand-white)', borderRight: '1px solid var(--brand-hairline)',
        display: 'flex', flexDirection: 'column',
        transition: isTablet ? 'transform 0.25s ease' : 'width 0.2s ease',
        ...(isTablet
          ? { position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 2000, transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)' }
          : { position: 'sticky', top: 0, height: '100vh', zIndex: 100 }),
      }}>
        <div style={{ padding: drawerCollapsed ? '20px 16px' : '20px 20px', borderBottom: '1px solid var(--brand-hairline)' }}>
          {drawerCollapsed ? (
            <div style={{ cursor: 'pointer' }} onClick={() => setCollapsed(false)}>
              <IRMSMark size={28} />
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                <IRMSMark size={24} />
                <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.01em' }}>IRMS</span>
              </div>
              <button onClick={() => isTablet ? setMobileOpen(false) : setCollapsed(true)} style={{ color: 'var(--brand-muted)', padding: 4, background: 'none', border: 'none', cursor: 'pointer' }}>
                {isTablet ? <Icon.close style={{ width: 16, height: 16 }} /> : <Icon.back style={{ width: 16, height: 16 }} />}
              </button>
            </div>
          )}
        </div>

        {/* Agency badge — real logged-in agency */}
        {!drawerCollapsed && (
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--brand-hairline)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9,
                background: 'var(--status-blue-bg)', border: '1px solid var(--status-blue-bd)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--status-blue)',
                fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-mono)',
              }}>{agencyInitials}</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{agencyName}</div>
                <div style={{ fontSize: 11, color: 'var(--brand-muted)' }}>{agencyMeta}</div>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(item => {
            const active = currentTab === item.id;
            return (
              <button key={item.id} onClick={() => handleNav(item.id)} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: drawerCollapsed ? '11px 12px' : '11px 14px', borderRadius: 9,
                background: active ? 'var(--status-red-bg)' : 'transparent',
                color: active ? 'var(--status-red)' : 'var(--brand-ink)',
                fontWeight: active ? 600 : 500, fontSize: 14, border: 'none', cursor: 'pointer',
                transition: 'all 0.15s', justifyContent: drawerCollapsed ? 'center' : 'flex-start',
                position: 'relative',
              }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--brand-surface-alt)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <item.icon />
                {!drawerCollapsed && <span>{item.label}</span>}
                {active && !drawerCollapsed && <div style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 3, borderRadius: 3, background: 'var(--status-red)' }} />}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: 12, borderTop: '1px solid var(--brand-hairline)' }}>
          {drawerCollapsed && (
            <button onClick={() => setCollapsed(false)} style={{
              width: '100%', padding: '11px 12px', borderRadius: 9,
              display: 'flex', justifyContent: 'center', color: 'var(--brand-muted)', background: 'none', border: 'none', cursor: 'pointer'
            }}><Icon.chev /></button>
          )}
          <button onClick={() => { if (isTablet) setMobileOpen(false); navigate('landing'); }} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: drawerCollapsed ? '11px 12px' : '11px 14px', borderRadius: 9, width: '100%',
            color: 'var(--brand-muted)', fontSize: 14, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer',
            justifyContent: drawerCollapsed ? 'center' : 'flex-start',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-surface-alt)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Icon.logout />{!drawerCollapsed && 'Logout'}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, minWidth: 0 }}>{children}</main>
    </div>
  );
}
