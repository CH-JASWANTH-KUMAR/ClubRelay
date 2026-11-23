import React from 'react';
import { NavLink } from 'react-router-dom';
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
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';
import { BrandMark } from '../brand/BrandMark';
import { BrandLockup } from '../brand/BrandLockup';

export function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  const { user, activeClub, memberships, switchClub } = useAuth();
  const clubId = activeClub?._id || memberships[0]?.clubId?._id;

  const isCampusAdmin = user?.campusRole === 'CAMPUS_ADMIN';
  const isFaculty = user?.campusRole === 'FACULTY_COORDINATOR';

  const workspaceItems = [
    {
      to: '/my-work',
      label: 'My Work',
      icon: CheckSquare,
      badge: 'Tasks',
      show: true,
    },
  ];

  const orgItems = [
    {
      to: `/clubs/${clubId}`,
      label: 'Club Overview',
      icon: LayoutDashboard,
      show: !!clubId,
      end: true,
    },
    {
      to: `/clubs/${clubId}/events`,
      label: 'Events & Projects',
      icon: Calendar,
      show: !!clubId,
    },
    {
      to: `/clubs/${clubId}/members`,
      label: 'Roster & Roles',
      icon: Users,
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

  const renderNavSection = (title, items) => {
    const visible = items.filter((item) => item.show);
    if (visible.length === 0) return null;

    return (
      <div>
        {!collapsed && (
          <div className="text-xs font-semibold text-charcoal-500 px-2 mb-1.5">
            {title}
          </div>
        )}
        <nav className="space-y-0.5">
          {visible.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onCloseMobile}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center rounded-xl text-xs font-medium transition-colors duration-150',
                    collapsed ? 'justify-center p-2' : 'justify-between px-2.5 py-1.5',
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-bold shadow-subtle'
                      : 'text-ink/80 hover:bg-subtle hover:text-ink'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={clsx('w-4 h-4 flex-shrink-0', isActive ? 'text-brand-600' : 'text-mutedSlate')} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </div>
                    {!collapsed && item.badge && (
                      <span
                        className={clsx(
                          'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                          item.badge === 'Review'
                            ? 'bg-sunshine-100 text-sunshine-800'
                            : 'bg-brand-100 text-brand-800'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full select-none">
      {/* Brand & Organization Switcher */}
      <div className={clsx('border-b border-border', collapsed ? 'p-2' : 'p-4')}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden">
            {collapsed ? (
              <BrandMark size="sm" />
            ) : (
              <BrandLockup size="sm" />
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1 rounded text-charcoal-400 hover:text-charcoal-700 hover:bg-subtle"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>

          {/* Mobile Close Button */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1 rounded text-charcoal-400 hover:text-charcoal-700 hover:bg-subtle"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Club Switcher dropdown if user has clubs */}
        {!collapsed && memberships.length > 0 && (
          <div className="mt-3">
            <label className="block text-[11px] font-medium text-charcoal-400 mb-1">
              Active Organization
            </label>
            <div className="relative">
              <select
                value={activeClub?._id || ''}
                onChange={(e) => {
                  const selected = memberships.find((m) => m.clubId?._id === e.target.value);
                  if (selected) switchClub(selected.clubId);
                }}
                className="w-full text-xs font-semibold rounded-lg border border-border bg-subtle px-2.5 py-1.5 text-ink focus:outline-none focus:border-brand-500 appearance-none pr-6 cursor-pointer"
              >
                {memberships.map((m) => (
                  <option key={m.clubId?._id} value={m.clubId?._id}>
                    {m.clubId?.name} ({m.clubId?.code})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-mutedSlate absolute right-2 top-2.5 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* Navigation Sections */}
      <div className={clsx('flex-1 overflow-y-auto space-y-5', collapsed ? 'px-2 py-3' : 'px-3 py-4')}>
        {renderNavSection('My Workspace', workspaceItems)}
        {renderNavSection('Organisation', orgItems)}
        {(isCampusAdmin || isFaculty) && renderNavSection('Campus Governance', adminItems)}
      </div>

      {/* Footer Info */}
      <div className={clsx('border-t border-border bg-canvas text-[11px]', collapsed ? 'p-2 text-center' : 'p-3')}>
        {!collapsed ? (
          <>
            <div className="truncate font-semibold text-ink">{user?.fullName}</div>
            <div className="truncate text-mutedSlate">
              {user?.campusRole === 'CAMPUS_ADMIN'
                ? 'Campus Administrator'
                : user?.campusRole === 'FACULTY_COORDINATOR'
                ? 'Faculty Coordinator'
                : 'Student Leader'}
            </div>
          </>
        ) : (
          <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-800 mx-auto flex items-center justify-center font-bold text-[10px]">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        className={clsx(
          'hidden md:flex flex-col flex-shrink-0 border-r border-border bg-surface h-screen sticky top-0 transition-colors duration-200',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Slide-out */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="fixed inset-0 bg-charcoal-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-surface border-r border-border shadow-elevated z-50 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
