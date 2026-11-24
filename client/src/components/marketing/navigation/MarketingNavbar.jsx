import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { BrandLockup } from '../../brand/BrandLockup';
import { Button } from '../../ui/Button';
import { MobileMarketingMenu } from './MobileMarketingMenu';
import { useMarketingScroll } from '../hooks/useMarketingScroll';
import { Menu, ArrowRight, LayoutDashboard } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Platform', href: '#platform' },
  { label: 'Pillars', href: '#product-pillars' },
  { label: 'Handover', href: '#handover' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Communities', href: '#communities' },
];

/**
 * MarketingNavbar: Clean floating pill navigation.
 * Transitions from clean transparent on hero top to a compact frosted pill on scroll.
 */
export function MarketingNavbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrolled, activeSection } = useMarketingScroll([
    'platform',
    'product-pillars',
    'handover',
    'how-it-works',
    'communities',
  ]);

  const getWorkspaceLink = () => {
    if (user?.campusRole === 'CAMPUS_ADMIN') return '/campus';
    if (user?.campusRole === 'FACULTY_COORDINATOR') return '/faculty/approvals';
    if (user?.memberships && user.memberships.length > 0) {
      return `/clubs/${user.memberships[0].clubId._id}`;
    }
    return '/campus';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 transition-all duration-300 py-3 sm:py-4 px-4 sm:px-6">
      <div
        className={`max-w-7xl mx-auto flex items-center justify-between transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-md border border-border shadow-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-full'
            : 'bg-transparent py-1'
        }`}
      >
        {/* Brand identity */}
        <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
          <BrandLockup size="md" variant="color" />
        </Link>

        {/* Desktop Pill Navigation */}
        <nav
          aria-label="Primary navigation"
          className={`hidden lg:flex items-center gap-1 p-1 rounded-full border transition-all ${
            scrolled
              ? 'bg-subtle/70 border-border'
              : 'bg-white/80 backdrop-blur-md border-border shadow-xs'
          }`}
        >
          {NAV_ITEMS.map((item) => {
            const sectionTarget = item.href.replace('#', '');
            const isActive = activeSection === sectionTarget;
            return (
              <a
                key={item.label}
                href={item.href}
                className={`relative px-3.5 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                  isActive
                    ? 'text-brand-600 font-bold'
                    : 'text-ink/75 hover:text-ink hover:bg-subtle'
                }`}
              >
                {isActive && (
                  <span className="absolute inset-0 bg-brand-50 rounded-full -z-10 border border-brand-200/80" />
                )}
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Desktop CTA / Auth State */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(getWorkspaceLink())}
              className="rounded-full px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white shadow-xs"
            >
              <LayoutDashboard className="w-3.5 h-3.5 mr-1.5" />
              <span>Open Your Workspace</span>
            </Button>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-semibold text-ink/80 hover:text-brand-600 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-semibold text-xs transition-all shadow-[0_2px_12px_rgba(49,91,219,0.25)] hover:shadow-[0_4px_16px_rgba(49,91,219,0.35)]"
              >
                <span>Build your club</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2 rounded-xl text-ink/80 hover:text-ink bg-white border border-border transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center shadow-xs"
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Accessible Mobile Menu Drawer */}
      <MobileMarketingMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navItems={NAV_ITEMS}
        activeSection={activeSection}
        user={user}
        getWorkspaceLink={getWorkspaceLink}
      />
    </header>
  );
}

export default MarketingNavbar;
