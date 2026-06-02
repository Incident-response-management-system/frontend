"use client";

import React from 'react';
import { AgencyLoginScreen } from '@/components/irms-auth';
import { useRouter } from 'next/navigation';
import { setCookie } from '@/lib/api-client';

export default function AgencyLoginPage() {
  const router = useRouter();

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
    
    // Auto-login on mock login
    if (to === 'agency-dashboard') {
      setCookie('agency_token', 'mock-agency-token-xyz');
    }
    
    router.push(routeMap[to] || '/landing');
  };

  return <AgencyLoginScreen navigate={navigate} />;
}
