"use client";

import Link from "next/link";
import { ArrowUpRight, GraduationCap, HandHeart, Building2, Handshake, CheckCircle } from "lucide-react";

export default function GetInvolved() {
  const pathways = [
    {
      title: "Join as a Student",
      target: "Students & Learners",
      description:
        "For students who want to learn new skills, connect with like-minded peers, showcase their talents, and access competitions, hackathons, and growth opportunities.",
      perks: [
        "Participate in technical & non-technical workshops",
        "Form teams for inter-college hackathons and tournaments",
        "Showcase music, art, poetry, and public speaking",
        "Connect with mentors and peers across Hyderabad",
      ],
      ctaText: "Join as Student",
      ctaHref: "/register/student",
      badgeColor: "bg-brand-blue text-white",
      borderAccent: "border-brand-blue/50 hover:border-brand-blue",
      icon: GraduationCap,
      featured: false,
    },
    {
      title: "Become a Volunteer",
      target: "Organizers & Leaders",
      description:
        "For passionate individuals interested in contributing directly to activities, developing leadership qualities, and helping organize impactful community events.",
      perks: [
        "Gain real-world experience in event management & stage ops",
        "Lead technical tracks, hackathons, and sports tournaments",
        "Build teamwork, communication, and crisis-handling skills",
        "Earn community leadership recognition & references",
      ],
      ctaText: "Apply as Volunteer",
      ctaHref: "/register/volunteer",
      badgeColor: "bg-brand-red text-white",
      borderAccent: "border-brand-red/50 hover:border-brand-red",
      icon: HandHeart,
      featured: true,
    },
    {
      title: "Register Your College",
      target: "Institutions & Deans",
      description:
        "For colleges, institutions, student clubs, and campus coordinators interested in collaborating with COMMUNITY.VA to host joint campus initiatives.",
      perks: [
        "Co-host campus hackathons, workshops, and symposiums",
        "Engage vibrant student talent across colleges",
        "Provide mentorship and industry exposure tracks",
        "Establish official campus student chapters",
      ],
      ctaText: "Register College",
      ctaHref: "/register/college",
      badgeColor: "bg-brand-dark text-white",
      borderAccent: "border-brand-dark/50 hover:border-brand-dark",
      icon: Building2,
      featured: false,
    },
    {
      title: "Collaborate With Us",
      target: "Companies & Sponsors",
      description:
        "For companies, startups, NGOs, and creative agencies looking to support youth hackathons, mentor student cohorts, and offer challenge sponsorships.",
      perks: [
        "Sponsor innovation challenge tracks with branded problem statements",
        "Mentor top student engineering & design talent",
        "Brand presence across multi-college gatherings in Hyderabad",
        "Facilitate internships and career opportunities",
      ],
      ctaText: "Propose Partnership",
      ctaHref: "/register/partner",
      badgeColor: "bg-brand-charcoal text-white",
      borderAccent: "border-brand-grey/50 hover:border-brand-dark",
      icon: Handshake,
      featured: false,
    },
  ];

  return (
    <section id="get-involved" className="py-24 sm:py-32 bg-white border-t border-b border-brand-border relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-6 border-b border-brand-border">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-brand-blue uppercase mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
              <span>Scene 06 — Four Pathways</span>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-brand-dark tracking-tight uppercase">
              Your Next Opportunity Starts Here.
            </h2>
          </div>
          <p className="mt-4 md:mt-0 font-mono text-xs sm:text-sm text-brand-grey max-w-sm">
            Choose how you want to be part of the movement. Whether participating, organizing, verifying your campus, or partnering.
          </p>
        </div>

        {/* Four Pathways Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pathways.map((pathway) => {
            const Icon = pathway.icon;
            return (
              <div
                key={pathway.title}
                className={`relative flex flex-col justify-between p-7 rounded-3xl bg-brand-bg border transition-all duration-300 ${
                  pathway.borderAccent
                } ${pathway.featured ? "shadow-md bg-white ring-1 ring-brand-red/20" : "shadow-xs hover:shadow"}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase ${pathway.badgeColor}`}>
                      {pathway.target}
                    </span>
                    <div className="p-2 rounded-xl bg-brand-bg border border-brand-border text-brand-dark">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="font-display text-xl font-extrabold text-brand-dark uppercase mb-2">
                    {pathway.title}
                  </h3>

                  <p className="font-body text-xs text-brand-dark/75 leading-relaxed mb-5">
                    {pathway.description}
                  </p>

                  <div className="pt-3 border-t border-brand-border mb-6">
                    <ul className="space-y-2">
                      {pathway.perks.slice(0, 3).map((perk) => (
                        <li key={perk} className="flex items-start gap-2 text-xs text-brand-dark/85">
                          <CheckCircle className="w-3.5 h-3.5 text-brand-blue shrink-0 mt-0.5" />
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <Link
                    href={pathway.ctaHref}
                    className={`w-full inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-full font-display text-xs font-bold uppercase tracking-wider transition-all duration-200 group ${
                      pathway.featured
                        ? "bg-brand-red text-white hover:bg-brand-red-hover shadow-sm"
                        : "bg-brand-dark text-white hover:bg-black shadow-xs"
                    }`}
                  >
                    <span>{pathway.ctaText}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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
