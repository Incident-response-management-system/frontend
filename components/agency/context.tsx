import React from 'react';
import type { AgencyUser } from '@/lib/auth-api';
export const AgencyProfileContext = React.createContext<AgencyUser | null>(null);
export function useAgencyProfile() { return React.useContext(AgencyProfileContext); }
