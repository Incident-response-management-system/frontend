import React from 'react';
import { Icon } from '@/components/irms-shared';

interface DarkInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

export function DarkInput({ label, type = 'text', value, onChange, placeholder, error, disabled }: DarkInputProps) {
  const [show, setShow] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const isPassword = type === 'password';
  
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--brand-ink)', marginBottom: 6 }}>{label}</label>
      <div style={{
        display: 'flex', alignItems: 'center',
        background: disabled ? 'var(--brand-cream)' : 'var(--brand-white)',
        border: `1px solid ${error ? 'var(--status-red)' : focused ? 'var(--brand-ink)' : 'var(--brand-hairline)'}`,
        borderRadius: 8, padding: '0 12px',
        boxShadow: focused ? (error ? '0 0 0 3px rgba(220, 38, 38, 0.1)' : '0 0 0 3px rgba(20, 19, 13, 0.06)') : '0 1px 2px rgba(40, 35, 20, 0.04)',
        transition: 'all 0.15s',
        opacity: disabled ? 0.6 : 1,
      }}>
        <input
          type={isPassword && !show ? 'password' : 'text'}
          value={value} onChange={onChange} placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            padding: '11px 0', fontSize: 14, color: 'var(--brand-ink)', fontFamily: 'inherit',
            cursor: disabled ? 'not-allowed' : 'text',
          }}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(!show)} disabled={disabled} style={{ color: 'var(--brand-muted)', padding: 4, background: 'none', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer' }}>
            {show ? <Icon.eyeOff /> : <Icon.eye />}
          </button>
        )}
      </div>
      {error && <div style={{ fontSize: 12, color: 'var(--status-red)', marginTop: 4, fontWeight: 500 }}>{error}</div>}
    </div>
  );
}
