import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Login } from '../pages/Login';
import { DragCards } from '../components/marketing/DragCards';
import { SplitText } from '../components/ui/SplitText';
import { Magnet } from '../components/ui/Magnet';
import { AnimatedContent } from '../components/ui/AnimatedContent';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';

function renderLogin({
  initialEntries = ['/login'],
  login = vi.fn(),
  register = vi.fn(),
  addToast = vi.fn(),
  user = null,
} = {}) {
  return render(
    <AuthContext.Provider value={{ login, register, user, loading: false }}>
      <ToastContext.Provider value={{ addToast }}>
        <MemoryRouter initialEntries={initialEntries}>
          <Login />
        </MemoryRouter>
      </ToastContext.Provider>
    </AuthContext.Provider>
  );
}

describe('Phase 2 UI Components & Auth Experience', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            google: { enabled: false },
            github: { enabled: false },
          },
        }),
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  describe('Combined Sign In & Create Account Experience', () => {
    it('renders soft canvas auth page with mascot, tabs, clean inputs, no demo personas, and hides disabled OAuth buttons', async () => {
      renderLogin();

      expect(screen.getByRole('heading', { name: /clubrelay/i })).toBeInTheDocument();
      expect(screen.getByText(/build the club\. keep the momentum\./i)).toBeInTheDocument();
      expect(screen.getByTestId('relay-mascot')).toHaveAttribute('aria-hidden', 'true');

      // Tablist & tabs
      const tablist = screen.getByRole('tablist', { name: /authentication mode/i });
      expect(tablist).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /sign in/i })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('tab', { name: /create account/i })).toHaveAttribute('aria-selected', 'false');

      // Inputs start empty
      expect(screen.getByLabelText(/university email/i).value).toBe('');
      expect(screen.getByLabelText(/^password$/i).value).toBe('');

      // Providers default disabled -> hidden, and divider hidden
      await waitFor(() => {
        expect(screen.queryByText(/continue with google/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/continue with github/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/or institutional credentials/i)).not.toBeInTheDocument();
      });

      // Demo personas strictly absent
      expect(screen.queryByText(/instant demo logins/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/sarah \(gdg\)/i)).not.toBeInTheDocument();
    });

    it('renders OAuth buttons and divider only when providers are enabled', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              google: { enabled: true },
              github: { enabled: false },
            },
          }),
        })
      );

      renderLogin();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
        expect(screen.getByText(/or institutional credentials/i)).toBeInTheDocument();
      });
      expect(screen.queryByRole('button', { name: /continue with github/i })).not.toBeInTheDocument();
    });

    it('supports tab switching via click and keyboard arrow keys', () => {
      renderLogin();

      const signInTab = screen.getByRole('tab', { name: /sign in/i });
      const createTab = screen.getByRole('tab', { name: /create account/i });

      fireEvent.keyDown(signInTab, { key: 'ArrowRight' });
      expect(createTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();

      fireEvent.keyDown(createTab, { key: 'ArrowLeft' });
      expect(signInTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.queryByLabelText(/full name/i)).not.toBeInTheDocument();
    });

    it('toggles password visibility and updates mascot pose from password to peek', () => {
      renderLogin();

      const passwordInput = screen.getByLabelText(/^password$/i);
      const toggleBtn = screen.getByRole('button', { name: /show password/i });
      const mascot = screen.getByTestId('relay-mascot');

      expect(passwordInput).toHaveAttribute('type', 'password');
      fireEvent.focus(passwordInput);
      expect(mascot).toHaveAttribute('data-pose', 'password');

      fireEvent.click(toggleBtn);
      expect(passwordInput).toHaveAttribute('type', 'text');
      expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument();
      expect(mascot).toHaveAttribute('data-pose', 'peek');
    });

    it('displays OAuth error banner when error query parameter is present', () => {
      renderLogin({ initialEntries: ['/login?error=invalid_state'] });

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent(/session state expired or invalid/i);
    });

    it('shows login error once inline without firing a duplicate error toast', async () => {
      const mockLogin = vi.fn().mockRejectedValue(new Error('Invalid email or password.'));
      const mockAddToast = vi.fn();

      renderLogin({ login: mockLogin, addToast: mockAddToast });

      fireEvent.change(screen.getByLabelText(/university email/i), {
        target: { value: 'student@state.edu' },
      });
      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: 'WrongPass123!' },
      });
      fireEvent.click(screen.getByRole('button', { name: /sign in to workspace/i }));

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toHaveTextContent('Invalid email or password.');
        expect(screen.getByTestId('relay-mascot')).toHaveAttribute('data-mood', 'error');
      });

      expect(mockAddToast).not.toHaveBeenCalledWith(expect.anything(), 'error');
    });

    it('calls login with normalized email and typed credentials on Sign in', async () => {
      const mockLogin = vi.fn().mockResolvedValue({
        fullName: 'Jordan Builder',
        campusRole: 'STUDENT',
        memberships: [],
      });

      renderLogin({ login: mockLogin });

      fireEvent.change(screen.getByLabelText(/university email/i), {
        target: { value: 'Jordan@PCU.EDU' },
      });
      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: 'Secret123!' },
      });
      fireEvent.click(screen.getByRole('button', { name: /sign in to workspace/i }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('jordan@pcu.edu', 'Secret123!');
      });
    });

    it('resolves campus domain on Create account, disables submit until valid, and moves to Sign in with email prefilled on success', async () => {
      vi.useFakeTimers();

      const fetchMock = vi.fn(async (url) => {
        if (String(url).includes('/api/v1/auth/providers')) {
          return {
            ok: true,
            json: async () => ({
              success: true,
              data: { google: { enabled: false }, github: { enabled: false } },
            }),
          };
        }
        if (String(url).includes('/api/v1/campuses/resolve?domain=unknown.edu')) {
          return {
            ok: false,
            status: 404,
            json: async () => ({
              success: false,
              error: { code: 'CAMPUS_NOT_FOUND', message: 'Not found' },
            }),
          };
        }
        if (String(url).includes('/api/v1/campuses/resolve?domain=state.edu')) {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              success: true,
              data: { campus: { id: 'campus-1', name: 'State University' } },
            }),
          };
        }
        return { ok: false, json: async () => ({}) };
      });
      vi.stubGlobal('fetch', fetchMock);

      const mockLogin = vi.fn();
      const mockRegister = vi.fn().mockResolvedValue({
        success: true,
        message: 'Account created. Sign in to continue.',
      });

      renderLogin({ login: mockLogin, register: mockRegister });

      // Switch to Create account tab
      fireEvent.click(screen.getByRole('tab', { name: /create account/i }));

      const submitBtn = screen.getByRole('button', { name: /create account/i });
      expect(submitBtn).toBeDisabled();

      // Fill name, unknown email -> fails resolve
      fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Alex Rivera' } });
      fireEvent.change(screen.getByLabelText(/university email/i), { target: { value: 'alex@unknown.edu' } });
      fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'StrongPass123!' } });
      fireEvent.change(screen.getByLabelText(/^confirm password$/i), { target: { value: 'StrongPass123!' } });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(450);
      });

      expect(screen.getByText(/your campus is not on clubrelay yet/i)).toBeInTheDocument();
      expect(submitBtn).toBeDisabled();

      // Switch to recognized campus domain
      fireEvent.change(screen.getByLabelText(/university email/i), { target: { value: 'Alex.Rivera@State.edu' } });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(450);
      });

      expect(screen.getByText('State University')).toBeInTheDocument();
      expect(submitBtn).not.toBeDisabled();

      // Submit Create account
      await act(async () => {
        fireEvent.click(submitBtn);
      });

      expect(mockRegister).toHaveBeenCalledWith({
        fullName: 'Alex Rivera',
        email: 'alex.rivera@state.edu',
        password: 'StrongPass123!',
      });
      expect(mockLogin).not.toHaveBeenCalled();

      // Moved back to Sign in with status banner and email prefilled
      expect(screen.getByRole('status')).toHaveTextContent('Account created. Sign in to continue.');
      expect(screen.getByRole('tab', { name: /sign in/i })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByLabelText(/university email/i).value).toBe('alex.rivera@state.edu');
    });
  });

  describe('DragCards Component', () => {
    it('renders all four pillars and switcher tabs', () => {
      render(<DragCards />);

      expect(
        screen.getByRole('heading', { name: /the four pillars of high-performing clubs/i })
      ).toBeInTheDocument();

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(4);
      expect(tabs.map((t) => t.textContent)).toEqual([
        'Community',
        'Operations',
        'Engineering',
        'Continuity',
      ]);

      fireEvent.click(tabs[0]);
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    });

    it('resets card positions when clicking reset', () => {
      render(<DragCards />);
      const resetButton = screen.getByRole('button', { name: /reset positions/i });
      expect(resetButton).toBeInTheDocument();
      fireEvent.click(resetButton);
    });
  });

  describe('React Bits Animation Wrappers', () => {
    it('SplitText renders each word cleanly', () => {
      render(<SplitText text="Build the club" />);
      expect(screen.getByText('Build')).toBeInTheDocument();
      expect(screen.getByText('the')).toBeInTheDocument();
      expect(screen.getByText('club')).toBeInTheDocument();
    });

    it('Magnet renders wrapped action elements', () => {
      render(
        <Magnet>
          <button type="button">Magnetic CTA</button>
        </Magnet>
      );
      expect(screen.getByRole('button', { name: /magnetic cta/i })).toBeInTheDocument();
    });

    it('AnimatedContent renders child nodes', () => {
      render(
        <AnimatedContent>
          <div data-testid="animated-child">Revealed Content</div>
        </AnimatedContent>
      );
      expect(screen.getByTestId('animated-child')).toBeInTheDocument();
    });
  });
});
