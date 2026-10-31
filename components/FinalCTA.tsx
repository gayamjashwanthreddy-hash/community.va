"use client";

import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="py-24 sm:py-32 bg-brand-dark text-white relative overflow-hidden">
      
      {/* Background Cinematic Ambience */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-blue/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-brand-red/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-mono font-medium tracking-wide text-brand-blue-light mb-6">
          <Sparkles className="w-3.5 h-3.5 text-brand-blue" />
          <span>SCENE 07 // COMMUNITY CALL</span>
        </div>

        <h2 className="font-display font-extrabold text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight uppercase leading-[1.05] max-w-5xl mx-auto">
          Your People. <br />
          Your Ideas. <br />
          <span className="text-brand-blue">Your Opportunities.</span>
        </h2>

        <p className="font-body text-base sm:text-xl text-white/75 max-w-2xl mx-auto mt-6 leading-relaxed">
          Bringing people together, discovering potential and creating opportunities. The journey starts with a single step.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-brand-red text-white font-display text-sm font-bold uppercase tracking-wider hover:bg-brand-red-hover transition-all duration-200 shadow-lg hover:shadow-xl group"
          >
            <span>Become Part of COMMUNITY.VA</span>
            <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>

          <Link
            href="/#contact"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/10 border border-white/15 text-white font-display text-sm font-bold uppercase tracking-wider hover:bg-white/20 transition-all duration-200"
          >
            <span>Connect With Our Team</span>
          </Link>
        </div>

        <p className="font-mono text-xs text-white/40 uppercase tracking-widest mt-8">
          Hyderabad, India • Student-Led • Authentic • Impact-Driven
        </p>

      </div>
    </section>
  );
}
