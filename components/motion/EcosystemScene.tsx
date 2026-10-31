"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { GraduationCap, HandHeart, Building2, Handshake, Network } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function EcosystemScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const centerHubRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

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
          end: "+=180%",
          pin: pinRef.current,
          scrub: 0.8,
          anticipatePin: 1,
        },
      });

      // 1. Center hub scales and pulses
      tl.fromTo(centerHubRef.current, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4 })
      // 2. The four nodes expand outward radially
      .fromTo(
        cardsRef.current ? cardsRef.current.children : [],
        { scale: 0.85, opacity: 0, y: 30 },
        { scale: 1, opacity: 1, y: 0, stagger: 0.15, ease: "power2.out", duration: 0.6 },
        0.2
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const participants = [
    {
      role: "STUDENTS",
      scope: "Learners & Builders",
      icon: GraduationCap,
      color: "border-brand-blue",
      tag: "Active Core",
      desc: "Undergraduates across engineering, arts, science, and commerce participating in competitions, hackathons, and growth circles.",
    },
    {
      role: "VOLUNTEERS",
      scope: "Organizers & Leads",
      icon: HandHeart,
      color: "border-brand-red",
      tag: "9 Divisions",
      desc: "Passionate youth managing event logistics, technical tracks, stage production, graphic design, and media coverage.",
    },
    {
      role: "COLLEGES",
      scope: "Campus Chapters",
      icon: Building2,
      color: "border-brand-dark",
      tag: "Institutional Verification",
      desc: "Partner institutions hosting on-campus qualifiers, student hackathons, open mic amphitheatres, and sports tournaments.",
    },
    {
      role: "PARTNERS",
      scope: "Industry & Mentors",
      icon: Handshake,
      color: "border-brand-grey",
      tag: "Collaborative Tracks",
      desc: "Founders, tech companies, and NGOs sponsoring challenge tracks, conducting workshops, and providing career guidance.",
    },
  ];

  return (
    <section ref={containerRef} className="relative min-h-[220vh] bg-brand-bg text-brand-dark">
      <div
        ref={pinRef}
        className="h-screen w-full flex flex-col justify-between p-6 sm:p-12 lg:p-16 relative overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between z-10 pt-16 sm:pt-14">
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-brand-dark uppercase">
            <span className="w-2 h-2 rounded-full bg-brand-dark" />
            <span>SCENE 05 // THE CONNECTED ECOSYSTEM</span>
          </div>

          <span className="font-mono text-xs text-brand-grey uppercase tracking-widest">
            FOUR INTERCONNECTED PILLARS
          </span>
        </div>

        {/* Center Diagram */}
        <div className="max-w-6xl mx-auto w-full z-10 my-auto text-center">
          
          {/* Central COMMUNITY.VA Identity Hub */}
          <div ref={centerHubRef} className="max-w-xs mx-auto mb-10 p-5 rounded-2xl bg-white border border-brand-border shadow-md">
            <div className="relative h-10 w-32 mx-auto mb-1">
              <Image
                src="/logos/community-va-logo.png"
                alt="COMMUNITY.VA Central Hub"
                fill
                className="object-contain"
              />
            </div>
            <p className="font-mono text-[11px] text-brand-grey uppercase tracking-wider">
              CENTRAL CATALYST • HYDERABAD
            </p>
          </div>

          {/* Four Radial Pillars */}
          <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {participants.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.role}
                  className={`p-6 rounded-3xl bg-white border-2 ${p.color} text-left shadow-xs flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-bg text-brand-dark border border-brand-border font-bold">
                        {p.tag}
                      </span>
                      <Icon className="w-5 h-5 text-brand-dark" />
                    </div>

                    <h3 className="font-display text-2xl font-extrabold text-brand-dark uppercase">
                      {p.role}
                    </h3>
                    <p className="font-mono text-xs text-brand-blue font-bold mb-3">
                      {p.scope}
                    </p>

                    <p className="font-body text-xs text-brand-dark/75 leading-relaxed">
                      {p.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-brand-border/60 mt-4 text-[10px] font-mono text-brand-grey uppercase">
                    Integrated System
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex items-center justify-between text-xs font-mono text-brand-grey uppercase tracking-widest z-10 pb-4">
          <span>COLLABORATIVE FRAMEWORK</span>
          <span>SCENE 05 // 08</span>
        </div>

      </div>
    </section>
  );
}
