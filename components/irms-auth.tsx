import React from 'react';
import { toast } from 'sonner';
import { IRMSLogo, Icon } from './irms-shared';
import { ThemeToggle } from './ThemeToggle';
import {
  agencySignup,
  agencyLogin,
  agencyVerifyEmail,
  agencyResendOtp,
  agencyForgotPassword,
  agencyResetPassword,
  EmailNotVerifiedError,
} from '@/lib/auth-api';
import { useIsMobile, useIsTablet } from '@/hooks/use-media-query';
import { clampToPilotArea } from '@/lib/geo-constants';

interface AuthShellProps {
  children: React.ReactNode;
  mode?: 'signup' | 'login';
  navigate?: (to: string) => void;
}

export function AuthShell({ children, mode = 'signup', navigate }: AuthShellProps) {
  return (
    <div className="irms-auth-shell-grid" style={{
      minHeight: '100vh', background: 'var(--brand-cream)', color: 'var(--brand-ink)',
      display: 'grid', gridTemplateColumns: '1fr 1.1fr',
    }}>
      {/* Left panel — warmer cream (hidden on mobile via .irms-auth-copy-panel) */}
      <div className="irms-auth-copy-panel" style={{
        background: 'var(--brand-surface-alt)', color: 'var(--brand-ink)',
        padding: '40px 56px', display: 'flex', flexDirection: 'column',
        borderRight: '1px solid var(--brand-hairline)',
      }}>
        <button onClick={() => navigate?.('landing')} aria-label="IRMS home" style={{ background: 'none', border: 'none', cursor: navigate ? 'pointer' : 'default', padding: 0, alignSelf: 'flex-start' }}>
          <IRMSLogo size={16} color="var(--brand-ink)" />
        </button>

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
      <div className="irms-auth-form-panel" style={{ background: 'var(--brand-white)', padding: '40px 64px', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
}

// ─── Shared form atoms ──────────────────────────────────────

interface FormInputProps {
  label: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  suffix?: React.ReactNode;
  error?: string;
  disabled?: boolean;
}

export function FormInput({ label, type = 'text', value, onChange, placeholder, suffix, error, disabled }: FormInputProps) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--brand-ink)' }}>{label}</label>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: disabled ? 'var(--brand-cream)' : 'var(--brand-white)',
        border: `1px solid ${error ? 'var(--status-red)' : focused ? 'var(--brand-ink)' : 'var(--brand-hairline)'}`,
        borderRadius: 8, padding: '0 12px',
        boxShadow: focused ? (error ? '0 0 0 3px rgba(200,70,60,0.1)' : '0 0 0 3px rgba(20, 19, 13, 0.06)') : '0 1px 2px rgba(40, 35, 20, 0.04)',
        transition: 'all 0.15s',
        opacity: disabled ? 0.6 : 1,
      }}>
        <input
          type={type} value={value || ''} onChange={onChange} placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            flex: 1, padding: '13px 0', border: 'none', outline: 'none',
            background: 'transparent', fontSize: 14, color: 'var(--brand-ink)',
            fontFamily: 'inherit', cursor: disabled ? 'not-allowed' : 'text',
          }}
        />
        {suffix}
      </div>
      {error && <div style={{ fontSize: 12, color: 'var(--status-red)', marginTop: 4, fontWeight: 500 }}>{error}</div>}
    </div>
  );
}

export function PasswordInput({ label, value, onChange, placeholder, error, disabled }: Omit<FormInputProps, 'type' | 'suffix'>) {
  const [show, setShow] = React.useState(false);
  return (
    <FormInput
      label={label}
      type={show ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      error={error}
      disabled={disabled}
      suffix={
        <button type="button" onClick={() => setShow(!show)} style={{ color: 'var(--brand-muted)', padding: 4, background: 'none', border: 'none', cursor: 'pointer' }}>
          {show ? <Icon.eyeOff /> : <Icon.eye />}
        </button>
      }
    />
  );
}

interface ScreenProps {
  navigate: (to: string, params?: Record<string, any>) => void;
}

// ─── Spinner ────────────────────────────────────────────────

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.75s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40 20" strokeLinecap="round"/>
    </svg>
  );
}

// ─── OTP input + resend cooldown (shared by verify + reset) ─────────────────

