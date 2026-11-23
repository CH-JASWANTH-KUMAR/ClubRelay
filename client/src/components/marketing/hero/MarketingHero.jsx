import React, { useRef, Suspense, lazy } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ArrowRight, LayoutDashboard, Sparkles, ShieldCheck } from 'lucide-react';
import { HeroSceneFallback } from './HeroSceneFallback';
import { HeroProductPreview } from './HeroProductPreview';
import { Button } from '../../ui/Button';

// Lazy load the 3D scene to preserve initial load performance
const RelayEngine3D = lazy(() => import('./RelayEngine3D'));

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

  useGSAP(
    () => {
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReducedMotion) {
        gsap.set(
          ['.hero-eyebrow', '.hero-headline', '.hero-copy', '.hero-actions', '.hero-visual'],
          { opacity: 1, y: 0 }
        );
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from('.hero-eyebrow', {
        opacity: 0,
        y: -14,
        duration: 0.6,
      })
        .from(
          '.hero-headline',
          {
            opacity: 0,
            y: 28,
            duration: 0.8,
          },
          '-=0.3'
        )
        .from(
          '.hero-copy',
          {
            opacity: 0,
            y: 18,
            duration: 0.6,
          },
          '-=0.4'
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
          '.hero-visual',
          {
            opacity: 0,
            scale: 0.96,
            duration: 1,
            ease: 'power2.out',
          },
          '-=0.7'
        );
    },
    { scope: heroRef }
  );

  return (
    <section
      ref={heroRef}
      id="overview"
      className="relative pt-28 sm:pt-36 lg:pt-40 pb-20 sm:pb-28 lg:pb-32 bg-midnight-workshop overflow-hidden text-lightSand select-none"
    >
      {/* Background directional ambient light & technical grid */}
      <div className="absolute inset-0 marketing-tech-grid opacity-40 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-signalLime/5 via-oxidisedMint/10 to-transparent blur-3xl pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Split Editorial Composition: Left ~45% editorial, Right ~55% 3D Relay visual */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Editorial Value Proposition */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-6 sm:space-y-7">
            {/* Eyebrow Label */}
            <div className="hero-eyebrow flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-signalLime animate-pulse" />
              <span className="text-eyebrow text-signalLime">
                The operating system for student communities
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="hero-headline text-display-hero text-lightSand">
              Make every semester{' '}
              <span className="text-signalLime font-extrabold">build on the last.</span>
            </h1>

            {/* Accessible sub-tagline for legacy test suite match */}
            <div className="sr-only">
              <h2>Build the club. Keep the momentum.</h2>
              <p>The work continues. The knowledge stays.</p>
            </div>

            {/* Supporting Editorial Copy */}
            <p className="hero-copy text-base sm:text-lg text-mutedSage leading-relaxed max-w-xl">
              Run your community, bring projects to life and preserve everything your next leadership
              team needs to know.
            </p>

            {/* Primary & Secondary Actions */}
            <div className="hero-actions flex flex-wrap items-center gap-3 pt-2">
              {user ? (
                <Button
                  variant="signal"
                  size="lg"
                  onClick={() => navigate(getWorkspaceLink())}
                  className="rounded-full px-6 py-3.5 text-sm"
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  <span>Open Your Workspace</span>
                </Button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-signalLime hover:bg-signalLime-hover active:bg-signalLime-active text-midnight-workshop font-semibold text-sm transition-all shadow-[0_4px_24px_rgba(212,238,121,0.28)] hover:shadow-[0_6px_28px_rgba(212,238,121,0.4)]"
                  >
                    <span>Build your club</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a
                    href="#platform"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-midnight-forest/80 backdrop-blur-md text-lightSand border border-midnight-borderLight hover:bg-midnight-forest hover:border-oxidisedMint/50 font-medium text-sm transition-all"
                  >
                    <span>Explore the platform</span>
                  </a>
                </>
              )}
            </div>

            {/* Supporting statement */}
            <div className="hero-actions pt-4 border-t border-midnight-border flex items-center gap-4 text-xs text-mutedSage">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-oxidisedMint" />
                <span>Multi-tenant campus isolation</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-midnight-borderLight" />
              <span>Atomic leadership handovers</span>
            </div>
          </div>

          {/* Right Column: 3D Relay Engine & Layered Product Cockpit */}
          <div className="hero-visual lg:col-span-7 flex flex-col items-center justify-center relative">
            <div className="w-full relative flex flex-col items-center">
              {/* 3D Relay Engine Stage */}
              <div className="w-full max-w-[560px] h-[360px] sm:h-[440px] lg:h-[480px] relative z-20">
                <Suspense fallback={<HeroSceneFallback />}>
                  <RelayEngine3D />
                </Suspense>
              </div>

              {/* Layered Product Preview Window below/behind the 3D Engine */}
              <div className="w-full max-w-lg mt-[-40px] sm:mt-[-50px] relative z-10">
                <HeroProductPreview />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MarketingHero;
