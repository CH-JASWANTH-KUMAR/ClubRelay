import React, { useState, useEffect } from 'react';
import { Bell, LogOut, School, Calendar, Check, Search, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/EmptyState';
import { useNavigate } from 'react-router-dom';

export function Topbar({ onOpenMobileNav, onOpenCommandPalette }) {
  const { user, activeClub, memberships, switchClub, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const activeTermLabel =
    activeClub?.activeTermId?.name ||
    user?.campusId?.settings?.defaultAcademicYear ||
    'Active Term';

  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await fetch('/api/v1/notifications');
        if (res.ok) {
          const json = await res.json();
          setNotifications(json.data?.notifications || []);
          setUnreadCount((json.data?.notifications || []).filter((n) => !n.isRead).length);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await Promise.all(
        notifications
          .filter((n) => !n.isRead)
          .map((n) => fetch(`/api/v1/notifications/${n._id}/read`, { method: 'PUT' }))
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="h-14 border-b border-border bg-surface flex items-center justify-between px-3 sm:px-6 sticky top-0 z-30 select-none">
      {/* Left: Mobile Nav Button + Campus & Term Identity */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {onOpenMobileNav && (
          <button
            onClick={onOpenMobileNav}
            className="md:hidden p-1.5 rounded text-charcoal-600 hover:text-charcoal-900 hover:bg-subtle shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg bg-brand-50 border border-brand-200 text-xs text-brand-800 min-w-0">
          <School className="w-3.5 h-3.5 text-brand-600 shrink-0" />
          <span className="font-bold text-ink truncate max-w-[105px] sm:max-w-[180px]">
            {user?.campusId?.name || 'Personal Workspace'}
          </span>
        </div>

        {memberships && memberships.length > 0 && (
          <select
            value={activeClub?._id || ''}
            aria-label="Topbar organization switcher"
            onChange={(e) => {
              if (e.target.value === '__onboarding__') {
                navigate('/onboarding');
                return;
              }
              const matched = memberships.find((m) => m.clubId?._id === e.target.value);
              if (matched?.clubId) {
                switchClub(matched.clubId);
                navigate(`/clubs/${matched.clubId._id}`);
              }
            }}
            className="hidden sm:block h-7 rounded-lg border border-border bg-white px-2 text-xs font-semibold text-ink max-w-[180px] focus:border-brand-500 focus:outline-none cursor-pointer"
          >
            {memberships.map((m) => (
              <option key={m.clubId?._id} value={m.clubId?._id}>
                {m.clubId?.shortName || m.clubId?.code || m.clubId?.name}
              </option>
            ))}
            <option value="__onboarding__">+ Add or Join Org</option>
          </select>
        )}

        <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 text-[11px] text-mutedSlate">
          <Calendar className="w-3.5 h-3.5 text-mutedSlate" />
          <span>{activeTermLabel}</span>
        </div>
      </div>

      {/* Middle: Command Palette Quick Search Button */}
      <div className="flex-1 max-w-sm mx-4 hidden sm:block">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl border border-border bg-subtle/70 hover:bg-subtle hover:border-brand-300 text-xs text-mutedSlate transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-brand-500" />
            <span>Search or command…</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded-md bg-surface border border-border text-[10px] font-mono text-mutedSlate">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Notifications, Profile, Logout */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Mobile Search Icon */}
        <button
          onClick={onOpenCommandPalette}
          className="sm:hidden p-1.5 rounded-lg text-mutedSlate hover:text-ink hover:bg-subtle"
          aria-label="Search or command"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 rounded-lg text-mutedSlate hover:text-ink hover:bg-subtle relative focus-visible:outline-brand-500"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-500" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-surface border border-border shadow-elevated p-3 z-50 text-xs animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-border mb-2">
                <span className="font-heading font-bold text-ink">Notifications ({unreadCount})</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] text-brand-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Check className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <div className="text-center py-4 text-mutedSlate text-xs">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => {
                        if (n.link) navigate(n.link);
                        setShowNotifications(false);
                      }}
                      className={`p-2 rounded-lg cursor-pointer transition-colors ${
                        n.isRead
                          ? 'bg-transparent text-mutedSlate'
                          : 'bg-brand-50/70 text-ink font-semibold'
                      } hover:bg-subtle`}
                    >
                      <div className="text-xs font-semibold">{n.title}</div>
                      <div className="text-[11px] text-mutedSlate mt-0.5">{n.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-border">
          <Avatar name={user?.fullName || 'User'} size="sm" src={user?.avatarUrl} />
          <span className="text-xs font-medium text-charcoal-800 hidden md:inline truncate max-w-[120px]">
            {user?.fullName?.split(' ')[0]}
          </span>
          <button
            onClick={logout}
            className="p-1.5 rounded text-charcoal-500 hover:text-red-700 hover:bg-red-50 focus-visible:outline-red-700 ml-1"
            title="Log out"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
