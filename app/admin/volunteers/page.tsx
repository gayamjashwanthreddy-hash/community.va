"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Layers, 
  Loader2, 
  AlertCircle,
  Eye,
  ShieldAlert
} from "lucide-react";

interface VolunteerApp {
  id: string;
  application_reference: string;
  college_name: string;
  branch: string;
  study_year: string;
  preferred_divisions: string[];
  experience: string;
  skills: string;
  availability: string;
  motivation: string;
  assigned_division?: string;
  status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
    mobile: string;
  };
}

const INITIAL_MOCK_VOLUNTEERS: VolunteerApp[] = [
  {
    id: "vol-01",
    application_reference: "CVA-VOL-4190",
    college_name: "VNR Vignana Jyothi Institute of Engineering & Technology",
    branch: "Computer Science",
    study_year: "2nd Year",
    preferred_divisions: ["Operations", "Event Management", "Technical Team"],
    skills: "Python, Next.js, Event logistics, Stage hosting",
    experience: "Coordinated college technical symposium with 400+ attendees.",
    availability: "Weekends & Evenings",
    motivation: "I want to help build Hyderabad's largest student hackathon and connect builders.",
    assigned_division: "Event Management",
    status: "APPROVED",
    created_at: "2026-10-28T14:20:00Z",
    profiles: {
      full_name: "Priya Varma",
      email: "priya.varma@gmail.com",
      mobile: "+91 98765 12345",
    },
  },
  {
    id: "vol-02",
    application_reference: "CVA-VOL-5211",
    college_name: "Chaitanya Bharathi Institute of Technology (CBIT)",
    branch: "Electronics & Communication",
    study_year: "3rd Year",
    preferred_divisions: ["Design & Creative", "Marketing & Social Media"],
    skills: "Figma, Adobe Illustrator, After Effects, Social content creation",
    experience: "Designed posters and promotional reels for college cultural fest.",
    availability: "Flexible & Event Days",
    motivation: "Excited to shape the visual brand and digital reach of COMMUNITY.VA across campuses.",
    status: "PENDING",
    created_at: "2026-10-30T10:15:00Z",
    profiles: {
      full_name: "Sai Teja",
      email: "saiteja.cbit@gmail.com",
      mobile: "+91 91234 56789",
    },
  },
  {
    id: "vol-03",
    application_reference: "CVA-VOL-6332",
    college_name: "Gokaraju Rangaraju Institute of Engineering & Technology (GRIET)",
    branch: "Information Technology",
    study_year: "1st Year",
    preferred_divisions: ["Technical Team", "Operations"],
    skills: "C++, Git, Competitive programming",
    experience: "Organized intra-college coding contests and workshops.",
    availability: "Weekends Only",
    motivation: "Eager to contribute to technical challenge platforms and mentor junior peers.",
    status: "PENDING",
    created_at: "2026-10-31T08:30:00Z",
    profiles: {
      full_name: "Aman Reddy",
      email: "aman.reddy@griet.ac.in",
      mobile: "+91 99887 66554",
    },
  },
];

