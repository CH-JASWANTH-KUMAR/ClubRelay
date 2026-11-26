import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { BrandLockup } from '../../brand/BrandLockup';
import { ArrowRight, ShieldCheck } from 'lucide-react';

/**
 * MarketingFooter: Clean canvas footer with clear typography and genuine links.
 */
export function MarketingFooter() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getWorkspaceLink = () => {
    if (user?.campusRole === 'CAMPUS_ADMIN') return '/campus';
    if (user?.campusRole === 'FACULTY_COORDINATOR') return '/faculty/approvals';
    if (user?.memberships && user.memberships.length > 0) {
      return `/clubs/${user.memberships[0].clubId._id}`;
    }
    return '/campus';
  };

  return (
    <footer className="bg-surface border-t border-border text-ink select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Col 1: Brand Identity */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <BrandLockup size="md" variant="color" />
            </div>
            <p className="text-xs text-ink/70 leading-relaxed font-sans">
              The university student community operations and continuity platform.
            </p>
            <div className="text-xs font-display font-bold text-brand-600">
              Make every semester build on the last.
            </div>
          </div>

          {/* Col 2: Product Pillars */}
          <div className="space-y-2.5 text-xs">
            <span className="font-bold text-ink block mb-3 font-display uppercase tracking-wider text-[11px]">
              Product Pillars
            </span>
            <div>
              <a href="#product-pillars" className="text-ink/70 hover:text-brand-600 transition-colors">
                Community & Rosters
              </a>
            </div>
            <div>
              <a href="#product-pillars" className="text-ink/70 hover:text-brand-600 transition-colors">
                7-Stage Event Lifecycle
              </a>
            </div>
            <div>
              <a href="#product-pillars" className="text-ink/70 hover:text-brand-600 transition-colors">
                Engineering Projects
              </a>
            </div>
            <div>
              <a href="#product-pillars" className="text-ink/70 hover:text-brand-600 transition-colors">
                Leadership Handover
              </a>
            </div>
          </div>

          {/* Col 3: Platform & Continuity */}
          <div className="space-y-2.5 text-xs">
            <span className="font-bold text-ink block mb-3 font-display uppercase tracking-wider text-[11px]">
              Platform & Features
            </span>
            <div>
              <a href="#platform" className="text-ink/70 hover:text-brand-600 transition-colors">
                Club Workspace
              </a>
            </div>
            <div>
              <a href="#handover" className="text-ink/70 hover:text-brand-600 transition-colors">
                Succession Protocol
              </a>
            </div>
            <div>
              <a href="#communities" className="text-ink/70 hover:text-brand-600 transition-colors">
                Collegiate Ecosystem
              </a>
            </div>
            <div>
              <a href="#how-it-works" className="text-ink/70 hover:text-brand-600 transition-colors">
                How It Works
              </a>
            </div>
          </div>

          {/* Col 4: Account Actions */}
          <div className="space-y-3 text-xs">
            <span className="font-bold text-ink block mb-3 font-display uppercase tracking-wider text-[11px]">
              Get Started
            </span>
            {user ? (
              <button
                onClick={() => navigate(getWorkspaceLink())}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold transition-colors shadow-2xs"
              >
                <span>Open Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold transition-colors shadow-2xs"
                >
                  <span>Build your club</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/login"
                  className="w-full inline-flex items-center justify-center px-4 py-2 rounded-full bg-subtle border border-border hover:bg-white text-ink font-medium transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Copyright & Campus Isolation Statement */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-ink/60 gap-4">
          <p>© {new Date().getFullYear()} ClubRelay. All rights reserved.</p>
          <div className="flex items-center gap-2 text-ink/65">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            <span>Multi-tenant campus isolation · Secure role custody</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default MarketingFooter;
