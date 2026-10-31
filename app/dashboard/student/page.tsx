"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  GraduationCap, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  LogOut, 
  Calendar, 
  Tag, 
  Sparkles,
  MapPin,
  ExternalLink,
  BookOpen
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function StudentDashboardPage() {
  const router = useRouter();

  // Student state (populated from real session or fallback)
  const [studentData, setStudentData] = useState({
    fullName: "Student Member",
    email: "student@example.com",
    mobile: "+91 98765 43210",
    collegeName: "Hyderabad Campus",
    branch: "Computer Science & Engineering",
    studyYear: "2nd Year",
    city: "Hyderabad",
    interests: ["Hackathons & Coding", "Artificial Intelligence & ML", "Public Speaking"],
    reference: "CVA-STU-8821",
    status: "APPROVED" as "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED",
    submissionDate: "October 2026",
    rejectionReason: "",
  });

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Logout error", err);
    }
    router.push("/login");
  };

  const isPending = studentData.status === "PENDING";
  const isUnderReview = studentData.status === "UNDER_REVIEW";
  const isApproved = studentData.status === "APPROVED";
  const isRejected = studentData.status === "REJECTED";

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between">
      
      {/* Top Navbar */}
      <header className="bg-white border-b border-brand-border sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="relative h-8 w-28">
              <Image
                src="/logos/community-va-logo.png"
                alt="COMMUNITY.VA Logo"
                fill
                className="object-contain"
                priority
              />
            </Link>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-brand-blue-light text-brand-blue font-mono text-[11px] font-bold uppercase tracking-wider">
              Student Portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:inline-block text-xs font-mono text-brand-grey">
              Reference: <strong className="text-brand-dark">{studentData.reference}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-brand-border text-xs font-mono font-semibold text-brand-dark hover:bg-brand-bg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        
        {/* Welcome Banner */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-brand-border shadow-xs mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-mono font-bold tracking-widest text-brand-blue uppercase">
                Student Member Profile
              </span>
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-dark uppercase tracking-tight mt-1">
                Welcome back, {studentData.fullName}
              </h1>
              <p className="font-body text-sm text-brand-dark/70 mt-1 flex items-center gap-2">
                <span>{studentData.collegeName}</span>
                <span>•</span>
                <span>{studentData.branch} ({studentData.studyYear})</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-brand-blue-light text-brand-blue">
                <GraduationCap className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Application Status Tracker */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-brand-border shadow-xs mb-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-brand-border">
            <h2 className="font-display text-lg font-bold text-brand-dark uppercase">
              Registration Lifecycle Tracker
            </h2>
            <span className="font-mono text-xs text-brand-grey uppercase">
              Submitted: {studentData.submissionDate}
            </span>
          </div>

          {/* Stepper Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            
            {/* Step 1 */}
            <div className="p-4 rounded-2xl border bg-brand-bg border-brand-border relative">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand-dark mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>01. SUBMITTED</span>
              </div>
              <p className="text-xs text-brand-dark/70">Application successfully registered in COMMUNITY.VA database.</p>
            </div>

            {/* Step 2 */}
            <div className={`p-4 rounded-2xl border transition-all ${isUnderReview || isApproved || isRejected ? "bg-brand-bg border-brand-border" : "bg-white border-brand-border/60 opacity-60"}`}>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand-dark mb-1">
                {isApproved || isRejected ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-500" />
                )}
                <span>02. UNDER REVIEW</span>
              </div>
              <p className="text-xs text-brand-dark/70">Verified by student leadership committee.</p>
            </div>

            {/* Step 3 */}
            <div className={`p-4 rounded-2xl border transition-all ${isApproved ? "bg-emerald-50 border-emerald-200" : isRejected ? "bg-red-50 border-red-200" : "bg-white border-brand-border/60 opacity-60"}`}>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand-dark mb-1">
                {isApproved && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                {isRejected && <XCircle className="w-4 h-4 text-red-600" />}
                {!isApproved && !isRejected && <Clock className="w-4 h-4 text-brand-grey" />}
                <span>03. {isApproved ? "APPROVED" : isRejected ? "REJECTED" : "DECISION"}</span>
              </div>
              <p className="text-xs text-brand-dark/70">
                {isApproved && "Official member status granted."}
                {isRejected && "Application not accepted."}
                {!isApproved && !isRejected && "Decision pending leadership review."}
              </p>
            </div>

          </div>

          {/* Status Message Callout */}
          {isPending && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-medium">
              Your registration has been received. Our team will review your information.
            </div>
          )}

          {isApproved && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-medium flex items-center justify-between">
              <div>
                <strong>Active Community Membership:</strong> You have full access to participate in upcoming hackathons, tech workshops, open mics, and student leagues.
              </div>
              <Link href="/#events" className="hidden sm:inline-flex items-center gap-1 text-xs font-mono font-bold text-emerald-800 hover:underline">
                Explore Events <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {isRejected && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs sm:text-sm font-medium">
              <p><strong>Application Decision:</strong> Your application was not approved for this cycle.</p>
              {studentData.rejectionReason && (
                <p className="mt-1 font-mono text-xs">Reason: {studentData.rejectionReason}</p>
              )}
            </div>
          )}

        </div>

        {/* Profile & Interests Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-white rounded-3xl p-8 border border-brand-border shadow-xs">
            <h2 className="font-display text-lg font-bold text-brand-dark uppercase mb-4">
              Academic & Contact Profile
            </h2>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between py-2 border-b border-brand-border">
                <span className="text-brand-grey">Email:</span>
                <span className="text-brand-dark font-medium">{studentData.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-brand-border">
                <span className="text-brand-grey">Mobile:</span>
                <span className="text-brand-dark font-medium">{studentData.mobile}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-brand-border">
                <span className="text-brand-grey">College:</span>
                <span className="text-brand-dark font-medium">{studentData.collegeName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-brand-border">
                <span className="text-brand-grey">Branch / Year:</span>
                <span className="text-brand-dark font-medium">{studentData.branch} ({studentData.studyYear})</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-brand-grey">Location:</span>
                <span className="text-brand-dark font-medium">{studentData.city}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-brand-border shadow-xs">
            <h2 className="font-display text-lg font-bold text-brand-dark uppercase mb-4">
              Your Registered Interests
            </h2>
            <div className="flex flex-wrap gap-2 mb-6">
              {studentData.interests.map((interest) => (
                <span
                  key={interest}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-bg border border-brand-border text-xs font-mono text-brand-dark font-medium"
                >
                  <Tag className="w-3 h-3 text-brand-blue" />
                  <span>{interest}</span>
                </span>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-brand-bg border border-brand-border">
              <span className="block text-[11px] font-mono text-brand-grey uppercase mb-1">
                Next Steps
              </span>
              <p className="text-xs text-brand-dark/80 leading-relaxed">
                Connect with fellow students on campus and check the official event calendar for upcoming hackathon registrations and workshops.
              </p>
            </div>
          </div>

        </div>

      </main>

      <footer className="border-t border-brand-border py-6 text-center text-xs font-mono text-brand-grey">
        © 2026 COMMUNITY.VA • Hyderabad, India
      </footer>
    </div>
  );
}
