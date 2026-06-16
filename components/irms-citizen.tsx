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

  IncidentStatus,

} from './irms-shared';

import { submitReport, trackIncident, getNearbyIncidents } from '@/lib/incidents-api';
import { searchLocalDataset, getNearbyLocations, haversineDistance, CampLocation } from '@/lib/location-dataset';

import { useIsMobile, useIsTablet } from '@/hooks/use-media-query';

import { ThemeToggle } from './ThemeToggle';



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

  const isMobile = useIsMobile();

  const isTablet = useIsTablet();

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (

    <div style={{ background: 'var(--brand-cream)', color: 'var(--brand-ink)', minHeight: '100vh' }}>

      {/* Slim utility bar — official, civic feel */}

      <div style={{

        background: 'var(--brand-surface-alt)', borderBottom: '1px solid var(--brand-hairline)',

        padding: isMobile ? '7px 16px' : '7px 48px', display: 'flex', justifyContent: 'space-between',

        fontSize: 11, color: 'var(--brand-muted)',

      }}>

        <span style={{ display: isMobile ? 'none' : 'inline' }}>A civic emergency reporting service · Pilot deployment, Ogun State</span>

        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>

          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--status-green)' }} />

          Services operational

        </span>

      </div>



      {/* Navbar */}

      <nav style={{

        position: 'sticky', top: 0, zIndex: 50,

        display: 'flex', alignItems: 'center', justifyContent: 'space-between',

        padding: isMobile ? '16px 16px' : '16px 48px', borderBottom: '1px solid var(--brand-hairline)',

        background: 'var(--surface-overlay)', backdropFilter: 'blur(14px) saturate(140%)',

      }}>

        <IRMSLogo size={16} color="var(--brand-ink)" />

        

        {/* Desktop menu */}

        <div style={{ display: isMobile ? 'none' : 'flex', alignItems: 'center', gap: 4 }}>

          <ThemeToggle />

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

          <div style={{ width: 1, height: 20, background: 'var(--brand-hairline)', margin: '0 12px' }} />

          <button onClick={() => navigate('agency-login')} style={{ padding: '8px 14px', fontSize: 13, fontWeight: 500, color: 'var(--brand-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>For agencies</button>

        </div>



        {/* Mobile menu button */}

        <div style={{ display: isMobile ? 'flex' : 'none', alignItems: 'center', gap: 12 }}>

          <ThemeToggle />

          <button

            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}

            style={{

              width: 36, height: 36, borderRadius: 8, border: '1px solid var(--brand-divider)',

              display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', cursor: 'pointer'

            }}

          >

            {mobileMenuOpen ? <Icon.close /> : <Icon.menu />}

          </button>

        </div>

      </nav>



      {/* Mobile menu dropdown */}

      {mobileMenuOpen && isMobile && (

        <>

          <div onClick={() => setMobileMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'var(--scrim)', backdropFilter: 'blur(2px)' }} />

          <div style={{

            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,

            background: 'var(--surface-overlay)', backdropFilter: 'blur(14px) saturate(140%)',

            borderBottom: '1px solid var(--brand-hairline)',

            padding: '16px', animation: 'fadeIn 0.2s ease-out'

          }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

              {user ? (

                <button

                  onClick={() => { navigate('my-reports'); setMobileMenuOpen(false); }}

                  style={{

                    padding: '8px 14px', fontSize: 13, fontWeight: 500, color: 'var(--brand-ink)', borderRadius: 8,

                    display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer'

                  }}

                >

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

                  <button

                    onClick={() => { navigate('citizen-login'); setMobileMenuOpen(false); }}

                    style={{ padding: '8px 14px', fontSize: 13, fontWeight: 500, color: 'var(--brand-ink)', background: 'none', border: 'none', cursor: 'pointer' }}

                  >

                    Sign in

                  </button>

                  <button

                    onClick={() => { navigate('citizen-signup'); setMobileMenuOpen(false); }}

                    style={{ padding: '8px 14px', fontSize: 13, fontWeight: 500, color: 'var(--brand-ink)', background: 'none', border: 'none', cursor: 'pointer' }}

                  >

                    Create account

                  </button>

                </>

              )}

              <div style={{ width: 1, height: 20, background: 'var(--brand-hairline)', margin: '4px 12px' }} />

              <button

                onClick={() => { navigate('agency-login'); setMobileMenuOpen(false); }}

                style={{ padding: '8px 14px', fontSize: 13, fontWeight: 500, color: 'var(--brand-muted)', background: 'none', border: 'none', cursor: 'pointer' }}

              >

                For agencies

              </button>

            </div>

          </div>

        </>

      )}



      {/* HERO — restrained, two-column, informational */}

      <section style={{ padding: isMobile ? '48px 16px 40px' : '72px 48px 64px', borderBottom: '1px solid var(--brand-surface-alt)' }}>

        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: isTablet ? '1fr' : '1.1fr 1fr', gap: isTablet ? 32 : 64, alignItems: 'flex-start' }}>

          <div>

            <div style={{ fontSize: 12, color: 'var(--brand-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 18 }}>

              Incident Response Management System

            </div>

            <h1 style={{

              fontFamily: 'var(--font-serif)', fontSize: 'clamp(38px, 5vw, 64px)', lineHeight: 1.05, fontWeight: 600,

              letterSpacing: '-0.01em', margin: '0 0 20px', color: 'var(--brand-ink)'

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

              <GhostButton onClick={() => navigate(user ? 'my-reports' : 'agency-login')} size="md">

                {user ? 'View my reports' : 'Agency sign in'}

              </GhostButton>

            </div>

            <div style={{ marginTop: 28, fontSize: 12, color: 'var(--brand-muted)', lineHeight: 1.6, maxWidth: 480 }}>

              <strong style={{ color: 'var(--brand-ink)' }}>Life-threatening emergency?</strong> Always call 112 first.

              IRMS coordinates response — it does not replace direct emergency hotlines.

            </div>

          </div>



          {/* Right column: incident type reference */}

          <div style={{ background: 'var(--brand-white)', border: '1px solid var(--brand-hairline)', borderRadius: 12, overflow: 'hidden' }}>

            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--brand-hairline)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--brand-ink)', letterSpacing: '0.02em' }}>What can I report?</div>

              <div style={{ fontSize: 11, color: 'var(--brand-muted)' }}>Six categories</div>

            </div>

            {INCIDENT_TYPES.map((t, i) => (

              <button key={t.id} onClick={() => navigate('report')} style={{

                width: '100%', display: 'flex', alignItems: 'center', gap: 14,

                padding: isMobile ? '14px 16px' : '12px 18px', background: 'none', cursor: 'pointer',

                border: 'none',

                borderBottom: '1px solid var(--brand-hairline)',

                textAlign: 'left', transition: 'background 0.1s',

              }}

                onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-surface-alt)'}

                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}

              >

                <div style={{

                  width: isMobile ? 36 : 32, height: isMobile ? 36 : 32, borderRadius: 7,

                  background: 'var(--brand-surface-alt)', border: '1px solid var(--brand-hairline)',

                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-ink)', flexShrink: 0,

                }}><t.icon style={{ width: isMobile ? 18 : 16, height: isMobile ? 18 : 16 }} /></div>

                <span style={{ flex: 1, fontSize: isMobile ? 14 : 13.5, fontWeight: 500 }}>{t.label}</span>

                <Icon.chev style={{ color: 'var(--brand-muted)' }} />

              </button>

            ))}

          </div>

        </div>

      </section>



      {/* HOW IT WORKS */}

      <section style={{ padding: isMobile ? '56px 16px' : '80px 48px', borderBottom: '1px solid var(--brand-surface-alt)' }}>

        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 32, marginBottom: 56 }}>

            <div style={{ maxWidth: 640 }}>

              <div style={{ fontSize: 11, color: 'var(--brand-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 14 }}>How it works</div>

              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: isMobile ? 28 : 40, fontWeight: 600, letterSpacing: '-0.01em', margin: '0 0 14px', lineHeight: 1.15, color: 'var(--brand-ink)' }}>

                A short, structured report. Faster than a phone call.

              </h2>

              <p style={{ fontSize: 15, color: 'var(--brand-muted)', lineHeight: 1.6, margin: 0, maxWidth: 560 }}>

                Three steps — usually under thirty seconds. No phone trees, no operators, no waiting on hold while you describe what you're seeing.

              </p>

            </div>

            <div style={{ fontSize: 12, color: 'var(--brand-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>

              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--status-green)' }} />

              Median report → assigned: 4 min 12 s

            </div>

          </div>



          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 1, background: 'var(--brand-hairline)', border: '1px solid var(--brand-hairline)', borderRadius: 12, overflow: 'hidden' }}>

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

                  <div style={{ flex: 1, height: 1, background: 'var(--brand-hairline)' }} />

                </div>

                <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em' }}>{s.title}</div>

                <p style={{ fontSize: 14, color: 'var(--brand-muted)', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>

              </div>

            ))}

          </div>

        </div>

      </section>



      {/* COVERAGE */}

      <section style={{ padding: isMobile ? '48px 16px' : '64px 48px', borderBottom: '1px solid var(--brand-surface-alt)' }}>

        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 1fr', gap: isTablet ? 32 : 64, alignItems: 'flex-start' }}>

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



      {/* PRIVACY */}

      <section style={{ padding: isMobile ? '56px 16px' : '80px 48px', borderBottom: '1px solid var(--brand-surface-alt)' }}>

        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 32, marginBottom: 56 }}>

            <div style={{ maxWidth: 640 }}>

              <div style={{ fontSize: 11, color: 'var(--brand-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 14 }}>Privacy</div>

              <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 14px', lineHeight: 1.1 }}>

                What we collect, and what we don't.

              </h2>

              <p style={{ fontSize: 15, color: 'var(--brand-muted)', lineHeight: 1.6, margin: 0, maxWidth: 560 }}>

                IRMS is a civic service, not a data product. We collect the minimum needed to dispatch responders — and never more.

              </p>

            </div>

            <div style={{ fontSize: 12, color: 'var(--brand-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>

              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--status-green)' }} />

              NDPR compliant · Reviewed Mar 2026

            </div>

          </div>



          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 1, background: 'var(--brand-hairline)', border: '1px solid var(--brand-hairline)', borderRadius: 12, overflow: 'hidden' }}>

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

                label: "What we don't collect",

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

                    <div style={{ flex: 1, height: 1, background: 'var(--brand-hairline)', marginLeft: 8 }} />

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



      {/* AGENCY CTA */}

      <section style={{ padding: isMobile ? '40px 16px' : '48px 48px', background: 'var(--brand-white)' }}>

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



      {/* FOOTER */}

      <footer style={{ padding: isMobile ? '40px 16px 32px' : '40px 48px 32px', background: 'var(--brand-surface-alt)', borderTop: '1px solid var(--brand-hairline)' }}>

        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 32, flexWrap: 'wrap' }}>

          <div style={{ maxWidth: 360 }}>

            <IRMSLogo size={14} color="var(--brand-ink)" />

            <div style={{ fontSize: 12, color: 'var(--brand-muted)', marginTop: 12, lineHeight: 1.6 }}>

              Incident Response Management System. A civic coordination platform for emergency reporting. Pilot deployment for Redemption Camp and Ogun State.

            </div>

          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, auto)', gap: isMobile ? 32 : 56, fontSize: 12 }}>

            <div>

              <div style={{ color: 'var(--brand-muted)', fontWeight: 600, marginBottom: 10, letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: 10 }}>Service</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

                <a href="#" style={{ color: 'var(--brand-ink)' }}>Report an incident</a>

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

