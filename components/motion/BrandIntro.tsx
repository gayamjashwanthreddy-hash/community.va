"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";

export default function BrandIntro({ onComplete }: { onComplete?: () => void }) {
  const [visible, setVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressLineRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Respect reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setVisible(false);
      onComplete?.();
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setVisible(false);
          onComplete?.();
        },
      });

      // 1. Line progress
      tl.to(progressLineRef.current, {
        scaleX: 1,
        duration: 1.1,
        ease: "power2.inOut",
      })
      // 2. Fade / scale up content
      .to(contentRef.current, {
        y: -15,
        opacity: 0,
        duration: 0.45,
        ease: "power2.in",
      }, "-=0.2")
      // 3. Reveal out container
      .to(containerRef.current, {
        yPercent: -100,
        duration: 0.65,
        ease: "power3.inOut",
      }, "-=0.1");
    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-brand-dark flex flex-col justify-between p-6 sm:p-12 text-white select-none pointer-events-auto"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-widest text-brand-grey">
          HYDERABAD • INDIA
        </span>
        <button
          onClick={() => {
            setVisible(false);
            onComplete?.();
          }}
          className="font-mono text-xs uppercase tracking-wider text-brand-grey hover:text-white transition-colors"
        >
          [ SKIP INTRO ]
        </button>
      </div>

      {/* Center Wordmark & Logo */}
      <div ref={contentRef} className="max-w-xl mx-auto text-center space-y-4">
        <div className="relative h-14 w-44 mx-auto mb-2">
          <Image
            src="/logos/community-va-logo.png"
            alt="COMMUNITY.VA Logo"
            fill
            priority
            className="object-contain invert brightness-200"
          />
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white">
          COMMUNITY<span className="text-brand-blue">.VA</span>
        </h1>

        <p className="font-mono text-xs sm:text-sm tracking-widest text-brand-grey uppercase">
          CONNECTING PEOPLE • CREATING OPPORTUNITIES
        </p>
      </div>

      {/* Calibration Progress Line */}
      <div className="w-full">
        <div className="flex items-center justify-between text-[10px] font-mono text-brand-grey uppercase mb-2">
          <span>INITIALIZING EXPERIENCE</span>
          <span>EST. 2026</span>
        </div>
        <div className="h-[2px] w-full bg-white/10 overflow-hidden rounded-full">
          <div
            ref={progressLineRef}
            className="h-full bg-brand-blue origin-left scale-x-0"
          />
        </div>
      </div>
    </div>
  );
}
