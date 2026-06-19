import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AgencyLoginScreen } from '@/components/irms-auth';
import { agencyLogin, EmailNotVerifiedError } from '@/lib/auth-api';
import { toast } from 'sonner';

vi.mock('@/lib/auth-api', () => ({
  agencyLogin: vi.fn(),
  agencySignup: vi.fn(),
  agencyVerifyEmail: vi.fn(),
  agencyResendOtp: vi.fn(() => Promise.resolve()),
  agencyForgotPassword: vi.fn(),
  agencyResetPassword: vi.fn(),
  EmailNotVerifiedError: class EmailNotVerifiedError extends Error {
    email: string;
    constructor(email: string, message = 'Please verify your email to continue.') {
      super(message);
      this.name = 'EmailNotVerifiedError';
      this.email = email;
    }
  },
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), message: vi.fn() },
}));

vi.mock('@/hooks/use-media-query', () => ({
  useIsMobile: () => false,
  useIsTablet: () => false,
}));

vi.mock('@/lib/geo-constants', () => ({
  clampToPilotArea: (lat: number, lng: number) => ({ lat, lng }),
  PILOT_AREA: { minLat: 0, maxLat: 90, minLng: 0, maxLng: 90 },
}));

vi.mock('@/components/irms-shared', () => ({
  Icon: {
    back: () => <span data-testid="icon-back" />,
    eye: () => <span data-testid="icon-eye" />,
    eyeOff: () => <span data-testid="icon-eye-off" />,
    check: () => <span data-testid="icon-check" />,
    close: () => <span data-testid="icon-close" />,
    logout: () => <span />,
    grid: () => <span />,
    map: () => <span />,
    list: () => <span />,
    settings: () => <span />,
    bell: () => <span />,
    chev: () => <span />,
    pin: () => <span />,
  },
  IRMSLogo: () => <div data-testid="irms-logo" />,
  IRMSMark: () => <div data-testid="irms-mark" />,
}));

vi.mock('@/components/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}));

function setup() {
  const navigate = vi.fn();
  render(<AgencyLoginScreen navigate={navigate} />);
  return { navigate };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AgencyLoginScreen', () => {
  it('renders email and password inputs', () => {
    setup();
    expect(screen.getByPlaceholderText('you@agency.org')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('validation: empty form shows errors for email and password', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole('button', { name: /sign in to dashboard/i }));
    await waitFor(() => {
      expect(screen.getByText(/valid email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('validation: invalid email shows email error', async () => {
    const user = userEvent.setup();
    setup();
    await user.type(screen.getByPlaceholderText('you@agency.org'), 'invalid-email');
    await user.click(screen.getByRole('button', { name: /sign in to dashboard/i }));
    await waitFor(() => {
      expect(screen.getByText(/valid email is required/i)).toBeInTheDocument();
    });
  });

  it('successful agency login calls agencyLogin, navigate, and toast.success', async () => {
    const user = userEvent.setup();
    vi.mocked(agencyLogin).mockResolvedValue({
      agencyName: 'Test PD',
      agencyType: 'police',
      email: 'pd@test.com',
      id: 'a1',
      radius: 10,
      token: 'tok',
    } as any);
    const { navigate } = setup();

    await user.type(screen.getByPlaceholderText('you@agency.org'), 'pd@test.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'securepass');
    await user.click(screen.getByRole('button', { name: /sign in to dashboard/i }));

    await waitFor(() => {
      expect(agencyLogin).toHaveBeenCalledWith('pd@test.com', 'securepass');
      expect(navigate).toHaveBeenCalledWith('agency-dashboard');
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Test PD'));
    });
  });

  it('failed login calls toast.error and does not call navigate', async () => {
    const user = userEvent.setup();
    vi.mocked(agencyLogin).mockRejectedValue(new Error('Invalid credentials.'));
    const { navigate } = setup();

    await user.type(screen.getByPlaceholderText('you@agency.org'), 'pd@test.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'wrongpass');
    await user.click(screen.getByRole('button', { name: /sign in to dashboard/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid credentials.');
    });
    expect(navigate).not.toHaveBeenCalled();
  });

  it('email not verified: shows OTP verify screen and calls toast.message', async () => {
    const user = userEvent.setup();
    vi.mocked(agencyLogin).mockRejectedValue(new EmailNotVerifiedError('pd@test.com'));
    const { navigate } = setup();

    await user.type(screen.getByPlaceholderText('you@agency.org'), 'pd@test.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'somepass');
    await user.click(screen.getByRole('button', { name: /sign in to dashboard/i }));

    await waitFor(() => {
      expect(toast.message).toHaveBeenCalled();
    });
    expect(navigate).not.toHaveBeenCalledWith('agency-dashboard');
    expect(screen.getByText(/verify your email/i)).toBeInTheDocument();
  });

  it('navigate to signup when "Register here" is clicked', async () => {
    const user = userEvent.setup();
    const { navigate } = setup();
    await user.click(screen.getByRole('button', { name: /register here/i }));
    expect(navigate).toHaveBeenCalledWith('agency-signup');
  });

  it('navigate to forgot password when "Forgot password?" is clicked', async () => {
    const user = userEvent.setup();
    const { navigate } = setup();
    await user.click(screen.getByRole('button', { name: /forgot password/i }));
    expect(navigate).toHaveBeenCalledWith('agency-forgot');
  });
});
