"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, MapPin } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinSectionRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const portalCircleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current || !pinSectionRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Main scrubbed hero timeline pinned for 200vh of scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=180%",
          pin: pinSectionRef.current,
          scrub: 0.8,
          anticipatePin: 1,
        },
      });

      // 1. Separate letterforms and scale typography outward
      tl.to(headlineRef.current, {
        scale: 1.6,
        letterSpacing: "0.08em",
        opacity: 0.25,
        y: -60,
        ease: "power1.inOut",
      }, 0)
      // 2. Tagline and metadata fade and translate
      .to([taglineRef.current, metaRef.current], {
        y: 40,
        opacity: 0,
        ease: "power1.in",
      }, 0.1)
      // 3. Official character geometric shape expands to open gateway
      .to(portalCircleRef.current, {
        scale: 24,
        opacity: 1,
        ease: "power2.inOut",
      }, 0.4)
      // 4. Subtle fade to transparent to unveil Scene 02 smoothly
      .to(pinSectionRef.current, {
        opacity: 0,
        ease: "power2.in",
      }, 0.85);

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-[220vh] bg-brand-bg">
      <div
        ref={pinSectionRef}
        className="h-screen w-full flex flex-col justify-between p-6 sm:p-12 lg:p-16 overflow-hidden relative"
      >
        {/* Background Subtle Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-full flex items-center justify-center pointer-events-none">
          {/* Expanding Portal Geometric Circle from COMMUNITY.VA logo face */}
          <div
            ref={portalCircleRef}
            className="w-20 h-20 rounded-full border-2 border-brand-blue bg-brand-bg opacity-0 will-change-transform z-20 pointer-events-none"
          />
        </div>

        {/* Top Metadata Row */}
        <div ref={metaRef} className="flex items-center justify-between z-10 pt-16 sm:pt-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-brand-border text-xs font-mono font-medium tracking-wide text-brand-dark shadow-xs">
            <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-brand-red" /> HYDERABAD, INDIA
            </span>
            <span className="text-brand-grey">•</span>
            <span className="text-brand-grey">EST. 2026</span>
          </div>

          <div className="hidden md:flex items-center gap-4 text-xs font-mono text-brand-grey uppercase tracking-widest">
            <span>TECHNOLOGY</span>
            <span>/</span>
            <span>CULTURE</span>
            <span>/</span>
            <span>INNOVATION</span>
            <span>/</span>
            <span>OPPORTUNITY</span>
          </div>
        </div>

        {/* Center Oversized Editorial Typography */}
        <div className="max-w-7xl mx-auto w-full z-10 my-auto text-center sm:text-left">
          <div ref={badgeRef} className="mb-4 inline-block">
            <div className="relative h-12 w-36 sm:h-14 sm:w-44 mb-1">
              <Image
                src="/logos/community-va-logo.png"
                alt="COMMUNITY.VA Logo"
                fill
                priority
                className="object-contain object-left"
              />
            </div>
          </div>

          <h1
            ref={headlineRef}
            className="font-display font-extrabold text-5xl sm:text-7xl lg:text-8xl xl:text-9xl tracking-tighter text-brand-dark uppercase leading-[0.95] will-change-transform"
          >
            COMMUNITY<span className="text-brand-blue">.VA</span>
            <br />
            <span className="text-brand-dark/90 text-4xl sm:text-6xl lg:text-7xl xl:text-8xl block mt-2">
              CONNECTING PEOPLE.
            </span>
            <span className="text-brand-blue text-4xl sm:text-6xl lg:text-7xl xl:text-8xl block">
              CREATING OPPORTUNITIES.
            </span>
          </h1>

          <p
            ref={taglineRef}
            className="font-body text-base sm:text-xl text-brand-dark/75 max-w-2xl mt-6 leading-relaxed font-normal"
          >
            A student-led youth community built to connect people, unlock potential and create transformative opportunities for the next generation across Hyderabad colleges.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-brand-dark text-white rounded-full font-display text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-black transition-all shadow-sm group"
            >
              <span>Register Now</span>
              <ArrowUpRight className="w-4 h-4 text-brand-blue-light transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>

            <Link
              href="#community-story"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white border border-brand-border text-brand-dark rounded-full font-display text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-brand-bg-alt transition-all"
            >
              <span>Explore Community</span>
              <ArrowDown className="w-4 h-4 text-brand-blue" />
            </Link>
          </div>
        </div>

        {/* Bottom Scroll Prompt Bar */}
        <div className="flex items-center justify-between text-xs font-mono text-brand-grey uppercase tracking-widest z-10 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-red animate-ping" />
            <span>SCROLL TO EXPLORE NARRATIVE</span>
          </div>

          <div className="hidden sm:block">
            <span>SCENE 01 // OVERVIEW</span>
          </div>
        </div>
      </div>
    </section>
  );
}
