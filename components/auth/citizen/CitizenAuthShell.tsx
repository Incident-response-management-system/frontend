import React from 'react';
import { IRMSLogo, Icon } from '@/components/irms-shared';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useIsTablet } from '@/hooks/use-media-query';

interface CitizenAuthShellProps {
    children: React.ReactNode;
    mode?: 'signup' | 'login';
    navigate: (to: string) => void;
}

export function CitizenAuthShell({ children, mode = 'signup', navigate }: CitizenAuthShellProps) {
    const isTablet = useIsTablet();
    return (
        <div className="irms-auth-shell-grid" style={{ minHeight: '100vh', background: 'var(--brand-cream)', color: 'var(--brand-ink)', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            {/* Left: copy panel — warm cream (hidden on mobile via .irms-auth-copy-panel) */}
            <div className="irms-auth-copy-panel" style={{ background: 'var(--brand-surface-alt)', padding: '40px 56px', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--brand-hairline)' }}>
                <button onClick={() => navigate('landing')} aria-label="IRMS home" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, alignSelf: 'flex-start' }}>
                    <IRMSLogo size={16} color="var(--brand-ink)" />
                </button>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 440 }}>
                    <div style={{ fontSize: 11, color: 'var(--brand-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 18 }}>
                        {mode === 'signup' ? 'Citizen account' : 'Sign in'}
                    </div>
                    <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.15, margin: '0 0 16px', color: 'var(--brand-ink)' }}>
                        {mode === 'signup' ? 'Create a citizen account' : 'Sign in to your account'}
                    </h1>
                    <p style={{ fontSize: 15, color: 'var(--brand-muted)', lineHeight: 1.6, margin: '0 0 28px' }}>
                        {mode === 'signup'
                            ? 'Optional. Your reports stay anonymous to the public — an account just lets you view and follow up on everything you have reported in one place.'
                            : 'View your reported incidents, follow their status, and update agencies when something changes on the ground.'}
                    </p>
                    <div style={{ background: 'var(--brand-white)', border: '1px solid var(--brand-hairline)', borderRadius: 10, overflow: 'hidden' }}>
                        {[
                            'See every incident you have reported',
                            'Get notified when status changes',
                            'Add updates to your open reports',
                            'Anonymous reporting still works without an account',
                        ].map((t, i, arr) => (
                            <div key={i} style={{ padding: '12px 16px', borderBottom: i < arr.length - 1 ? '1px solid var(--brand-hairline)' : 'none', display: 'flex', gap: 12, fontSize: 13, color: 'var(--brand-ink)' }}>
                                <span style={{ width: 16, height: 16, borderRadius: '50%', border: '1px solid var(--brand-accent)', flexShrink: 0, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--brand-surface-alt)' }}>
                                    <Icon.check style={{ width: 10, height: 10, color: 'var(--brand-accent)' }} />
                                </span>
                                {t}
                            </div>
                        ))}
                    </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--brand-muted)' }}>
                    Need to report an emergency right now? <button onClick={() => navigate('report')} style={{ color: 'var(--brand-ink)', textDecoration: 'underline', textUnderlineOffset: 3, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>Report without an account</button>
                </div>
            </div>
            {/* Right: form on white */}
            <div className="irms-auth-form-panel" style={{ background: 'var(--brand-white)', padding: '40px 64px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: isTablet ? 'space-between' : 'flex-end', alignItems: 'center', marginBottom: 8 }}>
                    {/* Logo shown here only when the copy panel (and its logo) is hidden */}
                    {isTablet && (
                        <button type="button" aria-label="IRMS home" onClick={() => navigate('landing')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                            <IRMSLogo size={15} color="var(--brand-ink)" />
                        </button>
                    )}
                    <ThemeToggle size={34} />
                </div>
                {children}
            </div>
        </div>
    );
}
