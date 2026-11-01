"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  QrCode, 
  Users, 
  CreditCard, 
  HandHeart, 
  Calendar, 
  Loader2, 
  AlertCircle, 
  TrendingUp, 
  BarChart3,
  RefreshCw,
  Eye,
  Camera,
  Keyboard
} from "lucide-react";

interface AttendanceStats {
  totalRegistrations: number;
  eligibleParticipants: number;
  totalCheckedIn: number;
  notYetCheckedIn: number;
  pendingPayment: number;
  verifiedPayment: number;
  successfulScans: number;
  failedScans: number;
  approvedEventVolunteers: number;
  attendancePercentage: number;
}

interface ParticipantRecord {
  id: string;
  registration_number: string;
  participant_name: string;
  participant_email: string;
  participant_phone: string;
  is_team_registration?: boolean;
  team_name?: string | null;
  team_members_count?: number;
  payment_status: string;
  is_checked_in: boolean;
  checked_in_at?: string | null;
  check_in_method?: string | null;
  checked_in_by?: string | null;
  registered_at: string;
}

interface ScanLog {
  id: string;
  registration_id?: string | null;
  scanned_by: string;
  scan_result: string;
  token_hash: string;
  scan_method: string;
  error_message?: string | null;
  scanned_at: string;
  volunteer?: {
    full_name: string;
    email: string;
  };
}

interface VolunteerActivity {
  name: string;
  email: string;
  scans: number;
  successful: number;
  failed: number;
}

