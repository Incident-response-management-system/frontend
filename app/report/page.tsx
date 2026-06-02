"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// Dynamic import with SSR disabled to prevent Leaflet browser-only API crashes on Next build
const ReportScreen = dynamic(
  () => import('@/components/irms-citizen').then(mod => mod.ReportScreen),
  { ssr: false }
);

export default function ReportPage() {
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

  return <ReportScreen navigate={navigate} />;
}
