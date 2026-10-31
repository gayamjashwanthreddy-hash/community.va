"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";

const INTEREST_OPTIONS = [
  "Hackathons & Coding",
  "Web & App Development",
  "Artificial Intelligence & ML",
  "Public Speaking & Debates",
  "Leadership & Management",
  "Music & Singing",
  "Open Mic & Poetry",
  "Sports & Tournaments",
  "Networking & Career Guidance",
];

export default function StudentRegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    collegeName: "",
    university: "",
    branch: "",
    studyYear: "1st Year",
    city: "Hyderabad",
    interests: [] as string[],
    reason: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleInterestToggle = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(item)
        ? prev.interests.filter((i) => i !== item)
        : [...prev.interests, item],
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

    if (formData.interests.length === 0) {
      setErrorMsg("Please select at least one area of interest.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || "Failed to submit registration. Please verify your details.");
      } else {
        setSuccessMsg(data.message || "Registration successful! Redirecting to your student dashboard...");
        setTimeout(() => {
          router.push(data.redirectUrl || "/dashboard/student");
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
          <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-widest text-brand-blue bg-brand-blue-light uppercase">
            Pathway 01 // Student Registration
          </span>
          <h1 className="font-display text-3xl font-extrabold text-brand-dark uppercase tracking-tight mt-2">
            Join COMMUNITY.VA as a Student
          </h1>
          <p className="font-body text-sm text-brand-dark/70 mt-1">
            Fill in your academic and personal information to create your student account and access campus activities.
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

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-brand-border shadow-xs">
          
          <div className="border-b border-brand-border pb-4">
            <h2 className="font-display text-lg font-bold text-brand-dark uppercase">Personal Information</h2>
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
                placeholder="Rahul Sharma"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
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
                placeholder="rahul@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>

          <div className="border-b border-brand-border pt-4 pb-2">
            <h2 className="font-display text-lg font-bold text-brand-dark uppercase">Academic Details</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-brand-dark mb-1">
                College Name *
              </label>
              <input
                type="text"
                name="collegeName"
                required
                placeholder="e.g. Osmania / JNTU Affiliated College"
                value={formData.collegeName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-brand-dark mb-1">
                University (Optional)
              </label>
              <input
                type="text"
                name="university"
                placeholder="e.g. Osmania University"
                value={formData.university}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-brand-dark mb-1">
                Branch / Specialization *
              </label>
              <input
                type="text"
                name="branch"
                required
                placeholder="e.g. CSE / ECE / B.Com / BBA"
                value={formData.branch}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-brand-dark mb-1">
                Current Year *
              </label>
              <select
                name="studyYear"
                value={formData.studyYear}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Postgraduate">Postgraduate</option>
              </select>
            </div>
          </div>

          <div className="border-b border-brand-border pt-4 pb-2">
            <h2 className="font-display text-lg font-bold text-brand-dark uppercase">Areas of Interest *</h2>
            <p className="text-xs text-brand-grey font-mono mt-0.5">Select all that apply to you</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {INTEREST_OPTIONS.map((item) => {
              const selected = formData.interests.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleInterestToggle(item)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-mono font-semibold transition-all text-left ${
                    selected
                      ? "bg-brand-blue text-white border-brand-blue"
                      : "bg-brand-bg text-brand-dark/80 border-brand-border hover:bg-brand-bg-alt"
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${selected ? "border-white bg-white text-brand-blue font-bold" : "border-brand-grey"}`}>
                    {selected ? "✓" : ""}
                  </span>
                  <span>{item}</span>
                </button>
              );
            })}
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-brand-dark mb-1">
              Why do you want to join COMMUNITY.VA? *
            </label>
            <textarea
              name="reason"
              required
              rows={3}
              placeholder="Tell us what excites you about the community and what you hope to experience or learn..."
              value={formData.reason}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
            />
          </div>

          <div className="border-b border-brand-border pt-4 pb-2">
            <h2 className="font-display text-lg font-bold text-brand-dark uppercase">Account Security</h2>
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
              className="w-full py-4 rounded-full bg-brand-blue text-white font-display text-sm font-bold uppercase tracking-wider hover:bg-brand-blue-hover transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Registration...</span>
                </>
              ) : (
                <span>Complete Student Registration</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
