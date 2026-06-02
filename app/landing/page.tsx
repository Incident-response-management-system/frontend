"use client";

import React from 'react';
import { LandingScreen } from '@/components/irms-citizen';
import { useRouter } from 'next/navigation';
import { getCookie, deleteCookie } from '@/lib/api-client';

export default function LandingPage() {
  const router = useRouter();
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    const citizenToken = getCookie('citizen_token');
    if (citizenToken) {
      // Decode or mock user load
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
