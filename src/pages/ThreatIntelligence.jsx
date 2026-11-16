
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ShieldAlert,
  Search,
  TrendingUp,
  Users,
  Globe,
  Phone,
  Mail,
  AlertTriangle,
  Clock,
  Info,
  Activity,
  ArrowUpRight,
  Radar,
  Database,
  ShieldCheck,
  CircleDashed,
  AlertCircle,
} from "lucide-react";
import { getThreatIntelligence } from "../api";

const typeIcons = {
  "Email domain": { icon: Mail, color: "text-amber-400" },
  "Phone number": { icon: Phone, color: "text-rose-400" },
  Website: { icon: Globe, color: "text-emerald-400" },
};

const panel =
  "rounded-2xl border border-emerald-400/[0.12] bg-[#111B17]/80 shadow-lg shadow-black/10 backdrop-blur-xl";

const mutedText = "text-[#91A39A]";

function formatTime(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusStyle(status) {
  const value = (status || "").toLowerCase();

  if (value.includes("high") || value.includes("risk")) {
    return "border-red-400/20 bg-red-400/[0.08] text-red-300";
  }

  if (value.includes("verified") || value.includes("safe")) {
    return "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300";
  }

  return "border-amber-400/20 bg-amber-400/[0.08] text-amber-300";
}

function MetricCard({ icon: Icon, label, value, description }) {
  return (
    <div className={`${panel} group p-5 transition duration-200 hover:border-emerald-400/25`}>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-400/[0.07]">
          <Icon size={20} className="text-emerald-400" />
        </div>
        <Activity size={17} className="text-[#52665B]" />
      </div>

      <p className="text-3xl font-bold tracking-tight text-white tabular-nums">
        {value}
      </p>

      <p className="mt-1 text-sm font-medium text-[#C4D0C9]">{label}</p>

      {description && (
        <p className="mt-2 text-xs text-[#718078]">{description}</p>
      )}
    </div>
  );
}

export default function ThreatIntelligence() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    getThreatIntelligence()
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError.message);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const summary = data?.summary;
  const indicators = data?.indicators || [];
  const patterns = data?.patterns || [];
  const reports = data?.reports || [];

  const maxPattern = Math.max(
    1,
    ...patterns.map((item) => item.count)
  );

  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-8 text-white md:px-10">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 right-0 h-[450px] w-[450px] rounded-full bg-emerald-500/[0.05] blur-[140px]" />
        <div className="absolute bottom-0 left-0 h-[350px] w-[350px] rounded-full bg-green-500/[0.04] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">

        {/* Navigation */}
        <header className="mb-9 flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] pb-6">
          <Link
            to="/trust-graph"
            className="inline-flex items-center gap-2 text-sm text-[#91A39A] transition hover:text-emerald-400"
          >
            <ArrowLeft size={17} />
            Back to Trust Graph
          </Link>

          <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/15 bg-emerald-400/[0.05] px-4 py-2.5 text-xs font-medium tracking-wide text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            INTELLIGENCE CENTRE
          </div>
        </header>

        {/* Heading */}
        <section className="mb-9">
          <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-2 text-xs font-semibold tracking-widest text-emerald-400">
            <Radar size={15} />
            COMMUNITY INTELLIGENCE
          </div>

          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
            Threat Intelligence
          </h1>

          <p className={`${mutedText} mt-3 max-w-2xl leading-7`}>
            Discover suspicious indicators, identify recurring recruitment
            fraud patterns and monitor investigations across your TrustHire instance.
          </p>
        </section>

        {/* Information notice */}
        <div className="mb-8 flex items-start gap-3 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.05] p-5">
          <Info size={20} className="mt-0.5 shrink-0 text-emerald-400" />
          <div>
            <p className="text-sm font-semibold text-emerald-300">
              How this intelligence works
            </p>
            <p className={`${mutedText} mt-1 text-sm leading-6`}>
              Counts come from investigations run on this computer. A repeated
              email or domain is a lead, not a verdict.
            </p>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-7 flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/[0.07] p-5 text-sm text-red-300">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Unable to load intelligence</p>
              <p className="mt-1 text-red-200/80">{error}</p>
            </div>
          </div>
        )}

        {/* Loading state */}
        {!data && !error && (
          <div className={`${panel} flex items-center justify-center gap-3 py-16`}>
            <CircleDashed size={22} className="animate-spin text-emerald-400" />
            <p className={`${mutedText} text-sm`}>
              Loading threat intelligence...
            </p>
          </div>
        )}

        {data && (
          <>
            {/* Summary metrics */}
            <section className="mb-9">
              <div className="mb-5 flex items-center gap-2">
                <Database size={18} className="text-emerald-400" />
                <h2 className="text-sm font-semibold tracking-wide text-[#C4D0C9]">
                  INTELLIGENCE OVERVIEW
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  icon={Users}
                  label="Investigations"
                  value={summary?.investigations ?? "—"}
                  description="Total stored investigations"
                />

                <MetricCard
                  icon={Globe}
                  label="Flagged indicators"
                  value={summary?.flagged_indicators ?? "—"}
                  description="Indicators requiring attention"
                />

                <MetricCard
                  icon={TrendingUp}
                  label="Recurring patterns"
                  value={summary?.recurring_patterns ?? "—"}
                  description="Repeated suspicious patterns"
                />

                <MetricCard
                  icon={Clock}
                  label="Still need review"
                  value={summary?.under_review ?? "—"}
                  description="Investigations awaiting review"
                />
              </div>
            </section>

            {/* Intelligence analysis */}
            <section className="mb-9 grid grid-cols-1 gap-5 xl:grid-cols-2">

              {/* Suspicious indicators */}
              <div className={`${panel} p-5 md:p-6`}>
                <div className="mb-6 flex items-start justify-between gap-3 border-b border-white/[0.07] pb-5">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-400/[0.07]">
                        <ShieldAlert size={20} className="text-emerald-400" />
                      </div>
                      <h2 className="text-lg font-bold">Suspicious indicators</h2>
                    </div>

                    <p className={`${mutedText} mt-3 text-sm leading-6`}>
                      Entities from high-risk and needs-review cases.
                    </p>
                  </div>

                  <span className="rounded-md border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-1.5 text-xs font-medium text-emerald-300">
                    {indicators.length} FOUND
                  </span>
                </div>

                <div className="space-y-3">
                  {indicators.map((item) => {
                    const meta = typeIcons[item.type] || typeIcons.Website;
                    const Icon = meta.icon;

                    return (
                      <div
                        key={`${item.type}-${item.value}`}
                        className="rounded-xl border border-white/[0.07] bg-[#080D0B]/45 p-4 transition hover:border-emerald-400/20 hover:bg-[#142019]/60"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03]">
                            <Icon size={19} className={meta.color} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-semibold tracking-widest text-[#718078]">
                              {item.type}
                            </p>

                            <p className="mt-1 break-all text-sm font-semibold text-[#E1E9E4]">
                              {item.value}
                            </p>

                            <p className="mt-1 text-xs text-[#91A39A]">
                              {item.category}
                            </p>
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="text-xl font-bold tabular-nums text-emerald-300">
                              {item.reports}
                            </p>
                            <p className="text-[10px] tracking-wide text-[#718078]">
                              MENTIONS
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {indicators.length === 0 && (
                    <div className="py-12 text-center">
                      <ShieldCheck size={30} className="mx-auto text-emerald-400" />
                      <p className="mt-4 font-medium">No flagged indicators yet</p>
                      <p className={`${mutedText} mt-2 text-sm`}>
                        Suspicious indicators will appear as investigations are recorded.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Common patterns */}
              <div className={`${panel} p-5 md:p-6`}>
                <div className="mb-6 border-b border-white/[0.07] pb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-400/[0.07]">
                      <TrendingUp size={20} className="text-emerald-400" />
                    </div>
                    <h2 className="text-lg font-bold">Common fraud patterns</h2>
                  </div>

                  <p className={`${mutedText} mt-3 text-sm leading-6`}>
                    How often each pattern has been found locally.
                  </p>
                </div>

                <div className="space-y-7">
                  {patterns.map((pattern) => {
                    const percentage = Math.round(
                      (pattern.count / maxPattern) * 100
                    );

                    return (
                      <div key={pattern.label}>
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <span className="text-sm font-medium text-[#C4D0C9]">
                            {pattern.label}
                          </span>

                          <span className="text-sm font-bold tabular-nums text-emerald-300">
                            {pattern.count}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
                          <div
                            className="h-full rounded-full bg-emerald-400 transition-all duration-700"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>

                        <p className="mt-2 text-right text-[10px] text-[#718078]">
                          {percentage}% relative frequency
                        </p>
                      </div>
                    );
                  })}

                  {patterns.length === 0 && (
                    <div className="py-12 text-center">
                      <TrendingUp size={30} className="mx-auto text-emerald-400" />
                      <p className="mt-4 font-medium">No recurring patterns yet</p>
                      <p className={`${mutedText} mt-2 text-sm`}>
                        Pattern statistics will appear when data is available.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Recent investigations */}
            <section className={`${panel} p-5 md:p-6`}>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] pb-5">
                <div>
                  <div className="flex items-center gap-3">
                    <Activity size={20} className="text-emerald-400" />
                    <h2 className="text-xl font-bold">Recent investigations</h2>
                  </div>

                  <p className={`${mutedText} mt-2 text-sm`}>
                    Latest assessments produced by this API.
                  </p>
                </div>

                <span className="rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-[#91A39A]">
                  {reports.length} RECORDS
                </span>
              </div>

              <div className="space-y-3">
                {reports.map((report) => (
                  <Link
                    key={report.public_id}
                    to={`/report/${report.public_id}`}
                    className="group block rounded-xl border border-white/[0.07] bg-[#080D0B]/45 p-4 transition hover:border-emerald-400/25 hover:bg-[#142019]/60"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-[#E1E9E4] transition group-hover:text-emerald-300">
                          {report.title}
                        </h3>

                        <p className={`${mutedText} mt-2 text-sm leading-6`}>
                          {report.description}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#718078]">
                          <span>{report.source}</span>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1">
                            <Clock size={13} />
                            {formatTime(report.time)}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        <span
                          className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${getStatusStyle(report.status)}`}
                        >
                          {report.status}
                        </span>

                        <ArrowUpRight
                          size={18}
                          className="text-[#718078] transition group-hover:text-emerald-400"
                        />
                      </div>
                    </div>
                  </Link>
                ))}

                {reports.length === 0 && (
                  <div className="py-12 text-center">
                    <Search size={29} className="mx-auto text-[#718078]" />
                    <p className="mt-4 font-medium">No investigations saved yet</p>
                    <p className={`${mutedText} mt-2 text-sm`}>
                      Your latest investigation records will appear here.
                    </p>
                    <Link
                      to="/investigate"
                      className="mt-5 inline-flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.07] px-4 py-2.5 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/[0.14]"
                    >
                      Start an investigation
                      <ArrowUpRight size={16} />
                    </Link>
                  </div>
                )}
              </div>
            </section>

            {/* Important disclaimer */}
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-400/15 bg-amber-400/[0.04] p-5">
              <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-400" />

              <div>
                <h3 className="text-sm font-semibold text-amber-300">
                  Reports are investigative leads, not verdicts
                </h3>

                <p className={`${mutedText} mt-2 text-sm leading-6`}>
                  A frequently mentioned email, phone number or domain is not
                  automatically fraudulent. Each indicator should be checked
                  against independent evidence before making a decision.
                </p>
              </div>
            </div>

            {/* Footer */}
            <footer className="mt-8 border-t border-white/[0.07] py-6">
              <p className="text-xs text-[#718078]">
                TRUSTHIRE · Community threat intelligence
              </p>
            </footer>
          </>
        )}
      </div>
    </main>
  );
}
