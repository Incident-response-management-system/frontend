// ============================================================
// CITIZEN SCREENS — Signup, Login, My Reports
// ============================================================
// Visual language: same dark civic palette as the public side
// but reserved — no pulsing pills, no decorative coords,
// information-first, tabular.

function CitizenAuthShell({ children, mode = 'signup' }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--ink-900)', color: 'var(--ink-50)', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      {/* Left: copy panel — warm cream */}
      <div style={{ background: 'var(--ink-700)', padding: '40px 56px', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--ink-600)' }}>
        <IRMSLogo size={16} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 440 }}>
          <div style={{ fontSize: 11, color: 'var(--ink-300)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 18 }}>
            {mode === 'signup' ? 'Citizen account' : 'Sign in'}
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, margin: '0 0 16px' }}>
            {mode === 'signup' ? 'Create a citizen account' : 'Sign in to your account'}
          </h1>
          <p style={{ fontSize: 15, color: 'var(--ink-200)', lineHeight: 1.6, margin: '0 0 28px' }}>
            {mode === 'signup'
              ? 'Optional. Your reports stay anonymous to the public — an account just lets you view and follow up on everything you have reported in one place.'
              : 'View your reported incidents, follow their status, and update agencies when something changes on the ground.'}
          </p>
          <div style={{ background: 'var(--ink-800)', border: '1px solid var(--ink-600)', borderRadius: 10, overflow: 'hidden' }}>
            {[
              'See every incident you have reported',
              'Get notified when status changes',
              'Add updates to your open reports',
              'Anonymous reporting still works without an account',
            ].map((t, i, arr) => (
              <div key={i} style={{ padding: '12px 16px', borderBottom: i < arr.length - 1 ? '1px solid var(--ink-600)' : 'none', display: 'flex', gap: 12, fontSize: 13, color: 'var(--ink-100)' }}>
                <span style={{ width: 16, height: 16, borderRadius: '50%', border: '1px solid var(--ink-500)', flexShrink: 0, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon.check style={{ width: 10, height: 10, color: 'var(--ink-200)' }} />
                </span>
                {t}
              </div>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-300)' }}>
          Need to report an emergency right now? <button onClick={() => window.location.hash = 'report'} style={{ color: 'var(--ink-50)', textDecoration: 'underline', textUnderlineOffset: 3, fontWeight: 500 }}>Report without an account</button>
        </div>
      </div>
      {/* Right: form on white */}
      <div style={{ background: 'var(--ink-800)', padding: '40px 64px', display: 'flex', flexDirection: 'column' }}>{children}</div>
    </div>
  );
}

// -----------------------------------------------------------
// CITIZEN SIGNUP
// -----------------------------------------------------------
function CitizenSignupScreen({ navigate, onAuth }) {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('');

  const submit = () => {
    onAuth({ name: name || 'Demo User', email: email || 'demo@example.com', phone });
    navigate('my-reports');
  };

  return (
    <CitizenAuthShell mode="signup">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => navigate('landing')} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-200)' }}>
          <Icon.back style={{ width: 16, height: 16 }} /> Back
        </button>
        <div style={{ fontSize: 13, color: 'var(--ink-200)' }}>
          Have an account? <button onClick={() => navigate('citizen-login')} style={{ color: 'var(--ink-50)', fontWeight: 600, textDecoration: 'underline' }}>Sign in</button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 420, width: '100%', margin: '40px auto' }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 24px', letterSpacing: '-0.01em' }}>Sign up</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <DarkInput label="Full name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
          <DarkInput label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          <DarkInput label="Phone (optional)" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+234 ..." />
          <DarkInput label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" />
          <button onClick={submit} style={{
            background: 'var(--ink-50)', color: 'var(--ink-900)', padding: '12px 24px', borderRadius: 9,
            fontWeight: 600, fontSize: 14, marginTop: 4,
          }}>Create account</button>
          <p style={{ fontSize: 11, color: 'var(--ink-300)', margin: '8px 0 0', lineHeight: 1.5 }}>
            By creating an account you agree to the IRMS Terms of Service and confirm that you will only use the platform for genuine incidents.
          </p>
        </div>
      </div>
    </CitizenAuthShell>
  );
}

