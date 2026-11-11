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
} from "lucide-react";
import { getThreatIntelligence } from "../api";

const typeIcons = {
  "Email domain": { icon: Mail, color: "text-amber-300" },
  "Phone number": { icon: Phone, color: "text-rose-300" },
  Website: { icon: Globe, color: "text-cyan-300" },
};

function formatTime(value) {
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
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
  const maxPattern = Math.max(1, ...(data?.patterns || []).map((item) => item.count));

  return (
    <main className="min-h-screen bg-[#080b14] text-white px-4 py-7 md:px-10">
      <div className="max-w-7xl mx-auto">
        <Link
          to="/trust-graph"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8"
        >
          <ArrowLeft size={16} />
          Back to Trust Graph
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-cyan-400 mb-2">COMMUNITY INTELLIGENCE</p>
            <h1 className="text-3xl md:text-4xl font-semibold">Threat Intelligence</h1>
            <p className="text-gray-400 mt-2">
              Patterns across investigations stored on this TrustHire instance.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm text-gray-400">
            <ShieldAlert size={18} className="text-cyan-300" />
            Intelligence centre
          </div>
        </div>

        <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] p-4 flex gap-3 mb-8">
          <Info size={19} className="text-cyan-300 shrink-0 mt-0.5" />
          <p className="text-sm text-gray-300">
            Counts come from investigations run on this computer. A repeated email or domain is a lead, not a verdict.
          </p>
        </div>

        {error && <p className="text-sm text-red-200 mb-6">{error}</p>}

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <Users size={20} className="text-cyan-300 mb-4" />
            <p className="text-3xl font-semibold">{summary?.investigations ?? "—"}</p>
            <p className="text-sm text-gray-400 mt-1">Investigations</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <Globe size={20} className="text-amber-300 mb-4" />
            <p className="text-3xl font-semibold">{summary?.flagged_indicators ?? "—"}</p>
            <p className="text-sm text-gray-400 mt-1">Flagged indicators</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <TrendingUp size={20} className="text-rose-300 mb-4" />
            <p className="text-3xl font-semibold">{summary?.recurring_patterns ?? "—"}</p>
            <p className="text-sm text-gray-400 mt-1">Recurring patterns</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <Clock size={20} className="text-violet-300 mb-4" />
            <p className="text-3xl font-semibold">{summary?.under_review ?? "—"}</p>
            <p className="text-sm text-gray-400 mt-1">Still need review</p>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-8">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Suspicious indicators</h2>
                <p className="text-sm text-gray-400 mt-1">Entities from high-risk and needs-review cases.</p>
              </div>
              <Search size={19} className="text-gray-400" />
            </div>
            <div className="space-y-4">
              {(data?.indicators || []).map((item) => {
                const meta = typeIcons[item.type] || typeIcons.Website;
                const Icon = meta.icon;
                return (
                  <div key={`${item.type}-${item.value}`} className="rounded-xl border border-white/[0.08] bg-black/20 p-4">
                    <div className="flex items-start gap-3">
                      <Icon size={20} className={`${meta.color} mt-1 shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">{item.type}</p>
                        <p className="font-medium mt-1 break-all">{item.value}</p>
                        <p className="text-xs text-gray-400 mt-1">{item.category}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold">{item.reports}</p>
                        <p className="text-xs text-gray-500">mentions</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              {data && data.indicators.length === 0 && (
                <p className="text-sm text-gray-400">No flagged indicators yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Common fraud patterns</h2>
                <p className="text-sm text-gray-400 mt-1">How often each pattern has been found locally.</p>
              </div>
              <TrendingUp size={19} className="text-gray-400" />
            </div>
            <div className="space-y-6">
              {(data?.patterns || []).map((pattern) => (
                <div key={pattern.label}>
                  <div className="flex justify-between gap-3 text-sm mb-2">
                    <span className="text-gray-300">{pattern.label}</span>
                    <span className="text-gray-400">{pattern.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-cyan-400"
                      style={{ width: `${Math.round((pattern.count / maxPattern) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
              {data && data.patterns.length === 0 && (
                <p className="text-sm text-gray-400">No recurring patterns yet.</p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Recent investigations</h2>
            <p className="text-sm text-gray-400 mt-1">Latest assessments produced by this API.</p>
          </div>
          <div className="space-y-3">
            {(data?.reports || []).map((report) => (
              <Link
                key={report.public_id}
                to={`/report/${report.public_id}`}
                className="block rounded-xl border border-white/[0.08] bg-black/20 p-4 hover:border-cyan-400/20"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div>
                    <h3 className="font-medium">{report.title}</h3>
                    <p className="text-sm text-gray-400 mt-2 leading-6">{report.description}</p>
                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
                      <span>{report.source}</span>
                      <span>·</span>
                      <span>{formatTime(report.time)}</span>
                    </div>
                  </div>
                  <span className="text-xs text-amber-300 bg-amber-400/10 px-3 py-1.5 rounded-full w-fit shrink-0">
                    {report.status}
                  </span>
                </div>
              </Link>
            ))}
            {data && data.reports.length === 0 && (
              <p className="text-sm text-gray-400">No investigations have been saved yet.</p>
            )}
          </div>
        </section>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex gap-3">
          <AlertTriangle size={20} className="text-amber-300 shrink-0" />
          <div>
            <h3 className="font-medium">Reports are investigative leads, not verdicts</h3>
            <p className="text-sm text-gray-400 mt-1 leading-6">
              A frequently mentioned email, phone number or domain is not automatically fraudulent.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
