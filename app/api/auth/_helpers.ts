import { NextRequest, NextResponse } from 'next/server';

export const DJANGO = (
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8000/api/v1'
).replace(/\/$/, '');

export const IS_PROD = process.env.NODE_ENV === 'production';

export function cookieOpts(maxAgeSecs: number) {
  return {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAgeSecs,
  };
}

export async function djangoFetch(path: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(`${DJANGO}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
    });
  } catch {
    // Network-level failure — backend unreachable or BACKEND_URL not configured.
    return new Response(
      JSON.stringify({ detail: 'Backend service is unreachable. Please try again later.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    );
  }
}

export async function proxyError(res: Response) {
  const body = await res.text().catch(() => '');
  let json: unknown;
  try {
    json = JSON.parse(body || '{}');
  } catch {
    // Backend returned non-JSON (HTML error page, gateway error, etc.)
    json = { detail: 'Service temporarily unavailable. Please try again.' };
  }
  return NextResponse.json(json, { status: res.status });
}
