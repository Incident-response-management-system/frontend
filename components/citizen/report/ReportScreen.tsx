import React, { useRef, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Icon,
  IRMSLogo,
  INCIDENT_TYPES,
  ReportScreenSkeleton,
  buildIncidentMarkerHtml,
  buildIncidentMapPopupHtml,
  buildIncidentMapTooltipHtml,
} from '@/components/irms-shared';
import { useIsMobile, useIsTablet } from '@/hooks/use-media-query';
import { useSSENearby } from '@/hooks/use-sse-nearby';
import { ThemeToggle } from '@/components/ThemeToggle';
import { submitReport, getNearbyIncidents, checkAgencyCoverage, submitVoiceNote } from '@/lib/incidents-api';
import type { IncidentPriority } from '@/lib/incidents-api';
import { searchLocalDataset, getNearbyLocations, haversineDistance, CampLocation } from '@/lib/location-dataset';
import {
  PILOT_CENTER, getLeafletBounds, clampToPilotArea, isInsidePilotArea,
  DEFAULT_ZOOM, LOCATED_ZOOM, MIN_ZOOM, MAX_ZOOM, shouldBypassLock,
} from '@/lib/geo-constants';
import { LocationExplorerPanel } from './LocationExplorerPanel';
import { IncidentDetailPanel } from './IncidentDetailPanel';
import { ReportForm } from './ReportForm';
import { ReportSuccess } from './ReportSuccess';

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

