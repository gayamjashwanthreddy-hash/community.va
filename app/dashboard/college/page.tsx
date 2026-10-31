"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  LogOut, 
  Sparkles,
  MapPin,
  Users,
  Handshake,
  ExternalLink
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function CollegeDashboardPage() {
  const router = useRouter();

  const [collegeData, setCollegeData] = useState({
    institutionName: "VNR Vignana Jyothi Institute of Engineering & Tech",
    institutionType: "Engineering College",
    website: "https://vnrvjiet.ac.in",
    contactPerson: "Dr. K. Srinivas",
    designation: "Dean of Student Affairs",
    collegeEmail: "deansa@vnrvjiet.ac.in",
    mobile: "+91 98765 43210",
    city: "Hyderabad",
    state: "Telangana",
    studentStrength: "6,000 - 10,000",
    reference: "CVA-COL-7912",
    collaborationAreas: ["Hackathons", "Technical Workshops", "Student Development", "Campus Chapters"],
    status: "APPROVED" as "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED",
    submissionDate: "October 2026",
    rejectionReason: "",
    adminFeedback: "Approved as campus venue partner for upcoming Hackathon track and Youth Open Mic series.",
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

  const isPending = collegeData.status === "PENDING";
  const isUnderReview = collegeData.status === "UNDER_REVIEW";
  const isApproved = collegeData.status === "APPROVED";
  const isRejected = collegeData.status === "REJECTED";

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
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-brand-bg text-brand-dark border border-brand-border font-mono text-[11px] font-bold uppercase tracking-wider">
              Institutional Portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:inline-block text-xs font-mono text-brand-grey">
              Reference: <strong className="text-brand-dark">{collegeData.reference}</strong>
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
              <span className="text-xs font-mono font-bold tracking-widest text-brand-dark uppercase">
                Institutional Representative Profile
              </span>
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-dark uppercase tracking-tight mt-1">
                {collegeData.institutionName}
              </h1>
              <p className="font-body text-sm text-brand-dark/70 mt-1 flex items-center gap-2">
                <span>{collegeData.contactPerson} ({collegeData.designation})</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-red" />
                  {collegeData.city}, {collegeData.state}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-brand-bg border border-brand-border text-brand-dark">
                <Building2 className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Verification Tracker */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-brand-border shadow-xs mb-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-brand-border">
            <h2 className="font-display text-lg font-bold text-brand-dark uppercase">
              College Verification Tracker
            </h2>
            <span className="font-mono text-xs text-brand-grey uppercase">
              Submitted: {collegeData.submissionDate}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-2xl border bg-brand-bg border-brand-border">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand-dark mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>01. REGISTRATION SUBMITTED</span>
              </div>
              <p className="text-xs text-brand-dark/70">Campus profile and collaboration interests filed.</p>
            </div>

            <div className={`p-4 rounded-2xl border transition-all ${isUnderReview || isApproved || isRejected ? "bg-brand-bg border-brand-border" : "bg-white border-brand-border/60 opacity-60"}`}>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand-dark mb-1">
                {isApproved || isRejected ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-500" />
                )}
                <span>02. UNDER VERIFICATION</span>
              </div>
              <p className="text-xs text-brand-dark/70">Institutional credentials and contact validation.</p>
            </div>

            <div className={`p-4 rounded-2xl border transition-all ${isApproved ? "bg-emerald-50 border-emerald-200" : isRejected ? "bg-red-50 border-red-200" : "bg-white border-brand-border/60 opacity-60"}`}>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand-dark mb-1">
                {isApproved && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                {isRejected && <XCircle className="w-4 h-4 text-red-600" />}
                {!isApproved && !isRejected && <Clock className="w-4 h-4 text-brand-grey" />}
                <span>03. {isApproved ? "APPROVED" : isRejected ? "REJECTED" : "VERIFICATION"}</span>
              </div>
              <p className="text-xs text-brand-dark/70">
                {isApproved && "Official participating institution status."}
                {isRejected && "Institutional verification not confirmed."}
                {!isApproved && !isRejected && "Pending administrative check."}
              </p>
            </div>
          </div>

          {/* Approved Celebration */}
          {isApproved && (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950">
              <div className="flex items-center gap-2 text-emerald-800 font-mono text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>OFFICIAL INSTITUTIONAL APPROVAL</span>
              </div>
              <h3 className="font-display text-xl font-bold text-emerald-900 uppercase">
                YOUR INSTITUTION HAS BEEN APPROVED BY COMMUNITY.VA.
              </h3>
              <p className="text-sm text-emerald-800/90 mt-1">
                {collegeData.institutionName} is recognized as an active participating college. Our campus lead will connect with your designated contact person ({collegeData.contactPerson}) to schedule upcoming campus initiatives.
              </p>

              {collegeData.adminFeedback && (
                <div className="mt-4 p-3.5 bg-white/70 rounded-xl text-xs text-emerald-900">
                  <strong>Administrative Note:</strong> {collegeData.adminFeedback}
                </div>
              )}
            </div>
          )}

          {isPending && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-medium">
              Your college registration is currently undergoing verification by the COMMUNITY.VA institutional review team.
            </div>
          )}

          {isRejected && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs sm:text-sm font-medium">
              <p><strong>Verification Notice:</strong> We were unable to complete verification for this institution record.</p>
              {collegeData.rejectionReason && (
                <p className="mt-1 font-mono text-xs">Reason: {collegeData.rejectionReason}</p>
              )}
            </div>
          )}

        </div>

        {/* Institution Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-white rounded-3xl p-8 border border-brand-border shadow-xs">
            <h2 className="font-display text-lg font-bold text-brand-dark uppercase mb-4">
              Registered Collaboration Tracks
            </h2>
            <div className="flex flex-wrap gap-2 mb-6">
              {collegeData.collaborationAreas.map((area) => (
                <span
                  key={area}
                  className="px-3 py-1.5 rounded-xl bg-brand-bg border border-brand-border text-xs font-mono text-brand-dark font-medium flex items-center gap-1.5"
                >
                  <Handshake className="w-3.5 h-3.5 text-brand-blue" />
                  <span>{area}</span>
                </span>
              ))}
            </div>

            <div className="space-y-3 font-mono text-xs pt-4 border-t border-brand-border">
              <div className="flex justify-between py-1">
                <span className="text-brand-grey">Student Strength:</span>
                <span className="text-brand-dark font-bold">{collegeData.studentStrength}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-brand-grey">Institution Type:</span>
                <span className="text-brand-dark font-bold">{collegeData.institutionType}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-brand-grey">Official Email:</span>
                <span className="text-brand-dark font-bold">{collegeData.collegeEmail}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-brand-border shadow-xs">
            <h2 className="font-display text-lg font-bold text-brand-dark uppercase mb-4">
              Campus Partnership Next Steps
            </h2>
            <div className="space-y-3 text-xs sm:text-sm text-brand-dark/80">
              <div className="p-4 rounded-2xl bg-brand-bg border border-brand-border">
                <strong>01. Host Hackathon Qualifiers:</strong>
                <p className="text-xs text-brand-dark/70 mt-1">Host on-campus coding rounds and innovation showcases with COMMUNITY.VA problem statements.</p>
              </div>

              <div className="p-4 rounded-2xl bg-brand-bg border border-brand-border">
                <strong>02. Establish Campus Student Chapter:</strong>
                <p className="text-xs text-brand-dark/70 mt-1">Designate student leads to run weekly workshops, cultural meetups, and sports squads.</p>
              </div>
            </div>
          </div>

        </div>

      </main>

      <footer className="border-t border-brand-border py-6 text-center text-xs font-mono text-brand-grey">
        © 2026 COMMUNITY.VA • College Management Portal • Hyderabad, India
      </footer>
    </div>
  );
}
