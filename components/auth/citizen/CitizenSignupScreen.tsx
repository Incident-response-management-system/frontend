import React, { useState } from 'react';
import { toast } from 'sonner';
import { Icon } from '@/components/irms-shared';
import { CitizenAuthShell } from './CitizenAuthShell';
import { DarkInput } from '../shared/DarkInput';
import { citizenSignup } from '@/lib/auth-api';

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

export function CitizenSignupScreen({ navigate, onAuth }: CitizenAuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) newErrors.email = 'Valid email is required';
    if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (password !== confirm) newErrors.confirm = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await citizenSignup(email, password);
      onAuth({ name: response.user.email.split('@')[0], email: response.user.email });
      toast.success(response.message || 'Account created successfully!');
      navigate('my-reports');
    } catch (err: any) {
      toast.error(err.message || 'Sign-up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearErr = (key: string) => setErrors(p => ({ ...p, [key]: '' }));

  return (
    <CitizenAuthShell mode="signup" navigate={navigate}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => navigate('landing')} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--brand-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
          <Icon.back style={{ width: 16, height: 16 }} /> Back
        </button>
        <div style={{ fontSize: 13, color: 'var(--brand-muted)' }}>
          Have an account? <button onClick={() => navigate('citizen-login')} style={{ color: 'var(--brand-ink)', fontWeight: 600, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>Sign in</button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 420, width: '100%', margin: '40px auto' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 500, margin: '0 0 24px', letterSpacing: '0' }}>Create account</h2>
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
            onChange={e => { setPassword(e.target.value); clearErr('password'); clearErr('confirm'); }}
            placeholder="At least 8 characters"
            error={errors.password}
            disabled={loading}
          />
          <DarkInput
            label="Confirm password"
            type="password"
            value={confirm}
            onChange={e => { setConfirm(e.target.value); clearErr('confirm'); }}
            placeholder="Re-enter password"
            error={errors.confirm}
            disabled={loading}
          />

          {/* Password strength hint */}
          {password.length > 0 && (
            <div style={{ display: 'flex', gap: 4 }}>
              {[...Array(4)].map((_, i) => {
                const strength = Math.min(4, Math.floor(password.length / 3));
                const colors = ['var(--status-red)', 'var(--status-amber)', 'var(--status-amber)', 'var(--status-green)'];
                return (
                  <div key={i} style={{
                    flex: 1, height: 3, borderRadius: 2,
                    background: i < strength ? colors[strength - 1] : 'var(--brand-hairline)',
                    transition: 'background 0.3s',
                  }} />
                );
              })}
            </div>
          )}

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
            {loading ? <><Spinner /> Creating account…</> : 'Create account'}
          </button>
          <p style={{ fontSize: 11, color: 'var(--brand-muted)', margin: '8px 0 0', lineHeight: 1.5 }}>
            By creating an account you agree to the IRMS Terms of Service and confirm that you will only use the platform for genuine incidents.
          </p>
        </div>
      </div>
    </CitizenAuthShell>
  );
}
