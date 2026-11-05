import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  BookOpen,
  Users,
  Building2,
  FileCheck2,
  ArrowRightLeft,
  BarChart3,
  Settings,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';

export function Sidebar() {
  const { user, activeClub, memberships, switchClub } = useAuth();
  const clubId = activeClub?._id || (memberships[0]?.clubId?._id);

  const isCampusAdmin = user?.campusRole === 'CAMPUS_ADMIN';
  const isFaculty = user?.campusRole === 'FACULTY_COORDINATOR';

  const navItems = [
    {
      to: `/clubs/${clubId}`,
      label: 'Club Overview',
      icon: LayoutDashboard,
      show: !!clubId,
    },
    {
      to: `/clubs/${clubId}/events`,
      label: 'Events & Projects',
      icon: Calendar,
      show: !!clubId,
    },
    {
      to: `/clubs/${clubId}/memory`,
      label: 'Organization Memory',
      icon: BookOpen,
      show: !!clubId,
    },
    {
      to: `/clubs/${clubId}/directory`,
      label: 'Sponsors & Vendors',
      icon: Users,
      show: !!clubId,
    },
    {
      to: `/clubs/${clubId}/decisions`,
      label: 'Executive Decisions',
      icon: CheckSquare,
      show: !!clubId,
    },
    {
      to: `/clubs/${clubId}/handover`,
      label: 'Handover Center',
      icon: ArrowRightLeft,
      badge: 'Core',
      show: !!clubId,
    },
    {
      to: `/clubs/${clubId}/reports`,
      label: 'Annual Reports',
      icon: BarChart3,
      show: !!clubId,
    },
    {
      to: `/clubs/${clubId}/members`,
      label: 'Roster & Roles',
      icon: Users,
      show: !!clubId,
    },
  ];

  const adminItems = [
    {
      to: '/campus',
      label: 'Campus Workspaces',
      icon: Building2,
      show: isCampusAdmin || isFaculty,
    },
    {
      to: '/faculty/approvals',
      label: 'Faculty Approvals',
      icon: FileCheck2,
      badge: 'Review',
      show: isFaculty || isCampusAdmin,
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-border bg-surface flex flex-col h-screen sticky top-0 select-none">
      {/* Brand & Tagline */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-forest-700 text-white flex items-center justify-center font-bold text-sm shadow-subtle">
            CR
          </div>
          <div>
            <h1 className="font-semibold text-sm text-charcoal-900 tracking-tight">ClubRelay</h1>
            <p className="text-[11px] text-charcoal-500">The knowledge stays.</p>
          </div>
        </div>

        {/* Club Switcher dropdown if user has clubs */}
        {memberships.length > 0 && (
          <div className="mt-3">
            <label className="block text-xs font-medium text-charcoal-500 mb-1">
              Active Organization
            </label>
            <div className="relative">
              <select
                value={activeClub?._id || ''}
                onChange={(e) => {
                  const selected = memberships.find((m) => m.clubId?._id === e.target.value);
                  if (selected) switchClub(selected.clubId);
                }}
                className="w-full text-xs font-medium rounded border border-border bg-subtle px-2.5 py-1.5 text-charcoal-800 focus:outline-none focus:border-forest-700 appearance-none pr-6 cursor-pointer"
              >
                {memberships.map((m) => (
                  <option key={m.clubId?._id} value={m.clubId?._id}>
                    {m.clubId?.name} ({m.clubId?.code})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-charcoal-500 absolute right-2 top-2.5 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* Navigation links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <div className="text-xs font-semibold text-charcoal-500 px-2 mb-2">
            Workspace
          </div>
          <nav className="space-y-1">
            {navItems
              .filter((item) => item.show)
              .map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === `/clubs/${clubId}`}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-medium transition-colors duration-150',
                        isActive
                          ? 'bg-forest-50 text-forest-800 font-semibold'
                          : 'text-charcoal-700 hover:bg-subtle hover:text-charcoal-900'
                      )
                    }
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className="w-4 h-4 text-charcoal-500 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] bg-forest-100 text-forest-800 font-medium px-1.5 py-0.2 rounded">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
          </nav>
        </div>

        {/* Governance / Admin links */}
        {(isCampusAdmin || isFaculty) && (
          <div>
            <div className="text-xs font-semibold text-charcoal-500 px-2 mb-2">
              Campus Governance
            </div>
            <nav className="space-y-1">
              {adminItems
                .filter((item) => item.show)
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        clsx(
                          'flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-medium transition-colors duration-150',
                          isActive
                            ? 'bg-forest-50 text-forest-800 font-semibold'
                            : 'text-charcoal-700 hover:bg-subtle hover:text-charcoal-900'
                        )
                      }
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className="w-4 h-4 text-charcoal-500 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-medium px-1.5 py-0.2 rounded">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
            </nav>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-border bg-canvas text-[11px] text-charcoal-500">
        <div className="truncate font-medium text-charcoal-800">{user?.fullName}</div>
        <div className="truncate text-charcoal-400">
          {user?.campusRole === 'CAMPUS_ADMIN'
            ? 'Campus Administrator'
            : user?.campusRole === 'FACULTY_COORDINATOR'
            ? 'Faculty Coordinator'
            : 'Student Leader'}
        </div>
      </div>
    </aside>
  );
}