// ─── Location Explorer Panel ───────────────────────────────────

function LocationExplorerPanel({ pinLocation, resolvedLocation, reverseGeocoding, nearbyPlaces, fetchingNearbyPlaces, selectedPlace, onSelectPlace, onUseLocation, onClose, locationSearchQuery, setLocationSearchQuery, manualLocation, setManualLocation, showManualEntry, setShowManualEntry, userGpsLocation, locationPermissionGranted, onRecenterToGps }: any) {
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--brand-muted)' }}>
            <Icon.clock width={20} height={20} style={{ animation: 'spin 1s linear infinite' }} />
            <span>Resolving location...</span>
          </div>
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
              const isSelected = selectedPlace && (selectedPlace.id === place.id || selectedPlace.place_id === place.place_id);
              return (
                <button
                  key={place.id || place.place_id || index}
                  onClick={() => onSelectPlace(place)}
                  type="button"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: isSelected ? '2px solid #000' : '1px solid var(--brand-divider)',
                    backgroundColor: isSelected ? '#000' : '#fff',
                    color: isSelected ? '#fff' : '#000',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                  }}
                >
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
                    {isSelected && (
                      <div style={{ color: '#fff', display: 'flex', alignItems: 'center' }}>
                        <Icon.check style={{ width: 18, height: 18 }} />
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
                        {getPlaceName(place)}
                      </div>
                      {place.category && (
                        <div style={{ fontSize: 12, color: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--brand-muted)' }}>
                          {place.category}
                        </div>
                      )}
                      {place.source === 'local' && (
                        <div style={{ fontSize: 11, color: isSelected ? 'rgba(255,255,255,0.6)' : 'var(--status-green)', fontWeight: 600 }}>
                          Local Dataset
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: isSelected ? '#fff' : 'var(--brand-muted)',
                    whiteSpace: 'nowrap',
                    marginLeft: 12,
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--brand-muted)', marginBottom: 20, fontSize: 13 }}>
          <Icon.clock width={16} height={16} style={{ animation: 'spin 1s linear infinite' }} />
          <span>Finding nearby locations...</span>
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

// ─── Incident Detail Panel ─────────────────────────────────────

function IncidentDetailPanel({ incident, onClose }: any) {
  const isMobile = useIsMobile();
  const t = getIncidentType(incident.incident_type);

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
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'white' }}>
              <t.icon style={{ width: 18, height: 18 }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: t.color, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {t.label}
            </span>
          </div>
        </div>
        <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid var(--brand-divider)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', cursor: 'pointer' }}>
          <Icon.close />
        </button>
      </div>

      {/* Incident Details */}
      <div style={{
        background: 'var(--brand-cream)', border: '1px solid var(--brand-divider)',
        borderRadius: 12, padding: isMobile ? '20px' : '24px', marginBottom: 20,
      }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: isMobile ? 18 : 20, fontWeight: 600, marginBottom: 12, lineHeight: 1.3 }}>
          {incident.location_name || 'Unknown location'}
        </div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--brand-muted)' }}>
            Lat: {incident.latitude?.toFixed(5)} · Lng: {incident.longitude?.toFixed(5)}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <StatusBadge status={incident.status} />
          <span style={{ fontSize: 13, color: 'var(--brand-muted)' }}>
            {incident.reference}
          </span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--brand-muted)' }}>
          Reported: {new Date(incident.created_at).toLocaleDateString()} at {new Date(incident.created_at).toLocaleTimeString()}
        </div>
      </div>

      {/* Description */}
      {incident.description && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-muted)', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Description
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--brand-ink)' }}>
            {incident.description}
          </div>
        </div>
      )}

      {/* Assigned Agency */}
      {incident.assigned_agency && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-muted)', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Assigned Agency
          </div>
          <div style={{ fontSize: 14, color: 'var(--brand-ink)' }}>
            {incident.assigned_agency}
          </div>
        </div>
      )}

      {/* Close Button */}
      <button
        onClick={onClose}
        style={{
          width: '100%',
          background: 'var(--brand-surface-alt)',
          color: 'var(--brand-ink)',
          padding: '14px 24px',
          borderRadius: 8,
          fontWeight: 600,
          fontSize: 15,
          border: '1px solid var(--brand-divider)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        Close
      </button>
    </div>
  );
}

