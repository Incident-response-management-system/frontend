import React from 'react';
import { Icon, LocationDetailSkeleton, PlaceRowSkeleton } from '@/components/irms-shared';
import { useIsMobile, useIsTablet } from '@/hooks/use-media-query';

export function LocationExplorerPanel({ pinLocation, resolvedLocation, reverseGeocoding, nearbyPlaces, fetchingNearbyPlaces, selectedPlace, onSelectPlace, onUseLocation, onClose, locationSearchQuery, setLocationSearchQuery, manualLocation, setManualLocation, showManualEntry, setShowManualEntry, userGpsLocation, locationPermissionGranted, onRecenterToGps }: any) {
  const isMobile = useIsMobile();

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m away`;
    }
    return `${(meters / 1000).toFixed(1)}km away`;
  };

  const getPlaceName = (place: any) => {
    if (place.name) return place.name;
    if (place.display_name) {
      const parts = place.display_name.split(',');
      return parts[0].trim();
    }
    return 'Unknown location';
  };

  // Search nearby places by query
  const searchNearbyPlaces = (query: string) => {
    if (!query.trim()) {
      return nearbyPlaces;
    }
    const q = query.toLowerCase();
    return nearbyPlaces.filter((place: any) => {
      const name = (place.name || place.display_name || '').toLowerCase();
      return name.includes(q);
    });
  };

  const filteredPlaces = locationSearchQuery ? searchNearbyPlaces(locationSearchQuery) : nearbyPlaces;

  // Check if current location is GPS location
  const isUsingGpsLocation = userGpsLocation && pinLocation && pinLocation.lat === userGpsLocation.lat && pinLocation.lng === userGpsLocation.lng;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: isMobile ? '20px 16px 28px' : '20px 28px 32px' }}>
      {/* Drag handle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--brand-hairline)' }} />
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Icon.pin style={{ color: 'var(--status-red)', width: 16, height: 16 }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--status-red)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Selected Location</span>
          </div>
        </div>
        <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid var(--brand-divider)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', cursor: 'pointer' }}>
          <Icon.close />
        </button>
      </div>

      {/* Location Details */}
      <div style={{
        background: 'var(--brand-cream)', border: '1px solid var(--brand-divider)',
        borderRadius: 12, padding: isMobile ? '20px' : '24px', marginBottom: 20,
      }}>
        {reverseGeocoding ? (
          <LocationDetailSkeleton />
        ) : (
          <>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: isMobile ? 18 : 20, fontWeight: 600, marginBottom: 8, lineHeight: 1.3 }}>
              {isUsingGpsLocation ? 'Current GPS Location' : (resolvedLocation || 'Selected Location')}
            </div>
            <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--brand-muted)', marginBottom: 4 }}>
              Lat: {pinLocation?.lat?.toFixed(5)} · Lng: {pinLocation?.lng?.toFixed(5)}
            </div>
            {isUsingGpsLocation && (
              <div style={{ fontSize: 12, color: 'var(--status-green)', fontWeight: 600, marginBottom: 8 }}>
                ✓ GPS Location Detected
              </div>
            )}
            <div style={{ fontSize: 12, color: 'var(--brand-muted)' }}>
              Redemption Camp · Ogun State · Nigeria
            </div>
            {locationPermissionGranted && userGpsLocation && !isUsingGpsLocation && (
              <button
                onClick={onRecenterToGps}
                style={{
                  marginTop: 12,
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid var(--brand-divider)',
                  background: 'var(--brand-white)',
                  color: 'var(--brand-ink)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <div style={{
                  width: 12,
                  height: 12,
                  background: '#3B82F6',
                  borderRadius: '50%',
                  border: '2px solid white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <div style={{
                    width: 4,
                    height: 4,
                    background: 'white',
                    borderRadius: '50%',
                  }}></div>
                </div>
                Use my current GPS location
              </button>
            )}
          </>
        )}
      </div>

      {/* Search Field */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-muted)', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Search Nearby Locations
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={locationSearchQuery}
            onChange={(e) => setLocationSearchQuery(e.target.value)}
            placeholder="Search for landmarks..."
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 8,
              border: '1px solid var(--brand-divider)',
              fontSize: 14,
              outline: 'none',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--brand-ink)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--brand-divider)'}
          />
          {locationSearchQuery && (
            <button
              onClick={() => setLocationSearchQuery('')}
              style={{
                padding: '12px',
                borderRadius: 8,
                border: '1px solid var(--brand-divider)',
                background: 'var(--brand-surface-alt)',
                cursor: 'pointer',
              }}
            >
              <Icon.close width={20} height={20} />
            </button>
          )}
        </div>
      </div>

      {/* Nearby Places */}
      {filteredPlaces.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-muted)', marginBottom: 12, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            {locationSearchQuery ? `Search Results (${filteredPlaces.length})` : `Nearby Locations (${filteredPlaces.length})`}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredPlaces.map((place: any, index: number) => {
              const isSelected = selectedPlace && (
                (place.id && selectedPlace.id === place.id) ||
                (place.place_id && selectedPlace.place_id === place.place_id)
              );
              return (
                <button
                  key={place.id || place.place_id || index}
                  onClick={() => onSelectPlace(place)}
                  type="button"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 14,
                    border: isSelected ? '2.5px solid var(--brand-accent)' : '1px solid var(--brand-hairline)',
                    backgroundColor: isSelected ? 'var(--brand-surface-alt)' : 'var(--brand-white)',
                    color: 'var(--brand-ink)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    textAlign: 'left',
                    boxShadow: isSelected ? '0 8px 24px rgba(197, 168, 128, 0.15)' : '0 2px 4px rgba(0,0,0,0.02)',
                    transform: isSelected ? 'translateY(-2px)' : 'translateY(0)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      bottom: 0,
                      width: 4,
                      background: 'var(--brand-accent)',
                    }} />
                  )}
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: isSelected ? 'var(--brand-accent)' : 'var(--brand-surface-alt)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: isSelected ? '#fff' : 'var(--brand-muted)',
                      flexShrink: 0,
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 4px 10px rgba(197, 168, 128, 0.3)' : 'none',
                    }}>
                      {isSelected ? <Icon.check style={{ width: 20, height: 20 }} /> : <Icon.pin style={{ width: 18, height: 18 }} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2, color: isSelected ? 'var(--brand-ink)' : 'var(--brand-ink)' }}>
                        {getPlaceName(place)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {place.category && (
                          <div style={{ fontSize: 11, color: 'var(--brand-muted)', fontWeight: 500, textTransform: 'capitalize' }}>
                            {place.category}
                          </div>
                        )}
                        {place.source === 'local' && (
                          <>
                            <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--brand-divider)' }} />
                            <div style={{ fontSize: 10, color: 'var(--status-green)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Verified
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: isSelected ? 'var(--brand-accent)' : 'var(--brand-muted)',
                    fontFamily: 'var(--font-mono)',
                    marginLeft: 12,
                    padding: '4px 10px',
                    borderRadius: 8,
                    background: isSelected ? 'rgba(197, 168, 128, 0.1)' : 'var(--brand-surface-alt)',
                    transition: 'all 0.2s ease',
                  }}>
                    {formatDistance(place.distance)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Show message when no nearby places found */}
      {!fetchingNearbyPlaces && filteredPlaces.length === 0 && (
        <div style={{ marginBottom: 20, padding: '16px', background: 'var(--brand-cream)', borderRadius: 8, border: '1px solid var(--brand-divider)', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--brand-muted)' }}>
            {locationSearchQuery ? 'No matching locations found' : 'No nearby locations found within Redemption Camp'}
          </div>
        </div>
      )}

      {fetchingNearbyPlaces && (
        <div style={{ marginBottom: 20 }}>
          {[0, 1, 2].map(i => <PlaceRowSkeleton key={i} />)}
        </div>
      )}

      {/* Manual Location Entry */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => setShowManualEntry(!showManualEntry)}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: 8,
            border: '1px dashed var(--brand-divider)',
            background: 'var(--brand-surface-alt)',
            color: 'var(--brand-muted)',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Icon.plus width={20} height={20} />
          {showManualEntry ? 'Hide Manual Entry' : 'Enter Custom Location Description'}
        </button>
      </div>

      {showManualEntry && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-muted)', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Manual Location Entry
          </div>
          <textarea
            value={manualLocation}
            onChange={(e) => setManualLocation(e.target.value)}
            placeholder="e.g., Behind Block C, Beside Camp Clinic, Near Generator House"
            rows={3}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 8,
              border: '1px solid var(--brand-divider)',
              fontSize: 14,
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--brand-ink)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--brand-divider)'}
          />
          <div style={{ fontSize: 12, color: 'var(--brand-muted)', marginTop: 6 }}>
            This will be used as the location name for your report
          </div>
        </div>
      )}

      {/* Use This Location Button */}
      <button
        onClick={onUseLocation}
        disabled={reverseGeocoding || fetchingNearbyPlaces}
        style={{
          width: '100%',
          background: 'var(--brand-ink)',
          color: 'var(--brand-cream)',
          padding: '14px 24px',
          borderRadius: 8,
          fontWeight: 600,
          fontSize: 15,
          border: 'none',
          cursor: (reverseGeocoding || fetchingNearbyPlaces) ? 'not-allowed' : 'pointer',
          opacity: (reverseGeocoding || fetchingNearbyPlaces) ? 0.6 : 1,
          transition: 'all 0.2s ease',
        }}
      >
        {selectedPlace ? `Use ${getPlaceName(selectedPlace)}` : 'Use this location'}
      </button>
    </div>
  );
}
