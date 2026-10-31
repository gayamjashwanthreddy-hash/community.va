"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";

const VOLUNTEER_DIVISIONS = [
  "Operations",
  "Event Management",
  "Technical Team",
  "Design & Creative",
  "Marketing & Social Media",
  "Public Relations",
  "Content & Media",
  "Sponsorship & Partnerships",
  "Community Management",
];

export default function VolunteerRegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    collegeName: "",
    branch: "",
    studyYear: "2nd Year",
    preferredDivisions: [] as string[],
    experience: "",
    skills: "",
    availability: "Weekends & Evenings",
    motivation: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleDivisionToggle = (division: string) => {
    setFormData((prev) => ({
      ...prev,
      preferredDivisions: prev.preferredDivisions.includes(division)
        ? prev.preferredDivisions.filter((d) => d !== division)
        : [...prev.preferredDivisions, division],
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (formData.preferredDivisions.length === 0) {
      setErrorMsg("Please select at least one preferred volunteer division.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register/volunteer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || "Failed to submit volunteer application.");
      } else {
        setSuccessMsg(data.message || "Application submitted successfully! Redirecting to your volunteer dashboard...");
        setTimeout(() => {
          router.push(data.redirectUrl || "/dashboard/volunteer");
        }, 1500);
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
          <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-widest text-brand-red bg-brand-red-light uppercase">
            Pathway 02 // Volunteer Application
          </span>
          <h1 className="font-display text-3xl font-extrabold text-brand-dark uppercase tracking-tight mt-2">
            Join the COMMUNITY.VA Organizing Team
          </h1>
          <p className="font-body text-sm text-brand-dark/70 mt-1">
            Build leadership experience, lead operations, and help coordinate student events across Hyderabad colleges.
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

        {/* Volunteer Application Form */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-brand-border shadow-xs">
          
          <div className="border-b border-brand-border pb-4">
            <h2 className="font-display text-lg font-bold text-brand-dark uppercase">Applicant Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-brand-dark mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                required
                placeholder="Priya Varma"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-brand-dark mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="priya@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-brand-dark mb-1">
                College Name *
              </label>
              <input
                type="text"
                name="collegeName"
                required
                placeholder="e.g. CBIT / VNR / BITS"
                value={formData.collegeName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-brand-dark mb-1">
                Branch & Year *
              </label>
              <input
                type="text"
                name="branch"
                required
                placeholder="CSE — 2nd Year"
                value={formData.branch}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red"
              />
            </div>
          </div>

          <div className="border-b border-brand-border pt-4 pb-2">
            <h2 className="font-display text-lg font-bold text-brand-dark uppercase">Preferred Volunteer Divisions *</h2>
            <p className="text-xs text-brand-grey font-mono mt-0.5">Select one or more divisions you would love to contribute to</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {VOLUNTEER_DIVISIONS.map((division) => {
              const selected = formData.preferredDivisions.includes(division);
              return (
                <button
                  key={division}
                  type="button"
                  onClick={() => handleDivisionToggle(division)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-mono font-semibold transition-all text-left ${
                    selected
                      ? "bg-brand-red text-white border-brand-red"
                      : "bg-brand-bg text-brand-dark/80 border-brand-border hover:bg-brand-bg-alt"
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${selected ? "border-white bg-white text-brand-red font-bold" : "border-brand-grey"}`}>
                    {selected ? "✓" : ""}
                  </span>
                  <span>{division}</span>
                </button>
              );
            })}
          </div>

          <div className="border-b border-brand-border pt-4 pb-2">
            <h2 className="font-display text-lg font-bold text-brand-dark uppercase">Experience & Availability</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-brand-dark mb-1">
                Key Skills / Superpowers *
              </label>
              <input
                type="text"
                name="skills"
                required
                placeholder="e.g. Graphic design (Figma), Stage hosting, Logistics, Python"
                value={formData.skills}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-brand-dark mb-1">
                Availability *
              </label>
              <select
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red"
              >
                <option value="Weekends Only">Weekends Only</option>
                <option value="Weekends & Evenings">Weekends & Evenings</option>
                <option value="Event Days & Flexible">Event Days & Flexible</option>
                <option value="Full-time Active">Full-time Active (10+ hrs/wk)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-brand-dark mb-1">
              Previous Experience (College fests, clubs, internships, etc.)
            </label>
            <textarea
              name="experience"
              rows={2}
              placeholder="Tell us about any previous events or clubs you have organized or contributed to..."
              value={formData.experience}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-brand-dark mb-1">
              Why do you want to volunteer with COMMUNITY.VA? *
            </label>
            <textarea
              name="motivation"
              required
              rows={3}
              placeholder="Share what inspires you to contribute to this youth movement and what you aim to achieve..."
              value={formData.motivation}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red resize-none"
            />
          </div>

          <div className="border-b border-brand-border pt-4 pb-2">
            <h2 className="font-display text-lg font-bold text-brand-dark uppercase">Account Password</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-brand-dark mb-1">
                Password * (min 6 characters)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-brand-grey hover:text-brand-dark"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-brand-dark mb-1">
                Confirm Password *
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                required
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full bg-brand-red text-white font-display text-sm font-bold uppercase tracking-wider hover:bg-brand-red-hover transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Volunteer Application...</span>
                </>
              ) : (
                <span>Submit Volunteer Application</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
