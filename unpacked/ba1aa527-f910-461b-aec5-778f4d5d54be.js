// ============================================================
// IRMS APP — Router + auth state
// ============================================================

function App() {
  const initialHash = () => {
    const h = window.location.hash.replace('#', '').trim();
    return h || 'landing';
  };
  const [route, setRoute] = React.useState(initialHash());
  const [params, setParams] = React.useState({});
  const [user, setUser] = React.useState(null);

  const navigate = React.useCallback((to, newParams = {}) => {
    setRoute(to);
    setParams(newParams);
    window.location.hash = to;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  React.useEffect(() => {
    const onHashChange = () => {
      const h = window.location.hash.replace('#', '').trim() || 'landing';
      setRoute(h);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  React.useEffect(() => {
    const isDark = ['landing', 'report', 'track', 'agency-signup', 'agency-login', 'citizen-signup', 'citizen-login', 'my-reports'].includes(route);
    if (isDark) document.body.classList.remove('light');
    else document.body.classList.add('light');
  }, [route]);

  const allScreens = [
    { id: 'landing', label: '01 Landing', section: 'CITIZEN' },
    { id: 'report', label: '02 Report Incident', section: 'CITIZEN' },
    { id: 'track', label: '03 Track Report (anon)', section: 'CITIZEN' },
    { id: 'citizen-signup', label: '04 Citizen Signup', section: 'CITIZEN' },
    { id: 'citizen-login', label: '05 Citizen Login', section: 'CITIZEN' },
    { id: 'my-reports', label: '06 My Reports', section: 'CITIZEN' },
    { id: 'agency-signup', label: '07 Agency Signup', section: 'AGENCY' },
    { id: 'agency-login', label: '08 Agency Login', section: 'AGENCY' },
    { id: 'agency-dashboard', label: '09 Dashboard · Overview', section: 'AGENCY' },
    { id: 'agency-map', label: '10 Dashboard · Map', section: 'AGENCY' },
    { id: 'agency-reports', label: '11 Dashboard · Reports', section: 'AGENCY' },
  ];

  let screen;
  switch (route) {
    case 'landing':          screen = <LandingScreen navigate={navigate} user={user} onSignOut={() => setUser(null)} />; break;
    case 'report':           screen = <ReportScreen navigate={navigate} user={user} />; break;
    case 'track':            screen = <TrackScreen navigate={navigate} params={params} />; break;
    case 'citizen-signup':   screen = <CitizenSignupScreen navigate={navigate} onAuth={setUser} />; break;
    case 'citizen-login':    screen = <CitizenLoginScreen navigate={navigate} onAuth={setUser} />; break;
    case 'my-reports':       screen = <MyReportsScreen navigate={navigate} user={user || { name: 'Chinedu Okafor', email: 'chinedu.okafor@example.com' }} onSignOut={() => setUser(null)} />; break;
    case 'agency-signup':    screen = <AgencySignupScreen navigate={navigate} />; break;
    case 'agency-login':     screen = <AgencyLoginScreen navigate={navigate} />; break;
    case 'agency-dashboard': screen = <DashboardScreen navigate={navigate} initialTab="overview" />; break;
    case 'agency-map':       screen = <DashboardScreen navigate={navigate} initialTab="map" />; break;
    case 'agency-reports':   screen = <DashboardScreen navigate={navigate} initialTab="reports" />; break;
    default: screen = <LandingScreen navigate={navigate} user={user} onSignOut={() => setUser(null)} />;
  }

  return (
    <div data-screen-label={allScreens.find(s => s.id === route)?.label || route}>
      {screen}
      <ScreenJumper screens={allScreens} current={route} navigate={navigate} />
    </div>
  );
}

// Compact screen jumper — no pulsing dots
function ScreenJumper({ screens, current, navigate }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ position: 'fixed', bottom: 14, right: 14, zIndex: 9999, fontFamily: 'var(--sans)' }}>
      {open && (
        <div style={{
          position: 'absolute', bottom: 44, right: 0,
          background: 'var(--ink-800)', color: 'var(--ink-50)',
          border: '1px solid var(--ink-600)', borderRadius: 10,
          padding: 6, width: 240, boxShadow: 'var(--shadow-lg)',
        }}>
          <div style={{ padding: '6px 10px 4px', fontSize: 9, color: 'var(--ink-300)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Prototype navigation</div>
          {['CITIZEN', 'AGENCY'].map(section => (
            <div key={section}>
              <div style={{ padding: '6px 10px 2px', fontSize: 9, color: 'var(--ink-300)', letterSpacing: '0.12em', fontWeight: 600 }}>{section}</div>
              {screens.filter(s => s.section === section).map(s => (
                <button key={s.id} onClick={() => { navigate(s.id); setOpen(false); }} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', padding: '7px 10px', borderRadius: 6,
                  fontSize: 12, fontWeight: 500, textAlign: 'left',
                  background: current === s.id ? 'var(--ink-700)' : 'transparent',
                  color: current === s.id ? 'var(--ink-50)' : 'var(--ink-200)',
                }}
                  onMouseEnter={e => { if (current !== s.id) e.currentTarget.style.background = 'var(--ink-700)'; }}
                  onMouseLeave={e => { if (current !== s.id) e.currentTarget.style.background = 'transparent'; }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
      <button onClick={() => setOpen(!open)} style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
        background: 'var(--ink-800)',
        color: 'var(--ink-50)',
        border: '1px solid var(--ink-600)',
        borderRadius: 8, fontSize: 11, fontWeight: 600, letterSpacing: '0.02em',
        boxShadow: 'var(--shadow)',
        fontFamily: 'var(--sans)',
      }}>
        Screens
        <Icon.chevDown style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
