"use client";

import React from 'react';
import { CitizenLoginScreen } from '@/components/irms-citizen-center';
import { useRouter } from 'next/navigation';
import { setCookie } from '@/lib/api-client';

export default function CitizenLoginPage() {
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
    router.push(routeMap[to] || '/landing');
  };

  const handleAuth = (user: { name: string; email: string; phone?: string }) => {
    // Write mock citizen token to cookies for middleware validation
    setCookie('citizen_token', 'mock-citizen-token-xyz');
  };

  return <CitizenLoginScreen navigate={navigate} onAuth={handleAuth} />;
}
