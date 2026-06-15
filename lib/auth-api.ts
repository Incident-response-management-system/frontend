/**
 * Auth API Service
 * Integrated with live backend endpoints.
 * The Bearer token injection is handled by `apiFetch` via cookies.
 */

import { apiFetch, setCookie, deleteCookie, getCookie } from './api-client';

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
}

export async function agencySignup(payload: AgencySignupPayload): Promise<AgencyUser> {
  // STUB — replace with:
  // const res = await apiFetch('/auth/agency/signup', {
  //   method: 'POST',
  //   body: JSON.stringify(payload),
  //   tokenType: 'agency',
  // });
  // if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Agency signup failed'); }
  // const data = await res.json();
  // setCookie('agency_token', data.token);
  // return data.agency;

  await new Promise(r => setTimeout(r, 1000));

  const mockToken = `mock-agency-token-${Date.now()}`;
  setCookie('agency_token', mockToken);

  return {
    id: `agency_${Date.now()}`,
    agencyName: payload.agencyName,
    agencyType: payload.agencyType,
    email: payload.email,
    phone: payload.phone,
    radius: payload.radius,
    token: mockToken,
  };
}

export async function agencyLogin(
  email: string,
  password: string,
): Promise<AgencyUser> {
  // STUB — replace with:
  // const res = await apiFetch('/auth/agency/login', {
  //   method: 'POST',
  //   body: JSON.stringify({ email, password }),
  //   tokenType: 'agency',
  // });
  // if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Login failed'); }
  // const data = await res.json();
  // setCookie('agency_token', data.token);
  // return data.agency;

  await new Promise(r => setTimeout(r, 800));

  const mockToken = `mock-agency-token-${Date.now()}`;
  setCookie('agency_token', mockToken);

  return {
    id: 'agency_demo_001',
    agencyName: 'RCCG Camp Security',
    agencyType: 'security',
    email,
    radius: 25,
    token: mockToken,
  };
}

export async function agencySignOut(): Promise<void> {
  // STUB — replace with:
  // await apiFetch('/auth/agency/logout', { method: 'POST', tokenType: 'agency' });
  deleteCookie('agency_token');
}
