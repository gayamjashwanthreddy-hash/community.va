"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ArrowRight, 
  Search, 
  Filter, 
  Tag, 
  CheckCircle2, 
  Users, 
  Sparkles,
  Ticket
} from "lucide-react";
import CinematicNavbar from "@/components/motion/CinematicNavbar";
import { EventItem } from "@/lib/events/types";
import { OFFICIAL_COMMUNITY_EMAIL, OFFICIAL_MAILTO_LINK } from "@/lib/constants";

const CATEGORIES = [
  "ALL",
  "Technology & Innovation",
  "Personal Development",
  "Events & Entertainment",
  "Sports & Activities",
  "Career & Opportunities",
];

export default function PublicEventsListingPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadPublishedEvents() {
      setLoading(true);
      try {
        const res = await fetch(`/api/events?public=true&category=${selectedCategory}&search=${encodeURIComponent(search)}`);
        const data = await res.json();
        if (data.success && data.events) {
          setEvents(data.events);
        }
      } catch (err) {
        console.error("Failed to load events", err);
      } finally {
        setLoading(false);
      }
    }

    loadPublishedEvents();
  }, [selectedCategory, search]);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-dark flex flex-col justify-between selection:bg-brand-blue selection:text-white">
      {/* Persistent Brand Navigation */}
      <CinematicNavbar />

      {/* Hero Header Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 border-b border-brand-border bg-gradient-to-b from-brand-bg to-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold tracking-widest uppercase bg-brand-red text-white">
              Hyderabad Youth Calendar 2026
            </span>
            <span className="text-xs font-mono text-brand-muted uppercase">
              • Official Community Gatherings
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-brand-dark max-w-4xl leading-[1.05]">
            Events, Hackathons & Masterclasses
          </h1>
          <p className="mt-4 text-base sm:text-lg text-brand-muted max-w-2xl font-medium leading-relaxed">
            Discover upcoming hackathons, leadership workshops, open mics, and networking summits organized by COMMUNITY.VA across Hyderabad.
          </p>

          {/* Search & Filter Pills */}
          <div className="mt-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Category tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-mono font-bold tracking-wider uppercase whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? "bg-brand-dark text-white shadow-sm"
                      : "bg-white border border-brand-border text-brand-dark/70 hover:bg-neutral-100 hover:text-brand-dark"
                  }`}
                >
                  {cat === "ALL" ? "All Categories" : cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events or venue..."
                className="w-full pl-9 pr-4 py-2 text-xs border border-brand-border rounded-full bg-white outline-none focus:border-brand-dark"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-1">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs font-mono uppercase tracking-wider text-brand-muted">
              Loading active community events...
            </p>
          </div>
        ) : events.length === 0 ? (
          <div className="py-24 text-center max-w-md mx-auto">
            <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-brand-dark">No Events Found</h3>
            <p className="text-xs text-brand-muted mt-1 leading-relaxed">
              There are currently no published events matching your selected category. Check back soon or select another category above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((evt) => {
              const startDate = new Date(evt.event_start);
              const formattedDate = startDate.toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              const formattedTime = startDate.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={evt.id}
                  className="group bg-white rounded-2xl border border-brand-border hover:border-brand-dark overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-xs hover:shadow-xl"
                >
                  <div>
                    {/* Event Cover Image */}
                    <div className="relative h-52 w-full bg-neutral-100 overflow-hidden">
                      {evt.cover_image_path ? (
                        <Image
                          src={evt.cover_image_path}
                          alt={evt.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-white font-mono text-xs uppercase tracking-widest font-bold">
                          COMMUNITY.VA
                        </div>
                      )}

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-black/75 backdrop-blur-md text-white">
                          {evt.category}
                        </span>

                        {evt.is_paid ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-extrabold bg-brand-red text-white shadow-sm">
                            ₹{evt.fee_amount}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-extrabold bg-emerald-600 text-white shadow-sm">
                            FREE ENTRY
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Event Details Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-xs font-mono text-brand-muted mb-2">
                        <Calendar className="w-3.5 h-3.5 text-brand-blue" />
                        <span>{formattedDate}</span>
                        <span>•</span>
                        <Clock className="w-3.5 h-3.5 text-brand-muted" />
                        <span>{formattedTime}</span>
                      </div>

                      <h2 className="text-xl font-extrabold text-brand-dark group-hover:text-brand-blue transition-colors leading-tight mb-2">
                        {evt.title}
                      </h2>

                      <p className="text-xs text-brand-muted line-clamp-2 leading-relaxed mb-4">
                        {evt.description}
                      </p>

                      <div className="flex items-start gap-2 text-xs text-brand-dark/80 pt-3 border-t border-brand-border">
                        <MapPin className="w-3.5 h-3.5 text-brand-red flex-shrink-0 mt-0.5" />
                        <span className="truncate font-medium">{evt.venue}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="p-6 pt-0">
                    <Link
                      href={`/events/${evt.slug}`}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-dark text-white font-display text-xs font-extrabold uppercase tracking-wider group-hover:bg-brand-blue transition-colors shadow-sm"
                    >
                      <Ticket className="w-4 h-4" />
                      <span>Register for Event</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Community Footer */}
      <footer className="bg-brand-dark text-white border-t border-brand-border-dark py-12 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative h-8 w-28">
              <Image
                src="/logos/community-va-logo.png"
                alt="COMMUNITY.VA Logo"
                fill
                className="object-contain invert"
              />
            </div>
            <span className="text-xs font-mono text-neutral-400">
              Connecting People • Creating Opportunities — Hyderabad
            </span>
          </div>

          <div className="text-xs font-mono text-neutral-500">
            Official Contact: <a href={OFFICIAL_MAILTO_LINK} className="text-white hover:underline">{OFFICIAL_COMMUNITY_EMAIL}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