const OTP_LENGTH = 6;

// Six single-digit cells with auto-advance, backspace-to-previous, and paste.
function OtpInput({ value, onChange, disabled, autoFocus }: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  const refs = React.useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] || '');

  const fillFrom = (start: number, text: string) => {
    const clean = text.replace(/\D/g, '');
    if (!clean) return;
    const next = digits.slice();
    clean.split('').slice(0, OTP_LENGTH - start).forEach((c, k) => { next[start + k] = c; });
    onChange(next.join('').slice(0, OTP_LENGTH));
    refs.current[Math.min(start + clean.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleChange = (i: number, raw: string) => {
    if (raw.length > 1) { fillFrom(i, raw); return; }
    const d = raw.replace(/\D/g, '');
    const next = digits.slice();
    next[i] = d;
    onChange(next.join('').slice(0, OTP_LENGTH));
    if (d && i < OTP_LENGTH - 1) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      e.preventDefault();
      refs.current[i - 1]?.focus();
    }
  };

  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          value={d}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={e => { e.preventDefault(); fillFrom(i, e.clipboardData.getData('text')); }}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          aria-label={`Digit ${i + 1}`}
          style={{
            width: '100%', minWidth: 0, aspectRatio: '1 / 1',
            textAlign: 'center', fontSize: 22, fontWeight: 700,
            fontFamily: 'var(--font-mono)', color: 'var(--brand-ink)',
            background: disabled ? 'var(--brand-cream)' : 'var(--brand-white)',
            border: `1px solid ${d ? 'var(--brand-ink)' : 'var(--brand-hairline)'}`,
            borderRadius: 10, outline: 'none', transition: 'border 0.15s',
            cursor: disabled ? 'not-allowed' : 'text', opacity: disabled ? 0.6 : 1,
          }}
        />
      ))}
    </div>
  );
}

// Countdown used to gate the "resend code" button (matches the backend's 60s rule).
function useCooldown(): [number, () => void] {
  const [left, setLeft] = React.useState(0);
  React.useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft(l => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  return [left, React.useCallback(() => setLeft(60), [])];
}

// Shared "resend code" control: shows a live countdown, then becomes a button.
function ResendRow({ cooldown, resending, onResend }: {
  cooldown: number;
  resending: boolean;
  onResend: () => void;
}) {
  return (
    <div style={{ fontSize: 13, color: 'var(--brand-muted)', textAlign: 'center' }}>
      Didn&apos;t get the code?{' '}
      {cooldown > 0 ? (
        <span>Resend in {cooldown}s</span>
      ) : (
        <button
          type="button"
          onClick={onResend}
          disabled={resending}
          style={{
            color: 'var(--brand-ink)', fontWeight: 600, background: 'none', border: 'none',
            textDecoration: 'underline', textUnderlineOffset: 3,
            cursor: resending ? 'not-allowed' : 'pointer', padding: 0, font: 'inherit',
          }}
        >
          {resending ? 'Sending…' : 'Resend code'}
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SHARED AGENCY AUTH HEADER
// On desktop/tablet: logo (when copy panel hidden) + "Back to home" and the
// alt action inline. On mobile: logo + back-arrow only, with the alt action
// and theme toggle collapsed into a hamburger menu so nothing wraps.
// ─────────────────────────────────────────────────────────────
function AgencyAuthHeader({
  navigate, isTablet, isMobile, altLabel, altActionLabel, altAction,
}: {
  navigate: (to: string) => void;
  isTablet: boolean;
  isMobile: boolean;
  altLabel: string;
  altActionLabel: string;
  altAction: () => void;
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 16 }}>
        {/* Logo shown here only when the copy panel (and its logo) is hidden */}
        {isTablet && (
          <button type="button" onClick={() => navigate('landing')} aria-label="IRMS home" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <IRMSLogo size={15} color="var(--brand-ink)" />
          </button>
        )}
        <button type="button" onClick={() => navigate('back')} aria-label="Back to home" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--brand-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
          <Icon.back style={{ width: 16, height: 16 }} />{!isMobile && ' Back to home'}
        </button>
      </div>

      {isMobile ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, position: 'relative' }}>
          <ThemeToggle size={34} />
          <button
            type="button"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen ? 'true' : 'false'}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 38, height: 38, borderRadius: 9, color: 'var(--brand-ink)',
              background: menuOpen ? 'var(--brand-surface-alt)' : 'none',
              border: '1px solid var(--brand-divider)', cursor: 'pointer',
            }}
          >
            {menuOpen ? <Icon.close style={{ width: 18, height: 18 }} /> : <Icon.list style={{ width: 18, height: 18 }} />}
          </button>
          {menuOpen && (
            <>
              <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 60 }} />
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 8, zIndex: 70,
                minWidth: 220, padding: 6,
                background: 'var(--brand-white)', border: '1px solid var(--brand-divider)',
                borderRadius: 12, boxShadow: '0 16px 36px rgba(0,0,0,0.16)',
              }}>
                <div style={{ padding: '8px 12px 6px', fontSize: 12, color: 'var(--brand-muted)' }}>{altLabel}</div>
                <button type="button" onClick={() => { setMenuOpen(false); altAction(); }} style={{
                  width: '100%', padding: '10px 12px', fontSize: 14, fontWeight: 600, color: 'var(--brand-ink)',
                  borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                }}>{altActionLabel}</button>
                <div style={{ height: 1, background: 'var(--brand-hairline)', margin: '4px 8px' }} />
                <button type="button" onClick={() => { setMenuOpen(false); navigate('back'); }} style={{
                  width: '100%', padding: '10px 12px', fontSize: 14, fontWeight: 500, color: 'var(--brand-muted)',
                  borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                }}>Back to home</button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 13, color: 'var(--brand-muted)' }}>
            {altLabel} <button type="button" onClick={altAction} style={{ color: 'var(--brand-ink)', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3, whiteSpace: 'nowrap', background: 'none', border: 'none', cursor: 'pointer' }}>{altActionLabel}</button>
          </div>
          <ThemeToggle size={34} />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// AGENCY SIGNUP
