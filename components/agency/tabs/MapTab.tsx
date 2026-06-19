import React from 'react';
import { toast } from 'sonner';
import { Icon, buildAgencyIncidentMarkerHtml, buildIncidentMapTooltipHtml, resolveMediaUrl, INCIDENT_TYPES } from '@/components/irms-shared';
import type { Incident, IncidentMapCardData } from '@/components/irms-shared';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAgencyProfile } from '../context';
import { PILOT_CENTER, getLeafletBounds, clampToPilotArea, isInsidePilotArea, DEFAULT_ZOOM, LOCATED_ZOOM, MIN_ZOOM, MAX_ZOOM, shouldBypassLock } from '@/lib/geo-constants';
import { useIsMobile } from '@/hooks/use-media-query';
import { isIncidentRelevant, toBeType, toFeType } from '@/lib/agency-types';
import { getIncidentType } from '@/components/irms-shared';
import { DashTopBar } from '../DashTopBar';

let L: any;
if (typeof window !== 'undefined') {
  L = require('leaflet');
}

// Build the base map layer for a given mode.
//  - satellite: Esri World Imagery + a transparent reference overlay that adds
//    place names, roads and boundaries (plain imagery has no labels).
//  - streets: CARTO Voyager — a clean street map with strong, readable labels.
function buildBaseLayer(mode: 'satellite' | 'streets') {
  if (mode === 'streets') {
    return L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap, © CARTO',
      maxZoom: 22,
      maxNativeZoom: 20,
    });
  }
  const imagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, USDA, USGS',
    maxZoom: 22,
    maxNativeZoom: 18,
  });
  // Transparent labels layer: roads, place/area names, boundaries.
  const labels = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 22,
    maxNativeZoom: 18,
    pane: 'overlayPane',
  });
  return L.layerGroup([imagery, labels]);
}

