import { NextRequest, NextResponse } from 'next/server';
import { djangoFetch, cookieOpts } from '../_helpers';

export async function POST(req: NextRequest) {
  const type = (req.nextUrl.searchParams.get('type') || 'citizen') as 'citizen' | 'agency';
  const cookieName = `${type}_refresh`;
  const refresh = req.cookies.get(cookieName)?.value;

  if (!refresh) {
    return NextResponse.json({ detail: 'No refresh token' }, { status: 401 });
  }

  const res = await djangoFetch('/auth/token/refresh/', {
    method: 'POST',
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    const response = NextResponse.json({ detail: 'Session expired' }, { status: 401 });
    response.cookies.delete(cookieName);
    return response;
  }

  const data = await res.json();
  const response = NextResponse.json({ access: data.access });
  // Rotate the refresh cookie if the backend returned a new one
  if (data.refresh) {
    const maxAge = type === 'citizen' ? 30 * 86400 : 7 * 86400;
    response.cookies.set(cookieName, data.refresh, cookieOpts(maxAge));
  }
  return response;
}
