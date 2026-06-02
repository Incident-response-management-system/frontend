import React from 'react';
import { toast } from 'sonner';

// Real-time WebSocket hook using Pusher with mock simulation fallback
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
      console.warn("Pusher configuration missing. WebSocket real-time subscription is running in Mock Mode.");

      // Setup random mock incident arrivals to keep the dashboard responsive and lively in local sandbox
      const mockArrival = setInterval(() => {
        const rand = Math.random();
        if (rand < 0.05) { // 5% chance every 45s
          const randomType = ['medical', 'rta', 'fire', 'civil', 'flood'][Math.floor(Math.random() * 5)];
          const newIncident = {
            ref: `INC-2026-00${Math.floor(Math.random() * 900 + 150)}`,
            type: randomType,
            location: ['Holy Ghost Arena', 'Road 5 Gate', 'Camp Health Center', 'Youth Center Block B'][Math.floor(Math.random() * 4)],
            lat: 6.890 + (Math.random() - 0.5) * 0.015,
            lng: 3.170 + (Math.random() - 0.5) * 0.015,
            status: 'received' as const,
            reported: 'Just now',
            reportedAt: `Today · ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            desc: 'A live emergency coordinate has been registered on the camp system. Response unit is requested.',
            media: Math.floor(Math.random() * 3),
            assignedTo: null
          };

          toast.warning("⚠️ New Incident Received!", {
            description: `${newIncident.location} — ${newIncident.desc.slice(0, 45)}...`,
            action: {
              label: 'Assess Case',
              onClick: () => onIncidentCreated(newIncident),
            },
            duration: 10000,
          });

          onIncidentCreated(newIncident);
        }
      }, 45000);

      return () => clearInterval(mockArrival);
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
