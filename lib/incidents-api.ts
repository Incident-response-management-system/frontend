/**
 * Incidents API Service
 * All functions are STUBBED — no live backend yet.
 * Bearer token injection is handled automatically by `apiFetch` via cookies.
 */

import { apiFetch } from './api-client';
import type { IncidentStatus } from '@/components/irms-shared';

// ─── Types ───────────────────────────────────────────────────

export interface ReportPayload {
  incidentType: string;
  description: string;
  lat: number;
  lng: number;
  locationLabel?: string;
  attachments?: File[];
  trackReport?: boolean;
}

export interface ReportResponse {
  ref: string;
  status: IncidentStatus;
  submittedAt: string;
  estimatedResponseMin: number;
}

export interface MyReport {
  ref: string;
  type: string;
  location: string;
  lat: number;
  lng: number;
  status: IncidentStatus;
  reportedAt: string;
  desc: string;
  media: number;
  assignedTo: string | null;
  reported: string;
  notes?: CitizenNote[];
}

export interface CitizenNote {
  id: string;
  text: string;
  submittedAt: string;
}

// ─── Submit Report ────────────────────────────────────────────

export async function submitReport(payload: ReportPayload): Promise<ReportResponse> {
  // STUB — replace with:
  // const formData = new FormData();
  // formData.append('incidentType', payload.incidentType);
  // formData.append('description', payload.description);
  // formData.append('lat', String(payload.lat));
  // formData.append('lng', String(payload.lng));
  // if (payload.locationLabel) formData.append('locationLabel', payload.locationLabel);
  // payload.attachments?.forEach(f => formData.append('attachments', f));
  // const res = await apiFetch('/incidents', { method: 'POST', body: formData });
  // if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Submission failed'); }
  // return await res.json();

  await new Promise(r => setTimeout(r, 1200));

  const num = String(149 + Math.floor(Math.random() * 10)).padStart(5, '0');
  return {
    ref: `INC-2026-${num}`,
    status: 'received',
    submittedAt: new Date().toISOString(),
    estimatedResponseMin: 4,
  };
}

// ─── Get My Reports ───────────────────────────────────────────

export async function getMyReports(): Promise<MyReport[]> {
  // STUB — replace with:
  // const res = await apiFetch('/incidents/mine', { tokenType: 'citizen' });
  // if (!res.ok) throw new Error('Failed to load reports');
  // return await res.json();

  await new Promise(r => setTimeout(r, 600));

  // Returns seeded demo data — remove when backend is live
  return [];
}

// ─── Get Report By Ref ────────────────────────────────────────

export async function getReportByRef(ref: string): Promise<MyReport | null> {
  // STUB — replace with:
  // const res = await apiFetch(`/incidents/${ref}`);
  // if (res.status === 404) return null;
  // if (!res.ok) throw new Error('Failed to load report');
  // return await res.json();

  await new Promise(r => setTimeout(r, 400));
  return null;
}

// ─── Add Citizen Note ─────────────────────────────────────────

export async function addCitizenNote(ref: string, note: string): Promise<CitizenNote> {
  // STUB — replace with:
  // const res = await apiFetch(`/incidents/${ref}/notes`, {
  //   method: 'POST',
  //   body: JSON.stringify({ text: note }),
  //   tokenType: 'citizen',
  // });
  // if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Failed to submit note'); }
  // return await res.json();

  await new Promise(r => setTimeout(r, 500));

  return {
    id: `note_${Date.now()}`,
    text: note,
    submittedAt: new Date().toISOString(),
  };
}
