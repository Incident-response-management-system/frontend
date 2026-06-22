import React from 'react';

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1').replace(/\/$/, '');

/**
 * Opens an SSE connection to the nearby-incidents stream.
 * Calls `onRefresh` whenever the server detects a new or updated incident
 * in the given area — replacing the 45 s poll in the citizen report screen.
 * Reconnects automatically on error (exponential backoff) and every 10 min.
 */
export function useSSENearby(
  lat: number | null,
  lng: number | null,
  radiusKm: number,
  onRefresh: () => void,
) {
  const onRefreshRef = React.useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('EventSource' in window)) return;
    if (lat === null || lng === null) return;

    let es: EventSource | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let retryDelay = 3_000;
    let destroyed = false;

    function connect() {
      const url = `${BASE_URL}/incidents/nearby/stream/?latitude=${lat}&longitude=${lng}&radius_km=${radiusKm}`;
      es = new EventSource(url);

      es.addEventListener('refresh', () => {
        onRefreshRef.current();
        retryDelay = 3_000;
      });

      es.addEventListener('reconnect', () => {
        es?.close();
        if (!destroyed) connect();
      });

      es.onerror = () => {
        es?.close();
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
  }, [lat, lng, radiusKm]);
}
