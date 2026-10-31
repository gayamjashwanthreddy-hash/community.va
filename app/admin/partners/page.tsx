"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Handshake, Mail, Phone, ExternalLink } from "lucide-react";

interface PartnerEnquiry {
  id: string;
  reference: string;
  organization: string;
  type: string;
  website?: string;
  contactPerson: string;
  email: string;
  mobile: string;
  interest: string;
  message: string;
  status: string;
  date: string;
}

const MOCK_PARTNERS: PartnerEnquiry[] = [
  {
    id: "par-01",
    reference: "CVA-PAR-3912",
    organization: "DevForge Technologies",
    type: "Startup / Tech Venture",
    website: "https://devforge.io",
    contactPerson: "Arun Prasad",
    email: "arun@devforge.io",
    mobile: "+91 98450 77889",
    interest: "Hackathon Challenge Sponsorship",
    message: "We would like to sponsor a cash prize track for AI & DevTools in the upcoming COMMUNITY.VA hackathon and offer interview shortcuts to top 3 teams.",
    status: "PENDING",
    date: "2026-10-30",
  },
  {
    id: "par-02",
    reference: "CVA-PAR-4021",
    organization: "Youth Media Collective",
    type: "Media / Creative Agency",
    website: "https://youthmedia.in",
    contactPerson: "Divya Nambiar",
    email: "divya@youthmedia.in",
    mobile: "+91 97001 22334",
    interest: "Cultural Fest Partnership",
    message: "Proposing official media coverage and podcast interviews for student acoustic artists and poets.",
    status: "UNDER_REVIEW",
    date: "2026-10-31",
  },
];

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<PartnerEnquiry[]>(MOCK_PARTNERS);
  const [search, setSearch] = useState("");

  const filtered = partners.filter(
    (p) =>
      p.organization.toLowerCase().includes(search.toLowerCase()) ||
      p.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      p.interest.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between">
      <header className="bg-brand-dark text-white border-b border-brand-border-dark sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs font-mono text-white/70 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> Admin Console
            </Link>
            <span className="text-white/30">•</span>
            <span className="font-mono text-xs text-white/90 font-bold uppercase">
              Partner Collaborations
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-brand-dark uppercase">
              Partnership & Sponsor Inquiries
            </h1>
            <p className="text-xs sm:text-sm text-brand-dark/70 font-mono mt-0.5">
              Review corporate, startup, and NGO proposals for challenges and event tracks.
            </p>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search partner or track..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-white border border-brand-border text-xs font-mono text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue w-72"
            />
            <Search className="w-4 h-4 text-brand-grey absolute left-3 top-2.5" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((item) => (
            <div key={item.id} className="p-8 rounded-3xl bg-white border border-brand-border shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-brand-bg text-brand-dark border border-brand-border">
                    {item.type}
                  </span>
                  <span className="text-xs font-mono text-brand-grey">{item.date}</span>
                </div>

                <h2 className="font-display text-xl font-bold text-brand-dark uppercase">
                  {item.organization}
                </h2>
                <div className="text-xs font-mono text-brand-blue font-bold mb-4">
                  Track: {item.interest}
                </div>

                <p className="font-body text-xs sm:text-sm text-brand-dark/80 bg-brand-bg p-4 rounded-2xl border border-brand-border leading-relaxed mb-4">
                  “{item.message}”
                </p>

                <div className="space-y-1.5 text-xs font-mono text-brand-grey">
                  <div>Contact: <strong className="text-brand-dark">{item.contactPerson}</strong></div>
                  <div>Email: <a href={`mailto:${item.email}`} className="text-brand-blue hover:underline">{item.email}</a></div>
                  <div>Phone: <strong className="text-brand-dark">{item.mobile}</strong></div>
                  {item.website && (
                    <div>
                      Website:{" "}
                      <a href={item.website} target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline inline-flex items-center gap-1">
                        {item.website} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-brand-border mt-6 flex items-center justify-between">
                <span className="text-[10px] font-mono text-brand-grey uppercase">Ref: {item.reference}</span>
                <a
                  href={`mailto:${item.email}?subject=COMMUNITY.VA Collaboration — ${encodeURIComponent(item.organization)}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-dark hover:bg-black text-white font-mono text-xs font-bold uppercase transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Reply via Email</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-brand-border py-4 text-center text-xs font-mono text-brand-grey">
        COMMUNITY.VA Admin Console
      </footer>
    </div>
  );
}
