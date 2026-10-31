"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, ArrowUpRight, Tag, Clock } from "lucide-react";

interface CommunityEvent {
  id: string;
  name: string;
  category: "Hackathons" | "Workshops" | "Competitions" | "Community Activities";
  status: "Registrations Open" | "Upcoming" | "Concluded";
  timeline: "Upcoming Events" | "Past Events";
  date: string;
  venue: string;
  description: string;
  image: string;
  actionText: string;
  actionHref: string;
  isPlaceholder?: boolean;
}

const SAMPLE_EVENTS: CommunityEvent[] = [
  {
    id: "evt-01",
    name: "COMMUNITY.VA Innovation Hackathon",
    category: "Hackathons",
    timeline: "Upcoming Events",
    status: "Registrations Open",
    date: "Upcoming Cycle — Fall 2026",
    venue: "Hyderabad Tech Hub & Virtual Hub",
    description:
      "A 36-hour sprint bringing together student developers, designers, and problem solvers to build software solutions tackling urban, educational, and sustainability challenges.",
    image:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80",
    actionText: "Register Interest",
    actionHref: "#contact?subject=Hackathon%20Registration",
  },
  {
    id: "evt-02",
    name: "Leadership & Public Speaking Masterclass",
    category: "Workshops",
    timeline: "Upcoming Events",
    status: "Registrations Open",
    date: "Monthly Cohort Series",
    venue: "Hyderabad Campus Partner Spaces",
    description:
      "An intensive interactive workshop focusing on stage presence, impromptu speaking, elevator pitches, and leading student organizations with empathy and vision.",
    image:
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1000&q=80",
    actionText: "Reserve Seat",
    actionHref: "#contact?subject=Workshop%20Seat%20Reservation",
  },
  {
    id: "evt-03",
    name: "Youth Acoustic & Open Mic Night",
    category: "Community Activities",
    timeline: "Upcoming Events",
    status: "Upcoming",
    date: "Scheduled Weekend Meetup",
    venue: "Community Amphitheater, Hyderabad",
    description:
      "An open stage for student vocalists, musicians, poets, and storytellers to perform in a supportive, energetic environment surrounded by fellow creatives.",
    image:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80",
    actionText: "Join Performer List",
    actionHref: "#contact?subject=Open%20Mic%20Participation",
  },
  {
    id: "evt-04",
    name: "Inter-College Code Sprint & Algo Arena",
    category: "Competitions",
    timeline: "Past Events",
    status: "Concluded",
    date: "Concluded Community Edition",
    venue: "Multi-Campus Arena, Hyderabad",
    description:
      "A competitive algorithmic programming contest challenging student participants with data structures, algorithmic puzzles, and real-time leaderboard battles.",
    image:
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1000&q=80",
    actionText: "View Event Highlights",
    actionHref: "#community",
  },
  {
    id: "evt-05",
    name: "Campus Badminton & Sports Championship",
    category: "Competitions",
    timeline: "Past Events",
    status: "Concluded",
    date: "Concluded Community Edition",
    venue: "Indoor Sports Complex, Hyderabad",
    description:
      "A thrilling multi-round singles and doubles tournament fostering sportsmanship, wellness, and healthy campus competition across colleges.",
    image:
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1000&q=80",
    actionText: "View Gallery",
    actionHref: "#community",
  },
  {
    id: "evt-06",
    name: "Student Career & Mentor Mixer",
    category: "Workshops",
    timeline: "Upcoming Events",
    status: "Upcoming",
    date: "Upcoming Quarterly Session",
    venue: "Innovation Hub, Hyderabad",
    description:
      "Roundtable networking sessions connecting ambitious undergrads with senior tech professionals, startup founders, and career guides.",
    image:
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1000&q=80",
    actionText: "Express Interest",
    actionHref: "#contact?subject=Career%20Mixer%20Inquiry",
  },
];

const CATEGORIES = [
  "All Categories",
  "Upcoming Events",
  "Past Events",
  "Hackathons",
  "Workshops",
  "Competitions",
  "Community Activities",
] as const;

