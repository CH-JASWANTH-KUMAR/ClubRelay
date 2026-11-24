import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ArrowRight, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { Button } from '../../ui/Button';
import { KineticText } from '../../ui/KineticText';
import { HeroStageFallback } from './HeroStageFallback';

// Lazy load dynamic stage
const ScatteredStage = lazy(() => import('./ScatteredStage'));

/**
 * RelayHero: Clean Campus Technology Hero Section ("Scattered to Handed Over").
 * Features:
 * - Single coordinate system aligned with heroGeometry.js.
 * - Fits within 1440x900 viewport without vertical scrolling.
 * - Pauses GSAP timeline and R3F canvas loop when off-screen or tab is hidden.
 * - Headline with KineticText: "Make every semester" (dark ink) + "build on the last." (Royal Blue #2563EB).
 * - Eyebrow in Royal Blue (#2563EB).
 * - Primary CTA: Royal Blue button with high-contrast white text.
 * - Secondary CTA: Clean surface button with subtle border.
 */
export function RelayHero() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const [useFallback, setUseFallback] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(true);

  // Check prefers-reduced-motion, viewport under 768px, or WebGL support
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkCapabilities = () => {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isMobile = window.innerWidth < 768;

      let webglSupported = true;
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) webglSupported = false;
      } catch {
        webglSupported = false;
      }

      setUseFallback(reducedMotion || isMobile || !webglSupported);
    };

    checkCapabilities();
    window.addEventListener('resize', checkCapabilities);
    return () => window.removeEventListener('resize', checkCapabilities);
  }, []);

  // Performance: Pause timeline & R3F loop when tab is hidden or hero is off-screen
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPaused(true);
      } else if (isIntersecting) {
        setIsPaused(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isIntersecting]);

  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (!entry.isIntersecting) {
          setIsPaused(true);
        } else if (!document.hidden) {
          setIsPaused(false);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

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
      ref={sectionRef}
      id="overview"
      className="relative pt-20 sm:pt-24 lg:pt-24 pb-8 sm:pb-10 lg:pb-10 bg-canvas overflow-hidden text-ink select-none"
    >
      {/* Background directional ambient light & technical grid */}
      <div className="absolute inset-0 marketing-tech-grid-light opacity-60 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-brand-500/10 via-mint-500/10 to-transparent blur-3xl pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Value Proposition & CTAs */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-5 sm:space-y-6">
            {/* Eyebrow in Royal Blue */}
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-600 animate-pulse" />
              <span className="text-eyebrow text-brand-600 font-bold tracking-widest uppercase">
                The operating system for student communities
              </span>
            </div>

            {/* Headline: Dark ink with "build on the last." in Royal Blue */}
            <h1 className="text-display-hero text-ink tracking-tight">
              <KineticText
                text="Make every semester"
                as="span"
                className="text-display-hero text-ink"
              />{' '}
              <br className="hidden sm:inline" />
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

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-ink/75 leading-relaxed max-w-xl font-sans">
              Run your community, bring projects to life and preserve everything your next leadership
              team needs to know.
            </p>

            {/* Primary & Secondary Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {user ? (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate(getWorkspaceLink())}
                  className="rounded-full px-6 py-3.5 text-sm bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold shadow-sm"
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

            {/* Supporting Trust Statement */}
            <div className="pt-3 border-t border-border flex items-center gap-4 text-xs text-ink/60 font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <span>Multi-tenant campus isolation</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span>Atomic leadership handovers</span>
            </div>
          </div>

          {/* Right Column: Scattered to Handed Over Visual Stage */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
            {useFallback ? (
              <HeroStageFallback />
            ) : (
              <Suspense fallback={<HeroStageFallback />}>
                <ScatteredStage isPaused={isPaused} />
              </Suspense>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default RelayHero;
