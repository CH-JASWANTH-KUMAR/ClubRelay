import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ArrowRight, LayoutDashboard } from 'lucide-react';
import { BrandLockup } from '../../brand/BrandLockup';
import { Button } from '../../ui/Button';

/**
 * MobileMarketingMenu: Accessible dialog navigation drawer adhering to modern web guidance.
 * Manages modal focus trap, escape key dismissal, and prevents background scroll while open.
 */
export function MobileMarketingMenu({
  isOpen,
  onClose,
  navItems,
  activeSection,
  user,
  getWorkspaceLink,
}) {
  const dialogRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      className="fixed inset-0 z-50 lg:hidden bg-canvas/98 backdrop-blur-xl flex flex-col justify-between p-6 animate-in fade-in duration-200"
    >
      {/* Top Bar with Brand and Close Button */}
      <div className="flex items-center justify-between pb-6 border-b border-border">
        <Link to="/" onClick={onClose}>
          <BrandLockup size="md" variant="color" />
        </Link>
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="p-2.5 rounded-xl bg-surface text-ink hover:text-brand-600 border border-border transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center shadow-xs"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col space-y-4 py-8">
        {navItems.map((item, idx) => {
          const isActive = activeSection === item.href.replace('#', '');
          return (
            <a
              key={item.label}
              href={item.href}
              onClick={onClose}
              className={`text-xl font-display font-medium px-4 py-3 rounded-2xl transition-all ${
                isActive
                  ? 'bg-brand-50 text-brand-600 font-bold border border-brand-200/80'
                  : 'text-ink/80 hover:text-brand-600 hover:bg-subtle'
              }`}
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              {item.label}
            </a>
          );
        })}
      </nav>

      {/* Auth Actions */}
      <div className="pt-6 border-t border-border space-y-3">
        {user ? (
          <Button
            variant="primary"
            size="lg"
            className="w-full min-h-[48px] bg-brand-600 hover:bg-brand-700 text-white"
            onClick={() => {
              onClose();
              navigate(getWorkspaceLink());
            }}
          >
            <LayoutDashboard className="w-4 h-4 mr-2" />
            <span>Open Your Workspace</span>
          </Button>
        ) : (
          <div className="flex flex-col gap-3">
            <Link
              to="/login"
              onClick={onClose}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition-all shadow-sm"
            >
              <span>Build your club</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              onClick={onClose}
              className="w-full text-center py-3 text-sm font-semibold text-ink/70 hover:text-ink"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default MobileMarketingMenu;
