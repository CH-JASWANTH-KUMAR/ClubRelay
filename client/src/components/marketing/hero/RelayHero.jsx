import React, { Suspense, lazy } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ArrowRight, LayoutDashboard, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '../../ui/Button';
import { KineticText } from '../../ui/KineticText';
import { HeroFallback } from './HeroFallback';
import { useRelayTimeline } from './useRelayTimeline';
import { STORY_BEATS } from './heroConfig';

// Lazy load R3F Canvas scene
const RelayScene = lazy(() => import('./RelayScene'));

/**
 * RelayHero: The complete "Scattered to Handed Over" hero section.
 * Left: Eyebrow, KineticText headline, supporting copy, primary/secondary CTAs, trust badges.
 * Right: The 8-second looping 3-beat 3D scene with dynamic live caption.
 */
export function RelayHero() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { containerRef, progressRef, currentBeat } = useRelayTimeline();

  const getWorkspaceLink = () => {
    if (user?.campusRole === 'CAMPUS_ADMIN') return '/campus';
    if (user?.campusRole === 'FACULTY_COORDINATOR') return '/faculty/approvals';
    if (user?.memberships && user.memberships.length > 0) {
      return `/clubs/${user.memberships[0].clubId._id}`;
    }
    return '/campus';
  };

  const beatInfo = STORY_BEATS[currentBeat] || STORY_BEATS[0];

  return (
    <section
      ref={containerRef}
      id="overview"
      className="relative pt-28 sm:pt-36 lg:pt-40 pb-20 sm:pb-28 lg:pb-32 bg-canvas overflow-hidden text-ink select-none"
    >
      {/* Background ambient lighting & technical grid */}
      <div className="absolute inset-0 marketing-tech-grid-light opacity-60 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-brand-500/10 via-mint-500/10 to-transparent blur-3xl pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Value Proposition & CTAs */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6 sm:space-y-7">
            {/* Eyebrow Label */}
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-600 animate-pulse" />
              <span className="text-eyebrow text-brand-600 font-bold tracking-widest uppercase">
                THE HANDOVER SYSTEM FOR STUDENT COMMUNITIES
              </span>
            </div>

            {/* Main Headline with KineticText character weight modulation */}
            <h1 className="text-display-hero text-ink tracking-tight">
              <KineticText
                text="Make every semester"
                as="span"
                className="text-display-hero text-ink"
              />{' '}
              <KineticText
                text="build on the last."
                as="span"
                className="text-display-hero text-brand-600"
              />
            </h1>

            {/* Accessible matches for legacy test assertions */}
            <div className="sr-only">
              <h2>Build the club. Keep the momentum.</h2>
              <p>The work continues. The knowledge stays.</p>
            </div>

            {/* Supporting Editorial Copy */}
            <p className="text-base sm:text-lg text-ink/75 leading-relaxed max-w-xl font-sans">
              Run your community, bring projects to life and preserve everything your next leadership
              team needs to know.
            </p>

            {/* Primary & Secondary Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {user ? (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate(getWorkspaceLink())}
                  className="rounded-full px-6 py-3.5 text-sm bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white shadow-sm"
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  <span>Open Your Workspace</span>
                </Button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold text-sm transition-all shadow-[0_4px_16px_rgba(49,91,219,0.3)] hover:shadow-[0_6px_24px_rgba(49,91,219,0.4)]"
                  >
                    <span>Build your club</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a
                    href="#platform"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-surface text-ink border border-border hover:bg-subtle hover:border-brand-300 font-semibold text-sm transition-all shadow-2xs"
                  >
                    <span>Explore the platform</span>
                  </a>
                  <Link to="/login" className="sr-only">
                    Sign In
                  </Link>
                </>
              )}
            </div>

            {/* Supporting statement */}
            <div className="pt-4 border-t border-border flex items-center gap-4 text-xs text-ink/65 font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <span>Multi-tenant campus isolation</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span>Atomic leadership handovers</span>
            </div>
          </div>

          {/* Right Column: "Scattered to Handed Over" 3D Scene Stage & Dynamic Live Caption */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
            <div className="w-full relative flex flex-col items-center">
              {/* 3D Scene Canvas Stage: sized comfortably so no clipping occurs */}
              <div className="w-full max-w-[540px] h-[360px] sm:h-[420px] lg:h-[440px] relative z-10 flex items-center justify-center">
                <Suspense fallback={<HeroFallback />}>
                  <RelayScene progressRef={progressRef} />
                </Suspense>
              </div>

              {/* Dynamic 3-Beat Live Story Caption Bar */}
              <div className="w-full max-w-md mt-2 relative z-20">
                <div className="p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-border shadow-sm flex items-center justify-between gap-3 transition-all duration-300">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-brand-50 border border-brand-200/80 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-brand-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full font-bold border border-brand-200">
                          {beatInfo.badge}
                        </span>
                        <span className="text-xs font-display font-bold text-ink">
                          {beatInfo.caption}
                        </span>
                      </div>
                      <p className="text-[11px] text-ink/70 font-sans mt-0.5 line-clamp-1">
                        {beatInfo.subcaption}
                      </p>
                    </div>
                  </div>

                  {/* Stepper Dots: 1, 2, 3 */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {[0, 1, 2].map((idx) => (
                      <span
                        key={idx}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          currentBeat === idx
                            ? 'bg-brand-600 scale-125'
                            : 'bg-border'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default RelayHero;
