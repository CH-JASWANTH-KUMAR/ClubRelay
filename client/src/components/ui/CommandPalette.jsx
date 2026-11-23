import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  LayoutDashboard,
  Calendar,
  CheckSquare,
  BookOpen,
  Users,
  Building2,
  ArrowRightLeft,
  BarChart3,
  CheckCircle2,
  X,
  Plus,
} from 'lucide-react';

export function CommandPalette({ isOpen, onClose }) {
  const { activeClub, memberships, switchClub, user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const clubId = activeClub?._id || memberships[0]?.clubId?._id;
  const isCampusAdmin = user?.campusRole === 'CAMPUS_ADMIN';
  const isFaculty = user?.campusRole === 'FACULTY_COORDINATOR';

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const items = useMemo(() => {
    const list = [
      {
        id: 'nav-my-work',
        category: 'Personal Workspace',
        label: 'My Work - Personal Task Center',
        icon: CheckSquare,
        action: () => navigate('/my-work'),
      },
    ];

    if (clubId) {
      list.push(
        {
          id: 'nav-club-overview',
          category: 'Active Organization',
          label: 'Club Overview Flight Deck',
          icon: LayoutDashboard,
          action: () => navigate(`/clubs/${clubId}`),
        },
        {
          id: 'nav-events',
          category: 'Active Organization',
          label: 'Events & Projects Cockpit',
          icon: Calendar,
          action: () => navigate(`/clubs/${clubId}/events`),
        },
        {
          id: 'nav-members',
          category: 'Active Organization',
          label: 'Member Roster & Roles',
          icon: Users,
          action: () => navigate(`/clubs/${clubId}/members`),
        },
        {
          id: 'nav-memory',
          category: 'Active Organization',
          label: 'Institutional Memory & SOPs',
          icon: BookOpen,
          action: () => navigate(`/clubs/${clubId}/memory`),
        },
        {
          id: 'nav-directory',
          category: 'Active Organization',
          label: 'Sponsors & Vendor Directory',
          icon: Users,
          action: () => navigate(`/clubs/${clubId}/directory`),
        },
        {
          id: 'nav-handover',
          category: 'Active Organization',
          label: 'Leadership Handover Center',
          icon: ArrowRightLeft,
          action: () => navigate(`/clubs/${clubId}/handover`),
        },
        {
          id: 'nav-reports',
          category: 'Active Organization',
          label: 'Annual Reports & CSV Export',
          icon: BarChart3,
          action: () => navigate(`/clubs/${clubId}/reports`),
        }
      );
    }

    if (isCampusAdmin || isFaculty) {
      list.push(
        {
          id: 'nav-campus',
          category: 'Campus Governance',
          label: 'Campus Operations & Clubs',
          icon: Building2,
          action: () => navigate('/campus'),
        },
        {
          id: 'nav-faculty-approvals',
          category: 'Campus Governance',
          label: 'Faculty Advisor Approvals',
          icon: CheckCircle2,
          action: () => navigate('/faculty/approvals'),
        }
      );
    }

    // Switch clubs
    memberships.forEach((m) => {
      const c = m.clubId;
      if (c && c._id !== clubId) {
        list.push({
          id: `switch-${c._id}`,
          category: 'Switch Organization',
          label: `Switch to ${c.name} (${c.code})`,
          icon: Building2,
          action: () => {
            switchClub(c);
            navigate(`/clubs/${c._id}`);
          },
        });
      }
    });

    // Quick Actions
    if (clubId) {
      list.push({
        id: 'action-create-event',
        category: 'Quick Actions',
        label: 'Create New Event Proposal',
        icon: Plus,
        action: () => navigate(`/clubs/${clubId}/events`),
      });
    }

    return list;
  }, [clubId, memberships, isCampusAdmin, isFaculty, navigate, switchClub]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [items, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev === 0 ? Math.max(0, filteredItems.length - 1) : prev - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-charcoal-900/40 backdrop-blur-xs select-none">
      <div
        className="w-full max-w-xl bg-surface rounded-xl border border-border shadow-elevated overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-border gap-3 bg-subtle/30">
          <Search className="w-4 h-4 text-brand-500 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, page, or switch club…"
            className="flex-1 bg-transparent text-xs text-ink placeholder:text-mutedSlate/60 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-mutedSlate hover:text-ink hover:bg-subtle"
            aria-label="Close command palette"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-xs text-mutedSlate">
              No matching commands or pages found.
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-xs transition-colors ${
                    isSelected
                      ? 'bg-brand-50 text-brand-900 font-semibold'
                      : 'text-ink hover:bg-subtle'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 ${
                        isSelected ? 'text-brand-600' : 'text-mutedSlate'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      isSelected
                        ? 'bg-brand-100 text-brand-800'
                        : 'bg-subtle text-mutedSlate'
                    }`}
                  >
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-border bg-canvas text-[11px] text-charcoal-400 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1 py-0.5 rounded bg-subtle border border-border text-[10px] font-mono">
                ↑
              </kbd>{' '}
              <kbd className="px-1 py-0.5 rounded bg-subtle border border-border text-[10px] font-mono">
                ↓
              </kbd>{' '}
              Navigate
            </span>
            <span>
              <kbd className="px-1 py-0.5 rounded bg-subtle border border-border text-[10px] font-mono">
                ↵
              </kbd>{' '}
              Select
            </span>
          </div>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-subtle border border-border text-[10px] font-mono">
              ESC
            </kbd>{' '}
            Close
          </span>
        </div>
      </div>
    </div>
  );
}
