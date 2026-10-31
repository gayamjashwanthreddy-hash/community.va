"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Search, 
  Users, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Filter, 
  Loader2, 
  AlertCircle, 
  Eye, 
  Sparkles
} from "lucide-react";

interface StudentRecord {
  id: string;
  application_reference: string;
  college_name: string;
  university?: string;
  branch: string;
  study_year: string;
  city: string;
  interests: string[];
  reason: string;
  status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
    mobile: string;
  };
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Selected Student for Detail Modal
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/applications?type=students");
      if (res.status === 401 || res.status === 403) {
        setError("Admin access required. Please sign in with an administrator account.");
        setStudents([]);
        return;
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setStudents(data.data);
      } else {
        setError(data.message || "Failed to load registered student applications.");
      }
    } catch (err) {
      console.error("[Admin Students Fetch Error]", err);
      setError("Network error while connecting to Supabase database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAction = async (newStatus: "APPROVED" | "REJECTED" | "UNDER_REVIEW") => {
    if (!selectedStudent) return;
    setActionLoading(true);
    setActionSuccess(null);
    setError(null);

    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationType: "STUDENT",
          applicationId: selectedStudent.id,
          newStatus,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionSuccess(`Student application status updated to ${newStatus}.`);
        setStudents((prev) =>
          prev.map((s) => (s.id === selectedStudent.id ? { ...s, status: newStatus } : s))
        );
        setSelectedStudent((prev) => (prev ? { ...prev, status: newStatus } : null));
      } else {
        setError(data.message || "Failed to update student status.");
      }
    } catch (err) {
      console.error("[Student Status Action Error]", err);
      setError("Network error performing approval action.");
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = students.filter((s) => {
    const nameMatch = s.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) || false;
    const emailMatch = s.profiles?.email?.toLowerCase().includes(search.toLowerCase()) || false;
    const collegeMatch = s.college_name?.toLowerCase().includes(search.toLowerCase()) || false;
    const refMatch = s.application_reference?.toLowerCase().includes(search.toLowerCase()) || false;

    const matchesSearch = nameMatch || emailMatch || collegeMatch || refMatch;
    const matchesStatus = statusFilter === "ALL" ? true : s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between">
      {/* Header */}
      <header className="bg-brand-dark text-white border-b border-brand-border-dark sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href="/admin" 
              className="inline-flex items-center gap-1.5 text-xs font-mono text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Admin Console
            </Link>
            <span className="text-white/30">•</span>
            <span className="font-mono text-xs text-brand-blue font-bold uppercase">
              Student Directory
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-white/80">
              Total Real Records: <strong className="text-white">{students.length}</strong>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-sm font-mono">{error}</p>
            </div>
            <button
              onClick={fetchStudents}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold uppercase transition-colors shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-brand-dark uppercase">
              Registered Student Members
            </h1>
            <p className="text-xs sm:text-sm text-brand-dark/70 font-mono mt-0.5">
              Review live verified student registrations from the Supabase database.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-8 pr-4 py-2 rounded-xl bg-white border border-brand-border text-xs font-mono text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue appearance-none"
              >
                <option value="ALL">All Statuses ({students.length})</option>
                <option value="PENDING">Pending ({students.filter((s) => s.status === "PENDING").length})</option>
                <option value="UNDER_REVIEW">Under Review ({students.filter((s) => s.status === "UNDER_REVIEW").length})</option>
                <option value="APPROVED">Approved ({students.filter((s) => s.status === "APPROVED").length})</option>
                <option value="REJECTED">Rejected ({students.filter((s) => s.status === "REJECTED").length})</option>
              </select>
              <Filter className="w-3.5 h-3.5 text-brand-grey absolute left-3 top-3 pointer-events-none" />
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search name, email, college, ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl bg-white border border-brand-border text-xs font-mono text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue w-64 sm:w-72"
              />
              <Search className="w-4 h-4 text-brand-grey absolute left-3 top-2.5" />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-3xl border border-brand-border p-12 text-center">
            <Loader2 className="w-8 h-8 text-brand-blue animate-spin mx-auto mb-3" />
            <p className="font-mono text-sm text-brand-dark/70">
              Querying registered students from Supabase database...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-brand-border p-12 text-center">
            <Users className="w-10 h-10 text-brand-grey mx-auto mb-3" />
            <h3 className="font-display text-lg font-bold text-brand-dark uppercase">
              No Registered Students Found
            </h3>
            <p className="font-mono text-xs text-brand-grey mt-1">
              {students.length === 0
                ? "There are currently no student registrations in the database."
                : "No student records match the active search or filter criteria."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-brand-border overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-brand-bg border-b border-brand-border text-brand-grey uppercase">
                  <tr>
                    <th className="py-3.5 px-6 font-bold">Student</th>
                    <th className="py-3.5 px-6 font-bold">Campus & Branch</th>
                    <th className="py-3.5 px-6 font-bold">City</th>
                    <th className="py-3.5 px-6 font-bold">Areas of Interest</th>
                    <th className="py-3.5 px-6 font-bold">Status</th>
                    <th className="py-3.5 px-6 font-bold">Registered</th>
                    <th className="py-3.5 px-6 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  {filtered.map((stu) => (
                    <tr key={stu.id} className="hover:bg-brand-bg/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-brand-dark text-sm">
                          {stu.profiles?.full_name || "Unknown"}
                        </div>
                        <div className="text-brand-grey">
                          {stu.profiles?.email || "—"} • {stu.profiles?.mobile || "—"}
                        </div>
                        <div className="text-[10px] text-brand-blue font-bold mt-0.5">
                          {stu.application_reference}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-brand-dark font-medium">{stu.college_name}</div>
                        <div className="text-brand-grey">
                          {stu.branch} ({stu.study_year})
                        </div>
                        {stu.university && (
                          <div className="text-[10px] text-brand-grey">{stu.university}</div>
                        )}
                      </td>
                      <td className="py-4 px-6 text-brand-dark">
                        {stu.city || "Hyderabad"}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {stu.interests && stu.interests.length > 0 ? (
                            stu.interests.map((int) => (
                              <span 
                                key={int} 
                                className="px-2 py-0.5 rounded bg-brand-bg border border-brand-border text-[10px]"
                              >
                                {int}
                              </span>
                            ))
                          ) : (
                            <span className="text-brand-grey italic">None specified</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span 
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            stu.status === "APPROVED"
                              ? "bg-emerald-50 text-emerald-700"
                              : stu.status === "REJECTED"
                              ? "bg-rose-50 text-rose-700"
                              : stu.status === "UNDER_REVIEW"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {stu.status === "APPROVED" && <CheckCircle2 className="w-3 h-3" />}
                          {stu.status === "REJECTED" && <XCircle className="w-3 h-3" />}
                          {stu.status === "UNDER_REVIEW" && <Sparkles className="w-3 h-3" />}
                          {stu.status === "PENDING" && <Clock className="w-3 h-3" />}
                          <span>{stu.status}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-brand-grey whitespace-nowrap">
                        {new Date(stu.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => {
                            setSelectedStudent(stu);
                            setActionSuccess(null);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-dark text-white hover:bg-brand-dark/80 text-xs font-mono font-bold transition-colors"
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
        )}
      </main>

      {/* Review Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-brand-border shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-brand-border">
              <div>
                <span className="text-[11px] font-mono font-bold text-brand-blue uppercase">
                  {selectedStudent.application_reference}
                </span>
                <h2 className="font-display text-2xl font-extrabold text-brand-dark">
                  {selectedStudent.profiles?.full_name || "Student Details"}
                </h2>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 rounded-full hover:bg-brand-bg text-brand-grey hover:text-brand-dark"
              >
                ✕
              </button>
            </div>

            {actionSuccess && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            )}

            <div className="py-6 space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-brand-bg/50 border border-brand-border">
                <div>
                  <span className="text-brand-grey uppercase text-[10px]">Email Address</span>
                  <p className="font-bold text-brand-dark">{selectedStudent.profiles?.email}</p>
                </div>
                <div>
                  <span className="text-brand-grey uppercase text-[10px]">Mobile Contact</span>
                  <p className="font-bold text-brand-dark">{selectedStudent.profiles?.mobile}</p>
                </div>
                <div>
                  <span className="text-brand-grey uppercase text-[10px]">Campus Name</span>
                  <p className="font-bold text-brand-dark">{selectedStudent.college_name}</p>
                </div>
                <div>
                  <span className="text-brand-grey uppercase text-[10px]">Branch & Year</span>
                  <p className="font-bold text-brand-dark">
                    {selectedStudent.branch} ({selectedStudent.study_year})
                  </p>
                </div>
                <div>
                  <span className="text-brand-grey uppercase text-[10px]">City</span>
                  <p className="font-bold text-brand-dark">{selectedStudent.city}</p>
                </div>
                <div>
                  <span className="text-brand-grey uppercase text-[10px]">Current Status</span>
                  <p className="font-bold uppercase text-brand-blue">{selectedStudent.status}</p>
                </div>
              </div>

              <div>
                <span className="text-brand-grey uppercase text-[10px] block mb-1">Areas of Interest</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedStudent.interests && selectedStudent.interests.length > 0 ? (
                    selectedStudent.interests.map((int) => (
                      <span key={int} className="px-2.5 py-1 rounded-lg bg-brand-bg border border-brand-border text-brand-dark">
                        {int}
                      </span>
                    ))
                  ) : (
                    <span className="text-brand-grey italic">None listed</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-brand-grey uppercase text-[10px] block mb-1">Reason for Joining</span>
                <div className="p-4 rounded-xl bg-white border border-brand-border text-brand-dark whitespace-pre-wrap leading-relaxed">
                  {selectedStudent.reason || "No reason submitted."}
                </div>
              </div>
            </div>

            {/* Manual Decision Controls */}
            <div className="pt-4 border-t border-brand-border flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-mono text-brand-grey">
                Manual Approval Authorization Required
              </span>
              <div className="flex items-center gap-2">
                {selectedStudent.status !== "UNDER_REVIEW" && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleAction("UNDER_REVIEW")}
                    className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-mono text-xs font-bold transition-colors"
                  >
                    Mark Under Review
                  </button>
                )}
                {selectedStudent.status !== "REJECTED" && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleAction("REJECTED")}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-mono text-xs font-bold transition-colors"
                  >
                    Reject
                  </button>
                )}
                {selectedStudent.status !== "APPROVED" && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleAction("APPROVED")}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Approve Student</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-brand-border py-4 text-center text-xs font-mono text-brand-grey">
        COMMUNITY.VA Admin Console • Student Directory Management
      </footer>
    </div>
  );
}