"use client";

import React from 'react';
import { MyReportsScreen } from '@/components/irms-citizen-center';
import { useRouter } from 'next/navigation';
import { deleteCookie } from '@/lib/api-client';
import { getCurrentUser } from '@/lib/auth-api';

export default function CitizenMyReportsPage() {
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
    router.push('/landing');
  };

  return <MyReportsScreen navigate={navigate} user={user} onSignOut={handleSignOut} />;
}
