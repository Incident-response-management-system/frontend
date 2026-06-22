import React from 'react';
import { Icon } from './icons';

export interface IncidentType {
  id: string;
  label: string;
  short: string;
  icon: (p: React.SVGProps<SVGSVGElement>) => React.JSX.Element;
  color: string;
}

// Incident types config - matches API values
export const INCIDENT_TYPES: IncidentType[] = [
  { id: 'road_traffic_accident', label: 'Road Traffic Accident', short: 'Traffic', icon: Icon.car, color: '#E84A3F' },
  { id: 'missing_person', label: 'Missing Person Case', short: 'Missing', icon: Icon.person, color: '#3B82F6' },
  { id: 'civil_disturbance', label: 'Civil Disturbance / Crowd Riot', short: 'Civil', icon: Icon.crowd, color: '#F59E0B' },
  { id: 'medical_emergency', label: 'Medical Emergency', short: 'Medical', icon: Icon.medical, color: '#DC2626' },
  { id: 'flood', label: 'Flood Incident', short: 'Flood', icon: Icon.flood, color: '#0EA5E9' },
  { id: 'fire_outbreak', label: 'Fire Outbreak', short: 'Fire', icon: Icon.fire, color: '#EF4444' },
];

export type IncidentStatus = 'pending' | 'in_progress' | 'assigned' | 'resolved' | 'closed';

export interface Incident {
  ref: string;
  type: string;
  location: string;
  lat: number;
  lng: number;
  status: IncidentStatus;
  reported: string;
  reportedAt: string;
  desc: string;
  media: number;
  mediaItems?: Array<{ id: string; media_type: string; file_url: string; created_at: string }>;
  assignedTo: string | null;
  // Backend-provided extras (optional — absent on seeded/mock data).
  id?: string;            // backend incident UUID, used for PATCH /incidents/{id}/
  distanceKm?: number;    // distance from the agency, when provided by /agencies/incidents
  isMine?: boolean;       // true when this agency has claimed the incident
  priority?: string;      // low | medium | high | critical
  voice_note?: {
    audio_url: string;
    transcript: string;
    stress_level: string;
    stress_score: number;
    stress_indicators: string[];
    analysis_summary: string;
    created_at: string;
  } | null;
  activity_log?: any[];
  timeline?: any[];
}

export function getIncidentType(id: string): IncidentType {
  const normalizedId = id === 'rta' ? 'road_traffic_accident' :
                       id === 'missing' ? 'missing_person' :
                       id === 'civil' ? 'civil_disturbance' :
                       id === 'medical' ? 'medical_emergency' :
                       id === 'fire' ? 'fire_outbreak' :
                       id;
  return INCIDENT_TYPES.find(t => t.id === normalizedId || t.id === id) || INCIDENT_TYPES[0];
}
