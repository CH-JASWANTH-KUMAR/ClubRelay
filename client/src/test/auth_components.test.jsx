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

function mockDesktopMatchMedia(isDesktop = true, { reducedMotion = false, coarse = false } = {}) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => {
      let matches = false;
      if (query.includes('min-width: 1024px')) matches = isDesktop;
      else if (query.includes('prefers-reduced-motion: reduce')) matches = reducedMotion;
      else if (query.includes('pointer: coarse')) matches = coarse;
      return {
        matches,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      };
    },
  });
}

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
    mockDesktopMatchMedia(true);
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
    mockDesktopMatchMedia(false);
  });

  describe('Split-Screen Sign In & Create Account Experience', () => {
    it('renders desktop split-screen layout with single large mascot, chips, tabs, clean inputs, and no demo personas', async () => {
      renderLogin();

      // Dynamic heading & subtext for Sign in
      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
      expect(screen.getByText(/sign in to your club workspace\./i)).toBeInTheDocument();
      expect(screen.getByText(/forgot password\? coming soon/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /back to overview/i })).toBeInTheDocument();

      // Single mascot rendered (desktop stage, 340px)
      const mascots = screen.getAllByTestId('relay-mascot');
      expect(mascots).toHaveLength(1);
      expect(mascots[0]).toHaveAttribute('aria-hidden', 'true');
      expect(mascots[0].style.width).toBe('340px');

      // Right stage panel & floating chips
      const stage = screen.getByTestId('auth-stage-panel');
      expect(stage).toBeInTheDocument();
      expect(stage).toHaveTextContent('Events');
      expect(stage).toHaveTextContent('Handover');
      expect(stage).toHaveTextContent('Playbooks');
      expect(stage).toHaveTextContent('Contacts');
      expect(stage).toHaveTextContent('Build the club. Keep the momentum.');

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

    it('renders mobile single-column layout with a single 96px mascot and omits the desktop stage panel', () => {
      mockDesktopMatchMedia(false);
      renderLogin();

      expect(screen.queryByTestId('auth-stage-panel')).not.toBeInTheDocument();
      const mascots = screen.getAllByTestId('relay-mascot');
      expect(mascots).toHaveLength(1);
      expect(mascots[0].style.width).toBe('96px');
      expect(screen.getByTestId('mascot-speech-bubble')).toHaveTextContent(
        "Hi! Let's get your club started."
      );
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

    it('supports tab switching via click and keyboard arrow keys and updates headings', () => {
      renderLogin();

      const signInTab = screen.getByRole('tab', { name: /sign in/i });
      const createTab = screen.getByRole('tab', { name: /create account/i });

      fireEvent.keyDown(signInTab, { key: 'ArrowRight' });
      expect(createTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument();
      expect(screen.getByText(/use your university email to get started\./i)).toBeInTheDocument();
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();

      fireEvent.keyDown(createTab, { key: 'ArrowLeft' });
      expect(signInTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
      expect(screen.queryByLabelText(/full name/i)).not.toBeInTheDocument();
    });

    it('updates speech bubble text and mascot pose across idle, email focus, password focus, peek, and error states', () => {
      renderLogin();

      const bubble = screen.getByTestId('mascot-speech-bubble');
      const mascot = screen.getByTestId('relay-mascot');
      const emailInput = screen.getByLabelText(/university email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const toggleBtn = screen.getByRole('button', { name: /show password/i });

      // Idle
      expect(bubble).toHaveTextContent("Hi! Let's get your club started.");
      expect(bubble).toHaveAttribute('aria-live', 'off');
      expect(mascot).toHaveAttribute('data-pose', 'idle');

      // Email focused
      fireEvent.focus(emailInput);
      expect(bubble).toHaveTextContent('Got it, a university email.');
      expect(mascot).toHaveAttribute('data-pose', 'focus-text');

      // Password focused (eyes covered)
      expect(passwordInput).toHaveAttribute('type', 'password');
      fireEvent.focus(passwordInput);
      expect(bubble).toHaveTextContent('Not looking, promise.');
      expect(mascot).toHaveAttribute('data-pose', 'password');

      // Show password toggled on (peeking)
      fireEvent.click(toggleBtn);
      expect(passwordInput).toHaveAttribute('type', 'text');
      expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument();
      expect(bubble).toHaveTextContent('Okay, just a peek.');
      expect(mascot).toHaveAttribute('data-pose', 'peek');
    });

    it('displays OAuth error banner when error query parameter is present', () => {
      renderLogin({ initialEntries: ['/login?error=invalid_state'] });

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent(/session state expired or invalid/i);
    });

    it('shows login error once inline with error bubble text and without firing a duplicate error toast', async () => {
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
        expect(screen.getByTestId('mascot-speech-bubble')).toHaveTextContent(
          'Hmm, that did not match. Try again.'
        );
      });

      expect(mockAddToast).not.toHaveBeenCalledWith(expect.anything(), 'error');
    });

    it('calls login with normalized email and typed credentials on Sign in and updates bubble to Welcome back!', async () => {
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
        expect(screen.getByTestId('mascot-speech-bubble')).toHaveTextContent('Welcome back!');
      });
    });

    it('resolves campus domain on Create account, validates strength & match, disables submit until valid, and moves to Sign in with email prefilled on success', async () => {
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

      fireEvent.click(screen.getByRole('tab', { name: /create account/i }));

      const submitBtn = screen.getByRole('button', { name: /create account/i });
      expect(submitBtn).toBeDisabled();

      // 4-segment strength meter present
      const meter = screen.getByTestId('password-strength-meter');
      expect(meter.children).toHaveLength(4);

      // Fill name, unknown email -> fails resolve
      fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Alex Rivera' } });
      fireEvent.change(screen.getByLabelText(/university email/i), { target: { value: 'alex@unknown.edu' } });
      fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'StrongPass123!' } });
      fireEvent.change(screen.getByLabelText(/^confirm password$/i), { target: { value: 'StrongPass123!' } });

      expect(screen.getByText('Passwords match')).toBeInTheDocument();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(450);
      });

      expect(
        screen.getByText(
          'Your campus is not on ClubRelay yet. Ask your club lead to get your campus set up.'
        )
      ).toBeInTheDocument();
      expect(submitBtn).toBeDisabled();

      // Switch to recognized campus domain
      fireEvent.change(screen.getByLabelText(/university email/i), { target: { value: 'Alex.Rivera@State.edu' } });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(450);
      });

      expect(screen.getByText('State University')).toBeInTheDocument();
      expect(submitBtn).not.toBeDisabled();

      await act(async () => {
        fireEvent.click(submitBtn);
      });

      expect(mockRegister).toHaveBeenCalledWith({
        fullName: 'Alex Rivera',
        email: 'alex.rivera@state.edu',
        password: 'StrongPass123!',
      });
      expect(mockLogin).not.toHaveBeenCalled();

      // Moved back to Sign in with status banner, speech bubble, and email prefilled
      expect(screen.getByRole('status')).toHaveTextContent('Account created. Sign in to continue.');
      expect(screen.getByTestId('mascot-speech-bubble')).toHaveTextContent(
        'Account created. Sign in to continue.'
      );
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
