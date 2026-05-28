// ============================================================
// PUBLIC SCREENS — Landing, Report (map + sheet), Track
// ============================================================

// -----------------------------------------------------------
// SCREEN 1 — LANDING
// Civic, professional, restrained. Information-first.
// -----------------------------------------------------------
function LandingScreen({ navigate, user, onSignOut }) {
  return (
    <div style={{ background: 'var(--ink-900)', color: 'var(--ink-50)', minHeight: '100vh' }}>
      {/* Slim utility bar — official, civic feel */}
      <div style={{
        background: 'var(--ink-700)', borderBottom: '1px solid var(--ink-600)',
        padding: '7px 48px', display: 'flex', justifyContent: 'space-between',
        fontSize: 11, color: 'var(--ink-300)',
      }}>
        <span>A civic emergency reporting service · Pilot deployment, Ogun State</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }}/>
          Services operational
        </span>
      </div>

      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 48px', borderBottom: '1px solid var(--ink-600)',
        background: 'rgba(244, 242, 236, 0.88)', backdropFilter: 'blur(14px) saturate(140%)',
      }}>
        <IRMSLogo size={16} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {user ? (
            <button onClick={() => navigate('my-reports')} style={{
              padding: '8px 14px', fontSize: 13, fontWeight: 500, color: 'var(--ink-100)', borderRadius: 8,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--ink-700)', border: '1px solid var(--ink-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600 }}>
                {user.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
              </div>
              My reports
            </button>
          ) : (
            <>
              <button onClick={() => navigate('citizen-login')} style={{ padding: '8px 14px', fontSize: 13, fontWeight: 500, color: 'var(--ink-100)' }}>Sign in</button>
              <button onClick={() => navigate('citizen-signup')} style={{ padding: '8px 14px', fontSize: 13, fontWeight: 500, color: 'var(--ink-100)' }}>Create account</button>
            </>
          )}
          <div style={{ width: 1, height: 20, background: 'var(--ink-600)', margin: '0 12px' }}/>
          <button onClick={() => navigate('agency-login')} style={{ padding: '8px 14px', fontSize: 13, fontWeight: 500, color: 'var(--ink-200)' }}>For agencies</button>
        </div>
      </nav>

      {/* HERO — restrained, two-column, informational */}
      <section style={{ padding: '72px 48px 64px', borderBottom: '1px solid var(--ink-700)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 64, alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--ink-300)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 18 }}>
              Incident Response Management System
            </div>
            <h1 style={{
              fontSize: 'clamp(36px, 4.5vw, 56px)', lineHeight: 1.05, fontWeight: 700,
              letterSpacing: '-0.025em', margin: '0 0 20px', textWrap: 'balance',
            }}>
              Report emergencies and reach the right responders.
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--ink-200)', maxWidth: 520, margin: '0 0 32px' }}>
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
            <div style={{ marginTop: 28, fontSize: 12, color: 'var(--ink-300)', lineHeight: 1.6, maxWidth: 480 }}>
              <strong style={{ color: 'var(--ink-100)' }}>Life-threatening emergency?</strong> Always call 112 first.
              IRMS coordinates response — it does not replace direct emergency hotlines.
            </div>
          </div>

          {/* Right column: incident type reference (utility, not decoration) */}
          <div style={{ background: 'var(--ink-800)', border: '1px solid var(--ink-600)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--ink-600)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-100)', letterSpacing: '0.02em' }}>What can I report?</div>
              <div style={{ fontSize: 11, color: 'var(--ink-300)' }}>Six categories</div>
            </div>
            {INCIDENT_TYPES.map((t, i) => (
              <button key={t.id} onClick={() => navigate('report')} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 18px',
                borderBottom: i < INCIDENT_TYPES.length - 1 ? '1px solid var(--ink-700)' : 'none',
                textAlign: 'left', transition: 'background 0.1s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--ink-700)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 7,
                  background: 'var(--ink-700)', border: '1px solid var(--ink-500)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-100)', flexShrink: 0,
                }}><t.icon style={{ width: 16, height: 16 }} /></div>
                <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500 }}>{t.label}</span>
                <Icon.chev style={{ color: 'var(--ink-400)' }} />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — terse, informational */}
      <section style={{ padding: '80px 48px', borderBottom: '1px solid var(--ink-700)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 32, marginBottom: 56 }}>
            <div style={{ maxWidth: 640 }}>
              <div style={{ fontSize: 11, color: 'var(--ink-300)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 14 }}>How it works</div>
              <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 14px', lineHeight: 1.1 }}>
                A short, structured report. Faster than a phone call.
              </h2>
              <p style={{ fontSize: 15, color: 'var(--ink-200)', lineHeight: 1.6, margin: 0, maxWidth: 560 }}>
                Three steps — usually under thirty seconds. No phone trees, no operators, no waiting on hold while you describe what you're seeing.
              </p>
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-300)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }}/>
              Median report → assigned: 4 min 12 s
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--ink-700)', border: '1px solid var(--ink-700)', borderRadius: 12, overflow: 'hidden' }}>
            {[
              { num: '01', title: 'Pin the location', desc: 'Tap your spot on an interactive map of the camp and surrounding area. GPS auto-detects on mobile so the pin lands precisely.' },
              { num: '02', title: 'Describe and attach', desc: 'Pick the incident category. Add a short description and, if it is safe to do so, a photo or short video as evidence.' },
              { num: '03', title: 'Agencies respond', desc: 'Verified responders covering that location are notified at once. You can track the report status from any device, anytime.' },
            ].map((s, i) => (
              <div key={i} style={{
                padding: '32px 28px',
                background: 'var(--ink-800)',
                display: 'flex', flexDirection: 'column', gap: 14,
                minHeight: 220,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'var(--ink-700)', border: '1px solid var(--ink-600)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600, color: 'var(--ink-100)',
                  }}>{s.num}</div>
                  <div style={{ flex: 1, height: 1, background: 'var(--ink-600)' }}/>
                </div>
                <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em' }}>{s.title}</div>
                <p style={{ fontSize: 14, color: 'var(--ink-200)', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RESPONDERS / COVERAGE — replaces vanity stats */}
      <section style={{ padding: '64px 48px', borderBottom: '1px solid var(--ink-700)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--ink-300)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>Coverage</div>
            <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.015em', margin: '0 0 16px', lineHeight: 1.2 }}>
              Reports route to verified agencies serving your location.
            </h2>
            <p style={{ fontSize: 14, color: 'var(--ink-200)', lineHeight: 1.6, margin: '0 0 24px', maxWidth: 460 }}>
              Each responding agency declares a service radius. When a report falls inside that radius and matches their category, they are notified — there's no central dispatcher in between.
            </p>
            <button onClick={() => navigate('agency-signup')} style={{
              fontSize: 13, fontWeight: 600, color: 'var(--ink-50)', textDecoration: 'underline', textUnderlineOffset: 3,
            }}>Are you a responder? Apply to join →</button>
          </div>

          {/* Responder categories — factual list */}
          <div style={{ background: 'var(--ink-800)', border: '1px solid var(--ink-700)', borderRadius: 10 }}>
            {[
              { cat: 'Police service', count: '6 agencies', ex: 'Nigeria Police, RCCG Camp Security' },
              { cat: 'Medical / Hospital', count: '4 facilities', ex: 'RCCG Medical Centre, Olabisi Onabanjo' },
              { cat: 'Fire & rescue', count: '3 stations', ex: 'Ogun State Fire Service, Camp Fire Unit' },
              { cat: 'Private security', count: '10 firms', ex: 'Mowe Security, Gateway Estate Patrol' },
            ].map((r, i) => (
              <div key={r.cat} style={{
                padding: '16px 20px',
                borderBottom: i < 3 ? '1px solid var(--ink-700)' : 'none',
                display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center',
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>{r.cat}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-300)' }}>{r.ex}</div>
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-200)', whiteSpace: 'nowrap' }}>{r.count}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRIVACY / TRUST — civic platforms always include this */}
      <section style={{ padding: '80px 48px', borderBottom: '1px solid var(--ink-700)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 32, marginBottom: 56 }}>
            <div style={{ maxWidth: 640 }}>
              <div style={{ fontSize: 11, color: 'var(--ink-300)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 14 }}>Privacy</div>
              <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 14px', lineHeight: 1.1 }}>
                What we collect, and what we don't.
              </h2>
              <p style={{ fontSize: 15, color: 'var(--ink-200)', lineHeight: 1.6, margin: 0, maxWidth: 560 }}>
                IRMS is a civic service, not a data product. We collect the minimum needed to dispatch responders — and never more. Your identity is never required to file a report.
              </p>
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-300)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }}/>
              NDPR compliant · Reviewed Mar 2026
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, background: 'var(--ink-700)', border: '1px solid var(--ink-700)', borderRadius: 12, overflow: 'hidden' }}>
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
                <div key={col.kind} style={{ padding: '32px 28px', background: 'var(--ink-800)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: isDo ? 'var(--green-bg)' : 'var(--red-bg)',
                      border: `1px solid ${isDo ? 'var(--green-bd)' : 'var(--red-bd)'}`,
                      color: isDo ? 'var(--green)' : 'var(--red)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, fontWeight: 700, lineHeight: 1,
                    }}>{isDo ? '+' : '−'}</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-50)' }}>{col.label}</div>
                    <div style={{ flex: 1, height: 1, background: 'var(--ink-600)', marginLeft: 8 }}/>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {col.items.map((item, i) => (
                      <div key={i} style={{
                        padding: '14px 0',
                        borderBottom: i < col.items.length - 1 ? '1px solid var(--ink-700)' : 'none',
                      }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-50)', marginBottom: 4 }}>{item.t}</div>
                        <div style={{ fontSize: 13, color: 'var(--ink-200)', lineHeight: 1.55 }}>{item.d}</div>
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
      <section style={{ padding: '48px 48px', background: 'var(--ink-800)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--ink-300)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>For agencies</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Join the response network</div>
            <div style={{ fontSize: 13, color: 'var(--ink-200)' }}>Register your agency to receive incidents in your service area.</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <GhostButton onClick={() => navigate('agency-login')} size="md">Agency sign in</GhostButton>
            <InkButton onClick={() => navigate('agency-signup')} size="md">Register agency</InkButton>
          </div>
        </div>
      </section>

      {/* FOOTER — formal */}
      <footer style={{ padding: '40px 48px 32px', background: 'var(--ink-700)', borderTop: '1px solid var(--ink-600)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 32, flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 360 }}>
            <IRMSLogo size={14} />
            <div style={{ fontSize: 12, color: 'var(--ink-300)', marginTop: 12, lineHeight: 1.6 }}>
              Incident Response Management System. A civic coordination platform for emergency reporting. Pilot deployment for Redemption Camp and Ogun State.
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, auto)', gap: 56, fontSize: 12 }}>
            <div>
              <div style={{ color: 'var(--ink-300)', fontWeight: 600, marginBottom: 10, letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: 10 }}>Service</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href="#" style={{ color: 'var(--ink-100)' }}>Report an incident</a>
                <a href="#" style={{ color: 'var(--ink-100)' }}>Track a report</a>
                <a href="#" style={{ color: 'var(--ink-100)' }}>System status</a>
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--ink-300)', fontWeight: 600, marginBottom: 10, letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: 10 }}>Agencies</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href="#" style={{ color: 'var(--ink-100)' }}>Apply to respond</a>
                <a href="#" style={{ color: 'var(--ink-100)' }}>Sign in</a>
                <a href="#" style={{ color: 'var(--ink-100)' }}>Documentation</a>
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--ink-300)', fontWeight: 600, marginBottom: 10, letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: 10 }}>Legal</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href="#" style={{ color: 'var(--ink-100)' }}>Privacy notice</a>
                <a href="#" style={{ color: 'var(--ink-100)' }}>Terms of service</a>
                <a href="#" style={{ color: 'var(--ink-100)' }}>Contact</a>
              </div>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 1200, margin: '24px auto 0', paddingTop: 16, borderTop: '1px solid var(--ink-700)', fontSize: 11, color: 'var(--ink-300)' }}>
          © 2026 IRMS · Operated in coordination with state emergency services
        </div>
      </footer>
    </div>
  );
}

// -----------------------------------------------------------
// SCREEN 2 — REPORT (interactive Leaflet map + bottom sheet)
// -----------------------------------------------------------
function ReportScreen({ navigate }) {
  const mapRef = React.useRef(null);
  const mapInstance = React.useRef(null);
  const userMarker = React.useRef(null);
  const [pinLocation, setPinLocation] = React.useState(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [selectedType, setSelectedType] = React.useState(null);
  const [description, setDescription] = React.useState('');
  const [trackReport, setTrackReport] = React.useState(true);
  const [submitted, setSubmitted] = React.useState(false);
  const [refCode] = React.useState('INC-2024-00149');

  React.useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    // Redemption Camp coords
    const map = L.map(mapRef.current, { zoomControl: false }).setView([6.8932, 3.1721], 15);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap, © CARTO',
      subdomains: 'abcd', maxZoom: 19,
    }).addTo(map);

    map.on('click', (e) => {
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

  const closeSheet = () => { setSheetOpen(false); setSubmitted(false); setSelectedType(null); setDescription(''); };

  const submitReport = () => {
    if (!selectedType) return;
    setSubmitted(true);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--ink-900)', overflow: 'hidden' }}>
      {/* Top header */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 24px', background: 'rgba(244, 242, 236, 0.92)', backdropFilter: 'blur(14px) saturate(140%)',
        borderBottom: '1px solid var(--ink-600)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <button onClick={() => navigate('landing')} style={{
            width: 36, height: 36, borderRadius: 10, border: '1px solid var(--ink-500)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><Icon.back /></button>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Tap a location to report an incident</div>
            <div style={{ fontSize: 12, color: 'var(--ink-300)', fontFamily: 'var(--mono)', marginTop: 2 }}>REDEMPTION CAMP · OGUN STATE · NIGERIA</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'var(--ink-700)', border: '1px solid var(--ink-500)', borderRadius: 8 }}>
          <Icon.pin style={{ color: 'var(--ink-100)', width: 14, height: 14 }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-100)' }}>Click the map to place a pin</span>
        </div>
      </div>

      {/* Map */}
      <div ref={mapRef} style={{ position: 'absolute', inset: 0, top: 0 }} />

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 24, left: 24, zIndex: 500,
        background: 'rgba(11,13,19,0.92)', backdropFilter: 'blur(8px)',
        border: '1px solid var(--ink-500)', borderRadius: 12, padding: '12px 14px',
      }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-300)', letterSpacing: '0.12em', marginBottom: 8 }}>NEARBY INCIDENTS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { c: 'var(--red)', l: 'Received' },
            { c: 'var(--amber)', l: 'Under Review' },
            { c: 'var(--blue)', l: 'Assigned' },
            { c: 'var(--green)', l: 'Resolved' },
          ].map(x => (
            <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--ink-100)' }}>
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
            background: 'var(--ink-800)', borderTop: '1px solid var(--ink-500)',
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

function ReportForm({ pinLocation, selectedType, setSelectedType, description, setDescription, trackReport, setTrackReport, onClose, onSubmit }) {
  const [media, setMedia] = React.useState([
    { id: 1, color: 'oklch(0.45 0.12 30)' },
    { id: 2, color: 'oklch(0.38 0.10 60)' },
  ]);
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '20px 28px 32px' }}>
      {/* Drag handle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--ink-400)' }}/>
      </div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Icon.pin style={{ color: 'var(--red)', width: 16, height: 16 }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--red)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Pinned location</span>
          </div>
          <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>Near Redemption Camp Main Gate</div>
          <div style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--ink-300)' }}>
            {pinLocation ? `${pinLocation.lat.toFixed(4)}° N · ${pinLocation.lng.toFixed(4)}° E` : '6.8932° N · 3.1721° E'} · OGUN STATE
          </div>
        </div>
        <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid var(--ink-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon.close />
        </button>
      </div>

      {/* Type selector */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-100)', marginBottom: 12 }}>What is happening?</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {INCIDENT_TYPES.map(t => {
            const selected = selectedType === t.id;
            return (
              <button key={t.id} onClick={() => setSelectedType(t.id)} style={{
                padding: '16px 12px', borderRadius: 12,
                background: selected ? 'var(--red-bg)' : 'var(--ink-700)',
                border: selected ? '1.5px solid var(--red)' : '1px solid var(--ink-500)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                color: selected ? 'var(--red)' : 'var(--ink-100)',
                transition: 'all 0.15s',
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
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-100)', marginBottom: 8 }}>Describe the incident</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe what you are seeing right now — be as specific as possible. Mention injuries, vehicles, landmarks."
          style={{
            width: '100%', minHeight: 120, padding: 14, borderRadius: 10,
            background: 'var(--ink-700)', border: '1px solid var(--ink-500)',
            color: 'var(--ink-50)', fontSize: 14, lineHeight: 1.55, resize: 'vertical',
            fontFamily: 'inherit', outline: 'none',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--red)'}
          onBlur={e => e.target.style.borderColor = 'var(--ink-500)'}
        />
      </div>

      {/* Media upload */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-100)', marginBottom: 8 }}>
          Photos or videos <span style={{ color: 'var(--ink-300)', fontWeight: 400 }}>(optional)</span>
        </label>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {media.map(m => (
            <div key={m.id} style={{
              width: 80, height: 80, borderRadius: 10, position: 'relative',
              background: `linear-gradient(135deg, ${m.color}, var(--ink-600))`,
              border: '1px solid var(--ink-500)', overflow: 'hidden',
            }}>
              <button onClick={() => setMedia(media.filter(x => x.id !== m.id))} style={{
                position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%',
                background: 'rgba(20, 18, 14, 0.75)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><Icon.close style={{ width: 14, height: 14 }} /></button>
            </div>
          ))}
          <button style={{
            width: 80, height: 80, borderRadius: 10,
            border: '1.5px dashed var(--ink-400)', background: 'transparent',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
            color: 'var(--ink-200)',
          }}>
            <Icon.upload style={{ width: 18, height: 18 }} />
            <span style={{ fontSize: 11, fontWeight: 500 }}>Attach</span>
          </button>
        </div>
      </div>

      {/* Track toggle */}
      <div style={{
        padding: 14, borderRadius: 10, background: 'var(--ink-700)',
        border: '1px solid var(--ink-500)', marginBottom: 20,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-50)' }}>Track this report</div>
            <div style={{ fontSize: 12, color: 'var(--ink-200)', marginTop: 2 }}>We'll give you a link to check status in this browser.</div>
          </div>
          <button onClick={() => setTrackReport(!trackReport)} style={{
            width: 42, height: 24, borderRadius: 12,
            background: trackReport ? 'var(--ink-50)' : 'var(--ink-500)',
            position: 'relative', transition: 'background 0.2s', flexShrink: 0,
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
      <div style={{ fontSize: 11, color: 'var(--ink-300)', textAlign: 'center', marginTop: 12 }}>
        By submitting you confirm this is a genuine incident. False reports are an offense.
      </div>
    </div>
  );
}

function ReportSuccess({ refCode, pinLocation, trackReport, onClose, navigate }) {
  return (
    <div style={{ maxWidth: 540, margin: '0 auto', padding: '40px 28px 32px', textAlign: 'center', animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: 'var(--green-bg)', border: '2px solid var(--green-bd)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 24px', color: 'var(--green)',
        animation: 'scaleIn 0.4s ease-out 0.1s both',
      }}>
        <Icon.check style={{ width: 36, height: 36 }} />
      </div>
      <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 10px' }}>Report submitted</h2>
      <p style={{ fontSize: 14, color: 'var(--ink-200)', margin: '0 0 28px', lineHeight: 1.6 }}>
        Verified agencies covering this location have been notified. You can track this report at any time using the reference below.
      </p>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 18px',
        borderRadius: 999, background: 'var(--ink-700)', border: '1px solid var(--ink-500)',
        marginBottom: 32,
      }}>
        <span style={{ fontSize: 11, color: 'var(--ink-300)', letterSpacing: '0.08em' }}>REFERENCE</span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 600, color: 'var(--ink-50)' }}>{refCode}</span>
      </div>
      <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
        {trackReport && (
          <PrimaryButton onClick={() => navigate('track', { ref: refCode })} full>
            View report status <Icon.arrow />
          </PrimaryButton>
        )}
        <GhostButton onClick={() => navigate('landing')} style={{ width: '100%', justifyContent: 'center' }}>
          Back to home
        </GhostButton>
      </div>
    </div>
  );
}

// -----------------------------------------------------------
// SCREEN 3 — TRACK REPORT
// -----------------------------------------------------------
function TrackScreen({ navigate, params }) {
  const ref = params?.ref || 'INC-2024-00142';
  const status = 'assigned';
  return (
    <div style={{ background: 'var(--ink-900)', minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 32px', borderBottom: '1px solid var(--ink-600)',
      }}>
        <button onClick={() => navigate('landing')} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icon.back />
          <IRMSLogo size={15} />
        </button>
        <div style={{ fontSize: 12, color: 'var(--ink-300)' }}>Tracking Page</div>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '60px 32px 80px' }}>
        {/* Reference code */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, color: 'var(--ink-300)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>Report reference</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 32, fontWeight: 700, letterSpacing: '-0.01em' }}>{ref}</div>
            <StatusBadge status={status} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ink-200)' }}>
              <Icon.pin style={{ width: 16, height: 16 }} />
              <span style={{ fontSize: 14 }}>Children's Pavilion · Redemption Camp</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 6, background: 'var(--red-bg)', border: '1px solid var(--red-bd)' }}>
              <Icon.person style={{ width: 14, height: 14, color: 'var(--red)' }} />
              <span style={{ fontSize: 12, color: 'var(--red)', fontWeight: 600 }}>Missing Person</span>
            </div>
          </div>
        </div>

        {/* Stepper card */}
        <div style={{
          background: 'var(--ink-800)', border: '1px solid var(--ink-600)',
          borderRadius: 16, padding: '36px 32px', marginBottom: 24,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-200)', marginBottom: 28, letterSpacing: '0.02em' }}>STATUS TIMELINE</div>
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
          background: 'var(--ink-800)', border: '1px solid var(--blue-bd)',
          borderRadius: 16, padding: 24, marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 20,
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 12, flexShrink: 0,
            background: 'var(--blue-bg)', border: '1px solid var(--blue-bd)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue)',
          }}>
            <Icon.pin />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: 'var(--blue)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Responding Agency</div>
            <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>RCCG Camp Security</div>
            <div style={{ fontSize: 13, color: 'var(--ink-200)' }}>Private Security Service · Ogun State</div>
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Activity log */}
        <div style={{ background: 'var(--ink-800)', border: '1px solid var(--ink-600)', borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-200)', marginBottom: 16, letterSpacing: '0.02em' }}>ACTIVITY LOG</div>
          {[
            { t: '14:51', e: 'Assigned to RCCG Camp Security', c: 'var(--blue)' },
            { t: '14:38', e: 'Marked under review by dispatcher', c: 'var(--amber)' },
            { t: '14:32', e: 'Report received from public', c: 'var(--red)' },
          ].map((x, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: i < 2 ? '1px solid var(--ink-700)' : 'none' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-300)', minWidth: 50 }}>{x.t}</span>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: x.c }}/>
              <span style={{ fontSize: 14, color: 'var(--ink-100)' }}>{x.e}</span>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 32, padding: 16, borderRadius: 10,
          background: 'var(--ink-800)', border: '1px dashed var(--ink-500)',
          fontSize: 12, color: 'var(--ink-200)', lineHeight: 1.6,
        }}>
          <strong style={{ color: 'var(--ink-50)' }}>Bookmark this page.</strong> Your tracking link is tied to this browser session. We don't store your identity — only the report.
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LandingScreen, ReportScreen, TrackScreen });
