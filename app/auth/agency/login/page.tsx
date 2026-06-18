"use client";

import React from 'react';
import { AgencyLoginScreen } from '@/components/irms-auth';
import { useRouter } from 'next/navigation';

export default function AgencyLoginPage() {
  const router = useRouter();

  // The real JWT is set by agencyLogin() inside AgencyLoginScreen; this page
  // only routes. (Previously it overwrote the token with a mock value.)
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
      'agency-forgot': '/auth/agency/forgot',
      'agency-dashboard': '/agency/dashboard',
    };
    let path = routeMap[to] || '/landing';
    if (Object.keys(params).length > 0) {
      path += `?${new URLSearchParams(params as any).toString()}`;
    }
    router.push(path);
  };

  return <AgencyLoginScreen navigate={navigate} />;
}
