import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

class MockCookieStore {
  private store: Record<string, { value: string; options?: any }> = {};
  set(name: string, value: string, options?: any) { this.store[name] = { value, options }; }
  get(name: string) { return this.store[name]; }
  delete(name: string) { delete this.store[name]; }
  getAll() { return Object.entries(this.store).map(([name, v]) => ({ name, ...v })); }
}

class MockNextResponse {
  _body: any;
  status: number;
  cookies: MockCookieStore;
  headers: Headers;

  constructor(body: any, init: { status?: number } = {}) {
    this._body = body;
    this.status = init.status ?? 200;
    this.cookies = new MockCookieStore();
    this.headers = new Headers();
  }

  static json(data: any, init: { status?: number } = {}) {
    return new MockNextResponse(data, init);
  }

  async json() { return this._body; }
}

class MockNextRequest {
  private _body: string;
  nextUrl: URL;
  cookies: { get: (n: string) => { value: string } | undefined };

  constructor(url: string, init: { method?: string; body?: string; cookies?: Record<string, string> } = {}) {
    this._body = init.body ?? '{}';
    this.nextUrl = new URL(url);
    const cookieMap = init.cookies ?? {};
    this.cookies = { get: (n: string) => cookieMap[n] ? { value: cookieMap[n] } : undefined };
  }

  async json() { return JSON.parse(this._body); }
}

vi.mock('next/server', () => ({
  NextResponse: MockNextResponse,
  NextRequest: MockNextRequest,
}));

function stubFetch(body: object | string, status = 200) {
  const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(bodyStr, { status })));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('_helpers', () => {
  describe('cookieOpts', () => {
    it('returns httpOnly true', async () => {
      const { cookieOpts } = await import('@/app/api/auth/_helpers');
      const opts = cookieOpts(3600);
      expect(opts.httpOnly).toBe(true);
    });

    it('sets maxAge to the passed value', async () => {
      const { cookieOpts } = await import('@/app/api/auth/_helpers');
      const opts = cookieOpts(7200);
      expect(opts.maxAge).toBe(7200);
    });

    it('sets path to /', async () => {
      const { cookieOpts } = await import('@/app/api/auth/_helpers');
      const opts = cookieOpts(3600);
      expect(opts.path).toBe('/');
    });

    it('sets sameSite to lax', async () => {
      const { cookieOpts } = await import('@/app/api/auth/_helpers');
      const opts = cookieOpts(3600);
      expect(opts.sameSite).toBe('lax');
    });
  });

  describe('djangoFetch', () => {
    beforeEach(() => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}')));
    });

    it('calls fetch with the DJANGO base URL prepended to path', async () => {
      const { djangoFetch, DJANGO } = await import('@/app/api/auth/_helpers');
      await djangoFetch('/auth/test/', { method: 'POST' });
      expect(vi.mocked(fetch)).toHaveBeenCalledWith(
        `${DJANGO}/auth/test/`,
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('always includes Content-Type: application/json header', async () => {
      const { djangoFetch } = await import('@/app/api/auth/_helpers');
      await djangoFetch('/auth/test/', { method: 'GET' });
      const callArgs = vi.mocked(fetch).mock.calls[0][1] as RequestInit;
      expect((callArgs.headers as Record<string, string>)['Content-Type']).toBe('application/json');
    });

    it('returns the raw Response object', async () => {
      const { djangoFetch } = await import('@/app/api/auth/_helpers');
      const result = await djangoFetch('/auth/test/', { method: 'GET' });
      expect(result).toBeInstanceOf(Response);
    });

    it('returns 503 JSON instead of throwing when fetch rejects (network error / wrong BACKEND_URL)', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));
      const { djangoFetch } = await import('@/app/api/auth/_helpers');
      const result = await djangoFetch('/auth/user/login/', { method: 'POST', body: '{}' });
      expect(result.status).toBe(503);
      const body = await result.json();
      expect(body.detail).toMatch(/unreachable/i);
    });
  });

  describe('proxyError', () => {
    it('parses JSON body and preserves status', async () => {
      const { proxyError } = await import('@/app/api/auth/_helpers');
      const res = new Response(JSON.stringify({ detail: 'Not found' }), { status: 404 });
      const response = await proxyError(res) as MockNextResponse;
      expect(response.status).toBe(404);
      expect(await response.json()).toMatchObject({ detail: 'Not found' });
    });

    it('returns empty object body on empty response body', async () => {
      const { proxyError } = await import('@/app/api/auth/_helpers');
      const res = new Response('', { status: 400 });
      const response = await proxyError(res) as MockNextResponse;
      expect(await response.json()).toMatchObject({});
      expect(response.status).toBe(400);
    });

    it('does not throw on non-JSON HTML body and returns 502 with safe message', async () => {
      const { proxyError } = await import('@/app/api/auth/_helpers');
      const res = new Response('<html>Internal Server Error</html>', { status: 502 });
      let response: MockNextResponse;
      await expect(async () => {
        response = await proxyError(res) as MockNextResponse;
      }).not.toThrow();
      response = await proxyError(new Response('<html>Internal Server Error</html>', { status: 502 })) as MockNextResponse;
      expect(response.status).toBe(502);
      const body = await response.json();
      expect(body.detail).toBe('Service temporarily unavailable. Please try again.');
    });

    it('passes through parsed validation error object', async () => {
      const { proxyError } = await import('@/app/api/auth/_helpers');
      const res = new Response(JSON.stringify({ email: ['required'] }), { status: 400 });
      const response = await proxyError(res) as MockNextResponse;
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body).toMatchObject({ email: ['required'] });
    });
  });
});

