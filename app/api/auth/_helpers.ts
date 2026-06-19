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

export async function djangoFetch(path: string, init: RequestInit) {
  return fetch(`${DJANGO}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
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
