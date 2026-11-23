import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BrandLockup } from '../brand/BrandLockup';
import { ArrowRight, Sparkles } from 'lucide-react';

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
    <footer className="bg-canvas border-t border-border select-none">
      {/* Final Call To Action Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-brand-600 via-brand-700 to-ink text-white text-center sm:text-left flex flex-col md:flex-row items-center justify-between gap-8 shadow-elevated">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white font-semibold text-xs border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-sunshine-400" />
              <span>Campus Continuity Guaranteed</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Your next batch should start ahead, not from scratch.
            </h2>
            <p className="text-sm text-white/80 leading-relaxed font-sans">
              Set up your campus student club workspace today. Experience structured events, delegation boards,
              and orderly leadership successions.
            </p>
          </div>

          <div className="flex-shrink-0">
            {user ? (
              <button
                onClick={() => navigate(getWorkspaceLink())}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-brand-700 font-bold text-sm hover:bg-canvas transition-colors shadow-elevated"
              >
                <span>Open Your Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-brand-700 font-bold text-sm hover:bg-canvas transition-colors shadow-elevated"
              >
                <span>Bring your club to ClubRelay</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Footer Navigation & Brand Row */}
      <div className="border-t border-border bg-surface py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1: Brand Identity */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2">
                <BrandLockup size="md" />
              </div>
              <p className="text-xs text-mutedSlate leading-relaxed">
                The university student organization continuity and operations platform.
              </p>
              <div className="text-[11px] font-semibold text-brand-600">
                Build the club. Keep the momentum.
              </div>
            </div>

            {/* Col 2: Product Pillars */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-ink block mb-2 font-heading">Product Pillars</span>
              <div>
                <a href="#product-pillars" className="text-mutedSlate hover:text-ink transition-colors">
                  Community & Rosters
                </a>
              </div>
              <div>
                <a href="#product-pillars" className="text-mutedSlate hover:text-ink transition-colors">
                  7-Stage Event Cockpit
                </a>
              </div>
              <div>
                <a href="#product-pillars" className="text-mutedSlate hover:text-ink transition-colors">
                  Engineering Projects
                </a>
              </div>
              <div>
                <a href="#product-pillars" className="text-mutedSlate hover:text-ink transition-colors">
                  Leadership Handover
                </a>
              </div>
            </div>

            {/* Col 3: Workspaces */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-ink block mb-2 font-heading">Workspace</span>
              <div>
                <Link to="/login" className="text-mutedSlate hover:text-ink transition-colors">
                  Campus Operations
                </Link>
              </div>
              <div>
                <Link to="/login" className="text-mutedSlate hover:text-ink transition-colors">
                  Club Overview
                </Link>
              </div>
              <div>
                <Link to="/login" className="text-mutedSlate hover:text-ink transition-colors">
                  My Work Tasks
                </Link>
              </div>
              <div>
                <Link to="/login" className="text-mutedSlate hover:text-ink transition-colors">
                  Faculty Approvals
                </Link>
              </div>
            </div>

            {/* Col 4: University Trust */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-ink block mb-2 font-heading">Security & Platform</span>
              <div>
                <span className="text-mutedSlate">Multi-Tenant Campus Isolation</span>
              </div>
              <div>
                <span className="text-mutedSlate">Strict Roster Role Verification</span>
              </div>
              <div>
                <span className="text-mutedSlate">Atomic Succession Transactions</span>
              </div>
              <div className="pt-2">
                <Link to="/login" className="font-bold text-brand-600 hover:underline">
                  Sign In to Account
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-mutedSlate">
            <div>
              © 2026 ClubRelay Systems. Built for collegiate student communities.
            </div>
            <div className="flex items-center gap-4">
              <span>The work continues. The knowledge stays.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
