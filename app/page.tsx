"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { getCookie, deleteCookie } from '@/lib/api-client';

// Dynamic import with SSR disabled to prevent Leaflet browser-only API crashes on Next build
const LandingScreen = dynamic(
  () => import('@/components/irms-citizen').then(mod => mod.LandingScreen),
  { ssr: false }
);

export default function Home() {
  const router = useRouter();
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    const citizenToken = getCookie('citizen_token');
    if (citizenToken) {
      setUser({ name: 'Chinedu Okafor', email: 'chinedu.okafor@example.com' });
    }
  }, []);

  const navigate = (to: string) => {
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
    router.push(routeMap[to] || '/landing');
  };

  const handleSignOut = () => {
    deleteCookie('citizen_token');
    setUser(null);
  };

  return <LandingScreen navigate={navigate} user={user} onSignOut={handleSignOut} />;
}
