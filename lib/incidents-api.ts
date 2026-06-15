/**
 * Incidents API Service
 * Integrated with live backend endpoints.
 * Bearer token injection is handled automatically by `apiFetch` via cookies.
 * Anonymous users use X-Reporter-Session-Id header.
 */

import { apiFetch, getCookie } from './api-client';

// ─── Types ───────────────────────────────────────────────────

export interface ReportPayload {
  incident_type: string;
  description: string;
  latitude: number;
  longitude: number;
  location_name: string;
  media?: File[];
}

export interface ReportResponse {
  success: boolean;
  reference: string;
  incident_id: string;
  message: string;
  media: MediaItem[];
}

export interface MediaItem {
  id: string;
  media_type: string;
  file_url: string;
  created_at: string;
}

export interface MyReport {
  id: string;
  reference: string;
  incident_type: string;
  incident_type_display: string;
  status: string;
  status_display: string;
  location_name: string;
  latitude: number;
  longitude: number;
  description: string;
  created_at: string;
  media: MediaItem[];
  responding_agency?: any;
  timeline?: any[];
  activity_log?: any[];
}

export interface TrackResponse {
  success: boolean;
  reference: string;
  incident_type: string;
  incident_type_display: string;
  status: string;
  status_display: string;
  location_name: string;
  created_at: string;
  responding_agency?: any;
  timeline?: any[];
  activity_log?: any[];
}

export interface NearbyResponse {
  success: boolean;
  radius_km: number;
  count: number;
  results: MyReport[];
}

export interface MyReportsResponse {
  success: boolean;
  count: number;
  results: MyReport[];
}

// ─── Submit Report ────────────────────────────────────────────

export async function submitReport(payload: ReportPayload): Promise<ReportResponse> {
  const formData = new FormData();
  formData.append('incident_type', payload.incident_type);
  formData.append('description', payload.description);
  formData.append('latitude', String(payload.latitude));
  formData.append('longitude', String(payload.longitude));
  formData.append('location_name', payload.location_name);
  
  if (payload.media) {
    payload.media.forEach(file => {
      formData.append('media', file);
    });
  }

  const hasToken = !!getCookie('citizen_token');
  const res = await apiFetch('/incidents/report/', {
    method: 'POST',
    body: formData,
    tokenType: 'citizen',
    useReporterSession: !hasToken,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Submission failed' }));
    throw new Error(err.message || err.detail || 'Submission failed');
  }

  return await res.json();
}

// ─── Upload Additional Media ───────────────────────────────────

export async function uploadMedia(incidentId: string, media: File[]): Promise<{ success: boolean; message: string; media: MediaItem[] }> {
  const formData = new FormData();
  media.forEach(file => {
    formData.append('media', file);
  });

  const hasToken = !!getCookie('citizen_token');
  const res = await apiFetch(`/incidents/${incidentId}/upload-media/`, {
    method: 'POST',
    body: formData,
    tokenType: 'citizen',
    useReporterSession: !hasToken,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Media upload failed' }));
    throw new Error(err.message || err.detail || 'Media upload failed');
  }

  return await res.json();
}

// ─── Track Incident By Reference ───────────────────────────────

export async function trackIncident(ref: string): Promise<TrackResponse> {
  const res = await apiFetch(`/incidents/track/?ref=${encodeURIComponent(ref)}`);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Tracking failed' }));
    throw new Error(err.message || err.detail || 'Tracking failed');
  }

  return await res.json();
}

// ─── Get Nearby Incidents ───────────────────────────────────────

export async function getNearbyIncidents(
  latitude: number,
  longitude: number,
  radiusKm: number = 5,
  status?: string
): Promise<NearbyResponse> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    radius_km: String(radiusKm),
  });
  
  if (status) {
    params.append('status', status);
  }

  const res = await apiFetch(`/incidents/nearby/?${params.toString()}`);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Failed to fetch nearby incidents' }));
    throw new Error(err.message || err.detail || 'Failed to fetch nearby incidents');
  }

  return await res.json();
}

// ─── Get My Reports ───────────────────────────────────────────

export async function getMyReports(status?: string): Promise<MyReportsResponse> {
  const hasToken = !!getCookie('citizen_token');
  const params = status ? `?status=${status}` : '';
  
  const res = await apiFetch(`/incidents/my-reports/${params}`, {
    tokenType: 'citizen',
    useReporterSession: !hasToken,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Failed to load reports' }));
    throw new Error(err.message || err.detail || 'Failed to load reports');
  }

  return await res.json();
}

// ─── Get Single Report ────────────────────────────────────────

export async function getReportById(incidentId: string): Promise<{ success: boolean; incident: MyReport }> {
  const hasToken = !!getCookie('citizen_token');
  
  const res = await apiFetch(`/incidents/my-reports/${incidentId}/`, {
    tokenType: 'citizen',
    useReporterSession: !hasToken,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Failed to load report' }));
    throw new Error(err.message || err.detail || 'Failed to load report');
  }

  return await res.json();
}
