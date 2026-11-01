"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Clock, 
  HandHeart, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  QrCode, 
  AlertCircle, 
  Loader2, 
  ShieldCheck,
  Check
} from "lucide-react";

interface EventOpportunity {
  id: string;
  title: string;
  slug: string;
  category: string;
  venue: string;
  event_start: string;
  event_end: string;
  status: string;
  myApplication?: {
    id: string;
    status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "WITHDRAWN";
    assigned_responsibilities: string[];
    preferred_responsibilities: string[];
    created_at: string;
    rejection_reason?: string;
  } | null;
}

const RESPONSIBILITIES = [
  { id: "QR_SCANNING", label: "QR Scanning & Mobile Verification", desc: "Scan attendee passes at entrance gates using smartphone camera." },
  { id: "PARTICIPANT_CHECK_IN", label: "Participant Check-In & Badge Desk", desc: "Welcome attendees and hand out kits and registration badges." },
  { id: "REGISTRATION_DESK", label: "Help & Registration Desk", desc: "Assist walk-in queries, resolve discrepancies, and verify details." },
  { id: "EVENT_COORDINATION", label: "Stage & Event Coordination", desc: "Manage track transitions, sound/projection setup, and speaker support." },
  { id: "GENERAL_SUPPORT", label: "Logistics & General Support", desc: "Assist with crowd management, refreshments, and operations flow." },
];

