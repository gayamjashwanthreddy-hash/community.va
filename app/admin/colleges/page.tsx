"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Search, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  Loader2, 
  MapPin, 
  Users 
} from "lucide-react";

interface CollegeApp {
  id: string;
  application_reference: string;
  institution_name: string;
  institution_type: string;
  website?: string;
  college_email: string;
  contact_person: string;
  designation: string;
  mobile: string;
  city: string;
  state: string;
  student_strength: string;
  collaboration_areas: string[];
  additional_information?: string;
  status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  created_at: string;
}

const INITIAL_MOCK_COLLEGES: CollegeApp[] = [
  {
    id: "col-01",
    application_reference: "CVA-COL-7912",
    institution_name: "VNR Vignana Jyothi Institute of Engineering & Technology",
    institution_type: "Engineering College",
    website: "https://vnrvjiet.ac.in",
    college_email: "deansa@vnrvjiet.ac.in",
    contact_person: "Dr. K. Srinivas",
    designation: "Dean of Student Affairs",
    mobile: "+91 98765 43210",
    city: "Hyderabad",
    state: "Telangana",
    student_strength: "6,000 - 10,000",
    collaboration_areas: ["Hackathons", "Technical Workshops", "Student Development", "Campus Chapters"],
    additional_information: "Auditorium capacity 800+, 4 high-performance computer laboratories available for hackathon tracks.",
    status: "APPROVED",
    created_at: "2026-10-25T11:00:00Z",
  },
  {
    id: "col-02",
    application_reference: "CVA-COL-8120",
    institution_name: "Institute of Aeronautical Engineering (IARE)",
    institution_type: "Engineering College",
    website: "https://iare.ac.in",
    college_email: "principal@iare.ac.in",
    contact_person: "Prof. M. Ramesh",
    designation: "Head of Training & Placements",
    mobile: "+91 91234 88776",
    city: "Hyderabad",
    state: "Telangana",
    student_strength: "3,000 - 6,000",
    collaboration_areas: ["Hackathons", "Technical Workshops", "Sports", "Career Opportunities"],
    additional_information: "Interested in organizing an inter-college robotics and AI build challenge.",
    status: "PENDING",
    created_at: "2026-10-30T16:45:00Z",
  },
  {
    id: "col-03",
    application_reference: "CVA-COL-9304",
    institution_name: "Bhavan's Vivekananda College of Science, Humanities & Commerce",
    institution_type: "Degree College",
    website: "https://bhavansvc.ac.in",
    college_email: "events@bhavansvc.ac.in",
    contact_person: "Smt. Sunita Rao",
    designation: "Cultural Coordinator",
    mobile: "+91 94400 11223",
    city: "Hyderabad",
    state: "Telangana",
    student_strength: "3,000 - 6,000",
    collaboration_areas: ["Cultural Events", "Student Development", "Campus Chapters"],
    additional_information: "Open amphitheater available for acoustic nights and youth open mic competitions.",
    status: "PENDING",
    created_at: "2026-10-31T09:20:00Z",
  },
];

