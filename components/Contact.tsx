"use client";

import { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { OFFICIAL_COMMUNITY_EMAIL, OFFICIAL_MAILTO_LINK } from "@/lib/constants";

export default function Contact() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    honeypot: "", // Hidden spam trap
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Auto-fill subject if navigated from Get Involved or Event links
  useEffect(() => {
    const handleUrlChange = () => {
      const hash = window.location.hash;
      if (hash && hash.includes("subject=")) {
        const queryPart = hash.split("?")[1];
        if (queryPart) {
          const params = new URLSearchParams(queryPart);
          const subj = params.get("subject");
          if (subj) {
            setFormData((prev) => ({ ...prev, subject: decodeURIComponent(subj) }));
          }
        }
      }
    };

    handleUrlChange();
    window.addEventListener("hashchange", handleUrlChange);
    return () => window.removeEventListener("hashchange", handleUrlChange);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for field on type
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    setStatusMessage("");
    setFieldErrors({});

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        setStatusMessage(data.message || "Thank you! Your message has been sent to COMMUNITY.VA.");
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          honeypot: "",
        });
      } else {
        setStatus("error");
        if (data.errors) {
          setFieldErrors(data.errors);
        }
        setStatusMessage(data.message || "Unable to send message. Please review your details and try again.");
      }
    } catch {
      setStatus("error");
      setStatusMessage(`A network connection error occurred. Please check your internet connection or email us directly at ${OFFICIAL_COMMUNITY_EMAIL}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 sm:py-32 bg-brand-bg relative overflow-hidden">
      
      {/* Editorial Decorative glow */}
      <div className="absolute top-1/2 -right-32 w-80 h-80 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-6 border-b border-brand-border">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-brand-red uppercase mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
              <span>Section 07 — Contact Us</span>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-brand-dark tracking-tight uppercase">
              Let&apos;s Create Something Together.
            </h2>
          </div>
          <p className="mt-4 md:mt-0 font-mono text-xs sm:text-sm text-brand-grey max-w-sm">
            Have a question, an idea, a collaboration opportunity or simply want to connect? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Column: Contact Direct Information */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white rounded-3xl p-8 border border-brand-border shadow-xs">
              <h3 className="font-display text-xl font-bold text-brand-dark uppercase mb-4">
                Official Digital Inbox
              </h3>
              <p className="font-body text-sm text-brand-dark/75 leading-relaxed mb-6">
                All submissions sent through this portal are delivered directly to the COMMUNITY.VA team inbox. We actively monitor inquiries for campus partnerships, student memberships, and event collaborations.
              </p>

              <div className="space-y-4 pt-2">
                
                {/* Email Address */}
                <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-brand-bg border border-brand-border/70">
                  <div className="p-2 rounded-lg bg-brand-blue-light text-brand-blue shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-mono uppercase tracking-wider text-brand-grey">
                      Direct Email
                    </span>
                    <a
                      href={OFFICIAL_MAILTO_LINK}
                      className="font-mono text-sm font-bold text-brand-dark hover:text-brand-blue transition-colors"
                    >
                      {OFFICIAL_COMMUNITY_EMAIL}
                    </a>
                  </div>
                </div>

                {/* City & Base */}
                <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-brand-bg border border-brand-border/70">
                  <div className="p-2 rounded-lg bg-brand-red-light text-brand-red shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-mono uppercase tracking-wider text-brand-grey">
                      Headquarters
                    </span>
                    <span className="font-body text-sm font-semibold text-brand-dark">
                      Hyderabad, Telangana, India
                    </span>
                  </div>
                </div>

              </div>

              {/* Guiding Assurance Note */}
              <div className="mt-8 pt-6 border-t border-brand-border text-xs font-mono text-brand-grey">
                <span className="text-brand-dark font-bold">RESPONSE PROTOCOL:</span> Within 24–48 hours for student queries, hackathon teams, and institutional proposals.
              </div>
            </div>

            {/* Quick Suggestions Card */}
            <div className="bg-brand-dark text-white rounded-3xl p-8 border border-brand-border-dark">
              <span className="text-xs font-mono text-brand-blue-light tracking-wider uppercase font-bold block mb-2">
                Common Topics
              </span>
              <p className="text-xs text-white/70 mb-4 leading-relaxed">
                Click any subject to quickly fill your message subject:
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Joining the Community",
                  "Volunteering with COMMUNITY.VA",
                  "Institutional Collaboration",
                  "Proposing an Event",
                  "Hackathon Partnership",
                ].map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, subject: topic }));
                    }}
                    className="px-2.5 py-1 text-xs font-mono rounded bg-white/10 hover:bg-white/20 border border-white/10 text-white/90 transition-colors"
                  >
                    + {topic}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-brand-border shadow-xs">
              
              <div className="mb-6">
                <h3 className="font-display text-2xl font-extrabold text-brand-dark uppercase">
                  Send A Message
                </h3>
                <p className="font-body text-xs sm:text-sm text-brand-dark/70 mt-1">
                  Fill out the form below. Required fields are marked with an asterisk (*).
                </p>
              </div>

              {/* Success Notification Banner */}
              {status === "success" && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-display text-sm font-bold">Message Delivered</h4>
                    <p className="text-xs sm:text-sm text-emerald-800 mt-0.5">
                      {statusMessage}
                    </p>
                  </div>
                </div>
              )}

              {/* Error Notification Banner */}
              {status === "error" && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-display text-sm font-bold">Submission Notice</h4>
                    <p className="text-xs sm:text-sm text-red-800 mt-0.5">
                      {statusMessage}
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                
                {/* Honeypot Spam Field (Hidden from normal users) */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="website">Leave blank</label>
                  <input
                    type="text"
                    id="website"
                    name="honeypot"
                    value={formData.honeypot}
                    onChange={handleChange}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                {/* Name & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="fullName" className="block text-xs font-mono font-bold uppercase tracking-wider text-brand-dark mb-1.5">
                      Full Name <span className="text-brand-red">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl bg-brand-bg border text-sm text-brand-dark placeholder-brand-grey/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all ${
                        fieldErrors.fullName ? "border-brand-red ring-1 ring-brand-red" : "border-brand-border"
                      }`}
                    />
                    {fieldErrors.fullName && (
                      <p className="text-[11px] font-mono text-brand-red mt-1">{fieldErrors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs font-mono font-bold uppercase tracking-wider text-brand-dark mb-1.5">
                      Email Address <span className="text-brand-red">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      placeholder="e.g. rahul@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl bg-brand-bg border text-sm text-brand-dark placeholder-brand-grey/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all ${
                        fieldErrors.email ? "border-brand-red ring-1 ring-brand-red" : "border-brand-border"
                      }`}
                    />
                    {fieldErrors.email && (
                      <p className="text-[11px] font-mono text-brand-red mt-1">{fieldErrors.email}</p>
                    )}
                  </div>
                </div>

                {/* Phone & Subject Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="phone" className="block text-xs font-mono font-bold uppercase tracking-wider text-brand-dark mb-1.5">
                      Phone Number <span className="text-brand-grey font-normal">(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="e.g. +91 98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl bg-brand-bg border text-sm text-brand-dark placeholder-brand-grey/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all ${
                        fieldErrors.phone ? "border-brand-red ring-1 ring-brand-red" : "border-brand-border"
                      }`}
                    />
                    {fieldErrors.phone && (
                      <p className="text-[11px] font-mono text-brand-red mt-1">{fieldErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-xs font-mono font-bold uppercase tracking-wider text-brand-dark mb-1.5">
                      Subject <span className="text-brand-red">*</span>
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      required
                      placeholder="e.g. Campus Collaboration Inquiry"
                      value={formData.subject}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl bg-brand-bg border text-sm text-brand-dark placeholder-brand-grey/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all ${
                        fieldErrors.subject ? "border-brand-red ring-1 ring-brand-red" : "border-brand-border"
                      }`}
                    />
                    {fieldErrors.subject && (
                      <p className="text-[11px] font-mono text-brand-red mt-1">{fieldErrors.subject}</p>
                    )}
                  </div>
                </div>

                {/* Message Field */}
                <div>
                  <label htmlFor="message" className="block text-xs font-mono font-bold uppercase tracking-wider text-brand-dark mb-1.5">
                    Message <span className="text-brand-red">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    placeholder="Tell us about yourself, your ideas, questions, or how you would like to collaborate..."
                    value={formData.message}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl bg-brand-bg border text-sm text-brand-dark placeholder-brand-grey/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all resize-none ${
                      fieldErrors.message ? "border-brand-red ring-1 ring-brand-red" : "border-brand-border"
                    }`}
                  />
                  {fieldErrors.message && (
                    <p className="text-[11px] font-mono text-brand-red mt-1">{fieldErrors.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-brand-blue text-white font-display text-sm font-bold uppercase tracking-wider hover:bg-brand-blue-hover disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow"
                  >
                    {loading ? (
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
                </div>

              </form>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
