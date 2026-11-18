
import { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import Investigate from "./pages/investigate";
import InvestigationDashboard from "./pages/InvestigationDashboard";
import RiskAssessment from "./pages/RiskAssessment";
import TrustGraph from "./pages/TrustGraph";
import ThreatIntelligence from "./pages/ThreatIntelligence";
import MyInvestigations from "./pages/MyInvestigations";
import AppLayout from "./components/AppLayout";

const features = [
  {
    icon: "⌕",
    title: "Recruiter Verification",
    description:
      "Investigate recruiter identities, email addresses and claimed company associations.",
  },
  {
    icon: "◎",
    title: "Company Intelligence",
    description:
      "Check official websites, company domains and recruitment portals.",
  },
  {
    icon: "⌘",
    title: "Fraud Pattern Detection",
    description:
      "Identify suspicious job offers, payment requests and impersonation indicators.",
  },
  {
    icon: "⬡",
    title: "Recruitment Trust Graph",
    description:
      "Discover connections between recruiters, companies, domains and reported incidents.",
  },
];

function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-hidden bg-[#080D0B] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-emerald-500/[0.07] blur-[130px]" />
        <div className="absolute -right-40 top-40 h-96 w-96 rounded-full bg-green-400/[0.05] blur-[130px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/10 text-2xl text-emerald-400">
            ◈
          </div>
          <span className="text-2xl font-bold tracking-wide">
            TRUST<span className="text-emerald-400">HIRE</span>
          </span>
        </Link>

        <div className="hidden items-center gap-9 text-sm text-[#A7B5AE] md:flex">
          <a href="#features" className="transition hover:text-emerald-400">
            Features
          </a>
          <a href="#how-it-works" className="transition hover:text-emerald-400">
            How it works
          </a>
          <a href="#about" className="transition hover:text-emerald-400">
            About
          </a>
          <a href="#future-scope" className="transition hover:text-emerald-400">
            Future Scope
          </a>
        </div>

        <Link
          to="/investigate"
          className="hidden rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-6 py-3 font-semibold text-emerald-300 transition hover:bg-emerald-400/20 md:block"
        >
          Start investigating ↗
        </Link>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-2xl text-emerald-400 md:hidden"
          aria-label="Toggle navigation"
        >
          ☰
        </button>

        {menuOpen && (
          <div className="absolute left-5 right-5 top-20 flex flex-col gap-5 rounded-xl border border-emerald-400/20 bg-[#111B17] p-6 md:hidden">
            <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
            <a href="#future-scope" onClick={() => setMenuOpen(false)}>Future Scope</a>
            <Link to="/investigate" onClick={() => setMenuOpen(false)}>
              Start investigating ↗
            </Link>
          </div>
        )}
      </nav>

      <main className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Hero */}
        <section className="grid min-h-[650px] items-center gap-16 py-20 lg:grid-cols-2">
          <div>
            <div className="mb-7 inline-flex items-center gap-3 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-2 text-xs font-semibold tracking-widest text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              RECRUITMENT SECURITY INTELLIGENCE
            </div>

            <h1 className="max-w-2xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              Don't trust every opportunity.
              <span className="mt-2 block text-emerald-400">
                Verify it.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-[#A7B5AE]">
              Fake recruiters. Fraudulent internships. Misleading job offers.
              TRUSTHIRE investigates recruitment opportunities to help you
              understand who's really behind them.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/investigate"
                className="rounded-lg bg-emerald-400 px-7 py-4 font-semibold text-[#07120C] transition hover:-translate-y-1 hover:bg-emerald-300"
              >
                Investigate an opportunity →
              </Link>

              <a
                href="#how-it-works"
                className="rounded-lg border border-white/15 bg-white/[0.03] px-7 py-4 font-semibold text-gray-200 transition hover:border-emerald-400/40 hover:bg-emerald-400/[0.05]"
              >
                Explore platform
              </a>
            </div>

            <div className="mt-12 flex flex-wrap gap-7 text-sm text-[#84938B]">
              <span>✓ Evidence-based analysis</span>
              <span>✓ Explainable risk reports</span>
            </div>
          </div>

          {/* Investigation preview */}
          <div className="relative">
            <div className="absolute -inset-5 rounded-3xl bg-emerald-500/[0.04] blur-3xl" />

            <div className="relative rounded-2xl border border-emerald-400/15 bg-[#111B17]/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
                <div>
                  <p className="text-xs font-semibold tracking-widest text-emerald-400">
                    TRUSTHIRE INTELLIGENCE
                  </p>
                  <h2 className="mt-2 text-xl font-bold">
                    Investigation preview
                  </h2>
                </div>
                <span className="rounded-md border border-emerald-400/25 bg-emerald-400/[0.08] px-3 py-1.5 text-xs text-emerald-300">
                  DEMO
                </span>
              </div>

              <div className="mt-7 rounded-xl border border-white/[0.08] bg-[#080D0B]/70 p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-400/10 text-2xl text-emerald-400">
                    ◈
                  </div>
                  <div>
                    <p className="font-semibold">Recruiter investigation</p>
                    <p className="mt-1 text-xs text-[#84938B]">
                      Multiple verification modules
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-5">
                  {[
                    ["Recruiter identity", "Checking"],
                    ["Company authenticity", "Analyzing"],
                    ["Domain verification", "Checking"],
                    ["Fraud pattern analysis", "Analyzing"],
                  ].map(([name, status]) => (
                    <div key={name} className="flex items-center justify-between gap-3">
                      <span className="text-sm text-[#C2CDC6]">{name}</span>
                      <span className="text-xs text-emerald-400">
                        ● {status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.05] p-4">
                  <p className="text-2xl text-emerald-400">⌘</p>
                  <p className="mt-2 text-sm font-semibold">AI Analysis</p>
                  <p className="mt-1 text-xs text-[#84938B]">
                    Intelligent investigation
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.05] p-4">
                  <p className="text-2xl text-emerald-400">⬡</p>
                  <p className="mt-2 text-sm font-semibold">Trust Graph</p>
                  <p className="mt-1 text-xs text-[#84938B]">
                    Connected intelligence
                  </p>
                </div>
              </div>

              <p className="mt-5 text-center text-xs text-[#718078]">
                Illustrative interface preview · Not a live investigation
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-20 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold tracking-[0.25em] text-emerald-400">
              INTELLIGENT PROTECTION
            </p>
            <h2 className="mt-4 text-4xl font-bold">
              More than a simple scam detector.
            </h2>
            <p className="mt-5 leading-7 text-[#A7B5AE]">
              Investigate the people, organizations and digital connections
              behind recruitment opportunities.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-white/[0.08] bg-[#111B17]/70 p-6 transition duration-300 hover:-translate-y-1 hover:border-emerald-400/30 hover:bg-[#18251F]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-400/[0.08] text-3xl text-emerald-400">
                  {feature.icon}
                </div>
                <h3 className="mt-6 text-lg font-semibold">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#A7B5AE]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-20 py-20">
          <div className="rounded-2xl border border-emerald-400/15 bg-[#111B17]/70 p-8 backdrop-blur-xl sm:p-12">
            <p className="text-sm font-bold tracking-widest text-emerald-400">
              SIMPLE PROCESS. DEEP INVESTIGATION.
            </p>
            <h2 className="mt-4 text-3xl font-bold">
              How TRUSTHIRE works
            </h2>

            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {[
                ["01", "Submit an opportunity", "Upload an offer letter, screenshot or job posting."],
                ["02", "Investigate the evidence", "Analyze identity, company details, domains and suspicious patterns."],
                ["03", "Understand the findings", "Receive an explainable assessment with evidence and recommendations."],
              ].map(([number, title, description]) => (
                <div key={number}>
                  <span className="text-3xl font-bold text-emerald-400">
                    {number}
                  </span>
                  <h3 className="mt-4 text-xl font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#A7B5AE]">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section id="investigate" className="scroll-mt-20 py-24 text-center">
          <div
            id="about"
            className="mx-auto max-w-3xl rounded-2xl border border-emerald-400/20 bg-[#111B17]/80 p-10 backdrop-blur-xl sm:p-14"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/10 text-3xl text-emerald-400">
              ◈
            </div>
            <h2 className="mt-7 text-3xl font-bold sm:text-4xl">
              Before you trust an opportunity, investigate it.
            </h2>
            <p className="mt-5 text-[#A7B5AE]">
              Your next career opportunity deserves more than blind trust.
            </p>
            <Link
              to="/investigate"
              className="mt-8 inline-block rounded-lg bg-emerald-400 px-7 py-4 font-semibold text-[#07120C] transition hover:bg-emerald-300"
            >
              Start investigating ↗
            </Link>
          </div>
        </section>

        {/* Future Scope */}
        <section id="future-scope" className="scroll-mt-20 py-24">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <p className="text-sm font-bold tracking-[0.25em] text-emerald-400">
                WHAT LIES AHEAD
              </p>
              <h2 className="mt-4 text-4xl font-bold sm:text-5xl">
                The future of <span className="text-emerald-400">TRUSTHIRE</span>
              </h2>
              <p className="mt-5 leading-7 text-[#A7B5AE]">
                Building a safer and smarter future for online recruitment.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-400/15 bg-[#111B17]/70 p-6 backdrop-blur-xl sm:p-9">
              <div className="space-y-5">
                {[
                  ["01", "Advanced AI Detection", "Improve scam detection with smarter AI models."],
                  ["02", "Company Verification", "Verify company details and identify fake organisations."],
                  ["03", "Browser Extension", "Check suspicious job postings while browsing."],
                  ["04", "Community Reporting", "Let users report and share suspicious job offers."],
                  ["05", "Multilingual Support", "Detect recruitment scams across multiple languages."],
                ].map(([number, title, description]) => (
                  <div
                    key={number}
                    className="flex items-start gap-5 rounded-xl border border-white/[0.07] bg-[#080D0B]/50 p-5 transition hover:border-emerald-400/25"
                  >
                    <span className="pt-0.5 text-lg font-bold text-emerald-400">
                      {number}
                    </span>
                    <div>
                      <h3 className="font-semibold text-white">{title}</h3>
                      <p className="mt-1 text-sm leading-6 text-[#A7B5AE]">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.08] px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-[#718078] sm:flex-row">
          <p>© 2026 TRUSTHIRE. Recruitment security intelligence.</p>
          <p>Verify opportunities. Protect your future.</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<InvestigationDashboard />} />
        <Route path="/dashboard/:publicId" element={<InvestigationDashboard />} />
        <Route path="/investigate" element={<Investigate />} />
        <Route path="/report" element={<RiskAssessment />} />
        <Route path="/report/:publicId" element={<RiskAssessment />} />
        <Route path="/trust-graph" element={<TrustGraph />} />
        <Route path="/trust-graph/:publicId" element={<TrustGraph />} />
        <Route path="/threat-intelligence" element={<ThreatIntelligence />} />
        <Route path="/my-investigations" element={<MyInvestigations />} />
      </Route>
    </Routes>
  );
}

export default App;
