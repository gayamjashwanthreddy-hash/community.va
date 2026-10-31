"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  Users, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MoreVertical, 
  Edit, 
  Trash2, 
  ArrowLeft, 
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Eye,
  FileSpreadsheet,
  AlertTriangle
} from "lucide-react";
import { EventItem, EventStatus } from "@/lib/events/types";

export default function AdminEventsListPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  // Deletion modal state
  const [deleteEventTarget, setDeleteEventTarget] = useState<EventItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events?status=${statusFilter}&category=${categoryFilter}&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success && data.events) {
        setEvents(data.events);
      }
    } catch (err) {
      console.error("Failed to load events", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [statusFilter, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEvents();
  };

  const handleQuickStatusChange = async (eventId: string, newStatus: EventStatus) => {
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventData: { status: newStatus } }),
      });
      const data = await res.json();
      if (data.success) {
        fetchEvents();
      }
    } catch (err) {
      console.error("Status update error", err);
    }
  };

  const confirmDelete = async () => {
    if (!deleteEventTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/events/${deleteEventTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setDeleteEventTarget(null);
        fetchEvents();
      }
    } catch (err) {
      console.error("Delete error", err);
    } finally {
      setDeleting(false);
    }
  };

  // Compute aggregate metrics
  const totalEvents = events.length;
  const publishedEvents = events.filter(e => e.status === "PUBLISHED").length;
  const totalRegistrations = events.reduce((acc, e) => acc + (e.registration_count || 0), 0);
  const totalPendingPayments = events.reduce((acc, e) => acc + (e.pending_payments_count || 0), 0);

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between">
      {/* Top Header */}
      <header className="bg-brand-dark text-white border-b border-brand-border-dark sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="relative h-8 w-28">
              <Image
                src="/logos/community-va-logo.png"
                alt="COMMUNITY.VA Logo"
                fill
                className="object-contain invert"
                priority
              />
            </Link>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-blue text-white font-mono text-[11px] font-bold uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5" />
              <span>Events Management</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Admin Overview</span>
            </Link>

            <Link
              href="/admin/events/create"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-brand-red text-white text-xs font-bold hover:bg-red-700 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Event</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Breadcrumb & Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-brand-muted mb-1">
              <Link href="/admin" className="hover:underline">Admin Console</Link>
              <span>/</span>
              <span className="text-brand-dark font-bold">Event Management</span>
            </div>
            <h1 className="text-3xl font-extrabold text-brand-dark tracking-tight">
              Community Events & Workshops
            </h1>
            <p className="text-sm text-brand-muted mt-1">
              Publish events, configure dynamic registration questions, review participant submissions, and verify manual UPI payment proofs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchEvents}
              className="p-2 rounded-md border border-brand-border bg-white text-brand-dark hover:bg-neutral-50 transition-colors"
              title="Refresh events"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <Link
              href="/events"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-brand-border bg-white text-xs font-bold text-brand-dark hover:bg-neutral-50 transition-colors"
            >
              <span>Public Events Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/admin/events/create"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-brand-dark text-white text-xs font-bold hover:bg-black transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Event</span>
            </Link>
          </div>
        </div>

        {/* Stats KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-brand-border shadow-sm">
            <div className="flex items-center justify-between text-brand-muted text-xs font-bold uppercase tracking-wider mb-2">
              <span>Total Events</span>
              <Calendar className="w-4 h-4 text-brand-dark" />
            </div>
            <div className="text-2xl font-extrabold text-brand-dark">{totalEvents}</div>
            <div className="text-xs text-brand-muted mt-1">{publishedEvents} Active & Published</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-brand-border shadow-sm">
            <div className="flex items-center justify-between text-brand-muted text-xs font-bold uppercase tracking-wider mb-2">
              <span>Total Registrations</span>
              <Users className="w-4 h-4 text-brand-blue" />
            </div>
            <div className="text-2xl font-extrabold text-brand-blue">{totalRegistrations}</div>
            <div className="text-xs text-brand-muted mt-1">Across all published cycles</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-brand-border shadow-sm">
            <div className="flex items-center justify-between text-brand-muted text-xs font-bold uppercase tracking-wider mb-2">
              <span>Pending Payments</span>
              <CreditCard className="w-4 h-4 text-brand-red" />
            </div>
            <div className="text-2xl font-extrabold text-brand-red">{totalPendingPayments}</div>
            <div className="text-xs text-brand-muted mt-1">Awaiting manual UPI screenshot review</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-brand-border shadow-sm">
            <div className="flex items-center justify-between text-brand-muted text-xs font-bold uppercase tracking-wider mb-2">
              <span>Active Venue</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-bold text-brand-dark truncate">Hyderabad, IN</div>
            <div className="text-xs text-brand-muted mt-1">T-Hub, Ravindra Bharathi, Lamakaan</div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-brand-border shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events by title or venue..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-brand-border rounded-lg outline-none focus:border-brand-dark"
            />
          </form>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-brand-muted font-bold uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5" />
              <span>Status:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-medium border border-brand-border rounded-lg px-2.5 py-2 bg-white outline-none focus:border-brand-dark"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published Only</option>
              <option value="DRAFT">Draft</option>
              <option value="REGISTRATION_CLOSED">Registration Closed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs font-medium border border-brand-border rounded-lg px-2.5 py-2 bg-white outline-none focus:border-brand-dark"
            >
              <option value="ALL">All Categories</option>
              <option value="Technology & Innovation">Technology & Innovation</option>
              <option value="Personal Development">Personal Development</option>
              <option value="Events & Entertainment">Events & Entertainment</option>
              <option value="Sports & Activities">Sports & Activities</option>
              <option value="Career & Opportunities">Career & Opportunities</option>
            </select>
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-white rounded-xl border border-brand-border shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-blue mb-3" />
              <p className="text-xs font-mono uppercase tracking-wider text-brand-muted">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="py-16 text-center px-4">
              <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-brand-dark">No Events Found</h3>
              <p className="text-xs text-brand-muted mt-1 max-w-sm mx-auto">
                No events matched your current search filters. Create a new event or adjust the filters above.
              </p>
              <Link
                href="/admin/events/create"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-brand-dark text-white text-xs font-bold hover:bg-black transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Event</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50 border-b border-brand-border text-brand-muted font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Event Details</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Schedule & Venue</th>
                    <th className="py-3 px-4">Fee & Type</th>
                    <th className="py-3 px-4">Registrations</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {events.map((evt) => {
                    const isPublished = evt.status === "PUBLISHED";
                    const isClosed = evt.status === "REGISTRATION_CLOSED";
                    const isDraft = evt.status === "DRAFT";

                    return (
                      <tr key={evt.id} className="hover:bg-neutral-50/60 transition-colors">
                        {/* Event Title & Cover */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-neutral-100 overflow-hidden relative flex-shrink-0 border border-brand-border">
                              {evt.cover_image_path ? (
                                <Image
                                  src={evt.cover_image_path}
                                  alt={evt.title}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                  <Calendar className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 max-w-xs">
                              <Link
                                href={`/admin/events/${evt.id}/edit`}
                                className="font-bold text-brand-dark hover:text-brand-blue truncate block"
                              >
                                {evt.title}
                              </Link>
                              <div className="text-[11px] text-brand-muted truncate mt-0.5">
                                Organizer: {evt.organizer}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 text-neutral-700">
                            {evt.category}
                          </span>
                        </td>

                        {/* Schedule & Venue */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="font-medium text-brand-dark">
                            {new Date(evt.event_start).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                          </div>
                          <div className="text-[11px] text-brand-muted truncate max-w-[180px]">
                            {evt.venue}
                          </div>
                        </td>

                        {/* Fee */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          {evt.is_paid ? (
                            <div>
                              <span className="font-bold text-brand-dark font-mono">₹{evt.fee_amount}</span>
                              <span className="text-[10px] text-brand-red ml-1 font-bold uppercase">Paid</span>
                            </div>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 font-mono">
                              Free Event
                            </span>
                          )}
                        </td>

                        {/* Registrations count */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-bold text-brand-dark font-mono">
                            <Users className="w-3.5 h-3.5 text-brand-blue" />
                            <span>{evt.registration_count || 0} / {evt.capacity}</span>
                          </div>
                          {evt.is_paid && (evt.pending_payments_count || 0) > 0 && (
                            <span className="text-[10px] text-brand-red font-bold">
                              {evt.pending_payments_count} pending payment proof
                            </span>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                            isPublished
                              ? "bg-emerald-100 text-emerald-800"
                              : isDraft
                                ? "bg-amber-100 text-amber-800"
                                : isClosed
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-neutral-200 text-neutral-700"
                          }`}>
                            {evt.status.replace("_", " ")}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {/* View Registrations */}
                            <Link
                              href={`/admin/events/${evt.id}/registrations`}
                              className="px-2.5 py-1 text-xs font-semibold rounded border border-brand-border hover:bg-neutral-100 text-brand-dark flex items-center gap-1"
                              title="View Registrations & Payments"
                            >
                              <Users className="w-3 h-3 text-brand-blue" />
                              <span>Participants</span>
                            </Link>

                            {/* Edit Event */}
                            <Link
                              href={`/admin/events/${evt.id}/edit`}
                              className="p-1.5 rounded hover:bg-neutral-100 text-neutral-600 transition-colors"
                              title="Edit Event & Questions"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>

                            {/* Quick status publish toggle */}
                            {isDraft ? (
                              <button
                                onClick={() => handleQuickStatusChange(evt.id, "PUBLISHED")}
                                className="px-2 py-1 text-[11px] font-bold rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                              >
                                Publish
                              </button>
                            ) : isPublished ? (
                              <button
                                onClick={() => handleQuickStatusChange(evt.id, "REGISTRATION_CLOSED")}
                                className="px-2 py-1 text-[11px] font-bold rounded border border-brand-border text-neutral-600 hover:bg-neutral-100 transition-colors"
                              >
                                Close Reg
                              </button>
                            ) : isClosed ? (
                              <button
                                onClick={() => handleQuickStatusChange(evt.id, "PUBLISHED")}
                                className="px-2 py-1 text-[11px] font-bold rounded bg-brand-blue text-white hover:bg-blue-700 transition-colors"
                              >
                                Reopen
                              </button>
                            ) : null}

                            {/* Delete Button */}
                            <button
                              onClick={() => setDeleteEventTarget(evt)}
                              className="p-1.5 rounded hover:bg-red-50 text-red-600 transition-colors"
                              title="Archive / Delete Event"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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

      {/* Confirmation Dialog for Soft Delete */}
      {deleteEventTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-brand-border animate-scaleUp">
            <div className="flex items-center gap-3 text-brand-red mb-3">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="text-lg font-bold text-brand-dark">Archive Event?</h3>
            </div>
            <p className="text-xs text-brand-muted leading-relaxed mb-4">
              Are you sure you want to archive <strong>{deleteEventTarget.title}</strong>?
              This will unpublish the event from the public website. Existing participant registrations, payment records, and verification histories will be safely preserved.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-border">
              <button
                type="button"
                onClick={() => setDeleteEventTarget(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-brand-border text-brand-dark hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-brand-red text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Archiving..." : "Yes, Archive Event"}
              </button>
            </div>
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
