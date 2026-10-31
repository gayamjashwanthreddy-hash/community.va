"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Sparkles, MapPin, Compass } from "lucide-react";
import { gsap } from "gsap";

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || !heroRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(headlineRef.current, {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });

      if (cardRef.current) {
        gsap.from(cardRef.current, {
          scale: 0.96,
          opacity: 0,
          duration: 1.2,
          delay: 0.2,
          ease: "power2.out",
        });
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      id="home"
      className="relative min-h-[92vh] pt-28 pb-16 lg:pt-36 lg:pb-24 flex items-center bg-brand-bg bg-grid-subtle overflow-hidden"
    >
      {/* Decorative Glows */}
      <div className="absolute top-1/4 -right-24 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-20 w-80 h-80 bg-brand-red/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white border border-brand-border text-xs font-mono font-medium tracking-wide text-brand-dark shadow-xs">
              <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
              <span>STUDENT-LED YOUTH COMMUNITY</span>
              <span className="text-brand-grey">•</span>
              <span className="flex items-center gap-1 text-brand-grey">
                <MapPin className="w-3 h-3 text-brand-red" /> Hyderabad
              </span>
            </div>

            <div className="space-y-2">
              <h1
                ref={headlineRef}
                className="font-display font-extrabold text-4xl sm:text-6xl xl:text-7xl tracking-tighter text-brand-dark uppercase leading-[1.05]"
              >
                Connecting <span className="inline-block relative">
                  People.
                  <span className="absolute bottom-1.5 left-0 w-full h-2.5 bg-brand-blue/15 -z-10 rounded-sm" />
                </span>
                <br />
                Creating <span className="text-brand-blue">Opportunities.</span>
              </h1>
            </div>

            <p className="font-body text-lg sm:text-xl text-brand-dark/80 max-w-xl font-normal leading-relaxed">
              A community built to connect people, unlock potential and create opportunities for the next generation.
            </p>

            <div className="pl-4 border-l-2 border-brand-red py-1">
              <p className="text-xs sm:text-sm font-mono text-brand-grey uppercase tracking-wider">
                Core Philosophy
              </p>
              <p className="text-sm sm:text-base font-medium text-brand-dark mt-0.5">
                Bringing people together, discovering potential and creating opportunities.
              </p>
            </div>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/#about"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-brand-dark text-white rounded-full font-semibold text-xs sm:text-sm uppercase tracking-wider hover:bg-black transition-all duration-200 shadow-sm hover:shadow group"
              >
                <span>Explore Our Community</span>
                <ArrowDown className="w-4 h-4 transition-transform duration-200 group-hover:translate-y-0.5 text-brand-blue-light" />
              </Link>

              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-brand-blue text-white rounded-full font-semibold text-xs sm:text-sm uppercase tracking-wider hover:bg-brand-blue-hover transition-all duration-200 shadow-xs group"
              >
                <span>Register Now</span>
                <ArrowUpRight className="w-4 h-4 text-white transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>

            {/* Five Pillars Quick Ticker */}
            <div className="pt-6 border-t border-brand-border/80">
              <p className="text-[11px] font-mono uppercase tracking-widest text-brand-grey mb-2.5">
                Five Key Activity Areas
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Technology & Innovation",
                  "Personal Development",
                  "Events & Entertainment",
                  "Sports & Activities",
                  "Career & Opportunities",
                ].map((pillar, idx) => (
                  <span
                    key={pillar}
                    className="inline-flex items-center text-xs font-mono font-medium px-2.5 py-1 rounded-md bg-white/80 border border-brand-border/70 text-brand-dark/90"
                  >
                    <span className="text-[10px] text-brand-blue font-bold mr-1.5">0{idx + 1}</span>
                    {pillar}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Layered Editorial Visual Storytelling */}
          <div className="lg:col-span-5 relative">
            <div ref={cardRef} className="relative mx-auto max-w-md lg:max-w-none">
              
              <div className="relative rounded-2xl overflow-hidden border border-brand-border bg-white p-3 shadow-xl transform lg:rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="relative h-80 sm:h-96 w-full rounded-xl overflow-hidden bg-brand-charcoal">
                  <Image
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80"
                    alt="Young students learning and collaborating together"
                    fill
                    priority
                    className="object-cover contrast-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase bg-brand-blue font-bold mb-1.5">
                      Youth Driven
                    </span>
                    <p className="font-display text-sm font-semibold text-white/95 leading-snug">
                      Collaborative energy across technical hackathons, cultural fests, and skill-building cohorts.
                    </p>
                  </div>
                </div>

                <div className="pt-3 px-1 flex items-center justify-between text-xs font-mono text-brand-grey">
                  <span>HYDERABAD CHAPTER</span>
                  <span className="text-brand-dark font-semibold">EST. 2026</span>
                </div>
              </div>

              {/* Mascot badge */}
              <div className="absolute -top-6 -left-6 sm:-left-8 bg-white border border-brand-border rounded-xl p-3 shadow-lg max-w-[210px] hidden sm:block transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="relative h-12 w-32 mb-1.5">
                  <Image
                    src="/logos/community-va-logo.png"
                    alt="COMMUNITY.VA Badge"
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="text-[10px] font-mono text-brand-grey uppercase tracking-wider">
                  Diverse shapes • One community
                </p>
              </div>

              {/* Sub badge */}
              <div className="absolute -bottom-6 -right-4 sm:-right-6 bg-brand-dark text-white rounded-xl p-4 shadow-xl border border-white/10 max-w-[240px] transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center gap-2 mb-1 text-xs text-brand-blue-light font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-brand-blue" />
                  <span>Student Centered</span>
                </div>
                <p className="text-xs font-medium text-white/90 leading-snug">
                  Transforming individual curiosity into collective impact and industry-ready experiences.
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
