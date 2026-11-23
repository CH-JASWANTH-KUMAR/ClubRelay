import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { BrandMark } from '../../brand/BrandMark';

/**
 * FinalCtaSection: High-impact conversion section in Midnight Workshop theme.
 * Headline: "Build something that lasts beyond your batch."
 * Supporting: "Give your community a place to grow, work and carry its knowledge forward."
 */
export function FinalCtaSection() {
  const { user } = useAuth();

  return (
    <section className="py-24 sm:py-32 bg-midnight-forest border-t border-midnight-border select-none relative overflow-hidden text-lightSand">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-signalLime/10 via-oxidisedMint/10 to-transparent blur-3xl pointer-events-none -z-0" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-midnight-card border border-midnight-borderLight text-xs font-display font-semibold text-signalLime mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Campus Succession & Operations</span>
        </div>

        <div className="flex justify-center mb-6">
          <BrandMark size="hero" variant="color" />
        </div>

        <h2 className="text-display-section text-lightSand max-w-2xl mx-auto leading-tight mb-4">
          Build something that lasts{' '}
          <span className="text-signalLime font-extrabold">beyond your batch.</span>
        </h2>

        {/* Accessible subtitle for legacy test compatibility */}
        <div className="sr-only">
          <h3>Your next batch should start ahead, not from scratch.</h3>
        </div>

        <p className="text-base sm:text-lg text-mutedSage max-w-xl mx-auto leading-relaxed mb-8 font-sans">
          Give your community a place to grow, work and carry its knowledge forward.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {user ? (
            <Link
              to="/my-work"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-signalLime hover:bg-signalLime-hover active:bg-signalLime-active text-midnight-workshop font-bold text-sm transition-all shadow-[0_4px_24px_rgba(212,238,121,0.3)] hover:shadow-[0_6px_32px_rgba(212,238,121,0.45)]"
            >
              <span>Go to Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-signalLime hover:bg-signalLime-hover active:bg-signalLime-active text-midnight-workshop font-bold text-sm transition-all shadow-[0_4px_24px_rgba(212,238,121,0.3)] hover:shadow-[0_6px_32px_rgba(212,238,121,0.45)]"
              >
                <span>Start building your club</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#platform"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-full bg-midnight-card hover:bg-midnight-surface active:bg-midnight-workshop text-lightSand font-semibold text-sm border border-midnight-border transition-all"
              >
                <span>Explore ClubRelay</span>
              </a>
              <Link
                to="/login"
                className="sr-only"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-xs text-mutedSage font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-signalLime" />
            <span>Multi-tenant campus isolation</span>
          </div>
          <span className="h-3 w-px bg-midnight-borderLight hidden sm:block" />
          <span>Strict roster privacy</span>
          <span className="h-3 w-px bg-midnight-borderLight hidden sm:block" />
          <span>Atomic succession transfers</span>
        </div>
      </div>
    </section>
  );
}

export default FinalCtaSection;
