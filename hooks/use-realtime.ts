import React from 'react';
import { toast } from 'sonner';

// Real-time WebSocket hook using Pusher. With no Pusher key configured the
// hook is a no-op (no fabricated incidents) — the dashboard relies on its
// fetched data until live events are wired.
export function useRealtimeEvents(
  agencyId: string,
  onIncidentCreated: (inc: any) => void,
  onIncidentUpdated: (inc: any) => void
) {
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1';

    if (!pusherKey) {
      console.warn('Pusher not configured — real-time updates are disabled.');
      return;
    }

    // Attempt real connection if Pusher config is set
    let Pusher: any;
    try {
      Pusher = require('pusher-js');
    } catch (err) {
      console.warn("pusher-js package is not installed. Run 'npm install pusher-js' to use live WebSockets.");
      return;
    }

    const pusher = new Pusher(pusherKey, {
      cluster,
      forceTLS: true,
    });

    const channelName = `private-agency-${agencyId || 'default'}`;
    const channel = pusher.subscribe(channelName);

    channel.bind('incident-created', (data: any) => {
      toast.warning("⚠️ New Incident Received!", {
        description: data.location,
        action: {
          label: 'View',
          onClick: () => onIncidentCreated(data),
        },
        duration: 8000,
      });
      onIncidentCreated(data);
    });

    channel.bind('incident-updated', (data: any) => {
      onIncidentUpdated(data);
    });

    return () => {
      pusher.unsubscribe(channelName);
      pusher.disconnect();
    };
  }, [agencyId, onIncidentCreated, onIncidentUpdated]);
}
