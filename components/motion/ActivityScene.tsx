"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Terminal, Users2, Mic2, Trophy, Briefcase, ArrowUpRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const ACTIVITIES = [
  {
    index: "01",
    category: "TECHNOLOGY & INNOVATION",
    tagline: "BUILD & SHIP EXPERIENCES",
    description: "Hackathons, coding competitions, innovation challenges, technical workshops and project development. Where student builders turn abstract code into working software.",
    highlights: ["36-Hour Hackathons", "Algorithmic Challenges", "Dev Workshops", "Project Demo Days"],
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80",
    color: "#1461C5",
    icon: Terminal,
  },
  {
    index: "02",
    category: "PERSONAL DEVELOPMENT",
    tagline: "LEADERSHIP & POISE",
    description: "Leadership development, communication skills, teamwork, confidence building, and professional personality growth. Equipping students to express their ideas with authority.",
    highlights: ["Public Speaking Masterclasses", "Leadership Cohorts", "Teamwork Simulations", "Poise & Etiquette"],
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80",
    color: "#ED2424",
    icon: Users2,
  },
  {
    index: "03",
    category: "EVENTS & ENTERTAINMENT",
    tagline: "CULTURE & SPOTLIGHT",
    description: "Cultural events, singing competitions, talent shows, open mic sessions, and community social gatherings. Providing an authentic stage for creative voices.",
    highlights: ["Acoustic & Vocal Showcases", "Open Mic Poetry & Comedy", "Campus Cultural Fests", "Creative Mixers"],
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80",
    color: "#1461C5",
    icon: Mic2,
  },
  {
    index: "04",
    category: "SPORTS & ACTIVITIES",
    tagline: "ENERGY & CAMARADERIE",
    description: "Sports competitions, multi-round campus tournaments, recreational outdoor challenges, and team-building athletic leagues across colleges.",
    highlights: ["Badminton Tournaments", "Inter-College Cricket Leagues", "Football Cups", "Recreational Treks"],
    image: "https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=1000&q=80",
    color: "#111111",
    icon: Trophy,
  },
  {
    index: "05",
    category: "CAREER & OPPORTUNITIES",
    tagline: "FUTURE PATHWAYS",
    description: "Networking, career guidance, mentorship, industry exposure, and professional development connecting students with senior professionals and startup founders.",
    highlights: ["1-on-1 Mentor Circles", "Founder AMA Sessions", "Resume & Portfolio Clinics", "Startup Pathways"],
    image: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1000&q=80",
    color: "#1461C5",
    icon: Briefcase,
  },
];

export default function ActivityScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current || !pinRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Pin for 300vh and scrub progress
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "+=280%",
        pin: pinRef.current,
        scrub: 0.5,
        anticipatePin: 1,
        onUpdate: (self) => {
          const idx = Math.min(
            ACTIVITIES.length - 1,
            Math.floor(self.progress * ACTIVITIES.length)
          );
          setActiveIndex(idx);
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const activeActivity = ACTIVITIES[activeIndex];
  const Icon = activeActivity.icon;

  return (
    <section id="activities" ref={containerRef} className="relative min-h-[320vh] bg-brand-bg text-brand-dark">
      <div
        ref={pinRef}
        className="h-screen w-full flex flex-col justify-between p-6 sm:p-12 lg:p-16 relative overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between z-10 pt-16 sm:pt-14">
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-brand-blue uppercase">
            <span className="w-2 h-2 rounded-full bg-brand-blue" />
            <span>SCENE 03 // FIVE ACTIVITY SPHERES</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-brand-grey uppercase">
            <span>SPHERE [{activeIndex + 1} / 5]</span>
          </div>
        </div>

        {/* Center Main Presentation Card */}
        <div className="max-w-7xl mx-auto w-full z-10 my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Text Presentation */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold text-white uppercase" style={{ backgroundColor: activeActivity.color }}>
                {activeActivity.index} // SPHERE
              </span>
              <span className="text-xs font-mono font-bold tracking-wider text-brand-grey uppercase">
                {activeActivity.tagline}
              </span>
            </div>

            <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold text-brand-dark uppercase tracking-tight leading-[0.95] transition-all duration-300">
              {activeActivity.category}
            </h2>

            <p className="font-body text-base sm:text-xl text-brand-dark/80 max-w-xl leading-relaxed transition-all duration-300">
              {activeActivity.description}
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              {activeActivity.highlights.map((h) => (
                <span
                  key={h}
                  className="px-3 py-1.5 rounded-xl bg-white border border-brand-border text-xs font-mono font-semibold text-brand-dark shadow-xs"
                >
                  ✓ {h}
                </span>
              ))}
            </div>
          </div>

          {/* Right Photographic Visual */}
          <div className="lg:col-span-5">
            <div className="relative h-64 sm:h-96 w-full rounded-3xl overflow-hidden border border-brand-border bg-white p-3 shadow-xl transition-all duration-500">
              <div className="relative h-full w-full rounded-2xl overflow-hidden bg-brand-charcoal">
                <Image
                  src={activeActivity.image}
                  alt={activeActivity.category}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-brand-blue-light" />
                    <span className="font-mono text-xs uppercase font-bold tracking-wider">
                      {activeActivity.category}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Stepper Progress Bar */}
        <div className="flex items-center justify-between z-10 pb-4">
          <div className="flex items-center gap-2">
            {ACTIVITIES.map((act, i) => (
              <button
                key={act.index}
                onClick={() => setActiveIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === activeIndex ? "w-8 bg-brand-blue" : "w-2 bg-brand-border"
                }`}
                title={act.category}
              />
            ))}
          </div>

          <span className="font-mono text-xs text-brand-grey uppercase tracking-widest">
            SCROLL TO STEP THROUGH SPHERES
          </span>
        </div>
      </div>
    </section>
  );
}
