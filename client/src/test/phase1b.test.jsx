import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import { CommandPalette } from '../components/ui/CommandPalette';
import { MyWork } from '../pages/MyWork';
import { Members } from '../pages/Members';
import { HandoverCenter } from '../pages/HandoverCenter';

const mockToast = {
  addToast: vi.fn(),
};

const mockUserAdmin = {
  _id: 'u-admin-1',
  fullName: 'Morgan Admin',
  email: 'morgan.admin@pcu.edu',
  campusRole: 'CAMPUS_ADMIN',
  campusId: { _id: 'campus-1', name: 'Pacific Coast University' },
};

const mockUserMember = {
  _id: 'u-member-1',
  fullName: 'Sam Member',
  email: 'sam.member@pcu.edu',
  campusRole: 'STUDENT',
  campusId: { _id: 'campus-1', name: 'Pacific Coast University' },
};

const mockClubs = [
  { _id: 'club-1', name: 'Google Developer Group', code: 'GDG', category: 'TECHNICAL' },
  { _id: 'club-2', name: 'IEEE Student Branch', code: 'IEEE', category: 'TECHNICAL' },
];

const mockMemberships = [
  { clubId: mockClubs[0], clubRole: 'PRESIDENT', status: 'ACTIVE' },
  { clubId: mockClubs[1], clubRole: 'GENERAL_MEMBER', status: 'ACTIVE' },
];

const renderWithContext = (ui, authValue, initialRoute = '/clubs/club-1/members') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <ToastContext.Provider value={mockToast}>
        <AuthContext.Provider value={authValue}>
          <Routes>
            <Route path="/clubs/:clubId/members" element={ui} />
            <Route path="/clubs/:clubId/handover" element={ui} />
            <Route path="/clubs/:clubId" element={ui} />
            <Route path="*" element={ui} />
          </Routes>
        </AuthContext.Provider>
      </ToastContext.Provider>
    </MemoryRouter>
  );
};

