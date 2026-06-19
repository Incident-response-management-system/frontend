import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  extractApiError,
  setMemoryToken,
  getMemoryToken,
  clearMemoryToken,
  getCookie,
  setCookie,
  deleteCookie,
  apiFetch,
} from '@/lib/api-client';

vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:8000/api/v1');

beforeEach(() => {
  vi.clearAllMocks();
  clearMemoryToken();
});

describe('extractApiError', () => {
  it('empty body -> returns fallback', async () => {
    const res = new Response('', { status: 400 });
    expect(await extractApiError(res, 'fallback error')).toBe('fallback error');
  });

  it('non-JSON body -> returns fallback', async () => {
    const res = new Response('<html>error</html>', { status: 400 });
    expect(await extractApiError(res, 'fallback error')).toBe('fallback error');
  });

  it('{ detail } -> returns detail string', async () => {
    const res = new Response(JSON.stringify({ detail: 'Not found.' }), { status: 400 });
    expect(await extractApiError(res, 'fallback')).toBe('Not found.');
  });

  it('{ message } -> returns message string', async () => {
    const res = new Response(JSON.stringify({ message: 'Oops' }), { status: 400 });
    expect(await extractApiError(res, 'fallback')).toBe('Oops');
  });

  it('field array error -> humanized field: message', async () => {
    const res = new Response(JSON.stringify({ email: ['This field is required.'] }), { status: 400 });
    expect(await extractApiError(res, 'fallback')).toBe('Email: This field is required.');
  });

  it('non_field_errors -> message without field prefix', async () => {
    const res = new Response(JSON.stringify({ non_field_errors: ['Invalid credentials.'] }), { status: 400 });
    expect(await extractApiError(res, 'fallback')).toBe('Invalid credentials.');
  });

  it('agency_name field -> humanized label prefix', async () => {
    const res = new Response(JSON.stringify({ agency_name: ['This field must be unique.'] }), { status: 400 });
    expect(await extractApiError(res, 'fallback')).toBe('Agency name: This field must be unique.');
  });

  it('plain string JSON -> returns that string', async () => {
    const res = new Response(JSON.stringify('some error'), { status: 400 });
    expect(await extractApiError(res, 'fallback')).toBe('some error');
  });

  it('object with unknown field structure -> returns fallback', async () => {
    const res = new Response(JSON.stringify({ unknown_key: { nested: true } }), { status: 400 });
    expect(await extractApiError(res, 'fallback')).toBe('fallback');
  });
});

describe('memory token store', () => {
  it('set citizen token -> getMemoryToken returns it', () => {
    setMemoryToken('citizen', 'citizen-access-token');
    expect(getMemoryToken('citizen')).toBe('citizen-access-token');
  });

  it('set agency token -> getMemoryToken returns it', () => {
    setMemoryToken('agency', 'agency-access-token');
    expect(getMemoryToken('agency')).toBe('agency-access-token');
  });

  it('clearMemoryToken citizen -> citizen null, agency untouched', () => {
    setMemoryToken('citizen', 'citizen-token');
    setMemoryToken('agency', 'agency-token');
    clearMemoryToken('citizen');
    expect(getMemoryToken('citizen')).toBeNull();
    expect(getMemoryToken('agency')).toBe('agency-token');
  });

  it('clearMemoryToken() with no arg -> both cleared', () => {
    setMemoryToken('citizen', 'citizen-token');
    setMemoryToken('agency', 'agency-token');
    clearMemoryToken();
    expect(getMemoryToken('citizen')).toBeNull();
    expect(getMemoryToken('agency')).toBeNull();
  });
});

describe('cookie helpers', () => {
  it('setCookie then getCookie returns value', () => {
    setCookie('test_key', 'hello');
    expect(getCookie('test_key')).toBe('hello');
  });

  it('deleteCookie then getCookie returns null', () => {
    setCookie('test_key', 'hello');
    deleteCookie('test_key');
    expect(getCookie('test_key')).toBeNull();
  });

  it('getCookie on non-existent key returns null', () => {
    expect(getCookie('nonexistent_key_xyz')).toBeNull();
  });
});

describe('apiFetch - token injection', () => {
  it('injects Authorization header when memory token is set', async () => {
    setMemoryToken('citizen', 'my-access-token');
    const mockFetch = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', mockFetch);

    await apiFetch('/some/path', { tokenType: 'citizen' });

    const headers: Headers = mockFetch.mock.calls[0][1].headers;
    expect(headers.get('Authorization')).toBe('Bearer my-access-token');
  });
});

describe('apiFetch - 401 silent refresh', () => {
  it('retries with new token after successful refresh', async () => {
    setMemoryToken('citizen', 'old-token');

    const mockFetch = vi.fn()
      .mockResolvedValueOnce(new Response('{}', { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ access: 'new-token' }), { status: 200 }))
      .mockResolvedValueOnce(new Response('{}', { status: 200 }));

    vi.stubGlobal('fetch', mockFetch);

    const result = await apiFetch('/some/path', { tokenType: 'citizen' });

    expect(result.status).toBe(200);
    expect(getMemoryToken('citizen')).toBe('new-token');
  });
});

describe('apiFetch - persistent 401 after failed refresh', () => {
  it('redirects to citizen login when refresh also fails', async () => {
    Object.defineProperty(window, 'location', {
      value: { href: '', protocol: 'https:' },
      writable: true,
    });

    setMemoryToken('citizen', 'stale-token');

    const mockFetch = vi.fn().mockResolvedValue(new Response('{}', { status: 401 }));
    vi.stubGlobal('fetch', mockFetch);

    await apiFetch('/some/path', { tokenType: 'citizen' });

    expect(window.location.href).toBe('/auth/citizen/login');
  });
});