export default function AdminEventAttendancePage() {
  const params = useParams();
  const eventId = params.id as string;

  const [eventTitle, setEventTitle] = useState("Event Attendance");
  const [stats, setStats] = useState<AttendanceStats>({
    totalRegistrations: 0,
    eligibleParticipants: 0,
    totalCheckedIn: 0,
    notYetCheckedIn: 0,
    pendingPayment: 0,
    verifiedPayment: 0,
    successfulScans: 0,
    failedScans: 0,
    approvedEventVolunteers: 0,
    attendancePercentage: 0,
  });

  const [participants, setParticipants] = useState<ParticipantRecord[]>([]);
  const [scanLogs, setScanLogs] = useState<ScanLog[]>([]);
  const [volunteerActivity, setVolunteerActivity] = useState<VolunteerActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active View Tab: 'ATTENDEES' | 'SCAN_LOGS' | 'VOLUNTEERS'
  const [activeTab, setActiveTab] = useState<"ATTENDEES" | "SCAN_LOGS" | "VOLUNTEERS">("ATTENDEES");

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [exportFilter, setExportFilter] = useState("ALL");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/events/${eventId}/attendance`);
      if (res.status === 401 || res.status === 403) {
        setError("Admin privileges required. Please sign in with an administrator account.");
        return;
      }
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setParticipants(data.participants || []);
        setScanLogs(data.scanLogs || []);
        setVolunteerActivity(data.volunteerActivity || []);
        if (data.event?.title) setEventTitle(data.event.title);
      } else {
        setError(data.message || "Failed to load attendance metrics.");
      }
    } catch (err) {
      console.error("[Admin Attendance Fetch Error]", err);
      setError("Network error fetching event attendance.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchData();
    }
  }, [eventId]);

  const handleExport = (filterType: string = exportFilter) => {
    window.open(`/api/admin/events/${eventId}/attendance/export?filter=${filterType}`, "_blank");
  };

  // Filtered Participants
  const filteredParticipants = participants.filter((p) => {
    const searchMatch =
      p.participant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.participant_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.registration_number.toLowerCase().includes(searchTerm.toLowerCase());

    if (!searchMatch) return false;

    if (statusFilter === "CHECKED_IN") return p.is_checked_in;
    if (statusFilter === "NOT_CHECKED_IN") return !p.is_checked_in;
    if (statusFilter === "VERIFIED_PAYMENT") return p.payment_status === "VERIFIED";

    return true;
  });

  // Filtered Scan Logs
  const filteredLogs = scanLogs.filter((log) => {
    const volMatch =
      (log.volunteer?.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.volunteer?.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.scan_result.toLowerCase().includes(searchTerm.toLowerCase());

    if (!volMatch) return false;

    if (statusFilter === "SUCCESS") {
      return log.scan_result === "CHECK-IN SUCCESSFUL" || log.scan_result === "SUCCESS";
    }
    if (statusFilter === "FAILED") {
      return log.scan_result !== "CHECK-IN SUCCESSFUL" && log.scan_result !== "SUCCESS";
    }
    if (statusFilter === "DUPLICATE") {
      return log.scan_result === "ALREADY CHECKED IN";
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between selection:bg-brand-red selection:text-white">
      {/* Admin Header */}
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
              {eventTitle} — Attendance Hub
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/admin/events/${eventId}/volunteers`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-mono font-semibold text-white transition-colors"
            >
              <HandHeart className="w-3.5 h-3.5 text-brand-red" />
              <span>Manage Volunteers</span>
            </Link>
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Refresh Real-time Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
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
              onClick={fetchData}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold uppercase"
            >
              Retry
            </button>
          </div>
        )}

        {/* Title & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-mono font-bold tracking-widest text-brand-red uppercase">
              Real-time Entrance Telemetry
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-brand-dark uppercase tracking-tight mt-1">
              Live Attendance & QR Scan Audit
            </h1>
          </div>

          {/* Export Controls */}
          <div className="flex items-center gap-2">
            <select
              value={exportFilter}
              onChange={(e) => setExportFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white border border-brand-border text-xs font-mono font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              <option value="ALL">Export: All Registrations</option>
              <option value="CHECKED_IN">Export: Checked-In Only</option>
              <option value="NOT_CHECKED_IN">Export: Not Checked-In</option>
              <option value="VERIFIED_PAYMENT">Export: Verified Payments</option>
            </select>
            <button
              onClick={() => handleExport(exportFilter)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-dark hover:bg-black text-white font-mono text-xs font-bold uppercase transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-brand-red" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Real-time Metric Cards (Module 9 derived from DB) */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="p-5 rounded-3xl bg-white border border-brand-border shadow-xs">
            <span className="text-[10px] font-mono text-brand-grey uppercase font-bold block mb-1">
              Total Registrations
            </span>
            <div className="font-display text-3xl font-extrabold text-brand-dark">
              {stats.totalRegistrations}
            </div>
            <p className="text-[10px] font-mono text-brand-grey mt-1">Confirmed signups</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-brand-border shadow-xs">
            <span className="text-[10px] font-mono text-brand-blue uppercase font-bold block mb-1">
              Eligible Participants
            </span>
            <div className="font-display text-3xl font-extrabold text-brand-blue">
              {stats.eligibleParticipants}
            </div>
            <p className="text-[10px] font-mono text-brand-grey mt-1">Free or verified payments</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-brand-border shadow-xs">
            <span className="text-[10px] font-mono text-emerald-700 uppercase font-bold block mb-1">
              Total Checked In
            </span>
            <div className="font-display text-3xl font-extrabold text-emerald-700">
              {stats.totalCheckedIn}
            </div>
            <p className="text-[10px] font-mono text-emerald-800 font-bold mt-1">
              {stats.attendancePercentage}% Attendance Rate
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-brand-border shadow-xs">
            <span className="text-[10px] font-mono text-amber-600 uppercase font-bold block mb-1">
              Not Yet Checked In
            </span>
            <div className="font-display text-3xl font-extrabold text-amber-600">
              {stats.notYetCheckedIn}
            </div>
            <p className="text-[10px] font-mono text-brand-grey mt-1">Awaiting entrance</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-brand-border shadow-xs">
            <span className="text-[10px] font-mono text-brand-red uppercase font-bold block mb-1">
              Active Volunteers
            </span>
            <div className="font-display text-3xl font-extrabold text-brand-red">
              {stats.approvedEventVolunteers}
            </div>
            <p className="text-[10px] font-mono text-brand-grey mt-1">Approved for event</p>
          </div>
        </div>

        {/* Secondary Telemetry Strip */}
        <div className="p-4 rounded-2xl bg-white border border-brand-border flex flex-wrap items-center justify-between gap-4 mb-8 text-xs font-mono">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-brand-grey uppercase">Pending Payments:</span>{" "}
              <strong className="text-amber-600 font-bold">{stats.pendingPayment}</strong>
            </div>
            <div>
              <span className="text-brand-grey uppercase">Verified Payments:</span>{" "}
              <strong className="text-emerald-700 font-bold">{stats.verifiedPayment}</strong>
            </div>
            <div>
              <span className="text-brand-grey uppercase">Successful Scans:</span>{" "}
              <strong className="text-brand-dark font-bold">{stats.successfulScans}</strong>
            </div>
            <div>
              <span className="text-brand-grey uppercase">Failed/Rejected Scans:</span>{" "}
              <strong className="text-rose-600 font-bold">{stats.failedScans}</strong>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-brand-border mb-6">
          <button
            onClick={() => {
              setActiveTab("ATTENDEES");
              setStatusFilter("ALL");
            }}
            className={`pb-3 px-4 text-xs font-mono font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === "ATTENDEES"
                ? "border-brand-red text-brand-dark"
                : "border-transparent text-brand-grey hover:text-brand-dark"
            }`}
          >
            Attendee Roster ({participants.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("SCAN_LOGS");
              setStatusFilter("ALL");
            }}
            className={`pb-3 px-4 text-xs font-mono font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === "SCAN_LOGS"
                ? "border-brand-red text-brand-dark"
                : "border-transparent text-brand-grey hover:text-brand-dark"
            }`}
          >
            Live Scan Logs ({scanLogs.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("VOLUNTEERS");
              setStatusFilter("ALL");
            }}
            className={`pb-3 px-4 text-xs font-mono font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === "VOLUNTEERS"
                ? "border-brand-red text-brand-dark"
                : "border-transparent text-brand-grey hover:text-brand-dark"
            }`}
          >
            Volunteer Performance ({volunteerActivity.length})
          </button>
        </div>

        {/* Search & Filter Bar */}
        {activeTab !== "VOLUNTEERS" && (
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder={
                  activeTab === "ATTENDEES"
                    ? "Search attendee name, email, ID..."
                    : "Search volunteer or scan result..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl bg-white border border-brand-border text-xs font-mono text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-red w-72"
              />
              <Search className="w-4 h-4 text-brand-grey absolute left-3 top-2.5" />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-brand-grey" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border border-brand-border text-xs font-mono font-bold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-red"
              >
                {activeTab === "ATTENDEES" ? (
                  <>
                    <option value="ALL">All Participants ({participants.length})</option>
                    <option value="CHECKED_IN">Checked-In Only ({stats.totalCheckedIn})</option>
                    <option value="NOT_CHECKED_IN">Not Checked-In ({stats.notYetCheckedIn})</option>
                    <option value="VERIFIED_PAYMENT">Verified Payment ({stats.verifiedPayment})</option>
                  </>
                ) : (
                  <>
                    <option value="ALL">All Scan Records ({scanLogs.length})</option>
                    <option value="SUCCESS">Successful Scans ({stats.successfulScans})</option>
                    <option value="FAILED">Failed Scans ({stats.failedScans})</option>
                    <option value="DUPLICATE">Duplicates Caught</option>
                  </>
                )}
              </select>
            </div>
          </div>
        )}

        {/* TAB 1: ATTENDEE ROSTER */}
        {activeTab === "ATTENDEES" && (
          <div className="bg-white rounded-3xl border border-brand-border overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-brand-bg border-b border-brand-border text-brand-grey uppercase">
                  <tr>
                    <th className="py-3.5 px-6 font-bold">Participant</th>
                    <th className="py-3.5 px-6 font-bold">Registration ID</th>
                    <th className="py-3.5 px-6 font-bold">Payment Status</th>
                    <th className="py-3.5 px-6 font-bold">Attendance</th>
                    <th className="py-3.5 px-6 font-bold">Check-in Timestamp</th>
                    <th className="py-3.5 px-6 font-bold">Verified By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  {filteredParticipants.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-brand-grey font-mono">
                        No participant records match the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredParticipants.map((p) => (
                      <tr key={p.id} className="hover:bg-brand-bg/40 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-brand-dark text-sm">{p.participant_name}</span>
                            {p.is_team_registration && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-brand-blue border border-blue-200">
                                Team: {p.team_name || "Squad"} ({p.team_members_count || 1} members)
                              </span>
                            )}
                          </div>
                          <div className="text-brand-grey">
                            {p.participant_email} • {p.participant_phone}
                          </div>
                        </td>
                        <td className="py-4 px-6 font-bold text-brand-blue">
                          {p.registration_number}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              p.payment_status === "VERIFIED"
                                ? "bg-emerald-50 text-emerald-700"
                                : p.payment_status === "NOT_REQUIRED"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {p.payment_status}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              p.is_checked_in
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-neutral-100 text-neutral-600"
                            }`}
                          >
                            {p.is_checked_in ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            <span>{p.is_checked_in ? "CHECKED IN" : "NOT CHECKED IN"}</span>
                          </span>
                        </td>
                        <td className="py-4 px-6 text-brand-grey">
                          {p.checked_in_at
                            ? new Date(p.checked_in_at).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })
                            : "—"}
                        </td>
                        <td className="py-4 px-6 text-brand-dark font-medium">
                          {p.checked_in_by || "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE SCAN LOGS */}
        {activeTab === "SCAN_LOGS" && (
          <div className="bg-white rounded-3xl border border-brand-border overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-brand-bg border-b border-brand-border text-brand-grey uppercase">
                  <tr>
                    <th className="py-3.5 px-6 font-bold">Scan Result</th>
                    <th className="py-3.5 px-6 font-bold">Volunteer Scanner</th>
                    <th className="py-3.5 px-6 font-bold">Method</th>
                    <th className="py-3.5 px-6 font-bold">Token Signature (Masked)</th>
                    <th className="py-3.5 px-6 font-bold">Details / Error</th>
                    <th className="py-3.5 px-6 font-bold text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-brand-grey font-mono">
                        No scan audit logs recorded yet.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => {
                      const isSuccess =
                        log.scan_result === "CHECK-IN SUCCESSFUL" || log.scan_result === "SUCCESS";
                      const isDup = log.scan_result === "ALREADY CHECKED IN";

                      return (
                        <tr key={log.id} className="hover:bg-brand-bg/40 transition-colors">
                          <td className="py-4 px-6">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                isSuccess
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : isDup
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}
                            >
                              {isSuccess ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : isDup ? (
                                <AlertCircle className="w-3 h-3" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                              <span>{log.scan_result}</span>
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-bold text-brand-dark">
                              {log.volunteer?.full_name || "Volunteer"}
                            </div>
                            <div className="text-[10px] text-brand-grey">
                              {log.volunteer?.email || "—"}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center gap-1 text-[11px] text-brand-dark font-medium">
                              {log.scan_method === "MANUAL" ? (
                                <>
                                  <Keyboard className="w-3 h-3 text-neutral-500" />
                                  <span>Manual</span>
                                </>
                              ) : (
                                <>
                                  <Camera className="w-3 h-3 text-brand-red" />
                                  <span>Camera</span>
                                </>
                              )}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-brand-grey text-[11px]">
                            {log.token_hash}
                          </td>
                          <td className="py-4 px-6 text-brand-dark/80 text-[11px]">
                            {log.error_message || "Check-in recorded cleanly."}
                          </td>
                          <td className="py-4 px-6 text-brand-grey text-right whitespace-nowrap">
                            {new Date(log.scanned_at).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: VOLUNTEER ACTIVITY BREAKDOWN */}
        {activeTab === "VOLUNTEERS" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {volunteerActivity.length === 0 ? (
              <div className="col-span-full bg-white rounded-3xl border border-brand-border p-12 text-center text-brand-grey font-mono">
                No volunteer scanning telemetry logged for this event.
              </div>
            ) : (
              volunteerActivity.map((v) => (
                <div
                  key={v.email}
                  className="bg-white rounded-3xl border border-brand-border p-6 shadow-xs"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[10px] font-bold uppercase text-brand-red">
                      Scanner Activity
                    </span>
                    <span className="text-xs font-mono font-bold text-brand-dark">
                      {v.scans} Total Scans
                    </span>
                  </div>

                  <h3 className="font-display text-lg font-bold text-brand-dark">{v.name}</h3>
                  <p className="text-xs font-mono text-brand-grey mb-4">{v.email}</p>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-brand-border text-xs font-mono">
                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                        Successful
                      </span>
                      <span className="text-lg font-bold text-emerald-900">{v.successful}</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200">
                      <span className="text-[10px] uppercase font-bold text-rose-800 block">
                        Rejections
                      </span>
                      <span className="text-lg font-bold text-rose-900">{v.failed}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-brand-border py-4 text-center text-xs font-mono text-brand-grey">
        COMMUNITY.VA Admin Console • Event Attendance & Scan Audit System
      </footer>
    </div>
  );
}
