"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, ArrowUpRight, Clock, Tag } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const EVENTS = [
  {
    id: "evt-01",
    name: "COMMUNITY.VA Innovation Hackathon",
    category: "Hackathons",
    status: "Registrations Open",
    date: "Upcoming Cycle — Fall 2026",
    venue: "Hyderabad Tech Hub & Virtual Hub",
    description: "A 36-hour sprint uniting student developers, designers, and problem solvers to build software tackling urban, educational, and sustainability challenges.",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
    actionText: "Register Interest",
    actionHref: "/events/community-va-innovation-hackathon-2026",
  },
  {
    id: "evt-02",
    name: "Leadership & Public Speaking Masterclass",
    category: "Workshops",
    status: "Registrations Open",
    date: "Monthly Cohort Series",
    venue: "Hyderabad Campus Partner Spaces",
    description: "An intensive interactive workshop focusing on stage presence, impromptu speaking, elevator pitches, and leading student organizations with empathy.",
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
    actionText: "Reserve Seat",
    actionHref: "/events/youth-leadership-and-public-speaking-masterclass",
  },
  {
    id: "evt-03",
    name: "Youth Acoustic & Open Mic Night",
    category: "Community Activities",
    status: "Upcoming",
    date: "Scheduled Weekend Meetup",
    venue: "Community Amphitheater, Hyderabad",
    description: "An open stage for student vocalists, musicians, poets, and storytellers to perform in a supportive, energetic environment.",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
    actionText: "Join Performer List",
    actionHref: "/events/youth-acoustic-open-mic-night",
  },
];

export default function EventScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current || !pinRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "+=200%",
        pin: pinRef.current,
        scrub: 0.6,
        anticipatePin: 1,
        onUpdate: (self) => {
          const idx = Math.min(
            EVENTS.length - 1,
            Math.floor(self.progress * EVENTS.length)
          );
          setSelectedIdx(idx);
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const activeEvent = EVENTS[selectedIdx];

  return (
    <section id="events" ref={containerRef} className="relative min-h-[240vh] bg-white text-brand-dark">
      <div
        ref={pinRef}
        className="h-screen w-full flex flex-col justify-between p-6 sm:p-12 lg:p-16 relative overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between z-10 pt-16 sm:pt-14">
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-brand-red uppercase">
            <span className="w-2 h-2 rounded-full bg-brand-red" />
            <span>SCENE 06 // EVENTS & EXPERIENCES</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-brand-grey uppercase">
            <span>SHOWCASE [{selectedIdx + 1} / {EVENTS.length}]</span>
          </div>
        </div>

        {/* Center Main Spotlight */}
        <div className="max-w-7xl mx-auto w-full z-10 my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-brand-dark text-white">
                {activeEvent.category}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-brand-blue-light text-brand-blue">
                {activeEvent.status}
              </span>
            </div>

            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-brand-dark uppercase tracking-tight leading-tight transition-all duration-300">
              {activeEvent.name}
            </h2>

            <div className="space-y-2 font-mono text-xs text-brand-grey">
              <div className="flex items-center gap-2 text-brand-blue font-bold">
                <Calendar className="w-4 h-4" />
                <span>{activeEvent.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-red" />
                <span>{activeEvent.venue}</span>
              </div>
            </div>

            <p className="font-body text-base sm:text-lg text-brand-dark/75 leading-relaxed">
              {activeEvent.description}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={activeEvent.actionHref}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-brand-blue text-white rounded-full font-display text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-brand-blue-hover transition-colors shadow-xs"
              >
                <span>{activeEvent.actionText}</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>

              <Link
                href="/events"
                className="inline-flex items-center gap-2 px-5 py-3.5 border border-brand-border text-brand-dark rounded-full font-display text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-white transition-colors"
              >
                <span>All Events Calendar</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Cinematic Photo */}
          <div className="lg:col-span-6">
            <div className="relative h-72 sm:h-96 w-full rounded-3xl overflow-hidden border border-brand-border bg-brand-charcoal shadow-2xl">
              <Image
                src={activeEvent.image}
                alt={activeEvent.name}
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white text-xs font-mono font-semibold">
                Official Campus Calendar Track
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex items-center justify-between text-xs font-mono text-brand-grey uppercase tracking-widest z-10 pb-4">
          <div className="flex items-center gap-2">
            {EVENTS.map((evt, i) => (
              <button
                key={evt.id}
                onClick={() => setSelectedIdx(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === selectedIdx ? "w-8 bg-brand-red" : "w-2 bg-brand-border"
                }`}
                title={evt.name}
              />
            ))}
          </div>

          <span>SCROLL TO CYCLE EVENTS</span>
        </div>

      </div>
    </section>
  );
}
