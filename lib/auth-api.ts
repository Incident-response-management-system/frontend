/**
 * Auth API Service
 * All functions are STUBBED — no live backend yet.
 * To activate: replace each stub block with an actual `apiFetch` call.
 * The Bearer token injection is already handled by `apiFetch` via cookies.
 */

import { apiFetch, setCookie, deleteCookie } from './api-client';

// ─── Types ───────────────────────────────────────────────────

export interface CitizenUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  token: string;
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
  name: string,
  email: string,
  password: string,
  phone?: string,
): Promise<CitizenUser> {
  // STUB — replace with:
  // const res = await apiFetch('/auth/citizen/signup', {
  //   method: 'POST',
  //   body: JSON.stringify({ name, email, password, phone }),
  //   tokenType: 'citizen',
  // });
  // if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Signup failed'); }
  // const data = await res.json();
  // setCookie('citizen_token', data.token);
  // return data.user;

  // STUB: simulate network delay
  await new Promise(r => setTimeout(r, 900));

  const mockToken = `mock-citizen-token-${Date.now()}`;
  setCookie('citizen_token', mockToken);

  return {
    id: `usr_${Date.now()}`,
    name,
    email,
    phone,
    token: mockToken,
  };
}

export async function citizenLogin(
  email: string,
  password: string,
): Promise<CitizenUser> {
  // STUB — replace with:
  // const res = await apiFetch('/auth/citizen/login', {
  //   method: 'POST',
  //   body: JSON.stringify({ email, password }),
  //   tokenType: 'citizen',
  // });
  // if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Login failed'); }
  // const data = await res.json();
  // setCookie('citizen_token', data.token);
  // return data.user;

  await new Promise(r => setTimeout(r, 800));

  const mockToken = `mock-citizen-token-${Date.now()}`;
  setCookie('citizen_token', mockToken);

  return {
    id: 'usr_demo_001',
    name: 'Chinedu Okafor',
    email,
    phone: '+234 803 555 0184',
    token: mockToken,
  };
}

export async function citizenSignOut(): Promise<void> {
  // STUB — replace with:
  // await apiFetch('/auth/citizen/logout', { method: 'POST', tokenType: 'citizen' });
  deleteCookie('citizen_token');
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
  // Registration does NOT return tokens — the agency logs in separately afterwards.
  // latitude/longitude are optional on the backend; omit when not collected.
  const res = await apiFetch('/auth/agency/register/', {
    method: 'POST',
    body: JSON.stringify({
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
    let message = 'Registration failed. Please try again.';
    try { const err = await res.json(); message = err.detail || err.message || message; } catch { /* non-JSON */ }
    throw new Error(message);
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
    let message = 'Login failed. Please check your credentials.';
    try { const err = await res.json(); message = err.detail || err.message || message; } catch { /* non-JSON */ }
    throw new Error(message);
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