function FilterDropdown({ label, options, selected, onToggle }: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const count = selected.length;
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
        borderRadius: 9,
        border: `1px solid ${count > 0 ? 'var(--brand-ink)' : 'var(--brand-hairline)'}`,
        background: count > 0 ? 'var(--brand-surface-alt)' : 'var(--brand-white)',
        fontSize: 13, fontWeight: count > 0 ? 600 : 500, color: 'var(--brand-ink)', cursor: 'pointer'
      }}>
        {label}{count > 0 ? ` · ${count}` : ''} <Icon.chevDown />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 1010 }} />
          <div style={{
            position: 'absolute', top: '100%', left: 0, marginTop: 6, zIndex: 1020,
            background: 'var(--brand-white)', border: '1px solid var(--brand-hairline)', borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)', minWidth: 200, maxWidth: 'calc(100vw - 24px)', padding: 6,
          }}>
            {options.map(o => (
              <label key={o.value} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 7, fontSize: 13, cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-cream)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(o.value)}
                  onChange={() => onToggle(o.value)}
                  style={{ accentColor: 'var(--status-red)' }}
                />
                {o.label}
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Status filter options for the map toolbar (value = backend status, label = UI).
const MAP_STATUS_FILTERS: { value: string; label: string }[] = [
  { value: 'pending', label: 'Received' },
  { value: 'in_progress', label: 'Under Review' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'resolved', label: 'Resolved' },
];

export function MapTab({ incidents, onViewIncident }: { incidents: Incident[]; onViewIncident: (inc: Incident) => void }) {
  const isMobile = useIsMobile();
  const profile = useAgencyProfile();
  const mapRef = React.useRef<HTMLDivElement>(null);
  const mapInstance = React.useRef<any>(null);
  const markersRef = React.useRef<any[]>([]);
  const tileLayerRef = React.useRef<any>(null);
  const gpsMarkerRef = React.useRef<any>(null);
  const gpsCircleRef = React.useRef<any>(null);
  const agencyMarkerRef = React.useRef<any>(null);
  // Prevents GPS from overriding the agency-location initial view
  const initialViewSet = React.useRef(false);

  const [layerType, setLayerType] = React.useState<'satellite' | 'streets'>('satellite');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searching, setSearching] = React.useState(false);
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>([]);

  const toggleType = (value: string) =>
    setSelectedTypes(prev => prev.includes(value) ? prev.filter(x => x !== value) : [...prev, value]);
  const toggleStatus = (value: string) =>
    setSelectedStatuses(prev => prev.includes(value) ? prev.filter(x => x !== value) : [...prev, value]);

  // Only offer the incident-type filters this agency type responds to.
  const relevantTypes = React.useMemo(
    () => INCIDENT_TYPES.filter(t => isIncidentRelevant(toFeType(t.id), profile?.agencyType)),
    [profile?.agencyType]
  );
  const resetFilters = () => { setSelectedTypes([]); setSelectedStatuses([]); };
  const hasFilters = selectedTypes.length > 0 || selectedStatuses.length > 0;

  // Markers honour the type/status filters. Type is normalized to the backend
  // id since an incident may carry either the backend value or the FE short form.
  const visibleIncidents = React.useMemo(() => incidents.filter(inc => {
    const typeOk = selectedTypes.length === 0 || selectedTypes.includes(toBeType(inc.type));
    const st = inc.status === 'closed' ? 'resolved' : inc.status;
    const statusOk = selectedStatuses.length === 0 || selectedStatuses.includes(st);
    return typeOk && statusOk;
  }), [incidents, selectedTypes, selectedStatuses]);

  React.useEffect(() => {
    if (!mapRef.current || mapInstance.current || !L) return;
    const pilotBounds = getLeafletBounds(L);
    const map = L.map(mapRef.current, {
      zoomControl: false,
      maxBounds: shouldBypassLock() ? undefined : pilotBounds.pad(0.1),
      maxBoundsViscosity: 1.0,
      minZoom: shouldBypassLock() ? 1 : MIN_ZOOM,
      maxZoom: MAX_ZOOM,
    }).setView([PILOT_CENTER.lat, PILOT_CENTER.lng], DEFAULT_ZOOM);
    L.control.zoom({ position: 'topright' }).addTo(map);

    tileLayerRef.current = buildBaseLayer(layerType).addTo(map);

    mapInstance.current = map;

    // Center on the agency's registered location if available.
    // Fall back to browser GPS, then PILOT_CENTER.
    if (profile?.lat != null && profile?.lng != null) {
      const clamped = clampToPilotArea(profile.lat, profile.lng);
      map.setView([clamped.lat, clamped.lng], LOCATED_ZOOM);
      initialViewSet.current = true;
      _placeAgencyMarker(map, clamped.lat, clamped.lng);
    } else if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (initialViewSet.current) return;
          const clamped = clampToPilotArea(position.coords.latitude, position.coords.longitude);
          map.setView([clamped.lat, clamped.lng], LOCATED_ZOOM);
          initialViewSet.current = true;
        },
        () => { /* silent fail — map stays at PILOT_CENTER */ },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    }

    return () => { map.remove(); mapInstance.current = null; };
  }, []);

  // Place a distinct "home base" marker at the agency's registered coordinates.
  function _placeAgencyMarker(map: any, lat: number, lng: number) {
    if (agencyMarkerRef.current) agencyMarkerRef.current.remove();
    const icon = L.divIcon({
      html: `<div style="width:18px;height:18px;border-radius:50%;background:var(--brand-ink);border:3px solid var(--brand-cream);box-shadow:0 0 0 2px var(--brand-ink);"></div>`,
      className: '',
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
    agencyMarkerRef.current = L.marker([lat, lng], { icon, zIndexOffset: 1000 })
      .addTo(map)
      .bindTooltip(`<strong>${profile?.agencyName ?? 'Your agency'}</strong><br>Registered location`, {
        direction: 'top', offset: [0, -12], opacity: 1,
      });
  }

  // If profile loads after the map is already initialised (async fetch),
  // centre on the agency location then — but only if we haven't set the
  // initial view yet (i.e. GPS didn't beat us to it).
  React.useEffect(() => {
    if (!mapInstance.current || !L || initialViewSet.current) return;
    if (profile?.lat == null || profile?.lng == null) return;
    const clamped = clampToPilotArea(profile.lat, profile.lng);
    mapInstance.current.setView([clamped.lat, clamped.lng], LOCATED_ZOOM);
    initialViewSet.current = true;
    _placeAgencyMarker(mapInstance.current, clamped.lat, clamped.lng);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.lat, profile?.lng]);

  // Dynamically redraw incident markers when live coordinate data updates
  React.useEffect(() => {
    if (!mapInstance.current || !L) return;
    const map = mapInstance.current;

    // Clear previous markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const statusClassMap: Record<string, string> = {
      pending: 'received',
      in_progress: 'review',
      assigned: 'assigned',
      resolved: 'resolved',
      closed: 'resolved',
    };

    visibleIncidents.forEach(inc => {
      const lat = parseFloat(inc.lat as any);
      const lng = parseFloat(inc.lng as any);
      if (isNaN(lat) || isNaN(lng)) {
        return;
      }

      const icon = L.divIcon({
        html: buildAgencyIncidentMarkerHtml(inc.type, inc.status),
        className: '', iconSize: [40, 40], iconAnchor: [20, 20],
      });

      const mapCardData: IncidentMapCardData = {
        reference: inc.ref,
        incident_type: toBeType(inc.type),
        incident_type_display: getIncidentType(inc.type).label,
        status: inc.status,
        location_name: inc.location,
        description: inc.desc,
        created_at: inc.reportedAt,
      };

      const marker = L.marker([lat, lng], { icon })
        .addTo(map)
        .bindTooltip(buildIncidentMapTooltipHtml(mapCardData), {
          direction: 'top',
          offset: [0, -22],
          opacity: 1,
          className: 'irms-incident-tooltip',
        });

      marker.on('click', () => onViewIncident(inc));
      markersRef.current.push(marker);
    });
  }, [visibleIncidents]);

  // Update map layer dynamically
  React.useEffect(() => {
    if (!mapInstance.current || !L || !tileLayerRef.current) return;
    const map = mapInstance.current;
    tileLayerRef.current.remove();
    tileLayerRef.current = buildBaseLayer(layerType).addTo(map);
  }, [layerType]);

  const locateUser = async () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    if (typeof navigator.permissions !== 'undefined') {
      try {
        const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        if (status.state === 'denied') {
          toast.error('Location access is blocked. Open browser settings and allow location for this site.', { duration: 7000 });
          return;
        }
      } catch {
        // permissions API not available, fall through
      }
    }

    toast.loading('Locating your position...', { id: 'locate-toast' });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: rawLat, longitude: rawLng, accuracy } = position.coords;
        toast.dismiss('locate-toast');

        const clamped = clampToPilotArea(rawLat, rawLng);
        const latitude = clamped.lat;
        const longitude = clamped.lng;
        if (clamped.wasClamped) {
          toast.success('Location adjusted to pilot area (Redemption Camp).');
        } else {
          toast.success('Location detected successfully!');
        }

        if (!mapInstance.current || !L) return;
        const map = mapInstance.current;

        map.setView([latitude, longitude], LOCATED_ZOOM);

        if (gpsMarkerRef.current) gpsMarkerRef.current.remove();
        if (gpsCircleRef.current) gpsCircleRef.current.remove();

        gpsCircleRef.current = L.circle([latitude, longitude], {
          radius: accuracy || 50,
          color: 'var(--status-blue)',
          fillColor: 'var(--status-blue)',
          fillOpacity: 0.15,
          weight: 1.5,
        }).addTo(map);

        const gpsIcon = L.divIcon({
          html: `<div class="irms-marker assigned" style="border-color: white; background: var(--status-blue); width: 22px; height: 22px;"><div class="pulse" style="color: var(--status-blue);"></div></div>`,
          className: '',
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });
        gpsMarkerRef.current = L.marker([latitude, longitude], { icon: gpsIcon }).addTo(map);
      },
      (error) => {
        toast.dismiss('locate-toast');
        if (error.code === 1) {
          toast.error('Location access blocked. Open browser settings and set Location to "Allow" for this site.', { duration: 7000 });
        } else if (error.code === 2) {
          toast.error('GPS signal unavailable. Use the search bar to navigate around Redemption Camp.', { duration: 5000 });
        } else {
          toast.error('Location request timed out. Please try again.', { duration: 5000 });
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
    );
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    const toastId = toast.loading(`Searching for "${searchQuery}"...`);

    try {
      const suffix = shouldBypassLock() ? ' Nigeria' : ' Ogun State Nigeria';
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + suffix)}&limit=5&countrycode=NG&addressdetails=1`);
      const data = await response.json();

      // Find first result inside pilot area bounds
      const match = data?.find((r: any) => {
        const lat = parseFloat(r.lat);
        const lon = parseFloat(r.lon);
        return isInsidePilotArea(lat, lon);
      }) || (data && data.length > 0 ? data[0] : null);

      if (match) {
        const latitude = parseFloat(match.lat);
        const longitude = parseFloat(match.lon);

        // Clamp to bounds if result is outside
        const clamped = clampToPilotArea(latitude, longitude);

        toast.dismiss(toastId);
        if (clamped.wasClamped) {
          toast.info('Result outside pilot area — centered on Redemption Camp.');
        } else {
          toast.success(`Found: ${(match.display_name || '').split(',')[0]}`);
        }

        if (!mapInstance.current || !L) return;
        mapInstance.current.setView([clamped.lat, clamped.lng], LOCATED_ZOOM);
      } else {
        toast.dismiss(toastId);
        toast.error('Location not found in the pilot area.');
      }
    } catch (err) {
      toast.dismiss(toastId);
      toast.error('Search service currently unavailable.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <DashTopBar
        title="Live map"
        subtitle={hasFilters
          ? `${visibleIncidents.length} of ${incidents.length} incident${incidents.length === 1 ? '' : 's'} shown`
          : `${incidents.length} incident${incidents.length === 1 ? '' : 's'} in your service radius`}
        actions={null}
      />
      {/* Filter toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: isMobile ? '10px 16px' : '12px 32px',
        background: 'var(--brand-white)', borderBottom: '1px solid var(--brand-hairline)',
        flexWrap: isMobile ? 'wrap' : 'nowrap',
      }}>
        <FilterDropdown
          label="Incident Type"
          options={relevantTypes.map(t => ({ value: t.id, label: t.label }))}
          selected={selectedTypes}
          onToggle={toggleType}
        />
        <FilterDropdown
          label="Status"
          options={MAP_STATUS_FILTERS}
          selected={selectedStatuses}
          onToggle={toggleStatus}
        />
        <button
          onClick={resetFilters}
          disabled={!hasFilters}
          style={{ fontSize: 13, color: 'var(--brand-muted)', fontWeight: 500, padding: '8px 12px', background: 'none', border: 'none', cursor: hasFilters ? 'pointer' : 'default', opacity: hasFilters ? 1 : 0.45 }}
        >
          Reset filters
        </button>
        <div style={{ flex: 1 }} />
        {!isMobile && profile?.lat != null && profile?.lng != null && (
          <div style={{ fontSize: 12, color: 'var(--brand-muted)', fontFamily: 'var(--font-mono)' }}>
            {profile.agencyName.toUpperCase()} · {profile.lat.toFixed(4)}° N · {profile.lng.toFixed(4)}° E
          </div>
        )}
      </div>

      {/* Map */}
      <div style={{ flex: 1, position: 'relative' }}>
        <div ref={mapRef} style={{ position: 'absolute', inset: 0 }} />

        {/* Floating Geosearch Bar */}
        <form onSubmit={handleSearch} className="irms-map-search-container" style={{
          position: 'absolute', zIndex: 1000,
          ...(isMobile
            ? { top: 12, left: 12, right: 12, width: 'auto' }
            : { top: 20, right: 20, width: 300, maxWidth: 'calc(100vw - 40px)' }),
        }}>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search for an address..."
            className="irms-map-search-input"
            disabled={searching}
          />
          <button type="submit" className="irms-map-search-btn" disabled={searching}>
            <Icon.search style={{ width: 16, height: 16 }} />
          </button>
        </form>

        {/* Floating Map Actions (Layers Control & Geolocation Target) */}
        <div style={{
          position: 'absolute', bottom: 20, right: 20, zIndex: 1000,
          display: 'flex', flexDirection: 'column', gap: 10
        }}>
          {/* Layer toggle button */}
          <button
            onClick={() => setLayerType(l => l === 'satellite' ? 'streets' : 'satellite')}
            className="irms-map-control-btn"
            title="Toggle map layers"
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </button>

          {/* Geolocation button */}
          <button
            onClick={locateUser}
            className="irms-map-control-btn"
            title="Locate my position"
            type="button"
            style={{ background: 'var(--status-blue)', color: 'white', borderColor: 'var(--status-blue-bd)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
            </svg>
          </button>
        </div>

        {/* Legend - positioned bottom-left to prevent overlap with controls */}
        <div style={{
          position: 'absolute', bottom: 20, left: 20, zIndex: 500,
          background: 'var(--brand-white)', border: '1px solid var(--brand-hairline)', borderRadius: 12, padding: '14px 16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--brand-muted)', letterSpacing: '0.12em', marginBottom: 10 }}>LEGEND</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { c: 'var(--status-red)', l: 'Received', icon: Icon.bell },
              { c: 'var(--status-amber)', l: 'Under Review', icon: Icon.clock },
              { c: 'var(--status-blue)', l: 'Assigned', icon: Icon.pin },
              { c: 'var(--status-green)', l: 'Resolved', icon: Icon.check },
            ].map(x => (
              <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--brand-ink)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, color: x.c }}>
                  <x.icon width={16} height={16} />
                </span>
                {x.l}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
