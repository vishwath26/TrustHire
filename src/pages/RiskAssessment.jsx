
import { Link } from "react-router-dom";
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
  XCircle,
  Info,
  Download,
} from "lucide-react";

const findings = [
  {
    icon: UserRound,
    title: "Recruiter identity",
    detail: "No matching recruiter profile found on the claimed company website.",
    points: 12,
    status: "Review",
  },
  {
    icon: Building2,
    title: "Company verification",
    detail: "Company website found, but the advertised role was not listed on its careers page.",
    points: 9,
    status: "Review",
  },
  {
    icon: Globe,
    title: "Email domain",
    detail: "Recruiter uses a free email provider instead of the company's official domain.",
    points: 20,
    status: "High risk",
  },
  {
    icon: CreditCard,
    title: "Payment request",
    detail: "The opportunity requests a registration fee before joining.",
    points: 25,
    status: "High risk",
  },
  {
    icon: FileText,
    title: "Document analysis",
    detail: "Details in the offer letter conflict with the original job description.",
    points: 12,
    status: "Review",
  },
];

const recommendations = [
  "Do not pay any registration or training fee.",
  "Confirm the job opening through the company's official careers page.",
  "Contact the company's HR team using independently verified contact details.",
  "Report the suspicious opportunity to your college placement cell.",
  "Avoid sharing identity documents or sensitive personal information.",
];

function RiskAssessment() {
  const score = 78;

  return (
    <main className="min-h-screen bg-[#080b14] text-white px-5 py-8 md:px-10">
      <div className="max-w-6xl mx-auto">

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition mb-8"
        >
          <ArrowLeft size={16} />
          Back to investigation
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-cyan-400 mb-2">INVESTIGATION REPORT</p>
            <h1 className="text-3xl md:text-4xl font-semibold">
              Risk Assessment
            </h1>
            <p className="text-gray-400 mt-2">
              A breakdown of the evidence and potential recruitment risks.
            </p>
          </div>

          <div className="text-sm text-gray-400 border border-white/10 rounded-xl px-4 py-3">
            Report ID: <span className="text-white">TRH-DEMO-001</span>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4 flex gap-3 mb-8">
          <Info className="text-amber-300 shrink-0 mt-0.5" size={19} />
          <div>
            <p className="text-sm font-medium text-amber-200">
              Illustrative example — not a real verification
            </p>
            <p className="text-sm text-gray-400 mt-1">
              This report demonstrates how TRUSTHIRE may present findings.
              No actual recruiter, company, or document has been verified.
            </p>
          </div>
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">

          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-5">
              <ShieldAlert size={18} />
              Overall risk assessment
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-8">
              <div className="relative w-40 h-40 shrink-0 rounded-full flex items-center justify-center"
                style={{
                  background: `conic-gradient(#f59e0b ${score * 3.6}deg, #252b38 0deg)`,
                }}
              >
                <div className="w-[126px] h-[126px] rounded-full bg-[#0b1020] flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold">{score}</span>
                  <span className="text-xs text-gray-400">out of 100</span>
                </div>
              </div>

              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 text-red-300 px-3 py-1 text-sm">
                  <AlertTriangle size={14} />
                  High Risk
                </span>
                <h2 className="text-2xl font-semibold mt-3">
                  Multiple warning signs detected
                </h2>
                <p className="text-gray-400 text-sm leading-6 mt-2">
                  Several findings require attention. Review the supporting
                  evidence carefully before deciding whether to proceed.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm text-gray-400 mb-5">Opportunity details</p>

            <div className="space-y-5">
              <div>
                <p className="text-xs text-gray-500">JOB ROLE</p>
                <p className="text-sm mt-1">Software Development Internship</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">CLAIMED COMPANY</p>
                <p className="text-sm mt-1">ABC Technologies</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">REPORT STATUS</p>
                <p className="text-sm mt-1 text-amber-300">Demo assessment</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 mb-8">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl font-semibold">Evidence breakdown</h2>
              <p className="text-sm text-gray-400 mt-1">
                Findings contributing to the illustrative risk score.
              </p>
            </div>
            <span className="text-xs text-gray-500">5 findings</span>
          </div>

          <div className="space-y-4">
            {findings.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={index}
                  className="rounded-xl border border-white/[0.07] bg-black/20 p-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center shrink-0">
                      <Icon size={19} className="text-cyan-300" />
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium">{item.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          item.status === "High risk"
                            ? "bg-red-400/10 text-red-300"
                            : "bg-amber-400/10 text-amber-300"
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-2 leading-6">
                        {item.detail}
                      </p>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <p className="text-lg font-semibold">+{item.points}</p>
                      <p className="text-xs text-gray-500">risk points</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center border-t border-white/10 mt-5 pt-5">
            <span className="text-sm text-gray-400">Total illustrative score</span>
            <span className="text-xl font-semibold text-amber-300">78 / 100</span>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 mb-8">
          <div className="flex items-center gap-2 mb-5">
            <ShieldCheck className="text-cyan-300" size={21} />
            <h2 className="text-xl font-semibold">Recommended actions</h2>
          </div>

          <div className="space-y-4">
            {recommendations.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle2 className="text-cyan-300 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-gray-300 leading-6">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
          <p className="text-xs text-gray-500">
            TRUSTHIRE · Evidence before judgment
          </p>

          <Link
            to="/investigate"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 text-black font-medium px-5 py-3 hover:bg-cyan-300 transition"
          >
            <Download size={17} />
            Start new investigation
          </Link>
        </div>

      </div>
    </main>
  );
}

export default RiskAssessment;
