import { useEffect, useState } from "react";
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
import { listInvestigations } from "../api";

function riskStyle(risk) {
  if (risk === "High Risk") return "bg-red-400/10 text-red-300";
  if (risk === "Needs Review") return "bg-amber-400/10 text-amber-300";
  if (risk === "Verified") return "bg-emerald-400/10 text-emerald-300";
  return "bg-gray-400/10 text-gray-300";
}

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function MyInvestigations() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    listInvestigations()
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError.message);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = items.filter((item) => {
    const company = item.company_name || "Unknown organization";
    const role = item.job_role || "";
    const matchesSearch = `${company} ${role} ${item.public_id}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const risk = item.risk_level || "Insufficient Evidence";
    const matchesFilter = filter === "All" || risk === filter;
    return matchesSearch && matchesFilter;
  });

  const counts = {
    total: items.length,
    high: items.filter((item) => item.risk_level === "High Risk").length,
    review: items.filter((item) => item.risk_level === "Needs Review").length,
    verified: items.filter((item) => item.risk_level === "Verified").length,
  };

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
            <h1 className="text-3xl md:text-4xl font-semibold">My Investigations</h1>
            <p className="text-gray-400 mt-2">Manage and review your recruitment investigations.</p>
          </div>
          <Link
            to="/investigate"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 text-black font-medium px-5 py-3 hover:bg-cyan-300 transition"
          >
            <Plus size={18} />
            New investigation
          </Link>
        </div>

        {error && (
          <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-4 mb-7 text-sm text-red-200">
            {error}
          </div>
        )}

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <FileSearch className="text-cyan-300 mb-4" size={21} />
            <p className="text-3xl font-semibold">{counts.total}</p>
            <p className="text-sm text-gray-400 mt-1">Total investigations</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <ShieldAlert className="text-red-300 mb-4" size={21} />
            <p className="text-3xl font-semibold">{counts.high}</p>
            <p className="text-sm text-gray-400 mt-1">High risk</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <Clock className="text-amber-300 mb-4" size={21} />
            <p className="text-3xl font-semibold">{counts.review}</p>
            <p className="text-sm text-gray-400 mt-1">Needs review</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <ShieldCheck className="text-emerald-300 mb-4" size={21} />
            <p className="text-3xl font-semibold">{counts.verified}</p>
            <p className="text-sm text-gray-400 mt-1">Verified</p>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold">All investigations</h2>
              <p className="text-sm text-gray-400 mt-1">Records saved by the TrustHire API.</p>
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
            {filtered.map((item) => {
              const risk = item.risk_level || "Insufficient Evidence";
              return (
                <div
                  key={item.public_id}
                  className="rounded-xl border border-white/[0.08] bg-black/20 p-4 hover:border-cyan-400/20 transition"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-white/[0.06] flex items-center justify-center shrink-0">
                        <FileSearch size={20} className="text-cyan-300" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium">{item.company_name || "Unknown organization"}</h3>
                        <p className="text-sm text-gray-400 mt-1">{item.job_role || "Role not specified"}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-3">
                          <span>{item.public_id}</span>
                          <span className="flex items-center gap-1">
                            <CalendarDays size={13} />
                            {formatDate(item.created_at)}
                          </span>
                          <span>{item.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                      <span className={`text-xs px-3 py-1.5 rounded-full ${riskStyle(risk)}`}>{risk}</span>
                      <div className="text-sm text-gray-400 min-w-16">
                        {item.risk_score == null ? "No score" : `${item.risk_score}/100`}
                      </div>
                      <Link
                        to={`/report/${item.public_id}`}
                        className="inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200"
                      >
                        View report
                        <ArrowUpRight size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && !error && (
              <div className="text-center py-12">
                <Search size={28} className="mx-auto text-gray-500 mb-3" />
                <p className="font-medium">No investigations found</p>
                <p className="text-sm text-gray-500 mt-1">
                  {items.length === 0
                    ? "Submit an opportunity to create the first record."
                    : "Try another search term or classification."}
                </p>
              </div>
            )}
          </div>
        </section>

        <p className="text-xs text-gray-500 mt-6">TRUSTHIRE · Your investigation workspace</p>
      </div>
    </main>
  );
}
