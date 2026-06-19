"use client";

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { CitizenAuthShell } from '@/components/auth/citizen/CitizenAuthShell';
import { DarkInput } from '@/components/auth/shared/DarkInput';
import { citizenResetPassword } from '@/lib/auth-api';

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.75s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40 20" strokeLinecap="round" />
    </svg>
  );
}

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const navigate = (to: string) => {
    if (to === 'citizen-login') { router.push('/auth/citizen/login'); return; }
    router.push('/landing');
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!token) e.token = 'Invalid or missing reset link. Please request a new one.';
    if (password.length < 8) e.password = 'Password must be at least 8 characters';
    if (password !== confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await citizenResetPassword(token, password);
      setDone(true);
    } catch (err: any) {
      toast.error(err.message || 'Could not reset your password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CitizenAuthShell mode="login" navigate={navigate}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 420, width: '100%', margin: '40px auto' }}>
        {done ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 500, margin: '0 0 12px' }}>Password updated</h2>
            <p style={{ fontSize: 14, color: 'var(--brand-muted)', margin: '0 0 24px', lineHeight: 1.7 }}>
              Your password has been reset successfully. You can now sign in with your new password.
            </p>
            <button onClick={() => navigate('citizen-login')} style={{ background: 'var(--brand-accent)', color: 'var(--brand-ink)', padding: '12px 24px', borderRadius: 6, fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer' }}>
              Sign in
            </button>
          </div>
        ) : (
          <>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 500, margin: '0 0 8px' }}>Reset password</h2>
            <p style={{ fontSize: 14, color: 'var(--brand-muted)', margin: '0 0 24px', lineHeight: 1.6 }}>
              Choose a new password for your account.
            </p>
            {errors.token && (
              <p style={{ fontSize: 13, color: 'var(--status-red)', margin: '0 0 16px', padding: '10px 14px', background: 'rgba(220,38,38,0.08)', borderRadius: 6, border: '1px solid rgba(220,38,38,0.2)' }}>
                {errors.token}
              </p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <DarkInput
                label="New password"
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
                placeholder="••••••••"
                error={errors.password}
                disabled={loading}
              />
              <DarkInput
                label="Confirm password"
                type="password"
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setErrors(p => ({ ...p, confirm: '' })); }}
                placeholder="••••••••"
                error={errors.confirm}
                disabled={loading}
              />
              <button
                type="button"
                onClick={submit}
                disabled={loading || !token}
                style={{
                  background: loading ? 'var(--brand-muted)' : 'var(--brand-accent)',
                  color: loading ? 'var(--brand-cream)' : 'var(--brand-ink)',
                  padding: '12px 24px', borderRadius: 6, fontWeight: 600, fontSize: 14,
                  border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all 0.2s ease',
                }}
              >
                {loading ? <><Spinner /> Resetting…</> : 'Set new password'}
              </button>
            </div>
          </>
        )}
      </div>
    </CitizenAuthShell>
  );
}

export default function CitizenResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
