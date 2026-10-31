"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";

const INSTITUTION_TYPES = [
  "Engineering College",
  "Degree College",
  "University",
  "Management Institution",
  "Other",
];

const COLLABORATION_AREAS = [
  "Hackathons",
  "Technical Workshops",
  "Cultural Events",
  "Sports",
  "Student Development",
  "Campus Chapters",
  "Career Opportunities",
  "Institutional Partnerships",
];

export default function CollegeRegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    institutionName: "",
    institutionType: "Engineering College",
    website: "",
    collegeEmail: "",
    contactPerson: "",
    designation: "",
    mobile: "",
    city: "Hyderabad",
    state: "Telangana",
    studentStrength: "2,000 - 5,000",
    collaborationAreas: [] as string[],
    additionalInformation: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleAreaToggle = (area: string) => {
    setFormData((prev) => ({
      ...prev,
      collaborationAreas: prev.collaborationAreas.includes(area)
        ? prev.collaborationAreas.filter((a) => a !== area)
        : [...prev.collaborationAreas, area],
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

    if (formData.collaborationAreas.length === 0) {
      setErrorMsg("Please select at least one collaboration area.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register/college", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || "Failed to submit college registration.");
      } else {
        setSuccessMsg(data.message || "Registration submitted for verification! Redirecting to college dashboard...");
        setTimeout(() => {
          router.push(data.redirectUrl || "/dashboard/college");
        }, 1500);
      }
    } catch {
      setErrorMsg("A network connection error occurred. Please try again.");
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
            Pathway 03 // College Registration & Verification
          </span>
          <h1 className="font-display text-3xl font-extrabold text-brand-dark uppercase tracking-tight mt-2">
            Register Your College or Institution
          </h1>
          <p className="font-body text-sm text-brand-dark/70 mt-1">
            Empower your students by collaborating with COMMUNITY.VA on hackathons, sports leagues, cultural fests, and skill-building programs.
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

        {/* College Application Form */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-brand-border shadow-xs">
          
          <div className="border-b border-brand-border pb-4">
            <h2 className="font-display text-lg font-bold text-brand-dark uppercase">Institution Overview</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-brand-dark mb-1">
                College / Institution Name *
              </label>
              <input
                type="text"
                name="institutionName"
                required
                placeholder="e.g. Institute of Aeronautical Engineering"
                value={formData.institutionName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-brand-dark mb-1">
                Institution Type *
              </label>
              <select
                name="institutionType"
                value={formData.institutionType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                {INSTITUTION_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-brand-dark mb-1">
                Official College Website
              </label>
              <input
                type="url"
                name="website"
                placeholder="https://college.edu.in"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-brand-dark mb-1">
                Approximate Student Strength
              </label>
              <select
                name="studentStrength"
                value={formData.studentStrength}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="Under 1,000">Under 1,000</option>
                <option value="1,000 - 3,000">1,000 - 3,000</option>
                <option value="3,000 - 6,000">3,000 - 6,000</option>
                <option value="6,000 - 10,000">6,000 - 10,000</option>
                <option value="10,000+">10,000+</option>
              </select>
            </div>
          </div>

          <div className="border-b border-brand-border pt-4 pb-2">
            <h2 className="font-display text-lg font-bold text-brand-dark uppercase">Representative Contact Details</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-brand-dark mb-1">
                Contact Person Name *
              </label>
              <input
                type="text"
                name="contactPerson"
                required
                placeholder="Dr. K. Srinivas"
                value={formData.contactPerson}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-brand-dark mb-1">
                Designation *
              </label>
              <input
                type="text"
                name="designation"
                required
                placeholder="Dean of Student Affairs / TPO"
                value={formData.designation}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-brand-dark mb-1">
                Official College Email * (Used for Login)
              </label>
              <input
                type="email"
                name="collegeEmail"
                required
                placeholder="principal@college.edu.in"
                value={formData.collegeEmail}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-brand-dark mb-1">
                City *
              </label>
              <input
                type="text"
                name="city"
                required
                placeholder="Hyderabad"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-brand-dark mb-1">
                State *
              </label>
              <input
                type="text"
                name="state"
                required
                placeholder="Telangana"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>

          <div className="border-b border-brand-border pt-4 pb-2">
            <h2 className="font-display text-lg font-bold text-brand-dark uppercase">Collaboration Areas *</h2>
            <p className="text-xs text-brand-grey font-mono mt-0.5">Select activities you are interested in hosting or participating in</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {COLLABORATION_AREAS.map((area) => {
              const selected = formData.collaborationAreas.includes(area);
              return (
                <button
                  key={area}
                  type="button"
                  onClick={() => handleAreaToggle(area)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-mono font-semibold transition-all text-left ${
                    selected
                      ? "bg-brand-dark text-white border-brand-dark"
                      : "bg-brand-bg text-brand-dark/80 border-brand-border hover:bg-brand-bg-alt"
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${selected ? "border-white bg-white text-brand-dark font-bold" : "border-brand-grey"}`}>
                    {selected ? "✓" : ""}
                  </span>
                  <span>{area}</span>
                </button>
              );
            })}
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-brand-dark mb-1">
              Additional Information / Campus Vision
            </label>
            <textarea
              name="additionalInformation"
              rows={2}
              placeholder="Tell us about your campus facilities, student body interest, or specific initiatives you would like to run..."
              value={formData.additionalInformation}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
            />
          </div>

          <div className="border-b border-brand-border pt-4 pb-2">
            <h2 className="font-display text-lg font-bold text-brand-dark uppercase">Portal Account Password</h2>
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
                  className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
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
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full bg-brand-dark text-white font-display text-sm font-bold uppercase tracking-wider hover:bg-black transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Verification Request...</span>
                </>
              ) : (
                <span>Submit College Verification</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
