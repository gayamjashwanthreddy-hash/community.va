"use client";

import Image from "next/image";
import { Users, Heart, Sparkles, Compass } from "lucide-react";

const MOMENTS = [
  {
    title: "Collaborative Sprints & Hack Sessions",
    caption: "Late-night problem solving where software developers, designers, and thinkers brainstorm solutions.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
    tag: "Student Collaboration",
    span: "col-span-1 md:col-span-2 lg:col-span-2 row-span-2",
    height: "h-80 sm:h-96 lg:h-[460px]",
  },
  {
    title: "Stage Expression & Cultural Energy",
    caption: "Unfiltered creativity at student open mics, poetry recitals, and music gatherings.",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
    tag: "Creative Spirit",
    span: "col-span-1 md:col-span-1 lg:col-span-1",
    height: "h-64 sm:h-72 lg:h-[220px]",
  },
  {
    title: "Volunteer Backstage Teams",
    caption: "The dedicated student organizers who coordinate sound, registrations, logistics, and hospitality.",
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80",
    tag: "Volunteer Action",
    span: "col-span-1 md:col-span-1 lg:col-span-1",
    height: "h-64 sm:h-72 lg:h-[220px]",
  },
  {
    title: "Peer-to-Peer Learning & Workshops",
    caption: "Students helping students master new frameworks, presentation decks, and practical tools.",
    image: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80",
    tag: "Knowledge Sharing",
    span: "col-span-1 md:col-span-1 lg:col-span-1",
    height: "h-64 sm:h-72 lg:h-[210px]",
  },
  {
    title: "Athletic Drive & Sports Tournaments",
    caption: "Fostering physical wellness, sportsmanship, and teamwork through active campus leagues.",
    image: "https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=800&q=80",
    tag: "Sportsmanship",
    span: "col-span-1 md:col-span-1 lg:col-span-1",
    height: "h-64 sm:h-72 lg:h-[210px]",
  },
  {
    title: "Group Ideation & Discussion Circles",
    caption: "Open circles where students from different departments pitch concepts and find teammates.",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80",
    tag: "Community Bonds",
    span: "col-span-1 md:col-span-1 lg:col-span-1",
    height: "h-64 sm:h-72 lg:h-[210px]",
  },
];

export default function Community() {
  return (
    <section id="community" className="py-24 sm:py-32 bg-brand-bg relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-6 border-b border-brand-border">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-brand-dark uppercase mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-dark" />
              <span>Section 05 — Our Community</span>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-brand-dark tracking-tight uppercase">
              Built By People. Growing Through Opportunities.
            </h2>
          </div>
          <p className="mt-4 md:mt-0 font-mono text-xs sm:text-sm text-brand-grey max-w-sm">
            Behind every event, workshop, and hackathon is a collective of curious, supportive, and ambitious young minds.
          </p>
        </div>

        {/* Community Values Narrative Banner */}
        <div className="mb-14 p-6 sm:p-8 rounded-2xl bg-white border border-brand-border grid grid-cols-1 md:grid-cols-3 gap-6 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-brand-blue-light text-brand-blue shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-brand-dark">Open & Inclusive</h3>
              <p className="text-xs sm:text-sm text-brand-dark/70 mt-1">
                Open to students across disciplines — engineering, humanities, business, arts, and design.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-brand-red-light text-brand-red shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-brand-dark">Culture of Encouragement</h3>
              <p className="text-xs sm:text-sm text-brand-dark/70 mt-1">
                A safe space to try new skills, take the mic for the first time, and build without fear of judgment.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-brand-bg-alt text-brand-dark shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-brand-dark">Peer-Driven Momentum</h3>
              <p className="text-xs sm:text-sm text-brand-dark/70 mt-1">
                Organized and steered entirely by passionate student volunteers who believe in the power of youth.
              </p>
            </div>
          </div>
        </div>

        {/* Editorial Photographic Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOMENTS.map((moment, idx) => (
            <div
              key={moment.title}
              className={`group relative rounded-2xl overflow-hidden border border-brand-border bg-brand-charcoal shadow-xs hover:shadow-lg transition-all duration-300 ${moment.span}`}
            >
              <div className={`relative w-full ${moment.height}`}>
                <Image
                  src={moment.image}
                  alt={moment.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                {/* Tag pill */}
                <div className="absolute top-4 left-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-black/60 backdrop-blur-md text-white font-medium border border-white/10">
                    {moment.tag}
                  </span>
                </div>

                {/* Description overlay */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="font-display text-lg sm:text-xl font-bold text-white mb-1 group-hover:text-brand-blue-light transition-colors">
                    {moment.title}
                  </h3>
                  <p className="font-body text-xs sm:text-sm text-white/80 line-clamp-2 leading-relaxed">
                    {moment.caption}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Community Spirit Manifesto Note */}
        <div className="mt-12 text-center max-w-2xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-widest text-brand-grey mb-2">
            The Spirit of COMMUNITY.VA
          </p>
          <p className="font-body text-sm text-brand-dark/80">
            No barriers. No gatekeeping. Just passionate students supporting students to unlock their authentic potential.
          </p>
        </div>

      </div>
    </section>
  );
}
