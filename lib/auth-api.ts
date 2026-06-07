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
