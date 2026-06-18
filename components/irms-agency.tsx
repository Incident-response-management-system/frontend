import React from 'react';
import { toast } from 'sonner';
import {
  IRMSMark,
  Icon,
  INCIDENT_TYPES,
  StatusBadge,
  StatusStepper,
  GhostButton,
  getIncidentType,
  Incident,
  IncidentStatus,
} from './irms-shared';
import { FormInput } from './irms-auth';
import { ThemeToggle } from './ThemeToggle';
import { fetchAgencyIncidents, updateIncidentStatus, fetchAgencyStats, type IncidentTab } from '@/lib/agency-api';
import { toBeType, toFeType, isIncidentRelevant, incidentTypesForAgency } from '@/lib/agency-types';
import { getAgencyProfile, type AgencyUser } from '@/lib/auth-api';
import { useRealtimeEvents } from '@/hooks/use-realtime';
import { useIsMobile, useIsTablet } from '@/hooks/use-media-query';

// Real logged-in agency profile, provided by DashboardScreen and consumed by
// the sidebar badge, top bar and settings. null until /auth/agency/me/ resolves.
const AgencyProfileContext = React.createContext<AgencyUser | null>(null);
function useAgencyProfile() { return React.useContext(AgencyProfileContext); }

// Human label for a backend agency_type value.
const AGENCY_TYPE_LABELS: Record<string, string> = {
  police: 'Police Service',
  hospital: 'Hospital / Medical',
  fire_rescue: 'Fire & Rescue',
  private_security: 'Private Security',
};

// Shared empty/loading/error placeholder for the dashboard tables.
function DashEmptyState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--brand-muted)', fontSize: 14 }}>
      <div>{message}</div>
      {onRetry && (
        <button type="button" onClick={onRetry} style={{
          marginTop: 14, padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
          color: 'var(--brand-ink)', background: 'var(--brand-surface-alt)', border: '1px solid var(--brand-divider)', cursor: 'pointer',
        }}>Retry</button>
      )}
    </div>
  );
}

let L: any;
if (typeof window !== 'undefined') {
  L = require('leaflet');
}

// Build the base map layer for a given mode.
//  - satellite: Esri World Imagery + a transparent reference overlay that adds
//    place names, roads and boundaries (plain imagery has no labels).
//  - streets: CARTO Voyager — a clean street map with strong, readable labels.
function buildBaseLayer(mode: 'satellite' | 'streets') {
  if (mode === 'streets') {
    return L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap, © CARTO',
      maxZoom: 22,
      maxNativeZoom: 20,
    });
  }
  const imagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, USDA, USGS',
    maxZoom: 22,
    maxNativeZoom: 18,
  });
  // Transparent labels layer: roads, place/area names, boundaries.
  const labels = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 22,
    maxNativeZoom: 18,
    pane: 'overlayPane',
  });
  return L.layerGroup([imagery, labels]);
}

