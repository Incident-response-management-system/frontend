import React from 'react';
import { toast } from 'sonner';
import {
  IRMSMark,
  Icon,
  INCIDENT_TYPES,
  StatusBadge,
  StatusStepper,
  PrimaryButton,
  GhostButton,
  SAMPLE_INCIDENTS,
  getIncidentType,
  Incident,
  IncidentStatus,
} from './irms-shared';
import { FormInput } from './irms-auth';
import { apiFetch } from '@/lib/api-client';
import { useRealtimeEvents } from '@/hooks/use-realtime';
import { useIsMobile, useIsTablet } from '@/hooks/use-media-query';

let L: any;
if (typeof window !== 'undefined') {
  L = require('leaflet');
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
          position: 'fixed', inset: 0, background: 'rgba(10,13,20,0.4)', zIndex: 1999,
        }}/>
      )}

      {/* Fixed hamburger button (drawer mode, drawer closed) */}
      {isTablet && !mobileOpen && (
        <button onClick={() => setMobileOpen(true)} aria-label="Open menu" style={{
          position: 'fixed', top: 14, left: 12, zIndex: 1500,
          width: 40, height: 40, borderRadius: 10,
          background: 'white', border: '1px solid var(--brand-hairline)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--brand-ink)', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
        </button>
      )}

      {/* SIDEBAR */}
      <aside style={{
        width: isTablet ? 248 : (collapsed ? 72 : 248), flexShrink: 0,
        background: 'white', borderRight: '1px solid var(--brand-hairline)',
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

        {/* Agency badge */}
        {!drawerCollapsed && (
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--brand-hairline)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9,
                background: 'var(--status-blue-bg)', border: '1px solid var(--status-blue-bd)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--status-blue)',
                fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-mono)',
              }}>RC</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>RCCG Camp Security</div>
                <div style={{ fontSize: 11, color: 'var(--brand-muted)' }}>Private Security · 25km</div>
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
                {active && !drawerCollapsed && <div style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 3, borderRadius: 3, background: 'var(--status-red)' }}/>}
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
  const padding = isMobile ? '18px 16px 18px 56px' : (isTablet ? '20px 20px 20px 60px' : '24px 32px');
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding, borderBottom: '1px solid var(--brand-hairline)', background: 'white',
    }}>
      <div>
        <h1 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, letterSpacing: '-0.015em', margin: '0 0 4px' }}>{title}</h1>
        {subtitle && <div style={{ fontSize: 13, color: 'var(--brand-muted)' }}>{subtitle}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {actions}
        <button style={{ position: 'relative', width: 38, height: 38, borderRadius: 10, border: '1px solid var(--brand-hairline)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-ink)', background: 'white', cursor: 'pointer' }}>
          <Icon.bell />
          <span style={{ position: 'absolute', top: 8, right: 9, width: 8, height: 8, borderRadius: '50%', background: 'var(--status-red)', border: '2px solid white' }}/>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 12, borderLeft: '1px solid var(--brand-hairline)' }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--brand-ink)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>AO</div>
          {!isMobile && (
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Adebayo Olamide</div>
              <div style={{ fontSize: 11, color: 'var(--brand-muted)' }}>Dispatch Lead</div>
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
export function OverviewTab({ incidents, onViewIncident }: { incidents: Incident[]; onViewIncident: (inc: Incident) => void }) {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const [stats, setStats] = React.useState([
    { label: 'Total Incidents', value: incidents.length.toString(), delta: '+12 today', color: 'var(--brand-ink)', accent: 'var(--brand-hairline)' },
    { label: 'Open Incidents', value: incidents.filter(r => r.status !== 'resolved').length.toString(), delta: `${incidents.filter(r => r.status === 'received').length} unassigned`, color: 'var(--status-red)', accent: 'var(--status-red-bd)' },
    { label: 'Assigned to Us', value: incidents.filter(r => r.assignedTo && r.status === 'assigned').length.toString(), delta: '2 in progress', color: 'var(--status-amber)', accent: 'var(--status-amber-bd)' },
    { label: 'Resolved This Month', value: incidents.filter(r => r.status === 'resolved').length.toString(), delta: '+18% vs last', color: 'var(--status-green)', accent: 'var(--status-green-bd)' },
  ]);
  const [sparklinePath, setSparklinePath] = React.useState("M0 50 L40 35 L80 42 L120 28 L160 38 L200 22 L240 30 L280 18");
  const [pointsList, setPointsList] = React.useState([[0,50],[40,35],[80,42],[120,28],[160,38],[200,22],[240,30],[280,18]]);

  React.useEffect(() => {
    // Sync calculations based on dynamic incidents state
    setStats([
      { label: 'Total Incidents', value: incidents.length.toString(), delta: '+2 today', color: 'var(--brand-ink)', accent: 'var(--brand-hairline)' },
      { label: 'Open Incidents', value: incidents.filter(r => r.status !== 'resolved').length.toString(), delta: `${incidents.filter(r => r.status === 'received').length} unassigned`, color: 'var(--status-red)', accent: 'var(--status-red-bd)' },
      { label: 'Assigned to Us', value: incidents.filter(r => r.assignedTo?.includes('RCCG') || r.assignedTo?.includes('Camp')).length.toString(), delta: '2 in progress', color: 'var(--status-amber)', accent: 'var(--status-amber-bd)' },
      { label: 'Resolved This Month', value: incidents.filter(r => r.status === 'resolved').length.toString(), delta: '+18% vs last', color: 'var(--status-green)', accent: 'var(--status-green-bd)' },
    ]);

    async function loadStats() {
      try {
        const res = await apiFetch('/agency/stats');
        if (res.ok) {
          const data = await res.json();
          if (data.stats) setStats(data.stats);
          if (data.sparkline) {
            const points = data.sparkline.map((val: number, i: number) => {
              const x = (i / (data.sparkline.length - 1)) * 280;
              const y = 80 - ((val / 10) * 50 + 15);
              return [x, y];
            });
            setPointsList(points);
            let pathStr = `M ${points[0][0]} ${points[0][1]}`;
            for (let i = 0; i < points.length - 1; i++) {
              const p0 = points[i];
              const p1 = points[i+1];
              const cpX = (p0[0] + p1[0]) / 2;
              pathStr += ` C ${cpX} ${p0[1]}, ${cpX} ${p1[1]}, ${p1[0]} ${p1[1]}`;
            }
            setSparklinePath(pathStr);
          }
        }
      } catch (err) {
        // Safe silent catch: use the calculated offline stats
      }
    }
    loadStats();
  }, [incidents]);

  return (
    <div>
      <DashTopBar
        title="Operations overview"
        subtitle="Live incidents across your service radius · Updated 12s ago"
        actions={<GhostButton theme="light" size="sm"><Icon.filter /> Today</GhostButton>}
      />

      <div style={{ padding: isMobile ? 16 : 32 }}>
        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              background: 'white', border: `1px solid var(--brand-hairline)`,
              borderRadius: 12, padding: 20, position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.color, opacity: 0.9 }}/>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <span style={{ fontSize: 12, color: 'var(--brand-muted)', fontWeight: 600, letterSpacing: '0.02em', textTransform: 'uppercase' }}>{s.label}</span>
              </div>
              <div style={{ fontSize: isMobile ? 28 : 36, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1, fontFamily: 'var(--font-mono)', color: 'var(--brand-ink)' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: s.color, marginTop: 8, fontWeight: 500 }}>{s.delta}</div>
            </div>
          ))}
        </div>

        {/* Activity feed + heatmap row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 32 }}>
          {/* Incident distribution */}
          <div style={{ background: 'white', border: '1px solid var(--brand-hairline)', borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 4px' }}>Incident distribution</h3>
                <div style={{ fontSize: 12, color: 'var(--brand-muted)' }}>Last 30 days · By type</div>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--brand-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--status-red)' }}/> Open</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--status-green)' }}/> Resolved</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { type: 'medical', label: 'Medical Emergency', open: incidents.filter(r => r.type === 'medical' && r.status !== 'resolved').length || 8, resolved: incidents.filter(r => r.type === 'medical' && r.status === 'resolved').length || 34 },
                { type: 'rta', label: 'Road Traffic Accident', open: incidents.filter(r => r.type === 'rta' && r.status !== 'resolved').length || 5, resolved: incidents.filter(r => r.type === 'rta' && r.status === 'resolved').length || 28 },
                { type: 'civil', label: 'Civil Disturbance', open: incidents.filter(r => r.type === 'civil' && r.status !== 'resolved').length || 4, resolved: incidents.filter(r => r.type === 'civil' && r.status === 'resolved').length || 19 },
                { type: 'fire', label: 'Fire Outbreak', open: incidents.filter(r => r.type === 'fire' && r.status !== 'resolved').length || 3, resolved: incidents.filter(r => r.type === 'fire' && r.status === 'resolved').length || 12 },
                { type: 'flood', label: 'Flood Incident', open: incidents.filter(r => r.type === 'flood' && r.status !== 'resolved').length || 2, resolved: incidents.filter(r => r.type === 'flood' && r.status === 'resolved').length || 14 },
                { type: 'missing', label: 'Missing Person', open: incidents.filter(r => r.type === 'missing' && r.status !== 'resolved').length || 1, resolved: incidents.filter(r => r.type === 'missing' && r.status === 'resolved').length || 12 },
              ].map(r => {
                const total = r.open + r.resolved;
                const max = 42;
                return (
                  <div key={r.type} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 60px', gap: 12, alignItems: 'center' }}>
                    <div style={{ fontSize: 13, color: 'var(--brand-ink)', fontWeight: 500 }}>{r.label}</div>
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

          {/* Response times */}
          <div style={{ background: 'white', border: '1px solid var(--brand-hairline)', borderRadius: 12, padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 4px' }}>Response performance</h3>
            <div style={{ fontSize: 12, color: 'var(--brand-muted)', marginBottom: 24 }}>This week</div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 40, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1 }}>3m 42s</div>
              <div style={{ fontSize: 12, color: 'var(--status-green)', fontWeight: 600, marginTop: 6 }}>↓ 22s faster than last week</div>
            </div>
            {/* Sparkline */}
            <svg viewBox="0 0 280 80" style={{ width: '100%', height: 80 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--status-red)" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="var(--status-red)" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <path d={`${sparklinePath} L280 80 L0 80 Z`} fill="url(#grad)"/>
              <path d={sparklinePath} stroke="var(--status-red)" strokeWidth="2" fill="none" strokeLinejoin="round" strokeLinecap="round"/>
              {pointsList.map(([x,y],i) => (
                <circle key={i} cx={x} cy={y} r="2.5" fill="var(--status-red)" />
              ))}
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--brand-muted)', fontFamily: 'var(--font-mono)', marginTop: 6 }}>
              <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
            </div>
          </div>
        </div>

        {/* Recent incidents table */}
        <div style={{ background: 'white', border: '1px solid var(--brand-hairline)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--brand-hairline)' }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 4px' }}>Recent incidents</h3>
              <div style={{ fontSize: 12, color: 'var(--brand-muted)' }}>Showing the 6 most recent reports in your radius</div>
            </div>
            <GhostButton theme="light" size="sm">View all →</GhostButton>
          </div>
          <IncidentsTable rows={incidents.slice(0, 6)} onView={onViewIncident} />
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
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--brand-cream)', borderBottom: '1px solid var(--brand-hairline)' }}>
            {['Reference', 'Type', 'Location', 'Status', 'Reported', showAssigned && 'Assigned to', 'Action'].filter(Boolean).map(h => (
              <th key={h as string} style={{
                padding: '12px 24px', textAlign: 'left', fontSize: 11, fontWeight: 600,
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
                <td style={{ padding: '14px 24px', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600 }}>{r.ref}</td>
                <td style={{ padding: '14px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: 7, flexShrink: 0,
                      background: 'var(--brand-cream)', border: '1px solid var(--brand-hairline)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-ink)',
                    }}><t.icon style={{ width: 16, height: 16 }} /></div>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{t.short}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 24px', fontSize: 13, color: 'var(--brand-ink)', maxWidth: 260 }}>{r.location}</td>
                <td style={{ padding: '14px 24px' }}><StatusBadge status={r.status} size="sm"/></td>
                <td style={{ padding: '14px 24px', fontSize: 12, color: 'var(--brand-muted)', fontFamily: 'var(--font-mono)' }}>{r.reported}</td>
                {showAssigned && <td style={{ padding: '14px 24px', fontSize: 13, color: r.assignedTo ? 'var(--brand-ink)' : 'var(--brand-muted)' }}>{r.assignedTo || '— unassigned'}</td>}
                <td style={{ padding: '14px 24px', textAlign: 'right' }}>
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
  const mapRef = React.useRef<HTMLDivElement>(null);
  const mapInstance = React.useRef<any>(null);
  const markersRef = React.useRef<any[]>([]);
  const tileLayerRef = React.useRef<any>(null);
  const gpsMarkerRef = React.useRef<any>(null);
  const gpsCircleRef = React.useRef<any>(null);

  const [layerType, setLayerType] = React.useState<'satellite' | 'streets'>('satellite');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searching, setSearching] = React.useState(false);

  React.useEffect(() => {
    if (!mapRef.current || mapInstance.current || !L) return;
    const map = L.map(mapRef.current, { zoomControl: false }).setView([6.8912, 3.1720], 14);
    L.control.zoom({ position: 'topright' }).addTo(map);

    const initialTileUrl = layerType === 'satellite'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    const initialAttr = layerType === 'satellite'
      ? 'Tiles &copy; Esri &mdash; Source: Esri, USDA, USGS'
      : '© OpenStreetMap, © CARTO';

    const tileLayer = L.tileLayer(initialTileUrl, {
      attribution: initialAttr,
      maxZoom: 22,
      maxNativeZoom: layerType === 'satellite' ? 18 : 19,
    }).addTo(map);
    tileLayerRef.current = tileLayer;

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

    incidents.forEach(inc => {
      const icon = L.divIcon({
        html: `<div class="irms-marker ${inc.status}"></div>`,
        className: '', iconSize: [26, 26], iconAnchor: [13, 26],
      });
      const marker = L.marker([inc.lat, inc.lng], { icon }).addTo(map);
      marker.on('click', () => onViewIncident(inc));
      markersRef.current.push(marker);
    });
  }, [incidents]);

  // Update map layer dynamically
  React.useEffect(() => {
    if (!mapInstance.current || !L || !tileLayerRef.current) return;
    const map = mapInstance.current;
    tileLayerRef.current.remove();

    const tileUrl = layerType === 'satellite'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    const attr = layerType === 'satellite'
      ? 'Tiles &copy; Esri &mdash; Source: Esri, USDA, USGS'
      : '© OpenStreetMap, © CARTO';

    const tileLayer = L.tileLayer(tileUrl, {
      attribution: attr,
      maxZoom: 22,
      maxNativeZoom: layerType === 'satellite' ? 18 : 19,
    }).addTo(map);
    tileLayerRef.current = tileLayer;
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <DashTopBar
        title="Live map"
        subtitle={`${SAMPLE_INCIDENTS.length} incidents · 25km service radius`}
        actions={null}
      />
      {/* Filter toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '12px 32px',
        background: 'white', borderBottom: '1px solid var(--brand-hairline)',
      }}>
        <FilterDropdown label="Incident Type" options={INCIDENT_TYPES.map(t => t.label)} />
        <FilterDropdown label="Status" options={['Received', 'Under Review', 'Assigned', 'Resolved']} />
        <button style={{ fontSize: 13, color: 'var(--brand-muted)', fontWeight: 500, padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer' }}>Reset filters</button>
        <div style={{ flex: 1 }}/>
        <div style={{ fontSize: 12, color: 'var(--brand-muted)', fontFamily: 'var(--font-mono)' }}>
          REDEMPTION CAMP · 6.8932° N · 3.1721° E
        </div>
      </div>

      {/* Map */}
      <div style={{ flex: 1, position: 'relative' }}>
        <div ref={mapRef} style={{ position: 'absolute', inset: 0 }} />

        {/* Floating Geosearch Bar */}
        <form onSubmit={handleSearch} className="irms-map-search-container" style={{
          position: 'absolute', top: 20, right: 20, zIndex: 1000,
          width: 300, maxWidth: 'calc(100vw - 40px)'
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
              <polygon points="12 2 2 7 12 12 22 7 12 2"/>
              <polyline points="2 17 12 22 22 17"/>
              <polyline points="2 12 12 17 22 12"/>
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
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="3"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
            </svg>
          </button>
        </div>

        {/* Legend - positioned bottom-left to prevent overlap with controls */}
        <div style={{
          position: 'absolute', bottom: 20, left: 20, zIndex: 500,
          background: 'white', border: '1px solid var(--brand-hairline)', borderRadius: 12, padding: '14px 16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--brand-muted)', letterSpacing: '0.12em', marginBottom: 10 }}>LEGEND</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { c: 'var(--status-red)', l: 'Received' },
              { c: 'var(--status-amber)', l: 'Under Review' },
              { c: 'var(--status-blue)', l: 'Assigned' },
              { c: 'var(--status-green)', l: 'Resolved' },
            ].map(x => (
              <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--brand-ink)' }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: x.c, border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}/>
                {x.l}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterDropdown({ label, options }: { label: string; options: string[] }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
        borderRadius: 9, border: '1px solid var(--brand-hairline)', background: 'white',
        fontSize: 13, fontWeight: 500, color: 'var(--brand-ink)', cursor: 'pointer'
      }}>
        {label} <Icon.chevDown />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 100 }}/>
          <div style={{
            position: 'absolute', top: '100%', left: 0, marginTop: 6, zIndex: 200,
            background: 'white', border: '1px solid var(--brand-hairline)', borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)', minWidth: 200, padding: 6,
          }}>
            {options.map(o => (
              <label key={o} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 7, fontSize: 13, cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-cream)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <input type="checkbox" style={{ accentColor: 'var(--status-red)' }} />
                {o}
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// -----------------------------------------------------------
// SCREEN 9 — ALL REPORTS
// -----------------------------------------------------------
export function ReportsTab({ incidents, onViewIncident }: { incidents: Incident[]; onViewIncident: (inc: Incident) => void }) {
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>([]);

  // Client-side paginated & filtered list (syncs live with parent state)
  const filtered = incidents.filter(r => {
    const matchesSearch = !search || 
      r.ref.toLowerCase().includes(search.toLowerCase()) ||
      r.location.toLowerCase().includes(search.toLowerCase()) ||
      getIncidentType(r.type).label.toLowerCase().includes(search.toLowerCase()) ||
      (r.desc && r.desc.toLowerCase().includes(search.toLowerCase()));
      
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(r.type);
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
      <div style={{ padding: 32 }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{
            flex: 1, minWidth: 260, display: 'flex', alignItems: 'center', gap: 10,
            padding: '0 14px', background: 'white', border: '1px solid var(--brand-hairline)', borderRadius: 10,
          }}>
            <Icon.search style={{ color: 'var(--brand-muted)' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by reference, type, or location..."
              style={{ flex: 1, padding: '10px 0', border: 'none', outline: 'none', fontSize: 14, background: 'transparent' }}
            />
          </div>
          
          {/* Custom multi-field filters */}
          <div style={{ display: 'flex', gap: 8 }}>
            {INCIDENT_TYPES.map(t => {
              const active = selectedTypes.includes(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => toggleTypeFilter(t.id)}
                  style={{
                    padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                    background: active ? 'var(--brand-ink)' : 'white',
                    color: active ? 'var(--brand-cream)' : 'var(--brand-muted)',
                    border: '1px solid var(--brand-hairline)', cursor: 'pointer', transition: 'all 0.15s'
                  }}
                >
                  {t.short}
                </button>
              );
            })}
            
            {['received', 'review', 'assigned', 'resolved'].map(s => {
              const active = selectedStatuses.includes(s);
              const labelMap: Record<string, string> = { received: 'Received', review: 'Review', assigned: 'Assigned', resolved: 'Resolved' };
              return (
                <button
                  key={s}
                  onClick={() => toggleStatusFilter(s)}
                  style={{
                    padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                    background: active ? 'var(--status-red)' : 'white',
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

        <div style={{ background: 'white', border: '1px solid var(--brand-hairline)', borderRadius: 12, overflow: 'hidden' }}>
          <IncidentsTable rows={paginatedRows} onView={onViewIncident} showAssigned />
          {/* Pagination controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid var(--brand-hairline)' }}>
            <div style={{ fontSize: 12, color: 'var(--brand-muted)' }}>
              Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1} – {Math.min(page * pageSize, filtered.length)} of {filtered.length}
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
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
                      background: n === page ? 'var(--status-red)' : 'white',
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
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------
// SCREEN 7 — INCIDENT DETAIL PANEL (slide-in from right)
// -----------------------------------------------------------
export function IncidentDetailPanel({ incident, onClose, onUpdateIncident }: { incident: Incident; onClose: () => void; onUpdateIncident: (ref: string, updates: Partial<Incident>) => void }) {
  const [status, setStatus] = React.useState<IncidentStatus>(incident.status);
  const [assigned, setAssigned] = React.useState(!!incident.assignedTo);
  const t = getIncidentType(incident.type);

  React.useEffect(() => {
    setStatus(incident.status);
    setAssigned(!!incident.assignedTo);
  }, [incident]);

  const handleAssign = async () => {
    try {
      const res = await apiFetch(`/agency/incidents/${incident.ref}/assign`, { method: 'POST' });
      if (res.ok) {
        toast.success(`Incident ${incident.ref} assigned successfully!`);
      } else {
        toast.info(`Incident ${incident.ref} assigned to RCCG Camp Security (Offline Mode).`);
      }
    } catch (err) {
      toast.info(`Incident ${incident.ref} assigned to RCCG Camp Security (Offline Mode).`);
    }
    setAssigned(true);
    setStatus('assigned');
    onUpdateIncident(incident.ref, { assignedTo: 'RCCG Camp Security', status: 'assigned' });
  };

  const handleStatusUpdate = async () => {
    try {
      const res = await apiFetch(`/agency/incidents/${incident.ref}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(`Incident ${incident.ref} status updated to "${status}"!`);
      } else {
        toast.success(`Incident ${incident.ref} status updated to "${status.charAt(0).toUpperCase() + status.slice(1)}" (Offline Mode)!`);
      }
    } catch (err) {
      toast.success(`Incident ${incident.ref} status updated to "${status.charAt(0).toUpperCase() + status.slice(1)}" (Offline Mode)!`);
    }
    onUpdateIncident(incident.ref, { status });
  };

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(10,13,20,0.4)', zIndex: 1500,
        animation: 'fadeIn 0.2s ease-out',
      }}/>
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(620px, 92vw)',
        background: 'white', zIndex: 1600, overflowY: 'auto',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.15)',
        animation: 'slideRight 0.3s cubic-bezier(.2,.8,.2,1)',
      }}>
        {/* Header */}
        <div style={{
          position: 'sticky', top: 0, background: 'white', zIndex: 10,
          padding: '24px 32px 16px', borderBottom: '1px solid var(--brand-hairline)',
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

        <div style={{ padding: '24px 32px 40px' }}>
          {/* Status stepper */}
          <div style={{ padding: '20px 4px', marginBottom: 24, borderBottom: '1px solid var(--brand-hairline)' }}>
            <StatusStepper current={status} theme="light"
              timestamps={{
                received: incident.reportedAt.split('·')[1]?.trim() || '14:32',
                review: status === 'review' || status === 'assigned' || status === 'resolved' ? '14:38' : null,
                assigned: status === 'assigned' || status === 'resolved' ? '14:51' : null,
                resolved: status === 'resolved' ? '15:12' : null,
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {Array.from({ length: incident.media }).map((_, i) => (
                  <div key={i} style={{
                    aspectRatio: '1', borderRadius: 10, overflow: 'hidden',
                    background: `linear-gradient(135deg, oklch(0.6 0.1 ${i*60+30}), oklch(0.4 0.08 ${i*60+60}))`,
                    border: '1px solid var(--brand-hairline)', position: 'relative', cursor: 'pointer',
                  }}>
                    <div style={{ position: 'absolute', bottom: 6, left: 8, color: 'white', fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>IMG_{i+1}.JPG</div>
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
                  Assign to RCCG Camp Security <Icon.arrow />
                </button>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--status-blue)' }}/>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--status-blue)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Assigned to your agency</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>{incident.assignedTo || 'RCCG Camp Security'}</div>

                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>UPDATE INCIDENT STATUS</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 16, padding: 4, background: 'white', borderRadius: 10, border: '1px solid var(--brand-hairline)' }}>
                  {(['received', 'review', 'assigned', 'resolved'] as IncidentStatus[]).map(s => {
                    const map = { received: { c: 'var(--status-red)', bg: 'var(--status-red-bg)', l: 'Received' },
                                  review: { c: 'var(--status-amber)', bg: 'var(--status-amber-bg)', l: 'Under Review' },
                                  assigned: { c: 'var(--status-blue)', bg: 'var(--status-blue-bg)', l: 'Assigned' },
                                  resolved: { c: 'var(--status-green)', bg: 'var(--status-green-bg)', l: 'Resolved' } };
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
                <div style={{ fontSize: 11, color: 'var(--brand-muted)', marginTop: 12, textAlign: 'center' }}>
                  Last updated: Today at 4:15 PM by Adebayo Olamide
                </div>
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
  const [incidents, setIncidents] = React.useState<Incident[]>(SAMPLE_INCIDENTS);

  React.useEffect(() => {
    document.body.classList.add('light');

    // Fetch initial reports list from the backend
    async function loadIncidents() {
      try {
        const res = await apiFetch('/agency/incidents');
        if (res.ok) {
          const data = await res.json();
          if (data.incidents) setIncidents(data.incidents);
        }
      } catch (err) {
        // Soft fallback to pre-seeded incidents on offline/sandbox
      }
    }
    loadIncidents();

    return () => document.body.classList.remove('light');
  }, []);

  // Connect live WebSocket event listener (Pusher) for real-time dispatch updates
  useRealtimeEvents(
    'rccg-camp-ops',
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

  return (
    <DashboardShell navigate={navigate} currentTab={tab} onTabChange={setTab}>
      {tab === 'overview' && <OverviewTab incidents={incidents} onViewIncident={setActiveIncident} />}
      {tab === 'map' && <MapTab incidents={incidents} onViewIncident={setActiveIncident} />}
      {tab === 'reports' && <ReportsTab incidents={incidents} onViewIncident={setActiveIncident} />}
      {tab === 'settings' && <SettingsTab />}
      {activeIncident && (
        <IncidentDetailPanel 
          incident={activeIncident} 
          onClose={() => setActiveIncident(null)} 
          onUpdateIncident={handleUpdateIncident}
        />
      )}
    </DashboardShell>
  );
}

function SettingsTab() {
  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };
  return (
    <div>
      <DashTopBar title="Settings" subtitle="Manage your agency profile and notification preferences" />
      <div style={{ padding: 32, maxWidth: 720 }}>
        <div style={{ background: 'white', border: '1px solid var(--brand-hairline)', borderRadius: 12, padding: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>Agency profile</h3>
          <p style={{ fontSize: 13, color: 'var(--brand-muted)', margin: '0 0 24px' }}>Visible to the public during incident assignment.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <FormInput label="Agency name" value="RCCG Camp Security" onChange={() => {}} />
            <FormInput label="Email" value="ops@rccg-security.org" onChange={() => {}} />
            <FormInput label="Phone" value="+234 803 555 0142" onChange={() => {}} />
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>Service coverage radius</label>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--status-red)' }}>25 km</span>
              </div>
              <input type="range" min="5" max="100" defaultValue="25" style={{ width: '100%', accentColor: 'var(--status-red)' }} />
            </div>
            <button onClick={handleSave} style={{
              background: 'var(--brand-ink)', color: 'var(--brand-cream)', padding: '11px 18px', borderRadius: 9,
              fontWeight: 600, fontSize: 14, width: '100%', border: 'none', cursor: 'pointer', marginTop: 10
            }}>Save settings</button>
          </div>
        </div>
      </div>
    </div>
  );
}
