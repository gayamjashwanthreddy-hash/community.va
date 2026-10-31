"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { 
  Users, 
  ArrowLeft, 
  Search, 
  Filter, 
  FileSpreadsheet, 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Eye, 
  ExternalLink, 
  RefreshCw,
  X,
  Send,
  Calendar,
  AlertTriangle
} from "lucide-react";
import { EventItem, EventRegistration, PaymentStatus } from "@/lib/events/types";

export default function EventRegistrationsPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventItem | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Inspection Modal (Submitted Answers)
  const [selectedReg, setSelectedReg] = useState<EventRegistration | null>(null);

  // Payment Verification Modal
  const [paymentModalReg, setPaymentModalReg] = useState<EventRegistration | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/registrations?paymentStatus=${statusFilter}&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        setEvent(data.event);
        setRegistrations(data.registrations);
      }
    } catch (err) {
      console.error("Failed to load registrations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchRegistrations();
    }
  }, [eventId, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRegistrations();
  };

  const handlePaymentAction = async (action: "VERIFY" | "REJECT" | "REQUEST_NEW") => {
    if (!paymentModalReg || !paymentModalReg.payment) return;
    setActionLoading(true);

    try {
      const res = await fetch(`/api/events/${eventId}/payments/${paymentModalReg.payment.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          reason: action === "REJECT" || action === "REQUEST_NEW" ? rejectionReason : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPaymentModalReg(null);
        setShowRejectInput(false);
        setRejectionReason("");
        fetchRegistrations();
      } else {
        alert(data.message || "Action failed.");
      }
    } catch (err) {
      console.error("Action error", err);
      alert("Error processing action.");
    } finally {
      setActionLoading(false);
    }
  };

  // Metrics
  const total = registrations.length;
  const verifiedCount = registrations.filter(r => r.payment?.payment_status === "PAYMENT_VERIFIED").length;
  const submittedCount = registrations.filter(r => r.payment?.payment_status === "PAYMENT_SUBMITTED").length;
  const rejectedCount = registrations.filter(r => r.payment?.payment_status === "PAYMENT_REJECTED").length;

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between">
      {/* Top Header */}
      <header className="bg-brand-dark text-white border-b border-brand-border-dark sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/events"
              className="text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Events</span>
            </Link>
            <span className="text-neutral-500">|</span>
            <span className="text-xs font-bold font-mono uppercase text-brand-blue truncate max-w-sm">
              {event?.title || "Event Registrations"}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href={`/api/events/${eventId}/registrations/export`}
              download
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white text-brand-dark text-xs font-bold hover:bg-neutral-100 transition-colors shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Title & Info Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-brand-muted mb-1">
              <Link href="/admin/events" className="hover:underline">Events</Link>
              <span>/</span>
              <span className="text-brand-dark font-bold">Participant Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight">
              {event?.title || "Participant Registrations"}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-brand-muted mt-2 font-medium">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {event?.event_start ? new Date(event.event_start).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : ""}
              </span>
              <span>•</span>
              <span>{event?.venue}</span>
              <span>•</span>
              <span className="font-mono font-bold text-brand-dark">
                Capacity: {total} / {event?.capacity || 100}
              </span>
              {event?.is_paid && (
                <>
                  <span>•</span>
                  <span className="font-mono font-bold text-brand-red">Fee: ₹{event.fee_amount}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchRegistrations}
              className="p-2 rounded-md border border-brand-border bg-white text-brand-dark hover:bg-neutral-50 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <a
              href={`/api/events/${eventId}/registrations/export`}
              download
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download CSV Report</span>
            </a>
          </div>
        </div>

        {/* Stats KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border border-brand-border shadow-sm">
            <div className="text-xs font-bold text-brand-muted uppercase tracking-wider mb-1">Total Registrations</div>
            <div className="text-2xl font-extrabold text-brand-dark">{total}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-brand-border shadow-sm">
            <div className="text-xs font-bold text-brand-red uppercase tracking-wider mb-1">Awaiting Review</div>
            <div className="text-2xl font-extrabold text-brand-red">{submittedCount}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-brand-border shadow-sm">
            <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Verified Passes</div>
            <div className="text-2xl font-extrabold text-emerald-600">{verifiedCount}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-brand-border shadow-sm">
            <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Rejected Payments</div>
            <div className="text-2xl font-extrabold text-neutral-700">{rejectedCount}</div>
          </div>
        </div>

        {/* Search & Status Filters */}
        <div className="bg-white p-4 rounded-xl border border-brand-border shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by participant name, email, or Registration ID..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-brand-border rounded-lg outline-none focus:border-brand-dark"
            />
          </form>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-brand-muted font-bold uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5" />
              <span>Payment Filter:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-medium border border-brand-border rounded-lg px-2.5 py-2 bg-white outline-none focus:border-brand-dark"
            >
              <option value="ALL">All Registrations</option>
              <option value="PAYMENT_SUBMITTED">Payment Submitted (Review Needed)</option>
              <option value="PAYMENT_VERIFIED">Payment Verified</option>
              <option value="PAYMENT_REJECTED">Payment Rejected</option>
              <option value="NOT_REQUIRED">Free Event (Not Required)</option>
            </select>
          </div>
        </div>

        {/* Registrations Table */}
        <div className="bg-white rounded-xl border border-brand-border shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-blue mb-3" />
              <p className="text-xs font-mono uppercase tracking-wider text-brand-muted">Loading registrations...</p>
            </div>
          ) : registrations.length === 0 ? (
            <div className="py-16 text-center px-4">
              <Users className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-brand-dark">No Registrations Found</h3>
              <p className="text-xs text-brand-muted mt-1 max-w-sm mx-auto">
                No participants matched your filter criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50 border-b border-brand-border text-brand-muted font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Registration ID</th>
                    <th className="py-3 px-4">Participant</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Registered On</th>
                    <th className="py-3 px-4">Payment Status</th>
                    <th className="py-3 px-4">Form Answers</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {registrations.map((reg) => {
                    const payment = reg.payment;
                    const payStatus = payment?.payment_status || (event?.is_paid ? "PAYMENT_PENDING" : "NOT_REQUIRED");

                    return (
                      <tr key={reg.id} className="hover:bg-neutral-50/60 transition-colors">
                        {/* ID */}
                        <td className="py-3.5 px-4 font-mono font-bold text-brand-dark">
                          {reg.registration_number}
                        </td>

                        {/* Participant Name */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-brand-dark">{reg.participant_name}</div>
                        </td>

                        {/* Contact */}
                        <td className="py-3.5 px-4">
                          <div className="text-brand-dark">{reg.participant_email}</div>
                          <div className="text-[11px] text-brand-muted">{reg.participant_phone}</div>
                        </td>

                        {/* Registered Date */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-brand-muted">
                          {new Date(reg.registered_at).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </td>

                        {/* Payment Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {payStatus === "PAYMENT_VERIFIED" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              VERIFIED
                            </span>
                          ) : payStatus === "PAYMENT_SUBMITTED" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-900 animate-pulse">
                              <Clock className="w-3 h-3" />
                              PROOF SUBMITTED
                            </span>
                          ) : payStatus === "PAYMENT_REJECTED" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-100 text-red-800">
                              <XCircle className="w-3 h-3" />
                              REJECTED
                            </span>
                          ) : payStatus === "NOT_REQUIRED" ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-neutral-100 text-neutral-600">
                              FREE EVENT
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-neutral-100 text-neutral-700">
                              PENDING
                            </span>
                          )}
                        </td>

                        {/* Answers Quick View */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedReg(reg)}
                            className="inline-flex items-center gap-1 text-xs text-brand-blue font-bold hover:underline"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Answers ({Object.keys(reg.answers || {}).length})</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {event?.is_paid && payment && (
                            <button
                              type="button"
                              onClick={() => {
                                setPaymentModalReg(reg);
                                setShowRejectInput(false);
                                setRejectionReason("");
                              }}
                              className={`px-3 py-1 text-xs font-bold rounded shadow-sm transition-colors ${
                                payStatus === "PAYMENT_SUBMITTED"
                                  ? "bg-brand-red text-white hover:bg-red-700"
                                  : "bg-white border border-brand-border text-brand-dark hover:bg-neutral-50"
                              }`}
                            >
                              {payStatus === "PAYMENT_SUBMITTED" ? "Review Proof" : "Inspect Payment"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Submitted Answers Modal */}
      {selectedReg && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-brand-border max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border mb-4">
              <div>
                <h3 className="text-base font-bold text-brand-dark">Registration Questionnaire Answers</h3>
                <p className="text-xs text-brand-muted font-mono">{selectedReg.registration_number} • {selectedReg.participant_name}</p>
              </div>
              <button
                onClick={() => setSelectedReg(null)}
                className="p-1 rounded text-neutral-400 hover:text-brand-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="p-3 rounded-lg bg-neutral-50 border border-brand-border space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Participant Contact</div>
                <div className="text-xs font-bold text-brand-dark">{selectedReg.participant_name}</div>
                <div className="text-xs text-brand-muted">{selectedReg.participant_email} • {selectedReg.participant_phone}</div>
              </div>

              {Object.entries(selectedReg.answers || {}).length === 0 ? (
                <p className="text-xs text-neutral-400 py-4 text-center">No custom answers submitted.</p>
              ) : (
                Object.entries(selectedReg.answers).map(([key, val], idx) => (
                  <div key={idx} className="border-b border-brand-border pb-3">
                    <div className="text-[11px] font-bold text-brand-dark uppercase tracking-wider">
                      {key}
                    </div>
                    <div className="text-xs text-neutral-700 mt-1 font-medium bg-neutral-50 p-2.5 rounded border border-neutral-100">
                      {Array.isArray(val) ? val.join(", ") : String(val) || "—"}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-brand-border text-right mt-4">
              <button
                type="button"
                onClick={() => setSelectedReg(null)}
                className="px-4 py-2 text-xs font-bold rounded-md bg-brand-dark text-white hover:bg-black"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual UPI Payment Verification Modal */}
      {paymentModalReg && paymentModalReg.payment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-brand-border max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border mb-4">
              <div className="flex items-center gap-2 text-brand-red">
                <CreditCard className="w-5 h-5" />
                <h3 className="text-base font-bold text-brand-dark">Manual UPI Payment Review</h3>
              </div>
              <button
                onClick={() => setPaymentModalReg(null)}
                className="p-1 rounded text-neutral-400 hover:text-brand-dark"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Transaction details card */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-lg bg-neutral-50 border border-brand-border text-xs">
                <div>
                  <span className="text-[10px] uppercase text-brand-muted block font-bold">Participant</span>
                  <span className="font-bold text-brand-dark">{paymentModalReg.participant_name}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-brand-muted block font-bold">Amount Due</span>
                  <span className="font-mono font-bold text-brand-red">₹{paymentModalReg.payment.amount}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-brand-muted block font-bold">Status</span>
                  <span className="font-mono font-bold text-brand-dark">{paymentModalReg.payment.payment_status}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] uppercase text-brand-muted block font-bold">UTR / UPI Reference ID</span>
                  <span className="font-mono font-semibold text-brand-dark">
                    {paymentModalReg.payment.payment_reference || "Not entered by user"}
                  </span>
                </div>
              </div>

              {/* Uploaded Payment Screenshot Preview */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-dark block">
                  Uploaded Payment Proof Screenshot
                </span>
                <div className="w-full h-72 rounded-xl border border-brand-border bg-black/5 overflow-hidden relative flex items-center justify-center shadow-inner">
                  {paymentModalReg.payment.screenshot_path ? (
                    <Image
                      src={paymentModalReg.payment.screenshot_path}
                      alt="Uploaded Payment Proof"
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="text-neutral-400 text-xs">No screenshot path found</div>
                  )}
                </div>
                {paymentModalReg.payment.screenshot_path && (
                  <div className="text-right">
                    <a
                      href={paymentModalReg.payment.screenshot_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-brand-blue font-bold inline-flex items-center gap-1 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open Full Resolution Screenshot
                    </a>
                  </div>
                )}
              </div>

              {/* Rejection input */}
              {showRejectInput && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-2 animate-fadeIn">
                  <label className="block text-xs font-bold text-brand-red">
                    Reason for Rejection *
                  </label>
                  <textarea
                    rows={2}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. Screenshot does not display the transaction UTR number, or payment was not credited."
                    className="w-full px-3 py-2 text-xs border border-red-300 rounded outline-none"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRejectInput(false)}
                      className="px-3 py-1 text-xs font-semibold rounded text-neutral-600 hover:bg-red-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePaymentAction("REJECT")}
                      disabled={actionLoading || !rejectionReason.trim()}
                      className="px-3 py-1 text-xs font-bold rounded bg-brand-red text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      Confirm Rejection & Send Email
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Action Buttons */}
            {!showRejectInput && (
              <div className="pt-4 border-t border-brand-border flex items-center justify-between gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowRejectInput(true)}
                  className="px-4 py-2 text-xs font-bold rounded-lg border border-red-300 text-brand-red hover:bg-red-50 transition-colors"
                >
                  Reject Payment
                </button>

                <button
                  type="button"
                  onClick={() => handlePaymentAction("VERIFY")}
                  disabled={actionLoading}
                  className="px-5 py-2 text-xs font-extrabold uppercase tracking-wider rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-md disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{actionLoading ? "Verifying..." : "Verify Payment & Confirm Pass"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-brand-border py-4 text-center text-xs text-brand-muted">
        COMMUNITY.VA Administration Console • Events & Payments Verification Desk • Hyderabad
      </footer>
    </div>
  );
}
