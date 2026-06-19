import { NextRequest, NextResponse } from 'next/server';
import { djangoFetch } from '../_helpers';

export async function POST(req: NextRequest) {
  const type = (req.nextUrl.searchParams.get('type') || 'citizen') as 'citizen' | 'agency';
  const cookieName = `${type}_refresh`;
  const refresh = req.cookies.get(cookieName)?.value;

  // Blacklist on backend if we have the refresh token
  if (refresh) {
    await djangoFetch('/auth/logout/', {
      method: 'POST',
      body: JSON.stringify({ refresh }),
    }).catch(() => {});
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete(cookieName);
  return response;
}