export default function VolunteerEventsPage() {
  const [events, setEvents] = useState<EventOpportunity[]>([]);
  const [profile, setProfile] = useState<{ full_name: string; email: string; mobile?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Application Modal State
  const [selectedEvent, setSelectedEvent] = useState<EventOpportunity | null>(null);
  const [motivation, setMotivation] = useState("");
  const [experience, setExperience] = useState("");
  const [preferredResponsibilities, setPreferredResponsibilities] = useState<string[]>(["QR_SCANNING"]);
  const [availability, setAvailability] = useState("Full Event Day (Morning to Evening)");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/events/volunteer-events");
      if (res.status === 401) {
        window.location.href = "/login?redirect=/dashboard/volunteer/events";
        return;
      }
      const data = await res.json();
      if (data.success) {
        setEvents(data.events || []);
        setProfile(data.profile || null);
      } else {
        setError(data.message || "Failed to load events.");
      }
    } catch (err) {
      console.error("[Volunteer Events Load Error]", err);
      setError("Network error loading event opportunities.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleToggleResp = (respId: string) => {
    if (preferredResponsibilities.includes(respId)) {
      if (preferredResponsibilities.length > 1) {
        setPreferredResponsibilities(preferredResponsibilities.filter((r) => r !== respId));
      }
    } else {
      setPreferredResponsibilities([...preferredResponsibilities, respId]);
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const res = await fetch(`/api/events/${selectedEvent.id}/volunteers/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          motivation,
          experience,
          preferredResponsibilities,
          availability,
          additionalInfo,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitSuccess("Your application has been submitted! It is now pending administrator review.");
        setTimeout(() => {
          setSelectedEvent(null);
          setSubmitSuccess(null);
          fetchEvents();
        }, 1800);
      } else {
        setSubmitError(data.message || "Submission failed.");
      }
    } catch (err) {
      console.error("[Apply Submit Error]", err);
      setSubmitError("Network error submitting application.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between selection:bg-brand-red selection:text-white">
      {/* Header */}
      <header className="bg-brand-dark text-white border-b border-brand-border-dark sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard/volunteer" 
              className="inline-flex items-center gap-1.5 text-xs font-mono text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Volunteer Portal
            </Link>
            <span className="text-white/30">•</span>
            <span className="font-mono text-xs text-brand-red font-bold uppercase">
              Event Volunteer Opportunities
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        <div className="mb-8">
          <span className="text-xs font-mono font-bold tracking-widest text-brand-red uppercase">
            Community Event Operations
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-dark uppercase tracking-tight mt-1">
            Apply to Volunteer for Upcoming Events
          </h1>
          <p className="font-body text-sm text-brand-dark/70 mt-1 max-w-2xl">
            Each event requires separate volunteer registration and administrative approval. Approved QR scanning volunteers receive exclusive mobile check-in access.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-sm font-mono">{error}</p>
            </div>
            <button
              onClick={fetchEvents}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold uppercase"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-3xl border border-brand-border p-16 text-center">
            <Loader2 className="w-8 h-8 text-brand-red animate-spin mx-auto mb-3" />
            <p className="font-mono text-sm text-brand-dark/70">
              Loading active event opportunities...
            </p>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-3xl border border-brand-border p-16 text-center">
            <Calendar className="w-10 h-10 text-brand-grey mx-auto mb-3" />
            <h3 className="font-display text-lg font-bold text-brand-dark uppercase">
              No Active Events Open for Volunteering
            </h3>
            <p className="font-mono text-xs text-brand-grey mt-1">
              Check back soon for new hackathons, workshops, and youth initiatives.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((evt) => {
              const myApp = evt.myApplication;
              const isApproved = myApp?.status === "APPROVED";
              const canScan = isApproved && myApp?.assigned_responsibilities?.includes("QR_SCANNING");

              return (
                <div
                  key={evt.id}
                  className="bg-white rounded-3xl border border-brand-border p-6 shadow-xs flex flex-col justify-between hover:border-brand-dark/40 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-brand-bg border border-brand-border text-[10px] font-mono font-bold uppercase text-brand-dark">
                        {evt.category}
                      </span>

                      {myApp ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                            myApp.status === "APPROVED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : myApp.status === "REJECTED"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {myApp.status === "APPROVED" && <CheckCircle2 className="w-3 h-3" />}
                          {myApp.status === "REJECTED" && <XCircle className="w-3 h-3" />}
                          {myApp.status === "PENDING" && <Clock className="w-3 h-3" />}
                          <span>{myApp.status}</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-mono font-bold uppercase">
                          Open for Applications
                        </span>
                      )}
                    </div>

                    <h3 className="font-display text-xl font-extrabold text-brand-dark mb-2 leading-tight">
                      {evt.title}
                    </h3>

                    <div className="space-y-2 text-xs font-mono text-brand-dark/70 mb-5">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-brand-blue shrink-0" />
                        <span>
                          {new Date(evt.event_start).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-brand-red shrink-0" />
                        <span className="truncate">{evt.venue}</span>
                      </div>
                    </div>

                    {/* Status Feedback / Assigned Responsibilities */}
                    {myApp && isApproved && (
                      <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 mb-4 text-xs font-mono text-emerald-900">
                        <span className="font-bold block text-[10px] uppercase text-emerald-800">
                          Assigned Responsibilities:
                        </span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {myApp.assigned_responsibilities?.map((r) => (
                            <span key={r} className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-[10px] font-bold">
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {myApp && myApp.status === "REJECTED" && myApp.rejection_reason && (
                      <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 mb-4 text-xs font-mono text-rose-900">
                        <span className="font-bold block text-[10px] uppercase text-rose-800">
                          Rejection Reason:
                        </span>
                        <p className="mt-0.5 text-[11px]">{myApp.rejection_reason}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-brand-border flex items-center justify-between gap-3">
                    {canScan && (
                      <Link
                        href={`/dashboard/event-volunteer/events/${evt.id}/scan`}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-brand-red hover:bg-brand-red/90 text-white font-mono text-xs font-bold uppercase transition-colors shadow-sm"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Open QR Scanner</span>
                      </Link>
                    )}

                    {!myApp && (
                      <button
                        onClick={() => {
                          setSelectedEvent(evt);
                          setSubmitSuccess(null);
                          setSubmitError(null);
                        }}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-brand-dark hover:bg-black text-white font-mono text-xs font-bold uppercase transition-colors"
                      >
                        <HandHeart className="w-4 h-4 text-brand-red" />
                        <span>Request to Volunteer</span>
                      </button>
                    )}

                    {myApp && myApp.status === "PENDING" && (
                      <div className="w-full text-center py-2 text-xs font-mono text-amber-700 bg-amber-50 rounded-xl border border-amber-200">
                        Application Pending Admin Review
                      </div>
                    )}

                    {myApp && isApproved && !canScan && (
                      <div className="w-full text-center py-2 text-xs font-mono text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200">
                        Approved • General Support
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Application Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-brand-border shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-brand-border">
              <div>
                <span className="text-[11px] font-mono font-bold text-brand-red uppercase">
                  Event Volunteer Application
                </span>
                <h2 className="font-display text-xl font-extrabold text-brand-dark">
                  {selectedEvent.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1.5 rounded-full hover:bg-brand-bg text-brand-grey hover:text-brand-dark"
              >
                ✕
              </button>
            </div>

            {submitSuccess && (
              <div className="my-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{submitSuccess}</span>
              </div>
            )}

            {submitError && (
              <div className="my-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleApplySubmit} className="py-5 space-y-4 text-xs font-mono">
              {/* Profile Details (Readonly) */}
              <div className="p-3.5 rounded-2xl bg-brand-bg border border-brand-border grid grid-cols-2 gap-3">
                <div>
                  <span className="text-brand-grey uppercase text-[10px]">Volunteer</span>
                  <p className="font-bold text-brand-dark">{profile?.full_name || "Volunteer"}</p>
                </div>
                <div>
                  <span className="text-brand-grey uppercase text-[10px]">Email</span>
                  <p className="font-bold text-brand-dark">{profile?.email || "—"}</p>
                </div>
              </div>

              {/* Motivation */}
              <div>
                <label className="block text-brand-dark font-bold uppercase text-[11px] mb-1">
                  Why do you want to volunteer for this event? *
                </label>
                <textarea
                  required
                  rows={3}
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  placeholder="Explain why you wish to support this specific event and what energy you bring..."
                  className="w-full p-3 rounded-xl bg-white border border-brand-border text-brand-dark text-xs font-body focus:outline-none focus:ring-2 focus:ring-brand-red"
                />
              </div>

              {/* Previous Experience */}
              <div>
                <label className="block text-brand-dark font-bold uppercase text-[11px] mb-1">
                  Relevant Experience (Optional)
                </label>
                <input
                  type="text"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g., Coordinated college hackathon desk, prior volunteer at Tech Fest..."
                  className="w-full p-2.5 rounded-xl bg-white border border-brand-border text-brand-dark text-xs font-body focus:outline-none focus:ring-2 focus:ring-brand-red"
                />
              </div>

              {/* Preferred Responsibilities */}
              <div>
                <label className="block text-brand-dark font-bold uppercase text-[11px] mb-1">
                  Select Preferred Responsibilities *
                </label>
                <div className="space-y-2 mt-1.5">
                  {RESPONSIBILITIES.map((resp) => {
                    const isChecked = preferredResponsibilities.includes(resp.id);
                    return (
                      <div
                        key={resp.id}
                        onClick={() => handleToggleResp(resp.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-colors flex items-start gap-3 ${
                          isChecked
                            ? "bg-brand-red/5 border-brand-red text-brand-dark"
                            : "bg-white border-brand-border text-brand-dark/70 hover:border-brand-dark/30"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 ${
                            isChecked ? "bg-brand-red text-white" : "border border-brand-grey"
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <div className="font-bold text-xs">{resp.label}</div>
                          <div className="text-[11px] text-brand-grey font-body">{resp.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-brand-dark font-bold uppercase text-[11px] mb-1">
                  Availability on Event Day *
                </label>
                <input
                  type="text"
                  required
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-brand-border text-brand-dark text-xs font-body focus:outline-none focus:ring-2 focus:ring-brand-red"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-3 border-t border-brand-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 rounded-xl border border-brand-border text-xs font-mono font-bold hover:bg-brand-bg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-brand-red hover:bg-brand-red/90 text-white text-xs font-mono font-bold uppercase transition-colors flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Submit Application</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-brand-border py-4 text-center text-xs font-mono text-brand-grey">
        COMMUNITY.VA • Volunteer Event Operations & QR Verification Network
      </footer>
    </div>
  );
}
