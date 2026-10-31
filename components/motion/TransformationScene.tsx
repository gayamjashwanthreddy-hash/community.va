"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BookOpen, Rocket, Compass, ArrowRight } from "lucide-react";

const STAGES = [
  {
    num: "01",
    verb: "LEARN",
    heading: "Develop Skills & Discover Potential",
    copy: "Through student-led cohorts, technical workshops, coding clinics, and communication sessions, young people gain tools beyond standard textbooks.",
    icon: BookOpen,
    accent: "text-brand-blue",
    bgAccent: "border-brand-blue",
  },
  {
    num: "02",
    verb: "CREATE",
    heading: "Build Real Projects & Collaborate",
    copy: "Hackathons, open-source building, design jams, and team challenges give students the collaborative sandbox to turn curiosity into execution.",
    icon: Rocket,
    accent: "text-brand-red",
    bgAccent: "border-brand-red",
  },
  {
    num: "03",
    verb: "EXPERIENCE",
    heading: "Take the Stage & Unlock Opportunities",
    copy: "Open mic stages, cultural spotlights, sports championships, and direct founder mixers transform raw ambition into industry-ready confidence.",
    icon: Compass,
    accent: "text-white",
    bgAccent: "border-white",
  },
];

export default function TransformationScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current || !trackRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    // Check if desktop / tablet
    const isDesktop = window.innerWidth >= 1024;
    if (!isDesktop) return;

    const ctx = gsap.context(() => {
      // Horizontal scrubbed translation pinned across 3 panels
      gsap.to(trackRef.current, {
        xPercent: -66.666,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=220%",
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative bg-brand-dark text-white overflow-hidden">
      {/* Horizontal Track Wrapper for Desktop */}
      <div className="lg:h-screen w-full flex flex-col justify-between p-6 sm:p-12 lg:p-16 relative">
        
        {/* Top Header */}
        <div className="flex items-center justify-between z-10 pt-16 sm:pt-14 mb-8 lg:mb-0">
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-brand-blue uppercase">
            <span className="w-2 h-2 rounded-full bg-brand-blue" />
            <span>SCENE 04 // THE PROGRESSION TRIAD</span>
          </div>

          <span className="hidden sm:inline-block font-mono text-xs text-brand-grey uppercase tracking-widest">
            HORIZONTAL CHOREOGRAPHY
          </span>
        </div>

        {/* Moving Panels Track */}
        <div className="w-full my-auto overflow-hidden">
          <div
            ref={trackRef}
            className="flex flex-col lg:flex-row w-full lg:w-[300%] gap-8 lg:gap-16 will-change-transform"
          >
            {STAGES.map((stg) => {
              const Icon = stg.icon;
              return (
                <div
                  key={stg.verb}
                  className="w-full lg:w-screen px-4 sm:px-8 lg:px-24 flex items-center shrink-0"
                >
                  <div className="max-w-4xl w-full mx-auto p-8 sm:p-14 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden">
                    
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-white/10 uppercase tracking-widest text-brand-grey">
                        STAGE {stg.num} // THREE-PHASE MODEL
                      </span>
                      <Icon className={`w-8 h-8 ${stg.accent}`} />
                    </div>

                    <h2 className="font-display font-extrabold text-6xl sm:text-8xl lg:text-9xl tracking-tight uppercase leading-[0.9] text-white mb-4">
                      {stg.verb}
                    </h2>

                    <h3 className="font-display text-xl sm:text-2xl font-bold text-white/90 uppercase mb-4">
                      {stg.heading}
                    </h3>

                    <p className="font-body text-base sm:text-lg text-white/75 max-w-2xl leading-relaxed">
                      {stg.copy}
                    </p>

                    <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono text-brand-grey">
                      <span>COMMUNITY.VA GROWTH ENGINE</span>
                      <span className="flex items-center gap-1 text-white">
                        CONTINUE SCROLLING <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex items-center justify-between text-xs font-mono text-brand-grey uppercase tracking-widest z-10 pb-4 mt-8 lg:mt-0">
          <span>LEARN → CREATE → EXPERIENCE</span>
          <span>SCENE 04 // 08</span>
        </div>

      </div>
    </section>
  );
}
