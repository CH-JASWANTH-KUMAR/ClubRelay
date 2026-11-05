import React, { useState, useEffect } from 'react';
import { Bell, LogOut, School, Calendar, Check, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/EmptyState';
import { useNavigate } from 'react-router-dom';

export function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await fetch('/api/v1/notifications');
        if (res.ok) {
          const json = await res.json();
          setNotifications(json.data.notifications || []);
          setUnreadCount((json.data.notifications || []).filter((n) => !n.isRead).length);
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
        notifications.filter((n) => !n.isRead).map((n) =>
          fetch(`/api/v1/notifications/${n._id}/read`, { method: 'PUT' })
        )
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="h-14 border-b border-border bg-surface flex items-center justify-between px-6 sticky top-0 z-30 select-none">
      {/* Left: Campus & Term Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-subtle border border-border text-xs text-charcoal-700">
          <School className="w-3.5 h-3.5 text-forest-700" />
          <span className="font-semibold text-charcoal-900">{user?.campusId?.name || 'Campus'}</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 text-[11px] text-charcoal-500">
          <Calendar className="w-3.5 h-3.5 text-charcoal-400" />
          <span>2025-2026 Term</span>
        </div>
      </div>

      {/* Right: Notifications, Profile, Logout */}
      <div className="flex items-center gap-3">
        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 rounded text-charcoal-600 hover:text-charcoal-900 hover:bg-subtle relative focus-visible:outline-forest-700"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-600" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-lg bg-surface border border-border shadow-elevated p-3 z-50 text-xs animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-border mb-2">
                <span className="font-semibold text-charcoal-900">Notifications ({unreadCount})</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] text-forest-700 hover:underline flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <div className="text-center py-4 text-charcoal-400 text-xs">
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
                      className={`p-2 rounded cursor-pointer transition-colors ${
                        n.isRead ? 'bg-transparent text-charcoal-600' : 'bg-forest-50/50 text-charcoal-900 font-medium'
                      } hover:bg-subtle`}
                    >
                      <div className="text-xs font-semibold">{n.title}</div>
                      <div className="text-[11px] text-charcoal-500 mt-0.5">{n.message}</div>
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