// ─────────────────────────────────────────────────────────────
export function AgencySignupScreen({ navigate }: ScreenProps) {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const [agencyName, setAgencyName] = React.useState('');
  const [agencyType, setAgencyType] = React.useState('police');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [radius, setRadius] = React.useState(25);
  const [latitude, setLatitude] = React.useState('');
  const [longitude, setLongitude] = React.useState('');
  const [locating, setLocating] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  // Once registration succeeds the backend emails an OTP; we swap to the
  // verification step (keeping the email in memory for verify/resend).
  const [verifyEmail, setVerifyEmail] = React.useState<string | null>(null);

  const useMyLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      toast.error('Location is not available on this device.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const clamped = clampToPilotArea(pos.coords.latitude, pos.coords.longitude);
        if (clamped.wasClamped) {
          toast.success('Location adjusted to pilot area (Redemption Camp).');
        } else {
          toast.success('Location captured.');
        }
        setLatitude(clamped.lat.toFixed(6));
        setLongitude(clamped.lng.toFixed(6));
        setErrors(p => ({ ...p, location: '' }));
        setLocating(false);
      },
      () => { setLocating(false); toast.error('Could not get your location. Enter it manually.'); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  // ids are the backend agency_type values
  const agencyTypes = [
    { id: 'police', label: 'Police' },
    { id: 'hospital', label: 'Hospital / Medical' },
    { id: 'fire_rescue', label: 'Fire & Rescue' },
    { id: 'private_security', label: 'Private Security' },
  ];

  const validate = () => {
    const e: Record<string, string> = {};
    if (!agencyName.trim()) e.agencyName = 'Agency name is required';
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) e.email = 'Valid email is required';
    if (!phone.trim()) e.phone = 'Phone number is required';
    if (password.length < 8) e.password = 'Password must be at least 8 characters';
    if (password !== confirm) e.confirm = 'Passwords do not match';
    const lat = parseFloat(latitude), lng = parseFloat(longitude);
    if (!latitude.trim() || !longitude.trim() || isNaN(lat) || isNaN(lng)) {
      e.location = 'Set your agency location (use current location or enter coordinates)';
    } else if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      e.location = 'Coordinates are out of range';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await agencySignup({
        agencyName, agencyType, email, phone, password, radius,
        latitude: parseFloat(latitude), longitude: parseFloat(longitude),
      });
      toast.success('Account created — we emailed you a 6-digit verification code.');
      setVerifyEmail(email);
    } catch (err: any) {
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearErr = (key: string) => setErrors(p => ({ ...p, [key]: '' }));

  // OTP verification step (after a successful registration).
  if (verifyEmail) {
    return (
      <AgencyVerifyScreen
        email={verifyEmail}
        navigate={navigate}
        onChangeEmail={() => setVerifyEmail(null)}
        mode="signup"
      />
    );
  }

  return (
    <AuthShell mode="signup" navigate={navigate}>
      <AgencyAuthHeader
        navigate={navigate}
        isTablet={isTablet}
        isMobile={isMobile}
        altLabel="Already registered?"
        altActionLabel="Sign in"
        altAction={() => navigate('agency-login')}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 480, width: '100%', margin: '40px auto' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 8px' }}>Create agency account</h1>
          <p style={{ fontSize: 14, color: 'var(--brand-muted)', margin: 0 }}>
            Step 1 of verification. We will review your credentials within 24 hours.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <FormInput
            label="Agency name"
            value={agencyName}
            onChange={e => { setAgencyName(e.target.value); clearErr('agencyName'); }}
            placeholder="e.g. Federal Road Safety Corps"
            error={errors.agencyName}
            disabled={loading}
          />

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--brand-ink)' }}>Agency type</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4, padding: 4, background: 'var(--brand-cream)', borderRadius: 10, border: '1px solid var(--brand-hairline)' }}>
              {agencyTypes.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => !loading && setAgencyType(t.id)}
                  style={{
                    padding: '9px 12px', borderRadius: 7, fontSize: 13, fontWeight: 600, border: 'none',
                    background: agencyType === t.id ? 'var(--brand-white)' : 'transparent',
                    color: agencyType === t.id ? 'var(--brand-ink)' : 'var(--brand-muted)',
                    boxShadow: agencyType === t.id ? '0 1px 2px rgba(40, 35, 20, 0.04)' : 'none',
                    transition: 'all 0.15s', cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >{t.label}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
            <FormInput label="Email" type="email" value={email} onChange={e => { setEmail(e.target.value); clearErr('email'); }} placeholder="ops@agency.org" error={errors.email} disabled={loading} />
            <FormInput label="Phone" value={phone} onChange={e => { setPhone(e.target.value); clearErr('phone'); }} placeholder="+234 ..." error={errors.phone} disabled={loading} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
            <PasswordInput label="Password" value={password} onChange={e => { setPassword(e.target.value); clearErr('password'); }} placeholder="Min. 8 characters" error={errors.password} disabled={loading} />
            <PasswordInput label="Confirm password" value={confirm} onChange={e => { setConfirm(e.target.value); clearErr('confirm'); }} placeholder="••••••••" error={errors.confirm} disabled={loading} />
          </div>

          {/* Service radius slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--brand-ink)' }}>Service coverage radius</label>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--brand-ink)', background: 'var(--brand-cream)', padding: '2px 8px', borderRadius: 6, border: '1px solid var(--brand-divider)' }}>{radius} km</span>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="range" min="5" max="100" value={radius}
                onChange={e => setRadius(parseInt(e.target.value))}
                disabled={loading}
                style={{ width: '100%', accentColor: 'var(--brand-ink)', height: 4, cursor: loading ? 'not-allowed' : 'pointer' }}
              />
              {/* Filled track visual */}
              <div style={{
                position: 'absolute', top: '50%', left: 0, transform: 'translateY(-50%)',
                height: 4, width: `${((radius - 5) / 95) * 100}%`,
                background: 'var(--brand-ink)', borderRadius: 2, pointerEvents: 'none',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'var(--brand-muted)', fontFamily: 'var(--font-mono)' }}>
              <span>5 km</span><span>100 km</span>
            </div>
            <div style={{ marginTop: 6, fontSize: 12, color: 'var(--brand-muted)', lineHeight: 1.5 }}>
              Reports that fall within this radius and match your category will be routed to your dashboard.
            </div>
          </div>

          {/* Agency location — required by the backend so reports can be geo-routed */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 12, flexWrap: 'wrap' }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--brand-ink)' }}>Agency location</label>
              <button
                type="button"
                onClick={useMyLocation}
                disabled={loading || locating}
                style={{
                  fontSize: 12, fontWeight: 600, color: 'var(--brand-ink)', background: 'var(--brand-cream)',
                  border: '1px solid var(--brand-divider)', borderRadius: 7, padding: '6px 10px',
                  cursor: (loading || locating) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <Icon.pin style={{ width: 14, height: 14 }} /> {locating ? 'Locating…' : (isMobile ? 'My location' : 'Use my current location')}
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
              <FormInput label="Latitude" value={latitude} onChange={e => { setLatitude(e.target.value); clearErr('location'); }} placeholder="6.9342" disabled={loading} />
              <FormInput label="Longitude" value={longitude} onChange={e => { setLongitude(e.target.value); clearErr('location'); }} placeholder="3.4567" disabled={loading} />
            </div>
            {errors.location && <div style={{ fontSize: 12, color: 'var(--status-red)', marginTop: 6 }}>{errors.location}</div>}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              background: loading ? 'var(--brand-muted)' : 'var(--brand-ink)',
              color: 'var(--brand-cream)', padding: '13px 24px',
              borderRadius: 9, fontWeight: 600, fontSize: 14, marginTop: 4, border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8, transition: 'background 0.2s',
            }}
          >
            {loading ? <><Spinner /> Creating account…</> : 'Create agency account'}
          </button>

          <p style={{ fontSize: 11, color: 'var(--brand-muted)', textAlign: 'center', margin: '4px 0 0', lineHeight: 1.5 }}>
            By creating an account you agree to the IRMS Agency Terms and acknowledge that misuse of dispatch data is a federal offense.
          </p>
        </div>
      </div>
    </AuthShell>
  );
}

// ─────────────────────────────────────────────────────────────
// AGENCY LOGIN
// ─────────────────────────────────────────────────────────────
export function AgencyLoginScreen({ navigate }: ScreenProps) {
  const isTablet = useIsTablet();
  const isMobile = useIsMobile();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  // Set when the backend blocks login for an unverified email — we then drop
  // the user into the OTP step and send a fresh code.
  const [verifyEmail, setVerifyEmail] = React.useState<string | null>(null);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) e.email = 'Valid email is required';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const agency = await agencyLogin(email, password);
      toast.success(`Welcome back, ${agency.agencyName}!`);
      navigate('agency-dashboard');
    } catch (err: any) {
      if (err instanceof EmailNotVerifiedError) {
        toast.message('Verify your email to continue — we just sent you a code.');
        setVerifyEmail(err.email || email);
        return;
      }
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const clearErr = (key: string) => setErrors(p => ({ ...p, [key]: '' }));

  // OTP verification step (when login is blocked for an unverified email).
  if (verifyEmail) {
    return (
      <AgencyVerifyScreen
        email={verifyEmail}
        navigate={navigate}
        onChangeEmail={() => setVerifyEmail(null)}
        mode="login"
        autoSend
      />
    );
  }

  return (
    <AuthShell mode="login" navigate={navigate}>
      <AgencyAuthHeader
        navigate={navigate}
        isTablet={isTablet}
        isMobile={isMobile}
        altLabel="New agency?"
        altActionLabel="Register here"
        altAction={() => navigate('agency-signup')}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 420, width: '100%', margin: '40px auto' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 8px' }}>Sign in to dispatch</h1>
          <p style={{ fontSize: 14, color: 'var(--brand-muted)', margin: 0 }}>Welcome back. Resume operations on your assigned region.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <FormInput
            label="Email"
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); clearErr('email'); }}
            placeholder="you@agency.org"
            error={errors.email}
            disabled={loading}
          />
          <PasswordInput
            label="Password"
            value={password}
            onChange={e => { setPassword(e.target.value); clearErr('password'); }}
            placeholder="••••••••"
            error={errors.password}
            disabled={loading}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--brand-muted)' }}>
              <input type="checkbox" defaultChecked style={{ accentColor: 'var(--brand-ink)', width: 15, height: 15 }} />
              <span>Keep me signed in</span>
            </label>
            <button type="button" onClick={() => navigate('agency-forgot')} style={{ color: 'var(--brand-ink)', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 3, background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', padding: 0 }}>Forgot password?</button>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              background: loading ? 'var(--brand-muted)' : 'var(--brand-ink)',
              color: 'var(--brand-cream)', padding: '13px 24px',
              borderRadius: 9, fontWeight: 600, fontSize: 14, marginTop: 4, border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8, transition: 'background 0.2s',
            }}
          >
            {loading ? <><Spinner /> Signing in…</> : 'Sign in to dashboard'}
          </button>
        </div>
      </div>
    </AuthShell>
  );
}

