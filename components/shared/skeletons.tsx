import React from 'react';

// ─── Skeleton primitives ─────────────────────────────────────

/** A single shimmering block. Width/height default to 100% × 16px. */
export function Skeleton({ width, height, radius, style }: {
  width?: string | number;
  height?: string | number;
  radius?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="skeleton"
      style={{
        width: width ?? '100%',
        height: height ?? 16,
        borderRadius: radius ?? 6,
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

/** Skeleton that mimics a single report-list row (citizen My Reports). */
export function ReportRowSkeleton() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '18px 24px', borderBottom: '1px solid var(--brand-hairline)',
    }}>
      <Skeleton width={36} height={36} radius={10} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Skeleton width={90} height={13} />
          <Skeleton width={60} height={13} />
        </div>
        <Skeleton width="55%" height={12} />
      </div>
      <Skeleton width={72} height={24} radius={20} style={{ flexShrink: 0 }} />
    </div>
  );
}

/** Skeleton that mimics a table row in the agency incidents table. */
export function TableRowSkeleton({ cols = 6 }: { cols?: number }) {
  const widths = ['10%', '14%', '22%', '12%', '14%', '10%'];
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '14px 24px', borderBottom: '1px solid var(--brand-hairline)' }}>
          <Skeleton width={widths[i] ?? '80%'} height={13} />
        </td>
      ))}
    </tr>
  );
}

/** Skeleton for the location detail block while reverse-geocoding runs. */
export function LocationDetailSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Skeleton width="70%" height={20} radius={8} />
      <Skeleton width="45%" height={13} />
      <Skeleton width="30%" height={12} />
    </div>
  );
}

/** Skeleton row for a nearby-places list item. */
export function PlaceRowSkeleton() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px', borderBottom: '1px solid var(--brand-hairline)',
    }}>
      <Skeleton width={32} height={32} radius={8} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Skeleton width="60%" height={13} />
        <Skeleton width="40%" height={11} />
      </div>
    </div>
  );
}

/** Full-page skeleton for the map / report screen while the JS bundle loads. */
export function ReportScreenSkeleton() {
  return (
    <div style={{ background: 'var(--brand-cream)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Nav bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', borderBottom: '1px solid var(--brand-hairline)',
        flexShrink: 0,
      }}>
        <Skeleton width={80} height={22} radius={8} />
        <div style={{ display: 'flex', gap: 8 }}>
          <Skeleton width={90} height={32} radius={8} />
          <Skeleton width={32} height={32} radius={8} />
        </div>
      </div>
      {/* Map area */}
      <div className="skeleton" style={{ flex: 1, minHeight: '100vh', borderRadius: 0 }} />
    </div>
  );
}

/** Full-page skeleton for the agency dashboard while the JS bundle loads. */
export function AgencyDashboardSkeleton() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--brand-cream)' }}>
      {/* Sidebar */}
      <div style={{
        width: 248, flexShrink: 0,
        background: 'var(--brand-white)', borderRight: '1px solid var(--brand-hairline)',
        display: 'flex', flexDirection: 'column', padding: '20px 20px', gap: 8,
      }}>
        <Skeleton width={120} height={28} radius={8} style={{ marginBottom: 24 }} />
        {[0, 1, 2, 3].map(i => (
          <Skeleton key={i} width="100%" height={40} radius={10} />
        ))}
        <div style={{ marginTop: 'auto' }}>
          <Skeleton width="100%" height={56} radius={12} />
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '32px 32px', display: 'flex', flexDirection: 'column', gap: 24, overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton width={180} height={28} radius={8} />
          <Skeleton width={100} height={36} radius={8} />
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{ background: 'var(--brand-white)', border: '1px solid var(--brand-hairline)', borderRadius: 12, padding: '20px 20px' }}>
              <Skeleton width="50%" height={11} style={{ marginBottom: 12 }} />
              <Skeleton width="40%" height={28} radius={6} />
            </div>
          ))}
        </div>

        {/* Table card */}
        <div style={{ background: 'var(--brand-white)', border: '1px solid var(--brand-hairline)', borderRadius: 12, overflow: 'hidden', flex: 1 }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--brand-hairline)', display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton width={160} height={18} radius={6} />
            <Skeleton width={120} height={32} radius={8} />
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {[0, 1, 2, 3, 4, 5].map(i => <TableRowSkeleton key={i} cols={6} />)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/** Full-page skeleton for the Track screen while the incident loads. */
export function TrackScreenSkeleton() {
  return (
    <div style={{ background: 'var(--brand-cream)', minHeight: '100vh' }}>
      {/* Nav bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 32px', borderBottom: '1px solid var(--brand-hairline)',
      }}>
        <Skeleton width={90} height={22} radius={8} />
        <div style={{ display: 'flex', gap: 8 }}>
          <Skeleton width={90} height={32} radius={8} />
          <Skeleton width={70} height={32} radius={8} />
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '60px 32px 80px' }}>
        {/* Reference */}
        <div style={{ marginBottom: 40 }}>
          <Skeleton width={120} height={11} style={{ marginBottom: 12 }} />
          <Skeleton width={200} height={32} radius={8} style={{ marginBottom: 6 }} />
          <Skeleton width={160} height={13} />
        </div>

        {/* Status stepper */}
        <div style={{ background: 'var(--brand-white)', border: '1px solid var(--brand-hairline)', borderRadius: 12, padding: '28px 32px', marginBottom: 24 }}>
          <Skeleton width={100} height={11} style={{ marginBottom: 24 }} />
          <div style={{ display: 'flex', gap: 0, width: '100%', justifyContent: 'space-between' }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: 8 }}>
                <Skeleton width={28} height={28} radius={14} />
                <Skeleton width={56} height={11} />
              </div>
            ))}
          </div>
        </div>

        {/* Incident info card */}
        <div style={{ background: 'var(--brand-white)', border: '1px solid var(--brand-hairline)', borderRadius: 12, padding: '24px 32px', marginBottom: 24 }}>
          <Skeleton width={100} height={11} style={{ marginBottom: 20 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Skeleton width="28%" height={13} />
                <Skeleton width="52%" height={13} />
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div style={{ background: 'var(--brand-white)', border: '1px solid var(--brand-hairline)', borderRadius: 12, padding: '24px 32px' }}>
          <Skeleton width={80} height={11} style={{ marginBottom: 24 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ display: 'flex', gap: 16 }}>
                <Skeleton width={10} height={10} radius={5} style={{ marginTop: 3, flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Skeleton width="40%" height={13} />
                  <Skeleton width="65%" height={11} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
