// Custom lightweight fetch-based API client for remote Backend URL integration

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

// Helper to get cookies in browser/server context
export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// Helper to set cookies in browser context
export function setCookie(name: string, value: string, days = 7) {
  if (typeof window === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `; expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value || ''}${expires}; path=/; SameSite=Lax;`;
}

// Helper to delete cookies in browser context
export function deleteCookie(name: string) {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
}

// Anonymous reporter session management
const SESSION_KEY = 'irms_reporter_session_id';

export function getReporterSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

interface RequestOptions extends RequestInit {
  tokenType?: 'agency' | 'citizen';
  useReporterSession?: boolean;
}

export async function apiFetch(endpoint: string, options: RequestOptions = {}) {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  // Headers configuration
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Auto-inject tokens if they exist in cookies
  const tokenType = options.tokenType || (url.includes('/agency') ? 'agency' : 'citizen');
  const token = getCookie(`${tokenType}_token`);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Inject reporter session ID for anonymous users
  if (options.useReporterSession && !token) {
    headers.set('X-Reporter-Session-Id', getReporterSessionId());
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle auto-unauth redirection
  if (response.status === 401) {
    deleteCookie('agency_token');
    deleteCookie('citizen_token');
    if (typeof window !== 'undefined') {
      const redirectUrl = url.includes('/agency') ? '/auth/agency/login' : '/auth/citizen/login';
      window.location.href = redirectUrl;
    }
  }

  return response;
}
