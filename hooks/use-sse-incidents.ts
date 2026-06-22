import React from 'react';
import { getMemoryToken, getCookie } from '@/lib/api-client';
import { mapBackendIncident } from '@/lib/agency-types';
import type { Incident } from '@/components/irms-shared';

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1').replace(/\/$/, '');

type SSEHandlers = {
  onSnapshot: (incidents: Incident[]) => void;
  onCreated: (incident: Incident) => void;
  onUpdated: (incident: Incident) => void;
  onError?: () => void;
};

/**
 * Opens an SSE connection to the backend incident stream.
 * - Fires onSnapshot immediately with the full current list.
 * - Fires onCreated / onUpdated as new data arrives (every ~5 s server-side).
 * - Reconnects automatically: on error (with exponential backoff) and after the
 *   server closes the connection every 5 minutes.
 * - Re-opens whenever `tab` changes so the snapshot matches the active filter.
 */
export function useSSEIncidents(handlers: SSEHandlers, tab: string = 'all') {
  const handlersRef = React.useRef(handlers);
  handlersRef.current = handlers;

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('EventSource' in window)) return;

    let es: EventSource | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let retryDelay = 3_000;
    let destroyed = false;

    function connect() {
      const token = getMemoryToken('agency') || getCookie('agency_token');
      if (!token) return;

      const url = `${BASE_URL}/incidents/agencies/incidents/stream/?token=${encodeURIComponent(token)}&tab=${tab}`;
      es = new EventSource(url);

      es.addEventListener('snapshot', (e: MessageEvent) => {
        retryDelay = 3_000; // reset backoff on successful connect
        try {
          const { incidents } = JSON.parse(e.data);
          handlersRef.current.onSnapshot((incidents as any[]).map(mapBackendIncident));
        } catch { /* ignore malformed event */ }
      });

      es.addEventListener('incident-created', (e: MessageEvent) => {
        try {
          handlersRef.current.onCreated(mapBackendIncident(JSON.parse(e.data)));
        } catch { /* ignore */ }
      });

      es.addEventListener('incident-updated', (e: MessageEvent) => {
        try {
          handlersRef.current.onUpdated(mapBackendIncident(JSON.parse(e.data)));
        } catch { /* ignore */ }
      });

      // Server closes the stream every 5 minutes — reconnect immediately for a fresh snapshot.
      es.addEventListener('reconnect', () => {
        es?.close();
        if (!destroyed) connect();
      });

      es.onerror = () => {
        es?.close();
        handlersRef.current.onError?.();
        if (!destroyed) {
          retryTimer = setTimeout(() => {
            retryDelay = Math.min(retryDelay * 2, 30_000);
            if (!destroyed) connect();
          }, retryDelay);
        }
      };
    }

    connect();

    return () => {
      destroyed = true;
      if (retryTimer) clearTimeout(retryTimer);
      es?.close();
    };
  }, [tab]);
}
