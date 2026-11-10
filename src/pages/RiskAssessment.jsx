import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileText,
  UserRound,
  Building2,
  Globe,
  CreditCard,
  CheckCircle2,
  Info,
} from "lucide-react";
import { getInvestigation, listInvestigations } from "../api";

const categoryIcons = {
  recruiter: UserRound,
  company: Building2,
  domain: Globe,
  payment: CreditCard,
  fraud: ShieldAlert,
  document: FileText,
};

function badgeClass(status) {
  if (status === "High risk") return "bg-red-400/10 text-red-300";
  if (status === "Info") return "bg-cyan-400/10 text-cyan-300";
  return "bg-amber-400/10 text-amber-300";
}

function levelClass(level) {
  if (level === "High Risk") return "border-red-400/20 bg-red-400/10 text-red-300";
  if (level === "Verified") return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
  if (level === "Needs Review") return "border-amber-400/20 bg-amber-400/10 text-amber-300";
  return "border-white/10 bg-white/5 text-gray-300";
}

export default function RiskAssessment() {
  const { publicId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        if (!publicId) {
          const list = await listInvestigations();
          if (cancelled) return;
          if (list[0]) navigate(`/report/${list[0].public_id}`, { replace: true });
          else setError("No investigation to report yet.");
          return;
        }

        const data = await getInvestigation(publicId);
        if (!cancelled) setReport(data);
      } catch (loadError) {
        if (!cancelled) setError(loadError.message);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [publicId, navigate]);

  const score = report?.risk_score ?? 0;
  const scored = report?.risk_score != null;

  return (
    <main className="min-h-screen bg-[#080b14] text-white px-5 py-8 md:px-10">
      <div className="max-w-6xl mx-auto">
        <Link
          to={report ? `/dashboard/${report.public_id}` : "/dashboard"}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition mb-8"
        >
          <ArrowLeft size={16} />
          Back to investigation
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-cyan-400 mb-2">INVESTIGATION REPORT</p>
            <h1 className="text-3xl md:text-4xl font-semibold">Risk Assessment</h1>
            <p className="text-gray-400 mt-2">A breakdown of the evidence and potential recruitment risks.</p>
          </div>
          <div className="text-sm text-gray-400 border border-white/10 rounded-xl px-4 py-3">
            Report ID: <span className="text-white">{report?.public_id || "—"}</span>
          </div>
        </div>

        {error && <p className="text-sm text-red-200 mb-6">{error}</p>}
        {!report && !error && <p className="text-sm text-gray-400">Loading report…</p>}

        {report && (
          <>
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] p-4 flex gap-3 mb-8">
              <Info className="text-cyan-300 shrink-0 mt-0.5" size={19} />
              <p className="text-sm text-gray-300">
                This score counts warning signs in the evidence you submitted.
                A low score means those signs were not found. It does not prove the opportunity is legitimate.
              </p>
            </div>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
              <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-5">
                  <ShieldAlert size={18} />
                  Overall risk assessment
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-8">
                  <div
                    className="relative w-40 h-40 shrink-0 rounded-full flex items-center justify-center"
                    style={{
                      background: `conic-gradient(#22d3ee ${scored ? score * 3.6 : 0}deg, #252b38 0deg)`,
                    }}
                  >
                    <div className="w-[126px] h-[126px] rounded-full bg-[#0b1020] flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold">{scored ? score : "—"}</span>
                      <span className="text-xs text-gray-400">out of 100</span>
                    </div>
                  </div>
                  <div>
                    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm ${levelClass(report.risk_level)}`}>
                      <AlertTriangle size={14} />
                      {report.risk_level || report.status}
                    </span>
                    <h2 className="text-2xl font-semibold mt-3">{report.risk_level || "Assessment incomplete"}</h2>
                    <p className="text-gray-400 text-sm leading-6 mt-2">{report.summary}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <p className="text-sm text-gray-400 mb-5">Opportunity details</p>
                <div className="space-y-5">
                  <div>
                    <p className="text-xs text-gray-500">JOB ROLE</p>
                    <p className="text-sm mt-1">{report.job_role || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">CLAIMED COMPANY</p>
                    <p className="text-sm mt-1">{report.company_name || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">REPORT STATUS</p>
                    <p className="text-sm mt-1">{report.status}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 mb-8">
              <div className="flex items-center justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Evidence breakdown</h2>
                  <p className="text-sm text-gray-400 mt-1">Findings from the submitted links and documents.</p>
                </div>
                <span className="text-xs text-gray-500">{report.findings.length} findings</span>
              </div>
              <div className="space-y-4">
                {report.findings.map((item) => {
                  const Icon = categoryIcons[item.category] || FileText;
                  return (
                    <div key={item.id} className="rounded-xl border border-white/[0.07] bg-black/20 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center shrink-0">
                          <Icon size={19} className="text-cyan-300" />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-medium">{item.title}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${badgeClass(item.status)}`}>{item.status}</span>
                          </div>
                          <p className="text-sm text-gray-400 mt-2 leading-6">{item.detail}</p>
                        </div>
                        <div className="sm:text-right shrink-0">
                          <p className="text-lg font-semibold">+{item.points}</p>
                          <p className="text-xs text-gray-500">risk points</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {report.findings.length === 0 && (
                  <p className="text-sm text-gray-400">No findings were recorded.</p>
                )}
              </div>
              <div className="flex justify-between items-center border-t border-white/10 mt-5 pt-5">
                <span className="text-sm text-gray-400">Total score</span>
                <span className="text-xl font-semibold text-cyan-300">
                  {scored ? `${score} / 100` : "Not scored"}
                </span>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 mb-8">
              <div className="flex items-center gap-2 mb-5">
                <ShieldCheck className="text-cyan-300" size={21} />
                <h2 className="text-xl font-semibold">Recommended actions</h2>
              </div>
              <div className="space-y-4">
                {report.recommendations.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="text-cyan-300 shrink-0 mt-0.5" size={18} />
                    <p className="text-sm text-gray-300 leading-6">{item}</p>
                  </div>
                ))}
              </div>
            </section>

            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
              <p className="text-xs text-gray-500">TRUSTHIRE · Evidence before judgment</p>
              <Link
                to={`/trust-graph/${report.public_id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 text-black font-medium px-5 py-3 hover:bg-cyan-300 transition"
              >
                Open trust graph
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
