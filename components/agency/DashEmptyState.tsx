import React from 'react';

export function DashEmptyState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--brand-muted)', fontSize: 14 }}>
      <div>{message}</div>
      {onRetry && (
        <button type="button" onClick={onRetry} style={{
          marginTop: 14, padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
          color: 'var(--brand-ink)', background: 'var(--brand-surface-alt)', border: '1px solid var(--brand-divider)', cursor: 'pointer',
        }}>Retry</button>
      )}
    </div>
  );
}
