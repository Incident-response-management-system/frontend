import { describe, it, expect } from 'vitest';
import {
  toFeStatus,
  toBeStatus,
  nextBackendStatus,
  toFeType,
  toBeType,
  incidentTypesForAgency,
  isIncidentRelevant,
  formatRelative,
  formatAbsolute,
  formatTimeOnly,
  mapBackendIncident,
} from '@/lib/agency-types';
import type { BackendIncident } from '@/lib/agency-types';

describe('toFeStatus', () => {
  it('passes through pending', () => {
    expect(toFeStatus('pending')).toBe('pending');
  });

  it('passes through in_progress', () => {
    expect(toFeStatus('in_progress')).toBe('in_progress');
  });

  it('passes through assigned', () => {
    expect(toFeStatus('assigned')).toBe('assigned');
  });

  it('passes through resolved', () => {
    expect(toFeStatus('resolved')).toBe('resolved');
  });

  it('passes through closed', () => {
    expect(toFeStatus('closed')).toBe('closed');
  });

  it('falls back to pending for unknown string', () => {
    expect(toFeStatus('whatever')).toBe('pending');
  });
});

describe('toBeStatus', () => {
  it('passes pending through', () => {
    expect(toBeStatus('pending')).toBe('pending');
  });

  it('passes in_progress through', () => {
    expect(toBeStatus('in_progress')).toBe('in_progress');
  });

  it('passes assigned through', () => {
    expect(toBeStatus('assigned')).toBe('assigned');
  });

  it('passes resolved through', () => {
    expect(toBeStatus('resolved')).toBe('resolved');
  });

  it('passes closed through', () => {
    expect(toBeStatus('closed')).toBe('closed');
  });
});

describe('nextBackendStatus', () => {
  it('pending -> in_progress', () => {
    expect(nextBackendStatus('pending')).toBe('in_progress');
  });

  it('in_progress -> assigned', () => {
    expect(nextBackendStatus('in_progress')).toBe('assigned');
  });

  it('assigned -> resolved', () => {
    expect(nextBackendStatus('assigned')).toBe('resolved');
  });

  it('resolved -> closed', () => {
    expect(nextBackendStatus('resolved')).toBe('closed');
  });

  it('closed -> null (end of chain)', () => {
    expect(nextBackendStatus('closed')).toBeNull();
  });

  it('unknown string -> null', () => {
    expect(nextBackendStatus('unknown' as any)).toBeNull();
  });
});

describe('toFeType', () => {
  it('road_traffic_accident -> rta', () => {
    expect(toFeType('road_traffic_accident')).toBe('rta');
  });

  it('missing_person -> missing', () => {
    expect(toFeType('missing_person')).toBe('missing');
  });

  it('civil_disturbance -> civil', () => {
    expect(toFeType('civil_disturbance')).toBe('civil');
  });

  it('medical_emergency -> medical', () => {
    expect(toFeType('medical_emergency')).toBe('medical');
  });

  it('flood -> flood', () => {
    expect(toFeType('flood')).toBe('flood');
  });

  it('fire_outbreak -> fire', () => {
    expect(toFeType('fire_outbreak')).toBe('fire');
  });

  it('unknown type passes through unchanged', () => {
    expect(toFeType('some_other_type')).toBe('some_other_type');
  });
});

describe('toBeType', () => {
  it('rta -> road_traffic_accident', () => {
    expect(toBeType('rta')).toBe('road_traffic_accident');
  });

  it('missing -> missing_person', () => {
    expect(toBeType('missing')).toBe('missing_person');
  });

  it('civil -> civil_disturbance', () => {
    expect(toBeType('civil')).toBe('civil_disturbance');
  });

  it('medical -> medical_emergency', () => {
    expect(toBeType('medical')).toBe('medical_emergency');
  });

  it('flood -> flood', () => {
    expect(toBeType('flood')).toBe('flood');
  });

  it('fire -> fire_outbreak', () => {
    expect(toBeType('fire')).toBe('fire_outbreak');
  });

  it('unknown type passes through unchanged', () => {
    expect(toBeType('something_else')).toBe('something_else');
  });
});

