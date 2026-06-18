import type { IncidentStatus } from './types';
import { getIncidentType } from './types';

// SVG path markup for Leaflet divIcon markers (matches Icon.* glyphs above).
export const INCIDENT_ICON_PATHS: Record<string, string> = {
  road_traffic_accident:
    '<path d="M6 20v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3M29 20v3a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-3M4 20h24M6 20l2-7a3 3 0 0 1 3-2h10a3 3 0 0 1 3 2l2 7M4 20a2 2 0 0 1 2-2h20a2 2 0 0 1 2 2v0M9 17h14" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="20" r="1.5" fill="currentColor"/><circle cx="23" cy="20" r="1.5" fill="currentColor"/>',
  missing_person:
    '<circle cx="16" cy="11" r="4.5"/><path d="M6 28c0-5 4.5-8 10-8s10 3 10 8" stroke-linecap="round"/><path d="M22 6l4 4M26 6l-4 4" stroke-linecap="round"/>',
  civil_disturbance:
    '<circle cx="11" cy="11" r="3"/><circle cx="21" cy="11" r="3"/><path d="M5 22c0-3 2.5-5 6-5s6 2 6 5M15 22c0-3 2.5-5 6-5s6 2 6 5" stroke-linecap="round"/>',
  medical_emergency:
    '<rect x="4" y="8" width="24" height="18" rx="2"/><path d="M16 13v8M12 17h8" stroke-width="2" stroke-linecap="round"/><path d="M11 8V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3"/>',
  flood:
    '<path d="M3 22c2 0 3-2 5-2s3 2 5 2 3-2 5-2 3 2 5 2 3-2 5-2M3 27c2 0 3-2 5-2s3 2 5 2 3-2 5-2 3 2 5 2 3-2 5-2" stroke-linecap="round" stroke-linejoin="round"/><path d="M11 14L16 4l5 10" stroke-linejoin="round"/>',
  fire_outbreak:
    '<path d="M16 3s2 4 2 7c0 2-2 3-2 5 0 1.5 2 2 2 4M16 28c-5 0-9-3.5-9-9 0-3 2-5 3-7 1 2 2 3 3 3 0-3 1-6 3-9 0 2 4 4 4 9 0 1 1 0 2-1 1 2 3 3 3 6 0 5-4 8-9 8z" stroke-linejoin="round"/>',
};

export function incidentTrackHref(reference: string): string {
  return `/track?ref=${encodeURIComponent(reference)}`;
}

/** Leaflet divIcon HTML — dark tile with the incident-type glyph (matches the type picker). */
export function buildIncidentMarkerHtml(incidentType: string): string {
  const t = getIncidentType(incidentType);
  const paths = INCIDENT_ICON_PATHS[t.id] || INCIDENT_ICON_PATHS.road_traffic_accident;
  return `<div class="irms-incident-marker" style="--marker-accent:${t.color}">
    <div class="irms-incident-marker__inner">
      <svg width="20" height="20" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6">${paths}</svg>
    </div>
  </div>`;
}

/** Leaflet divIcon HTML for agency side — outer ring is status color (+ pulse if pending), inner icon is incident type. */
export function buildAgencyIncidentMarkerHtml(incidentType: string, status: IncidentStatus): string {
  const t = getIncidentType(incidentType);
  const paths = INCIDENT_ICON_PATHS[t.id] || INCIDENT_ICON_PATHS.road_traffic_accident;

  const statusColors: Record<IncidentStatus, string> = {
    pending: 'var(--status-red, #C8463C)',
    in_progress: 'var(--status-amber, #B97A2A)',
    assigned: 'var(--status-blue, #3B6FB8)',
    resolved: 'var(--status-green, #3E8657)',
    closed: 'var(--brand-muted, #6D6A5E)',
  };
  const ringColor = statusColors[status] || statusColors.pending;
  const pulseHtml = status === 'pending' ? `<div class="pulse" style="color: var(--status-red);"></div>` : '';

  return `<div class="irms-incident-marker" style="--marker-accent:${ringColor}; color:${t.color}; position:relative;">
    ${pulseHtml}
    <div class="irms-incident-marker__inner">
      <svg width="20" height="20" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6">${paths}</svg>
    </div>
  </div>`;
}


export interface IncidentMapCardData {
  reference: string;
  incident_type: string;
  incident_type_display?: string;
  status?: string;
  status_display?: string;
  location_name?: string;
  description?: string;
  created_at?: string;
}

/** Compact hover tooltip for map markers. */
export function buildIncidentMapTooltipHtml(incident: IncidentMapCardData): string {
  const t = getIncidentType(incident.incident_type);
  const label = incident.incident_type_display || t.short;
  const href = incidentTrackHref(incident.reference);

  const statusLabels: Record<string, string> = {
    pending: 'Received',
    in_progress: 'Under Review',
    assigned: 'Assigned',
    resolved: 'Resolved',
    closed: 'Closed',
  };

  const statusColors: Record<string, string> = {
    pending: 'var(--status-red)',
    in_progress: 'var(--status-amber)',
    assigned: 'var(--status-blue)',
    resolved: 'var(--status-green)',
    closed: 'var(--brand-muted)',
  };

  const statusVal = incident.status || 'pending';
  const statusLabel = statusLabels[statusVal] || incident.status_display || statusVal;
  const statusColor = statusColors[statusVal] || 'var(--brand-muted)';

  return `<div class="irms-incident-tooltip__inner">
    <div class="irms-incident-tooltip__title">${label}</div>
    <div class="irms-incident-tooltip__ref" style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
      <span>${incident.reference}</span>
      <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 600; text-transform: uppercase; color: ${statusColor}; font-family: var(--font-sans);">
        <span style="width: 5px; height: 5px; border-radius: 50%; background-color: ${statusColor}; display: inline-block;"></span>
        ${statusLabel}
      </span>
    </div>
    <a href="${href}" class="irms-incident-tooltip__link">Track report →</a>
  </div>`;
}

/** Click popup for map markers. */
export function buildIncidentMapPopupHtml(incident: IncidentMapCardData): string {
  const t = getIncidentType(incident.incident_type);
  const label = incident.incident_type_display || t.label;
  const href = incidentTrackHref(incident.reference);
  const desc = incident.description
    ? `<div class="irms-incident-popup__desc">${incident.description.substring(0, 100)}${incident.description.length > 100 ? '…' : ''}</div>`
    : '';
  const date = incident.created_at
    ? `<div class="irms-incident-popup__meta">${new Date(incident.created_at).toLocaleDateString()}</div>`
    : '';
  return `<div class="irms-incident-popup">
    <div class="irms-incident-popup__type" style="color:${t.color}">${label}</div>
    <div class="irms-incident-popup__ref">Ref: ${incident.reference}</div>
    <div class="irms-incident-popup__meta">${incident.status_display || incident.status || ''}</div>
    <div class="irms-incident-popup__meta">${incident.location_name || 'Unknown location'}</div>
    ${desc}
    ${date}
    <a href="${href}" class="irms-incident-popup__link">Track this report →</a>
  </div>`;
}

/** Resolves a media file URL (absolute or relative to backend base host). */
export function resolveMediaUrl(url: string | undefined): string {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://backend-rijh.onrender.com/api/v1';
  const host = apiBase.split('/api/v1')[0];

  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${host}${cleanUrl}`;
}
