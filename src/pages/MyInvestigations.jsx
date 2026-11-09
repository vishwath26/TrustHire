
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  FileSearch,
  ShieldCheck,
  ShieldAlert,
  Clock,
  ArrowUpRight,
  Plus,
  CalendarDays,
} from "lucide-react";

const initialInvestigations = [
  {
    id: "TRH-DEMO-001",
    company: "ABC Technologies",
    role: "Software Development Internship",
    date: "09 Nov 2026",
    risk: "High Risk",
    score: 78,
    status: "Completed",
  },
  {
    id: "TRH-DEMO-002",
    company: "Nova Digital",
    role: "Frontend Developer Intern",
    date: "07 Nov 2026",
    risk: "Needs Review",
    score: 46,
    status: "Under review",
  },
  {
    id: "TRH-DEMO-003",
    company: "FutureWorks",
    role: "Data Analyst Intern",
    date: "04 Nov 2026",
    risk: "Verified",
    score: 12,
    status: "Completed",
  },
  {
    id: "TRH-DEMO-004",
    company: "Unknown Recruiter",
    role: "Work From Home Opportunity",
    date: "02 Nov 2026",
    risk: "Insufficient Evidence",
    score: null,
    status: "Incomplete",
  },
];

function riskStyle(risk) {
  if (risk === "High Risk") return "bg-red-400/10 text-red-300";
  if (risk === "Needs Review") return "bg-amber-400/10 text-amber-300";
  if (risk === "Verified") return "bg-emerald-400/10 text-emerald-300";
  return "bg-gray-400/10 text-gray-300";
}

export default function MyInvestigations() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = initialInvestigations.filter((item) => {
    const matchesSearch =
      `${item.company} ${item.role} ${item.id}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesFilter = filter === "All" || item.risk === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <main className="min-h-screen bg-[#080b14] text-white px-4 py-8 md:px-10">
      <div className="max-w-7xl mx-auto">

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">
          <div>
            <p className="text-sm text-cyan-400 mb-2">INVESTIGATION HISTORY</p>
            <h1 className="text-3xl md:text-4xl font-semibold">
              My Investigations
            </h1>
            <p className="text-gray-400 mt-2">
              Manage and review your recruitment investigations.
            </p>
          </div>

          <Link
            to="/investigate"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 text-black font-medium px-5 py-3 hover:bg-cyan-300 transition"
          >
            <Plus size={18} />
            New investigation
          </Link>
        </div>

        <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-4 mb-7">
          <p className="text-sm text-amber-200 font-medium">
            Demonstration investigation history
          </p>
          <p className="text-sm text-gray-400 mt-1">
            These entries are sample records. Real investigation history will
            be loaded from the backend after authentication and API integration.
          </p>
        </div>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <FileSearch className="text-cyan-300 mb-4" size={21} />
            <p className="text-3xl font-semibold">4</p>
            <p className="text-sm text-gray-400 mt-1">Total investigations</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <ShieldAlert className="text-red-300 mb-4" size={21} />
            <p className="text-3xl font-semibold">1</p>
            <p className="text-sm text-gray-400 mt-1">High risk</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <Clock className="text-amber-300 mb-4" size={21} />
            <p className="text-3xl font-semibold">1</p>
            <p className="text-sm text-gray-400 mt-1">Needs review</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <ShieldCheck className="text-emerald-300 mb-4" size={21} />
            <p className="text-3xl font-semibold">1</p>
            <p className="text-sm text-gray-400 mt-1">Verified</p>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold">All investigations</h2>
              <p className="text-sm text-gray-400 mt-1">
                Browse your previous investigation records.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2 border border-white/10 rounded-xl px-3 py-2.5">
                <Search size={17} className="text-gray-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search investigations..."
                  className="bg-transparent outline-none text-sm w-full sm:w-52 placeholder:text-gray-500"
                />
              </div>

              <div className="flex items-center gap-2 border border-white/10 rounded-xl px-3 py-2.5">
                <SlidersHorizontal size={16} className="text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-transparent outline-none text-sm text-gray-300"
                >
                  <option className="bg-[#101827]" value="All">All classifications</option>
                  <option className="bg-[#101827]" value="High Risk">High Risk</option>
                  <option className="bg-[#101827]" value="Needs Review">Needs Review</option>
                  <option className="bg-[#101827]" value="Verified">Verified</option>
                  <option className="bg-[#101827]" value="Insufficient Evidence">Insufficient Evidence</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-white/[0.08] bg-black/20 p-4 hover:border-cyan-400/20 transition"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-white/[0.06] flex items-center justify-center shrink-0">
                      <FileSearch size={20} className="text-cyan-300" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-medium">{item.company}</h3>
                      <p className="text-sm text-gray-400 mt-1">{item.role}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-3">
                        <span>{item.id}</span>
                        <span className="flex items-center gap-1">
                          <CalendarDays size={13} />
                          {item.date}
                        </span>
                        <span>{item.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                    <span className={`text-xs px-3 py-1.5 rounded-full ${riskStyle(item.risk)}`}>
                      {item.risk}
                    </span>

                    <div className="text-sm text-gray-400 min-w-16">
                      {item.score === null ? "No score" : `${item.score}/100`}
                    </div>

                    <Link
                      to="/report"
                      className="inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200"
                    >
                      View report
                      <ArrowUpRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-12">
                <Search size={28} className="mx-auto text-gray-500 mb-3" />
                <p className="font-medium">No investigations found</p>
                <p className="text-sm text-gray-500 mt-1">
                  Try another search term or classification.
                </p>
              </div>
            )}
          </div>
        </section>

        <p className="text-xs text-gray-500 mt-6">
          TRUSTHIRE · Your investigation workspace
        </p>
      </div>
    </main>
  );
}
