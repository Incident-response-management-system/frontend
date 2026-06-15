"use client";

import React from 'react';
import { AgencySignupScreen } from '@/components/irms-auth';
import { useRouter } from 'next/navigation';

export default function AgencySignupPage() {
  const router = useRouter();

  // The real JWT is set by agencySignup()/agencyLogin() inside the screen;
  // this page only routes. (Previously it overwrote the token with a mock.)
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
      'agency-forgot': '/auth/agency/forgot',
      'agency-dashboard': '/agency/dashboard',
    };
    router.push(routeMap[to] || '/landing');
  };

  return <AgencySignupScreen navigate={navigate} />;
}
