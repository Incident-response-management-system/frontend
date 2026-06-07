import React from 'react';

/**
 * SSR-safe media query hook.
 * Returns `false` during server render and the first client paint,
 * then updates to the real value after mount. This avoids hydration
 * mismatches while still letting components react to viewport changes.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    // addEventListener is the modern API; addListener is the Safari/legacy fallback
    if (mql.addEventListener) {
      mql.addEventListener('change', update);
      return () => mql.removeEventListener('change', update);
    } else {
      mql.addListener(update);
      return () => mql.removeListener(update);
    }
  }, [query]);

  return matches;
}

// Breakpoints — aligned with common device widths.
//   mobile  : < 640px   (phones)
//   tablet  : < 1024px  (phones + small tablets / portrait)
export const MOBILE_QUERY = '(max-width: 639px)';
export const TABLET_QUERY = '(max-width: 1023px)';

/** True on phone-sized viewports (< 640px). */
export function useIsMobile(): boolean {
  return useMediaQuery(MOBILE_QUERY);
}

/** True on phone + small-tablet viewports (< 1024px). */
export function useIsTablet(): boolean {
  return useMediaQuery(TABLET_QUERY);
}
