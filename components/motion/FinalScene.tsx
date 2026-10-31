"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUp, ArrowUpRight, Mail, MapPin, Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function FinalScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomBrandRef = useRef<HTMLDivElement>(null);

  // Contact Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    honeypot: "",
  });

  const [formLoading, setFormLoading] = useState(false);
  const [formStatus, setFormStatus] = useState<"idle" | "success" | "error">("idle");
  const [formMsg, setFormMsg] = useState("");

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current || !zoomBrandRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Slow controlled zoom-out reveal of the brand wordmark
      gsap.fromTo(
        zoomBrandRef.current,
        { scale: 1.4, opacity: 0.3 },
        {
          scale: 1,
          opacity: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            end: "top 20%",
            scrub: 0.8,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormStatus("idle");
    setFormMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setFormStatus("success");
        setFormMsg(data.message || "Thank you! Your message has been sent to COMMUNITY.VA.");
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          honeypot: "",
        });
      } else {
        setFormStatus("error");
        setFormMsg(data.message || "Failed to deliver message. Please verify your details.");
      }
    } catch {
      setFormStatus("error");
      setFormMsg("A network error occurred. Please contact us directly at community.va@gmail.com.");
    } finally {
      setFormLoading(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer id="contact" ref={containerRef} className="bg-brand-dark text-white relative pt-24 pb-12 overflow-hidden">
      
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Scene 08: Zoom-out Brand Typography Moment */}
        <div ref={zoomBrandRef} className="text-center pb-20 border-b border-white/10 will-change-transform">
          <div className="inline-block relative h-12 w-44 mx-auto mb-4">
            <Image
              src="/logos/community-va-logo.png"
              alt="COMMUNITY.VA Logo"
              fill
              className="object-contain invert brightness-200"
            />
          </div>

          <h2 className="font-display font-extrabold text-5xl sm:text-7xl lg:text-8xl tracking-tight uppercase leading-[0.95]">
            COMMUNITY<span className="text-brand-blue">.VA</span>
          </h2>

          <p className="font-mono text-xs sm:text-base tracking-widest text-brand-grey uppercase mt-4">
            CONNECTING PEOPLE • CREATING OPPORTUNITIES
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-brand-red text-white rounded-full font-display text-xs font-bold uppercase tracking-wider hover:bg-brand-red-hover transition-colors shadow-sm"
            >
              <span>Become a Member</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>

            <Link
              href="/#home"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 border border-white/15 text-white rounded-full font-display text-xs font-bold uppercase tracking-wider hover:bg-white/20 transition-colors"
            >
              <span>Explore The Community</span>
            </Link>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 border-b border-white/10">
          
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-mono font-bold tracking-widest text-brand-blue uppercase">
              Official Inbox
            </span>
            <h3 className="font-display text-3xl font-extrabold uppercase">
              Let&apos;s Create Something Together.
            </h3>
            <p className="font-body text-sm text-white/70 leading-relaxed">
              Have a question, an idea, a collaboration opportunity or simply want to connect? Send a message directly to our team.
            </p>

            <div className="space-y-3 pt-4 text-xs font-mono text-white/80">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-blue" />
                <a href="mailto:community.va@gmail.com" className="hover:text-brand-blue-light transition-colors">
                  community.va@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-red" />
                <span>Hyderabad, Telangana, India</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
              
              {formStatus === "success" && (
                <div className="mb-4 p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{formMsg}</span>
                </div>
              )}

              {formStatus === "error" && (
                <div className="mb-4 p-4 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{formMsg}</span>
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-white/70 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Your Name"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-white/70 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-white/70 mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-white/70 mb-1">
                      Subject *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Collaboration Inquiry"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-white/70 mb-1">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us what you would like to collaborate or connect on..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-brand-blue text-white font-display text-xs font-bold uppercase tracking-wider hover:bg-brand-blue-hover transition-colors shadow-sm disabled:opacity-50"
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>

            </div>
          </div>

        </div>

        {/* Minimal Footer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-white/50">
          <div>
            © 2026 COMMUNITY.VA • Hyderabad, Telangana, India. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-white transition-colors">
              Portal Login
            </Link>
            <Link href="/register" className="hover:text-white transition-colors">
              Register
            </Link>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
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
