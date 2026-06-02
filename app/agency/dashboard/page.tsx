"use client";

import React from 'react';
import { DashboardScreen } from '@/components/irms-agency';
import { useRouter, useSearchParams } from 'next/navigation';
import { deleteCookie } from '@/lib/api-client';

export default function AgencyDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'overview';

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
    
    if (to === 'landing') {
      deleteCookie('agency_token');
    }
    
    router.push(routeMap[to] || '/landing');
  };

  return <DashboardScreen navigate={navigate} initialTab={tab} />;
}
