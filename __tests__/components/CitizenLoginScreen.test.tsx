import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CitizenLoginScreen } from '@/components/auth/citizen/CitizenLoginScreen';
import { citizenLogin } from '@/lib/auth-api';
import { toast } from 'sonner';

vi.mock('@/lib/auth-api', () => ({
  citizenLogin: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/components/irms-shared', () => ({
  Icon: {
    back: () => <span data-testid="icon-back" />,
    eye: () => <span data-testid="icon-eye" />,
    eyeOff: () => <span data-testid="icon-eye-off" />,
    check: () => <span data-testid="icon-check" />,
    close: () => <span data-testid="icon-close" />,
  },
  IRMSLogo: () => <div data-testid="irms-logo" />,
  IRMSMark: () => <div data-testid="irms-mark" />,
}));

vi.mock('@/components/auth/citizen/CitizenAuthShell', () => ({
  CitizenAuthShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/auth/shared/DarkInput', () => ({
  DarkInput: ({ label, type, value, onChange, placeholder, error, disabled }: any) => (
    <div>
      <label>{label}</label>
      <input
        aria-label={label}
        type={type || 'text'}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        data-error={error || ''}
      />
      {error && <span role="alert">{error}</span>}
    </div>
  ),
}));

function setup() {
  const navigate = vi.fn();
  const onAuth = vi.fn();
  render(<CitizenLoginScreen navigate={navigate} onAuth={onAuth} />);
  return { navigate, onAuth };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CitizenLoginScreen', () => {
  it('renders email and password inputs', () => {
    setup();
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('validation: empty email shows error when Sign in clicked', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    const alerts = screen.getAllByRole('alert');
    expect(alerts.some(a => /valid email/i.test(a.textContent ?? ''))).toBe(true);
  });

  it('validation: invalid email format shows error', async () => {
    const user = userEvent.setup();
    setup();
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'notanemail');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    const alerts = screen.getAllByRole('alert');
    expect(alerts.some(a => /valid email/i.test(a.textContent ?? ''))).toBe(true);
  });

  it('validation: missing password shows error', async () => {
    const user = userEvent.setup();
    setup();
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    const alerts = screen.getAllByRole('alert');
    expect(alerts.some(a => /password is required/i.test(a.textContent ?? ''))).toBe(true);
  });

  it('successful login calls citizenLogin, onAuth, navigate, and toast.success', async () => {
    const user = userEvent.setup();
    vi.mocked(citizenLogin).mockResolvedValue({ user: { email: 'a@b.com' } } as any);
    const { navigate, onAuth } = setup();

    await user.type(screen.getByRole('textbox', { name: /email/i }), 'a@b.com');
    await user.type(screen.getByLabelText(/password/i), 'mypassword');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(citizenLogin).toHaveBeenCalledWith('a@b.com', 'mypassword');
      expect(onAuth).toHaveBeenCalledWith({ name: 'a', email: 'a@b.com' });
      expect(navigate).toHaveBeenCalledWith('my-reports');
      expect(toast.success).toHaveBeenCalledWith('Welcome back!');
    });
  });

  it('failed login shows toast.error and does not call navigate', async () => {
    const user = userEvent.setup();
    vi.mocked(citizenLogin).mockRejectedValue(new Error('Invalid credentials.'));
    const { navigate } = setup();

    await user.type(screen.getByRole('textbox', { name: /email/i }), 'a@b.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid credentials.');
    });
    expect(navigate).not.toHaveBeenCalled();
  });

  it('loading state: Sign in button is disabled while citizenLogin is pending', async () => {
    const user = userEvent.setup();
    let resolve!: (v: any) => void;
    vi.mocked(citizenLogin).mockReturnValue(new Promise(r => { resolve = r; }));
    setup();

    await user.type(screen.getByRole('textbox', { name: /email/i }), 'a@b.com');
    await user.type(screen.getByLabelText(/password/i), 'mypassword');

    const btn = screen.getByRole('button', { name: /sign in/i });
    await user.click(btn);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
    });

    resolve({ user: { email: 'a@b.com' } });
  });

  it('navigate to signup when "Create account" is clicked', async () => {
    const user = userEvent.setup();
    const { navigate } = setup();
    await user.click(screen.getByRole('button', { name: /create account/i }));
    expect(navigate).toHaveBeenCalledWith('citizen-signup');
  });

  it('navigate back when Back button is clicked', async () => {
    const user = userEvent.setup();
    const { navigate } = setup();
    await user.click(screen.getByRole('button', { name: /back/i }));
    expect(navigate).toHaveBeenCalledWith('landing');
  });

  it('navigate to forgot password when "Forgot password?" is clicked', async () => {
    const user = userEvent.setup();
    const { navigate } = setup();
    await user.click(screen.getByRole('button', { name: /forgot password/i }));
    expect(navigate).toHaveBeenCalledWith('citizen-forgot');
  });
});
