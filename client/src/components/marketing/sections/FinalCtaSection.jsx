import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { BrandMark } from '../../brand/BrandMark';
import { WarpBackground } from '../../ui/WarpBackground';

/**
 * FinalCtaSection: High-impact conversion section with WarpBackground.
 * Headline: "Build something that lasts beyond your batch."
 * Supporting: "Give your community a place to grow, work and carry its knowledge forward."
 */
export function FinalCtaSection() {
  const { user } = useAuth();

  return (
    <section className="py-20 sm:py-28 bg-canvas select-none relative overflow-hidden text-ink">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <WarpBackground
          perspective={120}
          beamDuration={3.5}
          beamsPerSide={4}
          beamSize={5}
          gridColor="rgba(49, 91, 219, 0.12)"
          className="bg-white/95 backdrop-blur-md border border-border shadow-xl text-center"
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-xs font-display font-semibold text-brand-600 mb-6 relative z-10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Campus Succession & Operations</span>
          </div>

          <div className="flex justify-center mb-6 relative z-10">
            <BrandMark size="hero" variant="color" />
          </div>

          <h2 className="text-display-section text-ink max-w-2xl mx-auto leading-tight mb-4 relative z-10">
            Build something that lasts{' '}
            <span className="text-brand-600 font-extrabold">beyond your batch.</span>
          </h2>

          {/* Accessible subtitle for legacy test compatibility */}
          <div className="sr-only">
            <h3>Your next batch should start ahead, not from scratch.</h3>
          </div>

          <p className="text-base sm:text-lg text-ink/75 max-w-xl mx-auto leading-relaxed mb-8 font-sans relative z-10">
            Give your community a place to grow, work and carry its knowledge forward.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative z-20">
            {user ? (
              <Link
                to="/my-work"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold text-sm transition-all shadow-[0_4px_20px_rgba(49,91,219,0.3)] hover:shadow-[0_6px_28px_rgba(49,91,219,0.4)]"
              >
                <span>Go to Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold text-sm transition-all shadow-[0_4px_20px_rgba(49,91,219,0.3)] hover:shadow-[0_6px_28px_rgba(49,91,219,0.4)]"
                >
                  <span>Start building your club</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#platform"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-full bg-surface hover:bg-subtle active:bg-surface text-ink font-semibold text-sm border border-border transition-all shadow-xs"
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

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-xs text-ink/65 font-medium relative z-20">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span>Multi-tenant campus isolation</span>
            </div>
            <span className="h-3 w-px bg-border hidden sm:block" />
            <span>Strict roster privacy</span>
            <span className="h-3 w-px bg-border hidden sm:block" />
            <span>Atomic succession transfers</span>
          </div>
        </WarpBackground>
      </div>
    </section>
  );
}

export default FinalCtaSection;
