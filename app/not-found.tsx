import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--brand-cream)', color: 'var(--brand-ink)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '40px 24px',
    }}>
      {/* IRMS siren mark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <path d="M16 3 L27 9 L27 19 C27 24 22 28.5 16 30 C10 28.5 5 24 5 19 L5 9 Z" stroke="#E84A3F" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="16" cy="15" r="3" fill="#E84A3F" />
          <path d="M16 18 L16 23" stroke="#E84A3F" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span style={{ fontWeight: 800, letterSpacing: '-0.01em', fontSize: 18 }}>IRMS</span>
      </div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 64, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em' }}>404</div>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: '16px 0 8px' }}>Page not found</h1>
      <p style={{ fontSize: 15, color: 'var(--brand-muted)', maxWidth: 420, lineHeight: 1.6, margin: '0 0 28px' }}>
        The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved. Let&rsquo;s get you back on track.
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/" style={{ background: 'var(--brand-ink)', color: 'var(--brand-cream)', padding: '12px 22px', borderRadius: 9, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
          Back to home
        </Link>
        <Link href="/report" style={{ background: 'var(--brand-white)', color: 'var(--brand-ink)', border: '1px solid var(--brand-hairline)', padding: '12px 22px', borderRadius: 9, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
          Report an incident
        </Link>
      </div>
    </div>
  );
}