describe('Citizen Login Route', () => {
  function makeReq(body: object, url = 'http://localhost/api/auth/citizen/login') {
    return new MockNextRequest(url, { body: JSON.stringify(body) });
  }

  it('success: status 200, body has access and user.email, cookie set', async () => {
    stubFetch({
      success: true,
      access: 'acc-tok',
      refresh: 'ref-tok',
      account_type: 'citizen',
      user: { id: 'u1', email: 'a@b.com' },
    });
    const { POST: citizenLoginPOST } = await import('@/app/api/auth/citizen/login/route');
    const response = await citizenLoginPOST(makeReq({ email: 'a@b.com', password: 'pass' }) as any) as MockNextResponse;
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.access).toBe('acc-tok');
    expect(body.user.email).toBe('a@b.com');
    expect(response.cookies.get('citizen_refresh')?.value).toBe('ref-tok');
    expect(response.cookies.get('citizen_refresh')?.options?.httpOnly).toBe(true);
  });

  it('failure 401: status 401, body has detail, no citizen_refresh cookie', async () => {
    stubFetch({ detail: 'Invalid credentials.' }, 401);
    const { POST: citizenLoginPOST } = await import('@/app/api/auth/citizen/login/route');
    const response = await citizenLoginPOST(makeReq({ email: 'a@b.com', password: 'wrong' }) as any) as MockNextResponse;
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.detail).toBe('Invalid credentials.');
    expect(response.cookies.get('citizen_refresh')).toBeUndefined();
  });

  it('non-JSON 502 backend error does not throw, returns 502 with safe message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() =>
      Promise.resolve(new Response('<html>Error</html>', { status: 502 }))
    ));
    const { POST: citizenLoginPOST } = await import('@/app/api/auth/citizen/login/route');
    let response: MockNextResponse;
    await expect(async () => {
      response = await citizenLoginPOST(makeReq({ email: 'a@b.com', password: 'pass' }) as any) as MockNextResponse;
    }).not.toThrow();
    response = await citizenLoginPOST(makeReq({ email: 'a@b.com', password: 'pass' }) as any) as MockNextResponse;
    expect(response.status).toBe(502);
    const body = await response.json();
    expect(body.detail).toBe('Service temporarily unavailable. Please try again.');
  });

  it('no refresh token from backend: citizen_refresh cookie not set', async () => {
    stubFetch({
      success: true,
      access: 'acc-tok',
      account_type: 'citizen',
      user: {},
    });
    const { POST: citizenLoginPOST } = await import('@/app/api/auth/citizen/login/route');
    const response = await citizenLoginPOST(makeReq({ email: 'a@b.com', password: 'pass' }) as any) as MockNextResponse;
    expect(response.cookies.get('citizen_refresh')).toBeUndefined();
  });
});

describe('Agency Login Route', () => {
  function makeReq(body: object, url = 'http://localhost/api/auth/agency/login') {
    return new MockNextRequest(url, { body: JSON.stringify(body) });
  }

  it('success: body has agency.agency_name, cookie agency_refresh set with httpOnly', async () => {
    stubFetch({
      success: true,
      access: 'ag-tok',
      refresh: 'ag-ref',
      account_type: 'agency',
      agency: { id: 'a1', agency_name: 'Test PD', agency_type: 'police' },
    });
    const { POST: agencyLoginPOST } = await import('@/app/api/auth/agency/login/route');
    const response = await agencyLoginPOST(makeReq({ email: 'agency@gov.com', password: 'pass' }) as any) as MockNextResponse;
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.agency.agency_name).toBe('Test PD');
    expect(response.cookies.get('agency_refresh')?.value).toBe('ag-ref');
    expect(response.cookies.get('agency_refresh')?.options?.httpOnly).toBe(true);
  });

  it('email not verified 400: status 400, detail preserved', async () => {
    stubFetch({ detail: 'Please verify your email.' }, 400);
    const { POST: agencyLoginPOST } = await import('@/app/api/auth/agency/login/route');
    const response = await agencyLoginPOST(makeReq({ email: 'agency@gov.com', password: 'pass' }) as any) as MockNextResponse;
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.detail).toBe('Please verify your email.');
  });

  it('no refresh from backend: agency_refresh cookie not set', async () => {
    stubFetch({
      success: true,
      access: 'ag-tok',
      account_type: 'agency',
      agency: { id: 'a1', agency_name: 'Test PD', agency_type: 'police' },
    });
    const { POST: agencyLoginPOST } = await import('@/app/api/auth/agency/login/route');
    const response = await agencyLoginPOST(makeReq({ email: 'agency@gov.com', password: 'pass' }) as any) as MockNextResponse;
    expect(response.cookies.get('agency_refresh')).toBeUndefined();
  });
});

