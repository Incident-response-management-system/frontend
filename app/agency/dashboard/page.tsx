"use client";

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { deleteCookie } from '@/lib/api-client';
import { AgencyDashboardSkeleton } from '@/components/irms-shared';

// Dynamic import with SSR disabled to prevent Leaflet browser-only API crashes on Next build
const DashboardScreen = dynamic(
  () => import('@/components/irms-agency').then(mod => mod.DashboardScreen),
  { ssr: false, loading: () => <AgencyDashboardSkeleton /> }
);

function DashboardContent() {
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
      deleteCookie('agency_refresh');
    }

    router.push(routeMap[to] || '/landing');
  };

  return <DashboardScreen navigate={navigate} initialTab={tab} />;
}

export default function AgencyDashboardPage() {
  return (
    <Suspense fallback={<AgencyDashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
