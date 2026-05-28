// ============================================================
// AGENCY DASHBOARD — Sidebar shell + Overview / Map / Reports + Detail Panel
// ============================================================

function DashboardShell({ navigate, currentTab, children, onTabChange }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Icon.grid },
    { id: 'map', label: 'Map View', icon: Icon.map },
    { id: 'reports', label: 'All Reports', icon: Icon.list },
    { id: 'settings', label: 'Settings', icon: Icon.settings },
  ];
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--paper-50)', color: 'var(--paper-900)' }}>
      {/* SIDEBAR */}
      <aside style={{
        width: collapsed ? 72 : 248, flexShrink: 0,
        background: 'white', borderRight: '1px solid var(--paper-200)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.2s ease',
        position: 'sticky', top: 0, height: '100vh',
      }}>
        <div style={{ padding: collapsed ? '20px 16px' : '20px 20px', borderBottom: '1px solid var(--paper-200)' }}>
          {collapsed ? (
            <IRMSMark size={28} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <IRMSMark size={24} />
                <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.01em' }}>IRMS</span>
              </div>
              <button onClick={() => setCollapsed(true)} style={{ color: 'var(--paper-700)', padding: 4 }}>
                <Icon.back style={{ width: 16, height: 16 }} />
              </button>
            </div>
          )}
        </div>

        {/* Agency badge */}
        {!collapsed && (
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--paper-200)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9,
                background: 'var(--blue-bg)', border: '1px solid var(--blue-bd)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue)',
                fontWeight: 700, fontSize: 13, fontFamily: 'var(--mono)',
              }}>RC</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>RCCG Camp Security</div>
                <div style={{ fontSize: 11, color: 'var(--paper-700)' }}>Private Security · 25km</div>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(item => {
            const active = currentTab === item.id;
            return (
              <button key={item.id} onClick={() => onTabChange(item.id)} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: collapsed ? '11px 12px' : '11px 14px', borderRadius: 9,
                background: active ? 'var(--red-bg)' : 'transparent',
                color: active ? 'var(--red)' : 'var(--paper-900)',
                fontWeight: active ? 600 : 500, fontSize: 14,
                transition: 'all 0.15s', justifyContent: collapsed ? 'center' : 'flex-start',
                position: 'relative',
              }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--paper-100)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <item.icon />
                {!collapsed && <span>{item.label}</span>}
                {active && !collapsed && <div style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 3, borderRadius: 3, background: 'var(--red)' }}/>}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: 12, borderTop: '1px solid var(--paper-200)' }}>
          {collapsed && (
            <button onClick={() => setCollapsed(false)} style={{
              width: '100%', padding: '11px 12px', borderRadius: 9,
              display: 'flex', justifyContent: 'center', color: 'var(--paper-700)',
            }}><Icon.chev /></button>
          )}
          <button onClick={() => navigate('landing')} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: collapsed ? '11px 12px' : '11px 14px', borderRadius: 9, width: '100%',
            color: 'var(--paper-700)', fontSize: 14, fontWeight: 500,
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--paper-100)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Icon.logout />{!collapsed && 'Logout'}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, minWidth: 0 }}>{children}</main>
    </div>
  );
}

// -----------------------------------------------------------
// TOPBAR — shared across dashboard tabs
// -----------------------------------------------------------
function DashTopBar({ title, subtitle, actions }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '24px 32px', borderBottom: '1px solid var(--paper-200)', background: 'white',
    }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.015em', margin: '0 0 4px' }}>{title}</h1>
        {subtitle && <div style={{ fontSize: 13, color: 'var(--paper-700)' }}>{subtitle}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {actions}
        <button style={{ position: 'relative', width: 38, height: 38, borderRadius: 10, border: '1px solid var(--paper-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--paper-900)', background: 'white' }}>
          <Icon.bell />
          <span style={{ position: 'absolute', top: 8, right: 9, width: 8, height: 8, borderRadius: '50%', background: 'var(--red)', border: '2px solid white' }}/>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 12, borderLeft: '1px solid var(--paper-200)' }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--paper-900)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>AO</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Adebayo Olamide</div>
            <div style={{ fontSize: 11, color: 'var(--paper-700)' }}>Dispatch Lead</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------
