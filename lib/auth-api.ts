/**
 * Auth API Service — talks to the live backend.
 * Bearer token injection is handled by `apiFetch` via cookies.
 */

import { apiFetch, setCookie, deleteCookie, extractApiError } from './api-client';

// ─── Types ───────────────────────────────────────────────────

export interface CitizenUser {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  access: string;
  refresh: string;
  account_type: string;
  user: CitizenUser;
}

export interface AgencyUser {
  id: string;
  agencyName: string;
  agencyType: string;
  email: string;
  phone?: string;
  radius: number;
  token: string;
}

export interface AuthError {
  message: string;
  field?: string;
}

// ─── Citizen Auth ────────────────────────────────────────────

export async function citizenSignup(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const res = await apiFetch('/auth/user/signup/', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    tokenType: 'citizen',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Signup failed' }));
    throw new Error(err.message || err.detail || 'Signup failed');
  }

  const data: AuthResponse = await res.json();
  setCookie('citizen_token', data.access, 7);
  setCookie('citizen_refresh', data.refresh, 30);
  return data;
}

export async function citizenLogin(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const res = await apiFetch('/auth/user/login/', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    tokenType: 'citizen',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Login failed' }));
    throw new Error(err.message || err.detail || 'Login failed');
  }

  const data: AuthResponse = await res.json();
  setCookie('citizen_token', data.access, 7);
  setCookie('citizen_refresh', data.refresh, 30);
  return data;
}

export async function getCurrentUser(): Promise<CitizenUser> {
  const res = await apiFetch('/auth/user/me/', {
    tokenType: 'citizen',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch user');
  }

  return await res.json();
}

export async function refreshToken(): Promise<string> {
  const refresh = getCookie('citizen_refresh');
  if (!refresh) {
    throw new Error('No refresh token available');
  }

  const res = await apiFetch('/auth/token/refresh/', {
    method: 'POST',
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    deleteCookie('citizen_token');
    deleteCookie('citizen_refresh');
    throw new Error('Token refresh failed');
  }

  const data = await res.json();
  setCookie('citizen_token', data.access, 7);
  return data.access;
}

export async function citizenSignOut(): Promise<void> {
  deleteCookie('citizen_token');
  deleteCookie('citizen_refresh');
}

// ─── Agency Auth ─────────────────────────────────────────────

export interface AgencySignupPayload {
  agencyName: string;
  agencyType: string;
  email: string;
  phone: string;
  password: string;
  radius: number;
  latitude: number;
  longitude: number;
}

export async function agencySignup(payload: AgencySignupPayload): Promise<AgencyUser> {
  // Registration does NOT return tokens — the agency logs in separately afterwards.
  // latitude/longitude are REQUIRED by the backend.
  const res = await apiFetch('/auth/agency/register/', {
    method: 'POST',
    body: JSON.stringify({
      latitude: payload.latitude,
      longitude: payload.longitude,
      agency_name: payload.agencyName,
      agency_type: payload.agencyType,
      email: payload.email,
      password: payload.password,
      phone_number: payload.phone,
      service_radius: payload.radius,
    }),
    tokenType: 'agency',
  });
  if (!res.ok) {
    throw new Error(await extractApiError(res, 'Registration failed. Please try again.'));
  }
  // Auto-login so the user lands in the dashboard without a second form.
  return agencyLogin(payload.email, payload.password);
}

export async function agencyLogin(
  email: string,
  password: string,
): Promise<AgencyUser> {
  const res = await apiFetch('/auth/agency/login/', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    tokenType: 'agency',
  });
  if (!res.ok) {
    throw new Error(await extractApiError(res, 'Login failed. Please check your credentials.'));
  }
  const data = await res.json();
  // Store the access token in the agency_token cookie (apiFetch reads it back as Bearer).
  setCookie('agency_token', data.access);
  if (data.refresh) setCookie('agency_refresh', data.refresh, 7);

  const a = data.agency || {};
  return {
    id: a.id || '',
    agencyName: a.agency_name || '',
    agencyType: a.agency_type || '',
    email: a.email || email,
    phone: a.phone_number,
    radius: a.profile?.service_radius ?? 0,
    token: data.access,
  };
}

// The backend has no logout endpoint — JWTs are stateless. Signing out just
// clears the locally-stored access and refresh tokens.
export async function agencySignOut(): Promise<void> {
  deleteCookie('agency_token');
  deleteCookie('agency_refresh');
}

// ─── Agency profile (me) ─────────────────────────────────────

export async function getAgencyProfile(): Promise<AgencyUser | null> {
  const res = await apiFetch('/auth/agency/me/', { tokenType: 'agency' });
  if (!res.ok) return null;
  const data = await res.json();
  // /me returns the agency object directly (same shape as login's `agency`).
  const a = data.agency || data;
  return {
    id: a.id || '',
    agencyName: a.agency_name || '',
    agencyType: a.agency_type || '',
    email: a.email || '',
    phone: a.phone_number,
    radius: a.profile?.service_radius ?? 0,
    token: '',
  };
}