describe('Citizen Signup Route', () => {
  function makeReq(body: object, url = 'http://localhost/api/auth/citizen/signup') {
    return new MockNextRequest(url, { body: JSON.stringify(body) });
  }

  it('success: response has access, citizen_refresh cookie set', async () => {
    stubFetch({
      success: true,
      access: 'tok',
      refresh: 'ref',
      user: { id: 'u1', email: 'a@b.com' },
    });
    const { POST: citizenSignupPOST } = await import('@/app/api/auth/citizen/signup/route');
    const response = await citizenSignupPOST(makeReq({ email: 'a@b.com', password: 'pass' }) as any) as MockNextResponse;
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.access).toBe('tok');
    expect(response.cookies.get('citizen_refresh')?.value).toBe('ref');
  });

  it('duplicate email 409: status 409 forwarded', async () => {
    stubFetch({ email: ['A user with that email already exists.'] }, 409);
    const { POST: citizenSignupPOST } = await import('@/app/api/auth/citizen/signup/route');
    const response = await citizenSignupPOST(makeReq({ email: 'a@b.com', password: 'pass' }) as any) as MockNextResponse;
    expect(response.status).toBe(409);
    const body = await response.json();
    expect(body.email).toEqual(['A user with that email already exists.']);
  });
});

describe('Agency Verify Email Route', () => {
  function makeReq(body: object, url = 'http://localhost/api/auth/agency/verify-email') {
    return new MockNextRequest(url, { body: JSON.stringify(body) });
  }

  it('success: response has access, agency_refresh cookie set', async () => {
    stubFetch({
      success: true,
      access: 'tok',
      refresh: 'ref',
      agency: { id: 'a1' },
    });
    const { POST: agencyVerifyPOST } = await import('@/app/api/auth/agency/verify-email/route');
    const response = await agencyVerifyPOST(makeReq({ otp: '123456' }) as any) as MockNextResponse;
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.access).toBe('tok');
    expect(response.cookies.get('agency_refresh')?.value).toBe('ref');
  });

  it('wrong OTP 400: status 400, detail preserved', async () => {
    stubFetch({ detail: 'Invalid OTP.' }, 400);
    const { POST: agencyVerifyPOST } = await import('@/app/api/auth/agency/verify-email/route');
    const response = await agencyVerifyPOST(makeReq({ otp: '000000' }) as any) as MockNextResponse;
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.detail).toBe('Invalid OTP.');
  });
});

describe('Refresh Route', () => {
  function makeRefreshReq(type: string, cookies: Record<string, string>) {
    return new MockNextRequest(`http://localhost/api/auth/refresh?type=${type}`, { cookies });
  }

  it('citizen refresh success: response has access, no new cookie set', async () => {
    stubFetch({ access: 'new-tok' });
    const { POST: refreshPOST } = await import('@/app/api/auth/refresh/route');
    const response = await refreshPOST(makeRefreshReq('citizen', { citizen_refresh: 'ref-tok' }) as any) as MockNextResponse;
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.access).toBe('new-tok');
    expect(response.cookies.get('citizen_refresh')).toBeUndefined();
  });

  it('citizen refresh with rotation: citizen_refresh cookie updated', async () => {
    stubFetch({ access: 'new-tok', refresh: 'rotated-ref' });
    const { POST: refreshPOST } = await import('@/app/api/auth/refresh/route');
    const response = await refreshPOST(makeRefreshReq('citizen', { citizen_refresh: 'ref-tok' }) as any) as MockNextResponse;
    expect(response.cookies.get('citizen_refresh')?.value).toBe('rotated-ref');
  });

  it('no refresh cookie: response status 401', async () => {
    stubFetch({ access: 'new-tok' });
    const { POST: refreshPOST } = await import('@/app/api/auth/refresh/route');
    const response = await refreshPOST(makeRefreshReq('citizen', {}) as any) as MockNextResponse;
    expect(response.status).toBe(401);
  });

  it('backend refresh failure 401: response status 401, citizen_refresh cookie deleted', async () => {
    stubFetch({ detail: 'Token is invalid or expired' }, 401);
    const { POST: refreshPOST } = await import('@/app/api/auth/refresh/route');
    const response = await refreshPOST(makeRefreshReq('citizen', { citizen_refresh: 'stale-ref' }) as any) as MockNextResponse;
    expect(response.status).toBe(401);
    expect(response.cookies.get('citizen_refresh')).toBeUndefined();
  });
});
