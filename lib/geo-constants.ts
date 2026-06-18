/**
 * Geo-constants — Pilot Area Configuration
 * ─────────────────────────────────────────────────────────────
 * Single source of truth for the IRMS pilot coverage zone.
 * The system is locked to Redemption Camp / Ogun State, Nigeria.
 *
 * ALL map components (citizen, agency, auth) import from here.
 */

// ─── Pilot Center (Redemption Camp) ──────────────────────────
export const PILOT_CENTER = { lat: 6.8932, lng: 3.1721 } as const;

// ─── Ogun State Bounding Box (generous) ──────────────────────
// Used to restrict Leaflet map panning and click validation.
// Covers the greater Redemption Camp / Mowe / Ibafo / Lagos-Ibadan
// Expressway corridor — tight enough to stop wild searches but
// loose enough so real nearby incidents are not cropped.
export const OGUN_STATE_BOUNDS = {
  southWest: { lat: 6.82, lng: 3.10 },
  northEast: { lat: 6.97, lng: 3.25 },
} as const;

// ─── Leaflet LatLngBounds (for maxBounds) ────────────────────
// Returns L.latLngBounds — call AFTER Leaflet is loaded.
export function getLeafletBounds(L: any) {
  return L.latLngBounds(
    [OGUN_STATE_BOUNDS.southWest.lat, OGUN_STATE_BOUNDS.southWest.lng],
    [OGUN_STATE_BOUNDS.northEast.lat, OGUN_STATE_BOUNDS.northEast.lng],
  );
}

// ─── Helpers ─────────────────────────────────────────────────
/** Check if a lat/lng is inside the pilot area bounding box. */
export function isInsidePilotArea(lat: number, lng: number): boolean {
  return (
    lat >= OGUN_STATE_BOUNDS.southWest.lat &&
    lat <= OGUN_STATE_BOUNDS.northEast.lat &&
    lng >= OGUN_STATE_BOUNDS.southWest.lng &&
    lng <= OGUN_STATE_BOUNDS.northEast.lng
  );
}

/**
 * Clamp coordinates to the pilot center if they fall outside the zone.
 * Adds a tiny random jitter so repeated calls don't stack at exact center.
 */
export function clampToPilotArea(lat: number, lng: number): { lat: number; lng: number; wasClamped: boolean } {
  if (isInsidePilotArea(lat, lng)) {
    return { lat, lng, wasClamped: false };
  }
  return {
    lat: PILOT_CENTER.lat + (Math.random() - 0.5) * 0.004,
    lng: PILOT_CENTER.lng + (Math.random() - 0.5) * 0.004,
    wasClamped: true,
  };
}

// Default zoom levels
export const DEFAULT_ZOOM = 15;
export const LOCATED_ZOOM = 16;
export const MIN_ZOOM = 13;
export const MAX_ZOOM = 19;
