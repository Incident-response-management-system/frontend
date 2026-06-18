/**
 * Agency dashboard API service.
 * Talks to the real backend (see the Frontend API Guide):
 *   GET   /incidents/agencies/incidents/?tab=available|mine
 *   PATCH /incidents/{id}/                 { status }
 *   GET   /incidents/agencies/stats/?year=&month=
 *
 * The agency JWT is injected automatically by `apiFetch` from the
 * `agency_token` cookie. All responses are mapped from the backend shape
 * into the frontend `Incident` shape the dashboard renders.
 */

import { apiFetch, extractApiError } from './api-client';
import type { Incident } from '@/components/irms-shared';
import {
  mapBackendIncident,
  toBeStatus,
  type BackendIncident,
} from './agency-types';
import type { IncidentStatus } from '@/components/irms-shared';
import { getAgencyProfile, type AgencyUser } from './auth-api';

export type IncidentTab = 'available' | 'mine' | 'all';

export interface AgencyStats {
  totalThisMonth: number;
  resolvedThisMonth: number;
  pending: number;
  assigned: number;
  inProgress: number;
  closed: number;
  assignedToAgency: number;
  byIncidentType: Array<{ incidentType: string; count: number }>;
}

// ─── List incidents ──────────────────────────────────────────

export async function fetchAgencyIncidents(tab: IncidentTab = 'all'): Promise<Incident[]> {
  const query = tab === 'all' ? '' : `?tab=${tab}`;
  const res = await apiFetch(`/incidents/agencies/incidents/${query}`, { tokenType: 'agency' });
  if (!res.ok) throw new Error('Failed to load incidents');
  const data = await res.json();
  const results: BackendIncident[] = data.results || [];
  return results.map((b) => mapBackendIncident(b));
}

// ─── Update incident status (claim + progress) ───────────────
//
// `incidentId` is the backend UUID (Incident.id). The backend enforces the
// strict flow pending -> in_progress -> assigned -> resolved | closed, so the
// caller passes the desired next FE status and we translate it.

export async function updateIncidentStatus(
  incidentId: string,
  nextStatus: IncidentStatus,
): Promise<Incident> {
  const res = await apiFetch(`/incidents/${incidentId}/`, {
    method: 'PATCH',
    body: JSON.stringify({ status: toBeStatus(nextStatus) }),
    tokenType: 'agency',
  });
  if (!res.ok) {
    throw new Error(await extractApiError(res, 'Could not update this incident.'));
  }
  const data = await res.json();
  return mapBackendIncident(data.incident as BackendIncident);
}

// ─── Update agency profile ───────────────────────────────────

export interface AgencyProfileUpdatePayload {
  agency_name?: string;
  phone_number?: string;
  service_radius?: number;
  latitude?: number;
  longitude?: number;
}

export async function updateAgencyProfile(payload: AgencyProfileUpdatePayload): Promise<AgencyUser> {
  const res = await apiFetch('/auth/agency/me/update/', {
    method: 'PATCH',
    body: JSON.stringify(payload),
    tokenType: 'agency',
  });
  if (!res.ok) {
    throw new Error(await extractApiError(res, 'Could not update profile.'));
  }
  const data = await res.json();
  const a = data.agency || data;
  return {
    id: a.id || '',
    agencyName: a.agency_name || '',
    agencyType: a.agency_type || '',
    email: a.email || '',
    phone: a.phone_number,
    radius: a.profile?.service_radius ?? 0,
    lat: a.profile?.latitude_display ?? undefined,
    lng: a.profile?.longitude_display ?? undefined,
    token: '',
  };
}

// ─── Dashboard stats ─────────────────────────────────────────

export async function fetchAgencyStats(year?: number, month?: number): Promise<AgencyStats> {
  const params = new URLSearchParams();
  if (year) params.set('year', String(year));
  if (month) params.set('month', String(month));
  const qs = params.toString() ? `?${params.toString()}` : '';
  const res = await apiFetch(`/incidents/agencies/stats/${qs}`, { tokenType: 'agency' });
  if (!res.ok) throw new Error('Failed to load stats');
  const d = await res.json();
  return {
    totalThisMonth: d.total_this_month ?? 0,
    resolvedThisMonth: d.resolved_this_month ?? 0,
    pending: d.pending ?? 0,
    assigned: d.assigned ?? 0,
    inProgress: d.in_progress ?? 0,
    closed: d.closed ?? 0,
    assignedToAgency: d.assigned_to_agency ?? 0,
    byIncidentType: (d.by_incident_type ?? []).map((x: { incident_type: string; count: number }) => ({
      incidentType: x.incident_type,
      count: x.count,
    })),
  };
}
