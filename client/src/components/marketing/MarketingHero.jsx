import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RelayMascot } from '../brand/RelayMascot';
import {
  ArrowRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  FileCheck2,
  Users,
  Terminal,
} from 'lucide-react';

export function MarketingHero() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const heroRef = useRef(null);

  const getWorkspaceLink = () => {
    if (user?.campusRole === 'CAMPUS_ADMIN') return '/campus';
    if (user?.campusRole === 'FACULTY_COORDINATOR') return '/faculty/approvals';
    if (user?.memberships && user.memberships.length > 0) {
      return `/clubs/${user.memberships[0].clubId._id}`;
    }
    return '/campus';
  };

  return (
    <section
      ref={heroRef}
      className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden select-none bg-canvas"
    >
      {/* Background soft ambient accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-50/40 via-transparent to-transparent pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Pill Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-xs font-semibold text-ink shadow-subtle">
              <span className="w-2 h-2 rounded-full bg-mint-500 animate-pulse" />
              <span className="text-brand-600 font-bold">Campus Energy</span>
              <span className="text-mutedSlate">·</span>
              <span className="text-mutedSlate font-medium">Built for Student Clubs</span>
            </div>

            {/* Hero Main Headline */}
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink tracking-tight leading-[1.1]">
              Build the club. <br />
              <span className="text-brand-500">Keep the momentum.</span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-mutedSlate max-w-2xl mx-auto lg:mx-0 leading-relaxed font-sans">
              The institutional memory and operations platform for collegiate organizations and student clubs.
            </p>

            {/* Tagline Callout */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sunshine-50 border border-sunshine-200 text-xs text-sunshine-800 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-sunshine-600 flex-shrink-0" />
              <span>The work continues. The knowledge stays.</span>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              {user ? (
                <button
                  onClick={() => navigate(getWorkspaceLink())}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-semibold text-sm transition-colors shadow-subtle"
                >
                  <span>Open Your Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <a
                    href="#preview"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-semibold text-sm transition-colors shadow-subtle"
                  >
                    <span>Explore ClubRelay</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl bg-surface hover:bg-subtle active:bg-muted text-ink font-semibold text-sm border border-border transition-colors shadow-subtle"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>

            {/* Trust highlights */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-mutedSlate font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-mint-500" /> Multi-tenant Campus Security
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-mint-500" /> Atomic Role Transitions
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-mint-500" /> Complete Roster Privacy
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Relay Mascot & Floating Cockpit Preview */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
            {/* Mascot Container */}
            <div className="relative p-6 rounded-3xl bg-surface border border-border shadow-elevated flex flex-col items-center">
              {/* Floating Event Pill */}
              <div className="absolute -top-4 -left-4 sm:-left-8 bg-surface border border-border rounded-xl p-2.5 shadow-card flex items-center gap-2 text-xs animate-in fade-in duration-300">
                <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-ink block leading-none">DevFest 2026</span>
                  <span className="text-[10px] text-mint-600 font-medium">Status: Approved</span>
                </div>
              </div>

              {/* Floating Handover Status Pill */}
              <div className="absolute -bottom-4 -right-2 sm:-right-6 bg-surface border border-border rounded-xl p-2.5 shadow-card flex items-center gap-2 text-xs animate-in fade-in duration-300">
                <div className="w-7 h-7 rounded-lg bg-mint-50 text-mint-600 flex items-center justify-center flex-shrink-0">
                  <FileCheck2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-ink block leading-none">Succession Package</span>
                  <span className="text-[10px] text-brand-600 font-medium">100% Handover Ready</span>
                </div>
              </div>

              {/* Central Mascot with scoped eye tracking */}
              <div className="py-2">
                <RelayMascot size="hero" containerRef={heroRef} />
              </div>

              <div className="text-center mt-2">
                <span className="text-xs font-bold text-ink block">Meet Relay</span>
                <span className="text-[11px] text-mutedSlate">
                  The campus continuity companion. Watching your club succeed.
                </span>
              </div>
            </div>

            {/* Quick stats mini row below mascot */}
            <div className="flex items-center gap-3 mt-8 text-xs text-mutedSlate">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-brand-500" /> Active Roster Management
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-mint-600" /> Technical Projects
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
