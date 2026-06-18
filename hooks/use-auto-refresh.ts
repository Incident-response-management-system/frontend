import React from 'react';

/**
 * Calls `fn` on three triggers:
 *  1. A regular `intervalMs` timer (default 30 s).
 *  2. Whenever the browser tab becomes visible again after being hidden.
 *  3. Whenever any event name in `listenTo` fires on `window`.
 *
 * The callback ref is kept stable so callers can pass an inline function
 * without causing the effect to re-run on every render.
 */
export function useAutoRefresh(
  fn: () => void,
  intervalMs = 30_000,
  listenTo: readonly string[] = [],
) {
  const fnRef = React.useRef(fn);
  fnRef.current = fn;

  // Stable joined string so the effect only reinstalls when the list changes.
  const eventsKey = listenTo.join('\x00');

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const run = () => {
      if (document.visibilityState !== 'hidden') fnRef.current();
    };

    const timerId = setInterval(run, intervalMs);

    const onVisible = () => {
      if (document.visibilityState === 'visible') fnRef.current();
    };
    document.addEventListener('visibilitychange', onVisible);

    const cleanups = eventsKey
      ? eventsKey.split('\x00').map(name => {
          const h = () => fnRef.current();
          window.addEventListener(name, h);
          return () => window.removeEventListener(name, h);
        })
      : [];

    return () => {
      clearInterval(timerId);
      document.removeEventListener('visibilitychange', onVisible);
      cleanups.forEach(c => c());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, eventsKey]);
}
