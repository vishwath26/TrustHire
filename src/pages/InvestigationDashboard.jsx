
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ShieldCheck,
  FileSearch,
  Building2,
  Globe,
  BrainCircuit,
  FileText,
  Clock3,
  Activity,
  ArrowLeft,
  CircleDashed,
  CheckCircle2,
  UploadCloud,
  ArrowUpRight,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { getInvestigation, listInvestigations } from "../api";

const moduleStyles = {
  document: FileSearch,
  recruiter: ShieldCheck,
  company: Building2,
  domain: Globe,
  fraud: BrainCircuit,
};

const panel =
  "rounded-2xl border border-emerald-400/[0.12] bg-[#111B17]/80 shadow-lg shadow-black/10 backdrop-blur-xl";

const mutedText = "text-[#91A39A]";

export default function InvestigationDashboard() {
  const { publicId } = useParams();
  const navigate = useNavigate();

  const [investigation, setInvestigation] = useState(null);
  const [error, setError] = useState("");
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setError("");
      setEmpty(false);

      try {
        if (!publicId) {
          const list = await listInvestigations();

          if (cancelled) return;

          if (list.length === 0) {
            setEmpty(true);
            return;
          }

          navigate(`/dashboard/${list[0].public_id}`, {
            replace: true,
          });
          return;
        }

        const data = await getInvestigation(publicId);

        if (!cancelled) setInvestigation(data);
      } catch (loadError) {
        if (!cancelled) setError(loadError.message);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [publicId, navigate]);

  const progress = investigation?.progress ?? 0;

  return (
    <div className="relative min-h-screen overflow-hidden px-5 py-8 text-white md:px-10">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 right-0 h-[450px] w-[450px] rounded-full bg-emerald-500/[0.06] blur-[140px]" />
        <div className="absolute bottom-0 left-0 h-[350px] w-[350px] rounded-full bg-green-500/[0.04] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] pb-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-2.5">
              <ShieldCheck className="text-emerald-400" size={25} />
            </div>
            <span className="text-xl font-bold tracking-wide">
              TRUST<span className="text-emerald-400">HIRE</span>
            </span>
          </Link>

          <Link
            to="/investigate"
            className="flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-2.5 text-sm font-medium text-emerald-300 transition hover:bg-emerald-400/15"
          >
            <ArrowLeft size={16} />
            New investigation
          </Link>
        </header>

        <main className="mt-12">
          {/* Page heading */}
          <div className="mb-9">
            <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-2 text-xs font-semibold tracking-widest text-emerald-400">
              <Activity size={15} />
              INVESTIGATION CENTER
            </div>

            <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
              Investigation{" "}
              <span className="text-emerald-400">Dashboard</span>
            </h1>

            <p className={`${mutedText} mt-3 max-w-2xl leading-7`}>
              Track investigation stages, examine collected evidence and
              monitor the analysis of a recruitment opportunity.
            </p>
          </div>

          {/* Error state */}
          {error && (
            <div className="mb-7 flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/[0.07] p-4 text-sm text-red-300">
              <AlertCircle size={19} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {/* Empty state */}
          {empty && (
            <div className={`${panel} p-12 text-center`}>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10">
                <FileSearch size={27} className="text-emerald-400" />
              </div>

              <h2 className="mt-5 text-xl font-semibold">
                No investigations yet
              </h2>

              <p className={`${mutedText} mt-2 text-sm`}>
                Submit a link or document to run your first check.
              </p>

              <Link
                to="/investigate"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-5 py-3 text-sm font-semibold text-[#07120C] transition hover:bg-emerald-300"
              >
                Start an investigation
                <ArrowUpRight size={16} />
              </Link>
            </div>
          )}

          {/* Loading state */}
          {!investigation && !empty && !error && (
            <div className={`${panel} flex items-center gap-3 p-6`}>
              <CircleDashed className="animate-spin text-emerald-400" size={20} />
              <p className={`${mutedText} text-sm`}>
                Loading investigation...
              </p>
            </div>
          )}

          {investigation && (
            <>
              {/* Metric cards */}
              <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className={`${panel} p-5 transition hover:border-emerald-400/25`}>
                  <div className="flex items-center justify-between">
                    <p className={`${mutedText} text-sm`}>
                      Investigation ID
                    </p>
                    <FileText className="text-emerald-400" size={20} />
                  </div>

                  <h3 className="mt-4 break-all text-xl font-bold">
                    {investigation.public_id}
                  </h3>

                  <p className="mt-2 text-xs text-[#718078]">
                    {investigation.company_name || "Organization not named"}
                  </p>
                </div>

                <div className={`${panel} p-5 transition hover:border-emerald-400/25`}>
                  <div className="flex items-center justify-between">
                    <p className={`${mutedText} text-sm`}>
                      Analysis Progress
                    </p>
                    <Activity className="text-emerald-400" size={20} />
                  </div>

                  <h3 className="mt-3 text-3xl font-bold tabular-nums">
                    {progress}%
                  </h3>

                  <p className="mt-2 text-xs text-[#718078]">
                    {investigation.job_role || "Role not specified"}
                  </p>
                </div>

                <div className={`${panel} p-5 transition hover:border-emerald-400/25`}>
                  <div className="flex items-center justify-between">
                    <p className={`${mutedText} text-sm`}>
                      Investigation Status
                    </p>
                    <Clock3 className="text-amber-400" size={20} />
                  </div>

                  <h3 className="mt-4 text-xl font-bold">
                    {investigation.risk_level || investigation.status}
                  </h3>

                  <p className="mt-2 text-xs text-[#718078]">
                    {investigation.status}
                  </p>
                </div>
              </div>

              {/* Investigation overview */}
              <section className={`${panel} mb-8 p-6 md:p-8`}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold tracking-widest text-emerald-400">
                      ANALYSIS OVERVIEW
                    </p>

                    <h2 className="mt-2 text-xl font-bold">
                      Investigation Progress
                    </h2>

                    <p className={`${mutedText} mt-2 text-sm`}>
                      {investigation.summary}
                    </p>
                  </div>

                  <span className="text-3xl font-bold text-emerald-400">
                    {progress}%
                  </span>
                </div>

                <div className="mt-7 h-2.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </section>

              {/* Investigation modules */}
              <section className="mb-9">
                <div className="mb-5">
                  <p className="text-xs font-semibold tracking-widest text-emerald-400">
                    VERIFICATION ENGINE
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    Investigation Modules
                  </h2>

                  <p className={`${mutedText} mt-1 text-sm`}>
                    Five checks run on the evidence you submitted.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {investigation.modules.map((stage) => {
                    const Icon =
                      moduleStyles[stage.module_key] || FileSearch;

                    const done = stage.status === "Completed";

                    return (
                      <div
                        key={stage.module_key}
                        className={`${panel} p-6 transition duration-300 hover:-translate-y-0.5 hover:border-emerald-400/25`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.08] p-3">
                              <Icon
                                className="text-emerald-400"
                                size={24}
                              />
                            </div>

                            <div>
                              <p className="mb-1 text-[10px] font-semibold tracking-widest text-[#718078]">
                                MODULE {String(stage.sort_order).padStart(2, "0")}
                              </p>

                              <h3 className="text-lg font-semibold">
                                {stage.title}
                              </h3>
                            </div>
                          </div>

                          <span
                            className={`flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs ${
                              done
                                ? "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300"
                                : "border-amber-400/20 bg-amber-400/[0.07] text-amber-300"
                            }`}
                          >
                            {done ? (
                              <CheckCircle2 size={13} />
                            ) : (
                              <CircleDashed size={13} />
                            )}
                            {stage.status}
                          </span>
                        </div>

                        <p className={`${mutedText} mt-5 text-sm leading-relaxed`}>
                          {stage.summary}
                        </p>

                        <div className="mt-5 flex items-center gap-3">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
                            <div
                              className="h-full rounded-full bg-emerald-400 transition-all duration-700"
                              style={{ width: `${stage.progress}%` }}
                            />
                          </div>

                          <span className="text-xs tabular-nums text-[#91A39A]">
                            {stage.progress}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Evidence repository */}
              <section className={`${panel} mb-8 p-6 md:p-8`}>
                <div className="mb-6 flex items-center gap-4">
                  <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.08] p-3">
                    <UploadCloud className="text-emerald-400" size={23} />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold">
                      Evidence Repository
                    </h2>

                    <p className={`${mutedText} mt-1 text-sm`}>
                      Submitted documents and recruitment links
                    </p>
                  </div>
                </div>

                {investigation.evidence_files.length === 0 &&
                !investigation.job_url &&
                !investigation.company_url &&
                !investigation.recruiter_url ? (
                  <div className="rounded-xl border border-dashed border-white/15 p-8 text-center">
                    <FileText
                      className="mx-auto text-[#718078]"
                      size={32}
                    />

                    <p className="mt-3 font-semibold">
                      No evidence connected
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[
                      ["Job URL", investigation.job_url],
                      ["Recruiter URL", investigation.recruiter_url],
                      ["Company URL", investigation.company_url],
                    ]
                      .filter(([, value]) => value)
                      .map(([label, value]) => (
                        <div
                          key={label}
                          className="flex flex-col gap-2 rounded-xl border border-white/[0.07] bg-black/10 p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0">
                            <p className="text-xs text-[#718078]">
                              {label}
                            </p>

                            <p className="mt-1 break-all text-sm text-[#C4D0C9]">
                              {value}
                            </p>
                          </div>

                          <ExternalLink
                            className="hidden shrink-0 text-emerald-400 sm:block"
                            size={17}
                          />
                        </div>
                      ))}

                    {investigation.evidence_files.map((file) => (
                      <div
                        key={file.id}
                        className="flex flex-col gap-3 rounded-xl border border-white/[0.07] bg-black/10 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="rounded-lg bg-emerald-400/[0.08] p-2.5">
                            <FileText
                              className="text-emerald-400"
                              size={20}
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="break-all text-sm font-medium">
                              {file.filename}
                            </p>

                            <p className="mt-1 text-xs text-[#718078]">
                              {file.content_type}
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-[#91A39A]">
                          {file.file_size
                            ? `${(file.file_size / 1024).toFixed(1)} KB`
                            : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Final risk assessment */}
              <section className={`${panel} mb-10 overflow-hidden`}>
                <div className="border-b border-white/[0.07] p-6 md:p-8">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.08] p-3">
                      <BrainCircuit
                        className="text-emerald-400"
                        size={24}
                      />
                    </div>

                    <div>
                      <p className="text-xs font-semibold tracking-widest text-emerald-400">
                        FINAL ANALYSIS
                      </p>

                      <h2 className="mt-1 text-xl font-bold">
                        Final Risk Assessment
                      </h2>
                    </div>
                  </div>

                  <p className={`${mutedText} mt-5 text-sm leading-relaxed`}>
                    {investigation.summary}
                  </p>
                </div>

                <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between md:p-8">
                  <div>
                    <p className="text-xs font-semibold tracking-widest text-[#718078]">
                      OVERALL RISK LEVEL
                    </p>

                    <p className="mt-2 text-2xl font-bold">
                      {investigation.risk_level || "Not scored"}
                    </p>

                    <p className={`${mutedText} mt-2 text-sm`}>
                      {investigation.risk_score == null
                        ? "No numeric score"
                        : `${investigation.risk_score} / 100`}
                    </p>
                  </div>

                  <Link
                    to={`/report/${investigation.public_id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-400 px-5 py-3 text-sm font-semibold text-[#07120C] transition hover:bg-emerald-300"
                  >
                    Open full report
                    <ArrowUpRight size={17} />
                  </Link>
                </div>
              </section>
            </>
          )}
        </main>

        <footer className="border-t border-white/[0.07] py-6 text-center text-xs text-[#718078]">
          © 2026 TRUSTHIRE · Recruitment Security Intelligence Platform
        </footer>
      </div>
    </div>
  );
}
