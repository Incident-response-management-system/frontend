"use client";

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';

// Dynamic import with SSR disabled to prevent Leaflet browser-only API crashes on Next build
const TrackScreen = dynamic(
  () => import('@/components/irms-citizen').then(mod => mod.TrackScreen),
  { ssr: false }
);

function TrackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const params = {
    ref: searchParams.get('ref') || '',
  };

  const navigate = (to: string, newParams: Record<string, any> = {}) => {
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
    if (Object.keys(newParams).length > 0) {
      path += `?${new URLSearchParams(newParams as any).toString()}`;
    }
    router.push(path);
  };

  return <TrackScreen navigate={navigate} params={params} />;
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, fontFamily: 'var(--font-mono)', color: 'var(--brand-ink)', background: 'var(--brand-cream)', minHeight: '100vh' }}>Loading tracker credentials...</div>}>
      <TrackContent />
    </Suspense>
  );
}
