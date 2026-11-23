import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { BrandLockup } from '../../brand/BrandLockup';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

/**
 * MarketingFooter: Midnight Workshop dark footer with clear typography and genuine links.
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
    <footer className="bg-midnight-workshop border-t border-midnight-border text-lightSand select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Col 1: Brand Identity */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <BrandLockup size="md" variant="dark-surface" />
            </div>
            <p className="text-xs text-mutedSage leading-relaxed">
              The university student community operations and continuity platform.
            </p>
            <div className="text-xs font-display font-semibold text-signalLime">
              Make every semester build on the last.
            </div>
          </div>

          {/* Col 2: Product Pillars */}
          <div className="space-y-2.5 text-xs">
            <span className="font-bold text-lightSand block mb-3 font-display uppercase tracking-wider text-[11px]">
              Product Pillars
            </span>
            <div>
              <a href="#product-pillars" className="text-mutedSage hover:text-signalLime transition-colors">
                Community & Rosters
              </a>
            </div>
            <div>
              <a href="#product-pillars" className="text-mutedSage hover:text-signalLime transition-colors">
                7-Stage Event Lifecycle
              </a>
            </div>
            <div>
              <a href="#product-pillars" className="text-mutedSage hover:text-signalLime transition-colors">
                Engineering Projects
              </a>
            </div>
            <div>
              <a href="#product-pillars" className="text-mutedSage hover:text-signalLime transition-colors">
                Leadership Handover
              </a>
            </div>
          </div>

          {/* Col 3: Platform & Continuity */}
          <div className="space-y-2.5 text-xs">
            <span className="font-bold text-lightSand block mb-3 font-display uppercase tracking-wider text-[11px]">
              Platform & Features
            </span>
            <div>
              <a href="#platform" className="text-mutedSage hover:text-signalLime transition-colors">
                Club Workspace
              </a>
            </div>
            <div>
              <a href="#handover" className="text-mutedSage hover:text-signalLime transition-colors">
                Succession Protocol
              </a>
            </div>
            <div>
              <a href="#communities" className="text-mutedSage hover:text-signalLime transition-colors">
                Collegiate Ecosystem
              </a>
            </div>
            <div>
              <a href="#how-it-works" className="text-mutedSage hover:text-signalLime transition-colors">
                How It Works
              </a>
            </div>
          </div>

          {/* Col 4: Account Actions */}
          <div className="space-y-3 text-xs">
            <span className="font-bold text-lightSand block mb-3 font-display uppercase tracking-wider text-[11px]">
              Get Started
            </span>
            {user ? (
              <button
                onClick={() => navigate(getWorkspaceLink())}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-signalLime hover:bg-signalLime-hover active:bg-signalLime-active text-midnight-workshop font-bold transition-colors"
              >
                <span>Open Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-signalLime hover:bg-signalLime-hover active:bg-signalLime-active text-midnight-workshop font-bold transition-colors"
                >
                  <span>Build your club</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/login"
                  className="w-full inline-flex items-center justify-center px-4 py-2 rounded-full bg-midnight-card border border-midnight-border hover:bg-midnight-forest text-lightSand transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Copyright & Campus Isolation Statement */}
        <div className="mt-12 pt-6 border-t border-midnight-border flex flex-col sm:flex-row items-center justify-between text-xs text-mutedSage gap-4">
          <p>© {new Date().getFullYear()} ClubRelay. All rights reserved.</p>
          <div className="flex items-center gap-2 text-mutedSage">
            <ShieldCheck className="w-4 h-4 text-oxidisedMint" />
            <span>Multi-tenant campus isolation · Secure role custody</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default MarketingFooter;
