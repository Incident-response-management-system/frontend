"use client";

import React from 'react';
import { TrackScreen } from '@/components/irms-citizen';
import { useRouter, useSearchParams } from 'next/navigation';

export default function TrackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Reconstruct params from URL
  const params = {
    ref: searchParams.get('ref') || '',
  };

  const navigate = (to: string, newParams = {}) => {
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
      const q = new URLSearchParams(newParams as any).toString();
      path += `?${q}`;
    }
    router.push(path);
  };

  return <TrackScreen navigate={navigate} params={params} />;
}
