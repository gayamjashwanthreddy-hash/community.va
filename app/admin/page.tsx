"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Users, 
  HandHeart, 
  Building2, 
  Handshake, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  LogOut, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Calendar,
  CreditCard
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface AdminStats {
  totalStudents: number;
  totalVolunteers: number;
  totalColleges: number;
  pendingStudents?: number;
  pendingVolunteers: number;
  pendingColleges: number;
  approvedStudents?: number;
  approvedVolunteers: number;
  approvedColleges: number;
  rejectedApplications: number;
  totalEvents?: number;
  totalEventRegistrations?: number;
  totalEventAttendance?: number;
}

export default function AdminOverviewPage() {
  const router = useRouter();

  const [stats, setStats] = useState<AdminStats>({
    totalStudents: 0,
    totalVolunteers: 0,
    totalColleges: 0,
    pendingStudents: 0,
    pendingVolunteers: 0,
    pendingColleges: 0,
    approvedStudents: 0,
    approvedVolunteers: 0,
    approvedColleges: 0,
    rejectedApplications: 0,
    totalEvents: 0,
    totalEventRegistrations: 0,
    totalEventAttendance: 0,
  });

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/admin/overview");
      if (res.status === 401 || res.status === 403) {
        setErrorMessage("Admin privileges required. Please ensure you are logged in with an administrator account.");
        return;
      }
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      } else {
        setErrorMessage(data.message || "Failed to retrieve real-time statistics from the database.");
      }
    } catch (err) {
      console.error("[Admin Overview Fetch Error]", err);
      setErrorMessage("Network error or database unreachable. Please verify database connectivity.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Logout error", err);
    }
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between">
      
      {/* Admin Header */}
      <header className="bg-brand-dark text-white border-b border-brand-border-dark sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="relative h-8 w-28">
              <Image
                src="/logos/community-va-logo.png"
                alt="COMMUNITY.VA Logo"
                fill
                className="object-contain invert"
                priority
              />
            </Link>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-red text-white font-mono text-[11px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchStats}
              disabled={loading}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Refresh stats"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-mono font-semibold text-white transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Nav Sub-bar */}
      <div className="bg-white border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto py-2.5 no-scrollbar">
          <Link
            href="/admin"
            className="px-3.5 py-1.5 rounded-full bg-brand-dark text-white text-xs font-mono font-bold uppercase tracking-wider"
          >
            Overview
          </Link>
          <Link
            href="/admin/events"
            className="px-3.5 py-1.5 rounded-full hover:bg-brand-bg text-brand-dark/80 text-xs font-mono font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-brand-red" />
            <span>Events Management</span>
          </Link>
          <Link
            href="/admin/volunteers"
            className="px-3.5 py-1.5 rounded-full hover:bg-brand-bg text-brand-dark/80 text-xs font-mono font-semibold uppercase tracking-wider transition-colors"
          >
            Volunteers ({stats.pendingVolunteers} pending)
          </Link>
          <Link
            href="/admin/colleges"
            className="px-3.5 py-1.5 rounded-full hover:bg-brand-bg text-brand-dark/80 text-xs font-mono font-semibold uppercase tracking-wider transition-colors"
          >
            Colleges ({stats.pendingColleges} pending)
          </Link>
          <Link
            href="/admin/students"
            className="px-3.5 py-1.5 rounded-full hover:bg-brand-bg text-brand-dark/80 text-xs font-mono font-semibold uppercase tracking-wider transition-colors"
          >
            Students ({stats.totalStudents})
          </Link>
          <Link
            href="/admin/partners"
            className="px-3.5 py-1.5 rounded-full hover:bg-brand-bg text-brand-dark/80 text-xs font-mono font-semibold uppercase tracking-wider transition-colors"
          >
            Partners
          </Link>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        
        <div className="mb-8">
          <span className="text-xs font-mono font-bold tracking-widest text-brand-blue uppercase">
            Community Management Suite
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-brand-dark uppercase tracking-tight mt-1">
            System Administration Overview
          </h1>
          <p className="font-body text-sm text-brand-dark/70 mt-1">
            Real-time counts, volunteer divisions, institutional verifications, and audit history.
          </p>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-sm font-mono">{errorMessage}</p>
            </div>
            <button
              onClick={fetchStats}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-mono font-bold uppercase transition-colors shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* Primary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          
          <div className="p-6 rounded-3xl bg-white border border-brand-border shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-brand-grey uppercase font-bold">Total Students</span>
              <div className="p-2 rounded-xl bg-brand-blue-light text-brand-blue">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="font-display text-4xl font-extrabold text-brand-dark">
              {stats.totalStudents}
            </div>
            <p className="text-xs font-mono text-brand-grey mt-2">Active student members</p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-brand-border shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-brand-grey uppercase font-bold">Volunteer Team</span>
              <div className="p-2 rounded-xl bg-brand-red-light text-brand-red">
                <HandHeart className="w-5 h-5" />
              </div>
            </div>
            <div className="font-display text-4xl font-extrabold text-brand-dark">
              {stats.totalVolunteers}
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs font-mono">
              <span className="text-amber-600 font-bold">{stats.pendingVolunteers} Pending</span>
              <span className="text-brand-grey">•</span>
              <span className="text-emerald-700 font-bold">{stats.approvedVolunteers} Approved</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-brand-border shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-brand-grey uppercase font-bold">Colleges Registered</span>
              <div className="p-2 rounded-xl bg-brand-bg border border-brand-border text-brand-dark">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div className="font-display text-4xl font-extrabold text-brand-dark">
              {stats.totalColleges}
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs font-mono">
              <span className="text-amber-600 font-bold">{stats.pendingColleges} Pending</span>
              <span className="text-brand-grey">•</span>
              <span className="text-emerald-700 font-bold">{stats.approvedColleges} Verified</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-brand-border shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-brand-grey uppercase font-bold">Rejected Applications</span>
              <div className="p-2 rounded-xl bg-red-50 text-red-600">
                <XCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="font-display text-4xl font-extrabold text-brand-dark">
              {stats.rejectedApplications}
            </div>
            <p className="text-xs font-mono text-brand-grey mt-2">Recorded with rejection reasons</p>
          </div>

        </div>

        {/* Action Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="p-8 rounded-3xl bg-white border border-brand-border shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-brand-red-light text-brand-red">
                  Active Queue: {stats.pendingVolunteers}
                </span>
                <HandHeart className="w-5 h-5 text-brand-red" />
              </div>

              <h2 className="font-display text-2xl font-extrabold text-brand-dark uppercase mb-2">
                Volunteer Applications Review
              </h2>
              <p className="font-body text-sm text-brand-dark/75 leading-relaxed mb-6">
                Review applicant skills, assign volunteer divisions (Operations, Technical, Media, PR), add internal notes, and approve or reject candidates with automated email updates.
              </p>
            </div>

            <Link
              href="/admin/volunteers"
              className="inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-brand-red text-white font-display text-xs font-bold uppercase tracking-wider hover:bg-brand-red-hover transition-colors"
            >
              <span>Manage Volunteer Applications</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-brand-border shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-brand-bg border border-brand-border text-brand-dark">
                  Active Queue: {stats.pendingColleges}
                </span>
                <Building2 className="w-5 h-5 text-brand-dark" />
              </div>

              <h2 className="font-display text-2xl font-extrabold text-brand-dark uppercase mb-2">
                College Verifications & Chapters
              </h2>
              <p className="font-body text-sm text-brand-dark/75 leading-relaxed mb-6">
                Verify institution authority, review collaboration areas (Hackathons, Workshops, Sports, Chapters), and approve official campus participation.
              </p>
            </div>

            <Link
              href="/admin/colleges"
              className="inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-brand-dark text-white font-display text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
            >
              <span>Manage College Verifications</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Events Management Card */}
          <div className="p-8 rounded-3xl bg-white border border-brand-border shadow-xs flex flex-col justify-between md:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-brand-blue/10 text-brand-blue">
                  Core Operations: Event Lifecycle & QR Passes
                </span>
                <h2 className="font-display text-2xl font-extrabold text-brand-dark uppercase mt-2">
                  Event Management, Dynamic Forms, QR Passes & Live Attendance
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-mono text-brand-dark/70">
                  <span className="font-bold text-brand-blue">{stats.totalEvents || 0} Active Events</span>
                  <span>•</span>
                  <span className="font-bold text-brand-dark">{stats.totalEventRegistrations || 0} Registrations</span>
                  <span>•</span>
                  <span className="font-bold text-emerald-700">{stats.totalEventAttendance || 0} Checked In</span>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-neutral-100 text-brand-dark self-start">
                <Calendar className="w-6 h-6 text-brand-blue" />
              </div>
            </div>

            <p className="font-body text-sm text-brand-dark/75 leading-relaxed mb-6 max-w-3xl">
              Create and publish hackathons, masterclasses, and open mics; build dynamic custom registration questions; upload official payment QR codes; review participant submissions; and verify manual UPI payment proof screenshots.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/admin/events"
                className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-brand-blue text-white font-display text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition-colors shadow-sm"
              >
                <span>Open Events Console</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/admin/events/create"
                className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full border border-brand-border text-brand-dark font-display text-xs font-bold uppercase tracking-wider hover:bg-neutral-50 transition-colors"
              >
                <span>Create New Event</span>
              </Link>
            </div>
          </div>

        </div>

      </main>

      <footer className="border-t border-brand-border py-6 text-center text-xs font-mono text-brand-grey">
        © 2026 COMMUNITY.VA Administration • Hyderabad, India
      </footer>
    </div>
  );
}