describe('incidentTypesForAgency', () => {
  it('hospital -> [medical, rta]', () => {
    expect(incidentTypesForAgency('hospital')).toEqual(['medical', 'rta']);
  });

  it('fire_rescue -> [fire, flood, rta]', () => {
    expect(incidentTypesForAgency('fire_rescue')).toEqual(['fire', 'flood', 'rta']);
  });

  it('police -> [civil, missing, rta]', () => {
    expect(incidentTypesForAgency('police')).toEqual(['civil', 'missing', 'rta']);
  });

  it('private_security -> [civil, missing]', () => {
    expect(incidentTypesForAgency('private_security')).toEqual(['civil', 'missing']);
  });

  it('null -> null (no filter)', () => {
    expect(incidentTypesForAgency(null)).toBeNull();
  });

  it('undefined -> null', () => {
    expect(incidentTypesForAgency(undefined)).toBeNull();
  });

  it('unknown_agency -> null (show all)', () => {
    expect(incidentTypesForAgency('unknown_agency')).toBeNull();
  });

  it('POLICE (uppercase) normalizes to police', () => {
    expect(incidentTypesForAgency('POLICE')).toEqual(['civil', 'missing', 'rta']);
  });

  it('Fire Rescue (mixed case with space) normalizes to fire_rescue', () => {
    expect(incidentTypesForAgency('Fire Rescue')).toEqual(['fire', 'flood', 'rta']);
  });
});

describe('isIncidentRelevant', () => {
  it('null agencyType -> always true', () => {
    expect(isIncidentRelevant('medical', null)).toBe(true);
  });

  it('undefined agencyType -> always true', () => {
    expect(isIncidentRelevant('fire', undefined)).toBe(true);
  });

  it('medical + hospital -> true', () => {
    expect(isIncidentRelevant('medical', 'hospital')).toBe(true);
  });

  it('fire + hospital -> false', () => {
    expect(isIncidentRelevant('fire', 'hospital')).toBe(false);
  });

  it('rta + hospital -> true (shared type)', () => {
    expect(isIncidentRelevant('rta', 'hospital')).toBe(true);
  });

  it('rta + police -> true', () => {
    expect(isIncidentRelevant('rta', 'police')).toBe(true);
  });

  it('road_traffic_accident (backend type string) + hospital -> true', () => {
    expect(isIncidentRelevant('road_traffic_accident', 'hospital')).toBe(true);
  });
});

describe('formatRelative', () => {
  const now = new Date('2026-06-01T12:00:00.000Z').getTime();

  it('undefined -> empty string', () => {
    expect(formatRelative(undefined, now)).toBe('');
  });

  it('empty string -> empty string', () => {
    expect(formatRelative('', now)).toBe('');
  });

  it('invalid ISO -> empty string', () => {
    expect(formatRelative('not-a-date', now)).toBe('');
  });

  it('30 seconds ago -> just now', () => {
    const iso = new Date(now - 30 * 1000).toISOString();
    expect(formatRelative(iso, now)).toBe('just now');
  });

  it('2 minutes ago -> 2 min ago', () => {
    const iso = new Date(now - 2 * 60 * 1000).toISOString();
    expect(formatRelative(iso, now)).toBe('2 min ago');
  });

  it('90 minutes ago -> 1 hr ago', () => {
    const iso = new Date(now - 90 * 60 * 1000).toISOString();
    expect(formatRelative(iso, now)).toBe('1 hr ago');
  });

  it('25 hours ago -> 1 day ago', () => {
    const iso = new Date(now - 25 * 60 * 60 * 1000).toISOString();
    expect(formatRelative(iso, now)).toBe('1 day ago');
  });

  it('48 hours ago -> 2 days ago', () => {
    const iso = new Date(now - 48 * 60 * 60 * 1000).toISOString();
    expect(formatRelative(iso, now)).toBe('2 days ago');
  });
});

describe('formatAbsolute', () => {
  it('undefined -> empty string', () => {
    expect(formatAbsolute(undefined)).toBe('');
  });

  it('invalid ISO -> returns original string unchanged', () => {
    expect(formatAbsolute('not-a-date')).toBe('not-a-date');
  });

  it('valid ISO contains time and 30 May', () => {
    const result = formatAbsolute('2026-05-30T10:05:00.000Z');
    expect(result).toMatch(/\d{2}:\d{2}/);
    expect(result).toContain('30 May');
  });
});

