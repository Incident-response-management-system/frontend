import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect Agency Dashboard
  if (pathname.startsWith('/agency/dashboard')) {
    const token = request.cookies.get('agency_token')?.value;
    if (!token) {
      const loginUrl = new URL('/auth/agency/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect Citizen My Reports
  if (pathname.startsWith('/citizen/my-reports')) {
    const token = request.cookies.get('citizen_token')?.value;
    if (!token) {
      const loginUrl = new URL('/auth/citizen/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Config to specify matching routes
export const config = {
  matcher: [
    '/agency/dashboard/:path*',
    '/citizen/my-reports/:path*',
  ],
};
