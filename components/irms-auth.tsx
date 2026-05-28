import React from 'react';
import { IRMSLogo, Icon } from './irms-shared';

interface AuthShellProps {
  children: React.ReactNode;
  mode?: 'signup' | 'login';
}

export function AuthShell({ children, mode = 'signup' }: AuthShellProps) {
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--brand-cream)', color: 'var(--brand-ink)',
      display: 'grid', gridTemplateColumns: '1fr 1.1fr',
    }}>
      {/* Left panel — warmer cream */}
      <div style={{
        background: 'var(--brand-surface-alt)', color: 'var(--brand-ink)',
        padding: '40px 56px', display: 'flex', flexDirection: 'column',
        borderRight: '1px solid var(--brand-hairline)',
      }}>
        <div><IRMSLogo size={16} color="var(--brand-ink)" /></div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 460 }}>
          <div style={{ fontSize: 11, color: 'var(--brand-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 18 }}>
            {mode === 'signup' ? 'Agency registration' : 'Agency access'}
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, margin: '0 0 20px' }}>
            {mode === 'signup' ? <>Join the emergency<br/>response network.</> : <>Welcome back to<br/>the network.</>}
          </h2>
          <p style={{ fontSize: 15, color: 'var(--brand-muted)', lineHeight: 1.6, margin: '0 0 32px' }}>
            {mode === 'signup'
              ? 'Receive geo-targeted incident notifications for your service area. Assign cases to your team. Update response status. Coordinate with other agencies on the ground.'
              : 'Sign in to your operations dashboard. Review open incidents in your service area, assign cases to your team, and update response status.'}
          </p>

          <div style={{ background: 'var(--brand-white)', border: '1px solid var(--brand-hairline)', borderRadius: 10, overflow: 'hidden' }}>
            {(mode === 'signup' ? [
              { t: 'Verification within 24h', d: 'We review credentials before activation.' },
              { t: 'Geo-fenced notifications', d: 'Only incidents in your service radius.' },
              { t: 'Dashboard + map view', d: 'Assign cases, update status, export reports.' },
            ] : [
              { t: 'Live incident queue', d: 'Real-time list of reports in your area.' },
              { t: 'Team assignment', d: 'Route cases to specific responders.' },
              { t: 'Resolution tracking', d: 'Update status from received to resolved.' },
            ]).map((r, i, arr) => (
              <div key={i} style={{ padding: '14px 18px', borderBottom: i < arr.length - 1 ? '1px solid var(--brand-hairline)' : 'none', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', border: '1px solid var(--brand-divider)', flexShrink: 0, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon.check style={{ width: 11, height: 11, color: 'var(--brand-muted)' }} />
                </span>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{r.t}</div>
                  <div style={{ fontSize: 12, color: 'var(--brand-muted)', marginTop: 2 }}>{r.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 11, color: 'var(--brand-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--status-green)' }}/>
          All services operational
        </div>
      </div>

      {/* Right panel — pure white form area */}
      <div style={{ background: 'var(--brand-white)', padding: '40px 64px', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
}

interface FormInputProps {
  label: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  suffix?: React.ReactNode;
}

export function FormInput({ label, type = 'text', value, onChange, placeholder, suffix }: FormInputProps) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--brand-ink)' }}>{label}</label>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'var(--brand-white)', border: `1px solid ${focused ? 'var(--brand-ink)' : 'var(--brand-hairline)'}`,
        borderRadius: 8, padding: '0 12px',
        boxShadow: focused ? '0 0 0 3px rgba(20, 19, 13, 0.06)' : '0 1px 2px rgba(40, 35, 20, 0.04)',
        transition: 'all 0.15s',
      }}>
        <input
          type={type} value={value || ''} onChange={onChange} placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            flex: 1, padding: '13px 0', border: 'none', outline: 'none',
            background: 'transparent', fontSize: 14, color: 'var(--brand-ink)',
            fontFamily: 'inherit',
          }}
        />
        {suffix}
      </div>
    </div>
  );
}