export function ReportScreen({ navigate }: { navigate: (to: string, params?: Record<string, any>) => void }) {

  const isMobile = useIsMobile();

  const mapRef = React.useRef<HTMLDivElement>(null);

  const mapInstance = React.useRef<any>(null);

  const userMarker = React.useRef<any>(null);

  const tileLayerRef = React.useRef<any>(null);

  const gpsMarkerRef = React.useRef<any>(null);

  const gpsCircleRef = React.useRef<any>(null);

  // User GPS location state
  const [userGpsLocation, setUserGpsLocation] = React.useState<any>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = React.useState<boolean>(false);
  const [locationPermissionDenied, setLocationPermissionDenied] = React.useState<boolean>(false);

  const [pinLocation, setPinLocation] = React.useState<any>(null);

  const [sheetOpen, setSheetOpen] = React.useState(false);

  const [selectedType, setSelectedType] = React.useState<any>(null);

  const [description, setDescription] = React.useState('');

  const [attachments, setAttachments] = React.useState<File[]>([]);

  const [trackReport, setTrackReport] = React.useState(true);

  const [submitted, setSubmitted] = React.useState(false);

  const [submitting, setSubmitting] = React.useState(false);

  const [refCode, setRefCode] = React.useState('');

  const [priority, setPriority] = React.useState<IncidentPriority>('medium');
  const [reporterPhone, setReporterPhone] = React.useState('');

  const [audioBlob, setAudioBlob] = React.useState<Blob | null>(null);



  const [layerType, setLayerType] = React.useState<'satellite' | 'streets'>('satellite');

  const [legendOpen, setLegendOpen] = React.useState(false);

  const [searchQuery, setSearchQuery] = React.useState('');

  const [searching, setSearching] = React.useState(false);

  // New state for nearby places and location selection
  const [nearbyPlaces, setNearbyPlaces] = React.useState<any[]>([]);
  const [selectedPlace, setSelectedPlace] = React.useState<any>(null);
  const [fetchingNearbyPlaces, setFetchingNearbyPlaces] = React.useState(false);
  const [reverseGeocoding, setReverseGeocoding] = React.useState(false);
  const [resolvedLocation, setResolvedLocation] = React.useState<string>('');
  const [panelMode, setPanelMode] = React.useState<'report' | 'location' | 'incident'>('report');
  const [manualLocation, setManualLocation] = React.useState<string>('');
  const [showManualEntry, setShowManualEntry] = React.useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = React.useState<string>('');

  // State for incident markers
  const [nearbyIncidents, setNearbyIncidents] = React.useState<any[]>([]);
  const [selectedIncident, setSelectedIncident] = React.useState<any>(null);
  const incidentMarkersRef = React.useRef<any>(null);

  // Radius filter for nearby incidents
  const [nearbyRadius, setNearbyRadius] = React.useState<number>(10);
  const radiusCircleRef = React.useRef<any>(null);

  // State for recent reports
  const [recentReports, setRecentReports] = React.useState<string[]>([]);

  // Load recent reports from localStorage on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('irms_recent_reports');
      if (stored) {
        setRecentReports(JSON.parse(stored));
      }
    }
  }, []);

  // Distance calculation helper
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c * 1000; // Return distance in meters
  };

  // Custom marker icon generator for incident types (uses shared SVG glyphs).
  const getIncidentMarkerIcon = (incidentType: string) => {
    return L.divIcon({
      html: buildIncidentMarkerHtml(incidentType),
      className: '',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  };

  // Fetch nearby places function with 3-layer search
  const fetchNearbyPlaces = async (lat: number, lng: number) => {
    setFetchingNearbyPlaces(true);
    try {
      // LAYER 1: Search local dataset first
      const localNearby = getNearbyLocations(lat, lng, 8000); // 8km radius — covers Redemption City + surrounding area
      const localPlacesWithDistance = localNearby.map(loc => ({
        ...loc,
        distance: loc.distance,
        display_name: loc.name,
        source: 'local',
      }));

      console.log('Layer 1 - Local dataset results:', localPlacesWithDistance);

      // LAYER 2: External geocoding (only if local results are insufficient)
      let externalPlaces: any[] = [];

      // Dynamic bbox centered on the user's actual pin — ~10km in each direction
      const latDelta = 0.09;
      const lonDelta = 0.11;
      const dynamicBbox = `${(lng - lonDelta).toFixed(5)},${(lat - latDelta).toFixed(5)},${(lng + lonDelta).toFixed(5)},${(lat + latDelta).toFixed(5)}`;

      // Only fetch external if we have fewer than 6 local results
      if (localPlacesWithDistance.length < 6) {
        try {
          // Search OSM for named places within the dynamic bbox around the user
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=&bounded=1&viewbox=${dynamicBbox}&limit=30&addressdetails=1&countrycode=NG&extratags=1&namedetails=1`
          );
          const data = await response.json();
          if (data && data.length > 0) {
            externalPlaces = data;
          }

          // Remove duplicates by place_id
          const uniqueExternal = externalPlaces.filter((place: any, index: number, self: any[]) =>
            index === self.findIndex((p: any) => p.place_id === place.place_id)
          );

          // Calculate distance and filter — must be in Nigeria and within 8km of pin
          const externalWithDistance = uniqueExternal
            .map((place: any) => ({
              ...place,
              distance: calculateDistance(lat, lng, parseFloat(place.lat), parseFloat(place.lon)),
              source: 'external',
            }))
            .filter((place: any) => {
              const withinDistance = place.distance < 8000;
              const countryCode = (place.address?.country_code || '').toLowerCase();
              const correctCountry = !countryCode || countryCode === 'ng';
              return withinDistance && correctCountry;
            });

          console.log('Layer 2 - External geocoding results:', externalWithDistance);
          externalPlaces = externalWithDistance;
        } catch (error) {
          console.error('External geocoding failed:', error);
        }
      }

      // Combine local and external results, prioritizing local
      const allPlaces = [...localPlacesWithDistance, ...externalPlaces];

      // Sort by distance and limit to top 10
      const sortedPlaces = allPlaces
        .sort((a: any, b: any) => a.distance - b.distance)
        .slice(0, 10);

      setNearbyPlaces(sortedPlaces);
      console.log('Final combined results (Layer 1 + Layer 2):', sortedPlaces);
    } catch (error) {
      console.error('Failed to fetch nearby places:', error);
      setNearbyPlaces([]);
    } finally {
      setFetchingNearbyPlaces(false);
    }
  };



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

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Store map instance in ref
    mapInstance.current = map;



    tileLayerRef.current = buildBaseLayer('satellite').addTo(map);



    map.on('click', (e: any) => {

      const { lat, lng } = e.latlng;
      console.log('Map clicked at:', lat, lng);

      // Block pin placement outside pilot area
      if (!isInsidePilotArea(lat, lng)) {
        toast.error('Outside pilot area — tap inside Redemption Camp.');
        return;
      }

      setPinLocation({ lat, lng });

      if (userMarker.current) userMarker.current.remove();

      const icon = L.divIcon({

        html: `<div class="irms-marker received" style="background:#E84A3F"><div class="pulse" style="color:#E84A3F"></div></div>`,

        className: '', iconSize: [28, 28], iconAnchor: [14, 28],

      });

      userMarker.current = L.marker([lat, lng], { icon, draggable: true }).addTo(map);

      // Update pin location when marker is dragged
      userMarker.current.on('dragend', (e: any) => {
        const { lat, lng } = e.target.getLatLng();
        console.log('Marker dragged to:', lat, lng);
        setPinLocation({ lat, lng });
        setReverseGeocoding(true);
        setResolvedLocation('');
        setSelectedPlace(null);
        setNearbyPlaces([]);
        setManualLocation('');
        setShowManualEntry(false);
        setLocationSearchQuery('');

        // Perform reverse geocoding for new location
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&countrycode=NG`)
          .then(res => res.json())
          .then(data => {
            const address = (data.display_name || '').toLowerCase();
            const inNigeria = address.includes('nigeria') || address.includes('ogun') || address.includes('redemption') || address.includes('mowe') || address.includes('ibafo');
            const countryCode = (data.address?.country_code || '').toLowerCase();
            const correctCountry = !countryCode || countryCode === 'ng';

            if (inNigeria && correctCountry) {
              setResolvedLocation(data.display_name);
            } else {
              setResolvedLocation('Selected location (outside Nigeria)');
            }
            setReverseGeocoding(false);
          })
          .catch(err => {
            console.log('Reverse geocoding failed:', err);
            setResolvedLocation('Selected location');
            setReverseGeocoding(false);
          });

        // Fetch nearby places for new location
        fetchNearbyPlaces(lat, lng);
      });

      setPanelMode('location');
      setSheetOpen(true);
      setSubmitted(false);
      setReverseGeocoding(true);
      setResolvedLocation('');
      setSelectedPlace(null);
      setNearbyPlaces([]);
      setManualLocation('');
      setShowManualEntry(false);
      setLocationSearchQuery('');
      console.log('Panel mode set to location, sheet opened');

      // Perform reverse geocoding with country code restriction
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&countrycode=NG`)
        .then(res => res.json())
        .then(data => {
          // Validate that the result is actually in Nigeria
          const address = (data.display_name || '').toLowerCase();
          const inNigeria = address.includes('nigeria') || address.includes('ogun') || address.includes('redemption') || address.includes('mowe') || address.includes('ibafo');
          const countryCode = (data.address?.country_code || '').toLowerCase();
          const correctCountry = !countryCode || countryCode === 'ng';

          if (inNigeria && correctCountry) {
            setResolvedLocation(data.display_name);
          } else {
            setResolvedLocation('Selected location (outside Nigeria)');
          }
          setReverseGeocoding(false);
        })
        .catch(err => {
          console.log('Reverse geocoding failed:', err);
          setResolvedLocation('Selected location');
          setReverseGeocoding(false);
        });

      // Fetch nearby places
      fetchNearbyPlaces(lat, lng);

    });

    return () => { map.remove(); mapInstance.current = null; };

  }, []);

  // Request geolocation permission after map is initialized
  React.useEffect(() => {
    if (!mapInstance.current || !L) return;

    const map = mapInstance.current;

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      console.log('Requesting geolocation permission...');
      toast.loading('Getting your location...', { id: 'gps-location-toast' });

      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Geolocation position received:', position);
          const { latitude: rawLat, longitude: rawLng, accuracy } = position.coords;
          toast.dismiss('gps-location-toast');

          const clamped = clampToPilotArea(rawLat, rawLng);
          const latitude = clamped.lat;
          const longitude = clamped.lng;
          if (clamped.wasClamped) {
            toast.success('Location adjusted to pilot area (Redemption Camp).');
          } else {
            toast.success('Location found!');
          }

          setUserGpsLocation({ lat: latitude, lng: longitude, accuracy });
          setLocationPermissionGranted(true);
          setLocationPermissionDenied(false);

          console.log('Setting map view to user location:', latitude, longitude);
          // Center map on user's location
          map.setView([latitude, longitude], LOCATED_ZOOM);

          // Add user location marker with popup
          if (gpsMarkerRef.current) gpsMarkerRef.current.remove();
          if (gpsCircleRef.current) gpsCircleRef.current.remove();

          console.log('Adding accuracy circle...');
          // Add accuracy circle
          gpsCircleRef.current = L.circle([latitude, longitude], {
            radius: accuracy || 50,
            color: '#3B82F6',
            fillColor: '#3B82F6',
            fillOpacity: 0.15,
            weight: 1.5,
          }).addTo(map);

          console.log('Adding user location marker...');
          // Add user location marker with arrow icon
          const userLocationIcon = L.divIcon({
            html: `<div style="
              position: relative;
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                width: 0;
                height: 0;
                border-left: 12px solid transparent;
                border-right: 12px solid transparent;
                border-bottom: 24px solid #3B82F6;
                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
              "></div>
              <div style="
                position: absolute;
                bottom: 4px;
                width: 8px;
                height: 8px;
                background: white;
                border-radius: 50%;
                box-shadow: 0 1px 3px rgba(0,0,0,0.2);
              "></div>
            </div>`,
            className: '',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
          });

          const marker = L.marker([latitude, longitude], { icon: userLocationIcon });
          marker.addTo(map);
          marker.bindPopup(`
            <div style="
              font-family: Arial, sans-serif;
              font-size: 14px;
              font-weight: 600;
              color: #333;
              padding: 8px 0;
            ">
              <div style="margin-bottom: 4px;">📍 You are here</div>
              <div style="font-size: 12px; color: #666;">
                Lat: ${latitude.toFixed(5)}<br>
                Lng: ${longitude.toFixed(5)}
              </div>
            </div>
          `);
          gpsMarkerRef.current = marker;

          console.log('User location marker added successfully');
          console.log('Marker ref:', gpsMarkerRef.current);
          // Set pin location to user's GPS location for reporting
          setPinLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          toast.dismiss('gps-location-toast');
          console.error('Geolocation error:', error.code, error.message);
          if (error.code === 1) {
            // PERMISSION_DENIED — browser has stored block, can't re-prompt from JS
            setLocationPermissionDenied(true);
            setLocationPermissionGranted(false);
            toast.error('Location access blocked. Tap the map to pin your location, or reset permissions in your browser settings.', { duration: 6000 });
          } else if (error.code === 2) {
            // POSITION_UNAVAILABLE — hardware/network issue
            setLocationPermissionDenied(false);
            setLocationPermissionGranted(false);
            toast.error('GPS signal unavailable. Use the search bar to find your location around Redemption Camp.', { duration: 5000 });
          } else {
            // TIMEOUT (code 3) — took too long
            setLocationPermissionDenied(false);
            setLocationPermissionGranted(false);
            toast.error('Location timed out. Tap the map to pin your location or try again.', { duration: 5000 });
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 30000,
        }
      );
    } else {
      console.log('Geolocation not supported');
    }
  }, []);



  React.useEffect(() => {

    if (!mapInstance.current || !L || !tileLayerRef.current) return;

    const map = mapInstance.current;

    tileLayerRef.current.remove();

    tileLayerRef.current = buildBaseLayer(layerType).addTo(map);

  }, [layerType]);

  // Abstracted fetchNearbyIncidents to be reusable
  const fetchNearbyIncidents = React.useCallback(async () => {
    try {
      const lat = userGpsLocation?.lat || pinLocation?.lat || 6.8932;
      const lng = userGpsLocation?.lng || pinLocation?.lng || 3.1721;

      const response = await getNearbyIncidents(lat, lng, nearbyRadius);
      if (response.success && response.results) {
        setNearbyIncidents(response.results);

        if (mapInstance.current && L) {
          const map = mapInstance.current;

          // Clear existing incident markers
          if (incidentMarkersRef.current) {
            incidentMarkersRef.current.forEach((marker: any) => marker.remove());
            incidentMarkersRef.current = [];
          }

          const markers: any[] = [];
          response.results.forEach((incident: any) => {
            const icon = getIncidentMarkerIcon(incident.incident_type);
            const marker = L.marker([incident.latitude, incident.longitude], { icon })
              .addTo(map)
              .bindTooltip(buildIncidentMapTooltipHtml(incident), {
                direction: 'top',
                offset: [0, -22],
                opacity: 1,
                className: 'irms-incident-tooltip',
              })
              .bindPopup(buildIncidentMapPopupHtml(incident), {
                closeButton: true,
                className: 'incident-popup',
                maxWidth: 280,
              })
              .on('click', () => {
                setSelectedIncident(incident);
                setPanelMode('incident');
                setSheetOpen(true);
              });
            markers.push(marker);
          });
          incidentMarkersRef.current = markers;

          // Draw / update radius coverage circle
          if (radiusCircleRef.current) radiusCircleRef.current.remove();
          radiusCircleRef.current = L.circle([lat, lng], {
            radius: nearbyRadius * 1000,
            color: '#C5A880',
            fillColor: '#C5A880',
            fillOpacity: 0.06,
            weight: 1.5,
            dashArray: '6, 5',
            interactive: false,
          }).addTo(map);
        }
      }
    } catch (error) {
      // Silent fail — incident markers are optional
    }
  }, [userGpsLocation, pinLocation, nearbyRadius]);

  // Fetch nearby incidents on map load, then keep them fresh automatically.
  React.useEffect(() => {
    fetchNearbyIncidents();
  }, [fetchNearbyIncidents]);

  // SSE — push-triggered refresh whenever new/updated incidents appear in the area.
  useSSENearby(
    userGpsLocation?.lat ?? pinLocation?.lat ?? null,
    userGpsLocation?.lng ?? pinLocation?.lng ?? null,
    nearbyRadius,
    fetchNearbyIncidents,
  );



  const locateUser = async () => {

    if (typeof navigator === 'undefined' || !navigator.geolocation) {

      toast.error('Geolocation is not supported by your browser.');

      return;

    }

    // Check permission state before requesting — avoids silent fail on pre-blocked browsers
    if (typeof navigator.permissions !== 'undefined') {
      try {
        const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        if (status.state === 'denied') {
          toast.error('Location access is blocked. Open your browser settings, find this site under Permissions, and set Location to "Allow".', { duration: 8000 });
          return;
        }
      } catch {
        // permissions API not available — fall through to getCurrentPosition
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

        // Update user GPS location state
        setUserGpsLocation({ lat: latitude, lng: longitude, accuracy });
        setLocationPermissionGranted(true);
        setLocationPermissionDenied(false);

        map.setView([latitude, longitude], LOCATED_ZOOM);



        if (gpsMarkerRef.current) gpsMarkerRef.current.remove();

        if (gpsCircleRef.current) gpsCircleRef.current.remove();



        gpsCircleRef.current = L.circle([latitude, longitude], {

          radius: accuracy || 50,

          color: '#3B82F6',

          fillColor: '#3B82F6',

          fillOpacity: 0.15,

          weight: 1.5,

        }).addTo(map);



        // Use the same user location marker as the GPS-first flow (arrow icon)
        const userLocationIcon = L.divIcon({
          html: `<div style="
            position: relative;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              width: 0;
              height: 0;
              border-left: 12px solid transparent;
              border-right: 12px solid transparent;
              border-bottom: 24px solid #3B82F6;
              filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
            "></div>
            <div style="
              position: absolute;
              bottom: 4px;
              width: 8px;
              height: 8px;
              background: white;
              border-radius: 50%;
              box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            "></div>
          </div>`,
          className: '',
          iconSize: [40, 40],
          iconAnchor: [20, 40],
        });

        gpsMarkerRef.current = L.marker([latitude, longitude], { icon: userLocationIcon })
          .addTo(map)
          .bindPopup(`
            <div style="
              font-family: Arial, sans-serif;
              font-size: 14px;
              font-weight: 600;
              color: #333;
              padding: 8px 0;
            ">
              <div style="margin-bottom: 4px;">📍 You are here</div>
              <div style="font-size: 12px; color: #666;">
                Lat: ${latitude.toFixed(5)}<br>
                Lng: ${longitude.toFixed(5)}
              </div>
            </div>
          `);

        setPinLocation({ lat: latitude, lng: longitude });

        if (userMarker.current) userMarker.current.remove();

        const icon = L.divIcon({

          html: `<div class="irms-marker received" style="background:#E84A3F"><div class="pulse" style="color:#E84A3F"></div></div>`,

          className: '', iconSize: [28, 28], iconAnchor: [14, 28],

        });

        userMarker.current = L.marker([latitude, longitude], { icon }).addTo(map);

        setPanelMode('location');
        setSheetOpen(true);
        setSubmitted(false);
        setReverseGeocoding(true);
        setResolvedLocation('');
        setSelectedPlace(null);
        setNearbyPlaces([]);
        setManualLocation('');
        setShowManualEntry(false);
        setLocationSearchQuery('');
        // Perform reverse geocoding with country code restriction
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&countrycode=NG`)
          .then(res => res.json())
          .then(data => {
            // Validate that the result is actually in Nigeria
            const address = (data.display_name || '').toLowerCase();
            const inNigeria = address.includes('nigeria') || address.includes('ogun') || address.includes('redemption') || address.includes('mowe') || address.includes('ibafo');
            const countryCode = (data.address?.country_code || '').toLowerCase();
            const correctCountry = !countryCode || countryCode === 'ng';

            if (inNigeria && correctCountry) {
              setResolvedLocation(data.display_name || 'Unknown location');
            } else {
              setResolvedLocation('Redemption Camp, Ogun State, Nigeria');
            }
            setReverseGeocoding(false);
          })
          .catch(() => {
            setResolvedLocation('Redemption Camp, Ogun State, Nigeria');
            setReverseGeocoding(false);
          });
        // Fetch nearby places
        fetchNearbyPlaces(latitude, longitude);

      },

      (error) => {

        toast.dismiss('locate-toast');

        if (error.code === 1) {
          toast.error('Location access blocked. Open browser settings and set Location to "Allow" for this site.', { duration: 7000 });
        } else if (error.code === 2) {
          toast.error('GPS signal unavailable. Use the search bar to find your location around Redemption Camp.', { duration: 5000 });
        } else {
          toast.error('Location request timed out. Try again or tap the map to pin your location.', { duration: 5000 });
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
      // LAYER 1: Search local dataset first
      const localResults = searchLocalDataset(searchQuery);

      if (localResults.length > 0) {
        // Use the best local result
        const bestMatch = localResults[0].location;

        toast.dismiss(toastId);
        toast.success(`Found: ${bestMatch.name}`);

        if (!mapInstance.current || !L) return;
        const map = mapInstance.current;

        map.setView([bestMatch.latitude, bestMatch.longitude], 16);

        setPinLocation({ lat: bestMatch.latitude, lng: bestMatch.longitude });
        if (userMarker.current) userMarker.current.remove();

        const icon = L.divIcon({
          html: '<div class="irms-marker received" style="background:#E84A3F"><div class="pulse" style="color:#E84A3F"></div></div>',
          className: '', iconSize: [28, 28], iconAnchor: [14, 28],
        });

        userMarker.current = L.marker([bestMatch.latitude, bestMatch.longitude], { icon }).addTo(map);

        setPanelMode('location');
        setSheetOpen(true);
        setSubmitted(false);
        setReverseGeocoding(false);
        setResolvedLocation(bestMatch.name);
        setSelectedPlace(bestMatch);
        setNearbyPlaces([]);
        // Fetch nearby places
        fetchNearbyPlaces(bestMatch.latitude, bestMatch.longitude);

        setSearching(false);
        return;
      }

      // LAYER 2: External geocoding if no local results
      const suffix = shouldBypassLock() ? ' Nigeria' : ' Ogun State Nigeria';
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + suffix)}&limit=5&countrycode=NG&addressdetails=1`);

      const data = await response.json();

      // Prefer a result inside the pilot bounds
      const match = data?.find((r: any) => isInsidePilotArea(parseFloat(r.lat), parseFloat(r.lon)))
        || (data && data.length > 0 ? data[0] : null);

      if (match) {

        const { lat, lon, display_name } = match;

        const latitude = parseFloat(lat);

        const longitude = parseFloat(lon);

        // Clamp to pilot area if outside
        const clamped = clampToPilotArea(latitude, longitude);

        if (clamped.wasClamped) {
          toast.dismiss(toastId);
          toast.info('Result outside pilot area — showing Redemption Camp.');
          setSearching(false);
          if (mapInstance.current) mapInstance.current.setView([clamped.lat, clamped.lng], LOCATED_ZOOM);
          return;
        }

        toast.dismiss(toastId);

        toast.success(`Found: ${display_name.split(',')[0]}`);



        if (!mapInstance.current || !L) return;

        const map = mapInstance.current;



        map.setView([latitude, longitude], LOCATED_ZOOM);



        setPinLocation({ lat: latitude, lng: longitude });

        if (userMarker.current) userMarker.current.remove();

        const icon = L.divIcon({

          html: '<div class="irms-marker received" style="background:#E84A3F"><div class="pulse" style="color:#E84A3F"></div></div>',

          className: '', iconSize: [28, 28], iconAnchor: [14, 28],

        });

        userMarker.current = L.marker([latitude, longitude], { icon }).addTo(map);

        setPanelMode('location');
        setSheetOpen(true);
        setSubmitted(false);
        setReverseGeocoding(true);
        setResolvedLocation(display_name);
        setReverseGeocoding(false);
        setSelectedPlace(null);
        setNearbyPlaces([]);
        // Fetch nearby places
        fetchNearbyPlaces(latitude, longitude);

      } else {

        toast.dismiss(toastId);

        toast.error('Location not found. Try a different search term.');

      }

    } catch (err) {

      toast.dismiss(toastId);

      toast.error('Search service currently unavailable.');

    } finally {

      setSearching(false);

    }

  };



  const closeSheet = () => {

    setSheetOpen(false);

    setSubmitted(false);

    setSelectedType(null);

    setDescription('');

    setAttachments([]);

    setSelectedPlace(null);
    setNearbyPlaces([]);
    setSelectedIncident(null);
    setPanelMode('report');
    setManualLocation('');
    setShowManualEntry(false);
    setLocationSearchQuery('');
    setPriority('medium');
    setAudioBlob(null);

  };



  const handleSubmitReport = async () => {

    if (!selectedType) { toast.error('Please select an incident type.'); return; }
    if (!pinLocation) { toast.error('Please tap the map to pin your location first.'); return; }

    if (!description.trim()) {
      toast.error('Description is required. Please describe the incident.');
      return;
    }

    setSubmitting(true);

    try {

      // Use manual location if provided, otherwise use selected place, resolved location, or GPS location
      let locationName = 'Selected location';
      if (manualLocation.trim()) {
        locationName = manualLocation.trim();
      } else if (selectedPlace) {
        locationName = selectedPlace.name || selectedPlace.display_name?.split(',')[0] || 'Selected location';
      } else if (resolvedLocation) {
        locationName = resolvedLocation.split(',')[0] || resolvedLocation;
      } else if (userGpsLocation && pinLocation.lat === userGpsLocation.lat && pinLocation.lng === userGpsLocation.lng) {
        // If using GPS location, use a descriptive name
        locationName = 'Current GPS Location';
      } else if (pinLocation.name) {
        locationName = pinLocation.name;
      }

      const result = await submitReport({

        incident_type: selectedType,

        description,

        latitude: pinLocation.lat,

        longitude: pinLocation.lng,

        location_name: locationName,

        media: attachments,

        priority,

        reporter_phone: reporterPhone.trim() || undefined,

      });

      setRefCode(result.reference);

      // Store recent report reference
      const recentReports = JSON.parse(localStorage.getItem('irms_recent_reports') || '[]');
      const updatedReports = [result.reference, ...recentReports.filter((ref: string) => ref !== result.reference)].slice(0, 5);
      localStorage.setItem('irms_recent_reports', JSON.stringify(updatedReports));

      setSubmitted(true);

      // Dispatch event to refresh reports list in other components
      window.dispatchEvent(new CustomEvent('irms:report_created', { detail: { reference: result.reference } }));

      toast.success(`Incident ${result.reference} reported successfully!`);

      // Upload voice note in background (non-blocking)
      if (audioBlob && result.incident_id) {
        submitVoiceNote(result.incident_id, audioBlob).catch(() => {
          // Silent fail — voice note is optional
        });
      }

    } catch (err: any) {

      toast.error(err.message || 'Submission failed. Please try again.');

    } finally {

      setSubmitting(false);

    }

  };



  return (

    <div style={{ position: 'fixed', inset: 0, background: 'var(--brand-cream)', overflow: 'hidden' }}>

      {/* Top header */}

      <div style={{

        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000,

        display: 'flex', alignItems: 'center', justifyContent: 'space-between',

        padding: isMobile ? '10px 14px' : '14px 24px',
        background: 'var(--surface-overlay)', backdropFilter: 'blur(14px) saturate(140%)',
        borderBottom: '1px solid var(--brand-hairline)',
        minHeight: isMobile ? 52 : 64,

      }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 16, minWidth: 0, flex: 1 }}>

          <button onClick={() => navigate('back')} style={{

            width: 34, height: 34, borderRadius: 9, border: '1px solid var(--brand-divider)', flexShrink: 0,

            display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', cursor: 'pointer'

          }}><Icon.back /></button>

          {isMobile ? (
            <span style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Report an incident
            </span>
          ) : (
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Tap a location to report an incident</div>
              <div style={{ fontSize: 11, color: 'var(--brand-muted)', fontFamily: 'var(--font-mono)', marginTop: 2, letterSpacing: '0.06em' }}>REDEMPTION CAMP · OGUN STATE</div>
            </div>
          )}

        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'var(--brand-surface-alt)', border: '1px solid var(--brand-divider)', borderRadius: 8 }}>
              <Icon.pin style={{ color: 'var(--brand-ink)', width: 14, height: 14 }} />
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--brand-ink)' }}>Click the map to place a pin</span>
            </div>
          )}

          <ThemeToggle />

        </div>

      </div>



      {/* Map */}

      <div ref={mapRef} style={{ position: 'absolute', inset: 0, top: 0 }} />



      {/* Floating Geosearch Bar */}

      <form onSubmit={handleSearch} className="irms-map-search-container" style={{

        position: 'absolute', top: isMobile ? 62 : 80, left: isMobile ? 12 : undefined, right: isMobile ? 12 : 24, zIndex: 1000,

        width: isMobile ? 'auto' : 320, maxWidth: 'calc(100vw - 48px)'

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



      {/* Recent Reports Panel — desktop only; on mobile it collides with the search bar */}
      {recentReports.length > 0 && !isMobile && (
        <div style={{
          position: 'absolute',
          top: 80,
          left: 24,
          zIndex: 1000,
          background: 'var(--brand-white)',
          border: '1px solid var(--brand-divider)',
          borderRadius: 12,
          padding: 16,
          width: 280,
          maxWidth: 'calc(100vw - 32px)',
        }}>
          <div style={{ fontSize: 11, color: 'var(--brand-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
            Recent Reports
          </div>
          {recentReports.slice(0, 3).map((ref, index) => (
            <button
              key={ref}
              onClick={() => navigate('track', { ref })}
              style={{
                width: '100%',
                padding: '8px 12px',
                marginBottom: index < recentReports.slice(0, 3).length - 1 ? 8 : 0,
                borderRadius: 8,
                background: 'var(--brand-cream)',
                border: '1px solid var(--brand-divider)',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--brand-ink)',
                fontFamily: 'var(--font-mono)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-surface-alt)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--brand-cream)'}
            >
              {ref}
            </button>
          ))}
        </div>
      )}

      {/* Floating Map Actions */}

      <div style={{

        position: 'absolute', bottom: isMobile ? 24 : 24, right: isMobile ? 12 : 24, zIndex: 1000,

        display: 'flex', flexDirection: 'column', gap: 10

      }}>

        {/* Recenter to user location button */}
        {locationPermissionGranted && userGpsLocation && (
          <button
            onClick={() => {
              if (mapInstance.current) {
                mapInstance.current.setView([userGpsLocation.lat, userGpsLocation.lng], 16);
              }
            }}
            className="irms-map-control-btn"
            title="Recenter to my location"
            type="button"
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              border: '1px solid var(--brand-divider)',
              background: 'var(--brand-white)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{
              width: 20,
              height: 20,
              background: '#3B82F6',
              borderRadius: '50%',
              border: '2px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{
                width: 6,
                height: 6,
                background: 'white',
                borderRadius: '50%',
              }}></div>
            </div>
          </button>
        )}

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



      {/* Radius filter — bottom-center floating pill */}
      <div style={{
        position: 'absolute',
        bottom: isMobile ? 100 : 88,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(11,13,19,0.82)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 999,
        padding: '3px 4px',
        gap: 2,
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
      }}>
        <span style={{
          fontSize: 10,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.35)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          paddingLeft: 8,
          paddingRight: 4,
          whiteSpace: 'nowrap',
        }}>
          Radius
        </span>
        {[1, 5, 10, 25].map(r => (
          <button
            key={r}
            type="button"
            onClick={() => setNearbyRadius(r)}
            style={{
              padding: isMobile ? '5px 10px' : '5px 13px',
              borderRadius: 999,
              border: 'none',
              background: nearbyRadius === r ? '#C5A880' : 'transparent',
              color: nearbyRadius === r ? '#1a1409' : 'rgba(255,255,255,0.65)',
              fontSize: isMobile ? 11 : 12,
              fontWeight: nearbyRadius === r ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {r}km
          </button>
        ))}
      </div>

      {/* Legend */}

      {isMobile ? (

        <div style={{ position: 'absolute', bottom: 24, left: 12, zIndex: 500 }}>

          <button

            type="button"

            onClick={() => setLegendOpen(o => !o)}

            style={{

              display: 'flex', alignItems: 'center', gap: 6,

              padding: '7px 12px', borderRadius: 20,

              background: 'rgba(11,13,19,0.88)', backdropFilter: 'blur(8px)',

              border: '1px solid rgba(255,255,255,0.12)', color: 'white',

              fontSize: 12, fontWeight: 600, cursor: 'pointer',

            }}

          >

            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>

            Legend {legendOpen ? '▴' : '▾'}

          </button>

          {legendOpen && (

            <div style={{

              marginTop: 8,

              background: 'rgba(11,13,19,0.92)', backdropFilter: 'blur(8px)',

              border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '12px 14px',

            }}>

              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--brand-muted)', letterSpacing: '0.12em', marginBottom: 8 }}>INCIDENT TYPES</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>

                {INCIDENT_TYPES.map(t => (

                  <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'white' }}>

                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, color: t.color, flexShrink: 0 }}>

                      <t.icon width={16} height={16} />

                    </span>

                    {t.label}

                  </div>

                ))}

              </div>

            </div>

          )}

        </div>

      ) : (

        <div style={{

          position: 'absolute', bottom: 24, left: 24, zIndex: 500,

          background: 'rgba(11,13,19,0.92)', backdropFilter: 'blur(8px)',

          border: '1px solid var(--brand-divider)', borderRadius: 12, padding: '12px 14px',

        }}>

          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--brand-muted)', letterSpacing: '0.12em', marginBottom: 8 }}>NEARBY INCIDENTS</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>

            {INCIDENT_TYPES.map(t => (

              <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'white' }}>

                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, color: t.color }}>

                  <t.icon width={16} height={16} />

                </span>

                {t.label}

              </div>

            ))}

          </div>

        </div>

      )}



      {/* Bottom sheet / Modal */}

      {sheetOpen && (

        <>

          <div onClick={closeSheet} style={{

            position: 'absolute', inset: 0, background: 'var(--scrim)', backdropFilter: 'blur(2px)',

            zIndex: 1500, animation: 'fadeIn 0.2s ease-out',

          }} />

          <div style={{

            position: 'absolute',
            bottom: isMobile ? 0 : 'auto',
            top: isMobile ? 'auto' : '50%',
            left: isMobile ? 0 : '50%',
            right: isMobile ? 0 : 'auto',
            transform: isMobile ? 'none' : 'translate(-50%, -50%)',
            width: isMobile ? '100%' : '600px',
            maxWidth: isMobile ? 'none' : '90vw',
            zIndex: 1600,

            background: 'var(--brand-white)', borderTop: isMobile ? '1px solid var(--brand-divider)' : 'none',
            border: isMobile ? 'none' : '1px solid var(--brand-divider)',

            borderRadius: isMobile ? '20px 20px 0 0' : '16px',

            maxHeight: '90vh', overflowY: 'auto',

            animation: isMobile ? 'sheetUp 0.35s cubic-bezier(.2,.8,.2,1)' : 'fadeIn 0.2s ease-out',

          }}>

            {panelMode === 'location' ? (
              <LocationExplorerPanel
                pinLocation={pinLocation}
                resolvedLocation={resolvedLocation}
                reverseGeocoding={reverseGeocoding}
                nearbyPlaces={nearbyPlaces}
                fetchingNearbyPlaces={fetchingNearbyPlaces}
                selectedPlace={selectedPlace}
                onSelectPlace={(place: any) => {
                  const isAlreadySelected = selectedPlace && (
                    (place.id && selectedPlace.id === place.id) ||
                    (place.place_id && selectedPlace.place_id === place.place_id)
                  );
                  if (isAlreadySelected) {
                    setSelectedPlace(null);
                  } else {
                    setSelectedPlace(place);
                  }
                }}
                onUseLocation={() => {
                  setPanelMode('report');
                  setSheetOpen(true);
                }}
                onClose={() => {
                  setSheetOpen(false);
                }}
                locationSearchQuery={locationSearchQuery}
                setLocationSearchQuery={setLocationSearchQuery}
                manualLocation={manualLocation}
                setManualLocation={setManualLocation}
                showManualEntry={showManualEntry}
                setShowManualEntry={setShowManualEntry}
                userGpsLocation={userGpsLocation}
                locationPermissionGranted={locationPermissionGranted}
                onRecenterToGps={() => {
                  if (userGpsLocation && mapInstance.current) {
                    mapInstance.current.setView([userGpsLocation.lat, userGpsLocation.lng], 16);
                    setPinLocation({ lat: userGpsLocation.lat, lng: userGpsLocation.lng });
                    if (userMarker.current) userMarker.current.remove();
                    const icon = L.divIcon({
                      html: `<div class="irms-marker received" style="background:#E84A3F"><div class="pulse" style="color:#E84A3F"></div></div>`,
                      className: '', iconSize: [28, 28], iconAnchor: [14, 28],
                    });
                    userMarker.current = L.marker([userGpsLocation.lat, userGpsLocation.lng], { icon }).addTo(mapInstance.current);
                    setSelectedPlace(null);
                    setResolvedLocation('');
                    setManualLocation('');
                    setShowManualEntry(false);
                    setLocationSearchQuery('');
                  }
                }}
              />
            ) : panelMode === 'incident' ? (
              <IncidentDetailPanel
                incident={selectedIncident}
                navigate={navigate}
                onClose={() => {
                  setSheetOpen(false);
                  setSelectedIncident(null);
                }}
              />
            ) : !submitted ? (

              <ReportForm

                pinLocation={pinLocation}

                selectedType={selectedType}

                setSelectedType={setSelectedType}

                description={description}

                setDescription={setDescription}

                attachments={attachments}

                setAttachments={setAttachments}

                trackReport={trackReport}

                setTrackReport={setTrackReport}

                onClose={closeSheet}

                onSubmit={handleSubmitReport}

                submitting={submitting}

                selectedPlace={selectedPlace}

                manualLocation={manualLocation}

                resolvedLocation={resolvedLocation}

                priority={priority}

                setPriority={setPriority}

                audioBlob={audioBlob}

                setAudioBlob={setAudioBlob}

                reporterPhone={reporterPhone}

                setReporterPhone={setReporterPhone}

              />

            ) : (

              <ReportSuccess refCode={refCode} pinLocation={pinLocation} trackReport={trackReport} onClose={closeSheet} navigate={navigate} />

            )}

          </div>

        </>

      )}

    </div>

  );

}

