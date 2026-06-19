"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CitizenAuthShell } from '@/components/auth/citizen/CitizenAuthShell';
import { DarkInput } from '@/components/auth/shared/DarkInput';
import { citizenForgotPassword } from '@/lib/auth-api';

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.75s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40 20" strokeLinecap="round" />
    </svg>
  );
}

export default function CitizenForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const navigate = (to: string) => {
    const map: Record<string, string> = {
      'citizen-login': '/auth/citizen/login',
      'citizen-signup': '/auth/citizen/signup',
      landing: '/landing',
      back: '',
    };
    if (to === 'back') { router.back(); return; }
    router.push(map[to] || '/landing');
  };

  const submit = async () => {
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Valid email is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await citizenForgotPassword(email);
      setSent(true);
    } catch (err: any) {
      toast.error(err.message || 'Could not send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CitizenAuthShell mode="login" navigate={navigate}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => navigate('citizen-login')} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--brand-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
          ← Back to sign in
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 420, width: '100%', margin: '40px auto' }}>
        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📬</div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 500, margin: '0 0 12px' }}>Check your inbox</h2>
            <p style={{ fontSize: 14, color: 'var(--brand-muted)', lineHeight: 1.7, margin: '0 0 24px' }}>
              If <strong>{email}</strong> is registered, you'll receive a reset link shortly. It expires in 60 minutes.
            </p>
            <button onClick={() => navigate('citizen-login')} style={{ background: 'var(--brand-accent)', color: 'var(--brand-ink)', padding: '12px 24px', borderRadius: 6, fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer' }}>
              Back to sign in
            </button>
          </div>
        ) : (
          <>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 500, margin: '0 0 8px' }}>Forgot password?</h2>
            <p style={{ fontSize: 14, color: 'var(--brand-muted)', margin: '0 0 24px', lineHeight: 1.6 }}>
              Enter your email and we'll send you a link to reset your password.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <DarkInput
                label="Email"
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="you@example.com"
                error={error}
                disabled={loading}
              />
              <button
                type="button"
                onClick={submit}
                disabled={loading}
                style={{
                  background: loading ? 'var(--brand-muted)' : 'var(--brand-accent)',
                  color: loading ? 'var(--brand-cream)' : 'var(--brand-ink)',
                  padding: '12px 24px', borderRadius: 6, fontWeight: 600, fontSize: 14,
                  border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all 0.2s ease',
                }}
              >
                {loading ? <><Spinner /> Sending…</> : 'Send reset link'}
              </button>
            </div>
          </>
        )}
      </div>
    </CitizenAuthShell>
  );
}