export function PasswordInput({ label, value, onChange, placeholder }: Omit<FormInputProps, 'type' | 'suffix'>) {
  const [show, setShow] = React.useState(false);
  return (
    <FormInput
      label={label}
      type={show ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      suffix={
        <button onClick={() => setShow(!show)} style={{ color: 'var(--brand-muted)', padding: 4 }}>
          {show ? <Icon.eyeOff /> : <Icon.eye />}
        </button>
      }
    />
  );
}

interface ScreenProps {
  navigate: (to: string, params?: Record<string, any>) => void;
}

// -----------------------------------------------------------
// SCREEN 4 — AGENCY SIGNUP
// -----------------------------------------------------------
export function AgencySignupScreen({ navigate }: ScreenProps) {
  const [agencyName, setAgencyName] = React.useState('');
  const [agencyType, setAgencyType] = React.useState('police');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [radius, setRadius] = React.useState(25);

  const agencyTypes = [
    { id: 'police', label: 'Police' },
    { id: 'medical', label: 'Hospital / Medical' },
    { id: 'fire', label: 'Fire & Rescue' },
    { id: 'security', label: 'Private Security' },
  ];

  return (
    <AuthShell mode="signup">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => navigate('landing')} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--brand-muted)' }}>
          <Icon.back style={{ width: 16, height: 16 }} /> Back to home
        </button>
        <div style={{ fontSize: 13, color: 'var(--brand-muted)' }}>
          Already registered? <button onClick={() => navigate('agency-login')} style={{ color: 'var(--brand-ink)', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3, whiteSpace: 'nowrap' }}>Sign in</button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 480, width: '100%', margin: '40px auto' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 8px' }}>Create agency account</h1>
          <p style={{ fontSize: 14, color: 'var(--brand-muted)', margin: 0 }}>
            Step 1 of verification. We will review your credentials within 24 hours.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <FormInput label="Agency name" value={agencyName} onChange={e => setAgencyName(e.target.value)} placeholder="e.g. Federal Road Safety Corps" />

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--brand-ink)' }}>Agency type</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4, padding: 4, background: 'var(--brand-cream)', borderRadius: 10, border: '1px solid var(--brand-hairline)' }}>
              {agencyTypes.map(t => (
                <button key={t.id} onClick={() => setAgencyType(t.id)} style={{
                  padding: '9px 12px', borderRadius: 7, fontSize: 13, fontWeight: 600,
                  background: agencyType === t.id ? 'var(--brand-white)' : 'transparent',
                  color: agencyType === t.id ? 'var(--brand-ink)' : 'var(--brand-muted)',
                  boxShadow: agencyType === t.id ? '0 1px 2px rgba(40, 35, 20, 0.04)' : 'none',
                  transition: 'all 0.15s',
                }}>{t.label}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormInput label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ops@agency.org" />
            <FormInput label="Phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+234 ..." />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <PasswordInput label="Password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            <PasswordInput label="Confirm" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" />
          </div>

          {/* Service radius slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--brand-ink)' }}>Service coverage radius</label>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--brand-ink)' }}>{radius} km</span>
            </div>
            <input
              type="range" min="5" max="100" value={radius}
              onChange={e => setRadius(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--brand-ink)', height: 4 }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'var(--brand-muted)', fontFamily: 'var(--font-mono)' }}>
              <span>5 km</span><span>100 km</span>
            </div>
          </div>

          <button onClick={() => navigate('agency-dashboard')} style={{
            background: 'var(--brand-ink)', color: 'var(--brand-cream)', padding: '13px 24px',
            borderRadius: 9, fontWeight: 600, fontSize: 14, marginTop: 4, border: 'none', cursor: 'pointer'
          }}>Create agency account</button>

          <p style={{ fontSize: 11, color: 'var(--brand-muted)', textAlign: 'center', margin: '4px 0 0', lineHeight: 1.5 }}>
            By creating an account you agree to the IRMS Agency Terms and acknowledge that misuse of dispatch data is a federal offense.
          </p>
        </div>
      </div>
    </AuthShell>
  );
}

// -----------------------------------------------------------
// SCREEN 5 — AGENCY LOGIN
// -----------------------------------------------------------
export function AgencyLoginScreen({ navigate }: ScreenProps) {
  const [email, setEmail] = React.useState('ops@rccg-security.org');
  const [password, setPassword] = React.useState('demo1234');

  return (
    <AuthShell mode="login">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => navigate('landing')} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--brand-muted)' }}>
          <Icon.back style={{ width: 16, height: 16 }} /> Back to home
        </button>
        <div style={{ fontSize: 13, color: 'var(--brand-muted)' }}>
          New agency? <button onClick={() => navigate('agency-signup')} style={{ color: 'var(--brand-ink)', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 }}>Register here</button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 420, width: '100%', margin: '40px auto' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 8px' }}>Sign in to dispatch</h1>
          <p style={{ fontSize: 14, color: 'var(--brand-muted)', margin: 0 }}>Welcome back. Resume operations on your assigned region.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <FormInput label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@agency.org" />
          <PasswordInput label="Password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--brand-muted)' }}>
              <input type="checkbox" defaultChecked style={{ accentColor: 'var(--brand-ink)', width: 15, height: 15 }} />
              <span>Keep me signed in</span>
            </label>
            <a href="#" style={{ color: 'var(--brand-ink)', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 3 }}>Forgot password?</a>
          </div>

          <button onClick={() => navigate('agency-dashboard')} style={{
            background: 'var(--brand-ink)', color: 'var(--brand-cream)', padding: '13px 24px',
            borderRadius: 9, fontWeight: 600, fontSize: 14, marginTop: 4, border: 'none', cursor: 'pointer'
          }}>Sign in to dashboard</button>

          <div style={{
            padding: 14, borderRadius: 10, background: 'var(--brand-cream)',
            border: '1px solid var(--brand-hairline)', fontSize: 12, color: 'var(--brand-muted)',
            display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 16, lineHeight: 1.5,
          }}>
            <Icon.bell style={{ color: 'var(--brand-ink)', flexShrink: 0, marginTop: 1 }} />
            <div>
              <strong style={{ color: 'var(--brand-ink)' }}>Demo credentials pre-filled.</strong> Press Sign in to enter the agency dashboard.
            </div>
          </div>
        </div>
      </div>
    </AuthShell>
  );
}