export default function AdminVolunteersPage() {
  const [volunteers, setVolunteers] = useState<VolunteerApp[]>(INITIAL_MOCK_VOLUNTEERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedApp, setSelectedApp] = useState<VolunteerApp | null>(null);

  // Review modal state
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [assignedDivision, setAssignedDivision] = useState("");

  const handleAction = async (newStatus: "APPROVED" | "REJECTED" | "UNDER_REVIEW") => {
    if (!selectedApp) return;

    if (newStatus === "REJECTED" && !rejectionReason.trim()) {
      alert("Please provide a reason for rejection to send constructive feedback to the applicant.");
      return;
    }

    setActionLoading(true);
    setActionMsg("");

    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationType: "VOLUNTEER",
          applicationId: selectedApp.id,
          newStatus,
          adminNote,
          rejectionReason,
          assignedDivision: assignedDivision || selectedApp.preferred_divisions[0],
        }),
      });

      const data = await res.json();

      // Update local state
      setVolunteers((prev) =>
        prev.map((v) =>
          v.id === selectedApp.id
            ? {
                ...v,
                status: newStatus,
                assigned_division: assignedDivision || v.assigned_division,
              }
            : v
        )
      );

      setActionMsg(`Application successfully updated to ${newStatus}.`);
      setTimeout(() => {
        setSelectedApp(null);
        setActionMsg("");
        setAdminNote("");
        setRejectionReason("");
      }, 1200);
    } catch {
      setActionMsg("Failed to execute review action.");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredVolunteers = volunteers.filter((v) => {
    const matchesStatus = statusFilter === "ALL" || v.status === statusFilter;
    const nameMatch = v.profiles?.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = v.profiles?.email.toLowerCase().includes(searchTerm.toLowerCase());
    const collegeMatch = v.college_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && (nameMatch || emailMatch || collegeMatch);
  });

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between">
      
      {/* Top Bar */}
      <header className="bg-brand-dark text-white border-b border-brand-border-dark sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs font-mono text-white/70 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> Admin Console
            </Link>
            <span className="text-white/30">•</span>
            <span className="font-mono text-xs text-brand-red font-bold uppercase">
              Volunteer Queue Management
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-brand-dark uppercase">
              Volunteer Applications
            </h1>
            <p className="text-xs sm:text-sm text-brand-dark/70 font-mono mt-0.5">
              Review applicant capabilities, division alignments, and approval actions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search name, email, college..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl bg-white border border-brand-border text-xs font-mono text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-red w-64"
              />
              <Search className="w-4 h-4 text-brand-grey absolute left-3 top-2.5" />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white border border-brand-border text-xs font-mono font-bold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-red"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-3xl border border-brand-border overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-brand-bg border-b border-brand-border text-brand-grey uppercase">
                <tr>
                  <th className="py-3.5 px-6 font-bold">Applicant</th>
                  <th className="py-3.5 px-6 font-bold">College & Branch</th>
                  <th className="py-3.5 px-6 font-bold">Preferred Divisions</th>
                  <th className="py-3.5 px-6 font-bold">Status</th>
                  <th className="py-3.5 px-6 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {filteredVolunteers.map((vol) => (
                  <tr key={vol.id} className="hover:bg-brand-bg/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-brand-dark text-sm">{vol.profiles?.full_name}</div>
                      <div className="text-brand-grey">{vol.profiles?.email}</div>
                      <div className="text-[10px] text-brand-grey mt-0.5">{vol.application_reference}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-brand-dark font-medium">{vol.college_name}</div>
                      <div className="text-brand-grey">{vol.branch} ({vol.study_year})</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {vol.preferred_divisions.map((div) => (
                          <span key={div} className="px-2 py-0.5 rounded bg-brand-bg border border-brand-border text-[10px]">
                            {div}
                          </span>
                        ))}
                      </div>
                      {vol.assigned_division && (
                        <div className="text-[10px] text-emerald-700 font-bold mt-1">
                          Assigned: {vol.assigned_division}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          vol.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : vol.status === "REJECTED"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {vol.status === "APPROVED" && <CheckCircle2 className="w-3 h-3" />}
                        {vol.status === "REJECTED" && <XCircle className="w-3 h-3" />}
                        {vol.status === "PENDING" && <Clock className="w-3 h-3" />}
                        <span>{vol.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => {
                          setSelectedApp(vol);
                          setAssignedDivision(vol.assigned_division || vol.preferred_divisions[0] || "Operations");
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand-dark text-white hover:bg-black font-semibold text-[11px] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Review</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Review Modal Dialog */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 border border-brand-border shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            
            <div className="flex items-center justify-between pb-4 border-b border-brand-border mb-6">
              <div>
                <span className="text-[11px] font-mono font-bold text-brand-red uppercase">
                  Application Review — {selectedApp.application_reference}
                </span>
                <h2 className="font-display text-2xl font-extrabold text-brand-dark uppercase mt-0.5">
                  {selectedApp.profiles?.full_name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 rounded-full hover:bg-brand-bg text-brand-grey hover:text-brand-dark"
              >
                ✕
              </button>
            </div>

            {actionMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono font-bold">
                {actionMsg}
              </div>
            )}

            <div className="space-y-4 text-xs font-mono mb-6">
              <div className="p-4 bg-brand-bg rounded-2xl border border-brand-border grid grid-cols-2 gap-3">
                <div>
                  <span className="text-brand-grey block">Email:</span>
                  <span className="text-brand-dark font-bold">{selectedApp.profiles?.email}</span>
                </div>
                <div>
                  <span className="text-brand-grey block">Mobile:</span>
                  <span className="text-brand-dark font-bold">{selectedApp.profiles?.mobile}</span>
                </div>
                <div>
                  <span className="text-brand-grey block">College:</span>
                  <span className="text-brand-dark font-bold">{selectedApp.college_name}</span>
                </div>
                <div>
                  <span className="text-brand-grey block">Branch & Year:</span>
                  <span className="text-brand-dark font-bold">{selectedApp.branch} ({selectedApp.study_year})</span>
                </div>
              </div>

              <div>
                <span className="text-brand-grey block font-bold uppercase mb-1">Skills & Superpowers:</span>
                <p className="p-3 bg-brand-bg rounded-xl border border-brand-border text-brand-dark">
                  {selectedApp.skills}
                </p>
              </div>

              <div>
                <span className="text-brand-grey block font-bold uppercase mb-1">Previous Experience:</span>
                <p className="p-3 bg-brand-bg rounded-xl border border-brand-border text-brand-dark">
                  {selectedApp.experience || "None specified"}
                </p>
              </div>

              <div>
                <span className="text-brand-grey block font-bold uppercase mb-1">Motivation / Why Volunteer:</span>
                <p className="p-3 bg-brand-bg rounded-xl border border-brand-border text-brand-dark">
                  {selectedApp.motivation}
                </p>
              </div>

              {/* Administrative Inputs */}
              <div className="pt-4 border-t border-brand-border space-y-3">
                <div>
                  <label className="block text-brand-dark font-bold uppercase mb-1">
                    Assign Volunteer Division (Upon Approval):
                  </label>
                  <select
                    value={assignedDivision}
                    onChange={(e) => setAssignedDivision(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-xs font-mono"
                  >
                    {selectedApp.preferred_divisions.map((d) => (
                      <option key={d} value={d}>{d} (Preferred)</option>
                    ))}
                    <option value="Operations">Operations</option>
                    <option value="Technical Team">Technical Team</option>
                    <option value="Event Management">Event Management</option>
                    <option value="Design & Creative">Design & Creative</option>
                    <option value="Public Relations">Public Relations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-brand-dark font-bold uppercase mb-1">
                    Internal Admin Note (Private Audit Log):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Verified Git profile, strong design background"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-brand-dark font-bold uppercase mb-1">
                    Rejection Reason (Sent to applicant if rejected):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Division capacity full for this cycle"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-brand-border flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleAction("UNDER_REVIEW")}
                className="px-4 py-2.5 rounded-full border border-brand-border hover:bg-brand-bg text-brand-dark text-xs font-mono font-bold uppercase"
              >
                Mark Under Review
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleAction("REJECTED")}
                  className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold uppercase transition-colors"
                >
                  Reject Application
                </button>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleAction("APPROVED")}
                  className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold uppercase transition-colors flex items-center gap-1.5"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Approve Volunteer</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      <footer className="border-t border-brand-border py-4 text-center text-xs font-mono text-brand-grey">
        COMMUNITY.VA Admin Console
      </footer>
    </div>
  );
}
