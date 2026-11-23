import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Login } from '../pages/Login';
import { DragCards } from '../components/marketing/DragCards';
import { SplitText } from '../components/ui/SplitText';
import { Magnet } from '../components/ui/Magnet';
import { AnimatedContent } from '../components/ui/AnimatedContent';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';

describe('Phase 2 UI Components & Auth Experience', () => {
  describe('Login Component (Dark Grid Auth & Social Logins)', () => {
    it('renders login page with clean empty inputs and no demo persona buttons', () => {
      const mockLogin = vi.fn();
      const mockAddToast = vi.fn();

      render(
        <AuthContext.Provider value={{ login: mockLogin, user: null }}>
          <ToastContext.Provider value={{ addToast: mockAddToast }}>
            <MemoryRouter initialEntries={['/login']}>
              <Login />
            </MemoryRouter>
          </ToastContext.Provider>
        </AuthContext.Provider>
      );

      // Verify mascot and heading
      expect(screen.getByRole('heading', { name: /clubrelay/i })).toBeInTheDocument();
      expect(screen.getByText(/build the club\. keep the momentum\./i)).toBeInTheDocument();

      // Inputs should be initially empty
      const emailInput = screen.getByLabelText(/university email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      expect(emailInput.value).toBe('');
      expect(passwordInput.value).toBe('');

      // Social auth buttons
      expect(screen.getByText(/continue with google/i)).toBeInTheDocument();
      expect(screen.getByText(/continue with github/i)).toBeInTheDocument();

      // Demo personas should NOT exist
      expect(screen.queryByText(/instant demo logins/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/sarah \(gdg\)/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/dr\. chen/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/dean vance/i)).not.toBeInTheDocument();
    });

    it('displays friendly error banner when OAuth error query parameter is present', () => {
      render(
        <AuthContext.Provider value={{ login: vi.fn(), user: null }}>
          <ToastContext.Provider value={{ addToast: vi.fn() }}>
            <MemoryRouter initialEntries={['/login?error=invalid_state']}>
              <Login />
            </MemoryRouter>
          </ToastContext.Provider>
        </AuthContext.Provider>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent(/session state expired or invalid/i);
    });

    it('calls login with typed credentials upon form submission', async () => {
      const mockLogin = vi.fn().mockResolvedValue({
        fullName: 'Jordan Builder',
        campusRole: 'STUDENT',
        memberships: [],
      });
      const mockAddToast = vi.fn();

      render(
        <AuthContext.Provider value={{ login: mockLogin, user: null }}>
          <ToastContext.Provider value={{ addToast: mockAddToast }}>
            <MemoryRouter initialEntries={['/login']}>
              <Login />
            </MemoryRouter>
          </ToastContext.Provider>
        </AuthContext.Provider>
      );

      const emailInput = screen.getByLabelText(/university email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in to workspace/i });

      fireEvent.change(emailInput, { target: { value: 'jordan@pcu.edu' } });
      fireEvent.change(passwordInput, { target: { value: 'Secret123!' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('jordan@pcu.edu', 'Secret123!');
      });
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

      // Click a tab to bring it to front
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
