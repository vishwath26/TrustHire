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
} from "lucide-react";
import { getInvestigation, listInvestigations } from "../api";

const moduleStyles = {
  document: { icon: FileSearch, color: "text-violet-400", bg: "bg-violet-500/10" },
  recruiter: { icon: ShieldCheck, color: "text-cyan-400", bg: "bg-cyan-500/10" },
  company: { icon: Building2, color: "text-purple-400", bg: "bg-purple-500/10" },
  domain: { icon: Globe, color: "text-sky-400", bg: "bg-sky-500/10" },
  fraud: { icon: BrainCircuit, color: "text-pink-400", bg: "bg-pink-500/10" },
};

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
          navigate(`/dashboard/${list[0].public_id}`, { replace: true });
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
    <div className="min-h-screen text-white px-5 py-8 md:px-10">
      <header className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-500/20">
            <ShieldCheck className="text-violet-400" size={25} />
          </div>
          <span className="text-xl font-bold tracking-wide">TRUSTHIRE</span>
        </div>
        <Link
          to="/investigate"
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
        >
          <ArrowLeft size={17} />
          New investigation
        </Link>
      </header>

      <main className="max-w-7xl mx-auto mt-12">
        <div className="mb-9">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-400/20 bg-violet-500/10 text-violet-300 text-xs font-semibold mb-5">
            <Activity size={15} />
            INVESTIGATION CENTER
          </div>
          <h1 className="text-3xl md:text-5xl font-bold">
            Investigation <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">Dashboard</span>
          </h1>
          <p className="text-gray-400 mt-3 max-w-2xl">
            Track investigation stages, examine collected evidence
            and monitor the analysis of a recruitment opportunity.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-4 mb-7 text-sm text-red-200">
            {error}
          </div>
        )}

        {empty && (
          <div className="glass-panel rounded-2xl p-10 text-center">
            <p className="font-semibold">No investigations yet</p>
            <p className="text-gray-400 text-sm mt-2">Submit a link or a document to run the first check.</p>
            <Link to="/investigate" className="inline-block mt-5 text-cyan-300">Start an investigation</Link>
          </div>
        )}

        {!investigation && !empty && !error && (
          <p className="text-gray-400 text-sm">Loading investigation…</p>
        )}

        {investigation && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
              <div className="glass-card rounded-2xl p-5">
                <div className="flex justify-between items-center">
                  <p className="text-gray-400 text-sm">Investigation ID</p>
                  <FileText className="text-violet-400" size={20} />
                </div>
                <h3 className="text-xl font-bold mt-4">{investigation.public_id}</h3>
                <p className="text-gray-500 text-xs mt-2">{investigation.company_name || "Organization not named"}</p>
              </div>

              <div className="glass-card rounded-2xl p-5">
                <div className="flex justify-between items-center">
                  <p className="text-gray-400 text-sm">Analysis Progress</p>
                  <Activity className="text-cyan-400" size={20} />
                </div>
                <h3 className="text-3xl font-bold mt-3">{progress}%</h3>
                <p className="text-gray-500 text-xs mt-2">{investigation.job_role || "Role not specified"}</p>
              </div>

              <div className="glass-card rounded-2xl p-5">
                <div className="flex justify-between items-center">
                  <p className="text-gray-400 text-sm">Investigation Status</p>
                  <Clock3 className="text-yellow-400" size={20} />
                </div>
                <h3 className="text-xl font-bold mt-4">{investigation.risk_level || investigation.status}</h3>
                <p className="text-gray-500 text-xs mt-2">{investigation.status}</p>
              </div>
            </div>

            <section className="glass-panel rounded-2xl p-6 md:p-8 mb-8">
              <div className="flex flex-wrap justify-between items-center gap-3">
                <div>
                  <h2 className="text-xl font-bold">Investigation Overview</h2>
                  <p className="text-gray-400 text-sm mt-1">{investigation.summary}</p>
                </div>
                <span className="text-cyan-400 font-bold text-xl">{progress}%</span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full mt-6 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </section>

            <section className="mb-9">
              <div className="mb-5">
                <h2 className="text-2xl font-bold">Investigation Modules</h2>
                <p className="text-gray-400 text-sm mt-1">Five checks run on the evidence you submitted</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {investigation.modules.map((stage) => {
                  const style = moduleStyles[stage.module_key] || moduleStyles.document;
                  const Icon = style.icon;
                  const done = stage.status === "Completed";

                  return (
                    <div key={stage.module_key} className="glass-card rounded-2xl p-6">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-xl ${style.bg}`}>
                            <Icon className={style.color} size={25} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">MODULE {String(stage.sort_order).padStart(2, "0")}</p>
                            <h3 className="font-bold text-lg">{stage.title}</h3>
                          </div>
                        </div>
                        <span className={`flex items-center gap-1.5 text-xs rounded-full px-3 py-1.5 whitespace-nowrap ${
                          done
                            ? "text-emerald-300 bg-emerald-400/10 border border-emerald-400/20"
                            : "text-yellow-300 bg-yellow-400/10 border border-yellow-400/20"
                        }`}>
                          {done ? <CheckCircle2 size={13} /> : <CircleDashed size={13} />}
                          {stage.status}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed mt-5">{stage.summary}</p>
                      <div className="mt-5 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-cyan-400" style={{ width: `${stage.progress}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="glass-panel rounded-2xl p-6 md:p-8 mb-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-3 rounded-xl bg-cyan-500/10">
                  <UploadCloud className="text-cyan-400" size={23} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Evidence Repository</h2>
                  <p className="text-gray-400 text-sm">Submitted documents and recruitment links</p>
                </div>
              </div>

              {investigation.evidence_files.length === 0 && !investigation.job_url && !investigation.company_url && !investigation.recruiter_url ? (
                <div className="border border-dashed border-white/15 rounded-xl p-8 text-center">
                  <FileText className="mx-auto text-gray-500" size={32} />
                  <p className="font-semibold mt-3">No evidence connected</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[
                    ["Job URL", investigation.job_url],
                    ["Recruiter URL", investigation.recruiter_url],
                    ["Company URL", investigation.company_url],
                  ].filter(([, value]) => value).map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                      <p className="text-xs text-gray-500">{label}</p>
                      <p className="text-sm mt-1 break-all">{value}</p>
                    </div>
                  ))}
                  {investigation.evidence_files.map((file) => (
                    <div key={file.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-4 flex justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{file.filename}</p>
                        <p className="text-xs text-gray-500 mt-1">{file.content_type}</p>
                      </div>
                      <p className="text-xs text-gray-400">{file.file_size ? `${(file.file_size / 1024).toFixed(1)} KB` : ""}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="glass-panel rounded-2xl p-6 md:p-8 mb-10">
              <div className="flex items-center gap-3">
                <BrainCircuit className="text-violet-400" size={25} />
                <h2 className="text-xl font-bold">Final Risk Assessment</h2>
              </div>
              <p className="text-gray-400 text-sm mt-4 leading-relaxed">{investigation.summary}</p>
              <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl bg-white/5 border border-white/10 p-5">
                <div>
                  <p className="text-lg font-semibold">{investigation.risk_level || "Not scored"}</p>
                  <p className="text-gray-400 text-xs mt-2">
                    {investigation.risk_score == null ? "No numeric score" : `${investigation.risk_score} / 100`}
                  </p>
                </div>
                <Link
                  to={`/report/${investigation.public_id}`}
                  className="text-sm text-cyan-300"
                >
                  Open the full report
                </Link>
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="border-t border-white/10 py-6 text-center text-gray-500 text-xs">
        © 2026 TRUSTHIRE · AI-Powered Recruitment Intelligence Platform
      </footer>
    </div>
  );
}
