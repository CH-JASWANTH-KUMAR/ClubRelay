import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Sparkles } from 'lucide-react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { EventCockpitPanel } from './product/EventCockpitPanel';
import { MyWorkPanel } from './product/MyWorkPanel';
import { TeamMembersPanel } from './product/TeamMembersPanel';
import { EngineeringProjectsPanel } from './product/EngineeringProjectsPanel';
import { InstitutionalMemoryPanel } from './product/InstitutionalMemoryPanel';
import { LeadershipHandoverPanel } from './product/LeadershipHandoverPanel';

const MODULES = [
  {
    id: 'events',
    num: '01',
    title: 'Event Cockpit',
    desc: 'Coordinate multi-stage events, delegate roles, and track dependencies.',
    panelComponent: EventCockpitPanel,
  },
  {
    id: 'work',
    num: '02',
    title: 'My Work',
    desc: 'Consolidated personal responsibilities and milestones across all your clubs.',
    panelComponent: MyWorkPanel,
  },
  {
    id: 'team',
    num: '03',
    title: 'Team and Members',
    desc: 'Maintain roster continuity and officer transitions across terms.',
    panelComponent: TeamMembersPanel,
  },
  {
    id: 'engineering',
    num: '04',
    title: 'Engineering Projects',
    desc: 'Track club software repositories, maintainers, and runbooks.',
    panelComponent: EngineeringProjectsPanel,
  },
  {
    id: 'memory',
    num: '05',
    title: 'Institutional Memory',
    desc: 'Search playbooks, vendor contacts, and documented operating procedures.',
    panelComponent: InstitutionalMemoryPanel,
  },
  {
    id: 'handover',
    num: '06',
    title: 'Leadership Handover',
    desc: 'Structured 8-section succession dossiers verified before transition.',
    panelComponent: LeadershipHandoverPanel,
  },
];

