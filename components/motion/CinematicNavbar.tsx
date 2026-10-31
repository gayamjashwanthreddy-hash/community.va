"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, ArrowUpRight, LogIn } from "lucide-react";

const NAV_SCENES = [
  { label: "01 — COMMUNITY", href: "#community-story" },
  { label: "02 — WHAT WE DO", href: "#activities" },
  { label: "03 — ECOSYSTEM", href: "#join" },
  { label: "04 — EVENTS", href: "#events" },
  { label: "05 — JOIN US", href: "/register" },
  { label: "CONTACT", href: "#contact" },
];

export default function CinematicNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? "bg-brand-bg/90 backdrop-blur-md border-b border-brand-border py-3 shadow-xs"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-9 w-32 sm:h-10 sm:w-36">
              <Image
                src="/logos/community-va-logo.png"
                alt="COMMUNITY.VA Logo"
                fill
                priority
                className="object-contain object-left"
              />
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/80 border border-brand-border backdrop-blur-sm shadow-xs">
            {NAV_SCENES.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-3 py-1.5 text-[11px] font-mono font-bold tracking-wider uppercase text-brand-dark/80 hover:text-brand-dark hover:bg-black/5 rounded-full transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-brand-border text-xs font-mono font-bold uppercase text-brand-dark hover:bg-white transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-blue text-white text-xs font-mono font-bold uppercase tracking-wider hover:bg-brand-blue-hover transition-colors shadow-xs group"
            >
              <span>Register</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <Link
              href="/register"
              className="px-3 py-1.5 rounded-full bg-brand-blue text-white text-[11px] font-mono font-bold uppercase"
            >
              Register
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-brand-dark hover:bg-black/5"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[60px] bg-brand-bg/98 backdrop-blur-xl border-b border-brand-border p-6 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-3 font-mono text-xs font-bold uppercase">
            {NAV_SCENES.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg text-brand-dark hover:bg-black/5 flex justify-between items-center"
              >
                <span>{item.label}</span>
                <span className="text-brand-grey">#</span>
              </Link>
            ))}
            <div className="pt-4 border-t border-brand-border space-y-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 px-4 rounded-xl bg-white border border-brand-border text-center text-brand-dark block font-bold"
              >
                Portal Login
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 px-4 rounded-xl bg-brand-blue text-white text-center block font-bold"
              >
                Choose Registration Pathway
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
