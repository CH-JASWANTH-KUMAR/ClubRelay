import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { BrandMark } from '../brand/BrandMark';

export function FinalCtaSection() {
  const { user } = useAuth();

  return (
    <section className="py-20 md:py-28 bg-surface border-t border-border select-none relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-xs font-semibold text-brand-700 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>Campus Succession & Operations</span>
        </div>

        <div className="flex justify-center mb-6">
          <BrandMark size="hero" />
        </div>

        <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ink tracking-tight max-w-3xl mx-auto leading-[1.15] mb-4">
          Your next batch should start ahead,{' '}
          <span className="text-brand-500">not from scratch.</span>
        </h2>

        <p className="text-base sm:text-lg text-mutedSlate max-w-2xl mx-auto leading-relaxed mb-8 font-sans">
          Centralize student memberships, run events with faculty oversight, and ensure institutional knowledge
          outlasts graduation cycles.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {user ? (
            <Link
              to="/my-work"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-semibold text-sm transition-colors shadow-subtle"
            >
              <span>Go to Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <a
                href="#product-preview"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-semibold text-sm transition-colors shadow-subtle"
              >
                <span>Explore ClubRelay</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-xl bg-canvas hover:bg-subtle active:bg-muted text-ink font-semibold text-sm border border-border transition-colors shadow-subtle"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-mutedSlate font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-mint-500" />
            <span>Multi-tenant campus isolation</span>
          </div>
          <span className="h-3 w-px bg-border hidden sm:block" />
          <span>Strict roster privacy</span>
          <span className="h-3 w-px bg-border hidden sm:block" />
          <span>Atomic succession transfers</span>
        </div>
      </div>
    </section>
  );
}

export default FinalCtaSection;
