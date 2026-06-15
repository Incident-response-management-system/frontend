/**
 * Auth API Service — talks to the live backend.
 * Bearer token injection is handled by `apiFetch` via cookies.
 */

import { apiFetch, getCookie, setCookie, deleteCookie, extractApiError } from './api-client';

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

/**
 * Thrown by agencyLogin when the backend rejects sign-in because the agency's
 * email is not verified yet. Carries the email so the UI can jump straight
 * into the OTP verification step.
 */
export class EmailNotVerifiedError extends Error {
  email: string;
  constructor(email: string, message = 'Please verify your email to continue.') {
    super(message);
    this.name = 'EmailNotVerifiedError';
    this.email = email;
  }
}

// Persist whatever access/refresh tokens an agency auth response carries.
function storeAgencyTokens(data: any): string {
  const access = data.access || data.token || data.access_token || '';
  if (access) setCookie('agency_token', access);
  const refresh = data.refresh || data.refresh_token;
  if (refresh) setCookie('agency_refresh', refresh, 7);
  return access;
}

// Shape an agency auth response into the AgencyUser the app renders.
function mapAgency(data: any, fallbackEmail: string, token: string): AgencyUser {
  const a = data.agency || data.user || data || {};
  return {
    id: a.id || '',
    agencyName: a.agency_name || '',
    agencyType: a.agency_type || '',
    email: a.email || fallbackEmail,
    phone: a.phone_number,
    radius: a.profile?.service_radius ?? 0,
    token,
  };
}

export async function agencySignup(payload: AgencySignupPayload): Promise<{ email: string }> {
  // Registration emails a 6-digit OTP and returns NO tokens. The agency must
  // confirm the code via agencyVerifyEmail() before it can sign in.
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
  return { email: payload.email };
}

// Verify the emailed 6-digit code. On success the backend returns a JWT, so the
// agency is signed in immediately (no separate login step needed).
export async function agencyVerifyEmail(email: string, otp: string): Promise<AgencyUser> {
  const res = await apiFetch('/auth/agency/verify-email/', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
    tokenType: 'agency',
  });
  if (!res.ok) {
    throw new Error(await extractApiError(res, 'Verification failed. Check the code and try again.'));
  }
  const data = await res.json();
  const token = storeAgencyTokens(data);
  return mapAgency(data, email, token);
}

// Request a fresh OTP (the backend enforces a 60s cooldown between sends).
export async function agencyResendOtp(email: string): Promise<void> {
  const res = await apiFetch('/auth/agency/resend-otp/', {
    method: 'POST',
    body: JSON.stringify({ email }),
    tokenType: 'agency',
  });
  if (!res.ok) {
    throw new Error(await extractApiError(res, 'Could not resend the code. Please try again shortly.'));
  }
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
    const message = await extractApiError(res, 'Login failed. Please check your credentials.');
    // The backend blocks login until the email is verified — surface that as a
    // typed error so the UI can route the user into OTP verification.
    if (/verif/i.test(message)) throw new EmailNotVerifiedError(email, message);
    throw new Error(message);
  }
  const data = await res.json();
  const token = storeAgencyTokens(data);
  return mapAgency(data, email, token);
}

// ─── Agency password reset (OTP-based) ───────────────────────
// These follow the same OTP convention as registration. The backend routes
// still need to be added:
//   POST /auth/agency/forgot-password/  { email }                     -> emails a 6-digit code
//   POST /auth/agency/reset-password/   { email, otp, new_password }  -> sets the new password
export async function agencyForgotPassword(email: string): Promise<void> {
  const res = await apiFetch('/auth/agency/forgot-password/', {
    method: 'POST',
    body: JSON.stringify({ email }),
    tokenType: 'agency',
  });
  if (!res.ok) {
    throw new Error(await extractApiError(res, 'Could not start password reset. Please try again.'));
  }
}

export async function agencyResetPassword(
  email: string,
  otp: string,
  newPassword: string,
): Promise<void> {
  const res = await apiFetch('/auth/agency/reset-password/', {
    method: 'POST',
    body: JSON.stringify({ email, otp, new_password: newPassword }),
    tokenType: 'agency',
  });
  if (!res.ok) {
    throw new Error(await extractApiError(res, 'Could not reset your password. Please try again.'));
  }
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
