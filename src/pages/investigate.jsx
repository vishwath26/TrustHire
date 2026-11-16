
import { useRef, useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { createInvestigation } from "../api";
import {
  ShieldCheck,
  ArrowLeft,
  UploadCloud,
  FileText,
  Link,
  X,
  Search,
  Globe,
  Building2,
  UserRound,
  FileSearch,
  Sparkles,
  Shield,
  AlertCircle,
  CheckCircle2,
  Activity,
} from "lucide-react";

const inputClass =
  "w-full rounded-xl border border-[#263A30] bg-[#09120E]/80 px-4 py-3.5 text-sm text-[#E6F0EA] outline-none transition placeholder:text-[#65766C] focus:border-[#39D98A]/60 focus:ring-2 focus:ring-[#39D98A]/10";

const panelClass =
  "rounded-2xl border border-[#1D3529] bg-[#101B15]/90 shadow-[0_12px_40px_rgba(0,0,0,0.12)]";

export default function Investigate() {
  const fileInput = useRef(null);
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [jobUrl, setJobUrl] = useState("");
  const [recruiterUrl, setRecruiterUrl] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const addFiles = (selectedFiles) => {
    const incoming = Array.from(selectedFiles);

    setFiles((previous) => {
      const combined = [...previous, ...incoming];

      return combined.filter(
        (file, index) =>
          combined.findIndex(
            (item) =>
              item.name === file.name &&
              item.size === file.size
          ) === index
      );
    });
  };

  const removeFile = (index) => {
    setFiles((previous) =>
      previous.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async () => {
    if (!jobUrl && !recruiterUrl && !companyUrl && files.length === 0) {
      setMessage("Please provide a link or upload at least one file.");
      return;
    }

    const body = new FormData();

    if (jobUrl.trim()) body.append("job_url", jobUrl.trim());
    if (recruiterUrl.trim()) body.append("recruiter_url", recruiterUrl.trim());
    if (companyUrl.trim()) body.append("company_url", companyUrl.trim());

    files.forEach((file) => body.append("evidence_files", file));

    setSubmitting(true);
    setMessage("");

    try {
      const investigation = await createInvestigation(body);
      navigate(`/dashboard/${investigation.public_id}`);
    } catch (error) {
      setMessage(error.message || "Could not reach the TrustHire API.");
    } finally {
      setSubmitting(false);
    }
  };

  const investigationTypes = [
    {
      icon: UserRound,
      title: "Recruiter identity",
      detail: "Examine recruiter details and available evidence.",
    },
    {
      icon: Building2,
      title: "Company authenticity",
      detail: "Examine company identity and online presence.",
    },
    {
      icon: Globe,
      title: "Domain intelligence",
      detail: "Inspect website and domain-related signals.",
    },
    {
      icon: FileSearch,
      title: "Document analysis",
      detail: "Look for inconsistencies in submitted documents.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#080D0B] text-[#E6F0EA]">
      <style>{`
        @keyframes detector-scan {
          0% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(360%);
          }
        }

        @keyframes detector-glow {
          0%, 100% {
            opacity: 0.45;
            transform: scale(0.92);
          }
          50% {
            opacity: 1;
            transform: scale(1.08);
          }
        }

        .detector-scan-line {
          animation: detector-scan 4.0s ease-in-out infinite;
        }

        .detector-glow {
          animation: detector-glow 3.0s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .detector-scan-line,
          .detector-glow {
            animation: none;
          }
        }
      `}</style>

      <div className="mx-auto max-w-[1450px] px-5 py-7 md:px-10">

        {/* Navigation */}
        <nav className="mb-12 flex items-center justify-between">
          <RouterLink to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#24533B] bg-[#10271B] text-[#39D98A]">
              <ShieldCheck size={24} />
            </div>

            <div>
              <span className="text-xl font-bold tracking-tight">
                TRUST<span className="text-[#39D98A]">HIRE</span>
              </span>
              <p className="text-[10px] font-semibold tracking-[0.18em] text-[#82968A]">
                RECRUITMENT INTELLIGENCE
              </p>
            </div>
          </RouterLink>

          <RouterLink
            to="/"
            className="flex items-center gap-2 rounded-xl border border-[#263A30] bg-[#101B15] px-4 py-2.5 text-sm text-[#A7B5AE] transition hover:border-[#39D98A]/40 hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to Home
          </RouterLink>
        </nav>

        {/* Page heading */}
        <header className="mb-12">
          <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-[#24533B] bg-[#10271B]/70 px-3.5 py-2 text-xs font-semibold tracking-[0.12em] text-[#39D98A]">
            <Sparkles size={15} />
            RECRUITMENT INVESTIGATION
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Investigate an opportunity
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#9BAC A2] md:text-base">
            Submit recruitment details, recruiter profiles or documents.
            TRUSTHIRE will help you examine the evidence behind an opportunity.
          </p>
        </header>

        <div className="grid items-start gap-7 lg:grid-cols-[1.55fr_0.8fr]">

          {/* Main form */}
          <div className="space-y-6">

            {/* Opportunity links */}
            <section className={`${panelClass} p-6 md:p-8`}>
              <div className="mb-7 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#24533B] bg-[#10271B] text-[#39D98A]">
                  <Link size={21} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Opportunity links
                  </h2>
                  <p className="mt-1 text-sm text-[#8FA197]">
                    Add the available recruitment URLs
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#C5D2CA]">
                    <Globe size={16} className="text-[#39D98A]" />
                    Job opportunity URL
                  </label>

                  <input
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    placeholder="https://example.com/job-opening"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#C5D2CA]">
                    <UserRound size={16} className="text-[#39D98A]" />
                    Recruiter profile URL
                  </label>

                  <input
                    value={recruiterUrl}
                    onChange={(e) => setRecruiterUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/recruiter"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#C5D2CA]">
                    <Building2 size={16} className="text-[#39D98A]" />
                    Company website or profile URL
                  </label>

                  <input
                    value={companyUrl}
                    onChange={(e) => setCompanyUrl(e.target.value)}
                    placeholder="https://company.com"
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            {/* Evidence upload */}
            <section className={`${panelClass} p-6 md:p-8`}>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#24533B] bg-[#10271B] text-[#39D98A]">
                  <FileSearch size={21} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Upload evidence
                  </h2>
                  <p className="mt-1 text-sm text-[#8FA197]">
                    Upload documents, screenshots or conversations
                  </p>
                </div>
              </div>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  addFiles(e.dataTransfer.files);
                }}
                onClick={() => fileInput.current?.click()}
                className={`cursor-pointer rounded-2xl border border-dashed p-8 text-center transition md:p-12 ${
                  dragging
                    ? "border-[#39D98A] bg-[#39D98A]/10"
                    : "border-[#286044] bg-[#0B1710]/70 hover:border-[#39D98A]/70 hover:bg-[#10271B]/60"
                }`}
              >
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#24533B] bg-[#10271B] text-[#39D98A]">
                  <UploadCloud size={31} />
                </div>

                <h3 className="mb-2 text-lg font-semibold text-white">
                  Drop your files here
                </h3>

                <p className="mb-6 text-sm text-[#91A399]">
                  or click to browse your device
                </p>

                <span className="inline-flex items-center gap-2 rounded-lg border border-[#31503E] bg-[#17251C] px-4 py-2.5 text-sm font-medium text-[#C7D5CC] transition hover:border-[#39D98A]/50 hover:text-[#39D98A]">
                  <FileText size={15} />
                  Choose files
                </span>

                <p className="mt-5 text-xs text-[#718379]">
                  PDF, PNG, JPG, JPEG, TXT, DOC and DOCX
                </p>

                <input
                  ref={fileInput}
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.txt,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    addFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </div>

              {files.length > 0 && (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[#D5E1D9]">
                      Selected files ({files.length})
                    </h3>

                    <button
                      type="button"
                      onClick={() => setFiles([])}
                      className="text-xs text-[#8FA197] transition hover:text-red-400"
                    >
                      Remove all
                    </button>
                  </div>

                  {files.map((file, index) => (
                    <div
                      key={`${file.name}-${file.size}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[#263A30] bg-[#0B1510] p-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <FileText
                          className="shrink-0 text-[#39D98A]"
                          size={20}
                        />

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[#D5E1D9]">
                            {file.name}
                          </p>
                          <p className="text-xs text-[#718379]">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="rounded-lg p-2 text-[#8FA197] transition hover:bg-red-500/10 hover:text-red-400"
                        aria-label={`Remove ${file.name}`}
                      >
                        <X size={17} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#39D98A]/30 bg-[#39D98A] py-4 font-semibold text-[#07120B] transition hover:bg-[#50E69A] disabled:cursor-wait disabled:opacity-60"
            >
              <Search size={19} />
              {submitting ? "Investigating..." : "Start investigation"}
            </button>

            {/* Risk detector scanning animation */}
            {submitting && (
              <section
                aria-live="polite"
                aria-busy="true"
                className="overflow-hidden rounded-2xl border border-[#24533B] bg-[#0D1A12] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.2)]"
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#39D98A]/30 bg-[#39D98A]/[0.08]">
                    <div className="absolute inset-1 rounded-full border border-[#39D98A]/25 animate-ping" />
                    <Activity size={19} className="relative z-10 text-[#39D98A] detector-glow" />
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-white">
                      TRUSTHIRE detector is running
                    </p>
                    <p className="mt-1 text-xs text-[#91A399]">
                      Your evidence has been submitted. Waiting for the assessment response.
                    </p>
                  </div>

                  <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-[#39D98A] shadow-[0_0_12px_rgba(57,217,138,0.8)] animate-pulse" />
                </div>

                <div className="relative mt-5 h-1.5 overflow-hidden rounded-full bg-[#20352A]">
                  <div className="detector-scan-line absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-r from-transparent via-[#39D98A] to-transparent" />
                </div>

                <div className="mt-4 grid gap-2 text-xs text-[#A7B5AE] sm:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#39D98A] animate-pulse" />
                    Evidence submitted
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full border border-[#39D98A] animate-pulse" />
                    Analysis request pending
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full border border-[#718379]" />
                    Report awaiting response
                  </div>
                </div>

                <p className="mt-4 text-[11px] leading-5 text-[#718379]">
                  The scan animation indicates that TRUSTHIRE is processing your request.
                  It does not represent individual checks or completed analysis stages.
                </p>
              </section>
            )}

            {message && (
              <div className="flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                {message}
              </div>
            )}

            <p className="text-center text-xs leading-6 text-[#718379]">
              Links and documents are checked for known recruitment-fraud
              patterns. A low score means those patterns were not found.
              It is not proof the offer is genuine.
            </p>
          </div>

          {/* Information panel */}
          <aside className="space-y-6">
            <section className={`${panelClass} p-6`}>
              <div className="mb-7 flex items-center gap-3">
                <Shield className="text-[#39D98A]" size={22} />
                <h2 className="font-semibold text-white">
                  What we investigate
                </h2>
              </div>

              <div className="space-y-6">
                {investigationTypes.map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#24533B]/70 bg-[#10271B] text-[#39D98A]">
                      <item.icon size={19} />
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-[#DCE8E0]">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-[#8FA197]">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-[#24533B] bg-[#0D2117] p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-[#24533B] bg-[#10271B] text-[#39D98A]">
                <ShieldCheck size={23} />
              </div>

              <h2 className="mb-2 text-lg font-semibold text-white">
                Evidence before assumptions.
              </h2>

              <p className="text-sm leading-6 text-[#A7B5AE]">
                TRUSTHIRE is designed to assess available evidence, highlight
                suspicious signals and explain uncertainty. An unverified
                opportunity is not automatically fraudulent.
              </p>

              <div className="mt-5 border-t border-[#24533B]/70 pt-4">
                <div className="flex items-center gap-2 text-xs font-medium text-[#39D98A]">
                  <CheckCircle2 size={15} />
                  Evidence-led assessment
                </div>
              </div>
            </section>

            <div className="rounded-xl border border-[#263A30] bg-[#101B15]/60 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-[#A7B5AE]">
                <ShieldCheck size={15} className="text-[#39D98A]" />
                YOUR DATA, YOUR INVESTIGATION
              </div>
              <p className="mt-2 text-xs leading-5 text-[#718379]">
                Each submission is assessed using the evidence provided.
                Always verify important recruitment claims independently.
              </p>
            </div>
          </aside>
        </div>

        <footer className="mt-14 border-t border-[#1D3529] pt-6 text-center text-xs text-[#718379]">
          © 2026 TRUSTHIRE · Recruitment Intelligence Platform
        </footer>
      </div>
    </main>
  );
}
