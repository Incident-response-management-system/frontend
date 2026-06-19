import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  citizenLogin,
  citizenSignup,
  citizenSignOut,
  refreshToken,
  agencyLogin,
  agencySignOut,
  getAgencyProfile,
  EmailNotVerifiedError,
} from '@/lib/auth-api';
import { getMemoryToken, setMemoryToken, clearMemoryToken } from '@/lib/api-client';

vi.mock('@/lib/api-client', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return { ...actual, apiFetch: vi.fn() };
});

import { apiFetch } from '@/lib/api-client';

const mockApiFetch = apiFetch as ReturnType<typeof vi.fn>;

function makeResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('fetch', vi.fn());
  clearMemoryToken();
});

// ─── citizenLogin ────────────────────────────────────────────

describe('citizenLogin', () => {
  const successBody = {
    success: true,
    access: 'tok',
    refresh: 'ref',
    account_type: 'citizen',
    user: { id: '1', email: 'a@b.com', is_active: true, created_at: '2026-01-01' },
  };

  it('returns the full AuthResponse on success', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(makeResponse(successBody, 200));
    const result = await citizenLogin('a@b.com', 'pass');
    expect(result).toEqual(successBody);
  });

  it('sets the citizen memory token on success', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(makeResponse(successBody, 200));
    await citizenLogin('a@b.com', 'pass');
    expect(getMemoryToken('citizen')).toBe('tok');
  });

  it('posts to /api/auth/citizen/login', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(makeResponse(successBody, 200));
    await citizenLogin('a@b.com', 'pass');
    expect(fetch).toHaveBeenCalledWith(
      '/api/auth/citizen/login',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('throws with fallback message on 401 response', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(makeResponse({}, 401));
    await expect(citizenLogin('a@b.com', 'wrong')).rejects.toThrow(
      'Login failed. Please check your credentials.',
    );
  });

  it('throws with detail message on 500 response', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      makeResponse({ detail: 'Service temporarily unavailable.' }, 500),
    );
    await expect(citizenLogin('a@b.com', 'pass')).rejects.toThrow(
      'Service temporarily unavailable.',
    );
  });
});

// ─── citizenSignup ───────────────────────────────────────────

describe('citizenSignup', () => {
  const successBody = {
    success: true,
    access: 'signup-tok',
    refresh: 'signup-ref',
    account_type: 'citizen',
    user: { id: '2', email: 'new@b.com', is_active: false, created_at: '2026-01-02' },
  };

  it('returns AuthResponse on success', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(makeResponse(successBody, 200));
    const result = await citizenSignup('new@b.com', 'pass');
    expect(result).toEqual(successBody);
  });

  it('sets citizen memory token on success', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(makeResponse(successBody, 200));
    await citizenSignup('new@b.com', 'pass');
    expect(getMemoryToken('citizen')).toBe('signup-tok');
  });

  it('throws formatted field error on 400 with email array', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      makeResponse({ email: ['This email is already registered.'] }, 400),
    );
    await expect(citizenSignup('taken@b.com', 'pass')).rejects.toThrow(
      'Email: This email is already registered.',
    );
  });
});

// ─── refreshToken ────────────────────────────────────────────

describe('refreshToken', () => {
  it('returns new access token and sets memory token on success', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      makeResponse({ access: 'new-tok' }, 200),
    );
    const token = await refreshToken('citizen');
    expect(token).toBe('new-tok');
    expect(getMemoryToken('citizen')).toBe('new-tok');
  });

  it('calls /api/auth/refresh?type=citizen', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      makeResponse({ access: 'new-tok' }, 200),
    );
    await refreshToken('citizen');
    expect(fetch).toHaveBeenCalledWith('/api/auth/refresh?type=citizen', { method: 'POST' });
  });

  it('throws and clears memory token on 401', async () => {
    setMemoryToken('citizen', 'old-tok');
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(makeResponse({}, 401));
    await expect(refreshToken('citizen')).rejects.toThrow('Token refresh failed');
    expect(getMemoryToken('citizen')).toBeNull();
  });
});

// ─── citizenSignOut ──────────────────────────────────────────

describe('citizenSignOut', () => {
  it('clears the citizen memory token', async () => {
    setMemoryToken('citizen', 'tok');
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue(makeResponse({}, 200));
    await citizenSignOut();
    expect(getMemoryToken('citizen')).toBeNull();
  });
});

// ─── agencyLogin ─────────────────────────────────────────────

describe('agencyLogin', () => {
  const successBody = {
    success: true,
    access: 'ag-tok',
    account_type: 'agency',
    agency: {
      id: 'a1',
      agency_name: 'Test PD',
      agency_type: 'police',
      email: 'pd@test.com',
      profile: { service_radius: 10 },
    },
  };

  it('returns AgencyUser with mapped fields on success', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(makeResponse(successBody, 200));
    const user = await agencyLogin('pd@test.com', 'pass');
    expect(user.agencyName).toBe('Test PD');
    expect(user.agencyType).toBe('police');
    expect(user.radius).toBe(10);
    expect(user.id).toBe('a1');
    expect(user.email).toBe('pd@test.com');
  });

  it('sets memory token on success', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(makeResponse(successBody, 200));
    await agencyLogin('pd@test.com', 'pass');
    expect(getMemoryToken('agency')).toBe('ag-tok');
  });

  it('throws Error with detail message on 401', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      makeResponse({ detail: 'Invalid credentials.' }, 401),
    );
    await expect(agencyLogin('pd@test.com', 'wrong')).rejects.toThrow('Invalid credentials.');
  });

  it('throws EmailNotVerifiedError when response message contains "verif"', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      makeResponse({ detail: 'Please verify your email before logging in.' }, 403),
    );
    await expect(agencyLogin('pd@test.com', 'pass')).rejects.toThrow(EmailNotVerifiedError);
  });

  it('EmailNotVerifiedError carries the submitted email', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      makeResponse({ detail: 'Email not verified yet.' }, 403),
    );
    let caught: unknown;
    try {
      await agencyLogin('pd@test.com', 'pass');
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(EmailNotVerifiedError);
    expect((caught as EmailNotVerifiedError).email).toBe('pd@test.com');
  });
});

// ─── agencySignOut ───────────────────────────────────────────

describe('agencySignOut', () => {
  it('clears the agency memory token', async () => {
    setMemoryToken('agency', 'ag-tok');
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue(makeResponse({}, 200));
    await agencySignOut();
    expect(getMemoryToken('agency')).toBeNull();
  });
});

// ─── getAgencyProfile ────────────────────────────────────────

describe('getAgencyProfile', () => {
  it('returns mapped AgencyUser on 200', async () => {
    const body = {
      id: 'a1',
      agency_name: 'Fire Dept',
      agency_type: 'fire_rescue',
      email: 'fd@test.com',
      profile: { service_radius: 20, latitude_display: 9.1, longitude_display: 7.2 },
    };
    mockApiFetch.mockResolvedValueOnce(makeResponse(body, 200));
    const user = await getAgencyProfile();
    expect(user).not.toBeNull();
    expect(user!.agencyName).toBe('Fire Dept');
    expect(user!.lat).toBe(9.1);
    expect(user!.lng).toBe(7.2);
  });

  it('returns null on non-ok response', async () => {
    mockApiFetch.mockResolvedValueOnce(makeResponse({ detail: 'Not found.' }, 404));
    const user = await getAgencyProfile();
    expect(user).toBeNull();
  });
});
