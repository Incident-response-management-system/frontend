"use client";

import React from 'react';
import { MyReportsScreen } from '@/components/irms-citizen-center';
import { useRouter } from 'next/navigation';
import { deleteCookie } from '@/lib/api-client';

export default function CitizenMyReportsPage() {
  const router = useRouter();
  const [user, setUser] = React.useState<any>({ name: 'Chinedu Okafor', email: 'chinedu.okafor@example.com' });

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
    router.push('/landing');
  };

  return <MyReportsScreen navigate={navigate} user={user} onSignOut={handleSignOut} />;
}