describe('formatTimeOnly', () => {
  it('undefined -> empty string', () => {
    expect(formatTimeOnly(undefined)).toBe('');
  });

  it('valid ISO -> HH:MM format', () => {
    const result = formatTimeOnly('2026-05-30T14:35:00.000Z');
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  });
});

const BASE_INCIDENT: BackendIncident = {
  id: 'abc-123',
  reference: 'INC-001',
  incident_type: 'medical_emergency',
  latitude: 6.5244,
  longitude: 3.3792,
  location_name: 'Victoria Island',
  status: 'assigned',
  media: [
    { id: 'm1', media_type: 'image', file_url: 'https://example.com/1.jpg', created_at: '2026-05-30T10:00:00Z' },
    { id: 'm2', media_type: 'video', file_url: 'https://example.com/2.mp4', created_at: '2026-05-30T10:01:00Z' },
  ],
  assigned_agency: { id: 'ag-1', agency_name: 'Lagos Hospital', agency_type: 'hospital' },
  created_at: '2026-05-30T10:00:00.000Z',
  activity_log: [
    { id: 'log1', at: '2026-05-30T10:05:00.000Z', message: 'Unit dispatched' },
  ],
  timeline: [
    { id: 'tl1', at: '2026-05-30T10:05:00.000Z', message: 'Agency assigned', event_type: 'assigned', label: 'Assigned' },
  ],
};

describe('mapBackendIncident', () => {
  const now = new Date('2026-06-01T12:00:00.000Z').getTime();

  it('ref equals reference', () => {
    const incident = mapBackendIncident(BASE_INCIDENT, now);
    expect(incident.ref).toBe('INC-001');
  });

  it('type is mapped frontend shortcode', () => {
    const incident = mapBackendIncident(BASE_INCIDENT, now);
    expect(incident.type).toBe('medical');
  });

  it('status is mapped frontend status', () => {
    const incident = mapBackendIncident(BASE_INCIDENT, now);
    expect(incident.status).toBe('assigned');
  });

  it('location uses location_name when present', () => {
    const incident = mapBackendIncident(BASE_INCIDENT, now);
    expect(incident.location).toBe('Victoria Island');
  });

  it('location falls back to lat, lng when location_name is missing', () => {
    const b: BackendIncident = { ...BASE_INCIDENT, location_name: undefined };
    const incident = mapBackendIncident(b, now);
    expect(incident.location).toContain('6.5244');
    expect(incident.location).toContain('3.3792');
  });

  it('media count equals length of media array', () => {
    const incident = mapBackendIncident(BASE_INCIDENT, now);
    expect(incident.media).toBe(2);
  });

  it('assignedTo is agency name when assigned_agency is set', () => {
    const incident = mapBackendIncident(BASE_INCIDENT, now);
    expect(incident.assignedTo).toBe('Lagos Hospital');
  });

  it('assignedTo is null when assigned_agency is null', () => {
    const b: BackendIncident = { ...BASE_INCIDENT, assigned_agency: null };
    const incident = mapBackendIncident(b, now);
    expect(incident.assignedTo).toBeNull();
  });

  it('activity_log maps at -> time and message -> event', () => {
    const incident = mapBackendIncident(BASE_INCIDENT, now);
    expect(incident.activity_log).toHaveLength(1);
    expect(incident.activity_log![0].event).toBe('Unit dispatched');
    expect(incident.activity_log![0].time).toMatch(/^\d{2}:\d{2}$/);
  });

  it('timeline maps to title/description/timestamp/status', () => {
    const incident = mapBackendIncident(BASE_INCIDENT, now);
    expect(incident.timeline).toHaveLength(1);
    expect(incident.timeline![0].title).toBe('Assigned');
    expect(incident.timeline![0].description).toBe('Agency assigned');
    expect(incident.timeline![0].timestamp).toMatch(/\d{2}:\d{2}/);
    expect(incident.timeline![0].status).toBe('completed');
  });
});
