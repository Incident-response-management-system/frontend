import React from 'react';

import {
  IRMSLogo,
  Icon,
  INCIDENT_TYPES,
  PrimaryButton,
  InkButton,
  GhostButton,
} from '@/components/irms-shared';

import { useIsMobile, useIsTablet } from '@/hooks/use-media-query';

import { ThemeToggle } from '@/components/ThemeToggle';



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

              Live incident reporting · Agencies notified instantly

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

              { cat: 'Police service', desc: 'Law enforcement agencies covering this area' },

              { cat: 'Medical / Hospital', desc: 'Emergency medical response units' },

              { cat: 'Fire & rescue', desc: 'Fire service and rescue operations' },

              { cat: 'Private security', desc: 'Registered private security firms' },

            ].map((r, i) => (

              <div key={r.cat} style={{

                padding: '16px 20px',

                borderBottom: i < 3 ? '1px solid var(--brand-hairline)' : 'none',

              }}>

                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>{r.cat}</div>

                <div style={{ fontSize: 12, color: 'var(--brand-muted)' }}>{r.desc}</div>

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
