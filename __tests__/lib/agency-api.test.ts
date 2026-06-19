import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchAgencyIncidents,
  updateIncidentStatus,
  fetchAgencyStats,
} from '@/lib/agency-api';

vi.mock('@/lib/api-client', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return { ...actual, apiFetch: vi.fn(), extractApiError: actual.extractApiError };
});

vi.mock('@/lib/auth-api', () => ({
  getAgencyProfile: vi.fn().mockResolvedValue(null),
}));

import { apiFetch } from '@/lib/api-client';

const mockApiFetch = apiFetch as ReturnType<typeof vi.fn>;

function makeResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const backendIncidents = {
  results: [
    {
      id: 'i1',
      reference: 'INC-001',
      incident_type: 'medical_emergency',
      description: 'Person collapsed',
      latitude: 9.05,
      longitude: 7.49,
      location_name: 'Garki',
      status: 'pending',
      created_at: '2026-05-30T10:00:00Z',
      media: [],
      assigned_agency: null,
    },
    {
      id: 'i2',
      reference: 'INC-002',
      incident_type: 'road_traffic_accident',
      description: 'Crash',
      latitude: 9.06,
      longitude: 7.50,
      status: 'in_progress',
      created_at: '2026-05-30T09:00:00Z',
      media: [
        {
          id: 'm1',
          media_type: 'image',
          file_url: 'http://x.com/img.jpg',
          created_at: '2026-05-30T09:01:00Z',
        },
      ],
      assigned_agency: { id: 'a1', agency_name: 'Test PD', agency_type: 'police' },
    },
  ],
};

// ─── fetchAgencyIncidents ────────────────────────────────────

describe('fetchAgencyIncidents', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls apiFetch with no query string when tab is "all"', async () => {
    mockApiFetch.mockResolvedValueOnce(makeResponse(backendIncidents));
    await fetchAgencyIncidents('all');
    expect(mockApiFetch).toHaveBeenCalledWith(
      '/incidents/agencies/incidents/',
      expect.anything(),
    );
  });

  it('calls apiFetch with ?tab=available when tab is "available"', async () => {
    mockApiFetch.mockResolvedValueOnce(makeResponse(backendIncidents));
    await fetchAgencyIncidents('available');
    expect(mockApiFetch).toHaveBeenCalledWith(
      '/incidents/agencies/incidents/?tab=available',
      expect.anything(),
    );
  });

  it('calls apiFetch with ?tab=mine when tab is "mine"', async () => {
    mockApiFetch.mockResolvedValueOnce(makeResponse(backendIncidents));
    await fetchAgencyIncidents('mine');
    expect(mockApiFetch).toHaveBeenCalledWith(
      '/incidents/agencies/incidents/?tab=mine',
      expect.anything(),
    );
  });

  it('maps incident_type medical_emergency to "medical"', async () => {
    mockApiFetch.mockResolvedValueOnce(makeResponse(backendIncidents));
    const incidents = await fetchAgencyIncidents('all');
    const i1 = incidents.find((i) => i.id === 'i1');
    expect(i1!.type).toBe('medical');
  });

  it('maps incident_type road_traffic_accident to "rta"', async () => {
    mockApiFetch.mockResolvedValueOnce(makeResponse(backendIncidents));
    const incidents = await fetchAgencyIncidents('all');
    const i2 = incidents.find((i) => i.id === 'i2');
    expect(i2!.type).toBe('rta');
  });

  it('maps status in_progress through unchanged', async () => {
    mockApiFetch.mockResolvedValueOnce(makeResponse(backendIncidents));
    const incidents = await fetchAgencyIncidents('all');
    const i2 = incidents.find((i) => i.id === 'i2');
    expect(i2!.status).toBe('in_progress');
  });

  it('uses location_name for the location field', async () => {
    mockApiFetch.mockResolvedValueOnce(makeResponse(backendIncidents));
    const incidents = await fetchAgencyIncidents('all');
    const i1 = incidents.find((i) => i.id === 'i1');
    expect(i1!.location).toBe('Garki');
  });

  it('falls back to coordinate string when location_name is missing', async () => {
    const noLocation = {
      results: [
        {
          ...backendIncidents.results[0],
          location_name: undefined,
          latitude: 9.05,
          longitude: 7.49,
        },
      ],
    };
    mockApiFetch.mockResolvedValueOnce(makeResponse(noLocation));
    const incidents = await fetchAgencyIncidents('all');
    expect(incidents[0].location).toBe('9.0500, 7.4900');
  });

  it('counts media items correctly', async () => {
    mockApiFetch.mockResolvedValueOnce(makeResponse(backendIncidents));
    const incidents = await fetchAgencyIncidents('all');
    const i1 = incidents.find((i) => i.id === 'i1');
    const i2 = incidents.find((i) => i.id === 'i2');
    expect(i1!.media).toBe(0);
    expect(i2!.media).toBe(1);
  });

  it('maps assignedTo from assigned_agency.agency_name', async () => {
    mockApiFetch.mockResolvedValueOnce(makeResponse(backendIncidents));
    const incidents = await fetchAgencyIncidents('all');
    const i1 = incidents.find((i) => i.id === 'i1');
    const i2 = incidents.find((i) => i.id === 'i2');
    expect(i1!.assignedTo).toBeNull();
    expect(i2!.assignedTo).toBe('Test PD');
  });

  it('throws Error("Failed to load incidents") on non-ok response', async () => {
    mockApiFetch.mockResolvedValueOnce(makeResponse({ detail: 'Server error' }, 500));
    await expect(fetchAgencyIncidents('all')).rejects.toThrow('Failed to load incidents');
  });
});

