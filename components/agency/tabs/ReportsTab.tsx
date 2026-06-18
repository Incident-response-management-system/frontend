import React from 'react';
import { Icon, TableRowSkeleton, GhostButton, INCIDENT_TYPES } from '@/components/irms-shared';
import type { Incident } from '@/components/irms-shared';
import { DashEmptyState } from '../DashEmptyState';
import { IncidentsTable } from '../IncidentsTable';
import { useAgencyProfile } from '../context';
import { useIsMobile } from '@/hooks/use-media-query';
import { DashTopBar } from '../DashTopBar';
import { isIncidentRelevant, toBeType, toFeType } from '@/lib/agency-types';
import { getIncidentType } from '@/components/irms-shared';
import type { IncidentTab } from '@/lib/agency-api';

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
    const st = r.status === 'closed' ? 'resolved' : r.status;
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(st);

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
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>{[0,1,2,3,4,5].map(i => <TableRowSkeleton key={i} cols={7} />)}</tbody>
              </table>
            </div>
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