export default function Events() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");

  const filteredEvents = SAMPLE_EVENTS.filter((evt) => {
    if (selectedCategory === "All Categories") return true;
    if (selectedCategory === "Upcoming Events") return evt.timeline === "Upcoming Events";
    if (selectedCategory === "Past Events") return evt.timeline === "Past Events";
    return evt.category === selectedCategory;
  });

  return (
    <section id="events" className="py-24 sm:py-32 bg-white border-b border-brand-border relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-brand-border">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-brand-blue uppercase mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
              <span>Section 04 — Events & Experiences</span>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-brand-dark tracking-tight uppercase">
              Where Ideas Turn Into Experiences.
            </h2>
          </div>
          <p className="mt-4 md:mt-0 font-mono text-xs sm:text-sm text-brand-grey max-w-sm">
            From hands-on hack sprints to cultural stages and campus workshops — discover how COMMUNITY.VA activates student life.
          </p>
        </div>

        {/* Category Filters Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-mono font-semibold tracking-wider uppercase whitespace-nowrap transition-all duration-200 ${
                  isSelected
                    ? "bg-brand-dark text-white shadow-xs"
                    : "bg-brand-bg text-brand-dark/70 hover:text-brand-dark hover:bg-brand-border/60 border border-brand-border"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((evt) => {
            const isRegistrationOpen = evt.status === "Registrations Open";
            const isConcluded = evt.status === "Concluded";

            return (
              <div
                key={evt.id}
                className="group flex flex-col justify-between rounded-2xl bg-brand-bg border border-brand-border overflow-hidden hover:border-brand-grey/40 transition-all duration-300 shadow-xs hover:shadow-md"
              >
                <div>
                  {/* Event Image */}
                  <div className="relative h-56 w-full overflow-hidden bg-brand-charcoal">
                    <Image
                      src={evt.image}
                      alt={evt.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Status Badge */}
                    <div className="absolute top-4 left-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase backdrop-blur-md ${
                          isRegistrationOpen
                            ? "bg-brand-blue text-white"
                            : isConcluded
                            ? "bg-black/60 text-white/80"
                            : "bg-brand-red text-white"
                        }`}
                      >
                        {isRegistrationOpen && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                        {evt.status}
                      </span>
                    </div>

                    {/* Category Label */}
                    <div className="absolute top-4 right-4">
                      <span className="px-2.5 py-1 rounded bg-black/60 backdrop-blur-md text-white/90 text-[10px] font-mono tracking-wider uppercase">
                        {evt.category}
                      </span>
                    </div>

                    {/* Timeline tag overlay */}
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white/90 text-xs font-mono">
                      <span className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-brand-red shrink-0" />
                        <span className="truncate">{evt.venue}</span>
                      </span>
                    </div>
                  </div>

                  {/* Event Content Details */}
                  <div className="p-6">
                    <div className="flex items-center gap-1.5 text-xs font-mono text-brand-blue font-semibold mb-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{evt.date}</span>
                    </div>

                    <h3 className="font-display text-xl font-bold text-brand-dark mb-3 group-hover:text-brand-blue transition-colors">
                      {evt.name}
                    </h3>

                    <p className="font-body text-sm text-brand-dark/75 leading-relaxed">
                      {evt.description}
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 pt-0">
                  <div className="pt-4 border-t border-brand-border/80 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-brand-grey uppercase">
                      Official Schedule
                    </span>
                    <Link
                      href={evt.actionHref}
                      className="inline-flex items-center gap-1 text-xs font-mono font-bold uppercase tracking-wider text-brand-dark hover:text-brand-blue transition-colors group/link"
                    >
                      <span>{evt.actionText}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Editorial Footnote Note */}
        <div className="mt-12 p-6 rounded-2xl bg-brand-bg border border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-brand-blue shrink-0" />
            <p className="font-body text-xs sm:text-sm text-brand-dark/80">
              Want to host a COMMUNITY.VA event, hackathon track, or open mic session at your college?
            </p>
          </div>
          <Link
            href="#contact?subject=Propose%20an%20Event%20or%20Campus%20Collab"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-white bg-brand-dark rounded-full hover:bg-black transition-colors shrink-0"
          >
            <span>Propose Event</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </section>
  );
}