interface DashboardShellProps {
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
  const typeLabel = profile?.agencyType ? (AGENCY_TYPE_LABELS[profile.agencyType] || profile.agencyType) : '';
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

// -----------------------------------------------------------
// TOPBAR — shared across dashboard tabs
// -----------------------------------------------------------
interface DashTopBarProps {
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
  const typeLabel = profile?.agencyType ? (AGENCY_TYPE_LABELS[profile.agencyType] || profile.agencyType) : 'Agency';
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
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--brand-ink)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>{agencyInitials}</div>
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

// -----------------------------------------------------------
// SCREEN 6 — OVERVIEW
// -----------------------------------------------------------
// All incident types with their human labels, keyed by frontend short code.
const DISTRIBUTION_LABELS: Record<string, string> = {
  medical: 'Medical Emergency',
  rta: 'Road Traffic Accident',
  civil: 'Civil Disturbance',
  fire: 'Fire Outbreak',
  flood: 'Flood Incident',
  missing: 'Missing Person',
};
const ALL_DISTRIBUTION_TYPES = ['medical', 'rta', 'civil', 'fire', 'flood', 'missing'];

export function OverviewTab({ incidents, loading, error, onRetry, onViewIncident }: { incidents: Incident[]; loading?: boolean; error?: string | null; onRetry?: () => void; onViewIncident: (inc: Incident) => void }) {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const profile = useAgencyProfile();

  // The distribution chart only lists the incident types this agency responds
  // to. Falls back to all types when the agency type is unknown/unmapped.
  const distributionRows = React.useMemo(() => {
    const types = incidentTypesForAgency(profile?.agencyType) ?? ALL_DISTRIBUTION_TYPES;
    return types.map(type => ({ type, label: DISTRIBUTION_LABELS[type] ?? type }));
  }, [profile?.agencyType]);

  // Derive cards from the incidents we have; replaced by /agencies/stats below.
  const deriveStats = React.useCallback((list: Incident[]) => ([
    { label: 'Total Incidents', value: String(list.length), delta: 'total', color: 'var(--brand-ink)', accent: 'var(--brand-hairline)' },
    { label: 'Open Incidents', value: String(list.filter(r => r.status !== 'resolved').length), delta: `${list.filter(r => r.status === 'pending').length} unassigned`, color: 'var(--status-red)', accent: 'var(--status-red-bd)' },
    { label: 'Assigned to You', value: String(list.filter(r => r.isMine || r.status === 'assigned').length), delta: `${list.filter(r => r.status === 'in_progress').length} in progress`, color: 'var(--status-amber)', accent: 'var(--status-amber-bd)' },
    { label: 'Resolved', value: String(list.filter(r => r.status === 'resolved').length), delta: 'this month', color: 'var(--status-green)', accent: 'var(--status-green-bd)' },
  ]), []);

  const [stats, setStats] = React.useState(() => deriveStats(incidents));

  // When the agency type is mapped to a subset of incident types, the cards
  // must agree with the (type-scoped) distribution and recent list, so we
  // derive them from the already-filtered `incidents` prop. We only fall back
  // to the server-wide /agencies/stats totals for unmapped agency types, where
  // the dashboard intentionally shows everything.
  const isTypeScoped = incidentTypesForAgency(profile?.agencyType) !== null;

  React.useEffect(() => {
    setStats(deriveStats(incidents));
    if (isTypeScoped) return;
    let cancelled = false;
    async function loadStats() {
      try {
        const s = await fetchAgencyStats();
        if (cancelled) return;
        const open = s.pending + s.inProgress + s.assigned;
        setStats([
          { label: 'Total Incidents', value: String(s.totalThisMonth), delta: 'this month', color: 'var(--brand-ink)', accent: 'var(--brand-hairline)' },
          { label: 'Open Incidents', value: String(open), delta: `${s.pending} unassigned`, color: 'var(--status-red)', accent: 'var(--status-red-bd)' },
          { label: 'Assigned to You', value: String(s.assignedToAgency), delta: `${s.inProgress} in progress`, color: 'var(--status-amber)', accent: 'var(--status-amber-bd)' },
          { label: 'Resolved', value: String(s.resolvedThisMonth), delta: `${s.closed} closed`, color: 'var(--status-green)', accent: 'var(--status-green-bd)' },
        ]);
      } catch (err) {
        // keep the locally-derived stats
      }
    }
    loadStats();
    return () => { cancelled = true; };
  }, [incidents, deriveStats, isTypeScoped]);

  return (
    <div>
      <DashTopBar
        title="Operations overview"
        subtitle="Live incidents across your service radius"
        actions={<GhostButton theme="light" size="sm" onClick={onRetry}><Icon.filter /> Refresh</GhostButton>}
      />

      <div style={{ padding: isMobile ? 16 : 32 }}>
        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              background: 'var(--brand-white)', border: `1px solid var(--brand-hairline)`,
              borderRadius: 12, padding: 20, position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.color, opacity: 0.9 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <span style={{ fontSize: 12, color: 'var(--brand-muted)', fontWeight: 600, letterSpacing: '0.02em', textTransform: 'uppercase' }}>{s.label}</span>
              </div>
              <div style={{ fontSize: isMobile ? 28 : 36, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1, fontFamily: 'var(--font-mono)', color: 'var(--brand-ink)' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: s.color, marginTop: 8, fontWeight: 500 }}>{s.delta}</div>
            </div>
          ))}
        </div>

        {/* Activity feed + heatmap row */}
        <div style={{ display: 'grid', gridTemplateColumns: isTablet ? '1fr' : '1.4fr 1fr', gap: 16, marginBottom: 32 }}>
          {/* Incident distribution */}
          <div style={{ background: 'var(--brand-white)', border: '1px solid var(--brand-hairline)', borderRadius: 12, padding: isMobile ? 16 : 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 4px' }}>Incident distribution</h3>
                <div style={{ fontSize: 12, color: 'var(--brand-muted)' }}>Last 30 days · By type</div>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--brand-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--status-red)' }} /> Open</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--status-green)' }} /> Resolved</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {distributionRows.map(({ type, label }) => {
                const open = incidents.filter(r => r.type === type && r.status !== 'resolved').length;
                const resolved = incidents.filter(r => r.type === type && r.status === 'resolved').length;
                const r = { type, label, open, resolved };
                const total = open + resolved;
                const max = Math.max(1, ...incidents.length ? [incidents.length] : [1]);
                return (
                  <div key={r.type} style={{ display: 'grid', gridTemplateColumns: isMobile ? '80px 1fr 32px' : '140px 1fr 60px', gap: isMobile ? 8 : 12, alignItems: 'center' }}>
                    <div style={{ fontSize: isMobile ? 11 : 13, color: 'var(--brand-ink)', fontWeight: 500 }}>{r.label}</div>
                    <div style={{ display: 'flex', height: 22, borderRadius: 4, overflow: 'hidden', background: 'var(--brand-cream)' }}>
                      <div style={{ width: `${(r.open / max) * 100}%`, background: 'var(--status-red)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 6, fontSize: 10, fontWeight: 600, color: 'white' }}>{r.open}</div>
                      <div style={{ width: `${(r.resolved / max) * 100}%`, background: 'var(--status-green)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 6, fontSize: 10, fontWeight: 600, color: 'white' }}>{r.resolved}</div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, textAlign: 'right' }}>{total}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status breakdown — derived from current incidents */}
          <div style={{ background: 'var(--brand-white)', border: '1px solid var(--brand-hairline)', borderRadius: 12, padding: isMobile ? 16 : 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 4px' }}>Status breakdown</h3>
            <div style={{ fontSize: 12, color: 'var(--brand-muted)', marginBottom: 24 }}>Across your current incidents</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { key: 'pending', label: 'Received', color: 'var(--status-red)' },
                { key: 'in_progress', label: 'Under Review', color: 'var(--status-amber)' },
                { key: 'assigned', label: 'Assigned', color: 'var(--status-blue)' },
                { key: 'resolved', label: 'Resolved', color: 'var(--status-green)' },
              ].map(s => {
                const n = incidents.filter(r => r.status === s.key).length;
                const pct = incidents.length ? Math.round((n / incidents.length) * 100) : 0;
                return (
                  <div key={s.key} style={{ display: 'grid', gridTemplateColumns: isMobile ? '90px 1fr 28px' : '110px 1fr 36px', gap: isMobile ? 8 : 12, alignItems: 'center' }}>
                    <div style={{ fontSize: 13, color: 'var(--brand-ink)', fontWeight: 500 }}>{s.label}</div>
                    <div style={{ height: 22, borderRadius: 4, overflow: 'hidden', background: 'var(--brand-cream)' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: s.color }} />
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, textAlign: 'right' }}>{n}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent incidents table */}
        <div style={{ background: 'var(--brand-white)', border: '1px solid var(--brand-hairline)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--brand-hairline)' }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 4px' }}>Recent incidents</h3>
              <div style={{ fontSize: 12, color: 'var(--brand-muted)' }}>Most recent reports in your radius</div>
            </div>
          </div>
          {loading ? (
            <DashEmptyState message="Loading incidents…" />
          ) : error ? (
            <DashEmptyState message={error} onRetry={onRetry} />
          ) : incidents.length === 0 ? (
            <DashEmptyState message="No incidents in your service radius yet." />
          ) : (
            <IncidentsTable rows={incidents.slice(0, 6)} onView={onViewIncident} />
          )}
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------
// INCIDENTS TABLE — shared by Overview + All Reports
// -----------------------------------------------------------
interface IncidentsTableProps {
  rows: Incident[];
  onView: (inc: Incident) => void;
  showAssigned?: boolean;
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
            {['Reference', 'Type', 'Location', 'Status', 'Reported', showAssigned && 'Assigned to', 'Action'].filter(Boolean).map(h => (
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

// -----------------------------------------------------------
// SCREEN 8 — MAP VIEW
// -----------------------------------------------------------
export function MapTab({ incidents, onViewIncident }: { incidents: Incident[]; onViewIncident: (inc: Incident) => void }) {
  const isMobile = useIsMobile();
  const profile = useAgencyProfile();
  const mapRef = React.useRef<HTMLDivElement>(null);
  const mapInstance = React.useRef<any>(null);
  const markersRef = React.useRef<any[]>([]);
  const tileLayerRef = React.useRef<any>(null);
  const gpsMarkerRef = React.useRef<any>(null);
  const gpsCircleRef = React.useRef<any>(null);

  const [layerType, setLayerType] = React.useState<'satellite' | 'streets'>('streets');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searching, setSearching] = React.useState(false);
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>([]);

  const toggleType = (value: string) =>
    setSelectedTypes(prev => prev.includes(value) ? prev.filter(x => x !== value) : [...prev, value]);
  const toggleStatus = (value: string) =>
    setSelectedStatuses(prev => prev.includes(value) ? prev.filter(x => x !== value) : [...prev, value]);

  // Only offer the incident-type filters this agency type responds to.
  const relevantTypes = React.useMemo(
    () => INCIDENT_TYPES.filter(t => isIncidentRelevant(toFeType(t.id), profile?.agencyType)),
    [profile?.agencyType]
  );
  const resetFilters = () => { setSelectedTypes([]); setSelectedStatuses([]); };
  const hasFilters = selectedTypes.length > 0 || selectedStatuses.length > 0;

  // Markers honour the type/status filters. Type is normalized to the backend
  // id since an incident may carry either the backend value or the FE short form.
  const visibleIncidents = React.useMemo(() => incidents.filter(inc => {
    const typeOk = selectedTypes.length === 0 || selectedTypes.includes(toBeType(inc.type));
    const st = inc.status === 'closed' ? 'resolved' : inc.status;
    const statusOk = selectedStatuses.length === 0 || selectedStatuses.includes(st);
    return typeOk && statusOk;
  }), [incidents, selectedTypes, selectedStatuses]);

  React.useEffect(() => {
    if (!mapRef.current || mapInstance.current || !L) return;
    const map = L.map(mapRef.current, { zoomControl: false }).setView([6.8912, 3.1720], 14);
    L.control.zoom({ position: 'topright' }).addTo(map);

    tileLayerRef.current = buildBaseLayer(layerType).addTo(map);

    mapInstance.current = map;
    return () => { map.remove(); mapInstance.current = null; };
  }, []);

  // Dynamically redraw incident markers when live coordinate data updates
  React.useEffect(() => {
    if (!mapInstance.current || !L) return;
    const map = mapInstance.current;

    // Clear previous markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    visibleIncidents.forEach(inc => {
      const icon = L.divIcon({
        html: `<div class="irms-marker ${inc.status}"></div>`,
        className: '', iconSize: [26, 26], iconAnchor: [13, 26],
      });
      const marker = L.marker([inc.lat, inc.lng], { icon }).addTo(map);
      marker.on('click', () => onViewIncident(inc));
      markersRef.current.push(marker);
    });
  }, [visibleIncidents]);

  // Update map layer dynamically
  React.useEffect(() => {
    if (!mapInstance.current || !L || !tileLayerRef.current) return;
    const map = mapInstance.current;
    tileLayerRef.current.remove();
    tileLayerRef.current = buildBaseLayer(layerType).addTo(map);
  }, [layerType]);

  const locateUser = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    toast.loading('Locating your position...', { id: 'locate-toast' });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        toast.dismiss('locate-toast');
        toast.success('Location detected successfully!');

        if (!mapInstance.current || !L) return;
        const map = mapInstance.current;

        map.setView([latitude, longitude], 15);

        if (gpsMarkerRef.current) gpsMarkerRef.current.remove();
        if (gpsCircleRef.current) gpsCircleRef.current.remove();

        gpsCircleRef.current = L.circle([latitude, longitude], {
          radius: accuracy || 50,
          color: 'var(--status-blue)',
          fillColor: 'var(--status-blue)',
          fillOpacity: 0.15,
          weight: 1.5,
        }).addTo(map);

        const gpsIcon = L.divIcon({
          html: `<div class="irms-marker assigned" style="border-color: white; background: var(--status-blue); width: 22px; height: 22px;"><div class="pulse" style="color: var(--status-blue);"></div></div>`,
          className: '',
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });
        gpsMarkerRef.current = L.marker([latitude, longitude], { icon: gpsIcon }).addTo(map);
      },
      (error) => {
        toast.dismiss('locate-toast');
        toast.error(`Unable to retrieve location: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    const toastId = toast.loading(`Searching for "${searchQuery}"...`);

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);

        toast.dismiss(toastId);
        toast.success(`Found: ${display_name.split(',')[0]}`);

        if (!mapInstance.current || !L) return;
        const map = mapInstance.current;

        map.setView([latitude, longitude], 15);
      } else {
        toast.dismiss(toastId);
        toast.error('Location not found.');
      }
    } catch (err) {
      toast.dismiss(toastId);
      toast.error('Search service currently unavailable.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <DashTopBar
        title="Live map"
        subtitle={hasFilters
          ? `${visibleIncidents.length} of ${incidents.length} incident${incidents.length === 1 ? '' : 's'} shown`
          : `${incidents.length} incident${incidents.length === 1 ? '' : 's'} in your service radius`}
        actions={null}
      />
      {/* Filter toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: isMobile ? '10px 16px' : '12px 32px',
        background: 'var(--brand-white)', borderBottom: '1px solid var(--brand-hairline)',
        flexWrap: isMobile ? 'wrap' : 'nowrap',
      }}>
        <FilterDropdown
          label="Incident Type"
          options={relevantTypes.map(t => ({ value: t.id, label: t.label }))}
          selected={selectedTypes}
          onToggle={toggleType}
        />
        <FilterDropdown
          label="Status"
          options={MAP_STATUS_FILTERS}
          selected={selectedStatuses}
          onToggle={toggleStatus}
        />
        <button
          onClick={resetFilters}
          disabled={!hasFilters}
          style={{ fontSize: 13, color: 'var(--brand-muted)', fontWeight: 500, padding: '8px 12px', background: 'none', border: 'none', cursor: hasFilters ? 'pointer' : 'default', opacity: hasFilters ? 1 : 0.45 }}
        >
          Reset filters
        </button>
        <div style={{ flex: 1 }} />
        {!isMobile && (
          <div style={{ fontSize: 12, color: 'var(--brand-muted)', fontFamily: 'var(--font-mono)' }}>
            REDEMPTION CAMP · 6.8932° N · 3.1721° E
          </div>
        )}
      </div>

      {/* Map */}
      <div style={{ flex: 1, position: 'relative' }}>
        <div ref={mapRef} style={{ position: 'absolute', inset: 0 }} />

        {/* Floating Geosearch Bar */}
        <form onSubmit={handleSearch} className="irms-map-search-container" style={{
          position: 'absolute', zIndex: 1000,
          ...(isMobile
            ? { top: 12, left: 12, right: 12, width: 'auto' }
            : { top: 20, right: 20, width: 300, maxWidth: 'calc(100vw - 40px)' }),
        }}>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search for an address..."
            className="irms-map-search-input"
            disabled={searching}
          />
          <button type="submit" className="irms-map-search-btn" disabled={searching}>
            <Icon.search style={{ width: 16, height: 16 }} />
          </button>
        </form>

        {/* Floating Map Actions (Layers Control & Geolocation Target) */}
        <div style={{
          position: 'absolute', bottom: 20, right: 20, zIndex: 1000,
          display: 'flex', flexDirection: 'column', gap: 10
        }}>
          {/* Layer toggle button */}
          <button
            onClick={() => setLayerType(l => l === 'satellite' ? 'streets' : 'satellite')}
            className="irms-map-control-btn"
            title="Toggle map layers"
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </button>

          {/* Geolocation button */}
          <button
            onClick={locateUser}
            className="irms-map-control-btn"
            title="Locate my position"
            type="button"
            style={{ background: 'var(--status-blue)', color: 'white', borderColor: 'var(--status-blue-bd)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
            </svg>
          </button>
        </div>

        {/* Legend - positioned bottom-left to prevent overlap with controls */}
        <div style={{
          position: 'absolute', bottom: 20, left: 20, zIndex: 500,
          background: 'var(--brand-white)', border: '1px solid var(--brand-hairline)', borderRadius: 12, padding: '14px 16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--brand-muted)', letterSpacing: '0.12em', marginBottom: 10 }}>LEGEND</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { c: 'var(--status-red)', l: 'Received', icon: Icon.bell },
              { c: 'var(--status-amber)', l: 'Under Review', icon: Icon.clock },
              { c: 'var(--status-blue)', l: 'Assigned', icon: Icon.pin },
              { c: 'var(--status-green)', l: 'Resolved', icon: Icon.check },
            ].map(x => (
              <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--brand-ink)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, color: x.c }}>
                  <x.icon width={16} height={16} />
                </span>
                {x.l}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterDropdown({ label, options, selected, onToggle }: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const count = selected.length;
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
        borderRadius: 9,
        border: `1px solid ${count > 0 ? 'var(--brand-ink)' : 'var(--brand-hairline)'}`,
        background: count > 0 ? 'var(--brand-surface-alt)' : 'var(--brand-white)',
        fontSize: 13, fontWeight: count > 0 ? 600 : 500, color: 'var(--brand-ink)', cursor: 'pointer'
      }}>
        {label}{count > 0 ? ` · ${count}` : ''} <Icon.chevDown />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 100 }} />
          <div style={{
            position: 'absolute', top: '100%', left: 0, marginTop: 6, zIndex: 200,
            background: 'var(--brand-white)', border: '1px solid var(--brand-hairline)', borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)', minWidth: 200, maxWidth: 'calc(100vw - 24px)', padding: 6,
          }}>
            {options.map(o => (
              <label key={o.value} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 7, fontSize: 13, cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-cream)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(o.value)}
                  onChange={() => onToggle(o.value)}
                  style={{ accentColor: 'var(--status-red)' }}
                />
                {o.label}
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Status filter options for the map toolbar (value = backend status, label = UI).
const MAP_STATUS_FILTERS: { value: string; label: string }[] = [
  { value: 'pending', label: 'Received' },
  { value: 'in_progress', label: 'Under Review' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'resolved', label: 'Resolved' },
];

// -----------------------------------------------------------
// SCREEN 9 — ALL REPORTS
// -----------------------------------------------------------
export function ReportsTab({
  incidents, loading, error, onRetry, incidentTab, onIncidentTabChange, onViewIncident,
}: {
  incidents: Incident[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  incidentTab: IncidentTab;
  onIncidentTabChange: (t: IncidentTab) => void;
  onViewIncident: (inc: Incident) => void;
}) {
  const isMobile = useIsMobile();
  const profile = useAgencyProfile();
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>([]);

  // Only offer the type chips this agency type actually responds to.
  const relevantTypes = React.useMemo(
    () => INCIDENT_TYPES.filter(t => isIncidentRelevant(toFeType(t.id), profile?.agencyType)),
    [profile?.agencyType]
  );

  // Client-side paginated & filtered list (syncs live with parent state)
  const filtered = incidents.filter(r => {
    const matchesSearch = !search ||
      r.ref.toLowerCase().includes(search.toLowerCase()) ||
      r.location.toLowerCase().includes(search.toLowerCase()) ||
      getIncidentType(r.type).label.toLowerCase().includes(search.toLowerCase()) ||
      (r.desc && r.desc.toLowerCase().includes(search.toLowerCase()));

    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(toBeType(r.type));
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(r.status);

    return matchesSearch && matchesType && matchesStatus;
  });

  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  React.useEffect(() => {
    setPage(1); // Reset page on filter changes
  }, [search, selectedTypes, selectedStatuses]);

  // Handler for dynamic multi-field filter drops
  const toggleTypeFilter = (typeId: string) => {
    setSelectedTypes(prev =>
      prev.includes(typeId) ? prev.filter(x => x !== typeId) : [...prev, typeId]
    );
  };

  const toggleStatusFilter = (statusId: string) => {
    setSelectedStatuses(prev =>
      prev.includes(statusId) ? prev.filter(x => x !== statusId) : [...prev, statusId]
    );
  };

  return (
    <div>
      <DashTopBar
        title="All reports"
        subtitle={`${filtered.length} incidents · Sorted by most recent`}
        actions={<GhostButton theme="light" size="sm"><Icon.download /> Export CSV</GhostButton>}
      />
      <div style={{ padding: isMobile ? 16 : 32 }}>
        {/* Backend-filtered scope: available (unclaimed, in radius) / mine / all */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'var(--brand-surface-alt)', border: '1px solid var(--brand-hairline)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
          {([
            { id: 'all', label: 'All' },
            { id: 'available', label: 'Available' },
            { id: 'mine', label: 'Mine' },
          ] as { id: IncidentTab; label: string }[]).map(t => {
            const active = incidentTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onIncidentTabChange(t.id)}
                style={{
                  padding: '7px 16px', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  background: active ? 'var(--brand-white)' : 'transparent',
                  color: active ? 'var(--brand-ink)' : 'var(--brand-muted)',
                  border: active ? '1px solid var(--brand-divider)' : '1px solid transparent',
                }}
              >{t.label}</button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{
            flex: 1, minWidth: isMobile ? 160 : 260, display: 'flex', alignItems: 'center', gap: 10,
            padding: '0 14px', background: 'var(--brand-white)', border: '1px solid var(--brand-hairline)', borderRadius: 10,
          }}>
            <Icon.search style={{ color: 'var(--brand-muted)' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by reference, type, or location..."
              style={{ flex: 1, padding: '10px 0', border: 'none', outline: 'none', fontSize: 14, background: 'transparent' }}
            />
          </div>

          {/* Custom multi-field filters */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: isMobile ? '1 1 100%' : undefined }}>
            {relevantTypes.map(t => {
              const active = selectedTypes.includes(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => toggleTypeFilter(t.id)}
                  style={{
                    padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                    background: active ? 'var(--brand-ink)' : 'var(--brand-white)',
                    color: active ? 'var(--brand-cream)' : 'var(--brand-muted)',
                    border: '1px solid var(--brand-hairline)', cursor: 'pointer', transition: 'all 0.15s'
                  }}
                >
                  {t.short}
                </button>
              );
            })}

            {['pending', 'in_progress', 'assigned', 'resolved'].map(s => {
              const active = selectedStatuses.includes(s);
              const labelMap: Record<string, string> = { pending: 'Received', in_progress: 'Review', assigned: 'Assigned', resolved: 'Resolved' };
              return (
                <button
                  key={s}
                  onClick={() => toggleStatusFilter(s)}
                  style={{
                    padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                    background: active ? 'var(--status-red)' : 'var(--brand-white)',
                    color: active ? 'white' : 'var(--brand-muted)',
                    border: '1px solid var(--brand-hairline)', cursor: 'pointer', transition: 'all 0.15s'
                  }}
                >
                  {labelMap[s]}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ background: 'var(--brand-white)', border: '1px solid var(--brand-hairline)', borderRadius: 12, overflow: 'hidden' }}>
          {loading ? (
            <DashEmptyState message="Loading incidents…" />
          ) : error ? (
            <DashEmptyState message={error} onRetry={onRetry} />
          ) : filtered.length === 0 ? (
            <DashEmptyState message={incidents.length === 0 ? 'No incidents to show for this view.' : 'No incidents match your filters.'} />
          ) : (
            <IncidentsTable rows={paginatedRows} onView={onViewIncident} showAssigned />
          )}
          {/* Pagination controls */}
          {!loading && !error && filtered.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid var(--brand-hairline)' }}>
            <div style={{ fontSize: 12, color: 'var(--brand-muted)' }}>
              Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1} – {Math.min(page * pageSize, filtered.length)} of {filtered.length}
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{ width: 32, height: 32, borderRadius: 7, border: '1px solid var(--brand-hairline)', fontSize: 12, color: 'var(--brand-muted)', background: 'none', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
              >←</button>
              {Array.from({ length: totalPages }).map((_, i) => {
                const n = i + 1;
                return (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    style={{
                      width: 32, height: 32, borderRadius: 7,
                      border: n === page ? '1px solid var(--status-red)' : '1px solid var(--brand-hairline)',
                      background: n === page ? 'var(--status-red)' : 'var(--brand-white)',
                      color: n === page ? 'white' : 'var(--brand-ink)',
                      fontWeight: 600, fontSize: 12, cursor: 'pointer'
                    }}
                  >{n}</button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{ width: 32, height: 32, borderRadius: 7, border: '1px solid var(--brand-hairline)', fontSize: 12, color: 'var(--brand-muted)', background: 'none', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
              >→</button>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------
// SCREEN 7 — INCIDENT DETAIL PANEL (slide-in from right)
// -----------------------------------------------------------
export function IncidentDetailPanel({ incident, onClose, onUpdateIncident }: { incident: Incident; onClose: () => void; onUpdateIncident: (ref: string, updates: Partial<Incident>) => void }) {
  const isMobile = useIsMobile();
  const profile = useAgencyProfile();
  const myAgencyName = profile?.agencyName || 'your agency';
  const [status, setStatus] = React.useState<IncidentStatus>(incident.status);
  const [assigned, setAssigned] = React.useState(!!incident.assignedTo);
  const t = getIncidentType(incident.type);

  React.useEffect(() => {
    setStatus(incident.status);
    setAssigned(!!incident.assignedTo);
  }, [incident]);

  // Claiming an incident = moving it to "review" (backend in_progress). The
  // backend has no separate assign endpoint; the strict flow is
  // pending -> in_progress -> assigned -> resolved | closed.
  const handleAssign = async () => {
    if (incident.id) {
      try {
        const updated = await updateIncidentStatus(incident.id, 'in_progress');
        toast.success(`Incident ${incident.ref} claimed — now under review.`);
        setAssigned(true);
        setStatus(updated.status);
        onUpdateIncident(incident.ref, { ...updated });
        return;
      } catch (err: any) {
        toast.error(err.message || 'Could not claim this incident.');
      }
      return;
    }
    toast.error('This incident cannot be claimed (missing backend id).');
  };

  const handleStatusUpdate = async () => {
    if (incident.id) {
      try {
        const updated = await updateIncidentStatus(incident.id, status);
        toast.success(`Incident ${incident.ref} updated to "${updated.status}".`);
        onUpdateIncident(incident.ref, { ...updated });
      } catch (err: any) {
        toast.error(err.message || 'Could not update this incident.');
      }
      return;
    }
    toast.error('This incident cannot be updated (missing backend id).');
  };

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'var(--scrim)', zIndex: 1500,
        animation: 'fadeIn 0.2s ease-out',
      }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(620px, 92vw)',
        background: 'var(--brand-white)', zIndex: 1600, overflowY: 'auto',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.15)',
        animation: 'slideRight 0.3s cubic-bezier(.2,.8,.2,1)',
      }}>
        {/* Header */}
        <div style={{
          position: 'sticky', top: 0, background: 'var(--brand-white)', zIndex: 10,
          padding: isMobile ? '24px 20px 16px' : '24px 32px 16px', borderBottom: '1px solid var(--brand-hairline)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--brand-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>INCIDENT REFERENCE</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em' }}>{incident.ref}</div>
                <StatusBadge status={status} />
              </div>
            </div>
            <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid var(--brand-hairline)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', cursor: 'pointer' }}>
              <Icon.close />
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'var(--brand-cream)', border: '1px solid var(--brand-hairline)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><t.icon style={{ width: 18, height: 18 }} /></div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{t.label}</div>
              <div style={{ fontSize: 12, color: 'var(--brand-muted)' }}>Reported {incident.reportedAt}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: isMobile ? '24px 20px 40px' : '24px 32px 40px' }}>
          {/* Status stepper */}
          <div style={{ padding: '20px 4px', marginBottom: 24, borderBottom: '1px solid var(--brand-hairline)', overflowX: 'auto' }}>
            <StatusStepper current={status} theme="light"
              timestamps={{
                received: incident.reportedAt || null,
                review: null,
                assigned: null,
                resolved: null,
              }}
            />
          </div>

          {/* Location */}
          <Section title="Location">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <Icon.pin style={{ color: 'var(--status-red)', flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{incident.location}</div>
                <div style={{ fontSize: 12, color: 'var(--brand-muted)', fontFamily: 'var(--font-mono)' }}>
                  {incident.lat.toFixed(4)}° N · {incident.lng.toFixed(4)}° E
                </div>
              </div>
            </div>
          </Section>

          {/* Description */}
          <Section title="Description">
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--brand-ink)', margin: 0 }}>{incident.desc}</p>
          </Section>

          {/* Media */}
          {incident.media > 0 && (
            <Section title={`Evidence (${incident.media} attachment${incident.media > 1 ? 's' : ''})`}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: 10 }}>
                {Array.from({ length: incident.media }).map((_, i) => (
                  <div key={i} style={{
                    aspectRatio: '1', borderRadius: 10,
                    background: 'var(--brand-cream)', border: '1px solid var(--brand-hairline)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-muted)',
                  }}>
                    <Icon.upload style={{ width: 18, height: 18 }} />
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Agency actions */}
          <div style={{ marginTop: 32, padding: 20, borderRadius: 12, background: 'var(--brand-cream)', border: '1px solid var(--brand-hairline)' }}>
            {!assigned ? (
              <>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>UNASSIGNED INCIDENT</div>
                <div style={{ fontSize: 14, color: 'var(--brand-ink)', marginBottom: 16 }}>
                  This incident is in your service radius. Assign your agency to take responsibility.
                </div>
                <button onClick={handleAssign} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px',
                  background: 'var(--status-red)', color: 'white', borderRadius: 10, fontWeight: 600, fontSize: 14,
                  width: '100%', justifyContent: 'center', border: 'none', cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(232,74,63,0.25)',
                }}>
                  Claim this incident <Icon.arrow />
                </button>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--status-blue)' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--status-blue)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Assigned to your agency</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>{incident.assignedTo || myAgencyName}</div>

                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>UPDATE INCIDENT STATUS</div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 6, marginBottom: 16, padding: 4, background: 'var(--brand-white)', borderRadius: 10, border: '1px solid var(--brand-hairline)' }}>
                  {(['pending', 'in_progress', 'assigned', 'resolved'] as const).map(s => {
                    const map = {
                      pending: { c: 'var(--status-red)', bg: 'var(--status-red-bg)', l: 'Received' },
                      in_progress: { c: 'var(--status-amber)', bg: 'var(--status-amber-bg)', l: 'Under Review' },
                      assigned: { c: 'var(--status-blue)', bg: 'var(--status-blue-bg)', l: 'Assigned' },
                      resolved: { c: 'var(--status-green)', bg: 'var(--status-green-bg)', l: 'Resolved' }
                    };
                    const m = map[s];
                    const active = status === s;
                    return (
                      <button key={s} onClick={() => setStatus(s)} style={{
                        padding: '10px 8px', borderRadius: 7, fontSize: 12, fontWeight: 600,
                        background: active ? m.bg : 'transparent',
                        color: active ? m.c : 'var(--brand-muted)',
                        border: active ? `1px solid ${m.c}` : '1px solid transparent',
                        transition: 'all 0.15s', cursor: 'pointer'
                      }}>{m.l}</button>
                    );
                  })}
                </div>

                <button onClick={handleStatusUpdate} style={{
                  width: '100%', padding: '12px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: status === 'resolved' ? 'var(--status-green)' : 'var(--status-amber)',
                  color: 'white', fontWeight: 600, fontSize: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: status === 'resolved' ? '0 4px 14px rgba(62,134,87,0.25)' : '0 4px 14px rgba(185,122,42,0.25)',
                }}>
                  <Icon.check /> Update to {status === 'resolved' ? 'Resolved' : 'New Status'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}

// -----------------------------------------------------------
// DASHBOARD ROOT — manages tabs + detail panel
// -----------------------------------------------------------
export function DashboardScreen({ navigate, initialTab = 'overview' }: { navigate: (to: string) => void; initialTab?: string }) {
  const [tab, setTab] = React.useState(initialTab);
  const [activeIncident, setActiveIncident] = React.useState<Incident | null>(null);
  const [incidents, setIncidents] = React.useState<Incident[]>([]);
  const [incidentTab, setIncidentTab] = React.useState<IncidentTab>('all');
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [profile, setProfile] = React.useState<AgencyUser | null>(null);

  const reload = React.useCallback(async (which: IncidentTab) => {
    setLoading(true);
    setLoadError(null);
    try {
      const list = await fetchAgencyIncidents(which);
      setIncidents(list);
    } catch (err: any) {
      setLoadError(err?.message || 'Could not load incidents.');
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load the agency's real profile once.
  React.useEffect(() => {
    let cancelled = false;
    getAgencyProfile().then(p => { if (!cancelled && p) setProfile(p); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // (Re)load incidents whenever the available/mine filter changes.
  React.useEffect(() => { reload(incidentTab); }, [incidentTab, reload]);

  // Connect live WebSocket event listener (Pusher) for real-time dispatch updates
  useRealtimeEvents(
    profile?.id || 'agency',
    // onIncidentCreated
    (newInc) => {
      setIncidents(prev => {
        if (prev.some(x => x.ref === newInc.ref)) return prev;
        return [newInc, ...prev];
      });
    },
    // onIncidentUpdated
    (updatedInc) => {
      setIncidents(prev =>
        prev.map(x => x.ref === updatedInc.ref ? { ...x, ...updatedInc } : x)
      );
      setActiveIncident(prev => {
        if (prev && prev.ref === updatedInc.ref) {
          return { ...prev, ...updatedInc };
        }
        return prev;
      });
    }
  );

  const handleUpdateIncident = (ref: string, updates: Partial<Incident>) => {
    setIncidents(prev =>
      prev.map(x => x.ref === ref ? { ...x, ...updates } as Incident : x)
    );
    setActiveIncident(prev => {
      if (prev && prev.ref === ref) {
        return { ...prev, ...updates } as Incident;
      }
      return prev;
    });
  };

  // Scope every dashboard surface (cards, distribution, recent list, map,
  // reports) to the incident types this agency type actually responds to.
  // Unknown agency types fall through to all incidents (see isIncidentRelevant).
  const visibleIncidents = React.useMemo(
    () => incidents.filter(inc => isIncidentRelevant(inc.type, profile?.agencyType)),
    [incidents, profile?.agencyType]
  );

  return (
    <AgencyProfileContext.Provider value={profile}>
      <DashboardShell navigate={navigate} currentTab={tab} onTabChange={setTab}>
        {tab === 'overview' && <OverviewTab incidents={visibleIncidents} loading={loading} error={loadError} onRetry={() => reload(incidentTab)} onViewIncident={setActiveIncident} />}
        {tab === 'map' && <MapTab incidents={visibleIncidents} onViewIncident={setActiveIncident} />}
        {tab === 'reports' && (
          <ReportsTab
            incidents={visibleIncidents}
            loading={loading}
            error={loadError}
            onRetry={() => reload(incidentTab)}
            incidentTab={incidentTab}
            onIncidentTabChange={setIncidentTab}
            onViewIncident={setActiveIncident}
          />
        )}
        {tab === 'settings' && <SettingsTab />}
        {activeIncident && (
          <IncidentDetailPanel
            incident={activeIncident}
            onClose={() => setActiveIncident(null)}
            onUpdateIncident={handleUpdateIncident}
          />
        )}
      </DashboardShell>
    </AgencyProfileContext.Provider>
  );
}

function SettingsTab() {
  const isMobile = useIsMobile();
  const profile = useAgencyProfile();
  const typeLabel = profile?.agencyType ? (AGENCY_TYPE_LABELS[profile.agencyType] || profile.agencyType) : '';
  return (
    <div>
      <DashTopBar title="Settings" subtitle="Your agency profile" />
      <div style={{ padding: isMobile ? 16 : 32, maxWidth: 720 }}>
        <div style={{ background: 'var(--brand-white)', border: '1px solid var(--brand-hairline)', borderRadius: 12, padding: isMobile ? 20 : 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>Agency profile</h3>
          <p style={{ fontSize: 13, color: 'var(--brand-muted)', margin: '0 0 24px' }}>Visible to the public during incident assignment.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <FormInput label="Agency name" value={profile?.agencyName || ''} onChange={() => {}} disabled />
            <FormInput label="Agency type" value={typeLabel} onChange={() => {}} disabled />
            <FormInput label="Email" value={profile?.email || ''} onChange={() => {}} disabled />
            <FormInput label="Phone" value={profile?.phone || ''} onChange={() => {}} disabled />
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>Service coverage radius</label>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--status-red)' }}>{profile?.radius ?? 0} km</span>
              </div>
              <input type="range" min="5" max="100" value={profile?.radius ?? 25} disabled readOnly style={{ width: '100%', accentColor: 'var(--status-red)' }} />
            </div>
            <p style={{ fontSize: 12, color: 'var(--brand-muted)', margin: '6px 0 0' }}>
              Profile details are managed by your administrator and cannot be edited here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
