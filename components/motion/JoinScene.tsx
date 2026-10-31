"use client";

import Link from "next/link";
import { GraduationCap, HandHeart, Building2, Handshake, ArrowUpRight } from "lucide-react";

export default function JoinScene() {
  const options = [
    {
      role: "STUDENT",
      label: "Join as a Student",
      sub: "Access Hackathons & Skills",
      desc: "For students looking to build software, take the stage, play tournaments, and access career mentorship.",
      href: "/register/student",
      icon: GraduationCap,
      btnColor: "bg-brand-blue text-white hover:bg-brand-blue-hover",
    },
    {
      role: "VOLUNTEER",
      label: "Become a Volunteer",
      sub: "Lead One of 9 Divisions",
      desc: "For organizers passionate about coordinating events, managing technical tracks, design, and campus operations.",
      href: "/register/volunteer",
      icon: HandHeart,
      btnColor: "bg-brand-red text-white hover:bg-brand-red-hover",
    },
    {
      role: "COLLEGE",
      label: "Register Your College",
      sub: "Institutional Chapters",
      desc: "For colleges and deans seeking to host hackathons, student development programs, and campus chapters.",
      href: "/register/college",
      icon: Building2,
      btnColor: "bg-brand-dark text-white hover:bg-black",
    },
    {
      role: "PARTNER",
      label: "Collaborate as Partner",
      sub: "Sponsors & Industry",
      desc: "For startups, companies, and organizations looking to sponsor challenge tracks and mentor youth.",
      href: "/register/partner",
      icon: Handshake,
      btnColor: "bg-brand-charcoal text-white hover:bg-brand-dark",
    },
  ];

  return (
    <section id="join" className="py-24 sm:py-32 bg-white text-brand-dark border-t border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-brand-blue uppercase mb-3">
            <span className="w-2 h-2 rounded-full bg-brand-blue" />
            <span>SCENE 07 // PARTICIPATION PATHWAYS</span>
          </div>

          <h2 className="font-display text-4xl sm:text-6xl font-extrabold text-brand-dark uppercase tracking-tight leading-[0.95]">
            Be Part of Something Bigger.
          </h2>

          <p className="font-display text-lg sm:text-2xl font-bold text-brand-blue uppercase tracking-tight mt-3">
            Your People. Your Ideas. Your Opportunities.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {options.map((opt) => {
            const Icon = opt.icon;
            return (
              <div
                key={opt.role}
                className="p-8 rounded-3xl bg-brand-bg border border-brand-border flex flex-col justify-between hover:shadow-lg transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-white border border-brand-border uppercase">
                      {opt.role}
                    </span>
                    <Icon className="w-5 h-5 text-brand-dark" />
                  </div>

                  <h3 className="font-display text-2xl font-extrabold text-brand-dark uppercase mb-1">
                    {opt.label}
                  </h3>

                  <p className="font-mono text-xs text-brand-blue font-bold mb-4">
                    {opt.sub}
                  </p>

                  <p className="font-body text-xs text-brand-dark/75 leading-relaxed mb-6">
                    {opt.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-brand-border">
                  <Link
                    href={opt.href}
                    className={`w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full font-display text-xs font-bold uppercase tracking-wider transition-all duration-200 ${opt.btnColor}`}
                  >
                    <span>Proceed to Register</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
