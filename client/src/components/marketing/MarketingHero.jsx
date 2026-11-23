import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  ArrowRight,
  CheckCircle2,
  Calendar,
  Sparkles,
  Layers,
  ArrowRightLeft,
  Building2,
} from 'lucide-react';

export function MarketingHero() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const mockupRef = useRef(null);

  const getWorkspaceLink = () => {
    if (user?.campusRole === 'CAMPUS_ADMIN') return '/campus';
    if (user?.campusRole === 'FACULTY_COORDINATOR') return '/faculty/approvals';
    if (user?.memberships && user.memberships.length > 0) {
      return `/clubs/${user.memberships[0].clubId._id}`;
    }
    return '/campus';
  };

  useGSAP(
    () => {
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isHeadless =
        typeof navigator !== 'undefined' &&
        /HeadlessChrome/.test(navigator.userAgent);

      if (prefersReducedMotion || isHeadless) {
        gsap.set(
          [
            '.hero-badge',
            '.hero-title',
            '.hero-subhead',
            '.hero-desc',
            '.hero-actions',
            '.hero-mockup-frame',
          ],
          {
            opacity: 1,
            y: 0,
            scale: 1,
            clearProps: 'all',
          }
        );
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from('.hero-badge', {
        opacity: 0,
        y: -12,
        duration: 0.5,
      })
        .from(
          '.hero-title',
          {
            opacity: 0,
            y: 24,
            duration: 0.7,
            stagger: 0.12,
          },
          '-=0.2'
        )
        .from(
          '.hero-subhead',
          {
            opacity: 0,
            y: 16,
            duration: 0.5,
          },
          '-=0.3'
        )
        .from(
          '.hero-desc',
          {
            opacity: 0,
            y: 16,
            duration: 0.5,
          },
          '-=0.3'
        )
        .from(
          '.hero-actions',
          {
            opacity: 0,
            y: 16,
            duration: 0.5,
          },
          '-=0.3'
        )
        .from(
          '.hero-mockup-frame',
          {
            opacity: 0,
            y: 36,
            scale: 0.96,
            duration: 0.8,
            ease: 'back.out(1.2)',
          },
          '-=0.4'
        );
    },
    { scope: heroRef }
  );

  return (
    <section
      ref={heroRef}
      className="relative pt-10 pb-16 md:pt-16 md:pb-24 select-none bg-canvas overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto space-y-5 mb-10">
          {/* Eyebrow Pill */}
          <div className="hero-badge inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-xs font-semibold text-ink shadow-subtle">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            <span className="text-brand-600 font-bold">The work continues. The knowledge stays.</span>
            <span className="text-mutedSlate">·</span>
            <span className="text-mutedSlate font-medium">Independent Student Tech Culture</span>
          </div>

          {/* Main Headline */}
          <h2 className="sr-only">Build the club. Keep the momentum.</h2>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink tracking-tight leading-[1.08]">
            <span className="hero-title block">Your club deserves</span>
            <span className="hero-title block text-brand-500">more than chat.</span>
          </h1>

          {/* Supporting Headline */}
          <p className="hero-subhead text-lg sm:text-xl font-bold text-ink-700 tracking-tight">
            Build things that outlast semesters.
          </p>

          {/* Description */}
          <p className="hero-desc text-sm sm:text-base text-mutedSlate max-w-2xl mx-auto leading-relaxed font-sans">
            Plan events, bring people together, coordinate projects and make sure the next team knows exactly where to continue.
          </p>

          {/* Actions */}
          <div className="hero-actions flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {user ? (
              <button
                onClick={() => navigate(getWorkspaceLink())}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-semibold text-sm transition-colors shadow-subtle cursor-pointer"
              >
                <span>Open Your Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <a
                  href="#product-preview"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-semibold text-sm transition-colors shadow-subtle cursor-pointer"
                >
                  <span>Explore ClubRelay</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <Link
                  to="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-surface hover:bg-subtle active:bg-muted text-ink font-semibold text-sm border border-border transition-colors shadow-subtle"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Large Art-Directed Product Preview (Hero Stage) */}
        <div ref={mockupRef} className="hero-mockup-frame max-w-5xl mx-auto">
          <div className="rounded-3xl bg-surface border border-border p-4 sm:p-6 shadow-elevated">
            {/* Mockup Window Chrome Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border mb-5">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-coral-400" />
                  <span className="w-3 h-3 rounded-full bg-sunshine-400" />
                  <span className="w-3 h-3 rounded-full bg-mint-400" />
                </div>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-2 text-xs font-semibold text-ink">
                  <Building2 className="w-3.5 h-3.5 text-brand-500" />
                  <span>Google Developer Group</span>
                  <span className="text-mutedSlate font-normal">· Pacific Coast University</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-mint-700 bg-mint-50 px-2.5 py-0.5 rounded-full border border-mint-200">
                  SPRING 2026 ACTIVE
                </span>
              </div>
            </div>

            {/* Inner Dashboard Cockpit Preview */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Left Column: KPI Stats & Handover Health */}
              <div className="md:col-span-4 space-y-3">
                <div className="p-4 rounded-2xl bg-canvas border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-mutedSlate">Active Members</span>
                    <span className="text-[11px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                      Full Roster
                    </span>
                  </div>
                  <div className="mt-2 text-2xl font-extrabold text-ink">24 Members</div>
                  <p className="mt-0.5 text-[11px] text-mutedSlate">4 Executive Leads · 20 Core</p>
                </div>

                <div className="p-4 rounded-2xl bg-canvas border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-mutedSlate">Handover Health</span>
                    <span className="text-[11px] font-bold text-mint-700 bg-mint-50 px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                  </div>
                  <div className="mt-2 text-2xl font-extrabold text-mint-600">7 of 7 Sections</div>
                  <div className="w-full bg-border h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-mint-500 h-full w-full rounded-full" />
                  </div>
                  <p className="mt-1.5 text-[11px] text-mutedSlate">Atomic Role Handover Ready</p>
                </div>
              </div>

              {/* Right Column: Active Event Cockpit */}
              <div className="md:col-span-8 p-4 rounded-2xl bg-canvas border border-border flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-sm text-ink leading-tight">
                          DevFest 2026 Summit
                        </h4>
                        <span className="text-[11px] text-mutedSlate flex items-center gap-1.5">
                          <span>CS Auditorium</span>
                          <span className="text-border">/</span>
                          <span>Oct 24, 2026</span>
                          <span className="text-border">/</span>
                          <span>Budget: $1,200</span>
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                      Approved
                    </span>
                  </div>

                  {/* 7-Stage Lifecycle Bar */}
                  <div className="mt-4 flex items-center justify-between text-[11px] font-semibold text-mutedSlate border-b border-border pb-3">
                    <span className="text-mint-600">✓ Draft</span>
                    <span className="text-mint-600">✓ Proposed</span>
                    <span className="text-brand-600 font-bold">● Approved</span>
                    <span>Planning</span>
                    <span>In Progress</span>
                    <span>Completed</span>
                  </div>

                  {/* Task Kanban Snippet */}
                  <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-surface border border-border">
                      <span className="text-[10px] font-bold text-mutedSlate block">Tasks (18/20)</span>
                      <p className="text-[11px] font-semibold text-ink mt-1 truncate">AV Equipment Permit</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-surface border border-border">
                      <span className="text-[10px] font-bold text-brand-600 block">Lead Sponsor</span>
                      <p className="text-[11px] font-semibold text-ink mt-1 truncate">AWS Cloud Credits</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-surface border border-border">
                      <span className="text-[10px] font-bold text-mint-600 block">Faculty Advisor</span>
                      <p className="text-[11px] font-semibold text-ink mt-1 truncate">Dr. Marcus Vance</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-mutedSlate">
                  <span className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-mint-500" />
                    <span>Real operational flight deck</span>
                  </span>
                  <a
                    href="#product-preview"
                    className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 font-semibold text-xs transition-colors"
                  >
                    <span>Inspect Interactive Tour</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MarketingHero;
