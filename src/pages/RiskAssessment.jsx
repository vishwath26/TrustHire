
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
  Activity,
  ArrowUpRight,
  CircleDashed,
  AlertCircle,
  ClipboardCheck,
  BriefcaseBusiness,
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
  if (status === "High risk")
    return "border-red-400/20 bg-red-400/[0.08] text-red-300";

  if (status === "Info")
    return "border-sky-400/20 bg-sky-400/[0.08] text-sky-300";

  return "border-amber-400/20 bg-amber-400/[0.08] text-amber-300";
}

function levelClass(level) {
  if (level === "High Risk")
    return "border-red-400/25 bg-red-400/[0.08] text-red-300";

  if (level === "Verified")
    return "border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-300";

  if (level === "Needs Review")
    return "border-amber-400/25 bg-amber-400/[0.08] text-amber-300";

  return "border-white/10 bg-white/[0.04] text-gray-300";
}

const panel =
  "rounded-2xl border border-emerald-400/[0.12] bg-[#111B17]/80 shadow-lg shadow-black/10 backdrop-blur-xl";

const mutedText = "text-[#91A39A]";

export default function RiskAssessment() {
  const { publicId } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        if (!publicId) {
          const list = await listInvestigations();

          if (cancelled) return;

          if (list[0]) {
            navigate(`/report/${list[0].public_id}`, { replace: true });
          } else {
            setError("No investigation to report yet.");
          }

          return;
        }

        const data = await getInvestigation(publicId);

        if (!cancelled) setReport(data);
      } catch (loadError) {
        if (!cancelled) setError(loadError.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [publicId, navigate]);

  const score = report?.risk_score ?? 0;
  const scored = report?.risk_score != null;
  const findings = report?.findings || [];
  const recommendations = report?.recommendations || [];

  // Animate the displayed score only. The backend score is not modified.
  useEffect(() => {
    if (!scored) {
      setDisplayScore(0);
      return;
    }

    const target = Math.max(0, Math.min(100, Number(score) || 0));
    const duration = 6000;
    let frameId;
    let startTime;

    const animate = (timestamp) => {
      if (startTime === undefined) startTime = timestamp;

      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);

      setDisplayScore(Math.round(target * eased));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    setDisplayScore(0);
    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [score, scored]);

  const scoreColor =
    report?.risk_level === "High Risk"
      ? "#F06464"
      : report?.risk_level === "Needs Review"
        ? "#F5B942"
        : "#39D98A";

  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-8 text-white md:px-10">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 right-0 h-[450px] w-[450px] rounded-full bg-emerald-500/[0.06] blur-[140px]" />
        <div className="absolute bottom-0 left-0 h-[350px] w-[350px] rounded-full bg-green-500/[0.04] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Top navigation */}
        <header className="mb-9 flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] pb-6">
          <Link
            to={report ? `/dashboard/${report.public_id}` : "/dashboard"}
            className="inline-flex items-center gap-2 text-sm text-[#91A39A] transition hover:text-emerald-400"
          >
            <ArrowLeft size={17} />
            Back to investigation
          </Link>

          {report && (
            <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-xs text-[#91A39A]">
              REPORT ID:
              <span className="ml-2 font-semibold text-white">
                {report.public_id}
              </span>
            </div>
          )}
        </header>

        {/* Page heading */}
        <section className="mb-9">
          <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-2 text-xs font-semibold tracking-widest text-emerald-400">
            <ClipboardCheck size={15} />
            INVESTIGATION REPORT
          </div>

          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
            Risk Assessment
          </h1>

          <p className={`${mutedText} mt-3 max-w-2xl leading-7`}>
            A detailed breakdown of the evidence, findings and potential
            recruitment risks associated with this opportunity.
          </p>
        </section>

        {/* Error state */}
        {error && (
          <div className="mb-7 flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/[0.07] p-5 text-sm text-red-300">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Unable to load report</p>
              <p className="mt-1 text-red-200/80">{error}</p>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className={`${panel} flex items-center justify-center gap-3 py-20`}>
            <CircleDashed size={22} className="animate-spin text-emerald-400" />
            <p className={`${mutedText} text-sm`}>
              Loading assessment report...
            </p>
          </div>
        )}

        {report && (
          <>
            {/* Score explanation */}
            <div className="mb-8 flex items-start gap-3 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.05] p-5">
              <Info className="mt-0.5 shrink-0 text-emerald-400" size={20} />
              <div>
                <p className="text-sm font-semibold text-emerald-300">
                  Understanding your risk score
                </p>
                <p className="mt-1 text-sm leading-6 text-[#A7B5AE]">
                  This score counts warning signs in the evidence you
                  submitted. A low score means those signs were not found.
                  It does not prove the opportunity is legitimate.
                </p>
              </div>
            </div>

            {/* Overall assessment and opportunity details */}
            <section className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
              {/* Risk score */}
              <div className={`${panel} p-6 md:p-8 lg:col-span-2`}>
                <div className="mb-7 flex items-center gap-2 text-sm font-medium text-[#91A39A]">
                  <Activity size={18} className="text-emerald-400" />
                  OVERALL RISK ASSESSMENT
                </div>

                <div className="flex flex-col items-center gap-8 sm:flex-row">
                  {/* Animated circular score */}
                  <div
                    className="relative flex h-44 w-44 shrink-0 items-center justify-center rounded-full transition-none"
                    style={{
                      background: `conic-gradient(${scoreColor} ${scored ? displayScore * 3.6 : 0}deg, #26332D 0deg)`,
                    }}
                  >
                    <div className="flex h-[150px] w-[150px] flex-col items-center justify-center rounded-full border border-white/[0.05] bg-[#0B120E]">
                      <span className="text-5xl font-bold tabular-nums">
                        {scored ? displayScore : "—"}
                      </span>
                      <span className="mt-1 text-xs text-[#718078]">
                        OUT OF 100
                      </span>
                    </div>
                  </div>

                  {/* Classification */}
                  <div className="min-w-0">
                    <span
                      className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold ${levelClass(report.risk_level)}`}
                    >
                      <AlertTriangle size={14} />
                      {report.risk_level ||
                        report.status ||
                        "Assessment incomplete"}
                    </span>

                    <h2 className="mt-4 text-2xl font-bold">
                      {report.risk_level || "Assessment incomplete"}
                    </h2>

                    <p className={`${mutedText} mt-3 max-w-xl text-sm leading-7`}>
                      {report.summary ||
                        "No assessment summary is available for this investigation."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Opportunity details */}
              <div className={`${panel} p-6`}>
                <div className="mb-7 flex items-center gap-2">
                  <BriefcaseBusiness size={19} className="text-emerald-400" />
                  <h2 className="font-semibold">Opportunity details</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-semibold tracking-widest text-[#718078]">
                      JOB ROLE
                    </p>
                    <p className="mt-2 text-sm font-medium text-[#E1E9E4]">
                      {report.job_role || "Not specified"}
                    </p>
                  </div>

                  <div className="border-t border-white/[0.07] pt-5">
                    <p className="text-[10px] font-semibold tracking-widest text-[#718078]">
                      CLAIMED COMPANY
                    </p>
                    <p className="mt-2 break-words text-sm font-medium text-[#E1E9E4]">
                      {report.company_name || "Not specified"}
                    </p>
                  </div>

                  <div className="border-t border-white/[0.07] pt-5">
                    <p className="text-[10px] font-semibold tracking-widest text-[#718078]">
                      REPORT STATUS
                    </p>
                    <p className="mt-2 text-sm font-medium text-[#E1E9E4]">
                      {report.status || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Evidence breakdown */}
            <section className={`${panel} mb-8 p-5 md:p-7`}>
              <div className="mb-7 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] pb-5">
                <div>
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-emerald-400" />
                    <h2 className="text-xl font-bold">Evidence breakdown</h2>
                  </div>
                  <p className={`${mutedText} mt-2 text-sm`}>
                    Findings from the submitted links and documents.
                  </p>
                </div>

                <span className="rounded-md border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-2 text-xs font-medium text-emerald-300">
                  {findings.length} FINDINGS
                </span>
              </div>

              <div className="space-y-3">
                {findings.map((item) => {
                  const Icon = categoryIcons[item.category] || FileText;

                  return (
                    <article
                      key={item.id}
                      className="rounded-xl border border-white/[0.07] bg-[#080D0B]/45 p-5 transition hover:border-emerald-400/20 hover:bg-[#142019]/60"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/[0.07]">
                          <Icon size={20} className="text-emerald-400" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-white">
                              {item.title}
                            </h3>

                            <span
                              className={`rounded-md border px-2.5 py-1 text-[10px] font-semibold ${badgeClass(item.status)}`}
                            >
                              {item.status}
                            </span>
                          </div>

                          <p className={`${mutedText} mt-2 text-sm leading-7`}>
                            {item.detail}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2 sm:block sm:min-w-20 sm:text-right">
                          <p className="text-xl font-bold tabular-nums text-emerald-300">
                            +{item.points}
                          </p>
                          <p className="text-[10px] tracking-wider text-[#718078]">
                            RISK POINTS
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}

                {findings.length === 0 && (
                  <div className="py-12 text-center">
                    <ShieldCheck size={30} className="mx-auto text-emerald-400" />
                    <p className="mt-4 font-medium">No findings recorded</p>
                    <p className={`${mutedText} mt-2 text-sm`}>
                      No evidence findings are available for this report.
                    </p>
                  </div>
                )}
              </div>

              {/* Total score */}
              <div className="mt-6 flex items-center justify-between border-t border-white/[0.08] pt-5">
                <span className="text-sm text-[#91A39A]">
                  Total risk score
                </span>
                <span className="text-xl font-bold tabular-nums text-emerald-300">
                  {scored ? `${score} / 100` : "Not scored"}
                </span>
              </div>
            </section>

            {/* Recommended actions */}
            <section className={`${panel} mb-8 p-5 md:p-7`}>
              <div className="mb-6 flex items-center gap-3 border-b border-white/[0.07] pb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/[0.07]">
                  <ShieldCheck size={21} className="text-emerald-400" />
                </div>

                <div>
                  <h2 className="text-xl font-bold">Recommended actions</h2>
                  <p className={`${mutedText} mt-1 text-sm`}>
                    Suggested next steps based on the assessment.
                  </p>
                </div>
              </div>

              {recommendations.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.map((item, index) => (
                    <div
                      key={`${index}-${item}`}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle2
                        className="mt-0.5 shrink-0 text-emerald-400"
                        size={19}
                      />
                      <p className="text-sm leading-7 text-[#C4D0C9]">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`${mutedText} text-sm`}>
                  No recommended actions are available for this report.
                </p>
              )}
            </section>

            {/* Bottom navigation */}
            <footer className="flex flex-col items-start justify-between gap-5 border-t border-white/[0.07] py-6 sm:flex-row sm:items-center">
              <p className="text-xs text-[#718078]">
                TRUSTHIRE · Evidence before judgment
              </p>

              <Link
                to={`/trust-graph/${report.public_id}`}
                className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.08] px-5 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/[0.16]"
              >
                Open trust graph
                <ArrowUpRight size={17} />
              </Link>
            </footer>
          </>
        )}
      </div>
    </main>
  );
}
