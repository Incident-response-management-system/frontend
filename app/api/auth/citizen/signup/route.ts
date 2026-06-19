import { NextRequest, NextResponse } from 'next/server';
import { djangoFetch, proxyError, cookieOpts } from '../../_helpers';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await djangoFetch('/auth/user/signup/', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (!res.ok) return proxyError(res);

  const data = await res.json();
  const response = NextResponse.json({
    success: data.success,
    message: data.message,
    access: data.access,
    account_type: data.account_type,
    user: data.user,
  });
  if (data.refresh) {
    response.cookies.set('citizen_refresh', data.refresh, cookieOpts(30 * 86400));
  }
  return response;
}
