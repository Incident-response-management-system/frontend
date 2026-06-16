"use client";

import React from 'react';
import { CitizenSignupScreen } from '@/components/auth/citizen/CitizenSignupScreen';
import { useRouter } from 'next/navigation';

export default function CitizenSignupPage() {
  const router = useRouter();

  // The real JWT is set by citizenSignup() inside CitizenSignupScreen; this page
  // only routes. (Previously handleAuth overwrote that token with a mock value,
  // so every authenticated citizen request afterwards failed — surfacing in the
  // browser as a CORS/auth error. Same fix as the agency login page.)
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

  return <CitizenSignupScreen navigate={navigate} onAuth={() => {}} />;
}
