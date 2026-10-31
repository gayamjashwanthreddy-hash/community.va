"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function PartnerRegisterPage() {
  const [formData, setFormData] = useState({
    organizationName: "",
    website: "",
    contactPerson: "",
    email: "",
    mobile: "",
    organizationType: "Company / Corporate",
    collaborationInterest: "Hackathon Challenge Sponsorship",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/register/partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || "Failed to submit partnership request.");
      } else {
        setSuccessMsg(data.message || "Thank you! Your partnership proposal has been submitted to the leadership team.");
        setFormData({
          organizationName: "",
          website: "",
          contactPerson: "",
          email: "",
          mobile: "",
          organizationType: "Company / Corporate",
          collaborationInterest: "Hackathon Challenge Sponsorship",
          message: "",
        });
      }
    } catch {
      setErrorMsg("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-brand-border">
          <Link href="/register" className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase text-brand-grey hover:text-brand-dark transition-colors">
            <ArrowLeft className="w-4 h-4" /> All Pathways
          </Link>

          <Link href="/" className="relative h-8 w-28">
            <Image
              src="/logos/community-va-logo.png"
              alt="COMMUNITY.VA Logo"
              fill
              className="object-contain"
            />
          </Link>
        </div>

        {/* Title Block */}
        <div className="mb-8">
          <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-widest text-brand-dark bg-white border border-brand-border uppercase">
            Pathway 04 // Partner Collaboration Proposal
          </span>
          <h1 className="font-display text-3xl font-extrabold text-brand-dark uppercase tracking-tight mt-2">
            Collaborate With COMMUNITY.VA
          </h1>
          <p className="font-body text-sm text-brand-dark/70 mt-1">
            Connect with Hyderabad&apos;s youth ecosystem. Collaborate on student challenges, industry mentorship, hackathon tracks, and brand activations.
          </p>
        </div>

        {/* Notification Alerts */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm font-medium">{errorMsg}</p>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm font-medium">{successMsg}</p>
          </div>
        )}

        {/* Partner Form */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-brand-border shadow-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-brand-dark mb-1">
                Organization / Company Name *
              </label>
              <input
                type="text"
                name="organizationName"
                required
                placeholder="e.g. Acme Tech / Startup Labs"
                value={formData.organizationName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-brand-dark mb-1">
                Organization Type *
              </label>
              <select
                name="organizationType"
                value={formData.organizationType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="Company / Corporate">Company / Corporate</option>
                <option value="Startup / Tech Venture">Startup / Tech Venture</option>
                <option value="NGO / Non-Profit">NGO / Non-Profit</option>
                <option value="Event Sponsor">Event Sponsor</option>
                <option value="Industry Association">Industry Association</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-brand-dark mb-1">
                Website / Social Presence
              </label>
              <input
                type="url"
                name="website"
                placeholder="https://company.com"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-brand-dark mb-1">
                Collaboration Interest *
              </label>
              <select
                name="collaborationInterest"
                value={formData.collaborationInterest}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="Hackathon Challenge Sponsorship">Hackathon Challenge Sponsorship</option>
                <option value="Technical Workshop Hosting">Technical Workshop Hosting</option>
                <option value="Career & Mentorship Track">Career & Mentorship Track</option>
                <option value="Cultural Fest Partnership">Cultural Fest Partnership</option>
                <option value="Community Brand Activation">Community Brand Activation</option>
                <option value="Other Joint Venture">Other Joint Venture</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-brand-dark mb-1">
                Contact Person *
              </label>
              <input
                type="text"
                name="contactPerson"
                required
                placeholder="Ananya Verma"
                value={formData.contactPerson}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-brand-dark mb-1">
                Official Email *
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="partnerships@company.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-brand-dark mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                name="mobile"
                required
                placeholder="+91 98765 43210"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-brand-dark mb-1">
              Proposal / Collaboration Message *
            </label>
            <textarea
              name="message"
              required
              rows={4}
              placeholder="Tell us what you would like to collaborate on with COMMUNITY.VA..."
              value={formData.message}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full bg-brand-charcoal text-white font-display text-sm font-bold uppercase tracking-wider hover:bg-black transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Proposal...</span>
                </>
              ) : (
                <span>Submit Collaboration Proposal</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