// -----------------------------------------------------------
// CITIZEN LOGIN
// -----------------------------------------------------------
function CitizenLoginScreen({ navigate, onAuth }) {
  const [email, setEmail] = React.useState('chinedu.okafor@example.com');
  const [password, setPassword] = React.useState('demo1234');

  const submit = () => {
    onAuth({ name: 'Chinedu Okafor', email, phone: '+234 803 555 0184' });
    navigate('my-reports');
  };

  return (
    <CitizenAuthShell mode="login">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => navigate('landing')} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-200)' }}>
          <Icon.back style={{ width: 16, height: 16 }} /> Back
        </button>
        <div style={{ fontSize: 13, color: 'var(--ink-200)' }}>
          New here? <button onClick={() => navigate('citizen-signup')} style={{ color: 'var(--ink-50)', fontWeight: 600, textDecoration: 'underline' }}>Create account</button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 420, width: '100%', margin: '40px auto' }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 24px', letterSpacing: '-0.01em' }}>Sign in</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <DarkInput label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          <DarkInput label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ink-200)' }}>
              <input type="checkbox" defaultChecked style={{ accentColor: 'var(--red)' }} /> Keep me signed in
            </label>
            <a href="#" style={{ color: 'var(--ink-100)', textDecoration: 'underline' }}>Forgot password?</a>
          </div>
          <button onClick={submit} style={{
            background: 'var(--ink-50)', color: 'var(--ink-900)', padding: '12px 24px', borderRadius: 9,
            fontWeight: 600, fontSize: 14, marginTop: 4,
          }}>Sign in</button>
          <div style={{
            padding: 14, borderRadius: 10, background: 'var(--ink-700)', border: '1px solid var(--ink-500)',
            fontSize: 12, color: 'var(--ink-200)', marginTop: 16, lineHeight: 1.5,
          }}>
            Demo credentials are pre-filled. Press Sign in to view a sample My Reports page with seeded incidents.
          </div>
        </div>
      </div>
    </CitizenAuthShell>
  );
}

