"use client";

import React from 'react';
import { CitizenLoginScreen } from '@/components/auth/citizen/CitizenLoginScreen';
import { useRouter } from 'next/navigation';

export default function CitizenLoginPage() {
  const router = useRouter();

  // The real JWT is set by citizenLogin() inside CitizenLoginScreen; this page
  // only routes. (Previously handleAuth overwrote that token with a mock value,
  // so every authenticated citizen request afterwards failed — surfacing in the
  // browser as a CORS/auth error. Same fix as the agency login page.)
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

  return <CitizenLoginScreen navigate={navigate} onAuth={() => {}} />;
}
