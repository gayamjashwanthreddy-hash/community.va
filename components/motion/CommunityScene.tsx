"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Users2, Sparkles, Network } from "lucide-react";

export default function CommunityScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const path1Ref = useRef<SVGPathElement>(null);
  const path2Ref = useRef<SVGPathElement>(null);
  const path3Ref = useRef<SVGPathElement>(null);
  const word1Ref = useRef<HTMLDivElement>(null);
  const word2Ref = useRef<HTMLDivElement>(null);
  const word3Ref = useRef<HTMLDivElement>(null);
  const word4Ref = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<SVGGElement>(null);
  const manifestoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current || !pinRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=200%",
          pin: pinRef.current,
          scrub: 0.8,
          anticipatePin: 1,
        },
      });

      // 1. Draw SVG connection lines through strokeDashoffset
      const paths = [path1Ref.current, path2Ref.current, path3Ref.current].filter(Boolean);
      paths.forEach((p) => {
        if (p) {
          const len = p.getTotalLength?.() || 800;
          gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
        }
      });

      tl.to(paths, {
        strokeDashoffset: 0,
        ease: "none",
        duration: 1,
      }, 0)
      // 2. Light up network nodes
      .from(nodesRef.current ? nodesRef.current.children : [], {
        scale: 0,
        opacity: 0,
        stagger: 0.08,
        transformOrigin: "center center",
        ease: "back.out(2)",
      }, 0.2)
      // 3. Staggered reveal of narrative words: PEOPLE -> CONNECT -> COLLABORATE -> GROW
      .fromTo(word1Ref.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 }, 0.1)
      .fromTo(word2Ref.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 }, 0.35)
      .fromTo(word3Ref.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 }, 0.55)
      .fromTo(word4Ref.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 }, 0.75)
      // 4. Reveal community manifesto card
      .fromTo(manifestoRef.current, { scale: 0.9, opacity: 0, y: 30 }, { scale: 1, opacity: 1, y: 0, duration: 0.4 }, 0.8);

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="community-story" ref={containerRef} className="relative min-h-[240vh] bg-brand-dark text-white">
      <div
        ref={pinRef}
        className="h-screen w-full flex flex-col justify-between p-6 sm:p-12 lg:p-16 relative overflow-hidden"
      >
        {/* Background Network SVG connecting nodes */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <svg className="w-full h-full" viewBox="0 0 1000 800" fill="none" preserveAspectRatio="none">
            <path
              ref={path1Ref}
              d="M100 200 C 300 100, 500 400, 900 250"
              stroke="#1461C5"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              ref={path2Ref}
              d="M150 700 C 400 600, 600 300, 850 650"
              stroke="#ED2424"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              ref={path3Ref}
              d="M200 400 L 500 400 L 800 400"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeDasharray="4 6"
            />
            <g ref={nodesRef}>
              <circle cx="100" cy="200" r="8" fill="#1461C5" />
              <circle cx="900" cy="250" r="10" fill="#1461C5" />
              <circle cx="500" cy="400" r="12" fill="#FFFFFF" />
              <circle cx="150" cy="700" r="7" fill="#ED2424" />
              <circle cx="850" cy="650" r="9" fill="#ED2424" />
            </g>
          </svg>
        </div>

        {/* Top Header */}
        <div className="flex items-center justify-between z-10 pt-16 sm:pt-14">
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-brand-red uppercase">
            <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
            <span>SCENE 02 // THE COMMUNITY FABRIC</span>
          </div>
          <span className="text-xs font-mono text-brand-grey uppercase tracking-widest">
            MORE THAN A COMMUNITY
          </span>
        </div>

        {/* Center Kinetic Typography Sequence */}
        <div className="max-w-7xl mx-auto w-full z-10 my-auto text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto mb-8">
            
            <div ref={word1Ref} className="p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="block font-mono text-xs text-brand-blue font-bold mb-1">01 / DISCOVER</span>
              <span className="font-display text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-white">
                PEOPLE
              </span>
              <p className="text-[11px] font-mono text-white/60 mt-1">Diverse minds uniting</p>
            </div>

            <div ref={word2Ref} className="p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="block font-mono text-xs text-brand-red font-bold mb-1">02 / UNITE</span>
              <span className="font-display text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-white">
                CONNECT
              </span>
              <p className="text-[11px] font-mono text-white/60 mt-1">Cross-campus networks</p>
            </div>

            <div ref={word3Ref} className="p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="block font-mono text-xs text-white font-bold mb-1">03 / BUILD</span>
              <span className="font-display text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-white">
                COLLAB
              </span>
              <p className="text-[11px] font-mono text-white/60 mt-1">Interdisciplinary tracks</p>
            </div>

            <div ref={word4Ref} className="p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="block font-mono text-xs text-brand-blue font-bold mb-1">04 / THRIVE</span>
              <span className="font-display text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-white">
                GROW
              </span>
              <p className="text-[11px] font-mono text-white/60 mt-1">Transformative impact</p>
            </div>

          </div>

          {/* Guiding Manifesto Card */}
          <div ref={manifestoRef} className="max-w-2xl mx-auto bg-brand-charcoal/90 border border-white/15 p-6 rounded-2xl shadow-2xl backdrop-blur-md">
            <p className="font-body text-base sm:text-lg text-white/90 italic font-medium leading-relaxed">
              “We believe every individual has potential. The right environment, meaningful connections and opportunities can help transform that potential into real achievements.”
            </p>
            <span className="block mt-2 font-mono text-xs text-brand-grey uppercase tracking-wider">
              — COMMUNITY.VA Core Creed • Hyderabad Chapter
            </span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex items-center justify-between text-xs font-mono text-brand-grey uppercase tracking-widest z-10 pb-4">
          <span>PROGRESSIVE NETWORK FORMATION</span>
          <span>SCENE 02 // 08</span>
        </div>
      </div>
    </section>
  );
}