function DarkInput({ label, type = 'text', value, onChange, placeholder }) {
  const [show, setShow] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const isPassword = type === 'password';
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-100)', marginBottom: 6 }}>{label}</label>
      <div style={{
        display: 'flex', alignItems: 'center',
        background: 'var(--ink-800)',
        border: `1px solid ${focused ? 'var(--ink-100)' : 'var(--ink-600)'}`,
        borderRadius: 8, padding: '0 12px',
        boxShadow: focused ? '0 0 0 3px rgba(20, 19, 13, 0.06)' : 'var(--shadow-sm)',
        transition: 'all 0.15s',
      }}>
        <input
          type={isPassword && !show ? 'password' : 'text'}
          value={value} onChange={onChange} placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            padding: '11px 0', fontSize: 14, color: 'var(--ink-50)', fontFamily: 'inherit',
          }}
        />
        {isPassword && (
          <button onClick={() => setShow(!show)} style={{ color: 'var(--ink-300)', padding: 4 }}>
            {show ? <Icon.eyeOff /> : <Icon.eye />}
          </button>
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------
// MY REPORTS — citizen dashboard
// -----------------------------------------------------------
const MY_REPORTS = [
  { ref: 'INC-2024-00149', type: 'medical', location: 'Auditorium 3, Main Bowl', status: 'received', reportedAt: 'Today · 14:32', desc: 'Elderly man collapsed during service.', media: 2, assignedTo: null, lat: 6.8932, lng: 3.1721 },
  { ref: 'INC-2024-00131', type: 'rta', location: 'Lagos-Ibadan Expressway, Mile 46', status: 'assigned', reportedAt: '23 May · 18:12', desc: 'Two-vehicle collision near camp gate.', media: 3, assignedTo: 'Federal Road Safety Corps', lat: 6.8865, lng: 3.1812 },
  { ref: 'INC-2024-00114', type: 'flood', location: 'Drainage Channel B', status: 'resolved', reportedAt: '18 May · 09:40', desc: 'Water overflow blocking pedestrian path.', media: 1, assignedTo: 'Camp Maintenance Unit', lat: 6.8878, lng: 3.1656 },
  { ref: 'INC-2024-00097', type: 'civil', location: 'Camp Gate 2', status: 'resolved', reportedAt: '02 May · 21:05', desc: 'Disorderly crowd near vehicle screening.', media: 0, assignedTo: 'RCCG Camp Security', lat: 6.8954, lng: 3.1745 },
];

function MyReportsScreen({ navigate, user, onSignOut }) {
  const [tab, setTab] = React.useState('all');
  const [selected, setSelected] = React.useState(null);
  const [profileOpen, setProfileOpen] = React.useState(false);

  const filters = [
    { id: 'all', label: 'All', count: MY_REPORTS.length },
    { id: 'open', label: 'Open', count: MY_REPORTS.filter(r => r.status !== 'resolved').length },
    { id: 'resolved', label: 'Resolved', count: MY_REPORTS.filter(r => r.status === 'resolved').length },
  ];
  const filtered = MY_REPORTS.filter(r => tab === 'all' || (tab === 'open' ? r.status !== 'resolved' : r.status === 'resolved'));

  return (
    <div style={{ background: 'var(--ink-900)', minHeight: '100vh', color: 'var(--ink-50)' }}>
      {/* Top bar */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 32px', borderBottom: '1px solid var(--ink-600)',
        position: 'sticky', top: 0, background: 'rgba(244, 242, 236, 0.88)', backdropFilter: 'blur(14px) saturate(140%)', zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <button onClick={() => navigate('landing')}><IRMSLogo size={15} /></button>
          <nav style={{ display: 'flex', gap: 6 }}>
            <button style={{ padding: '8px 12px', fontSize: 13, fontWeight: 600, color: 'var(--ink-50)', borderRadius: 7, background: 'var(--ink-700)' }}>My Reports</button>
            <button onClick={() => navigate('report')} style={{ padding: '8px 12px', fontSize: 13, color: 'var(--ink-200)', borderRadius: 7 }}>Report new</button>
          </nav>
        </div>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setProfileOpen(!profileOpen)} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px 6px 6px',
            borderRadius: 999, border: '1px solid var(--ink-500)',
          }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--ink-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>
              {(user?.name || 'U').split(' ').map(w => w[0]).slice(0, 2).join('')}
            </div>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{user?.name?.split(' ')[0] || 'You'}</span>
            <Icon.chevDown style={{ color: 'var(--ink-200)' }} />
          </button>
          {profileOpen && (
            <>
              <div onClick={() => setProfileOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 100 }}/>
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 8, zIndex: 200,
                background: 'var(--ink-800)', border: '1px solid var(--ink-500)', borderRadius: 10,
                minWidth: 220, padding: 6, boxShadow: '0 12px 28px rgba(0,0,0,0.4)',
              }}>
                <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--ink-600)', marginBottom: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-300)' }}>{user?.email}</div>
                </div>
                <button onClick={() => { onSignOut(); navigate('landing'); }} style={{
                  width: '100%', textAlign: 'left', padding: '9px 12px', borderRadius: 7,
                  fontSize: 13, color: 'var(--ink-100)', display: 'flex', alignItems: 'center', gap: 10,
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--ink-700)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                ><Icon.logout style={{ width: 14, height: 14 }} /> Sign out</button>
              </div>
            </>
          )}
        </div>
      </header>

      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 32px 80px' }}>
        {/* Page header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, gap: 24, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 6px' }}>Your reports</h1>
            <p style={{ fontSize: 14, color: 'var(--ink-200)', margin: 0 }}>
              Every incident you have submitted is listed below. Click any report to see status, assigned agency, and activity.
            </p>
          </div>
          <button onClick={() => navigate('report')} style={{
            background: 'var(--ink-50)', color: 'var(--ink-900)', padding: '10px 16px', borderRadius: 9,
            fontWeight: 600, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            Report new incident <Icon.arrow />
          </button>
        </div>

        {/* Summary strip */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0,
          background: 'var(--ink-800)', border: '1px solid var(--ink-600)', borderRadius: 12,
          marginBottom: 28,
        }}>
          {[
            { l: 'Total submitted', v: MY_REPORTS.length, c: 'var(--ink-50)' },
            { l: 'Currently open', v: MY_REPORTS.filter(r => r.status !== 'resolved').length, c: 'var(--red)' },
            { l: 'Under review', v: MY_REPORTS.filter(r => r.status === 'review' || r.status === 'assigned').length, c: 'var(--amber)' },
            { l: 'Resolved', v: MY_REPORTS.filter(r => r.status === 'resolved').length, c: 'var(--green)' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '20px 24px', borderLeft: i > 0 ? '1px solid var(--ink-600)' : 'none' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-300)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{s.l}</div>
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--mono)', letterSpacing: '-0.02em', color: s.c }}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--ink-600)', marginBottom: 0 }}>
          {filters.map(f => (
            <button key={f.id} onClick={() => setTab(f.id)} style={{
              padding: '10px 16px', fontSize: 13, fontWeight: 600,
              color: tab === f.id ? 'var(--ink-50)' : 'var(--ink-300)',
              borderBottom: tab === f.id ? '2px solid var(--ink-50)' : '2px solid transparent',
              marginBottom: -1, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              {f.label}
              <span style={{
                fontSize: 11, padding: '2px 6px', borderRadius: 999,
                background: tab === f.id ? 'var(--ink-50)' : 'var(--ink-700)',
                color: tab === f.id ? 'var(--ink-900)' : 'var(--ink-200)',
                fontFamily: 'var(--mono)',
              }}>{f.count}</span>
            </button>
          ))}
        </div>

        {/* Report list */}
        <div style={{ background: 'var(--ink-800)', borderRadius: 0, border: '1px solid var(--ink-600)', borderTop: 'none', borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--ink-200)' }}>
              <div style={{ fontSize: 14, marginBottom: 16 }}>No {tab === 'all' ? '' : tab} reports yet.</div>
              <button onClick={() => navigate('report')} style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-50)', textDecoration: 'underline', textUnderlineOffset: 3 }}>Report your first incident</button>
            </div>
          ) : filtered.map((r, idx) => {
            const t = getIncidentType(r.type);
            return (
              <button key={r.ref} onClick={() => setSelected(r)} style={{
                width: '100%', textAlign: 'left', padding: '18px 24px',
                borderBottom: idx < filtered.length - 1 ? '1px solid var(--ink-700)' : 'none',
                display: 'grid', gridTemplateColumns: '40px 1fr auto auto', gap: 16, alignItems: 'center',
                transition: 'background 0.1s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--ink-700)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 9,
                  background: 'var(--ink-700)', border: '1px solid var(--ink-500)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-100)',
                }}><t.icon style={{ width: 18, height: 18 }} /></div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-300)' }}>{r.ref}</span>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{t.label}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink-200)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon.pin style={{ width: 12, height: 12, color: 'var(--ink-300)' }} />
                    {r.location}
                    <span style={{ color: 'var(--ink-400)' }}>·</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-300)' }}>{r.reportedAt}</span>
                  </div>
                </div>
                <StatusBadge status={r.status} size="sm" />
                <Icon.chev style={{ color: 'var(--ink-300)' }} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail drawer */}
      {selected && <CitizenReportDetail report={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function CitizenReportDetail({ report, onClose }) {
  const t = getIncidentType(report.type);
  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(20, 18, 14, 0.32)', backdropFilter: 'blur(2px)', zIndex: 1500, animation: 'fadeIn 0.2s ease-out',
      }}/>
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(560px, 92vw)',
        background: 'var(--ink-800)', borderLeft: '1px solid var(--ink-500)',
        zIndex: 1600, overflowY: 'auto',
        animation: 'slideRight 0.3s cubic-bezier(.2,.8,.2,1)',
      }}>
        <div style={{ position: 'sticky', top: 0, background: 'var(--ink-800)', padding: '20px 28px 16px', borderBottom: '1px solid var(--ink-600)', zIndex: 5 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-300)', letterSpacing: '0.1em', marginBottom: 6 }}>REFERENCE</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 700 }}>{report.ref}</div>
                <StatusBadge status={report.status} />
              </div>
            </div>
            <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 9, border: '1px solid var(--ink-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.close /></button>
          </div>
        </div>

        <div style={{ padding: '24px 28px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 10, background: 'var(--ink-700)', border: '1px solid var(--ink-600)', marginBottom: 24 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, background: 'var(--ink-800)', border: '1px solid var(--ink-500)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><t.icon style={{ width: 18, height: 18 }} /></div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{t.label}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-300)' }}>Reported {report.reportedAt}</div>
            </div>
          </div>

          <div style={{ padding: '4px 0 24px', borderBottom: '1px solid var(--ink-700)', marginBottom: 24 }}>
            <StatusStepper current={report.status} timestamps={{
              received: report.reportedAt.split('·')[1]?.trim(),
              review: report.status !== 'received' ? '14:38' : null,
              assigned: (report.status === 'assigned' || report.status === 'resolved') ? '14:51' : null,
              resolved: report.status === 'resolved' ? '15:30' : null,
            }} />
          </div>

          <DetailRow label="Location">
            <div style={{ fontSize: 14, marginBottom: 4 }}>{report.location}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-300)' }}>{report.lat.toFixed(4)}° N · {report.lng.toFixed(4)}° E</div>
          </DetailRow>

          <DetailRow label="Your description">
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink-100)', margin: 0 }}>{report.desc}</p>
          </DetailRow>

          {report.assignedTo && (
            <DetailRow label="Responding agency">
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{report.assignedTo}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-300)' }}>Acknowledged · responding now</div>
            </DetailRow>
          )}

          {report.media > 0 && (
            <DetailRow label={`Evidence (${report.media})`}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {Array.from({ length: report.media }).map((_, i) => (
                  <div key={i} style={{ aspectRatio: 1, borderRadius: 8, background: `linear-gradient(135deg, oklch(0.4 0.08 ${i*60}), oklch(0.3 0.06 ${i*60+40}))`, border: '1px solid var(--ink-500)' }}/>
                ))}
              </div>
            </DetailRow>
          )}

          {report.status !== 'resolved' && (
            <div style={{ marginTop: 24, padding: 16, borderRadius: 10, background: 'var(--ink-700)', border: '1px solid var(--ink-500)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-100)', marginBottom: 8 }}>Have an update?</div>
              <div style={{ fontSize: 12, color: 'var(--ink-200)', marginBottom: 12, lineHeight: 1.5 }}>
                If the situation has changed on the ground, add a note. The responding agency will see it immediately.
              </div>
              <button style={{
                padding: '9px 14px', borderRadius: 8, border: '1px solid var(--ink-400)',
                fontSize: 13, fontWeight: 500, color: 'var(--ink-50)',
              }}>Add an update</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function DetailRow({ label, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-300)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>{label}</div>
      {children}
    </div>
  );
}

Object.assign(window, { CitizenSignupScreen, CitizenLoginScreen, MyReportsScreen });