// SCREEN 6 — OVERVIEW
// -----------------------------------------------------------
function OverviewTab({ onViewIncident }) {
  const stats = [
    { label: 'Total Incidents', value: '148', delta: '+12 today', color: 'var(--paper-900)', accent: 'var(--paper-200)' },
    { label: 'Open Incidents', value: '23', delta: '8 unassigned', color: 'var(--red)', accent: 'var(--red-bd)' },
    { label: 'Assigned to Us', value: '6', delta: '2 in progress', color: 'var(--amber)', accent: 'var(--amber-bd)' },
    { label: 'Resolved This Month', value: '119', delta: '+18% vs last', color: 'var(--green)', accent: 'var(--green-bd)' },
  ];

  return (
    <div>
      <DashTopBar
        title="Operations overview"
        subtitle="Live incidents across your service radius · Updated 12s ago"
        actions={<GhostButton theme="light" size="sm"><Icon.filter /> Today</GhostButton>}
      />

      <div style={{ padding: 32 }}>
        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              background: 'white', border: `1px solid var(--paper-200)`,
              borderRadius: 12, padding: 20, position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.color, opacity: 0.9 }}/>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <span style={{ fontSize: 12, color: 'var(--paper-700)', fontWeight: 600, letterSpacing: '0.02em', textTransform: 'uppercase' }}>{s.label}</span>
              </div>
              <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1, fontFamily: 'var(--mono)', color: 'var(--paper-900)' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: s.color, marginTop: 8, fontWeight: 500 }}>{s.delta}</div>
            </div>
          ))}
        </div>

        {/* Activity feed + heatmap row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 32 }}>
          {/* Incident distribution */}
          <div style={{ background: 'white', border: '1px solid var(--paper-200)', borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 4px' }}>Incident distribution</h3>
                <div style={{ fontSize: 12, color: 'var(--paper-700)' }}>Last 30 days · By type</div>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--paper-700)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--red)' }}/> Open</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--green)' }}/> Resolved</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { type: 'medical', label: 'Medical Emergency', open: 8, resolved: 34 },
                { type: 'rta', label: 'Road Traffic Accident', open: 5, resolved: 28 },
                { type: 'civil', label: 'Civil Disturbance', open: 4, resolved: 19 },
                { type: 'fire', label: 'Fire Outbreak', open: 3, resolved: 12 },
                { type: 'flood', label: 'Flood Incident', open: 2, resolved: 14 },
                { type: 'missing', label: 'Missing Person', open: 1, resolved: 12 },
              ].map(r => {
                const total = r.open + r.resolved;
                const max = 42;
                return (
                  <div key={r.type} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 60px', gap: 12, alignItems: 'center' }}>
                    <div style={{ fontSize: 13, color: 'var(--paper-900)', fontWeight: 500 }}>{r.label}</div>
                    <div style={{ display: 'flex', height: 22, borderRadius: 4, overflow: 'hidden', background: 'var(--paper-100)' }}>
                      <div style={{ width: `${(r.open / max) * 100}%`, background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 6, fontSize: 10, fontWeight: 600, color: 'white' }}>{r.open}</div>
                      <div style={{ width: `${(r.resolved / max) * 100}%`, background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 6, fontSize: 10, fontWeight: 600, color: 'white' }}>{r.resolved}</div>
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600, textAlign: 'right' }}>{total}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Response times */}
          <div style={{ background: 'white', border: '1px solid var(--paper-200)', borderRadius: 12, padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 4px' }}>Response performance</h3>
            <div style={{ fontSize: 12, color: 'var(--paper-700)', marginBottom: 24 }}>This week</div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 40, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1 }}>3m 42s</div>
              <div style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600, marginTop: 6 }}>↓ 22s faster than last week</div>
            </div>
            {/* Sparkline */}
            <svg viewBox="0 0 280 80" style={{ width: '100%', height: 80 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--red)" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="var(--red)" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <path d="M0 50 L40 35 L80 42 L120 28 L160 38 L200 22 L240 30 L280 18 L280 80 L0 80 Z" fill="url(#grad)"/>
              <path d="M0 50 L40 35 L80 42 L120 28 L160 38 L200 22 L240 30 L280 18" stroke="var(--red)" strokeWidth="2" fill="none" strokeLinejoin="round" strokeLinecap="round"/>
              {[[0,50],[40,35],[80,42],[120,28],[160,38],[200,22],[240,30],[280,18]].map(([x,y],i) => (
                <circle key={i} cx={x} cy={y} r="2.5" fill="var(--red)" />
              ))}
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--paper-700)', fontFamily: 'var(--mono)', marginTop: 6 }}>
              <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
            </div>
          </div>
        </div>

        {/* Recent incidents table */}
        <div style={{ background: 'white', border: '1px solid var(--paper-200)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--paper-200)' }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 4px' }}>Recent incidents</h3>
              <div style={{ fontSize: 12, color: 'var(--paper-700)' }}>Showing the 6 most recent reports in your radius</div>
            </div>
            <GhostButton theme="light" size="sm">View all →</GhostButton>
          </div>
          <IncidentsTable rows={SAMPLE_INCIDENTS.slice(0, 6)} onView={onViewIncident} />
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------
// INCIDENTS TABLE — shared by Overview + All Reports
// -----------------------------------------------------------
function IncidentsTable({ rows, onView, showAssigned = false }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--paper-50)', borderBottom: '1px solid var(--paper-200)' }}>
            {['Reference', 'Type', 'Location', 'Status', 'Reported', showAssigned && 'Assigned to', 'Action'].filter(Boolean).map(h => (
              <th key={h} style={{
                padding: '12px 24px', textAlign: 'left', fontSize: 11, fontWeight: 600,
                color: 'var(--paper-700)', letterSpacing: '0.05em', textTransform: 'uppercase',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(r => {
            const t = getIncidentType(r.type);
            return (
              <tr key={r.ref} style={{ borderBottom: '1px solid var(--paper-100)', transition: 'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--paper-50)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '14px 24px', fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600 }}>{r.ref}</td>
                <td style={{ padding: '14px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: 7, flexShrink: 0,
                      background: 'var(--paper-100)', border: '1px solid var(--paper-200)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--paper-900)',
                    }}><t.icon style={{ width: 16, height: 16 }} /></div>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{t.short}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 24px', fontSize: 13, color: 'var(--paper-900)', maxWidth: 260 }}>{r.location}</td>
                <td style={{ padding: '14px 24px' }}><StatusBadge status={r.status} size="sm"/></td>
                <td style={{ padding: '14px 24px', fontSize: 12, color: 'var(--paper-700)', fontFamily: 'var(--mono)' }}>{r.reported}</td>
                {showAssigned && <td style={{ padding: '14px 24px', fontSize: 13, color: r.assignedTo ? 'var(--paper-900)' : 'var(--paper-300)' }}>{r.assignedTo || '— unassigned'}</td>}
                <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                  <button onClick={() => onView(r)} style={{
                    padding: '6px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600,
                    color: 'var(--paper-900)', background: 'var(--paper-100)',
                    border: '1px solid var(--paper-200)', transition: 'all 0.1s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--paper-900)'; e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--paper-100)'; e.currentTarget.style.color = 'var(--paper-900)'; }}
                  >View</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// -----------------------------------------------------------
// SCREEN 8 — MAP VIEW
// -----------------------------------------------------------
function MapTab({ onViewIncident }) {
  const mapRef = React.useRef(null);
  const mapInstance = React.useRef(null);
  const [typeFilter, setTypeFilter] = React.useState([]);
  const [statusFilter, setStatusFilter] = React.useState([]);

  React.useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    const map = L.map(mapRef.current, { zoomControl: false }).setView([6.8912, 3.1720], 14);
    L.control.zoom({ position: 'topright' }).addTo(map);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap, © CARTO', subdomains: 'abcd', maxZoom: 19,
    }).addTo(map);

    SAMPLE_INCIDENTS.forEach(inc => {
      const icon = L.divIcon({
        html: `<div class="irms-marker ${inc.status}"></div>`,
        className: '', iconSize: [26, 26], iconAnchor: [13, 26],
      });
      const marker = L.marker([inc.lat, inc.lng], { icon }).addTo(map);
      marker.on('click', () => onViewIncident(inc));
    });

    mapInstance.current = map;
    return () => { map.remove(); mapInstance.current = null; };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <DashTopBar
        title="Live map"
        subtitle={`${SAMPLE_INCIDENTS.length} incidents · 25km service radius`}
        actions={null}
      />
      {/* Filter toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '12px 32px',
        background: 'white', borderBottom: '1px solid var(--paper-200)',
      }}>
        <FilterDropdown label="Incident Type" options={INCIDENT_TYPES.map(t => t.label)} />
        <FilterDropdown label="Status" options={['Received', 'Under Review', 'Assigned', 'Resolved']} />
        <button style={{ fontSize: 13, color: 'var(--paper-700)', fontWeight: 500, padding: '8px 12px' }}>Reset filters</button>
        <div style={{ flex: 1 }}/>
        <div style={{ fontSize: 12, color: 'var(--paper-700)', fontFamily: 'var(--mono)' }}>
          REDEMPTION CAMP · 6.8932° N · 3.1721° E
        </div>
      </div>

      {/* Map */}
      <div style={{ flex: 1, position: 'relative' }}>
        <div ref={mapRef} style={{ position: 'absolute', inset: 0 }} />
        {/* Legend */}
        <div style={{
          position: 'absolute', bottom: 20, right: 20, zIndex: 500,
          background: 'white', border: '1px solid var(--paper-200)', borderRadius: 12, padding: '14px 16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--paper-700)', letterSpacing: '0.12em', marginBottom: 10 }}>LEGEND</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { c: 'var(--red)', l: 'Received' },
              { c: 'var(--amber)', l: 'Under Review' },
              { c: 'var(--blue)', l: 'Assigned' },
              { c: 'var(--green)', l: 'Resolved' },
            ].map(x => (
              <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--paper-900)' }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: x.c, border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}/>
                {x.l}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterDropdown({ label, options }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
        borderRadius: 9, border: '1px solid var(--paper-200)', background: 'white',
        fontSize: 13, fontWeight: 500, color: 'var(--paper-900)',
      }}>
        {label} <Icon.chevDown />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 100 }}/>
          <div style={{
            position: 'absolute', top: '100%', left: 0, marginTop: 6, zIndex: 200,
            background: 'white', border: '1px solid var(--paper-200)', borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)', minWidth: 200, padding: 6,
          }}>
            {options.map(o => (
              <label key={o} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 7, fontSize: 13, cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--paper-50)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <input type="checkbox" style={{ accentColor: 'var(--red)' }} />
                {o}
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// -----------------------------------------------------------
// SCREEN 9 — ALL REPORTS
// -----------------------------------------------------------
function ReportsTab({ onViewIncident }) {
  const [search, setSearch] = React.useState('');
  const filtered = SAMPLE_INCIDENTS.filter(r =>
    !search || r.ref.toLowerCase().includes(search.toLowerCase()) ||
    r.location.toLowerCase().includes(search.toLowerCase()) ||
    getIncidentType(r.type).label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <DashTopBar
        title="All reports"
        subtitle={`${filtered.length} incidents · Sorted by most recent`}
        actions={<GhostButton theme="light" size="sm"><Icon.download /> Export CSV</GhostButton>}
      />
      <div style={{ padding: 32 }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{
            flex: 1, minWidth: 260, display: 'flex', alignItems: 'center', gap: 10,
            padding: '0 14px', background: 'white', border: '1px solid var(--paper-200)', borderRadius: 10,
          }}>
            <Icon.search style={{ color: 'var(--paper-700)' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by reference, type, or location..."
              style={{ flex: 1, padding: '10px 0', border: 'none', outline: 'none', fontSize: 14, background: 'transparent' }}
            />
          </div>
          <FilterDropdown label="Type" options={INCIDENT_TYPES.map(t => t.label)} />
          <FilterDropdown label="Status" options={['Received', 'Under Review', 'Assigned', 'Resolved']} />
          <FilterDropdown label="Date Range" options={['Today', 'Last 7 days', 'Last 30 days', 'Custom']} />
        </div>

        <div style={{ background: 'white', border: '1px solid var(--paper-200)', borderRadius: 12, overflow: 'hidden' }}>
          <IncidentsTable rows={filtered} onView={onViewIncident} showAssigned />
          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid var(--paper-100)' }}>
            <div style={{ fontSize: 12, color: 'var(--paper-700)' }}>Showing 1 – {filtered.length} of 148</div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button style={{ width: 32, height: 32, borderRadius: 7, border: '1px solid var(--paper-200)', fontSize: 12, color: 'var(--paper-700)' }}>←</button>
              {[1, 2, 3].map(n => (
                <button key={n} style={{
                  width: 32, height: 32, borderRadius: 7,
                  border: n === 1 ? '1px solid var(--red)' : '1px solid var(--paper-200)',
                  background: n === 1 ? 'var(--red)' : 'white',
                  color: n === 1 ? 'white' : 'var(--paper-900)',
                  fontWeight: 600, fontSize: 12,
                }}>{n}</button>
              ))}
              <span style={{ padding: '0 8px', alignSelf: 'center', color: 'var(--paper-700)' }}>…</span>
              <button style={{ width: 32, height: 32, borderRadius: 7, border: '1px solid var(--paper-200)', fontSize: 12, color: 'var(--paper-900)' }}>25</button>
              <button style={{ width: 32, height: 32, borderRadius: 7, border: '1px solid var(--paper-200)', fontSize: 12, color: 'var(--paper-700)' }}>→</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------
// SCREEN 7 — INCIDENT DETAIL PANEL (slide-in from right)
// -----------------------------------------------------------
function IncidentDetailPanel({ incident, onClose }) {
  const [status, setStatus] = React.useState(incident.status);
  const [assigned, setAssigned] = React.useState(!!incident.assignedTo);
  const t = getIncidentType(incident.type);

  if (!incident) return null;
  const isLight = true;

  const handleAssign = () => { setAssigned(true); setStatus('assigned'); };

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(10,13,20,0.4)', zIndex: 1500,
        animation: 'fadeIn 0.2s ease-out',
      }}/>
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(620px, 92vw)',
        background: 'white', zIndex: 1600, overflowY: 'auto',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.15)',
        animation: 'slideRight 0.3s cubic-bezier(.2,.8,.2,1)',
      }}>
        {/* Header */}
        <div style={{
          position: 'sticky', top: 0, background: 'white', zIndex: 10,
          padding: '24px 32px 16px', borderBottom: '1px solid var(--paper-100)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--paper-700)', letterSpacing: '0.1em', marginBottom: 8 }}>INCIDENT REFERENCE</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em' }}>{incident.ref}</div>
                <StatusBadge status={status} />
              </div>
            </div>
            <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid var(--paper-200)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon.close />
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'var(--paper-100)', border: '1px solid var(--paper-200)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><t.icon style={{ width: 18, height: 18 }} /></div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{t.label}</div>
              <div style={{ fontSize: 12, color: 'var(--paper-700)' }}>Reported {incident.reportedAt}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '24px 32px 40px' }}>
          {/* Status stepper */}
          <div style={{ padding: '20px 4px', marginBottom: 24, borderBottom: '1px solid var(--paper-100)' }}>
            <StatusStepper current={status} theme="light"
              timestamps={{
                received: incident.reportedAt.split('·')[1]?.trim() || '14:32',
                review: status === 'review' || status === 'assigned' || status === 'resolved' ? '14:38' : null,
                assigned: status === 'assigned' || status === 'resolved' ? '14:51' : null,
                resolved: status === 'resolved' ? '15:12' : null,
              }}
            />
          </div>

          {/* Location */}
          <Section title="Location">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <Icon.pin style={{ color: 'var(--red)', flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{incident.location}</div>
                <div style={{ fontSize: 12, color: 'var(--paper-700)', fontFamily: 'var(--mono)' }}>
                  {incident.lat.toFixed(4)}° N · {incident.lng.toFixed(4)}° E
                </div>
              </div>
            </div>
          </Section>

          {/* Description */}
          <Section title="Description">
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--paper-900)', margin: 0 }}>{incident.desc}</p>
          </Section>

          {/* Media */}
          {incident.media > 0 && (
            <Section title={`Evidence (${incident.media} attachment${incident.media > 1 ? 's' : ''})`}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {Array.from({ length: incident.media }).map((_, i) => (
                  <div key={i} style={{
                    aspectRatio: '1', borderRadius: 10, overflow: 'hidden',
                    background: `linear-gradient(135deg, oklch(0.6 0.1 ${i*60+30}), oklch(0.4 0.08 ${i*60+60}))`,
                    border: '1px solid var(--paper-200)', position: 'relative', cursor: 'pointer',
                  }}>
                    <div style={{ position: 'absolute', bottom: 6, left: 8, color: 'white', fontSize: 10, fontFamily: 'var(--mono)', fontWeight: 600 }}>IMG_{i+1}.JPG</div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Agency actions */}
          <div style={{ marginTop: 32, padding: 20, borderRadius: 12, background: 'var(--paper-50)', border: '1px solid var(--paper-200)' }}>
            {!assigned ? (
              <>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--paper-700)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>UNASSIGNED INCIDENT</div>
                <div style={{ fontSize: 14, color: 'var(--paper-900)', marginBottom: 16 }}>
                  This incident is in your service radius. Assign your agency to take responsibility.
                </div>
                <button onClick={handleAssign} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px',
                  background: 'var(--red)', color: 'white', borderRadius: 10, fontWeight: 600, fontSize: 14,
                  width: '100%', justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(232,74,63,0.25)',
                }}>
                  Assign to RCCG Camp Security <Icon.arrow />
                </button>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--blue)' }}/>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Assigned to your agency</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>{incident.assignedTo || 'RCCG Camp Security'}</div>

                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--paper-700)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>UPDATE INCIDENT STATUS</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 16, padding: 4, background: 'white', borderRadius: 10, border: '1px solid var(--paper-200)' }}>
                  {['received', 'review', 'assigned', 'resolved'].map(s => {
                    const map = { received: { c: 'var(--red)', bg: 'var(--red-bg)', l: 'Received' },
                                  review: { c: 'var(--amber)', bg: 'var(--amber-bg)', l: 'Under Review' },
                                  assigned: { c: 'var(--blue)', bg: 'var(--blue-bg)', l: 'Assigned' },
                                  resolved: { c: 'var(--green)', bg: 'var(--green-bg)', l: 'Resolved' } };
                    const m = map[s];
                    const active = status === s;
                    return (
                      <button key={s} onClick={() => setStatus(s)} style={{
                        padding: '10px 8px', borderRadius: 7, fontSize: 12, fontWeight: 600,
                        background: active ? m.bg : 'transparent',
                        color: active ? m.c : 'var(--paper-700)',
                        border: active ? `1px solid ${m.c}` : '1px solid transparent',
                        transition: 'all 0.15s',
                      }}>{m.l}</button>
                    );
                  })}
                </div>

                <button style={{
                  width: '100%', padding: '12px 20px', borderRadius: 10,
                  background: status === 'resolved' ? 'var(--green)' : 'var(--amber)',
                  color: 'white', fontWeight: 600, fontSize: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: status === 'resolved' ? '0 4px 14px rgba(60,157,106,0.25)' : '0 4px 14px rgba(232,154,60,0.25)',
                }}>
                  <Icon.check /> Update to {status === 'resolved' ? 'Resolved' : 'New Status'}
                </button>
                <div style={{ fontSize: 11, color: 'var(--paper-700)', marginTop: 12, textAlign: 'center' }}>
                  Last updated: Today at 4:15 PM by Adebayo Olamide
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--paper-700)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}

// -----------------------------------------------------------
// DASHBOARD ROOT — manages tabs + detail panel
// -----------------------------------------------------------
function DashboardScreen({ navigate, initialTab = 'overview' }) {
  const [tab, setTab] = React.useState(initialTab);
  const [activeIncident, setActiveIncident] = React.useState(null);

  React.useEffect(() => {
    document.body.classList.add('light');
    return () => document.body.classList.remove('light');
  }, []);

  return (
    <DashboardShell navigate={navigate} currentTab={tab} onTabChange={setTab}>
      {tab === 'overview' && <OverviewTab onViewIncident={setActiveIncident} />}
      {tab === 'map' && <MapTab onViewIncident={setActiveIncident} />}
      {tab === 'reports' && <ReportsTab onViewIncident={setActiveIncident} />}
      {tab === 'settings' && <SettingsTab />}
      {activeIncident && <IncidentDetailPanel incident={activeIncident} onClose={() => setActiveIncident(null)} />}
    </DashboardShell>
  );
}

function SettingsTab() {
  return (
    <div>
      <DashTopBar title="Settings" subtitle="Manage your agency profile and notification preferences" />
      <div style={{ padding: 32, maxWidth: 720 }}>
        <div style={{ background: 'white', border: '1px solid var(--paper-200)', borderRadius: 12, padding: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>Agency profile</h3>
          <p style={{ fontSize: 13, color: 'var(--paper-700)', margin: '0 0 24px' }}>Visible to the public during incident assignment.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <FormInput label="Agency name" value="RCCG Camp Security" onChange={() => {}} />
            <FormInput label="Email" value="ops@rccg-security.org" onChange={() => {}} />
            <FormInput label="Phone" value="+234 803 555 0142" onChange={() => {}} />
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>Service coverage radius</label>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600, color: 'var(--red)' }}>25 km</span>
              </div>
              <input type="range" min="5" max="100" defaultValue="25" style={{ width: '100%', accentColor: 'var(--red)' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DashboardScreen, IncidentDetailPanel });
