"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, ArrowUpRight, User, LogIn } from "lucide-react";

const NAV_LINKS = [
  { name: "Home", href: "/#home" },
  { name: "About", href: "/#about" },
  { name: "Activities", href: "/#activities" },
  { name: "Events", href: "/#events" },
  { name: "Community", href: "/#community" },
  { name: "Get Involved", href: "/register" },
  { name: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-brand-bg/95 backdrop-blur-md border-b border-brand-border py-3 shadow-xs"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo & Wordmark */}
          <Link
            href="/"
            className="group flex items-center gap-3 focus:outline-none"
            aria-label="COMMUNITY.VA Home"
          >
            <div className="relative h-10 w-32 sm:h-11 sm:w-36 transition-transform duration-200 group-hover:scale-[1.02]">
              <Image
                src="/logos/community-va-logo.png"
                alt="COMMUNITY.VA Logo"
                fill
                priority
                className="object-contain object-left"
              />
            </div>
            <span className="hidden xl:inline-block pl-3 border-l border-brand-border text-[11px] font-mono tracking-wider uppercase text-brand-grey font-medium">
              Hyderabad • India
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            className="hidden md:flex items-center gap-1 lg:gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-brand-border/80 backdrop-blur-sm shadow-xs"
            aria-label="Main Navigation"
          >
            {NAV_LINKS.slice(0, 5).map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-full text-brand-dark/75 hover:text-brand-dark hover:bg-black/5 transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/#contact"
              className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-full text-brand-dark/75 hover:text-brand-dark hover:bg-black/5 transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand-dark hover:text-brand-blue bg-white border border-brand-border rounded-full hover:bg-brand-bg transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Portal Login</span>
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-brand-blue hover:bg-brand-blue-hover rounded-full transition-all duration-200 shadow-xs hover:shadow group"
            >
              <span>Register Now</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          {/* Mobile Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/register"
              className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white bg-brand-blue rounded-full"
            >
              Register
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-brand-dark hover:bg-black/5 focus:outline-none"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[60px] bg-brand-bg/98 backdrop-blur-xl border-b border-brand-border p-6 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg text-sm font-semibold tracking-wide text-brand-dark hover:bg-black/5"
              >
                <span>{link.name}</span>
                <span className="font-mono text-xs opacity-50">#</span>
              </Link>
            ))}
            <div className="pt-4 border-t border-brand-border mt-2 space-y-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white border border-brand-border text-brand-dark rounded-xl text-xs font-bold uppercase tracking-wider"
              >
                <LogIn className="w-4 h-4" />
                <span>Portal Sign In</span>
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-blue text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm"
              >
                <span>Choose Pathway to Register</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
