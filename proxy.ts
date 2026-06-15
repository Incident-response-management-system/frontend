import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ─── DEV BYPASS ──────────────────────────────────────────────────────────────
// Set to FALSE before any staging or production deployment.
// When true: citizens can access /citizen/my-reports without logging in.
// All auth code below remains intact — only the redirect is skipped.
// TO RESTORE: set BYPASS_CITIZEN_AUTH = false and restart the dev server.
// ─────────────────────────────────────────────────────────────────────────────
const BYPASS_CITIZEN_AUTH = false;

// Renamed from middleware.ts → proxy.ts for the Next.js 16 "proxy" file convention.
// Same behavior: gate the agency dashboard and citizen reports behind their auth cookies.
export default function proxy(request: NextRequest) {
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
  // AUTH BYPASS: skipped when BYPASS_CITIZEN_AUTH = true (dev only)
  if (!BYPASS_CITIZEN_AUTH && pathname.startsWith('/citizen/my-reports')) {
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
