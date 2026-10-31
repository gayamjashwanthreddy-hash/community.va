"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  HandHeart, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  LogOut, 
  Sparkles,
  Layers,
  Compass,
  Calendar,
  AlertCircle
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function VolunteerDashboardPage() {
  const router = useRouter();

  const [volunteerData, setVolunteerData] = useState({
    fullName: "Volunteer Applicant",
    email: "volunteer@example.com",
    collegeName: "Hyderabad Engineering College",
    branch: "Computer Science & Engineering",
    studyYear: "2nd Year",
    reference: "CVA-VOL-4190",
    preferredDivisions: ["Operations", "Event Management", "Technical Team"],
    assignedDivision: "Event Management",
    skills: "Graphic design, event coordination, public speaking",
    availability: "Weekends & Evenings",
    status: "APPROVED" as "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED",
    submissionDate: "October 2026",
    rejectionReason: "",
    adminFeedback: "Selected for college fest coordination and hackathon logistics team.",
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

  const isPending = volunteerData.status === "PENDING";
  const isUnderReview = volunteerData.status === "UNDER_REVIEW";
  const isApproved = volunteerData.status === "APPROVED";
  const isRejected = volunteerData.status === "REJECTED";

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between">
      
      {/* Top Bar */}
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
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-brand-red-light text-brand-red font-mono text-[11px] font-bold uppercase tracking-wider">
              Volunteer Portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:inline-block text-xs font-mono text-brand-grey">
              Reference: <strong className="text-brand-dark">{volunteerData.reference}</strong>
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
        
        {/* Banner */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-brand-border shadow-xs mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-mono font-bold tracking-widest text-brand-red uppercase">
                Volunteer Leadership Portal
              </span>
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-dark uppercase tracking-tight mt-1">
                {isApproved ? "Welcome to the Team, " : "Application Status for "} {volunteerData.fullName}
              </h1>
              <p className="font-body text-sm text-brand-dark/70 mt-1">
                {volunteerData.collegeName} • {volunteerData.branch} ({volunteerData.studyYear})
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-brand-red-light text-brand-red">
                <HandHeart className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Application Status Tracker */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-brand-border shadow-xs mb-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-brand-border">
            <h2 className="font-display text-lg font-bold text-brand-dark uppercase">
              Volunteer Application Tracker
            </h2>
            <span className="font-mono text-xs text-brand-grey uppercase">
              Submitted: {volunteerData.submissionDate}
            </span>
          </div>

          {/* Stepper */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-2xl border bg-brand-bg border-brand-border">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand-dark mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>01. APPLICATION SUBMITTED</span>
              </div>
              <p className="text-xs text-brand-dark/70">Candidate profile, skills and divisions stored.</p>
            </div>

            <div className={`p-4 rounded-2xl border transition-all ${isUnderReview || isApproved || isRejected ? "bg-brand-bg border-brand-border" : "bg-white border-brand-border/60 opacity-60"}`}>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand-dark mb-1">
                {isApproved || isRejected ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-500" />
                )}
                <span>02. COMMITTEE REVIEW</span>
              </div>
              <p className="text-xs text-brand-dark/70">Administrative evaluation of division fit.</p>
            </div>

            <div className={`p-4 rounded-2xl border transition-all ${isApproved ? "bg-emerald-50 border-emerald-200" : isRejected ? "bg-red-50 border-red-200" : "bg-white border-brand-border/60 opacity-60"}`}>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand-dark mb-1">
                {isApproved && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                {isRejected && <XCircle className="w-4 h-4 text-red-600" />}
                {!isApproved && !isRejected && <Clock className="w-4 h-4 text-brand-grey" />}
                <span>03. {isApproved ? "APPROVED" : isRejected ? "REJECTED" : "DECISION"}</span>
              </div>
              <p className="text-xs text-brand-dark/70">
                {isApproved && "Official volunteer division assigned."}
                {isRejected && "Application not selected for this cohort."}
                {!isApproved && !isRejected && "Pending administrative approval."}
              </p>
            </div>
          </div>

          {/* Approved Celebration Banner */}
          {isApproved && (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950">
              <div className="flex items-center gap-2 text-emerald-800 font-mono text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>OFFICIAL CONFIRMATION</span>
              </div>
              <h3 className="font-display text-xl font-bold text-emerald-900 uppercase">
                WELCOME TO THE COMMUNITY.VA VOLUNTEER TEAM.
              </h3>
              <p className="text-sm text-emerald-800/90 mt-1">
                Your volunteer application has been approved by the core organizing committee.
              </p>

              <div className="mt-4 pt-4 border-t border-emerald-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-emerald-700 block">ASSIGNED DIVISION:</span>
                  <span className="text-base font-bold text-emerald-900">{volunteerData.assignedDivision}</span>
                </div>
                <div>
                  <span className="text-emerald-700 block">VOLUNTEER ROLE:</span>
                  <span className="text-base font-bold text-emerald-900">Active Core Coordinator</span>
                </div>
              </div>

              {volunteerData.adminFeedback && (
                <div className="mt-3 p-3 bg-white/60 rounded-xl text-xs text-emerald-900">
                  <strong>Leadership Note:</strong> {volunteerData.adminFeedback}
                </div>
              )}
            </div>
          )}

          {isPending && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-medium">
              Your volunteer application is currently under review by our division leads. You will receive an email update once evaluated.
            </div>
          )}

          {isRejected && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs sm:text-sm font-medium">
              <p><strong>Application Decision:</strong> Thank you for your interest. We are unable to accept your volunteer application for the current operational cycle.</p>
              {volunteerData.rejectionReason && (
                <p className="mt-1 font-mono text-xs">Feedback: {volunteerData.rejectionReason}</p>
              )}
            </div>
          )}

        </div>

        {/* Volunteer Application Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-white rounded-3xl p-8 border border-brand-border shadow-xs">
            <h2 className="font-display text-lg font-bold text-brand-dark uppercase mb-4">
              Preferred Divisions
            </h2>
            <div className="flex flex-wrap gap-2 mb-6">
              {volunteerData.preferredDivisions.map((div) => (
                <span
                  key={div}
                  className="px-3 py-1.5 rounded-xl bg-brand-bg border border-brand-border text-xs font-mono text-brand-dark font-medium flex items-center gap-1.5"
                >
                  <Layers className="w-3.5 h-3.5 text-brand-red" />
                  <span>{div}</span>
                </span>
              ))}
            </div>

            <h2 className="font-display text-lg font-bold text-brand-dark uppercase mb-2">
              Skills & Superpowers
            </h2>
            <p className="text-xs sm:text-sm text-brand-dark/80 bg-brand-bg p-3.5 rounded-xl border border-brand-border mb-4">
              {volunteerData.skills}
            </p>

            <div className="flex justify-between py-2 border-t border-brand-border text-xs font-mono">
              <span className="text-brand-grey">Stated Availability:</span>
              <span className="text-brand-dark font-bold">{volunteerData.availability}</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-brand-border shadow-xs">
            <h2 className="font-display text-lg font-bold text-brand-dark uppercase mb-4">
              Volunteer Community Briefings
            </h2>
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-brand-bg border border-brand-border">
                <div className="flex items-center gap-2 text-xs font-mono text-brand-blue font-bold mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Hyderabad Hackathon 2026 Organizing Sprint</span>
                </div>
                <p className="text-xs text-brand-dark/75">
                  Operations and Event Management division sync scheduled for registered volunteers.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-brand-bg border border-brand-border">
                <div className="flex items-center gap-2 text-xs font-mono text-brand-dark font-bold mb-1">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Campus Ambassador & Chapter Leads</span>
                </div>
                <p className="text-xs text-brand-dark/75">
                  Briefings for on-campus registrations and inter-college tournament logistics.
                </p>
              </div>
            </div>
          </div>

        </div>

      </main>

      <footer className="border-t border-brand-border py-6 text-center text-xs font-mono text-brand-grey">
        © 2026 COMMUNITY.VA • Volunteer Management • Hyderabad, India
      </footer>
    </div>
  );
}
