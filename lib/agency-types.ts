/**
 * Agency-side backend types and FE<->BE mapping helpers.
 *
 * The backend and the frontend use different vocabularies for incident status
 * and incident type. This module is the single place that translates between
 * them, plus the adapter that turns a backend incident into the frontend
 * `Incident` shape that every dashboard component already renders.
 */

import type { Incident, IncidentStatus } from '@/components/irms-shared';

// ─── Backend enums ───────────────────────────────────────────

// Backend status flow: pending -> in_progress -> assigned -> resolved | closed
export type BackendStatus =
  | 'pending'
  | 'in_progress'
  | 'assigned'
  | 'resolved'
  | 'closed';

export type BackendIncidentType =
  | 'road_traffic_accident'
  | 'missing_person'
  | 'civil_disturbance'
  | 'medical_emergency'
  | 'flood'
  | 'fire_outbreak';

// ─── Status mapping (FE has 4 values, BE has 5) ──────────────
//   BE pending     -> FE received
//   BE in_progress -> FE review
//   BE assigned    -> FE assigned
//   BE resolved    -> FE resolved
//   BE closed      -> FE resolved (FE has no distinct "closed" visual)

const BE_TO_FE_STATUS: Record<BackendStatus, IncidentStatus> = {
  pending: 'received',
  in_progress: 'review',
  assigned: 'assigned',
  resolved: 'resolved',
  closed: 'resolved',
};

const FE_TO_BE_STATUS: Record<IncidentStatus, BackendStatus> = {
  received: 'pending',
  review: 'in_progress',
  assigned: 'assigned',
  resolved: 'resolved',
};

export function toFeStatus(status: string): IncidentStatus {
  return BE_TO_FE_STATUS[status as BackendStatus] ?? 'received';
}

export function toBeStatus(status: IncidentStatus): BackendStatus {
  return FE_TO_BE_STATUS[status] ?? 'pending';
}

/**
 * The strict next status the backend accepts for a given current status.
 *   pending -> in_progress -> assigned -> resolved -> closed
 * Returns null when there is no further forward transition.
 */
export function nextBackendStatus(current: BackendStatus): BackendStatus | null {
  const order: BackendStatus[] = ['pending', 'in_progress', 'assigned', 'resolved', 'closed'];
  const i = order.indexOf(current);
  if (i === -1 || i === order.length - 1) return null;
  return order[i + 1];
}

// ─── Incident type mapping ───────────────────────────────────

const BE_TO_FE_TYPE: Record<BackendIncidentType, string> = {
  road_traffic_accident: 'rta',
  missing_person: 'missing',
  civil_disturbance: 'civil',
  medical_emergency: 'medical',
  flood: 'flood',
  fire_outbreak: 'fire',
};

const FE_TO_BE_TYPE: Record<string, BackendIncidentType> = {
  rta: 'road_traffic_accident',
  missing: 'missing_person',
  civil: 'civil_disturbance',
  medical: 'medical_emergency',
  flood: 'flood',
  fire: 'fire_outbreak',
};

export function toFeType(type: string): string {
  return BE_TO_FE_TYPE[type as BackendIncidentType] ?? type;
}

export function toBeType(type: string): string {
  return FE_TO_BE_TYPE[type] ?? type;
}

// ─── Backend incident shape (from /incidents/agencies/incidents/) ──

export interface BackendIncident {
  id: string;
  reference: string;
  incident_type: string;
  incident_type_display?: string;
  description?: string;
  latitude: number;
  longitude: number;
  location_name?: string;
  status: string;
  status_display?: string;
  assigned_agency?: { id: string; agency_name: string; agency_type: string; agency_type_display?: string } | null;
  is_mine?: boolean;
  media?: Array<{ id: string; media_type: string; file_url: string; created_at: string }>;
  distance_km?: number;
  created_at?: string;
  updated_at?: string;
  resolved_at?: string | null;
}

// ─── Time formatting (backend sends ISO timestamps) ──────────

/** "2026-05-30T10:05:00Z" -> "10:05 · 30 May" (matches the FE reportedAt style). */
export function formatAbsolute(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const day = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `${time} · ${day}`;
}

/** A coarse "x min ago" relative string from an ISO timestamp and a reference now. */
export function formatRelative(iso?: string, now: number = Date.now()): string {
  if (!iso) return '';
  const t = new Date(iso).getTime();
  if (isNaN(t)) return '';
  const diff = Math.max(0, now - t);
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.floor(hr / 24);
  return `${day} day${day === 1 ? '' : 's'} ago`;
}

// ─── Adapter: backend incident -> frontend Incident ──────────

export function mapBackendIncident(b: BackendIncident, now: number = Date.now()): Incident {
  return {
    id: b.id,
    ref: b.reference,
    type: toFeType(b.incident_type),
    location: b.location_name || `${b.latitude.toFixed(4)}, ${b.longitude.toFixed(4)}`,
    lat: b.latitude,
    lng: b.longitude,
    status: toFeStatus(b.status),
    reported: formatRelative(b.created_at, now),
    reportedAt: formatAbsolute(b.created_at),
    desc: b.description || '',
    media: Array.isArray(b.media) ? b.media.length : 0,
    assignedTo: b.assigned_agency?.agency_name ?? null,
    distanceKm: typeof b.distance_km === 'number' ? b.distance_km : undefined,
    isMine: b.is_mine,
  };
}
