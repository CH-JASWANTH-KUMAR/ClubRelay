import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import { LandingPage } from '../pages/LandingPage';
import { RelayMascot } from '../components/brand/RelayMascot';

const mockToast = {
  addToast: vi.fn(),
};

const mockGuestAuth = {
  user: null,
  activeClub: null,
  memberships: [],
  switchClub: vi.fn(),
  logout: vi.fn(),
};

const mockUserAuth = {
  user: {
    _id: 'u-1',
    fullName: 'Sarah Organizer',
    email: 'sarah.gdg@pcu.edu',
    campusRole: 'STUDENT',
    memberships: [{ clubId: { _id: 'club-gdg', name: 'GDG' } }],
  },
  activeClub: { _id: 'club-gdg', name: 'GDG' },
  memberships: [{ clubId: { _id: 'club-gdg', name: 'GDG' } }],
  switchClub: vi.fn(),
  logout: vi.fn(),
};

describe('ClubRelay Brand Experience & Landing Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Relay Mascot Component', () => {
    it('renders vector SVG mascot without crashing', () => {
      const { container } = render(<RelayMascot size="md" interactive={true} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg.getAttribute('aria-hidden')).toBe('true');
    });

    it('renders eyes, antenna light, and smile paths', () => {
      const { container } = render(<RelayMascot size="lg" interactive={false} />);
      const pupils = container.querySelectorAll('ellipse');
      expect(pupils.length).toBeGreaterThan(0);
    });
  });

  describe('Public Landing Page', () => {
    it('renders hero headline, tagline, and CTA for guest visitors', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <ToastContext.Provider value={mockToast}>
            <AuthContext.Provider value={mockGuestAuth}>
              <LandingPage />
            </AuthContext.Provider>
          </ToastContext.Provider>
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { name: /build the club/i })).toBeInTheDocument();
      expect(screen.getAllByText(/the work continues\. the knowledge stays\./i).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('link', { name: /sign in/i }).length).toBeGreaterThan(0);
    });

    it('renders four pillars of the bento feature grid', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <ToastContext.Provider value={mockToast}>
            <AuthContext.Provider value={mockGuestAuth}>
              <LandingPage />
            </AuthContext.Provider>
          </ToastContext.Provider>
        </MemoryRouter>
      );

      expect(screen.getByText(/four pillars of student club momentum/i)).toBeInTheDocument();
      expect(screen.getByText(/community & leadership rosters/i)).toBeInTheDocument();
      expect(screen.getByText(/event execution cockpit/i)).toBeInTheDocument();
      expect(screen.getByText(/engineering projects & repositories/i)).toBeInTheDocument();
      expect(screen.getByText(/institutional memory & handover/i)).toBeInTheDocument();
    });

    it('renders three-step journey section', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <ToastContext.Provider value={mockToast}>
            <AuthContext.Provider value={mockGuestAuth}>
              <LandingPage />
            </AuthContext.Provider>
          </ToastContext.Provider>
        </MemoryRouter>
      );

      expect(screen.getByText(/how clubrelay keeps the momentum/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /^organise$/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /build & execute/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /pass it forward/i })).toBeInTheDocument();
    });

    it('renders live product preview with interactive tab switching', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <ToastContext.Provider value={mockToast}>
            <AuthContext.Provider value={mockGuestAuth}>
              <LandingPage />
            </AuthContext.Provider>
          </ToastContext.Provider>
        </MemoryRouter>
      );

      const eventsTab = screen.getByRole('button', { name: /event cockpit/i });
      fireEvent.click(eventsTab);
      expect(screen.getByText(/7-tab event cockpit/i)).toBeInTheDocument();

      const workTab = screen.getByRole('button', { name: /my work/i });
      fireEvent.click(workTab);
      expect(screen.getByText(/my work personal cockpit/i)).toBeInTheDocument();
    });

    it('shows authenticated workspace navigation button when logged in', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <ToastContext.Provider value={mockToast}>
            <AuthContext.Provider value={mockUserAuth}>
              <LandingPage />
            </AuthContext.Provider>
          </ToastContext.Provider>
        </MemoryRouter>
      );

      const workspaceButtons = screen.getAllByRole('button', { name: /open your workspace/i });
      expect(workspaceButtons.length).toBeGreaterThan(0);
    });
  });
});
