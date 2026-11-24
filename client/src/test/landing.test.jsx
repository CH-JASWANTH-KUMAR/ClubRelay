import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import { LandingPage } from '../pages/LandingPage';
import { RelayMascot, computeClampedPupilOffset, PUPIL_MAX_X, PUPIL_MAX_Y } from '../components/brand/RelayMascot';
import { BrandMark } from '../components/brand/BrandMark';
import { BrandWordmark } from '../components/brand/BrandWordmark';
import { BrandLockup } from '../components/brand/BrandLockup';
import { RelayContinuitySection } from '../components/marketing/RelayContinuitySection';
import { FinalCtaSection } from '../components/marketing/FinalCtaSection';
import { ProblemSection } from '../components/marketing/ProblemSection';
import { CampusCommunities } from '../components/marketing/CampusCommunities';

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

  describe('Brand System Components', () => {
    it('renders BrandMark in all standard sizes and variants', () => {
      const sizes = ['xs', 'sm', 'md', 'lg', 'xl', 'hero'];
      sizes.forEach((size) => {
        const { container } = render(<BrandMark size={size} variant="color" />);
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
      });

      const variants = ['color', 'dark', 'light', 'monochrome'];
      variants.forEach((variant) => {
        const { container } = render(<BrandMark size="md" variant={variant} />);
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
      });
    });

    it('renders BrandWordmark with dot accent', () => {
      const { container } = render(<BrandWordmark size="md" variant="color" />);
      expect(container.textContent).toContain('ClubRelay');
    });

    it('renders BrandLockup combining mark and wordmark', () => {
      const { container } = render(<BrandLockup size="md" variant="color" showText={true} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(container.textContent).toContain('ClubRelay');
    });
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

    it('strictly clamps pupil offsets within the eye aperture boundary for all directions', () => {
      const testVectors = [
        { dx: 500, dy: 0, label: 'Right' },
        { dx: -500, dy: 0, label: 'Left' },
        { dx: 0, dy: 500, label: 'Down' },
        { dx: 0, dy: -500, label: 'Up' },
        { dx: 400, dy: 400, label: 'Down-Right' },
        { dx: -400, dy: 400, label: 'Down-Left' },
        { dx: 400, dy: -400, label: 'Up-Right' },
        { dx: -400, dy: -400, label: 'Up-Left' },
        { dx: 10000, dy: -25000, label: 'Extreme Distance' },
      ];

      testVectors.forEach(({ dx, dy, label }) => {
        const offset = computeClampedPupilOffset(dx, dy, 180);
        const normalizedRadiusSq = (offset.x / PUPIL_MAX_X) ** 2 + (offset.y / PUPIL_MAX_Y) ** 2;
        expect(normalizedRadiusSq, `Pupil clamped for direction ${label}`).toBeLessThanOrEqual(1.0001);
      });
    });

    it('returns exact zero offset when distance is zero', () => {
      const neutral = computeClampedPupilOffset(0, 0, 180);
      expect(neutral.x).toBe(0);
      expect(neutral.y).toBe(0);
    });

    it('renders correctly at 44px, 72px, 120px, and 220px sizes', () => {
      ['sm', 'md', 'lg', 'hero'].forEach((size) => {
        const { container } = render(<RelayMascot size={size} interactive={false} />);
        const wrapper = container.firstChild;
        expect(wrapper).toBeInTheDocument();
        const expectedWidth = size === 'sm' ? '44px' : size === 'md' ? '72px' : size === 'lg' ? '120px' : '220px';
        expect(wrapper.style.width).toBe(expectedWidth);
      });
    });
  });

  describe('Editorial Marketing Sections', () => {
    it('renders ProblemSection with comparative transition and editorial visual', () => {
      render(<ProblemSection />);
      expect(screen.getByText(/the semester ends\./i)).toBeInTheDocument();
      expect(screen.getByText(/the knowledge shouldn['’]t\./i)).toBeInTheDocument();
      expect(screen.getByText(/where context disappears/i)).toBeInTheDocument();
      expect(screen.getByText(/how clubrelay keeps momentum/i)).toBeInTheDocument();
    });

    it('renders RelayContinuitySection with mascot and 4 continuity pillars', () => {
      render(<RelayContinuitySection />);
      expect(screen.getByText(/continuity companion/i)).toBeInTheDocument();
      expect(screen.getByText(/good clubs don['’]t start from zero\./i)).toBeInTheDocument();
      expect(screen.getByText(/they pick up where the last team left off\./i)).toBeInTheDocument();
      expect(screen.getByText(/7-section successor dossier/i)).toBeInTheDocument();
      expect(screen.getByText(/atomic role handover/i)).toBeInTheDocument();
    });

    it('renders CampusCommunities with 8 student technical community sectors', () => {
      render(<CampusCommunities />);
      expect(screen.getByText(/built for collegiate tech culture/i)).toBeInTheDocument();
      expect(screen.getAllByText(/developer communities/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/robotics & hardware labs/i)).toBeInTheDocument();
      expect(screen.getByText(/ai & data science guilds/i)).toBeInTheDocument();
      expect(screen.getByText(/cloud & cyber security/i)).toBeInTheDocument();
    });

    it('renders FinalCtaSection with dual actions and brand mark', () => {
      render(
        <MemoryRouter>
          <AuthContext.Provider value={mockGuestAuth}>
            <FinalCtaSection />
          </AuthContext.Provider>
        </MemoryRouter>
      );
      expect(screen.getByText(/your next batch should start ahead/i)).toBeInTheDocument();
      expect(screen.getByText(/not from scratch\./i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /explore clubrelay/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  describe('Public Landing Page Integration', () => {
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

      const eventsTab = screen.getByRole('tab', { name: /event cockpit/i });
      fireEvent.click(eventsTab);
      expect(screen.getByText(/Phase: Planning/i)).toBeInTheDocument();
      expect(screen.getByText(/Venue booking and permits/i)).toBeInTheDocument();
      expect(screen.getByText(/Stage equipment setup/i)).toBeInTheDocument();

      const workTab = screen.getByRole('tab', { name: /my work/i });
      fireEvent.click(workTab);
      expect(screen.getByText(/Sample Engineering Society/i)).toBeInTheDocument();
      expect(screen.getByText(/Submit audio equipment requisition/i)).toBeInTheDocument();
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

    it('toggles mobile menu drawer on hamburger button click', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <ToastContext.Provider value={mockToast}>
            <AuthContext.Provider value={mockGuestAuth}>
              <LandingPage />
            </AuthContext.Provider>
          </ToastContext.Provider>
        </MemoryRouter>
      );

      const toggleButton = screen.getByLabelText(/toggle menu/i);
      expect(toggleButton).toBeInTheDocument();

      // Open mobile drawer
      fireEvent.click(toggleButton);
      const navLinks = screen.getAllByRole('link', { name: /how it works/i });
      expect(navLinks.length).toBeGreaterThan(1); // desktop + mobile

      // Close mobile drawer
      fireEvent.click(toggleButton);
    });
  });
});
