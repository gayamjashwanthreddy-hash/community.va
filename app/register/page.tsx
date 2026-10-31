"use client";

import Link from "next/link";
import Image from "next/image";
import { GraduationCap, HandHeart, Building2, Handshake, ArrowRight, ArrowLeft } from "lucide-react";

export default function RegisterHubPage() {
  const pathways = [
    {
      title: "Join as a Student",
      category: "STUDENTS & LEARNERS",
      description:
        "Access hackathons, workshops, coding competitions, sports, and talent stages while connecting with like-minded peers across Hyderabad colleges.",
      href: "/register/student",
      icon: GraduationCap,
      badge: "Open to all students",
      accent: "hover:border-brand-blue group-hover:text-brand-blue",
      btnColor: "bg-brand-blue hover:bg-brand-blue-hover text-white",
    },
    {
      title: "Become a Volunteer",
      category: "ORGANIZERS & LEADERS",
      description:
        "Join one of our 9 divisions: Operations, Technical, Design, Event Management, Media, PR, and more. Lead initiatives and shape youth community experiences.",
      href: "/register/volunteer",
      icon: HandHeart,
      badge: "Leadership Cohort",
      accent: "hover:border-brand-red group-hover:text-brand-red",
      btnColor: "bg-brand-red hover:bg-brand-red-hover text-white",
    },
    {
      title: "Register Your College",
      category: "CAMPUS INSTITUTIONS",
      description:
        "Partner with COMMUNITY.VA to host campus hackathons, symposiums, student development programs, and inter-college sports championships.",
      href: "/register/college",
      icon: Building2,
      badge: "Institution Verification",
      accent: "hover:border-brand-dark group-hover:text-brand-dark",
      btnColor: "bg-brand-dark hover:bg-black text-white",
    },
    {
      title: "Collaborate as a Partner",
      category: "COMPANIES, NGOS & SPONSORS",
      description:
        "Collaborate with Hyderabad's growing student-led community through challenge sponsorships, mentorship tracks, and industry exposure opportunities.",
      href: "/register/partner",
      icon: Handshake,
      badge: "Partnerships",
      accent: "hover:border-brand-grey group-hover:text-brand-dark",
      btnColor: "bg-brand-charcoal hover:bg-brand-dark text-white",
    },
  ];

  return (
    <div className="min-h-screen bg-brand-bg py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div className="max-w-5xl mx-auto w-full">
        
        {/* Navigation & Brand Header */}
        <div className="flex items-center justify-between pb-8 mb-10 border-b border-brand-border">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase text-brand-grey hover:text-brand-dark transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <Link href="/" className="relative h-9 w-32">
            <Image
              src="/logos/community-va-logo.png"
              alt="COMMUNITY.VA Logo"
              fill
              className="object-contain"
              priority
            />
          </Link>

          <Link
            href="/login"
            className="text-xs font-mono font-bold uppercase tracking-wider text-brand-dark hover:text-brand-blue transition-colors"
          >
            Already Registered? <span className="underline">Login</span>
          </Link>
        </div>

        {/* Hero Title */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold tracking-widest text-brand-blue bg-brand-blue-light uppercase mb-3">
            Choose Your Pathway
          </span>
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-brand-dark tracking-tight uppercase">
            Join COMMUNITY.VA
          </h1>
          <p className="font-body text-base text-brand-dark/75 mt-3">
            Select the registration category that best describes how you wish to engage with Hyderabad&apos;s youth ecosystem.
          </p>
        </div>

        {/* Pathways Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pathways.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className={`group flex flex-col justify-between p-8 rounded-3xl bg-white border border-brand-border transition-all duration-300 hover:shadow-lg ${p.accent}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-brand-grey">
                      {p.category}
                    </span>
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-brand-bg text-brand-dark border border-brand-border">
                      {p.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 rounded-2xl bg-brand-bg border border-brand-border text-brand-dark">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h2 className="font-display text-2xl font-extrabold text-brand-dark uppercase">
                      {p.title}
                    </h2>
                  </div>

                  <p className="font-body text-sm text-brand-dark/75 leading-relaxed mb-6">
                    {p.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-brand-border/60">
                  <Link
                    href={p.href}
                    className={`w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full font-display text-xs font-bold uppercase tracking-wider transition-all duration-200 ${p.btnColor}`}
                  >
                    <span>Proceed to Application</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      <div className="max-w-5xl mx-auto w-full pt-12 text-center text-xs font-mono text-brand-grey border-t border-brand-border/60 mt-12">
        © 2026 COMMUNITY.VA • Hyderabad, India • Connecting People • Creating Opportunities
      </div>
    </div>
  );
}
