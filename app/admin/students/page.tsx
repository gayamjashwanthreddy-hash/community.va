"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Users, Tag, CheckCircle2, Clock } from "lucide-react";

interface StudentRecord {
  id: string;
  reference: string;
  name: string;
  email: string;
  mobile: string;
  college: string;
  branch: string;
  year: string;
  city: string;
  interests: string[];
  status: string;
  date: string;
}

const MOCK_STUDENTS: StudentRecord[] = [
  {
    id: "stu-01",
    reference: "CVA-STU-8821",
    name: "Rahul Sharma",
    email: "rahul.sharma@gmail.com",
    mobile: "+91 98765 43210",
    college: "Osmania University College of Engineering",
    branch: "Computer Science & Engineering",
    year: "2nd Year",
    city: "Hyderabad",
    interests: ["Hackathons & Coding", "Artificial Intelligence & ML", "Public Speaking"],
    status: "APPROVED",
    date: "2026-10-24",
  },
  {
    id: "stu-02",
    reference: "CVA-STU-9104",
    name: "Sneha Reddy",
    email: "sneha.reddy@jntuh.ac.in",
    mobile: "+91 99123 44556",
    college: "JNTU Hyderabad College of Engineering",
    branch: "Information Technology",
    year: "3rd Year",
    city: "Hyderabad",
    interests: ["Web & App Development", "Music & Singing", "Sports & Tournaments"],
    status: "APPROVED",
    date: "2026-10-27",
  },
  {
    id: "stu-03",
    reference: "CVA-STU-9452",
    name: "Karthik Verma",
    email: "karthik.v@gmail.com",
    mobile: "+91 98490 12345",
    college: "VNR VJIET",
    branch: "Mechanical Engineering",
    year: "1st Year",
    city: "Hyderabad",
    interests: ["Leadership & Management", "Open Mic & Poetry"],
    status: "PENDING",
    date: "2026-10-31",
  },
];

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentRecord[]>(MOCK_STUDENTS);
  const [search, setSearch] = useState("");

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.college.toLowerCase().includes(search.toLowerCase())
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
            <span className="font-mono text-xs text-brand-blue font-bold uppercase">
              Student Directory
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-brand-dark uppercase">
              Registered Student Members
            </h1>
            <p className="text-xs sm:text-sm text-brand-dark/70 font-mono mt-0.5">
              Browse student participants across campuses and track interests.
            </p>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search student or campus..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-white border border-brand-border text-xs font-mono text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue w-72"
            />
            <Search className="w-4 h-4 text-brand-grey absolute left-3 top-2.5" />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-brand-border overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-brand-bg border-b border-brand-border text-brand-grey uppercase">
                <tr>
                  <th className="py-3.5 px-6 font-bold">Student</th>
                  <th className="py-3.5 px-6 font-bold">Campus & Branch</th>
                  <th className="py-3.5 px-6 font-bold">Areas of Interest</th>
                  <th className="py-3.5 px-6 font-bold">Status</th>
                  <th className="py-3.5 px-6 font-bold">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {filtered.map((stu) => (
                  <tr key={stu.id} className="hover:bg-brand-bg/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-brand-dark text-sm">{stu.name}</div>
                      <div className="text-brand-grey">{stu.email} • {stu.mobile}</div>
                      <div className="text-[10px] text-brand-grey">{stu.reference}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-brand-dark font-medium">{stu.college}</div>
                      <div className="text-brand-grey">{stu.branch} ({stu.year})</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {stu.interests.map((int) => (
                          <span key={int} className="px-2 py-0.5 rounded bg-brand-bg border border-brand-border text-[10px]">
                            {int}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${stu.status === "APPROVED" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                        {stu.status === "APPROVED" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        <span>{stu.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-brand-grey">
                      {stu.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <footer className="border-t border-brand-border py-4 text-center text-xs font-mono text-brand-grey">
        COMMUNITY.VA Admin Console
      </footer>
    </div>
  );
}
