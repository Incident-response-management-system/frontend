"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { deleteCookie } from '@/lib/api-client';
import { getCurrentUser } from '@/lib/auth-api';

// Dynamic import with SSR disabled to prevent Leaflet browser-only API crashes on Next build
const LandingScreen = dynamic(
  () => import('@/components/irms-citizen').then(mod => mod.LandingScreen),
  { ssr: false }
);

export default function LandingPage() {
  const router = useRouter();
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    getCurrentUser().then(setUser).catch(() => setUser(null));
  }, []);

  const navigate = (to: string, params: Record<string, any> = {}) => {
    if (to === 'back') { router.back(); return; }
    const routeMap: Record<string, string> = {
      'landing': '/landing',
      'report': '/report',
      'track': '/track',
      'citizen-signup': '/auth/citizen/signup',
      'citizen-login': '/auth/citizen/login',
      'my-reports': '/citizen/my-reports',
      'agency-signup': '/auth/agency/signup',
      'agency-login': '/auth/agency/login',
      'agency-dashboard': '/agency/dashboard',
    };
    let path = routeMap[to] || '/landing';
    if (Object.keys(params).length > 0) {
      path += `?${new URLSearchParams(params as any).toString()}`;
    }
    router.push(path);
  };

  const handleSignOut = () => {
    deleteCookie('citizen_token');
    setUser(null);
  };

  return <LandingScreen navigate={navigate} user={user} onSignOut={handleSignOut} />;
}
