import React from 'react';
import { toast } from 'sonner';
import { AgencyProfileContext } from './context';
import { DashboardShell } from './DashboardShell';
import { DashTopBar } from './DashTopBar';
import { OverviewTab } from './tabs/OverviewTab';
import { MapTab } from './tabs/MapTab';
import { ReportsTab } from './tabs/ReportsTab';
import { SettingsTab } from './tabs/SettingsTab';
import { IncidentDetailPanel } from './IncidentDetailPanel';
import type { Incident } from '@/components/irms-shared';
import { fetchAgencyIncidents, type IncidentTab } from '@/lib/agency-api';
import { getAgencyProfile } from '@/lib/auth-api';
import { isIncidentRelevant } from '@/lib/agency-types';
import { useSSEIncidents } from '@/hooks/use-sse-incidents';
import type { AgencyUser } from '@/lib/auth-api';

export function DashboardScreen({ navigate, initialTab = 'overview' }: { navigate: (to: string) => void; initialTab?: string }) {
  const [tab, setTab] = React.useState(initialTab);
  const [activeIncident, setActiveIncident] = React.useState<Incident | null>(null);
  const [incidents, setIncidents] = React.useState<Incident[]>([]);
  const [incidentTab, setIncidentTab] = React.useState<IncidentTab>('all');
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [profile, setProfile] = React.useState<AgencyUser | null>(null);

  // Fallback fetch — used on first mount and when SSE fails.
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

  // Initial load while SSE hasn't connected yet.
  React.useEffect(() => { reload(incidentTab); }, [incidentTab, reload]);

  // SSE — replaces 15s polling and Pusher stub.
  // The server sends a full snapshot on connect, then pushes diffs every 5 s.
  // Re-connects automatically on error (exponential backoff) and every 5 min for a fresh snapshot.
  useSSEIncidents(
    {
      onSnapshot: (incs) => {
        setIncidents(incs);
        setLoading(false);
        setLoadError(null);
      },
      onCreated: (inc) => {
        setIncidents(prev => prev.some(x => x.ref === inc.ref) ? prev : [inc, ...prev]);
        toast.warning('New incident received', {
          description: inc.location,
          duration: 6000,
        });
      },
      onUpdated: (inc) => {
        setIncidents(prev => prev.map(x => x.ref === inc.ref ? { ...x, ...inc } : x));
        setActiveIncident(prev => prev?.ref === inc.ref ? { ...prev, ...inc } : prev);
      },
      onError: () => {
        // SSE dropped — fall back to a one-time fetch so the list stays fresh.
        reload(incidentTab);
      },
    },
    incidentTab,
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
