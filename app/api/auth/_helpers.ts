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
  const body = await res.text().catch(() => '{}');
  return NextResponse.json(JSON.parse(body || '{}'), { status: res.status });
}