describe('Phase 1B Frontend Components & Workflows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('CommandPalette Component', () => {
    it('renders search input and commands when open', () => {
      renderWithContext(
        <CommandPalette isOpen={true} onClose={vi.fn()} />,
        {
          user: mockUserAdmin,
          activeClub: mockClubs[0],
          memberships: mockMemberships,
          switchClub: vi.fn(),
        }
      );

      expect(screen.getByPlaceholderText(/Type a command, page, or switch club/i)).toBeInTheDocument();
      expect(screen.getByText(/My Work - Personal Task Center/i)).toBeInTheDocument();
      expect(screen.getByText(/Club Overview Flight Deck/i)).toBeInTheDocument();
      expect(screen.getByText(/Campus Operations & Clubs/i)).toBeInTheDocument();
    });

    it('filters commands according to query input', async () => {
      renderWithContext(
        <CommandPalette isOpen={true} onClose={vi.fn()} />,
        {
          user: mockUserAdmin,
          activeClub: mockClubs[0],
          memberships: mockMemberships,
          switchClub: vi.fn(),
        }
      );

      const input = screen.getByPlaceholderText(/Type a command, page, or switch club/i);
      fireEvent.change(input, { target: { value: 'Handover' } });

      expect(screen.getByText(/Leadership Handover Center/i)).toBeInTheDocument();
      expect(screen.queryByText(/Campus Operations & Clubs/i)).not.toBeInTheDocument();
    });

    it('does not render anything when isOpen is false', () => {
      const { container } = renderWithContext(
        <CommandPalette isOpen={false} onClose={vi.fn()} />,
        {
          user: mockUserAdmin,
          activeClub: mockClubs[0],
          memberships: mockMemberships,
          switchClub: vi.fn(),
        }
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe('MyWork Page', () => {
    it('fetches and displays personal tasks with KPI stats', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            tasks: [
              {
                _id: 't-1',
                title: 'Draft Annual Operating Budget',
                status: 'TODO',
                priority: 'HIGH',
                dueDate: '2026-12-01',
                clubId: mockClubs[0],
              },
              {
                _id: 't-2',
                title: 'Review Venue Permits',
                status: 'IN_PROGRESS',
                priority: 'URGENT',
                dueDate: '2026-11-25',
                clubId: mockClubs[0],
              },
            ],
            stats: {
              total: 2,
              dueToday: 0,
              upcoming: 2,
              overdue: 0,
              blocked: 0,
              completed: 0,
            },
          },
        }),
      });

      renderWithContext(<MyWork />, {
        user: mockUserMember,
        activeClub: mockClubs[0],
        memberships: mockMemberships,
      });

      expect(screen.getByText(/Unified task cockpit across all your active campus student organizations/i)).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('Draft Annual Operating Budget')).toBeInTheDocument();
        expect(screen.getByText('Review Venue Permits')).toBeInTheDocument();
      });

      expect(screen.getByText('Total Workload')).toBeInTheDocument();
      expect(screen.getByText('Due Today')).toBeInTheDocument();
    });

    it('switches views between Kanban, List, and Calendar', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            tasks: [
              {
                _id: 't-1',
                title: 'Draft Annual Operating Budget',
                status: 'TODO',
                priority: 'HIGH',
                dueDate: '2026-12-01',
                clubId: mockClubs[0],
              },
            ],
            stats: { total: 1, dueToday: 0, upcoming: 1, overdue: 0, blocked: 0, completed: 0 },
          },
        }),
      });

      renderWithContext(<MyWork />, {
        user: mockUserMember,
        activeClub: mockClubs[0],
        memberships: mockMemberships,
      });

      await waitFor(() => {
        expect(screen.getByText('Draft Annual Operating Budget')).toBeInTheDocument();
      });

      // Switch to List View
      const listBtn = screen.getByRole('button', { name: /list/i });
      fireEvent.click(listBtn);
      expect(screen.getByText('Associated Event')).toBeInTheDocument();

      // Switch to Calendar View
      const calBtn = screen.getByRole('button', { name: /calendar/i });
      fireEvent.click(calBtn);
      expect(screen.getByText('Scheduled Task Milestones')).toBeInTheDocument();
    });
  });

  describe('Members & People Page', () => {
    it('renders member directory with join requests/invitations controls and custom positions', async () => {
      global.fetch
        // Terms fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: {
              terms: [
                { _id: 'term-1', name: '2025-2026', isCurrent: true },
                { _id: 'term-2', name: '2026-2027', isCurrent: false },
              ],
            },
          }),
        })
        // Join requests fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: { joinRequests: [] } }),
        })
        // Invitations fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: { invitations: [] } }),
        })
        // Members fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: {
              members: [
                {
                  _id: 'm-1',
                  userId: { fullName: 'Alex Lead', email: 'alex@pcu.edu', department: 'CS' },
                  clubRole: 'PRESIDENT',
                  title: 'Design Lead',
                  academicTermId: { name: '2025-2026' },
                  status: 'ACTIVE',
                },
              ],
              positions: [{ _id: 'pos-1', name: 'Design Lead' }],
            },
          }),
        });

      renderWithContext(<Members />, {
        user: mockUserAdmin,
        activeClub: mockClubs[0],
        memberships: mockMemberships,
        hasClubCapability: () => true,
      });

      expect(screen.getByText(/Member Directory & Onboarding/i)).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('Alex Lead')).toBeInTheDocument();
        expect(screen.getAllByText('Design Lead').length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('HandoverCenter Privacy & Administration', () => {
    it('shows executive privacy protected view when access is forbidden for general member', async () => {
      global.fetch.mockResolvedValueOnce({
        status: 403,
        ok: false,
        json: async () => ({ error: { code: 'FORBIDDEN_HANDOVER_ACCESS' } }),
      });

      renderWithContext(<HandoverCenter />, {
        user: mockUserMember,
        activeClub: mockClubs[0],
        memberships: mockMemberships,
      }, '/clubs/club-1/handover');

      await waitFor(() => {
        expect(screen.getByText(/Executive Privacy Protected/i)).toBeInTheDocument();
        expect(screen.getByText(/Access Level: General Club Member/i)).toBeInTheDocument();
      });
    });

    it('renders campus admin nomination controls and term selectors in initiate modal', async () => {
      // Handovers list fetch
      global.fetch
        .mockResolvedValueOnce({
          status: 200,
          ok: true,
          json: async () => ({ data: { handovers: [] } }),
        })
        // Terms fetch
        .mockResolvedValueOnce({
          status: 200,
          ok: true,
          json: async () => ({
            data: {
              terms: [
                { _id: 'term-1', name: '2025-2026', isCurrent: true },
                { _id: 'term-2', name: '2026-2027', isCurrent: false },
              ],
            },
          }),
        })
        // Club members fetch
        .mockResolvedValueOnce({
          status: 200,
          ok: true,
          json: async () => ({
            data: {
              members: [
                {
                  _id: 'm-pres',
                  userId: { fullName: 'Outgoing President', email: 'outgoing.pres@pcu.edu' },
                  clubRole: 'PRESIDENT',
                  academicTermId: { name: '2025-2026' },
                  status: 'ACTIVE',
                },
              ],
            },
          }),
        });

      renderWithContext(<HandoverCenter />, {
        user: mockUserAdmin,
        activeClub: mockClubs[0],
        memberships: mockMemberships,
      }, '/clubs/club-1/handover');

      await waitFor(() => {
        expect(screen.getByText(/Leadership Handover Center/i)).toBeInTheDocument();
      });

      const initiateBtns = screen.getAllByRole('button', { name: /initiate transition|start handover package/i });
      fireEvent.click(initiateBtns[0]);

      expect(screen.getByText('From Academic Term')).toBeInTheDocument();
      expect(screen.getByText('To Academic Term')).toBeInTheDocument();
      expect(screen.getByText('Nominate Outgoing Officer')).toBeInTheDocument();
    });
  });
});
