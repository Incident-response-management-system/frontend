import React, { useState } from 'react';
import { toast } from 'sonner';
import { Icon } from '@/components/irms-shared';
import { CitizenAuthShell } from './CitizenAuthShell';
import { DarkInput } from '../shared/DarkInput';
import { citizenLogin } from '@/lib/auth-api';

interface CitizenAuthProps {
  navigate: (to: string) => void;
  onAuth: (user: { name: string; email: string; phone?: string }) => void;
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.75s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40 20" strokeLinecap="round" />
    </svg>
  );
}

export function CitizenLoginScreen({ navigate, onAuth }: CitizenAuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) newErrors.email = 'Valid email is required';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await citizenLogin(email, password);
      onAuth({ name: response.user.email.split('@')[0], email: response.user.email });
      toast.success('Welcome back!');
      navigate('my-reports');
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const clearErr = (key: string) => setErrors(p => ({ ...p, [key]: '' }));

  return (
    <CitizenAuthShell mode="login" navigate={navigate}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => navigate('landing')} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--brand-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
          <Icon.back style={{ width: 16, height: 16 }} /> Back
        </button>
        <div style={{ fontSize: 13, color: 'var(--brand-muted)' }}>
          New here? <button onClick={() => navigate('citizen-signup')} style={{ color: 'var(--brand-ink)', fontWeight: 600, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>Create account</button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 420, width: '100%', margin: '40px auto' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 500, margin: '0 0 24px', letterSpacing: '0' }}>Welcome back</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <DarkInput
            label="Email"
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); clearErr('email'); }}
            placeholder="you@example.com"
            error={errors.email}
            disabled={loading}
          />
          <DarkInput
            label="Password"
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); clearErr('password'); }}
            placeholder="••••••••"
            error={errors.password}
            disabled={loading}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--brand-muted)', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ accentColor: 'var(--status-red)' }} /> Keep me signed in
            </label>
            <button onClick={() => navigate('citizen-forgot')} style={{ color: 'var(--brand-ink)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Forgot password?</button>
          </div>
          <button
            type="button"
            onClick={submit}
            disabled={loading}
            style={{
              background: loading ? 'var(--brand-muted)' : 'var(--brand-accent)',
              color: loading ? 'var(--brand-cream)' : 'var(--brand-ink)', padding: '12px 24px', borderRadius: 6,
              fontWeight: 600, fontSize: 14, marginTop: 4, border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.2s ease',
              boxShadow: loading ? 'none' : '0 2px 8px rgba(197, 168, 128, 0.25)',
            }}
          >
            {loading ? <><Spinner /> Signing in…</> : 'Sign in'}
          </button>
        </div>
      </div>
    </CitizenAuthShell>
  );
}
