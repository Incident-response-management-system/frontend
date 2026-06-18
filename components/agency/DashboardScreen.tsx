import React from 'react';
import { useAutoRefresh } from '@/hooks/use-auto-refresh';
import { AgencyProfileContext } from './context';
import { DashboardShell } from './DashboardShell';
import { DashTopBar } from './DashTopBar';
import { OverviewTab } from './tabs/OverviewTab';
import { MapTab } from './tabs/MapTab';
import { ReportsTab } from './tabs/ReportsTab';
import { SettingsTab } from './tabs/SettingsTab';
import { IncidentDetailPanel } from './IncidentDetailPanel';
import type { Incident } from '@/components/irms-shared';
import { fetchAgencyIncidents, fetchAgencyStats, updateIncidentStatus, type IncidentTab } from '@/lib/agency-api';
import { getAgencyProfile } from '@/lib/auth-api';
import { isIncidentRelevant, incidentTypesForAgency, mapBackendIncident } from '@/lib/agency-types';
import { useRealtimeEvents } from '@/hooks/use-realtime';
import type { AgencyUser } from '@/lib/auth-api';

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
        const mapped = mapBackendIncident(newInc);
        if (prev.some(x => x.ref === mapped.ref)) return prev;
        return [mapped, ...prev];
      });
    },
    // onIncidentUpdated
    (updatedInc) => {
      setIncidents(prev => {
        const mapped = mapBackendIncident(updatedInc);
        return prev.map(x => x.ref === mapped.ref ? { ...x, ...mapped } : x);
      });
      setActiveIncident(prev => {
        const mapped = mapBackendIncident(updatedInc);
        if (prev && prev.ref === mapped.ref) {
          return { ...prev, ...mapped };
        }
        return prev;
      });
    }
  );

  // Poll every 30 s and re-fetch whenever an incident is created or updated anywhere in the app.
  useAutoRefresh(
    React.useCallback(() => reload(incidentTab), [incidentTab, reload]),
    30_000,
    ['irms:report_created', 'irms:incident_updated'],
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
  const visibleIncidents = React.useMemo(() => {
    const filtered = incidents.filter(inc => isIncidentRelevant(inc.type, profile?.agencyType));
    console.log(`[IRMS Agency] Filtered list: ${filtered.length} of ${incidents.length} incidents relevant to ${profile?.agencyType || 'unknown'}`);
    return filtered;
  }, [incidents, profile?.agencyType]);

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
        {tab === 'settings' && <SettingsTab onProfileSaved={setProfile} />}
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
