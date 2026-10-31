"use client";

import Image from "next/image";
import { Target, Compass, Zap, CheckCircle2 } from "lucide-react";

export default function About() {
  const blocks = [
    {
      label: "OUR VISION",
      number: "01",
      accent: "border-brand-blue",
      badgeColor: "bg-brand-blue/10 text-brand-blue",
      icon: Target,
      text: "To create an environment where young people can discover their potential, connect with others and access meaningful opportunities.",
      subtext: "Fostering inclusive campus ecosystems where every student has the tools and peer network to thrive.",
    },
    {
      label: "OUR MISSION",
      number: "02",
      accent: "border-brand-red",
      badgeColor: "bg-brand-red/10 text-brand-red",
      icon: Zap,
      text: "To empower students through learning, collaboration, innovation, experiences and community engagement.",
      subtext: "Bridging the gap between academic theory and practical execution through hands-on initiatives.",
    },
    {
      label: "OUR APPROACH",
      number: "03",
      accent: "border-brand-dark",
      badgeColor: "bg-brand-dark/10 text-brand-dark",
      icon: Compass,
      text: "We bring people together through activities, events, competitions, networking and opportunities that encourage growth.",
      subtext: "Creating spaces where curiosity meets mentorship, teamwork, and real-world exposure.",
    },
  ];

  return (
    <section id="about" className="py-24 sm:py-32 bg-white border-t border-b border-brand-border relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-6 border-b border-brand-border">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-brand-blue uppercase mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
              <span>Section 02 — Overview</span>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-brand-dark tracking-tight uppercase">
              More Than A Community.
            </h2>
          </div>
          <p className="mt-4 md:mt-0 font-mono text-xs sm:text-sm text-brand-grey max-w-xs">
            A purposeful ecosystem for students to discover, build, and lead.
          </p>
        </div>

        {/* Narrative & Belief Editorial Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-20">
          
          <div className="lg:col-span-7 space-y-6">
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-brand-dark leading-snug">
              COMMUNITY.VA is a student-led community focused on bringing people together and creating opportunities for students to learn, connect, showcase their talents and develop skills.
            </h3>
            
            <div className="relative pl-6 border-l-2 border-brand-blue py-2 my-6 bg-brand-bg/50 p-4 rounded-r-lg">
              <p className="font-body text-lg text-brand-dark/90 italic font-medium leading-relaxed">
                “We believe every individual has potential. The right environment, meaningful connections and opportunities can help transform that potential into real achievements.”
              </p>
              <span className="block mt-2 font-mono text-xs text-brand-grey uppercase tracking-wider">
                — COMMUNITY.VA Guiding Principle
              </span>
            </div>

            <p className="font-body text-base text-brand-dark/75 leading-relaxed">
              Based in Hyderabad, our initiatives transcend institutional boundaries. Whether an engineer passionate about coding, a speaker honing stage presence, an artist seeking an audience, or a team builder leading sports activities — COMMUNITY.VA serves as the common platform where ambition finds expression and community.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-brand-bg border border-brand-border">
                <span className="block font-display text-xl font-extrabold text-brand-dark">Youth-Led</span>
                <span className="text-xs font-mono text-brand-grey mt-0.5 block">By students, for students</span>
              </div>
              <div className="p-4 rounded-xl bg-brand-bg border border-brand-border">
                <span className="block font-display text-xl font-extrabold text-brand-blue">Interdisciplinary</span>
                <span className="text-xs font-mono text-brand-grey mt-0.5 block">Tech, culture & sports</span>
              </div>
              <div className="p-4 rounded-xl bg-brand-bg border border-brand-border col-span-2 sm:col-span-1">
                <span className="block font-display text-xl font-extrabold text-brand-red">Hyderabad</span>
                <span className="text-xs font-mono text-brand-grey mt-0.5 block">Local roots, wide vision</span>
              </div>
            </div>
          </div>

          {/* Editorial Image & Visual Story */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-brand-border bg-brand-bg p-3 shadow-lg">
              <div className="relative h-96 w-full rounded-xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
                  alt="Students engaged in collaborative community discussion"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[11px] font-mono tracking-wider uppercase text-brand-blue-light font-bold">
                    Community Focus
                  </span>
                  <p className="font-display text-base font-semibold text-white mt-1">
                    Authentic spaces where student ideas take center stage.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Three Pillar Content Blocks: Vision, Mission, Approach */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blocks.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.label}
                className={`flex flex-col justify-between p-8 rounded-2xl bg-brand-bg border-t-4 ${b.accent} border border-brand-border shadow-xs hover:shadow-md transition-shadow duration-300`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider ${b.badgeColor}`}>
                      {b.label}
                    </span>
                    <span className="font-mono text-xs text-brand-grey font-bold">
                      {b.number} // 03
                    </span>
                  </div>

                  <p className="font-display text-lg font-bold text-brand-dark mb-4 leading-snug">
                    {b.text}
                  </p>

                  <p className="font-body text-sm text-brand-dark/70 leading-relaxed">
                    {b.subtext}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-brand-border/70 flex items-center gap-2 text-xs font-mono text-brand-grey">
                  <Icon className="w-4 h-4 text-brand-dark/70" />
                  <span>Guiding Pillar</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
