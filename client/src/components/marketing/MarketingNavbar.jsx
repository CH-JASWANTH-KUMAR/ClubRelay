import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RelayMascot } from '../brand/RelayMascot';
import { Menu, X, ArrowRight, LayoutDashboard } from 'lucide-react';

export function MarketingNavbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getWorkspaceLink = () => {
    if (user?.campusRole === 'CAMPUS_ADMIN') return '/campus';
    if (user?.campusRole === 'FACULTY_COORDINATOR') return '/faculty/approvals';
    if (user?.memberships && user.memberships.length > 0) {
      return `/clubs/${user.memberships[0].clubId._id}`;
    }
    return '/campus';
  };

  return (
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <RelayMascot size="sm" interactive={false} />
          <div>
            <span className="font-heading font-extrabold text-base tracking-tight text-ink block leading-none">
              ClubRelay
            </span>
            <span className="text-[10px] font-medium text-brand-600 block mt-0.5">
              Campus Energy
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-ink/80">
          <a href="#product-pillars" className="hover:text-brand-600 transition-colors">
            Product
          </a>
          <a href="#how-it-works" className="hover:text-brand-600 transition-colors">
            How It Works
          </a>
          <a href="#communities" className="hover:text-brand-600 transition-colors">
            Communities
          </a>
          <a href="#preview" className="hover:text-brand-600 transition-colors">
            Workspace Preview
          </a>
        </nav>

        {/* Desktop CTA / Auth State */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <button
              onClick={() => navigate(getWorkspaceLink())}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-medium text-xs transition-colors shadow-subtle"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Go to Workspace</span>
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-semibold text-ink/80 hover:text-ink transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-semibold text-xs transition-colors shadow-subtle"
              >
                <span>Explore Platform</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 rounded text-ink/70 hover:text-ink hover:bg-subtle transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-surface px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-2 text-xs font-semibold text-ink/80">
            <a
              href="#product-pillars"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-brand-600 transition-colors"
            >
              Product Pillars
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-brand-600 transition-colors"
            >
              How It Works
            </a>
            <a
              href="#communities"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-brand-600 transition-colors"
            >
              Target Communities
            </a>
            <a
              href="#preview"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-brand-600 transition-colors"
            >
              Workspace Preview
            </a>
          </nav>
          <div className="pt-3 border-t border-border flex flex-col gap-2">
            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate(getWorkspaceLink());
                }}
                className="w-full py-2 rounded-lg bg-brand-500 text-white font-semibold text-xs text-center"
              >
                Go to Workspace
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 rounded-lg border border-border text-center text-xs font-semibold text-ink"
                >
                  Sign In
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 rounded-lg bg-brand-500 text-white text-center text-xs font-semibold"
                >
                  Explore Platform
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