// ─────────────────────────────────────────────────────────────
// AGENCY EMAIL VERIFICATION (OTP)
// Reached after registration, or when login is blocked for an unverified
// email. Verifying returns a JWT, so a successful code = signed in.
// ─────────────────────────────────────────────────────────────
export function AgencyVerifyScreen({ email, navigate, onChangeEmail, mode = 'signup', autoSend = false }: {
  email: string;
  navigate: (to: string) => void;
  onChangeEmail?: () => void;
  mode?: 'signup' | 'login';
  autoSend?: boolean;
}) {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const [otp, setOtp] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [resending, setResending] = React.useState(false);
  const [cooldown, startCooldown] = useCooldown();

  // A code already exists on entry (registration sent one; the login path sends
  // a fresh one via autoSend). Either way start the 60s resend cooldown.
  React.useEffect(() => {
    if (autoSend) {
      agencyResendOtp(email)
        .then(() => toast.success('We sent a fresh code to your email.'))
        .catch(() => { /* silent — the user can resend manually */ });
    }
    startCooldown();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verify = async () => {
    if (otp.length !== OTP_LENGTH) { setError('Enter the 6-digit code.'); return; }
    setLoading(true);
    setError('');
    try {
      const agency = await agencyVerifyEmail(email, otp);
      toast.success(`Email verified — welcome, ${agency.agencyName || 'agency'}!`);
      navigate('agency-dashboard');
    } catch (err: any) {
      setError(err.message || 'Verification failed. Check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    try {
      await agencyResendOtp(email);
      toast.success('A new code is on its way.');
      setOtp('');
      startCooldown();
    } catch (err: any) {
      toast.error(err.message || 'Could not resend the code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell mode={mode} navigate={navigate}>
      <AgencyAuthHeader
        navigate={navigate}
        isTablet={isTablet}
        isMobile={isMobile}
        altLabel="Wrong email?"
        altActionLabel="Go back"
        altAction={onChangeEmail || (() => navigate('agency-signup'))}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 420, width: '100%', margin: '40px auto' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 8px' }}>Verify your email</h1>
          <p style={{ fontSize: 14, color: 'var(--brand-muted)', margin: 0 }}>
            Enter the 6-digit code we sent to <strong style={{ color: 'var(--brand-ink)' }}>{email}</strong>.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <OtpInput value={otp} onChange={v => { setOtp(v); setError(''); }} disabled={loading} autoFocus />
          {error && <div style={{ fontSize: 12, color: 'var(--status-red)', marginTop: -6, fontWeight: 500 }}>{error}</div>}

          <button
            type="button"
            onClick={verify}
            disabled={loading || otp.length !== OTP_LENGTH}
            style={{
              background: (loading || otp.length !== OTP_LENGTH) ? 'var(--brand-muted)' : 'var(--brand-ink)',
              color: 'var(--brand-cream)', padding: '13px 24px',
              borderRadius: 9, fontWeight: 600, fontSize: 14, border: 'none',
              cursor: (loading || otp.length !== OTP_LENGTH) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.2s',
            }}
          >
            {loading ? <><Spinner /> Verifying…</> : 'Verify & continue'}
          </button>

          <ResendRow cooldown={cooldown} resending={resending} onResend={resend} />
        </div>
      </div>
    </AuthShell>
  );
}

// ─────────────────────────────────────────────────────────────
// AGENCY FORGOT PASSWORD (OTP-based reset)
// Step 1: request a code by email. Step 2: enter the code + a new password.
// ─────────────────────────────────────────────────────────────
export function AgencyForgotScreen({ navigate }: ScreenProps) {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const [step, setStep] = React.useState<'request' | 'reset'>('request');
  const [email, setEmail] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [resending, setResending] = React.useState(false);
  const [cooldown, startCooldown] = useCooldown();

  const clearErr = (k: string) => setErrors(p => ({ ...p, [k]: '' }));

  const requestCode = async () => {
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) { setErrors({ email: 'Valid email is required' }); return; }
    setLoading(true);
    setErrors({});
    try {
      await agencyForgotPassword(email);
      toast.success('If that email is registered, a reset code is on its way.');
      setStep('reset');
      startCooldown();
    } catch (err: any) {
      toast.error(err.message || 'Could not start password reset.');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    try {
      await agencyForgotPassword(email);
      toast.success('A new code is on its way.');
      setOtp('');
      startCooldown();
    } catch (err: any) {
      toast.error(err.message || 'Could not resend the code.');
    } finally {
      setResending(false);
    }
  };

  const submitReset = async () => {
    const e: Record<string, string> = {};
    if (otp.length !== OTP_LENGTH) e.otp = 'Enter the 6-digit code';
    if (password.length < 8) e.password = 'Password must be at least 8 characters';
    if (password !== confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    try {
      await agencyResetPassword(email, otp, password);
      toast.success('Password reset — sign in with your new password.');
      navigate('agency-login');
    } catch (err: any) {
      toast.error(err.message || 'Could not reset your password.');
    } finally {
      setLoading(false);
    }
  };

  const primaryBtn = (busy: boolean) => ({
    background: busy ? 'var(--brand-muted)' : 'var(--brand-ink)',
    color: 'var(--brand-cream)', padding: '13px 24px',
    borderRadius: 9, fontWeight: 600, fontSize: 14, marginTop: 4, border: 'none',
    cursor: busy ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: 8, transition: 'background 0.2s',
  }) as React.CSSProperties;

  return (
    <AuthShell mode="login" navigate={navigate}>
      <AgencyAuthHeader
        navigate={navigate}
        isTablet={isTablet}
        isMobile={isMobile}
        altLabel="Remembered it?"
        altActionLabel="Back to sign in"
        altAction={() => navigate('agency-login')}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 420, width: '100%', margin: '40px auto' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 8px' }}>Reset your password</h1>
          <p style={{ fontSize: 14, color: 'var(--brand-muted)', margin: 0 }}>
            {step === 'request'
              ? "Enter your agency email and we'll send a 6-digit reset code."
              : <>Enter the code we sent to <strong style={{ color: 'var(--brand-ink)' }}>{email}</strong> and choose a new password.</>}
          </p>
        </div>

        {step === 'request' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <FormInput
              label="Email"
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); clearErr('email'); }}
              placeholder="you@agency.org"
              error={errors.email}
              disabled={loading}
            />
            <button type="button" onClick={requestCode} disabled={loading} style={primaryBtn(loading)}>
              {loading ? <><Spinner /> Sending code…</> : 'Send reset code'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 8, color: 'var(--brand-ink)' }}>Verification code</label>
              <OtpInput value={otp} onChange={v => { setOtp(v); clearErr('otp'); }} disabled={loading} autoFocus />
              {errors.otp && <div style={{ fontSize: 12, color: 'var(--status-red)', marginTop: 6, fontWeight: 500 }}>{errors.otp}</div>}
            </div>
            <PasswordInput label="New password" value={password} onChange={e => { setPassword(e.target.value); clearErr('password'); }} placeholder="Min. 8 characters" error={errors.password} disabled={loading} />
            <PasswordInput label="Confirm new password" value={confirm} onChange={e => { setConfirm(e.target.value); clearErr('confirm'); }} placeholder="••••••••" error={errors.confirm} disabled={loading} />
            <button type="button" onClick={submitReset} disabled={loading} style={primaryBtn(loading)}>
              {loading ? <><Spinner /> Resetting…</> : 'Reset password'}
            </button>
            <ResendRow cooldown={cooldown} resending={resending} onResend={resend} />
            <button
              type="button"
              onClick={() => { setStep('request'); setOtp(''); setPassword(''); setConfirm(''); setErrors({}); }}
              style={{ fontSize: 13, color: 'var(--brand-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3, padding: 0 }}
            >
              Use a different email
            </button>
          </div>
        )}
      </div>
    </AuthShell>
  );
}
