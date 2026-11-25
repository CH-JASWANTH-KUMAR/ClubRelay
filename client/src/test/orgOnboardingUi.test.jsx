import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import { Onboarding } from '../pages/Onboarding';
import { CreateClubWizard } from '../pages/CreateClubWizard';
import { PermissionMatrixEditor } from '../components/structure/PermissionMatrixEditor';
import { OrgChartCanvas } from '../components/structure/OrgChartCanvas';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';
import { ClubDashboard } from '../pages/ClubDashboard';

const mockToast = { addToast: vi.fn() };

function renderWithRouter(ui, authValue, initialRoute = '/onboarding') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <ToastContext.Provider value={mockToast}>
        <AuthContext.Provider value={authValue}>
          <Routes>
            <Route path="/onboarding" element={ui} />
            <Route path="/clubs/create" element={ui} />
            <Route path="/clubs/:clubId" element={ui} />
            <Route path="*" element={ui} />
          </Routes>
        </AuthContext.Provider>
      </ToastContext.Provider>
    </MemoryRouter>
  );
}

describe('Organization Onboarding, Structure Builder & Capability UI Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('renders Onboarding hub with Create, Join by Code, Accept Invitation, Drafts, and Personal campus request', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          accountType: 'PERSONAL',
          campusPolicy: { allowStudentClubCreation: true },
          draftClubs: [
            { _id: 'draft-1', name: 'Robotics Collective', code: 'ROBO', setupStep: 4, status: 'DRAFT' },
          ],
          pendingInvitations: [
            {
              _id: 'inv-1',
              club: { _id: 'club-9', name: 'Indie Makers', code: 'INDIE' },
              invitedBy: { fullName: 'Aarav Steward' },
              intendedPositions: [{ _id: 'pos-1', name: 'Guild Lead' }],
            },
          ],
          campusOrganizations: [
            {
              _id: 'club-2',
              name: 'Design Society',
              code: 'DESIGN',
              category: 'CULTURAL',
              memberCount: 14,
              joinPolicy: 'REQUEST_APPROVAL',
            },
          ],
          joinRequests: [],
          campusRequests: [],
        },
      }),
    });

    renderWithRouter(<Onboarding />, {
      user: { _id: 'u1', fullName: 'Jamie Student', email: 'jamie@gmail.com', campusRole: 'STUDENT' },
      campus: null,
      memberships: [],
      refreshUser: vi.fn(),
      switchClub: vi.fn(),
    });

    await waitFor(() => {
      expect(screen.getByText(/Welcome to ClubRelay, Jamie/i)).toBeInTheDocument();
      expect(screen.getByText(/1\. Create an Organization/i)).toBeInTheDocument();
      expect(screen.getByText(/2\. Join by Code/i)).toBeInTheDocument();
      expect(screen.getByText(/3\. Accept an Invitation/i)).toBeInTheDocument();
      expect(screen.getByText(/Robotics Collective/i)).toBeInTheDocument();
      expect(screen.getByText(/Indie Makers/i)).toBeInTheDocument();
      expect(screen.getByText(/Design Society/i)).toBeInTheDocument();
      expect(screen.getByText(/Request Campus Setup/i)).toBeInTheDocument();
    });
  });

  it('renders PermissionMatrixEditor grouped by module, filters capabilities, and toggles selections', () => {
    const onChange = vi.fn();
    const modules = [
      {
        key: 'events',
        label: 'Events & Programming',
        description: 'Manage events',
        permissions: [
          { key: 'events.view', label: 'View Events', description: 'See events' },
          { key: 'events.create', label: 'Create Events', description: 'Draft events' },
        ],
      },
      {
        key: 'contacts',
        label: 'Sponsors & Contacts',
        description: 'Vendor directory',
        permissions: [{ key: 'contacts.view', label: 'View Contacts', description: 'See vendors' }],
      },
    ];

    render(
      <PermissionMatrixEditor
        modules={modules}
        selectedPermissions={['events.view']}
        onChange={onChange}
      />
    );

    expect(screen.getByText(/never automatically inherits parent permissions/i)).toBeInTheDocument();
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3);

    fireEvent.click(checkboxes[1]);
    expect(onChange).toHaveBeenCalledWith(['events.view', 'events.create']);

    const searchInput = screen.getByPlaceholderText(/Filter capabilities/i);
    fireEvent.change(searchInput, { target: { value: 'Sponsors' } });
    expect(screen.getByText('View Contacts')).toBeInTheDocument();
    expect(screen.queryByText('View Events')).not.toBeInTheDocument();
  });

  it('renders OrgChartCanvas with multiple top-level positions without hardcoded President', () => {
    const positions = [
      { _id: 'p1', name: 'Guild Steward', parentPositionId: null, isLeadership: true, maxHolders: 2, permissions: ['events.view'] },
      { _id: 'p2', name: 'Creative Director', parentPositionId: null, isLeadership: true, maxHolders: 1, permissions: ['events.view'] },
      { _id: 'p3', name: 'Design Lead', parentPositionId: 'p1', isLeadership: false, permissions: ['knowledge.create'] },
    ];

    render(
      <OrgChartCanvas
        positions={positions}
        departments={[{ _id: 'd1', name: 'Studio', color: '#315BDB' }]}
        assignmentsByPosition={{
          p1: [{ _id: 'a1', user: { fullName: 'Maya Patel' } }],
        }}
      />
    );

    expect(screen.getAllByText('Guild Steward').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Creative Director').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Design Lead').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Maya Patel').length).toBeGreaterThanOrEqual(1);
  });

  it('gates Sidebar navigation strictly by active club capabilities and shows Topbar switcher & term', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ data: { notifications: [] } }) });

    const restrictedAuth = {
      user: {
        _id: 'u-2',
        fullName: 'Maya Design',
        campusRole: 'STUDENT',
        campusId: { _id: 'c1', name: 'Alpha Tech', settings: { defaultAcademicYear: '2026-2027' } },
      },
      activeClub: {
        _id: 'club-1',
        name: 'Craft Collective',
        code: 'CRAFT',
        activeTermId: { name: '2026-2027' },
      },
      memberships: [
        {
          clubId: { _id: 'club-1', name: 'Craft Collective', code: 'CRAFT', activeTermId: { name: '2026-2027' } },
          capabilities: ['club.view_overview', 'events.view'],
        },
        {
          clubId: { _id: 'club-2', name: 'Robotics', code: 'ROBO' },
          capabilities: ['club.view_overview', 'members.view', 'club.manage_settings'],
        },
      ],
      draftClubs: [],
      switchClub: vi.fn(),
      logout: vi.fn(),
      hasClubCapability: (cap) => ['club.view_overview', 'events.view'].includes(cap),
    };

    renderWithRouter(
      <div>
        <Topbar onOpenCommandPalette={vi.fn()} />
        <Sidebar collapsed={false} onToggleCollapse={vi.fn()} mobileOpen={false} />
      </div>,
      restrictedAuth,
      '/clubs/club-1'
    );

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Events')).toBeInTheDocument();
    expect(screen.queryByText('Organization Settings')).not.toBeInTheDocument();
    expect(screen.queryByText('Sponsors & Partners')).not.toBeInTheDocument();
    expect(screen.getByText('2026-2027')).toBeInTheDocument();
    expect(screen.getByLabelText('Topbar organization switcher')).toBeInTheDocument();
  });

  it('progresses CreateClubWizard from Step 1 to Step 2 and Step 3 starter templates', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            templates: [
              { key: 'tech_club', name: 'Technical / Coding Club', tagline: 'Workshops & code', departments: [], positions: [] },
              { key: 'custom', name: 'Custom / Start From Scratch', tagline: 'Blank canvas', departments: [], positions: [] },
            ],
            permissionsCatalogue: [],
            facultyCoordinators: [],
            campusPolicy: {},
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { terms: [{ _id: 't1', name: '2025-2026', isCurrent: true }] } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { club: { _id: 'new-club-1', name: 'Indie AI', code: 'IAI' } } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { club: { _id: 'new-club-1' } } }),
      });

    renderWithRouter(<CreateClubWizard />, {
      user: { _id: 'u1', fullName: 'Aarav', email: 'aarav@alpha.edu', campusRole: 'STUDENT', campusId: { _id: 'c1' } },
      campus: { _id: 'c1', name: 'Alpha' },
      memberships: [],
      refreshUser: vi.fn(),
      switchClub: vi.fn(),
    }, '/clubs/create');

    await waitFor(() => {
      expect(screen.getByText(/Step 1: Basic Organization Details/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/Open Design Collective/i), { target: { value: 'Indie AI' } });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. CRAFT/i), { target: { value: 'IAI' } });
    fireEvent.click(screen.getByRole('button', { name: /Save & Continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/Step 2: Governance/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Save & Continue/i }));
    await waitFor(() => {
      expect(screen.getByText(/Custom \/ Start From Scratch/i)).toBeInTheDocument();
    });
  });

  it('renders ClubDashboard with real metrics and zero placeholder percentages', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            club: {
              _id: 'club-1',
              name: 'Craft Collective',
              code: 'CRAFT',
              category: 'CULTURAL',
              activeTermId: { name: '2026-2027' },
            },
            leadership: [],
            positions: [{ _id: 'p1', name: 'Steward' }],
            metrics: { memberCount: 5, positionsCount: 3, eventCount: 0, handoverProgress: null },
            userAccess: { capabilities: ['club.view_overview', 'club.manage_structure'], positions: [{ positionId: 'p1', name: 'Steward' }] },
          },
        }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: { events: [] } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: { tasks: [] } }) });

    renderWithRouter(<ClubDashboard />, {
      user: { _id: 'u1', fullName: 'Steward User', campusRole: 'STUDENT' },
      activeClub: { _id: 'club-1' },
      memberships: [],
    }, '/clubs/club-1');

    await waitFor(() => {
      expect(screen.getByText('Craft Collective')).toBeInTheDocument();
      expect(screen.getByText('Term: 2026-2027')).toBeInTheDocument();
      expect(screen.getByText('Organization Snapshot')).toBeInTheDocument();
      expect(screen.queryByText(/96\.8%/i)).not.toBeInTheDocument();
    });
  });
});
