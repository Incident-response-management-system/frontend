// Custom lightweight fetch-based API client for remote Backend URL integration

/**
 * Normalize the configured backend base URL so it can never produce mixed-content
 * or double-slash bugs regardless of how NEXT_PUBLIC_API_URL is set in the host
 * environment (e.g. a Vercel env var pointing at "http://host/"):
 *  - strip trailing slashes so `${BASE_URL}/path` never yields `//path`
 *  - upgrade http -> https for non-localhost hosts when the page is served over
 *    HTTPS, since browsers block insecure resources loaded from a secure page.
 */
function normalizeBaseUrl(raw: string): string {
  let url = raw.trim().replace(/\/+$/, '');
  const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)/i.test(url);
  const pageIsHttps =
    typeof window !== 'undefined' && window.location.protocol === 'https:';
  if (url.startsWith('http://') && !isLocalhost && pageIsHttps) {
    url = `https://${url.slice('http://'.length)}`;
  }
  return url;
}

const RAW_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// snake_case backend field -> friendly label for user-facing messages.
const FIELD_LABELS: Record<string, string> = {
  agency_name: 'Agency name',
  agency_type: 'Agency type',
  email: 'Email',
  password: 'Password',
  phone_number: 'Phone number',
  service_radius: 'Service radius',
  latitude: 'Latitude',
  longitude: 'Longitude',
  status: 'Status',
};

function humanizeField(field: string): string {
  if (FIELD_LABELS[field]) return FIELD_LABELS[field];
  return field.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
}

/**
 * Pull a clean, NON-TECHNICAL message out of a failed Response. Handles DRF
 * JSON ({detail} / {message} / {field: [msg]} / {non_field_errors:[...]}) and
 * degrades gracefully on non-JSON (e.g. a server HTML error page) without
 * leaking field names, status codes, or backend internals to the user.
 */
export async function extractApiError(res: Response, fallback: string): Promise<string> {
  const body = await res.text().catch(() => '');
  if (!body) return fallback;
  try {
    const data = JSON.parse(body);
    if (typeof data === 'string') return data;
    if (typeof data.detail === 'string') return data.detail;
    if (typeof data.message === 'string') return data.message;

    const firstField = Object.keys(data)[0];
    if (firstField) {
      const v = data[firstField];
      const msg = Array.isArray(v) ? v[0] : v;
      if (typeof msg !== 'string') return fallback;
      // non_field_errors / detail are generic buckets — show the message alone.
      if (firstField === 'non_field_errors' || firstField === 'detail') return msg;
      return `${humanizeField(firstField)}: ${msg}`;
    }
    return fallback;
  } catch {
    // Non-JSON (HTML error page, gateway error, etc.) — never show the markup.
    return fallback;
  }
}

// ─── In-memory token store ──────────────────────────────────────────────────
// Access tokens live here after login. Refresh tokens are in HttpOnly cookies
// managed by Next.js API routes — JS can never read or steal them.
const _tokens: Record<string, string> = {};

export function setMemoryToken(type: 'agency' | 'citizen', token: string) {
  _tokens[type] = token;
}

export function getMemoryToken(type: 'agency' | 'citizen'): string | null {
  return _tokens[type] || null;
}

export function clearMemoryToken(type?: 'agency' | 'citizen') {
  if (type) delete _tokens[type];
  else { delete _tokens.agency; delete _tokens.citizen; }
}

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
  const secure = window.location.protocol === 'https:' ? ' Secure;' : '';
  document.cookie = `${name}=${value || ''}${expires}; path=/; SameSite=Lax;${secure}`;
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
  /** When true, a 401 clears stale cookies but does not redirect to login. */
  authOptional?: boolean;
}

export async function apiFetch(endpoint: string, options: RequestOptions = {}) {
  // Normalize per request so the protocol upgrade sees the live page context
  // (window is undefined at module-load during SSR).
  const baseUrl = normalizeBaseUrl(RAW_BASE_URL);
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  // Headers configuration
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Auto-inject tokens — prefer in-memory (set by Next.js auth routes), fall back to cookie
  const tokenType = options.tokenType || (url.includes('/agency') ? 'agency' : 'citizen');
  const token = getMemoryToken(tokenType) || getCookie(`${tokenType}_token`);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Inject reporter session ID for anonymous users
  if (options.useReporterSession && !token) {
    headers.set('X-Reporter-Session-Id', getReporterSessionId());
  }

  const fetchOpts: RequestInit = { ...options, headers };
  let response = await fetch(url, fetchOpts);

  // Stale access token: try silent refresh via Next.js route, then retry once.
  if (response.status === 401 && token) {
    clearMemoryToken(tokenType);
    deleteCookie(`${tokenType}_token`);

    // Attempt silent refresh — the HttpOnly refresh cookie is sent automatically
    const refreshRes = await fetch(`/api/auth/refresh?type=${tokenType}`, { method: 'POST' }).catch(() => null);
    if (refreshRes?.ok) {
      const refreshData = await refreshRes.json().catch(() => null);
      if (refreshData?.access) {
        setMemoryToken(tokenType, refreshData.access);
        headers.set('Authorization', `Bearer ${refreshData.access}`);
        response = await fetch(url, { ...fetchOpts, headers });
      }
    }

    // Still 401 after refresh attempt — clear everything and redirect/retry
    if (response.status === 401) {
      clearMemoryToken(tokenType);
      deleteCookie('agency_token'); deleteCookie('citizen_token');
      deleteCookie('agency_refresh'); deleteCookie('citizen_refresh');

      if (options.authOptional) {
        headers.delete('Authorization');
        if (options.useReporterSession) headers.set('X-Reporter-Session-Id', getReporterSessionId());
        response = await fetch(url, { ...fetchOpts, headers });
      } else if (typeof window !== 'undefined') {
        window.location.href = tokenType === 'agency' ? '/auth/agency/login' : '/auth/citizen/login';
      }
    }
  }

  return response;
}