export default function AdminCollegesPage() {
  const [colleges, setColleges] = useState<CollegeApp[]>(INITIAL_MOCK_COLLEGES);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedCollege, setSelectedCollege] = useState<CollegeApp | null>(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const handleAction = async (newStatus: "APPROVED" | "REJECTED" | "UNDER_REVIEW") => {
    if (!selectedCollege) return;

    if (newStatus === "REJECTED" && !rejectionReason.trim()) {
      alert("Please enter a rejection reason for institutional feedback.");
      return;
    }

    setActionLoading(true);
    setActionMsg("");

    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationType: "COLLEGE",
          applicationId: selectedCollege.id,
          newStatus,
          adminNote,
          rejectionReason,
        }),
      });

      setColleges((prev) =>
        prev.map((c) => (c.id === selectedCollege.id ? { ...c, status: newStatus } : c))
      );

      setActionMsg(`Institution status updated to ${newStatus}. Notification email dispatched.`);
      setTimeout(() => {
        setSelectedCollege(null);
        setActionMsg("");
        setAdminNote("");
        setRejectionReason("");
      }, 1200);
    } catch {
      setActionMsg("Failed to update college verification.");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredColleges = colleges.filter((c) => {
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    const nameMatch = c.institution_name.toLowerCase().includes(searchTerm.toLowerCase());
    const personMatch = c.contact_person.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && (nameMatch || personMatch);
  });

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between">
      
      <header className="bg-brand-dark text-white border-b border-brand-border-dark sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs font-mono text-white/70 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> Admin Console
            </Link>
            <span className="text-white/30">•</span>
            <span className="font-mono text-xs text-brand-blue-light font-bold uppercase">
              College Verifications & Chapters
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-brand-dark uppercase">
              Registered Colleges & Institutions
            </h1>
            <p className="text-xs sm:text-sm text-brand-dark/70 font-mono mt-0.5">
              Verify participating colleges, review track interests, and issue institutional approvals.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search college name or contact person..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl bg-white border border-brand-border text-xs font-mono text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue w-72"
              />
              <Search className="w-4 h-4 text-brand-grey absolute left-3 top-2.5" />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white border border-brand-border text-xs font-mono font-bold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-brand-border overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-brand-bg border-b border-brand-border text-brand-grey uppercase">
                <tr>
                  <th className="py-3.5 px-6 font-bold">Institution</th>
                  <th className="py-3.5 px-6 font-bold">Contact Person</th>
                  <th className="py-3.5 px-6 font-bold">Tracks</th>
                  <th className="py-3.5 px-6 font-bold">Status</th>
                  <th className="py-3.5 px-6 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {filteredColleges.map((col) => (
                  <tr key={col.id} className="hover:bg-brand-bg/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-brand-dark text-sm">{col.institution_name}</div>
                      <div className="text-brand-grey">{col.institution_type} • {col.city}</div>
                      <div className="text-[10px] text-brand-grey mt-0.5">{col.application_reference}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-brand-dark font-medium">{col.contact_person}</div>
                      <div className="text-brand-grey">{col.designation}</div>
                      <div className="text-[11px] text-brand-blue font-bold">{col.college_email}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {col.collaboration_areas.map((area) => (
                          <span key={area} className="px-2 py-0.5 rounded bg-brand-bg border border-brand-border text-[10px]">
                            {area}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          col.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : col.status === "REJECTED"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {col.status === "APPROVED" && <CheckCircle2 className="w-3 h-3" />}
                        {col.status === "REJECTED" && <XCircle className="w-3 h-3" />}
                        {col.status === "PENDING" && <Clock className="w-3 h-3" />}
                        <span>{col.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedCollege(col)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand-dark text-white hover:bg-black font-semibold text-[11px] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* College Inspection Modal */}
      {selectedCollege && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 border border-brand-border shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            
            <div className="flex items-center justify-between pb-4 border-b border-brand-border mb-6">
              <div>
                <span className="text-[11px] font-mono font-bold text-brand-dark uppercase">
                  Institutional Verification — {selectedCollege.application_reference}
                </span>
                <h2 className="font-display text-2xl font-extrabold text-brand-dark uppercase mt-0.5">
                  {selectedCollege.institution_name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedCollege(null)}
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
                  <span className="text-brand-grey block">Designated Officer:</span>
                  <span className="text-brand-dark font-bold">{selectedCollege.contact_person} ({selectedCollege.designation})</span>
                </div>
                <div>
                  <span className="text-brand-grey block">Official Email:</span>
                  <span className="text-brand-dark font-bold">{selectedCollege.college_email}</span>
                </div>
                <div>
                  <span className="text-brand-grey block">Student Strength:</span>
                  <span className="text-brand-dark font-bold">{selectedCollege.student_strength}</span>
                </div>
                <div>
                  <span className="text-brand-grey block">Location:</span>
                  <span className="text-brand-dark font-bold">{selectedCollege.city}, {selectedCollege.state}</span>
                </div>
              </div>

              <div>
                <span className="text-brand-grey block font-bold uppercase mb-1">Requested Collaboration Areas:</span>
                <div className="flex flex-wrap gap-1.5 p-3 bg-brand-bg rounded-xl border border-brand-border">
                  {selectedCollege.collaboration_areas.map((a) => (
                    <span key={a} className="px-2.5 py-1 bg-white rounded-lg border border-brand-border font-bold text-brand-dark">
                      ✓ {a}
                    </span>
                  ))}
                </div>
              </div>

              {selectedCollege.additional_information && (
                <div>
                  <span className="text-brand-grey block font-bold uppercase mb-1">Campus Facilities & Proposal:</span>
                  <p className="p-3 bg-brand-bg rounded-xl border border-brand-border text-brand-dark">
                    {selectedCollege.additional_information}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-brand-border space-y-3">
                <div>
                  <label className="block text-brand-dark font-bold uppercase mb-1">
                    Internal Verification Note:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Verified official university affiliation"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-brand-dark font-bold uppercase mb-1">
                    Rejection Feedback (If not verified):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Could not confirm institutional domain authorization"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-xs font-mono"
                  />
                </div>
              </div>
            </div>

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
                  Reject Verification
                </button>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleAction("APPROVED")}
                  className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold uppercase transition-colors flex items-center gap-1.5"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Approve College</span>
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
