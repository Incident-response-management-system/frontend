import React from 'react';
import { toast } from 'sonner';
import {
  IRMSLogo,
  Icon,
  INCIDENT_TYPES,
  StatusBadge,
  StatusStepper,
  PrimaryButton,
  InkButton,
  GhostButton,
  getIncidentType,
} from './irms-shared';

let L: any;
if (typeof window !== 'undefined') {
  L = require('leaflet');
}

interface ScreenProps {
  navigate: (to: string, params?: Record<string, any>) => void;
  user: any;
  onSignOut: () => void;
}

// -----------------------------------------------------------
// SCREEN 1 — LANDING
// Civic, professional, restrained. Information-first.
// -----------------------------------------------------------
export function LandingScreen({ navigate, user, onSignOut }: Omit<ScreenProps, 'params'>) {
  return (
    <div style={{ background: 'var(--brand-cream)', color: 'var(--brand-ink)', minHeight: '100vh' }}>
      {/* Slim utility bar — official, civic feel */}
      <div style={{
        background: 'var(--brand-surface-alt)', borderBottom: '1px solid var(--brand-hairline)',
        padding: '7px 48px', display: 'flex', justifyContent: 'space-between',
        fontSize: 11, color: 'var(--brand-muted)',
      }}>
        <span>A civic emergency reporting service · Pilot deployment, Ogun State</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--status-green)' }}/>
          Services operational
        </span>
      </div>

      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 48px', borderBottom: '1px solid var(--brand-hairline)',
        background: 'rgba(244, 242, 236, 0.88)', backdropFilter: 'blur(14px) saturate(140%)',
      }}>
        <IRMSLogo size={16} color="var(--brand-ink)" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {user ? (
            <button onClick={() => navigate('my-reports')} style={{
              padding: '8px 14px', fontSize: 13, fontWeight: 500, color: 'var(--brand-ink)', borderRadius: 8,
              display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer'
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', background: 'var(--brand-surface-alt)',
                border: '1px solid var(--brand-divider)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 10, fontWeight: 600
              }}>
                {(user.name || 'U').split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
              </div>
              My reports
            </button>
          ) : (
            <>
              <button onClick={() => navigate('citizen-login')} style={{ padding: '8px 14px', fontSize: 13, fontWeight: 500, color: 'var(--brand-ink)', background: 'none', border: 'none', cursor: 'pointer' }}>Sign in</button>
              <button onClick={() => navigate('citizen-signup')} style={{ padding: '8px 14px', fontSize: 13, fontWeight: 500, color: 'var(--brand-ink)', background: 'none', border: 'none', cursor: 'pointer' }}>Create account</button>
            </>
          )}
          <div style={{ width: 1, height: 20, background: 'var(--brand-hairline)', margin: '0 12px' }}/>
          <button onClick={() => navigate('agency-login')} style={{ padding: '8px 14px', fontSize: 13, fontWeight: 500, color: 'var(--brand-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>For agencies</button>
        </div>
      </nav>

      {/* HERO — restrained, two-column, informational */}
      <section style={{ padding: '72px 48px 64px', borderBottom: '1px solid var(--brand-surface-alt)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 64, alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--brand-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 18 }}>
              Incident Response Management System
            </div>
            <h1 style={{
              fontSize: 'clamp(36px, 4.5vw, 56px)', lineHeight: 1.05, fontWeight: 700,
              letterSpacing: '-0.025em', margin: '0 0 20px', textWrap: 'balance',
            }}>
              Report emergencies and reach the right responders.
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--brand-ink)', opacity: 0.85, maxWidth: 520, margin: '0 0 32px' }}>
              Pin the location, describe what you see, and IRMS routes your report to verified agencies
              covering that area. No phone calls. No registration required.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <PrimaryButton onClick={() => navigate('report')} size="lg">
                Report an incident
              </PrimaryButton>
              <GhostButton onClick={() => navigate(user ? 'my-reports' : 'track')} size="md">
                {user ? 'View my reports' : 'Track a report'}
              </GhostButton>
            </div>
            <div style={{ marginTop: 28, fontSize: 12, color: 'var(--brand-muted)', lineHeight: 1.6, maxWidth: 480 }}>
              <strong style={{ color: 'var(--brand-ink)' }}>Life-threatening emergency?</strong> Always call 112 first.
              IRMS coordinates response — it does not replace direct emergency hotlines.
            </div>
          </div>

          {/* Right column: incident type reference (utility, not decoration) */}
          <div style={{ background: 'var(--brand-white)', border: '1px solid var(--brand-hairline)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--brand-hairline)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--brand-ink)', letterSpacing: '0.02em' }}>What can I report?</div>
              <div style={{ fontSize: 11, color: 'var(--brand-muted)' }}>Six categories</div>
            </div>
            {INCIDENT_TYPES.map((t, i) => (
              <button key={t.id} onClick={() => navigate('report')} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 18px', background: 'none', cursor: 'pointer',
                border: 'none',
                borderBottom: i < INCIDENT_TYPES.length - 1 ? '1px solid var(--brand-surface-alt)' : 'none',
                textAlign: 'left', transition: 'background 0.1s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-surface-alt)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 7,
                  background: 'var(--brand-surface-alt)', border: '1px solid var(--brand-hairline)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-ink)', flexShrink: 0,
                }}><t.icon style={{ width: 16, height: 16 }} /></div>
                <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500 }}>{t.label}</span>
                <Icon.chev style={{ color: 'var(--brand-muted)' }} />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — terse, informational */}
      <section style={{ padding: '80px 48px', borderBottom: '1px solid var(--brand-surface-alt)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 32, marginBottom: 56 }}>
            <div style={{ maxWidth: 640 }}>
              <div style={{ fontSize: 11, color: 'var(--brand-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 14 }}>How it works</div>
              <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 14px', lineHeight: 1.1 }}>
                A short, structured report. Faster than a phone call.
              </h2>
              <p style={{ fontSize: 15, color: 'var(--brand-muted)', lineHeight: 1.6, margin: 0, maxWidth: 560 }}>
                Three steps — usually under thirty seconds. No phone trees, no operators, no waiting on hold while you describe what you're seeing.
              </p>
            </div>
            <div style={{ fontSize: 12, color: 'var(--brand-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--status-green)' }}/>
              Median report → assigned: 4 min 12 s
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--brand-hairline)', border: '1px solid var(--brand-hairline)', borderRadius: 12, overflow: 'hidden' }}>
            {[
              { num: '01', title: 'Pin the location', desc: 'Tap your spot on an interactive map of the camp and surrounding area. GPS auto-detects on mobile so the pin lands precisely.' },
              { num: '02', title: 'Describe and attach', desc: 'Pick the incident category. Add a short description and, if it is safe to do so, a photo or short video as evidence.' },
              { num: '03', title: 'Agencies respond', desc: 'Verified responders covering that location are notified at once. You can track the report status from any device, anytime.' },
            ].map((s, i) => (
              <div key={i} style={{
                padding: '32px 28px',
                background: 'var(--brand-white)',
                display: 'flex', flexDirection: 'column', gap: 14,
                minHeight: 220,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'var(--brand-surface-alt)', border: '1px solid var(--brand-hairline)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--brand-ink)',
                  }}>{s.num}</div>
                  <div style={{ flex: 1, height: 1, background: 'var(--brand-hairline)' }}/>
                </div>
                <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em' }}>{s.title}</div>
                <p style={{ fontSize: 14, color: 'var(--brand-muted)', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RESPONDERS / COVERAGE — replaces vanity stats */}
      <section style={{ padding: '64px 48px', borderBottom: '1px solid var(--brand-surface-alt)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--brand-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>Coverage</div>
            <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.015em', margin: '0 0 16px', lineHeight: 1.2 }}>
              Reports route to verified agencies serving your location.
            </h2>
            <p style={{ fontSize: 14, color: 'var(--brand-muted)', lineHeight: 1.6, margin: '0 0 24px', maxWidth: 460 }}>
              Each responding agency declares a service radius. When a report falls inside that radius and matches their category, they are notified — there's no central dispatcher in between.
            </p>
            <button onClick={() => navigate('agency-signup')} style={{
              fontSize: 13, fontWeight: 600, color: 'var(--brand-ink)', textDecoration: 'underline', textUnderlineOffset: 3,
              background: 'none', border: 'none', cursor: 'pointer'
            }}>Are you a responder? Apply to join →</button>
          </div>

          {/* Responder categories — factual list */}
          <div style={{ background: 'var(--brand-white)', border: '1px solid var(--brand-surface-alt)', borderRadius: 10 }}>
            {[
              { cat: 'Police service', count: '6 agencies', ex: 'Nigeria Police, RCCG Camp Security' },
              { cat: 'Medical / Hospital', count: '4 facilities', ex: 'RCCG Medical Centre, Olabisi Onabanjo' },
              { cat: 'Fire & rescue', count: '3 stations', ex: 'Ogun State Fire Service, Camp Fire Unit' },
              { cat: 'Private security', count: '10 firms', ex: 'Mowe Security, Gateway Estate Patrol' },
            ].map((r, i) => (
              <div key={r.cat} style={{
                padding: '16px 20px',
                borderBottom: i < 3 ? '1px solid var(--brand-hairline)' : 'none',
                display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center',
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>{r.cat}</div>
                  <div style={{ fontSize: 12, color: 'var(--brand-muted)' }}>{r.ex}</div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--brand-muted)', whiteSpace: 'nowrap' }}>{r.count}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRIVACY / TRUST — civic platforms always include this */}
      <section style={{ padding: '80px 48px', borderBottom: '1px solid var(--brand-surface-alt)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 32, marginBottom: 56 }}>
            <div style={{ maxWidth: 640 }}>
              <div style={{ fontSize: 11, color: 'var(--brand-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 14 }}>Privacy</div>
              <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 14px', lineHeight: 1.1 }}>
                What we collect, and what we don't.
              </h2>
              <p style={{ fontSize: 15, color: 'var(--brand-muted)', lineHeight: 1.6, margin: 0, maxWidth: 560 }}>
                IRMS is a civic service, not a data product. We collect the minimum needed to dispatch responders — and never more. Your identity is never required to file a report.
              </p>
            </div>
            <div style={{ fontSize: 12, color: 'var(--brand-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--status-green)' }}/>
              NDPR compliant · Reviewed Mar 2026
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, background: 'var(--brand-hairline)', border: '1px solid var(--brand-hairline)', borderRadius: 12, overflow: 'hidden' }}>
            {[
              {
                kind: 'do',
                label: 'What we collect',
                items: [
                  { t: 'Incident location and description', d: 'Coordinates of the pin you drop and the text you write.' },
                  { t: 'Photos or video you attach', d: 'Stored encrypted, retained only until the incident is resolved.' },
                  { t: 'Device session token', d: 'A short-lived ID so you can return and check status from the same browser.' },
                ],
              },
              {
                kind: 'dont',
                label: 'What we don\'t collect',
                items: [
                  { t: 'Your name or identity', d: 'Reports are anonymous to the public and to responding agencies.' },
                  { t: 'Your contact details', d: 'We never share your phone or email with the public.' },
                  { t: 'Anything sold or marketed', d: 'Incident data is never sold or shared with third parties.' },
                ],
              },
            ].map(col => {
              const isDo = col.kind === 'do';
              return (
                <div key={col.kind} style={{ padding: '32px 28px', background: 'var(--brand-white)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: isDo ? 'var(--status-green-bg)' : 'var(--status-red-bg)',
                      border: `1px solid ${isDo ? 'var(--status-green-bd)' : 'var(--status-red-bd)'}`,
                      color: isDo ? 'var(--status-green)' : 'var(--status-red)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, fontWeight: 700, lineHeight: 1,
                    }}>{isDo ? '+' : '−'}</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--brand-ink)' }}>{col.label}</div>
                    <div style={{ flex: 1, height: 1, background: 'var(--brand-hairline)', marginLeft: 8 }}/>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {col.items.map((item, i) => (
                      <div key={i} style={{
                        padding: '14px 0',
                        borderBottom: i < col.items.length - 1 ? '1px solid var(--brand-hairline)' : 'none',
                      }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--brand-ink)', marginBottom: 4 }}>{item.t}</div>
                        <div style={{ fontSize: 13, color: 'var(--brand-muted)', lineHeight: 1.55 }}>{item.d}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AGENCY CTA — quieter */}
      <section style={{ padding: '48px 48px', background: 'var(--brand-white)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--brand-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>For agencies</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Join the response network</div>
            <div style={{ fontSize: 13, color: 'var(--brand-muted)' }}>Register your agency to receive incidents in your service area.</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <GhostButton onClick={() => navigate('agency-login')} size="md" theme="light">Agency sign in</GhostButton>
            <InkButton onClick={() => navigate('agency-signup')} size="md">Register agency</InkButton>
          </div>
        </div>
      </section>

      {/* FOOTER — formal */}
      <footer style={{ padding: '40px 48px 32px', background: 'var(--brand-surface-alt)', borderTop: '1px solid var(--brand-hairline)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 32, flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 360 }}>
            <IRMSLogo size={14} color="var(--brand-ink)" />
            <div style={{ fontSize: 12, color: 'var(--brand-muted)', marginTop: 12, lineHeight: 1.6 }}>
              Incident Response Management System. A civic coordination platform for emergency reporting. Pilot deployment for Redemption Camp and Ogun State.
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, auto)', gap: 56, fontSize: 12 }}>
            <div>
              <div style={{ color: 'var(--brand-muted)', fontWeight: 600, marginBottom: 10, letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: 10 }}>Service</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href="#" style={{ color: 'var(--brand-ink)' }}>Report an incident</a>
                <a href="#" style={{ color: 'var(--brand-ink)' }}>Track a report</a>
                <a href="#" style={{ color: 'var(--brand-ink)' }}>System status</a>
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--brand-muted)', fontWeight: 600, marginBottom: 10, letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: 10 }}>Agencies</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href="#" style={{ color: 'var(--brand-ink)' }}>Apply to respond</a>
                <a href="#" style={{ color: 'var(--brand-ink)' }}>Sign in</a>
                <a href="#" style={{ color: 'var(--brand-ink)' }}>Documentation</a>
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--brand-muted)', fontWeight: 600, marginBottom: 10, letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: 10 }}>Legal</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href="#" style={{ color: 'var(--brand-ink)' }}>Privacy notice</a>
                <a href="#" style={{ color: 'var(--brand-ink)' }}>Terms of service</a>
                <a href="#" style={{ color: 'var(--brand-ink)' }}>Contact</a>
              </div>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 1200, margin: '24px auto 0', paddingTop: 16, borderTop: '1px solid var(--brand-hairline)', fontSize: 11, color: 'var(--brand-muted)' }}>
          © 2026 IRMS · Operated in coordination with state emergency services
        </div>
      </footer>
    </div>
  );
}

// -----------------------------------------------------------
// SCREEN 2 — REPORT (interactive Leaflet map + bottom sheet)
// -----------------------------------------------------------
export function ReportScreen({ navigate }: Omit<ScreenProps, 'user' | 'onSignOut'>) {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const mapInstance = React.useRef<any>(null);
  const userMarker = React.useRef<any>(null);
  const tileLayerRef = React.useRef<any>(null);
  const gpsMarkerRef = React.useRef<any>(null);
  const gpsCircleRef = React.useRef<any>(null);

  const [pinLocation, setPinLocation] = React.useState<any>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [selectedType, setSelectedType] = React.useState<any>(null);
  const [description, setDescription] = React.useState('');
  const [trackReport, setTrackReport] = React.useState(true);
  const [submitted, setSubmitted] = React.useState(false);
  const [refCode] = React.useState('INC-2026-00149');

  const [layerType, setLayerType] = React.useState<'satellite' | 'streets'>('satellite');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searching, setSearching] = React.useState(false);

  React.useEffect(() => {
    if (!mapRef.current || mapInstance.current || !L) return;
    // Redemption Camp coords
    const map = L.map(mapRef.current, { zoomControl: false }).setView([6.8932, 3.1721], 15);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const initialTileUrl = layerType === 'satellite'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    const initialAttr = layerType === 'satellite'
      ? 'Tiles &copy; Esri &mdash; Source: Esri, USDA, USGS'
      : '© OpenStreetMap, © CARTO';

    const tileLayer = L.tileLayer(initialTileUrl, {
      attribution: initialAttr,
      maxZoom: 22,
      maxNativeZoom: layerType === 'satellite' ? 18 : 19,
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      setPinLocation({ lat, lng });
      if (userMarker.current) userMarker.current.remove();
      const icon = L.divIcon({
        html: `<div class="irms-marker received" style="background:#E84A3F"><div class="pulse" style="color:#E84A3F"></div></div>`,
        className: '', iconSize: [28, 28], iconAnchor: [14, 28],
      });
      userMarker.current = L.marker([lat, lng], { icon }).addTo(map);
      setSheetOpen(true);
      setSubmitted(false);
    });

    // Pre-existing markers around the camp
    [
      { lat: 6.8945, lng: 3.1733, s: 'received' },
      { lat: 6.8901, lng: 3.1689, s: 'review' },
      { lat: 6.8954, lng: 3.1745, s: 'assigned' },
      { lat: 6.8920, lng: 3.1701, s: 'resolved' },
    ].forEach(p => {
      const icon = L.divIcon({
        html: `<div class="irms-marker ${p.s}"></div>`,
        className: '', iconSize: [22, 22], iconAnchor: [11, 22],
      });
      L.marker([p.lat, p.lng], { icon }).addTo(map);
    });

    mapInstance.current = map;
    return () => { map.remove(); mapInstance.current = null; };
  }, []);

  // Update map layer dynamically
  React.useEffect(() => {
    if (!mapInstance.current || !L || !tileLayerRef.current) return;
    const map = mapInstance.current;
    tileLayerRef.current.remove();

    const tileUrl = layerType === 'satellite'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    const attr = layerType === 'satellite'
      ? 'Tiles &copy; Esri &mdash; Source: Esri, USDA, USGS'
      : '© OpenStreetMap, © CARTO';

    const tileLayer = L.tileLayer(tileUrl, {
      attribution: attr,
      maxZoom: 22,
      maxNativeZoom: layerType === 'satellite' ? 18 : 19,
    }).addTo(map);
    tileLayerRef.current = tileLayer;
  }, [layerType]);

  const locateUser = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    toast.loading('Locating your position...', { id: 'locate-toast' });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        toast.dismiss('locate-toast');
        toast.success('Location detected successfully!');

        if (!mapInstance.current || !L) return;
        const map = mapInstance.current;

        map.setView([latitude, longitude], 16);

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

        setPinLocation({ lat: latitude, lng: longitude });
        if (userMarker.current) userMarker.current.remove();
        const icon = L.divIcon({
          html: `<div class="irms-marker received" style="background:#E84A3F"><div class="pulse" style="color:#E84A3F"></div></div>`,
          className: '', iconSize: [28, 28], iconAnchor: [14, 28],
        });
        userMarker.current = L.marker([latitude, longitude], { icon }).addTo(map);
        setSheetOpen(true);
        setSubmitted(false);
      },
      (error) => {
        toast.dismiss('locate-toast');
        toast.error(`Unable to retrieve location: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    const toastId = toast.loading(`Searching for "${searchQuery}"...`);

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);

        toast.dismiss(toastId);
        toast.success(`Found: ${display_name.split(',')[0]}`);

        if (!mapInstance.current || !L) return;
        const map = mapInstance.current;

        map.setView([latitude, longitude], 16);

        setPinLocation({ lat: latitude, lng: longitude });
        if (userMarker.current) userMarker.current.remove();
        const icon = L.divIcon({
          html: `<div class="irms-marker received" style="background:#E84A3F"><div class="pulse" style="color:#E84A3F"></div></div>`,
          className: '', iconSize: [28, 28], iconAnchor: [14, 28],
        });
        userMarker.current = L.marker([latitude, longitude], { icon }).addTo(map);
        setSheetOpen(true);
        setSubmitted(false);
      } else {
        toast.dismiss(toastId);
        toast.error('Location not found.');
      }
    } catch (err) {
      toast.dismiss(toastId);
      toast.error('Search service currently unavailable.');
    } finally {
      setSearching(false);
    }
  };

  const closeSheet = () => { setSheetOpen(false); setSubmitted(false); setSelectedType(null); setDescription(''); };

  const submitReport = () => {
    if (!selectedType) return;
    setSubmitted(true);
    toast.success(`Incident ${refCode} has been reported successfully!`);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--brand-cream)', overflow: 'hidden' }}>
      {/* Top header */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 24px', background: 'rgba(244, 242, 236, 0.92)', backdropFilter: 'blur(14px) saturate(140%)',
        borderBottom: '1px solid var(--brand-hairline)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <button onClick={() => navigate('landing')} style={{
            width: 36, height: 36, borderRadius: 10, border: '1px solid var(--brand-divider)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', cursor: 'pointer'
          }}><Icon.back /></button>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Tap a location to report an incident</div>
            <div style={{ fontSize: 12, color: 'var(--brand-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>REDEMPTION CAMP · OGUN STATE · NIGERIA</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'var(--brand-surface-alt)', border: '1px solid var(--brand-divider)', borderRadius: 8 }}>
          <Icon.pin style={{ color: 'var(--brand-ink)', width: 14, height: 14 }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--brand-ink)' }}>Click the map to place a pin</span>
        </div>
      </div>

      {/* Map */}
      <div ref={mapRef} style={{ position: 'absolute', inset: 0, top: 0 }} />

      {/* Floating Geosearch Bar */}
      <form onSubmit={handleSearch} className="irms-map-search-container" style={{
        position: 'absolute', top: 84, right: 24, zIndex: 1000,
        width: 320, maxWidth: 'calc(100vw - 48px)'
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
        position: 'absolute', bottom: 24, right: 24, zIndex: 1000,
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
            <polygon points="12 2 2 7 12 12 22 7 12 2"/>
            <polyline points="2 17 12 22 22 17"/>
            <polyline points="2 12 12 17 22 12"/>
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
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="3"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
          </svg>
        </button>
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 24, left: 24, zIndex: 500,
        background: 'rgba(11,13,19,0.92)', backdropFilter: 'blur(8px)',
        border: '1px solid var(--brand-divider)', borderRadius: 12, padding: '12px 14px',
      }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--brand-muted)', letterSpacing: '0.12em', marginBottom: 8 }}>NEARBY INCIDENTS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { c: 'var(--status-red)', l: 'Received' },
            { c: 'var(--status-amber)', l: 'Under Review' },
            { c: 'var(--status-blue)', l: 'Assigned' },
            { c: 'var(--status-green)', l: 'Resolved' },
          ].map(x => (
            <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'white' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: x.c, border: '2px solid white' }}/>
              {x.l}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom sheet */}
      {sheetOpen && (
        <>
          <div onClick={closeSheet} style={{
            position: 'absolute', inset: 0, background: 'rgba(20, 18, 14, 0.32)', backdropFilter: 'blur(2px)',
            zIndex: 1500, animation: 'fadeIn 0.2s ease-out',
          }}/>
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1600,
            background: 'var(--brand-white)', borderTop: '1px solid var(--brand-divider)',
            borderRadius: '20px 20px 0 0',
            maxHeight: '90vh', overflowY: 'auto',
            animation: 'sheetUp 0.35s cubic-bezier(.2,.8,.2,1)',
          }}>
            {!submitted ? (
              <ReportForm
                pinLocation={pinLocation}
                selectedType={selectedType}
                setSelectedType={setSelectedType}
                description={description}
                setDescription={setDescription}
                trackReport={trackReport}
                setTrackReport={setTrackReport}
                onClose={closeSheet}
                onSubmit={submitReport}
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

function ReportForm({ pinLocation, selectedType, setSelectedType, description, setDescription, trackReport, setTrackReport, onClose, onSubmit }: any) {
  const [media, setMedia] = React.useState([
    { id: 1, color: 'oklch(0.45 0.12 30)' },
    { id: 2, color: 'oklch(0.38 0.10 60)' },
  ]);
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '20px 28px 32px' }}>
      {/* Drag handle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--brand-muted)' }}/>
      </div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Icon.pin style={{ color: 'var(--status-red)', width: 16, height: 16 }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--status-red)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Pinned location</span>
          </div>
          <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>Near Redemption Camp Main Gate</div>
          <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--brand-muted)' }}>
            {pinLocation ? `${pinLocation.lat.toFixed(4)}° N · ${pinLocation.lng.toFixed(4)}° E` : '6.8932° N · 3.1721° E'} · OGUN STATE
          </div>
        </div>
        <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid var(--brand-divider)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', cursor: 'pointer' }}>
          <Icon.close />
        </button>
      </div>

      {/* Type selector */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--brand-ink)', marginBottom: 12 }}>What is happening?</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {INCIDENT_TYPES.map(t => {
            const selected = selectedType === t.id;
            return (
              <button key={t.id} onClick={() => setSelectedType(t.id)} style={{
                padding: '16px 12px', borderRadius: 12,
                background: selected ? 'var(--status-red-bg)' : 'var(--brand-cream)',
                border: selected ? '1.5px solid var(--status-red)' : '1px solid var(--brand-divider)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                color: selected ? 'var(--status-red)' : 'var(--brand-ink)',
                transition: 'all 0.15s', cursor: 'pointer',
              }}>
                <t.icon />
                <span style={{ fontSize: 12, fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Description */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--brand-ink)', marginBottom: 8 }}>Describe the incident</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe what you are seeing right now — be as specific as possible. Mention injuries, vehicles, landmarks."
          style={{
            width: '100%', minHeight: 120, padding: 14, borderRadius: 10,
            background: 'var(--brand-cream)', border: '1px solid var(--brand-divider)',
            color: 'var(--brand-ink)', fontSize: 14, lineHeight: 1.55, resize: 'vertical',
            fontFamily: 'inherit', outline: 'none',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--status-red)'}
          onBlur={e => e.target.style.borderColor = 'var(--brand-divider)'}
        />
      </div>

      {/* Media upload */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--brand-ink)', marginBottom: 8 }}>
          Photos or videos <span style={{ color: 'var(--brand-muted)', fontWeight: 400 }}>(optional)</span>
        </label>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {media.map(m => (
            <div key={m.id} style={{
              width: 80, height: 80, borderRadius: 10, position: 'relative',
              background: `linear-gradient(135deg, ${m.color}, var(--brand-hairline))`,
              border: '1px solid var(--brand-divider)', overflow: 'hidden',
            }}>
              <button onClick={() => setMedia(media.filter(x => x.id !== m.id))} style={{
                position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%',
                background: 'rgba(20, 18, 14, 0.75)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: 'none', cursor: 'pointer'
              }}><Icon.close style={{ width: 14, height: 14 }} /></button>
            </div>
          ))}
          <button style={{
            width: 80, height: 80, borderRadius: 10,
            border: '1.5px dashed var(--brand-muted)', background: 'transparent',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
            color: 'var(--brand-muted)', cursor: 'pointer'
          }}>
            <Icon.upload style={{ width: 18, height: 18 }} />
            <span style={{ fontSize: 11, fontWeight: 500 }}>Attach</span>
          </button>
        </div>
      </div>

      {/* Track toggle */}
      <div style={{
        padding: 14, borderRadius: 10, background: 'var(--brand-cream)',
        border: '1px solid var(--brand-divider)', marginBottom: 20,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--brand-ink)' }}>Track this report</div>
            <div style={{ fontSize: 12, color: 'var(--brand-muted)', marginTop: 2 }}>We'll give you a link to check status in this browser.</div>
          </div>
          <button onClick={() => setTrackReport(!trackReport)} style={{
            width: 42, height: 24, borderRadius: 12,
            background: trackReport ? 'var(--brand-ink)' : 'var(--brand-muted)',
            position: 'relative', transition: 'background 0.2s', flexShrink: 0,
            border: 'none', cursor: 'pointer'
          }}>
            <div style={{
              position: 'absolute', top: 2, left: trackReport ? 20 : 2,
              width: 20, height: 20, borderRadius: '50%', background: 'white',
              transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(40,35,20,0.2)',
            }}/>
          </button>
        </div>
      </div>

      {/* Submit */}
      <PrimaryButton onClick={onSubmit} full size="lg" style={{
        opacity: selectedType ? 1 : 0.5, pointerEvents: selectedType ? 'auto' : 'none',
      }}>
        Submit Report
      </PrimaryButton>
      <div style={{ fontSize: 11, color: 'var(--brand-muted)', textAlign: 'center', marginTop: 12 }}>
        By submitting you confirm this is a genuine incident. False reports are an offense.
      </div>
    </div>
  );
}

function ReportSuccess({ refCode, pinLocation, trackReport, onClose, navigate }: any) {
  const handleCopy = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(refCode);
      toast.success('Reference code copied to clipboard!');
    }
  };
  return (
    <div style={{ maxWidth: 540, margin: '0 auto', padding: '40px 28px 32px', textAlign: 'center', animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: 'var(--status-green-bg)', border: '2px solid var(--status-green-bd)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 24px', color: 'var(--status-green)',
        animation: 'scaleIn 0.4s ease-out 0.1s both',
      }}>
        <Icon.check style={{ width: 36, height: 36 }} />
      </div>
      <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 10px' }}>Report submitted</h2>
      <p style={{ fontSize: 14, color: 'var(--brand-muted)', margin: '0 0 28px', lineHeight: 1.6 }}>
        Verified agencies covering this location have been notified. You can track this report at any time using the reference below.
      </p>
      <div
        onClick={handleCopy}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 18px',
          borderRadius: 999, background: 'var(--brand-cream)', border: '1px solid var(--brand-divider)',
          marginBottom: 32, cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: 11, color: 'var(--brand-muted)', letterSpacing: '0.08em' }}>REFERENCE</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: 'var(--brand-ink)' }}>{refCode}</span>
      </div>
      <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
        {trackReport && (
          <PrimaryButton onClick={() => navigate('track', { ref: refCode })} full>
            View report status <Icon.arrow />
          </PrimaryButton>
        )}
        <GhostButton onClick={() => navigate('landing')} style={{ width: '100%', justifyContent: 'center' }} theme="light">
          Back to home
        </GhostButton>
      </div>
    </div>
  );
}

// -----------------------------------------------------------
// SCREEN 3 — TRACK REPORT
// -----------------------------------------------------------
export function TrackScreen({ navigate, params }: any) {
  const ref = params?.ref || 'INC-2026-00142';
  const status = 'assigned';
  return (
    <div style={{ background: 'var(--brand-cream)', minHeight: '100vh', color: 'var(--brand-ink)' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 32px', borderBottom: '1px solid var(--brand-hairline)',
      }}>
        <button onClick={() => navigate('landing')} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
          <Icon.back />
          <IRMSLogo size={15} color="var(--brand-ink)" />
        </button>
        <div style={{ fontSize: 12, color: 'var(--brand-muted)' }}>Tracking Page</div>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '60px 32px 80px' }}>
        {/* Reference code */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, color: 'var(--brand-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>Report reference</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 700, letterSpacing: '-0.01em' }}>{ref}</div>
            <StatusBadge status={status} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--brand-muted)' }}>
              <Icon.pin style={{ width: 16, height: 16 }} />
              <span style={{ fontSize: 14 }}>Children's Pavilion · Redemption Camp</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 6, background: 'var(--status-red-bg)', border: '1px solid var(--status-red-bd)' }}>
              <Icon.person style={{ width: 14, height: 14, color: 'var(--status-red)' }} />
              <span style={{ fontSize: 12, color: 'var(--status-red)', fontWeight: 600 }}>Missing Person</span>
            </div>
          </div>
        </div>

        {/* Stepper card */}
        <div style={{
          background: 'var(--brand-white)', border: '1px solid var(--brand-hairline)',
          borderRadius: 16, padding: '36px 32px', marginBottom: 24,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-muted)', marginBottom: 28, letterSpacing: '0.02em' }}>STATUS TIMELINE</div>
          <StatusStepper
            current={status}
            timestamps={{
              received: '14:32 · 27 May',
              review: '14:38 · 27 May',
              assigned: '14:51 · 27 May',
            }}
          />
        </div>

        {/* Assigned agency card */}
        <div style={{
          background: 'var(--brand-white)', border: '1px solid var(--status-blue-bd)',
          borderRadius: 16, padding: 24, marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 20,
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 12, flexShrink: 0,
            background: 'var(--status-blue-bg)', border: '1px solid var(--status-blue-bd)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--status-blue)',
          }}>
            <Icon.pin />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: 'var(--status-blue)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Responding Agency</div>
            <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>RCCG Camp Security</div>
            <div style={{ fontSize: 13, color: 'var(--brand-muted)' }}>Private Security Service · Ogun State</div>
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Activity log */}
        <div style={{ background: 'var(--brand-white)', border: '1px solid var(--brand-hairline)', borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-muted)', marginBottom: 16, letterSpacing: '0.02em' }}>ACTIVITY LOG</div>
          {[
            { t: '14:51', e: 'Assigned to RCCG Camp Security', c: 'var(--status-blue)' },
            { t: '14:38', e: 'Marked under review by dispatcher', c: 'var(--status-amber)' },
            { t: '14:32', e: 'Report received from public', c: 'var(--status-red)' },
          ].map((x, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: i < 2 ? '1px solid var(--brand-hairline)' : 'none' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--brand-muted)', minWidth: 50 }}>{x.t}</span>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: x.c }}/>
              <span style={{ fontSize: 14, color: 'var(--brand-ink)' }}>{x.e}</span>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 32, padding: 16, borderRadius: 10,
          background: 'var(--brand-white)', border: '1px dashed var(--brand-divider)',
          fontSize: 12, color: 'var(--brand-muted)', lineHeight: 1.6,
        }}>
          <strong style={{ color: 'var(--brand-ink)' }}>Bookmark this page.</strong> Your tracking link is tied to this browser session. We don't store your identity — only the report.
        </div>
      </div>
    </div>
  );
}