export function ProductExperienceSection() {
  const [activeId, setActiveId] = useState('events');
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const [isDocVisible, setIsDocVisible] = useState(() =>
    typeof document !== 'undefined' ? document.visibilityState === 'visible' : true
  );

  const isReducedMotion = useReducedMotion();
  const isMobile = useMediaQuery('(max-width: 1023px)');

  const sectionRef = useRef(null);
  const panelRef = useRef(null);
  const tabRefs = useRef([]);
  const progressTweenRef = useRef(null);

  // IntersectionObserver for visibility
  useEffect(() => {
    if (!sectionRef.current || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Document visibility listener
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const handleVisChange = () => {
      setIsDocVisible(document.visibilityState === 'visible');
    };
    document.addEventListener('visibilitychange', handleVisChange);
    return () => document.removeEventListener('visibilitychange', handleVisChange);
  }, []);

  // Auto-advance GSAP 6s progress bar on desktop
  useEffect(() => {
    setProgress(0);
    if (isMobile || isReducedMotion || !isInView) return;

    const tween = gsap.to(
      {},
      {
        duration: 6,
        ease: 'none',
        onUpdate: function () {
          setProgress(this.progress() * 100);
        },
        onComplete: () => {
          const currentIndex = MODULES.findIndex((m) => m.id === activeId);
          const nextIndex = (currentIndex + 1) % MODULES.length;
          setActiveId(MODULES[nextIndex].id);
        },
      }
    );
    progressTweenRef.current = tween;

    return () => {
      tween.kill();
    };
  }, [activeId, isMobile, isReducedMotion, isInView]);

  // Pause / Resume on hover, focus, or tab hidden
  useEffect(() => {
    const tween = progressTweenRef.current;
    if (!tween) return;

    if (isHovered || isFocused || !isDocVisible) {
      tween.pause();
    } else {
      tween.resume();
    }
  }, [isHovered, isFocused, isDocVisible]);

  // Panel transition: 250ms crossfade plus 12px translate
  useGSAP(
    () => {
      if (isReducedMotion) {
        if (panelRef.current) {
          gsap.set(panelRef.current, { opacity: 1, y: 0 });
        }
        return;
      }
      if (panelRef.current) {
        gsap.fromTo(
          panelRef.current,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }
        );
      }
    },
    { dependencies: [activeId, isReducedMotion], scope: sectionRef }
  );

  const handleSelectTab = (id) => {
    setActiveId(id);
    setProgress(0);
  };

  // Keyboard navigation for tablist
  const handleKeyDown = (e, index) => {
    let nextIndex = index;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      nextIndex = (index + 1) % MODULES.length;
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      nextIndex = (index - 1 + MODULES.length) % MODULES.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = MODULES.length - 1;
    }

    if (nextIndex !== index) {
      const nextId = MODULES[nextIndex].id;
      handleSelectTab(nextId);
      const tabEl = tabRefs.current[nextIndex];
      if (tabEl) tabEl.focus();
    }
  };

  const activeModule = MODULES.find((m) => m.id === activeId) || MODULES[0];
  const ActiveComponent = activeModule.panelComponent;

  // Single stage panel component in Clean Blue & White theme
  const stagePanelElement = (
    <div
      className={`w-full rounded-2xl bg-white border border-slate-200/90 shadow-[0_20px_50px_-15px_rgba(25,43,66,0.08)] overflow-hidden flex flex-col justify-between ${
        isMobile ? 'p-4 sm:p-5 mt-3' : 'h-[460px] p-5 sm:p-6'
      }`}
    >
      {/* Slim Top Bar */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
          <span className="font-display font-bold text-sm text-ink">
            {activeModule.title}
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-brand-700 bg-brand-50 border border-brand-200/80 px-2.5 py-0.5 rounded-full font-semibold">
          Illustrative preview
        </span>
      </div>

      {/* Active Tabpanel Container */}
      <div
        ref={panelRef}
        role="tabpanel"
        id={`workspace-panel-${activeModule.id}`}
        aria-labelledby={`workspace-tab-${activeModule.id}`}
        tabIndex={0}
        className="flex-1 min-h-0 focus:outline-none"
      >
        <ActiveComponent isReducedMotion={isReducedMotion} />
      </div>
    </div>
  );

  return (
    <section
      ref={sectionRef}
      id="platform"
      aria-label="The Workspace platform experience"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsFocused(true)}
      onBlurCapture={() => setIsFocused(false)}
      className="py-20 sm:py-28 bg-canvas text-ink select-none relative overflow-hidden"
    >
      {/* Navigation Anchor alias */}
      <div id="product-preview" className="sr-only" />

      {/* Low-contrast technical grid background matching Hero and Pillars */}
      <div className="absolute inset-0 marketing-tech-grid-light opacity-50 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Responsive Layout: Desktop 2-column or Mobile Accordion with single mounted stage */}
        {!isMobile ? (
          // Desktop View (1024px and up): 5/12 and 7/12 vertically centered
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column (5/12) */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/80 text-xs font-mono font-semibold text-brand-600 mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>THE WORKSPACE</span>
                </div>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-[40px] font-bold text-ink leading-tight tracking-tight">
                  Everything your club runs on, in one place.
                </h2>
                <p className="mt-3 text-sm sm:text-base text-ink/75 font-sans leading-relaxed">
                  From planning major events to passing the baton, keep your team in sync across every collegiate term.
                </p>
              </div>

              {/* Vertical list of 6 items */}
              <div
                role="tablist"
                aria-orientation="vertical"
                className="space-y-2.5 focus:outline-none"
              >
                {MODULES.map((item, index) => {
                  const isActive = activeId === item.id;
                  return (
                    <button
                      key={item.id}
                      ref={(el) => (tabRefs.current[index] = el)}
                      role="tab"
                      id={`workspace-tab-${item.id}`}
                      aria-controls={`workspace-panel-${item.id}`}
                      aria-selected={isActive}
                      tabIndex={isActive ? 0 : -1}
                      onClick={() => handleSelectTab(item.id)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className={`w-full text-left p-3.5 rounded-xl transition-all relative overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ${
                        isActive
                          ? 'bg-white text-ink border-2 border-brand-600 shadow-md ring-4 ring-brand-50'
                          : 'bg-white/80 hover:bg-white text-ink/80 hover:text-ink border border-slate-200/80 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`font-mono text-xs font-bold pt-0.5 ${
                            isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'
                          }`}
                        >
                          {item.num}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h3
                            className={`font-display text-sm font-bold ${
                              isActive ? 'text-brand-600' : 'text-ink'
                            }`}
                          >
                            {item.title}
                          </h3>
                          <p className="font-sans text-xs mt-0.5 leading-snug line-clamp-1 text-ink/65">
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      {/* 2px Royal Blue progress bar on active item */}
                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-100">
                          <div
                            className="h-full bg-brand-600 transition-none"
                            style={{
                              width: isReducedMotion ? '100%' : `${progress}%`,
                            }}
                          />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column (7/12): Stage Panel */}
            <div className="lg:col-span-7">
              {stagePanelElement}
            </div>
          </div>
        ) : (
          // Mobile Accordion View (< 1024px): Same item list and same panel element
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/80 text-xs font-mono font-semibold text-brand-600 mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>THE WORKSPACE</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink leading-tight tracking-tight">
                Everything your club runs on, in one place.
              </h2>
              <p className="mt-2 text-sm text-ink/75 font-sans leading-relaxed">
                From planning major events to passing the baton, keep your team in sync across every collegiate term.
              </p>
            </div>

            {/* Accordion List */}
            <div
              role="tablist"
              aria-orientation="vertical"
              className="space-y-2.5 focus:outline-none"
            >
              {MODULES.map((item, index) => {
                const isActive = activeId === item.id;
                return (
                  <div key={item.id} className="space-y-2">
                    <button
                      ref={(el) => (tabRefs.current[index] = el)}
                      role="tab"
                      id={`workspace-tab-${item.id}`}
                      aria-controls={`workspace-panel-${item.id}`}
                      aria-selected={isActive}
                      tabIndex={isActive ? 0 : -1}
                      onClick={() => handleSelectTab(item.id)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className={`w-full text-left p-3.5 rounded-xl transition-all relative overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ${
                        isActive
                          ? 'bg-white text-ink border-2 border-brand-600 shadow-md ring-4 ring-brand-50'
                          : 'bg-white/80 hover:bg-white text-ink/80 hover:text-ink border border-slate-200/80 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`font-mono text-xs font-bold pt-0.5 ${
                            isActive ? 'text-brand-600' : 'text-slate-400'
                          }`}
                        >
                          {item.num}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h3
                            className={`font-display text-sm font-bold ${
                              isActive ? 'text-brand-600' : 'text-ink'
                            }`}
                          >
                            {item.title}
                          </h3>
                          <p className="font-sans text-xs mt-0.5 leading-snug text-ink/65">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    </button>

                    {/* Accordion panel placed directly below active item */}
                    {isActive && stagePanelElement}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default ProductExperienceSection;
