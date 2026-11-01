"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
  ShieldAlert,
  QrCode,
  ShieldCheck,
  Check,
  X
} from "lucide-react";

interface VolunteerApplication {
  id: string;
  event_id: string;
  volunteer_id: string;
  motivation: string;
  experience?: string | null;
  preferred_responsibilities: string[];
  assigned_responsibilities: string[];
  availability: string;
  additional_info?: string | null;
  status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "WITHDRAWN";
  rejection_reason?: string | null;
  internal_notes?: string | null;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
    mobile?: string | null;
  };
}

const ALL_RESPONSIBILITIES = [
  { id: "QR_SCANNING", label: "QR Scanning & Mobile Verification", badge: "Scanner Role" },
  { id: "PARTICIPANT_CHECK_IN", label: "Participant Check-In & Badge Desk", badge: "Front Desk" },
  { id: "REGISTRATION_DESK", label: "Registration & Query Resolution", badge: "Help Desk" },
  { id: "EVENT_COORDINATION", label: "Stage & Track Coordination", badge: "Tracks" },
  { id: "GENERAL_SUPPORT", label: "Logistics & General Support", badge: "Operations" },
];

export default function AdminEventVolunteersPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [eventTitle, setEventTitle] = useState("Event Volunteers");
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Selected Application for Review Modal
  const [selectedApp, setSelectedApp] = useState<VolunteerApplication | null>(null);
  const [assignedRoles, setAssignedRoles] = useState<string[]>([]);
  const [rejectionReason, setRejectionReason] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchVolunteers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/events/${eventId}/volunteers`);
      if (res.status === 401 || res.status === 403) {
        setError("Admin privileges required. Please sign in with an administrator account.");
        return;
      }
      const data = await res.json();
      if (data.success) {
        setApplications(data.applications || []);
        if (data.event?.title) setEventTitle(data.event.title);
      } else {
        setError(data.message || "Failed to load volunteer applications.");
      }
    } catch (err) {
      console.error("[Admin Event Volunteers Fetch Error]", err);
      setError("Network error connecting to database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchVolunteers();
    }
  }, [eventId]);

  const openReviewModal = (app: VolunteerApplication) => {
    setSelectedApp(app);
    setAssignedRoles(
      app.assigned_responsibilities && app.assigned_responsibilities.length > 0
        ? app.assigned_responsibilities
        : app.preferred_responsibilities || ["GENERAL_SUPPORT"]
    );
    setRejectionReason(app.rejection_reason || "");
    setInternalNotes(app.internal_notes || "");
    setActionSuccess(null);
    setActionError(null);
  };

  const handleToggleRole = (roleId: string) => {
    if (assignedRoles.includes(roleId)) {
      setAssignedRoles(assignedRoles.filter((r) => r !== roleId));
    } else {
      setAssignedRoles([...assignedRoles, roleId]);
    }
  };

  const handleAction = async (action: "APPROVE" | "REJECT" | "REVOKE" | "UNDER_REVIEW") => {
    if (!selectedApp) return;

    if ((action === "REJECT" || action === "REVOKE") && !rejectionReason.trim()) {
      setActionError("Please provide a reason for rejection/revocation.");
      return;
    }

    if (action === "APPROVE" && assignedRoles.length === 0) {
      setActionError("Please assign at least one responsibility to approve the volunteer.");
      return;
    }

    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/admin/events/${eventId}/volunteers/${selectedApp.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          assignedResponsibilities: action === "APPROVE" ? assignedRoles : [],
          rejectionReason,
          internalNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionSuccess(`Volunteer application updated: ${action}`);
        // Refresh local state
        setApplications((prev) =>
          prev.map((a) =>
            a.id === selectedApp.id
              ? {
                  ...a,
                  status: action === "APPROVE" ? "APPROVED" : action === "REJECT" || action === "REVOKE" ? "REJECTED" : "UNDER_REVIEW",
                  assigned_responsibilities: action === "APPROVE" ? assignedRoles : [],
                  rejection_reason: rejectionReason,
                  internal_notes: internalNotes,
                }
              : a
          )
        );

        setTimeout(() => {
          setSelectedApp(null);
        }, 1200);
      } else {
        setActionError(data.message || "Failed to update volunteer application.");
      }
    } catch (err) {
      console.error("[Action Execution Error]", err);
      setActionError("Network error executing decision.");
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = applications.filter((app) => {
    const nameMatch = app.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const emailMatch = app.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesSearch = nameMatch || emailMatch;
    const matchesStatus = statusFilter === "ALL" ? true : app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between selection:bg-brand-red selection:text-white">
      {/* Admin Top Header */}
      <header className="bg-brand-dark text-white border-b border-brand-border-dark sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href="/admin/events" 
              className="inline-flex items-center gap-1.5 text-xs font-mono text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Events Management
            </Link>
            <span className="text-white/30">•</span>
            <span className="font-mono text-xs text-brand-red font-bold uppercase truncate max-w-xs sm:max-w-md">
              {eventTitle} — Volunteer Applications
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/admin/events/${eventId}/attendance`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-mono font-semibold text-white transition-colors"
            >
              <QrCode className="w-3.5 h-3.5 text-brand-red" />
              <span>Attendance Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-sm font-mono">{error}</p>
            </div>
            <button
              onClick={fetchVolunteers}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold uppercase"
            >
              Retry
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-mono font-bold tracking-widest text-brand-red uppercase">
              Event Volunteer Staffing
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-brand-dark uppercase">
              Volunteer Applications & Approvals
            </h1>
            <p className="text-xs sm:text-sm text-brand-dark/70 font-mono mt-0.5">
              Review volunteer qualifications and explicitly assign QR scanning access.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search name or email..."
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
              <option value="ALL">All Statuses ({applications.length})</option>
              <option value="PENDING">Pending ({applications.filter((a) => a.status === "PENDING").length})</option>
              <option value="APPROVED">Approved ({applications.filter((a) => a.status === "APPROVED").length})</option>
              <option value="REJECTED">Rejected ({applications.filter((a) => a.status === "REJECTED").length})</option>
            </select>
          </div>
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="bg-white rounded-3xl border border-brand-border p-12 text-center">
            <Loader2 className="w-8 h-8 text-brand-red animate-spin mx-auto mb-3" />
            <p className="font-mono text-sm text-brand-dark/70">
              Loading volunteer records from Supabase...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-brand-border p-12 text-center">
            <Layers className="w-10 h-10 text-brand-grey mx-auto mb-3" />
            <h3 className="font-display text-lg font-bold text-brand-dark uppercase">
              No Volunteer Applications Found
            </h3>
            <p className="font-mono text-xs text-brand-grey mt-1">
              {applications.length === 0
                ? "No volunteers have applied for this event yet."
                : "No applications match the search or filter criteria."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-brand-border overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-brand-bg border-b border-brand-border text-brand-grey uppercase">
                  <tr>
                    <th className="py-3.5 px-6 font-bold">Volunteer</th>
                    <th className="py-3.5 px-6 font-bold">Preferred Roles</th>
                    <th className="py-3.5 px-6 font-bold">Assigned Roles</th>
                    <th className="py-3.5 px-6 font-bold">Status</th>
                    <th className="py-3.5 px-6 font-bold">Applied</th>
                    <th className="py-3.5 px-6 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  {filtered.map((app) => {
                    const hasScanner = app.assigned_responsibilities?.includes("QR_SCANNING");

                    return (
                      <tr key={app.id} className="hover:bg-brand-bg/40 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-brand-dark text-sm">
                            {app.profiles?.full_name || "Volunteer"}
                          </div>
                          <div className="text-brand-grey">
                            {app.profiles?.email} • {app.profiles?.mobile || "No phone"}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {app.preferred_responsibilities?.map((r) => (
                              <span key={r} className="px-2 py-0.5 rounded bg-brand-bg border border-brand-border text-[10px]">
                                {r}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {app.status === "APPROVED" ? (
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {app.assigned_responsibilities?.map((r) => (
                                <span
                                  key={r}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    r === "QR_SCANNING"
                                      ? "bg-brand-red/10 border border-brand-red text-brand-red"
                                      : "bg-emerald-50 border border-emerald-200 text-emerald-800"
                                  }`}
                                >
                                  {r === "QR_SCANNING" && "📷 "}
                                  {r}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-brand-grey italic">Not Assigned</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              app.status === "APPROVED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : app.status === "REJECTED"
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {app.status === "APPROVED" && <CheckCircle2 className="w-3 h-3" />}
                            {app.status === "REJECTED" && <XCircle className="w-3 h-3" />}
                            {app.status === "PENDING" && <Clock className="w-3 h-3" />}
                            <span>{app.status}</span>
                          </span>
                        </td>
                        <td className="py-4 px-6 text-brand-grey whitespace-nowrap">
                          {new Date(app.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => openReviewModal(app)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-dark text-white hover:bg-black font-semibold text-xs transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Review</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Review & Approval Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-brand-border shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-brand-border">
              <div>
                <span className="text-[11px] font-mono font-bold text-brand-red uppercase">
                  Volunteer Decision Panel
                </span>
                <h2 className="font-display text-2xl font-extrabold text-brand-dark">
                  {selectedApp.profiles?.full_name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
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

            {actionError && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="py-6 space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-brand-bg border border-brand-border">
                <div>
                  <span className="text-brand-grey uppercase text-[10px]">Email Contact</span>
                  <p className="font-bold text-brand-dark">{selectedApp.profiles?.email}</p>
                </div>
                <div>
                  <span className="text-brand-grey uppercase text-[10px]">Phone Number</span>
                  <p className="font-bold text-brand-dark">{selectedApp.profiles?.mobile || "Not provided"}</p>
                </div>
                <div>
                  <span className="text-brand-grey uppercase text-[10px]">Event Availability</span>
                  <p className="font-bold text-brand-dark">{selectedApp.availability}</p>
                </div>
                <div>
                  <span className="text-brand-grey uppercase text-[10px]">Current Status</span>
                  <p className="font-bold text-brand-red uppercase">{selectedApp.status}</p>
                </div>
              </div>

              <div>
                <span className="text-brand-grey uppercase text-[10px] block mb-1">Motivation</span>
                <div className="p-3.5 rounded-xl bg-white border border-brand-border text-brand-dark whitespace-pre-wrap">
                  {selectedApp.motivation}
                </div>
              </div>

              {selectedApp.experience && (
                <div>
                  <span className="text-brand-grey uppercase text-[10px] block mb-1">Prior Experience</span>
                  <div className="p-3.5 rounded-xl bg-white border border-brand-border text-brand-dark">
                    {selectedApp.experience}
                  </div>
                </div>
              )}

              {/* Responsibility Assignment Checklist */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-brand-dark font-bold uppercase text-[11px]">
                    Assign Responsibilities (Strict Authorization)
                  </span>
                  <span className="text-[10px] text-brand-red font-bold">
                    * Scanner role enables mobile check-in
                  </span>
                </div>

                <div className="space-y-2">
                  {ALL_RESPONSIBILITIES.map((resp) => {
                    const isChecked = assignedRoles.includes(resp.id);
                    const isScanner = resp.id === "QR_SCANNING";

                    return (
                      <div
                        key={resp.id}
                        onClick={() => handleToggleRole(resp.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-colors flex items-center justify-between ${
                          isChecked
                            ? isScanner
                              ? "bg-brand-red/10 border-brand-red text-brand-dark"
                              : "bg-blue-50/50 border-brand-blue text-brand-dark"
                            : "bg-white border-brand-border text-brand-dark/70 hover:border-brand-dark/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                              isChecked
                                ? isScanner
                                  ? "bg-brand-red text-white"
                                  : "bg-brand-blue text-white"
                                : "border border-brand-grey"
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <div>
                            <span className="font-bold text-xs">{resp.label}</span>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isScanner ? "bg-brand-red text-white" : "bg-brand-bg text-brand-dark"
                          }`}
                        >
                          {resp.badge}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Rejection / Revocation Reason */}
              <div>
                <label className="block text-brand-dark font-bold uppercase text-[11px] mb-1">
                  Rejection or Revocation Reason (Dispatched via Brevo Email)
                </label>
                <input
                  type="text"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Volunteer quota full for this division..."
                  className="w-full p-2.5 rounded-xl bg-white border border-brand-border text-brand-dark text-xs focus:outline-none focus:ring-2 focus:ring-brand-red"
                />
              </div>

              {/* Internal Notes */}
              <div>
                <label className="block text-brand-dark font-bold uppercase text-[11px] mb-1">
                  Internal Administrative Notes
                </label>
                <input
                  type="text"
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Private coordinator notes (not shown to volunteer)..."
                  className="w-full p-2.5 rounded-xl bg-white border border-brand-border text-brand-dark text-xs focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>
            </div>

            {/* Decision Controls */}
            <div className="pt-4 border-t border-brand-border flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-mono text-brand-grey">
                Email notification will be sent automatically
              </span>
              <div className="flex items-center gap-2">
                {selectedApp.status === "APPROVED" ? (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleAction("REVOKE")}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-mono text-xs font-bold transition-colors"
                  >
                    Revoke Approval
                  </button>
                ) : (
                  <>
                    <button
                      disabled={actionLoading}
                      onClick={() => handleAction("REJECT")}
                      className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-mono text-xs font-bold transition-colors"
                    >
                      Reject Application
                    </button>
                    <button
                      disabled={actionLoading}
                      onClick={() => handleAction("APPROVE")}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Approve & Assign Roles</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-brand-border py-4 text-center text-xs font-mono text-brand-grey">
        COMMUNITY.VA Admin Console • Event Volunteer Staffing & QR Authorization
      </footer>
    </div>
  );
}
