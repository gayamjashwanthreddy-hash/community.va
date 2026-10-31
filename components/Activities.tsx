"use client";

import Image from "next/image";
import { 
  Code2, 
  Users2, 
  Sparkles, 
  Trophy, 
  Briefcase, 
  ArrowUpRight,
  Terminal,
  Mic2,
  Medal,
  TrendingUp,
  BrainCircuit
} from "lucide-react";

export default function Activities() {
  return (
    <section id="activities" className="py-24 sm:py-32 bg-brand-bg relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-6 border-b border-brand-border">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-brand-red uppercase mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
              <span>Section 03 — What We Do</span>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-brand-dark tracking-tight uppercase">
              Opportunities Beyond Classrooms.
            </h2>
          </div>
          <p className="mt-4 md:mt-0 font-mono text-xs sm:text-sm text-brand-grey max-w-sm">
            Five vibrant spheres designed to cultivate technical excellence, stage confidence, teamwork, and career readiness.
          </p>
        </div>

        {/* VARIATION 1: Big Featured Spotlight for 01 - Technology & Innovation */}
        <div className="mb-10 bg-brand-dark text-white rounded-3xl p-8 sm:p-12 border border-brand-border-dark relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-blue/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold tracking-widest px-3 py-1 rounded-full bg-brand-blue text-white uppercase">
                  AREA 01
                </span>
                <span className="flex items-center gap-1.5 text-xs font-mono text-white/60">
                  <Terminal className="w-3.5 h-3.5 text-brand-blue" /> Hackathons & Technical Builds
                </span>
              </div>

              <h3 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight uppercase text-white">
                Technology & Innovation
              </h3>

              <p className="font-body text-base sm:text-lg text-white/80 leading-relaxed max-w-xl">
                Hackathons, coding competitions, innovation challenges, technical workshops and project development. We provide the crucible for builders to turn abstract code into working software.
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  "Hackathons",
                  "Coding Competitions",
                  "Innovation Challenges",
                  "Technical Workshops",
                  "Project Development",
                  "Technology Events",
                ].map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-mono text-white/90 transition-colors"
                  >
                    #{item}
                  </span>
                ))}
              </div>

              <div className="pt-4 flex items-center gap-6 text-xs font-mono text-white/60 border-t border-white/10">
                <span className="flex items-center gap-1.5">
                  <BrainCircuit className="w-4 h-4 text-brand-blue" /> Real-world Project Tracks
                </span>
                <span className="flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-brand-blue" /> Peer Mentorship & Code Reviews
                </span>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80"
                  alt="Student programmers collaborating at a hackathon"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-[11px] font-mono text-brand-blue-light font-bold uppercase">
                    Build & Ship Culture
                  </span>
                  <p className="text-xs text-white/90 mt-0.5">
                    From late-night hack sprints to showcase demos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* VARIATION 2 & 3: Asymmetrical Duo for 02 - Personal Development & 03 - Events & Entertainment */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          
          {/* Area 02: Personal Development (Vertical Editorial Layout) */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-8 sm:p-10 border border-brand-border flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-xs font-bold tracking-widest px-3 py-1 rounded-full bg-brand-red/10 text-brand-red uppercase">
                  AREA 02
                </span>
                <span className="font-mono text-xs text-brand-grey font-bold">FOUNDATIONAL SKILLS</span>
              </div>

              <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-brand-dark uppercase mb-4">
                Personal Development
              </h3>

              <p className="font-body text-base text-brand-dark/75 leading-relaxed mb-6">
                Leadership, communication, teamwork, confidence and professional skills. Technical brilliance needs communicative strength and emotional intelligence to create leaders.
              </p>

              <div className="relative h-48 w-full rounded-xl overflow-hidden mb-6 border border-brand-border">
                <Image
                  src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80"
                  alt="Student delivering a presentation to peers"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 text-white text-xs font-mono font-medium">
                  Confidence & Public Speaking Circles
                </div>
              </div>

              <ul className="space-y-2.5 text-sm text-brand-dark/85">
                {[
                  "Leadership training & community stewardship",
                  "Structured public speaking & presentation mastery",
                  "Collaborative teamwork under real-world pressure",
                  "Professional poise, etiquette & personality development",
                ].map((pt) => (
                  <li key={pt} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-red mt-2 shrink-0" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-brand-border flex items-center justify-between text-xs font-mono text-brand-grey">
              <span>LEADERSHIP LABS</span>
              <Users2 className="w-4 h-4 text-brand-red" />
            </div>
          </div>

          {/* Area 03: Events & Entertainment (Stage / Cultural Aesthetic) */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-8 sm:p-10 border border-brand-border flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-xs font-bold tracking-widest px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue uppercase">
                  AREA 03
                </span>
                <span className="font-mono text-xs text-brand-grey font-bold">CULTURE & EXPRESSION</span>
              </div>

              <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-brand-dark uppercase mb-4">
                Events & Entertainment
              </h3>

              <p className="font-body text-base text-brand-dark/75 leading-relaxed mb-6">
                Cultural events, singing competitions, talent shows, open mics and community gatherings. A vibrant youth stage where artistic talent and creative expression shine bright.
              </p>

              <div className="relative h-48 w-full rounded-xl overflow-hidden mb-6 border border-brand-border">
                <Image
                  src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80"
                  alt="Student performing on stage at a youth cultural event"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 text-white text-xs font-mono font-medium">
                  Live Stage, Music & Open Mic Sessions
                </div>
              </div>

              <ul className="space-y-2.5 text-sm text-brand-dark/85">
                {[
                  "Inter-college cultural showcases and acoustic nights",
                  "Vocal & instrumental talent competitions",
                  "Open mic poetry, stand-up, and creative storytelling",
                  "Community social meetups and festival gatherings",
                ].map((pt) => (
                  <li key={pt} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-blue mt-2 shrink-0" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-brand-border flex items-center justify-between text-xs font-mono text-brand-grey">
              <span>STAGE & SPOTLIGHT</span>
              <Mic2 className="w-4 h-4 text-brand-blue" />
            </div>
          </div>

        </div>

        {/* VARIATION 4 & 5: Horizontal Editorial Cards for 04 - Sports & 05 - Career */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Area 04: Sports & Activities */}
          <div className="bg-brand-bg-alt/80 rounded-3xl p-8 border border-brand-border flex flex-col justify-between hover:bg-white transition-colors duration-300">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-xs font-bold tracking-widest px-2.5 py-1 rounded bg-brand-dark text-white uppercase">
                  AREA 04
                </span>
                <span className="text-xs font-mono text-brand-grey font-medium uppercase tracking-wider">
                  ENERGY & ENDURANCE
                </span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <Trophy className="w-6 h-6 text-brand-dark" />
                <h3 className="font-display text-2xl font-extrabold text-brand-dark uppercase">
                  Sports & Activities
                </h3>
              </div>

              <p className="font-body text-sm sm:text-base text-brand-dark/80 leading-relaxed mb-6">
                Sports competitions, tournaments, recreational activities and team-building experiences. Building camaraderie, physical wellness, and athletic spirit through active play.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-white rounded-xl border border-brand-border">
                  <span className="block font-mono text-xs font-bold text-brand-dark">Tournaments</span>
                  <span className="text-[11px] text-brand-grey">Cricket, football, badminton & e-sports</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-brand-border">
                  <span className="block font-mono text-xs font-bold text-brand-dark">Recreation</span>
                  <span className="text-[11px] text-brand-grey">Outdoor treks & team sports challenges</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-brand-border/70 flex items-center justify-between text-xs font-mono text-brand-grey">
              <span>TEAM SPIRIT</span>
              <Medal className="w-4 h-4 text-brand-dark/70" />
            </div>
          </div>

          {/* Area 05: Career & Opportunities */}
          <div className="bg-brand-bg-alt/80 rounded-3xl p-8 border border-brand-border flex flex-col justify-between hover:bg-white transition-colors duration-300">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-xs font-bold tracking-widest px-2.5 py-1 rounded bg-brand-blue text-white uppercase">
                  AREA 05
                </span>
                <span className="text-xs font-mono text-brand-grey font-medium uppercase tracking-wider">
                  FUTURE HORIZONS
                </span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <Briefcase className="w-6 h-6 text-brand-blue" />
                <h3 className="font-display text-2xl font-extrabold text-brand-dark uppercase">
                  Career & Opportunities
                </h3>
              </div>

              <p className="font-body text-sm sm:text-base text-brand-dark/80 leading-relaxed mb-6">
                Networking, career guidance, mentorship, industry exposure and professional development. Connecting aspiring students with senior mentors, founders, and industry experts.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-white rounded-xl border border-brand-border">
                  <span className="block font-mono text-xs font-bold text-brand-dark">Mentorship</span>
                  <span className="text-[11px] text-brand-grey">1-on-1 guidance & resume reviews</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-brand-border">
                  <span className="block font-mono text-xs font-bold text-brand-dark">Industry Exposure</span>
                  <span className="text-[11px] text-brand-grey">Founder talks & networking meetups</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-brand-border/70 flex items-center justify-between text-xs font-mono text-brand-grey">
              <span>PROFESSIONAL GROWTH</span>
              <TrendingUp className="w-4 h-4 text-brand-blue" />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