// ─── updateIncidentStatus ────────────────────────────────────

describe('updateIncidentStatus', () => {
  beforeEach(() => vi.clearAllMocks());

  const updatedBackendIncident = {
    incident: {
      id: 'i1',
      reference: 'INC-001',
      incident_type: 'medical_emergency',
      description: 'Person collapsed',
      latitude: 9.05,
      longitude: 7.49,
      location_name: 'Garki',
      status: 'in_progress',
      created_at: '2026-05-30T10:00:00Z',
      media: [],
      assigned_agency: null,
    },
  };

  it('calls apiFetch with PATCH on /incidents/{id}/', async () => {
    mockApiFetch.mockResolvedValueOnce(makeResponse(updatedBackendIncident, 200));
    await updateIncidentStatus('i1', 'in_progress');
    expect(mockApiFetch).toHaveBeenCalledWith(
      '/incidents/i1/',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ status: 'in_progress' }),
      }),
    );
  });

  it('returns a mapped Incident on success', async () => {
    mockApiFetch.mockResolvedValueOnce(makeResponse(updatedBackendIncident, 200));
    const incident = await updateIncidentStatus('i1', 'in_progress');
    expect(incident.id).toBe('i1');
    expect(incident.type).toBe('medical');
    expect(incident.status).toBe('in_progress');
  });

  it('throws with extractApiError result on non-ok response', async () => {
    mockApiFetch.mockResolvedValueOnce(
      makeResponse({ detail: 'Permission denied.' }, 403),
    );
    await expect(updateIncidentStatus('i1', 'in_progress')).rejects.toThrow('Permission denied.');
  });
});

// ─── fetchAgencyStats ────────────────────────────────────────

describe('fetchAgencyStats', () => {
  beforeEach(() => vi.clearAllMocks());

  const backendStats = {
    total_this_month: 5,
    resolved_this_month: 2,
    pending: 1,
    assigned: 1,
    in_progress: 1,
    closed: 0,
    assigned_to_agency: 3,
    by_incident_type: [
      { incident_type: 'medical_emergency', count: 3 },
      { incident_type: 'road_traffic_accident', count: 2 },
    ],
  };

  it('maps backend stats to AgencyStats shape', async () => {
    mockApiFetch.mockResolvedValueOnce(makeResponse(backendStats));
    const stats = await fetchAgencyStats();
    expect(stats.totalThisMonth).toBe(5);
    expect(stats.resolvedThisMonth).toBe(2);
    expect(stats.pending).toBe(1);
    expect(stats.assigned).toBe(1);
    expect(stats.inProgress).toBe(1);
    expect(stats.closed).toBe(0);
  });

  it('appends year and month query params when provided', async () => {
    mockApiFetch.mockResolvedValueOnce(makeResponse(backendStats));
    await fetchAgencyStats(2026, 5);
    const calledUrl = mockApiFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('year=2026');
    expect(calledUrl).toContain('month=5');
  });

  it('calls without query params when year and month are omitted', async () => {
    mockApiFetch.mockResolvedValueOnce(makeResponse(backendStats));
    await fetchAgencyStats();
    const calledUrl = mockApiFetch.mock.calls[0][0] as string;
    expect(calledUrl).toBe('/incidents/agencies/stats/');
  });

  it('throws on non-ok response', async () => {
    mockApiFetch.mockResolvedValueOnce(makeResponse({ detail: 'Server error' }, 500));
    await expect(fetchAgencyStats()).rejects.toThrow('Failed to load stats');
  });
});
