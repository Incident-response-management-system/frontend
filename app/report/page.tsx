"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { ReportScreenSkeleton } from '@/components/irms-shared';

// Dynamic import with SSR disabled to prevent Leaflet browser-only API crashes on Next build
const ReportScreen = dynamic(
  () => import('@/components/irms-citizen').then(mod => mod.ReportScreen),
  { ssr: false, loading: () => <ReportScreenSkeleton /> }
);

export default function ReportPage() {
  const router = useRouter();

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

  return <ReportScreen navigate={navigate} />;
}
