import React from 'react';
import { Icon, TableRowSkeleton, GhostButton } from '@/components/irms-shared';
import type { Incident } from '@/components/irms-shared';
import { DashEmptyState } from '../DashEmptyState';
import { IncidentsTable } from '../IncidentsTable';
import { DashTopBar } from '../DashTopBar';
import { useAgencyProfile } from '../context';
import { useIsMobile, useIsTablet } from '@/hooks/use-media-query';
import { fetchAgencyStats } from '@/lib/agency-api';
import { incidentTypesForAgency } from '@/lib/agency-types';

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
            {(() => {
              const rows = distributionRows.map(({ type, label }) => {
                const open = incidents.filter(r => r.type === type && r.status !== 'resolved' && r.status !== 'closed').length;
                const resolved = incidents.filter(r => r.type === type && (r.status === 'resolved' || r.status === 'closed')).length;
                return { type, label, open, resolved, total: open + resolved };
              });
              const max = Math.max(1, ...rows.map(r => r.total));
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {rows.map(r => (
                    <div key={r.type} style={{ display: 'grid', gridTemplateColumns: isMobile ? '80px 1fr 32px' : '140px 1fr 60px', gap: isMobile ? 8 : 12, alignItems: 'center' }}>
                      <div style={{ fontSize: isMobile ? 11 : 13, color: 'var(--brand-ink)', fontWeight: 500 }}>{r.label}</div>
                      <div style={{ display: 'flex', height: 22, borderRadius: 4, overflow: 'hidden', background: 'var(--brand-cream)' }}>
                        {r.open > 0 && <div style={{ width: `${(r.open / max) * 100}%`, background: 'var(--status-red)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: r.open > 0 ? 6 : 0, fontSize: 10, fontWeight: 600, color: 'white', minWidth: 0 }}>{r.open}</div>}
                        {r.resolved > 0 && <div style={{ width: `${(r.resolved / max) * 100}%`, background: 'var(--status-green)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: r.resolved > 0 ? 6 : 0, fontSize: 10, fontWeight: 600, color: 'white', minWidth: 0 }}>{r.resolved}</div>}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, textAlign: 'right' }}>{r.total}</div>
                    </div>
                  ))}
                </div>
              );
            })()}
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
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>{[0,1,2,3,4].map(i => <TableRowSkeleton key={i} cols={6} />)}</tbody>
              </table>
            </div>
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
