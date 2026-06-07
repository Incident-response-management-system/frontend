"use client";

import React from 'react';
import { Toaster } from 'sonner';
import { useTheme } from '@/hooks/use-theme';

/** Sonner Toaster that follows the app theme. */
export function ThemedToaster() {
  const { theme } = useTheme();
  return <Toaster position="bottom-right" richColors theme={theme} />;
}
