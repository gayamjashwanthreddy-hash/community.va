"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUp, Mail, MapPin } from "lucide-react";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-brand-dark text-white border-t border-brand-border-dark pt-16 pb-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-14 border-b border-white/10">
          
          {/* Brand & Mission Column */}
          <div className="md:col-span-5 space-y-5">
            <div className="relative h-12 w-44">
              <Image
                src="/logos/community-va-logo.png"
                alt="COMMUNITY.VA Official Logo"
                fill
                className="object-contain object-left invert contrast-200 brightness-200"
              />
            </div>

            <p className="font-display text-sm font-semibold text-brand-blue-light tracking-wide">
              Connecting People • Creating Opportunities
            </p>

            <p className="font-body text-xs sm:text-sm text-white/70 max-w-sm leading-relaxed">
              Bringing people together, discovering potential and creating opportunities. A student-led youth community fostering innovation, personal leadership, culture, and sports across Hyderabad.
            </p>

            <div className="flex items-center gap-2 pt-2 text-xs font-mono text-white/60">
              <MapPin className="w-3.5 h-3.5 text-brand-red shrink-0" />
              <span>Hyderabad, Telangana, India</span>
            </div>
          </div>

          {/* Quick Navigation Column */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-mono text-xs uppercase tracking-widest text-white/50 font-bold">
              Navigation
            </h4>
            <ul className="space-y-2.5 font-body text-xs sm:text-sm text-white/80">
              {[
                { name: "Home", href: "#home" },
                { name: "About Us", href: "#about" },
                { name: "Activity Areas", href: "#activities" },
                { name: "Events & Calendar", href: "#events" },
                { name: "Our Community", href: "#community" },
                { name: "Get Involved", href: "#get-involved" },
                { name: "Contact Portal", href: "#contact" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="hover:text-brand-blue-light transition-colors flex items-center gap-1.5"
                  >
                    <span className="text-[10px] text-white/40 font-mono">→</span>
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Activity Focus Areas Column */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="font-mono text-xs uppercase tracking-widest text-white/50 font-bold">
              Five Core Spheres
            </h4>
            <ul className="space-y-2 font-mono text-xs text-white/70">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
                <span>01 Technology & Innovation</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
                <span>02 Personal Development</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
                <span>03 Events & Entertainment</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
                <span>04 Sports & Activities</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
                <span>05 Career & Opportunities</span>
              </li>
            </ul>

            <div className="pt-4 border-t border-white/10">
              <span className="block font-mono text-[11px] text-white/50 uppercase mb-1">
                Official Inquiries:
              </span>
              <a
                href="mailto:community.va@gmail.com"
                className="font-mono text-xs text-brand-blue-light hover:underline flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>community.va@gmail.com</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-white/50">
          <div>
            © 2026 COMMUNITY.VA. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <span>Student-Led • Hyderabad</span>
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Back to top"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
