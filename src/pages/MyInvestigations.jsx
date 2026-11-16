
import { useEffect, useMemo, useState } from "react";
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
  Activity,
  AlertCircle,
  CircleDashed,
  ClipboardList,
} from "lucide-react";
import { listInvestigations } from "../api";

function riskStyle(risk) {
  if (risk === "High Risk")
    return "border-red-400/20 bg-red-400/[0.08] text-red-300";

  if (risk === "Needs Review")
    return "border-amber-400/20 bg-amber-400/[0.08] text-amber-300";

  if (risk === "Verified")
    return "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300";

  return "border-white/10 bg-white/[0.04] text-gray-400";
}

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const panel =
  "rounded-2xl border border-emerald-400/[0.12] bg-[#111B17]/80 shadow-lg shadow-black/10 backdrop-blur-xl";

const mutedText = "text-[#91A39A]";

export default function MyInvestigations() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadInvestigations() {
      try {
        setLoading(true);
        setError("");

        const data = await listInvestigations();

        if (!cancelled) setItems(data);
      } catch (loadError) {
        if (!cancelled) setError(loadError.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadInvestigations();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const company = item.company_name || "Unknown organization";
      const role = item.job_role || "";
      const matchesSearch = `${company} ${role} ${item.public_id}`
        .toLowerCase()
        .includes(search.toLowerCase());

      const risk = item.risk_level || "Insufficient Evidence";
      const matchesFilter = filter === "All" || risk === filter;

      return matchesSearch && matchesFilter;
    });
  }, [items, search, filter]);

  const counts = {
    total: items.length,
    high: items.filter((item) => item.risk_level === "High Risk").length,
    review: items.filter((item) => item.risk_level === "Needs Review").length,
    verified: items.filter((item) => item.risk_level === "Verified").length,
  };

  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-8 text-white md:px-10">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 right-0 h-[450px] w-[450px] rounded-full bg-emerald-500/[0.06] blur-[140px]" />
        <div className="absolute bottom-0 left-0 h-[350px] w-[350px] rounded-full bg-green-500/[0.04] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">

        {/* Header */}
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] pb-6">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-[#91A39A] transition hover:text-emerald-400"
            >
              <ArrowLeft size={16} />
              Back to dashboard
            </Link>
          </div>

          <Link
            to="/investigate"
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/25 bg-emerald-400/[0.07] px-5 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/[0.15]"
          >
            <Plus size={17} />
            New investigation
          </Link>
        </header>

        {/* Page title */}
        <section className="mb-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-2 text-xs font-semibold tracking-widest text-emerald-400">
            <ClipboardList size={15} />
            INVESTIGATION HISTORY
          </div>

          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
            My Investigations
          </h1>

          <p className={`${mutedText} mt-3 max-w-2xl leading-7`}>
            Manage, search and review your recruitment investigations.
            Keep track of findings and risk classifications in one place.
          </p>
        </section>

        {/* Error message */}
        {error && (
          <div className="mb-7 flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/[0.07] p-4 text-sm text-red-300">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {/* Statistics */}
        <section className="mb-9 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <div className={`${panel} p-5 transition hover:border-emerald-400/25`}>
            <div className="flex items-center justify-between">
              <p className={`${mutedText} text-sm`}>Total investigations</p>
              <FileSearch size={21} className="text-emerald-400" />
            </div>
            <h2 className="mt-5 text-3xl font-bold tabular-nums">
              {counts.total}
            </h2>
            <p className="mt-2 text-xs text-[#718078]">
              All saved records
            </p>
          </div>

          <div className={`${panel} p-5 transition hover:border-red-400/25`}>
            <div className="flex items-center justify-between">
              <p className={`${mutedText} text-sm`}>High risk</p>
              <ShieldAlert size={21} className="text-red-400" />
            </div>
            <h2 className="mt-5 text-3xl font-bold tabular-nums">
              {counts.high}
            </h2>
            <p className="mt-2 text-xs text-[#718078]">
              High-risk classifications
            </p>
          </div>

          <div className={`${panel} p-5 transition hover:border-amber-400/25`}>
            <div className="flex items-center justify-between">
              <p className={`${mutedText} text-sm`}>Needs review</p>
              <Clock size={21} className="text-amber-400" />
            </div>
            <h2 className="mt-5 text-3xl font-bold tabular-nums">
              {counts.review}
            </h2>
            <p className="mt-2 text-xs text-[#718078]">
              Requires further attention
            </p>
          </div>

          <div className={`${panel} p-5 transition hover:border-emerald-400/25`}>
            <div className="flex items-center justify-between">
              <p className={`${mutedText} text-sm`}>Verified</p>
              <ShieldCheck size={21} className="text-emerald-400" />
            </div>
            <h2 className="mt-5 text-3xl font-bold tabular-nums">
              {counts.verified}
            </h2>
            <p className="mt-2 text-xs text-[#718078]">
              Verified classifications
            </p>
          </div>
        </section>

        {/* Investigation list */}
        <section className={`${panel} p-5 md:p-7`}>

          {/* List heading */}
          <div className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Activity size={19} className="text-emerald-400" />
                <h2 className="text-xl font-bold">
                  All investigations
                </h2>
              </div>

              <p className={`${mutedText} mt-2 text-sm`}>
                Records saved by the TRUSTHIRE platform.
              </p>
            </div>

            {/* Search and filter */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex min-w-0 items-center gap-3 rounded-lg border border-white/[0.09] bg-[#080D0B]/70 px-4 py-3 transition focus-within:border-emerald-400/40 sm:w-64">
                <Search size={17} className="shrink-0 text-[#718078]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search investigations..."
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#718078]"
                />
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-white/[0.09] bg-[#080D0B]/70 px-4 py-3 transition focus-within:border-emerald-400/40">
                <SlidersHorizontal size={17} className="shrink-0 text-emerald-400" />

                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full cursor-pointer bg-transparent text-sm text-[#C4D0C9] outline-none"
                >
                  <option className="bg-[#111B17]" value="All">
                    All classifications
                  </option>
                  <option className="bg-[#111B17]" value="High Risk">
                    High Risk
                  </option>
                  <option className="bg-[#111B17]" value="Needs Review">
                    Needs Review
                  </option>
                  <option className="bg-[#111B17]" value="Verified">
                    Verified
                  </option>
                  <option className="bg-[#111B17]" value="Insufficient Evidence">
                    Insufficient Evidence
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="mb-4 flex items-center justify-between border-b border-white/[0.07] pb-4">
            <p className="text-xs font-semibold tracking-widest text-[#718078]">
              INVESTIGATION RECORDS
            </p>

            <span className="text-xs text-emerald-400">
              {filtered.length} {filtered.length === 1 ? "RESULT" : "RESULTS"}
            </span>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center gap-3 py-16">
              <CircleDashed size={21} className="animate-spin text-emerald-400" />
              <p className={`${mutedText} text-sm`}>
                Loading investigations...
              </p>
            </div>
          )}

          {/* Records */}
          {!loading && (
            <div className="space-y-3">
              {filtered.map((item) => {
                const risk = item.risk_level || "Insufficient Evidence";

                return (
                  <article
                    key={item.public_id}
                    className="rounded-xl border border-white/[0.07] bg-[#080D0B]/45 p-5 transition duration-200 hover:border-emerald-400/25 hover:bg-[#142019]/70"
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                      {/* Investigation details */}
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="shrink-0 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.08] p-3">
                          <FileSearch size={22} className="text-emerald-400" />
                        </div>

                        <div className="min-w-0">
                          <h3 className="break-words text-base font-semibold text-white">
                            {item.company_name || "Unknown organization"}
                          </h3>

                          <p className={`${mutedText} mt-1 text-sm`}>
                            {item.job_role || "Role not specified"}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#718078]">
                            <span className="break-all">
                              {item.public_id}
                            </span>

                            <span className="flex items-center gap-1.5">
                              <CalendarDays size={13} />
                              {formatDate(item.created_at)}
                            </span>

                            <span className="rounded-md border border-white/[0.07] bg-white/[0.03] px-2 py-1">
                              {item.status || "Unknown status"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Risk and report */}
                      <div className="flex flex-wrap items-center gap-4 xl:justify-end">
                        <span
                          className={`rounded-md border px-3 py-2 text-xs font-medium ${riskStyle(risk)}`}
                        >
                          {risk}
                        </span>

                        <div className="min-w-16">
                          <p className="text-[10px] tracking-widest text-[#718078]">
                            RISK SCORE
                          </p>
                          <p className="mt-1 text-sm font-semibold tabular-nums text-[#C4D0C9]">
                            {item.risk_score == null
                              ? "No score"
                              : `${item.risk_score}/100`}
                          </p>
                        </div>

                        <Link
                          to={`/report/${item.public_id}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-2.5 text-sm font-medium text-emerald-300 transition hover:bg-emerald-400/[0.14]"
                        >
                          View report
                          <ArrowUpRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}

              {/* Empty state */}
              {filtered.length === 0 && !error && (
                <div className="py-16 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/[0.07]">
                    <Search size={25} className="text-emerald-400" />
                  </div>

                  <h3 className="mt-5 text-lg font-semibold">
                    No investigations found
                  </h3>

                  <p className={`${mutedText} mx-auto mt-2 max-w-sm text-sm leading-6`}>
                    {items.length === 0
                      ? "Submit a recruitment opportunity to create your first investigation record."
                      : "Try another search term or change the classification filter."}
                  </p>

                  {items.length === 0 && (
                    <Link
                      to="/investigate"
                      className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-5 py-3 text-sm font-semibold text-[#07120C] transition hover:bg-emerald-300"
                    >
                      <Plus size={17} />
                      Start investigating
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-8 border-t border-white/[0.07] py-6 text-center text-xs text-[#718078]">
          TRUSTHIRE · Your recruitment investigation workspace
        </footer>
      </div>
    </main>
  );
}