export function ReportScreen({ navigate }: Omit<ScreenProps, 'user' | 'onSignOut'>) {

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

  const [refCode, setRefCode] = React.useState('INC-2026-00149');



  const [layerType, setLayerType] = React.useState<'satellite' | 'streets'>('satellite');

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

  // Custom marker icon generator for incident types
  const getIncidentMarkerIcon = (incidentType: string, status: string) => {
    const typeColors: Record<string, string> = {
      rta: '#E84A3F',      // Road Traffic Accident - Red
      medical: '#DC2626',  // Medical Emergency - Dark Red
      fire: '#F97316',     // Fire Outbreak - Orange
      flood: '#0EA5E9',    // Flood - Blue
      missing: '#8B5CF6',  // Missing Person - Purple
      civil: '#F59E0B',    // Civil Disturbance - Amber
    };

    const typeIcons: Record<string, string> = {
      rta: '🚗',
      medical: '🏥',
      fire: '🔥',
      flood: '🌊',
      missing: '👤',
      civil: '⚠️',
    };

    const color = typeColors[incidentType] || '#6B7280';
    const icon = typeIcons[incidentType] || '📍';

    return L.divIcon({
      html: `<div style="
        width: 32px;
        height: 32px;
        background: ${color};
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
      ">${icon}</div>`,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  // Fetch nearby places function with 3-layer search
  const fetchNearbyPlaces = async (lat: number, lng: number) => {
    setFetchingNearbyPlaces(true);
    try {
      // LAYER 1: Search local dataset first
      const localNearby = getNearbyLocations(lat, lng, 3000); // 3km radius
      const localPlacesWithDistance = localNearby.map(loc => ({
        ...loc,
        distance: loc.distance,
        display_name: loc.name,
        source: 'local',
      }));

      console.log('Layer 1 - Local dataset results:', localPlacesWithDistance);

      // LAYER 2: External geocoding (only if local results are insufficient)
      let externalPlaces: any[] = [];
      
      // Redemption Camp bounding box (approximate)
      const redemptionCampBbox = '3.15,6.87,3.20,6.92';

      // Helper function to check if coordinates are within bounding box
      const isWithinBbox = (placeLat: number, placeLon: number) => {
        const minLat = 6.87;
        const maxLat = 6.92;
        const minLon = 3.15;
        const maxLon = 3.20;
        return placeLat >= minLat && placeLat <= maxLat && placeLon >= minLon && placeLon <= maxLon;
      };

      // Only fetch external if we have fewer than 6 local results
      if (localPlacesWithDistance.length < 6) {
        try {
          // Strategy 1: Search with Redemption Camp in query
          const response1 = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=Redemption+Camp+Ogun+State&bounded=1&viewbox=${redemptionCampBbox}&limit=20&addressdetails=1&countrycode=NG`
          );
          const data1 = await response1.json();
          if (data1 && data1.length > 0) {
            externalPlaces = [...externalPlaces, ...data1];
          }

          // Strategy 2: Search with empty query but strict bounds
          const response2 = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=&bounded=1&viewbox=${redemptionCampBbox}&limit=20&addressdetails=1&countrycode=NG&extratags=1&namedetails=1`
          );
          const data2 = await response2.json();
          if (data2 && data2.length > 0) {
            externalPlaces = [...externalPlaces, ...data2];
          }

          // Remove duplicates by place_id
          const uniqueExternal = externalPlaces.filter((place: any, index: number, self: any[]) =>
            index === self.findIndex((p: any) => p.place_id === place.place_id)
          );

          // Calculate distance and filter external results
          const externalWithDistance = uniqueExternal
            .map((place: any) => ({
              ...place,
              distance: calculateDistance(lat, lng, parseFloat(place.lat), parseFloat(place.lon)),
              source: 'external',
            }))
            .filter((place: any) => {
              // STRICT FILTERING:
              // 1. Must be within 2km distance
              const withinDistance = place.distance < 2000;

              // 2. Must be within bounding box coordinates
              const placeLat = parseFloat(place.lat);
              const placeLon = parseFloat(place.lon);
              const withinBbox = isWithinBbox(placeLat, placeLon);

              // 3. Address must contain Nigeria/Ogun/Redemption/Mowe/Ibafo
              const address = (place.display_name || '').toLowerCase();
              const inNigeria = address.includes('nigeria') || address.includes('ogun') || address.includes('redemption') || address.includes('mowe') || address.includes('ibafo');

              // 4. Country code must be NG (if available)
              const countryCode = (place.address?.country_code || '').toLowerCase();
              const correctCountry = !countryCode || countryCode === 'ng';

              return withinDistance && withinBbox && inNigeria && correctCountry;
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

    const map = L.map(mapRef.current, { zoomControl: false }).setView([6.8932, 3.1721], 15);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Store map instance in ref
    mapInstance.current = map;



    tileLayerRef.current = buildBaseLayer(layerType).addTo(map);



    map.on('click', (e: any) => {

      const { lat, lng } = e.latlng;
      console.log('Map clicked at:', lat, lng);

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

  }, [layerType]);

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
          const { latitude, longitude, accuracy } = position.coords;
          toast.dismiss('gps-location-toast');
          toast.success('Location found!');

          setUserGpsLocation({ lat: latitude, lng: longitude, accuracy });
          setLocationPermissionGranted(true);
          setLocationPermissionDenied(false);

          console.log('Setting map view to user location:', latitude, longitude);
          // Center map on user's location
          map.setView([latitude, longitude], 16);

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
          console.error('Geolocation permission denied or error:', error);
          setLocationPermissionDenied(true);
          setLocationPermissionGranted(false);
          // Don't show error toast - just use default map center
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
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

  // Fetch nearby incidents on map load
  React.useEffect(() => {
    const fetchNearbyIncidents = async () => {
      try {
        // Use user's GPS location if available, otherwise use default camp coordinates
        const lat = userGpsLocation?.lat || pinLocation?.lat || 6.8932;
        const lng = userGpsLocation?.lng || pinLocation?.lng || 3.1721;

        const response = await getNearbyIncidents(lat, lng, 10); // 10km radius
        if (response.success && response.results) {
          setNearbyIncidents(response.results);
          // Add markers to map
          if (mapInstance.current && L) {
            const map = mapInstance.current;

            // Clear existing incident markers
            if (incidentMarkersRef.current) {
              incidentMarkersRef.current.forEach((marker: any) => marker.remove());
              incidentMarkersRef.current = [];
            }

            const markers: any[] = [];
            response.results.forEach((incident: any) => {
              const icon = getIncidentMarkerIcon(incident.incident_type, incident.status);
              const marker = L.marker([incident.latitude, incident.longitude], { icon })
                .addTo(map)
                .bindPopup(`
                  <div style="
                    font-family: Arial, sans-serif;
                    font-size: 14px;
                    color: #333;
                    padding: 8px 0;
                    min-width: 200px;
                  ">
                    <div style="font-weight: 600; margin-bottom: 4px; color: #E84A3F;">
                      ${incident.incident_type_display || incident.incident_type}
                    </div>
                    <div style="font-size: 12px; color: #666; margin-bottom: 2px;">
                      Ref: ${incident.reference}
                    </div>
                    <div style="font-size: 12px; color: #666; margin-bottom: 2px;">
                      Status: ${incident.status_display || incident.status}
                    </div>
                    <div style="font-size: 12px; color: #666; margin-bottom: 2px;">
                      ${incident.location_name || 'Unknown location'}
                    </div>
                    ${incident.description ? `<div style="font-size: 11px; color: #888; margin-top: 4px; font-style: italic;">${incident.description.substring(0, 100)}${incident.description.length > 100 ? '...' : ''}</div>` : ''}
                    <div style="font-size: 11px; color: #999; margin-top: 4px;">
                      ${new Date(incident.created_at).toLocaleDateString()}
                    </div>
                  </div>
                `, {
                  closeButton: true,
                  className: 'incident-popup'
                })
                .on('click', () => {
                  setSelectedIncident(incident);
                  setPanelMode('incident');
                  setSheetOpen(true);
                });
              markers.push(marker);
            });
            incidentMarkersRef.current = markers;
          }
        }
      } catch (error) {
        // Silent fail - incident markers are optional, don't log network errors
        // The app should work without incident markers
      }
    };

    fetchNearbyIncidents();
  }, [userGpsLocation, pinLocation]);



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



        // Update user GPS location state
        setUserGpsLocation({ lat: latitude, lng: longitude, accuracy });
        setLocationPermissionGranted(true);
        setLocationPermissionDenied(false);

        map.setView([latitude, longitude], 16);



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
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycode=NG`);

      const data = await response.json();



      if (data && data.length > 0) {

        const { lat, lon, display_name } = data[0];

        const latitude = parseFloat(lat);

        const longitude = parseFloat(lon);

        // Validate that result is in Nigeria
        const address = (display_name || '').toLowerCase();
        const inNigeria = address.includes('nigeria') || address.includes('ogun') || address.includes('redemption') || address.includes('mowe') || address.includes('ibafo');
        const countryCode = (data[0].address?.country_code || '').toLowerCase();
        const correctCountry = !countryCode || countryCode === 'ng';

        if (!inNigeria || !correctCountry) {
          toast.dismiss(toastId);
          toast.error('Location not found in Nigeria. Try a different search term.');
          setSearching(false);
          return;
        }

        toast.dismiss(toastId);

        toast.success(`Found: ${display_name.split(',')[0]}`);



        if (!mapInstance.current || !L) return;

        const map = mapInstance.current;



        map.setView([latitude, longitude], 16);



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

  };



  const handleSubmitReport = async () => {

    if (!selectedType || !pinLocation) return;

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

      });

      setRefCode(result.reference);

      // Store recent report reference
      const recentReports = JSON.parse(localStorage.getItem('irms_recent_reports') || '[]');
      const updatedReports = [result.reference, ...recentReports.filter((ref: string) => ref !== result.reference)].slice(0, 5);
      localStorage.setItem('irms_recent_reports', JSON.stringify(updatedReports));

      setSubmitted(true);

      toast.success(`Incident ${result.reference} reported successfully!`);

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

        padding: isMobile ? '12px 16px' : '14px 24px', background: 'var(--surface-overlay)', backdropFilter: 'blur(14px) saturate(140%)',

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

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

          <ThemeToggle />

          <div style={{ display: isMobile ? 'none' : 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'var(--brand-surface-alt)', border: '1px solid var(--brand-divider)', borderRadius: 8 }}>

            <Icon.pin style={{ color: 'var(--brand-ink)', width: 14, height: 14 }} />

            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--brand-ink)' }}>Click the map to place a pin</span>

          </div>

        </div>

      </div>



      {/* Map */}

      <div ref={mapRef} style={{ position: 'absolute', inset: 0, top: 0 }} />



      {/* Floating Geosearch Bar */}

      <form onSubmit={handleSearch} className="irms-map-search-container" style={{

        position: 'absolute', top: isMobile ? 72 : 84, left: isMobile ? 16 : undefined, right: isMobile ? 16 : 24, zIndex: 1000,

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



      {/* Recent Reports Panel */}
      {recentReports.length > 0 && (
        <div style={{
          position: 'absolute',
          top: isMobile ? 72 : 84,
          left: isMobile ? 16 : 24,
          zIndex: 1000,
          background: 'var(--brand-white)',
          border: '1px solid var(--brand-divider)',
          borderRadius: 12,
          padding: 16,
          width: isMobile ? 'auto' : 280,
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

        position: 'absolute', bottom: 24, right: 24, zIndex: 1000,

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



      {/* Legend */}

      <div style={{

        position: 'absolute', bottom: 24, left: 24, zIndex: 500,

        background: 'rgba(11,13,19,0.92)', backdropFilter: 'blur(8px)',

        border: '1px solid var(--brand-divider)', borderRadius: 12, padding: '12px 14px',

      }}>

        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--brand-muted)', letterSpacing: '0.12em', marginBottom: 8 }}>NEARBY INCIDENTS</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>

          {[

            { c: '#E84A3F', l: 'Road Traffic Accident', icon: Icon.car },

            { c: '#DC2626', l: 'Medical Emergency', icon: Icon.medical },

            { c: '#F97316', l: 'Fire Outbreak', icon: Icon.fire },

            { c: '#0EA5E9', l: 'Flood Incident', icon: Icon.flood },

            { c: '#8B5CF6', l: 'Missing Person', icon: Icon.person },

            { c: '#F59E0B', l: 'Civil Disturbance', icon: Icon.crowd },

          ].map(x => (

            <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'white' }}>

              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, color: x.c }}>

                <x.icon width={16} height={16} />

              </span>

              {x.l}

            </div>

          ))}

        </div>

      </div>



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
                  setSelectedPlace(place);
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



// ─── Description hints per type ────────────────────────────────



const TYPE_DESCRIPTION_HINTS: Record<string, string> = {

  rta: 'e.g. Two vehicles collided near the gate. One overturned. Injuries visible. Approx. 5 passengers.',

  missing: 'e.g. 7-year-old boy, blue striped shirt, last seen near the food court at 14:20.',

  civil: 'e.g. Large crowd gathering at Gate 2. Arguments reported. No weapons seen yet.',

  medical: 'e.g. Elderly woman collapsed near Auditorium 3. Conscious but unresponsive. Crowd gathered.',

  flood: 'e.g. Water overflowing drainage channel B, blocking the pedestrian pathway.',

  fire: 'e.g. Smoke visible from Kitchen Block C. No flames yet. Residents evacuating.',

};



// ─── Report Form ────────────────────────────────────────────



function ReportForm({ pinLocation, selectedType, setSelectedType, description, setDescription, attachments, setAttachments, trackReport, setTrackReport, onClose, onSubmit, submitting, selectedPlace, manualLocation, resolvedLocation }: any) {

  const isMobile = useIsMobile();

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const MAX_CHARS = 500;

  const charCount = description.length;

  // Get the location name to display
  const getDisplayLocationName = () => {
    if (manualLocation?.trim()) return manualLocation.trim();
    if (selectedPlace?.name) return selectedPlace.name;
    if (selectedPlace?.display_name) {
      const parts = selectedPlace.display_name.split(',');
      return parts[0].trim();
    }
    if (resolvedLocation) {
      const parts = resolvedLocation.split(',');
      return parts[0].trim();
    }
    return 'Selected location';
  };



  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {

    const files = Array.from(e.target.files || []);

    const MAX_FILES = 6;

    const remaining = MAX_FILES - attachments.length;

    if (files.length > remaining) {

      toast.error(`You can attach up to ${MAX_FILES} files. ${MAX_FILES - attachments.length} slots remaining.`);

      return;

    }

    const invalid = files.filter(f => f.size > 20 * 1024 * 1024);

    if (invalid.length) {

      toast.error('Some files exceed the 20 MB limit and were skipped.');

    }

    const valid = files.filter(f => f.size <= 20 * 1024 * 1024);

    setAttachments((prev: File[]) => [...prev, ...valid].slice(0, MAX_FILES));

    // Reset file input

    if (fileInputRef.current) fileInputRef.current.value = '';

  };



  const removeAttachment = (idx: number) => {

    setAttachments((prev: File[]) => prev.filter((_: File, i: number) => i !== idx));

  };



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

            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--status-red)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Pinned location</span>

          </div>

          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 600, marginBottom: 4, letterSpacing: '0.01em' }}>{getDisplayLocationName()}</div>

          <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--brand-muted)' }}>

            {pinLocation ? `${pinLocation.lat.toFixed(5)}° N · ${pinLocation.lng.toFixed(5)}° E` : '6.89320° N · 3.17210° E'} · OGUN STATE

          </div>

        </div>

        <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid var(--brand-divider)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', cursor: 'pointer' }}>

          <Icon.close />

        </button>

      </div>



      {/* Incident Type Selector Grid */}

      <div style={{ marginBottom: 24 }}>

        <label style={{ display: 'block', fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 600, color: 'var(--brand-ink)', marginBottom: 12 }}>

          What is happening? <span style={{ color: 'var(--status-red)', marginLeft: 2 }}>*</span>

        </label>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: 8 }}>

          {INCIDENT_TYPES.map(t => {

            const selected = selectedType === t.id;

            return (

              <button

                key={t.id}

                type="button"

                onClick={() => setSelectedType(selected ? null : t.id)}

                style={{

                  padding: '16px 10px 14px', borderRadius: 12,

                  background: selected ? 'var(--status-red-bg)' : 'var(--brand-cream)',

                  border: selected ? '2px solid var(--status-red)' : '1.5px solid var(--brand-divider)',

                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9,

                  color: selected ? 'var(--status-red)' : 'var(--brand-ink)',

                  transition: 'all 0.18s cubic-bezier(.2,.8,.2,1)',

                  cursor: 'pointer',

                  boxShadow: selected ? '0 0 0 3px rgba(200, 70, 60, 0.12)' : '0 1px 2px rgba(40,35,20,0.04)',

                  transform: selected ? 'scale(1.02)' : 'scale(1)',

                }}

                onMouseEnter={e => {

                  if (!selected) {

                    e.currentTarget.style.background = 'var(--brand-white)';

                    e.currentTarget.style.borderColor = 'var(--brand-muted)';

                    e.currentTarget.style.transform = 'scale(1.02)';

                  }

                }}

                onMouseLeave={e => {

                  if (!selected) {

                    e.currentTarget.style.background = 'var(--brand-cream)';

                    e.currentTarget.style.borderColor = 'var(--brand-divider)';

                    e.currentTarget.style.transform = 'scale(1)';

                  }

                }}

              >

                <div style={{

                  width: 38, height: 38, borderRadius: 10,

                  background: selected ? 'rgba(200, 70, 60, 0.1)' : 'var(--brand-white)',

                  border: `1px solid ${selected ? 'var(--status-red-bd)' : 'var(--brand-hairline)'}`,

                  display: 'flex', alignItems: 'center', justifyContent: 'center',

                  transition: 'all 0.18s',

                }}>

                  <t.icon style={{ width: 20, height: 20 }} />

                </div>

                <span style={{ fontSize: 11.5, fontWeight: 600, textAlign: 'center', lineHeight: 1.25 }}>{t.label}</span>

              </button>

            );

          })}

        </div>

      </div>



      {/* Description */}

      <div style={{ marginBottom: 24 }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>

          <label style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 600, color: 'var(--brand-ink)' }}>

            Describe the incident

          </label>

          <span style={{

            fontSize: 11, fontFamily: 'var(--font-mono)',

            color: charCount > MAX_CHARS * 0.9 ? 'var(--status-red)' : 'var(--brand-muted)',

          }}>

            {charCount}/{MAX_CHARS}

          </span>

        </div>

        <textarea

          value={description}

          onChange={e => setDescription(e.target.value.slice(0, MAX_CHARS))}

          placeholder={selectedType && TYPE_DESCRIPTION_HINTS[selectedType]

            ? TYPE_DESCRIPTION_HINTS[selectedType]

            : 'Describe what you are seeing right now — be as specific as possible. Mention injuries, vehicles, landmarks.'}

          style={{

            width: '100%', minHeight: 110, padding: '13px 14px', borderRadius: 10,

            background: 'var(--brand-cream)', border: '1.5px solid var(--brand-divider)',

            color: 'var(--brand-ink)', fontSize: 14, lineHeight: 1.6, resize: 'vertical',

            fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',

            transition: 'border-color 0.15s',

          }}

          onFocus={e => e.target.style.borderColor = 'var(--status-red)'}

          onBlur={e => e.target.style.borderColor = 'var(--brand-divider)'}

        />

        {/* Progress bar */}

        <div style={{ height: 2, background: 'var(--brand-hairline)', borderRadius: 1, marginTop: 6, overflow: 'hidden' }}>

          <div style={{

            height: '100%',

            width: `${(charCount / MAX_CHARS) * 100}%`,

            background: charCount > MAX_CHARS * 0.9 ? 'var(--status-red)' : charCount > MAX_CHARS * 0.6 ? 'var(--status-amber)' : 'var(--status-green)',

            borderRadius: 1,

            transition: 'width 0.2s, background 0.3s',

          }} />

        </div>

      </div>



      {/* File Upload */}

      <div style={{ marginBottom: 24 }}>

        <label style={{ display: 'block', fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 600, color: 'var(--brand-ink)', marginBottom: 8 }}>

          Photos or videos <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--brand-muted)', fontWeight: 400 }}>(optional · max 6 files · 20 MB each)</span>

        </label>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-start' }}>

          {attachments.map((file: File, idx: number) => (

            <AttachmentPreview key={`${file.name}-${idx}`} file={file} onRemove={() => removeAttachment(idx)} />

          ))}

          {attachments.length < 6 && (

            <button

              type="button"

              onClick={() => fileInputRef.current?.click()}

              style={{

                width: 80, height: 80, borderRadius: 10,

                border: '2px dashed var(--brand-muted)', background: 'transparent',

                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5,

                color: 'var(--brand-muted)', cursor: 'pointer',

                transition: 'all 0.15s',

              }}

              onMouseEnter={e => {

                e.currentTarget.style.borderColor = 'var(--brand-ink)';

                e.currentTarget.style.color = 'var(--brand-ink)';

                e.currentTarget.style.background = 'var(--brand-cream)';

              }}

              onMouseLeave={e => {

                e.currentTarget.style.borderColor = 'var(--brand-muted)';

                e.currentTarget.style.color = 'var(--brand-muted)';

                e.currentTarget.style.background = 'transparent';

              }}

            >

              <Icon.upload style={{ width: 18, height: 18 }} />

              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.02em' }}>ATTACH</span>

            </button>

          )}

        </div>

        <input

          ref={fileInputRef}

          type="file"

          accept="image/*,video/*"

          multiple

          onChange={handleFileSelect}

          style={{ display: 'none' }}

        />

      </div>



      {/* Track toggle */}

      <div style={{

        padding: 14, borderRadius: 10, background: 'var(--brand-cream)',

        border: '1px solid var(--brand-divider)', marginBottom: 20,

      }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>

          <div>

            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--brand-ink)' }}>Track this report</div>

            <div style={{ fontSize: 12, color: 'var(--brand-muted)', marginTop: 2 }}>We'll give you a reference code to check status in this browser.</div>

          </div>

          <button

            type="button"

            onClick={() => setTrackReport(!trackReport)}

            style={{

              width: 44, height: 24, borderRadius: 12,

              background: trackReport ? 'var(--brand-ink)' : 'var(--brand-divider)',

              position: 'relative', transition: 'background 0.2s', flexShrink: 0,

              border: 'none', cursor: 'pointer'

            }}>

            <div style={{

              position: 'absolute', top: 2, left: trackReport ? 22 : 2,

              width: 20, height: 20, borderRadius: '50%', background: 'white',

              transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(40,35,20,0.2)',

            }} />

          </button>

        </div>

      </div>



      {/* Submit */}

      <button

        type="button"

        onClick={onSubmit}

        disabled={!selectedType || submitting}

        style={{

          width: '100%', padding: '14px 24px', borderRadius: 9,

          background: (!selectedType || submitting) ? 'var(--brand-muted)' : 'var(--status-red)',

          color: 'white', fontWeight: 600, fontSize: 15, border: 'none',

          cursor: (!selectedType || submitting) ? 'not-allowed' : 'pointer',

          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,

          transition: 'background 0.2s, transform 0.1s',

          transform: 'scale(1)',

          letterSpacing: '0.005em',

        }}

        onMouseEnter={e => { if (selectedType && !submitting) e.currentTarget.style.background = '#B23B33'; }}

        onMouseLeave={e => { if (selectedType && !submitting) e.currentTarget.style.background = 'var(--status-red)'; }}

        onMouseDown={e => { if (selectedType && !submitting) e.currentTarget.style.transform = 'scale(0.98)'; }}

        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}

      >

        {submitting ? (

          <>

            <Spinner />

            Submitting report…

          </>

        ) : (

          <>Submit Report</>

        )}

      </button>



      {!selectedType && (

        <div style={{ fontSize: 12, color: 'var(--brand-muted)', textAlign: 'center', marginTop: 8 }}>

          Select an incident type above to continue

        </div>

      )}



      <div style={{ fontSize: 11, color: 'var(--brand-muted)', textAlign: 'center', marginTop: 10 }}>

        By submitting you confirm this is a genuine incident. False reports are an offense.

      </div>

    </div>

  );

}



// ─── Attachment Preview ─────────────────────────────────────



function AttachmentPreview({ file, onRemove }: { file: File; onRemove: () => void }) {

  const [preview, setPreview] = React.useState<string | null>(null);

  const isImage = file.type.startsWith('image/');

  const isVideo = file.type.startsWith('video/');



  React.useEffect(() => {

    if (isImage) {

      const reader = new FileReader();

      reader.onload = e => setPreview(e.target?.result as string);

      reader.readAsDataURL(file);

    }

    return () => setPreview(null);

  }, [file]);



  const formatSize = (bytes: number) => {

    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  };



  return (

    <div style={{

      width: 80, height: 80, borderRadius: 10, position: 'relative',

      border: '1px solid var(--brand-divider)', overflow: 'hidden',

      background: 'var(--brand-cream)',

      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',

    }}>

      {isImage && preview ? (

        <img

          src={preview}

          alt={file.name}

          style={{ width: '100%', height: '100%', objectFit: 'cover' }}

        />

      ) : isVideo ? (

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: 4 }}>

          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brand-muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">

            <path d="M15 10l4.553-2.276A1 1 0 0 1 21 8.723v6.554a1 1 0 0 1-1.447.894L15 14M3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" />

          </svg>

          <span style={{ fontSize: 9, color: 'var(--brand-muted)', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>{formatSize(file.size)}</span>

        </div>

      ) : (

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: 4 }}>

          <Icon.upload style={{ width: 20, height: 20, color: 'var(--brand-muted)' }} />

          <span style={{ fontSize: 9, color: 'var(--brand-muted)', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>{formatSize(file.size)}</span>

        </div>

      )}

      {/* Remove button */}

      <button

        type="button"

        onClick={onRemove}

        style={{

          position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%',

          background: 'rgba(20, 18, 14, 0.8)', color: 'white',

          display: 'flex', alignItems: 'center', justifyContent: 'center',

          border: 'none', cursor: 'pointer', padding: 0,

        }}

      >

        <Icon.close style={{ width: 12, height: 12 }} />

      </button>

      {/* File name tooltip on hover */}

      <div style={{

        position: 'absolute', bottom: 0, left: 0, right: 0,

        background: 'rgba(20, 18, 14, 0.75)', backdropFilter: 'blur(4px)',

        padding: '3px 5px', fontSize: 9, color: 'white', fontWeight: 500,

        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',

      }}>

        {file.name.length > 10 ? file.name.slice(0, 8) + '…' : file.name}

      </div>

    </div>

  );

}



// ─── Spinner ────────────────────────────────────────────────



function Spinner() {

  return (

    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.75s linear infinite' }}>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40 20" strokeLinecap="round" />

    </svg>

  );

}



// ─── Report Success ─────────────────────────────────────────



function ReportSuccess({ refCode, pinLocation, trackReport, onClose, navigate }: any) {

  const isMobile = useIsMobile();

  const [copied, setCopied] = React.useState(false);



  const handleCopy = () => {

    if (typeof navigator !== 'undefined') {

      navigator.clipboard.writeText(refCode).then(() => {

        setCopied(true);

        toast.success('Reference code copied to clipboard!');

        setTimeout(() => setCopied(false), 2500);

      });

    }

  };



  const handleShare = async () => {

    if (typeof navigator !== 'undefined' && navigator.share) {

      try {

        await navigator.share({

          title: 'IRMS Incident Report',

          text: `I submitted an incident report to IRMS. Reference: ${refCode}. Track it at irms.ng`,

          url: window.location.origin + '/track?ref=' + refCode,

        });

      } catch (_) {

        // user cancelled share

      }

    } else {

      handleCopy();

    }

  };



  return (

    <div style={{ maxWidth: 540, margin: '0 auto', padding: isMobile ? '40px 20px 36px' : '40px 28px 36px', textAlign: 'center', animation: 'fadeIn 0.4s ease-out' }}>

      {/* Animated success icon */}

      <div style={{

        width: 80, height: 80, borderRadius: '50%',

        background: 'var(--status-green-bg)', border: '2px solid var(--status-green-bd)',

        display: 'flex', alignItems: 'center', justifyContent: 'center',

        margin: '0 auto 24px', color: 'var(--status-green)',

        animation: 'scaleIn 0.4s ease-out 0.1s both',

      }}>

        <Icon.check style={{ width: 40, height: 40 }} />

      </div>



      <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 10px' }}>Report submitted</h2>

      <p style={{ fontSize: 14, color: 'var(--brand-muted)', margin: '0 0 8px', lineHeight: 1.6 }}>

        Verified agencies covering this location have been notified.

      </p>

      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 6, background: 'var(--status-green-bg)', border: '1px solid var(--status-green-bd)', marginBottom: 28 }}>

        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--status-green)' }} />

        <span style={{ fontSize: 12, color: 'var(--status-green)', fontWeight: 600 }}>Estimated response: ~4 minutes</span>

      </div>



      {/* Reference code */}

      <div style={{ marginBottom: 28 }}>

        <div style={{ fontSize: 11, color: 'var(--brand-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Your reference code</div>

        <div

          onClick={handleCopy}

          style={{

            display: 'inline-flex', alignItems: 'center', gap: 12, padding: '12px 20px',

            borderRadius: 999, background: 'var(--brand-cream)', border: `2px solid ${copied ? 'var(--status-green)' : 'var(--brand-divider)'}`,

            cursor: 'pointer', transition: 'border-color 0.2s',

          }}

        >

          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: 'var(--brand-ink)', letterSpacing: '0.04em' }}>{refCode}</span>

          <span style={{

            display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,

            color: copied ? 'var(--status-green)' : 'var(--brand-muted)', fontWeight: 600,

            transition: 'color 0.2s',

          }}>

            {copied ? <Icon.check style={{ width: 14, height: 14 }} /> : (

              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">

                <rect x="9" y="9" width="13" height="13" rx="2" />

                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />

              </svg>

            )}

            {copied ? 'Copied!' : 'Copy'}

          </span>

        </div>

        <div style={{ fontSize: 12, color: 'var(--brand-muted)', marginTop: 8, lineHeight: 1.5 }}>

          Save this code to track your report from any device.

        </div>

      </div>



      {/* Action buttons */}

      <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>

        {trackReport && (

          <button

            type="button"

            onClick={() => navigate('track', { ref: refCode })}

            style={{

              width: '100%', padding: '12px 20px', borderRadius: 9,

              background: 'var(--status-red)', color: 'white',

              fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer',

              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,

              transition: 'background 0.15s',

            }}

            onMouseEnter={e => e.currentTarget.style.background = '#B23B33'}

            onMouseLeave={e => e.currentTarget.style.background = 'var(--status-red)'}

          >

            View report status <Icon.arrow />

          </button>

        )}

        <button

          type="button"

          onClick={handleShare}

          style={{

            width: '100%', padding: '11px 20px', borderRadius: 9,

            background: 'var(--brand-white)', color: 'var(--brand-ink)',

            fontWeight: 500, fontSize: 14, border: '1px solid var(--brand-divider)', cursor: 'pointer',

            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,

            transition: 'background 0.15s',

          }}

          onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-cream)'}

          onMouseLeave={e => e.currentTarget.style.background = 'var(--brand-white)'}

        >

          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">

            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />

            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />

          </svg>

          Share reference

        </button>

        <button

          type="button"

          onClick={() => { onClose(); }}

          style={{

            width: '100%', padding: '10px 20px', borderRadius: 9,

            background: 'transparent', color: 'var(--brand-muted)',

            fontWeight: 500, fontSize: 14, border: 'none', cursor: 'pointer',

            transition: 'color 0.15s',

          }}

          onMouseEnter={e => e.currentTarget.style.color = 'var(--brand-ink)'}

          onMouseLeave={e => e.currentTarget.style.color = 'var(--brand-muted)'}

        >

          Report another incident

        </button>

      </div>

    </div>

  );

}



// -----------------------------------------------------------

// SCREEN 3 — TRACK REPORT

// -----------------------------------------------------------

export function TrackScreen({ navigate, params }: any) {

  const isMobile = useIsMobile();

  const ref = params?.ref || '';

  const [incident, setIncident] = React.useState<any>(null);

  const [loading, setLoading] = React.useState(true);

  const [error, setError] = React.useState<string | null>(null);



  React.useEffect(() => {

    if (ref) {

      loadIncident();

    }

  }, [ref]);



  const loadIncident = async () => {

    setLoading(true);

    setError(null);

    try {

      const data = await trackIncident(ref);

      setIncident(data);

    } catch (err: any) {

      setError(err.message || 'Failed to load incident');

    } finally {

      setLoading(false);

    }

  };



  if (loading) {

    return (

      <div style={{ background: 'var(--brand-cream)', minHeight: '100vh', color: 'var(--brand-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        <div style={{ textAlign: 'center' }}>

          <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}><Icon.clock width={32} height={32} style={{ color: 'var(--brand-muted)' }} /></div>

          <div style={{ fontSize: 15, fontWeight: 600 }}>Loading incident...</div>

        </div>

      </div>

    );

  }



  if (error || !incident) {

    return (

      <div style={{ background: 'var(--brand-cream)', minHeight: '100vh', color: 'var(--brand-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        <div style={{ textAlign: 'center', padding: 24 }}>

          <div style={{ fontSize: 32, marginBottom: 12 }}>❌</div>

          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Incident not found</div>

          <div style={{ fontSize: 13, color: 'var(--brand-muted)', marginBottom: 20 }}>{error || 'Please check the reference code and try again.'}</div>

          <button onClick={() => navigate('landing')} style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-ink)', textDecoration: 'underline', textUnderlineOffset: 3, background: 'none', border: 'none', cursor: 'pointer' }}>

            Return to home

          </button>

        </div>

      </div>

    );

  }



  const status = incident.status as IncidentStatus;



  return (

    <div style={{ background: 'var(--brand-cream)', minHeight: '100vh', color: 'var(--brand-ink)' }}>

      {/* Nav */}

      <nav style={{

        display: 'flex', alignItems: 'center', justifyContent: 'space-between',

        padding: isMobile ? '16px 16px' : '18px 32px', borderBottom: '1px solid var(--brand-hairline)',

      }}>

        <button onClick={() => navigate('landing')} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>

          <Icon.back />

          <IRMSLogo size={15} color="var(--brand-ink)" />

        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

          <div style={{ fontSize: 12, color: 'var(--brand-muted)' }}>Tracking Page</div>

          <ThemeToggle />

        </div>

      </nav>



      <div style={{ maxWidth: 720, margin: '0 auto', padding: isMobile ? '40px 16px 60px' : '60px 32px 80px' }}>

        {/* Reference code */}

        <div style={{ marginBottom: 40 }}>

          <div style={{ fontSize: 11, color: 'var(--brand-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>Report reference</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 700, letterSpacing: '-0.01em' }}>{incident.reference}</div>

            <StatusBadge status={status} />

          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--brand-muted)' }}>

              <Icon.pin style={{ width: 16, height: 16 }} />

              <span style={{ fontSize: 14 }}>{incident.location_name}</span>

            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 6, background: 'var(--status-red-bg)', border: '1px solid var(--status-red-bd)' }}>

              <Icon.person style={{ width: 14, height: 14, color: 'var(--status-red)' }} />

              <span style={{ fontSize: 12, color: 'var(--status-red)', fontWeight: 600 }}>{incident.incident_type_display}</span>

            </div>

          </div>

        </div>



        {/* Stepper card */}

        <div style={{

          background: 'var(--brand-white)', border: '1px solid var(--brand-hairline)',

          borderRadius: 16, padding: isMobile ? '28px 20px' : '36px 32px', marginBottom: 24,

        }}>

          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-muted)', marginBottom: 28, letterSpacing: '0.02em' }}>STATUS TIMELINE</div>

          <div style={{ overflowX: 'auto' }}>

            <StatusStepper current={status} />

          </div>

        </div>



        {/* Assigned agency card */}

        {incident.responding_agency ? (

          <div style={{

            background: 'var(--brand-white)', border: '1px solid var(--status-blue-bd)',

            borderRadius: 16, padding: 24, marginBottom: 24,

            display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 20,

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

              <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>{incident.responding_agency.name}</div>

              <div style={{ fontSize: 13, color: 'var(--brand-muted)' }}>{incident.responding_agency.type}</div>

            </div>

            <StatusBadge status={status} />

          </div>

        ) : (

          <div style={{

            background: 'var(--brand-white)', border: '1px solid var(--brand-hairline)',

            borderRadius: 16, padding: 24, marginBottom: 24,

            display: 'flex', alignItems: 'center', gap: 16,

          }}>

            <div style={{

              width: 52, height: 52, borderRadius: 12, flexShrink: 0,

              background: 'var(--brand-cream)', border: '1px solid var(--brand-divider)',

              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-muted)',

            }}>

              <Icon.clock style={{ width: 24, height: 24 }} />

            </div>

            <div>

              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>No agency assigned yet</div>

              <div style={{ fontSize: 13, color: 'var(--brand-muted)' }}>Your report is being reviewed</div>

            </div>

          </div>

        )}



        {/* Timeline card */}

        {incident.timeline && incident.timeline.length > 0 && (

          <div style={{

            background: 'var(--brand-white)', border: '1px solid var(--brand-hairline)',

            borderRadius: 16, padding: isMobile ? '24px 20px' : '28px 32px', marginBottom: 24,

          }}>

            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-muted)', marginBottom: 20, letterSpacing: '0.02em' }}>TIMELINE</div>

            {incident.timeline.map((event: any, index: number) => (

              <div key={index} style={{ display: 'flex', gap: 16, marginBottom: index < incident.timeline.length - 1 ? 20 : 0 }}>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 24 }}>

                  <div style={{

                    width: 12, height: 12, borderRadius: '50%',

                    background: event.status === 'completed' ? 'var(--status-green)' : 'var(--brand-muted)',

                    border: event.status === 'completed' ? '2px solid var(--status-green)' : '2px solid var(--brand-divider)',

                  }} />

                  {index < incident.timeline.length - 1 && (

                    <div style={{ width: 2, flex: 1, background: 'var(--brand-divider)', minHeight: 32, marginTop: 8 }} />

                  )}

                </div>

                <div style={{ flex: 1, paddingTop: 2 }}>

                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{event.title}</div>

                  <div style={{ fontSize: 12, color: 'var(--brand-muted)' }}>{event.description}</div>

                  <div style={{ fontSize: 11, color: 'var(--brand-muted)', marginTop: 4 }}>{event.timestamp}</div>

                </div>

              </div>

            ))}

          </div>

        )}



        {/* Activity log card */}

        {incident.activity_log && incident.activity_log.length > 0 && (

          <div style={{

            background: 'var(--brand-white)', border: '1px solid var(--brand-hairline)',

            borderRadius: 16, padding: isMobile ? '24px 20px' : '28px 32px', marginBottom: 24,

          }}>

            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-muted)', marginBottom: 20, letterSpacing: '0.02em' }}>ACTIVITY LOG</div>

            {incident.activity_log.map((log: any, index: number) => (

              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: index < incident.activity_log.length - 1 ? '1px solid var(--brand-hairline)' : 'none' }}>

                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--brand-muted)', minWidth: 50 }}>{log.time}</span>

                <span style={{ width: 8, height: 8, borderRadius: '50%', background: log.color || 'var(--brand-muted)' }} />

                <span style={{ fontSize: 14, color: 'var(--brand-ink)' }}>{log.event}</span>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>

  );

}

