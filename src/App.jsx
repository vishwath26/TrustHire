
import { useState } from "react";
import {Routes, Route, Link} from "react-router-dom";
import Investigate from "./pages/investigate";
import InvestigationDashboard from './pages/InvestigationDashboard'
import RiskAssessment from "./pages/RiskAssessment";
import TrustGraph from "./pages/TrustGraph";
import ThreatIntelligence from "./pages/ThreatIntelligence";
import MyInvestigations from "./pages/MyInvestigations";
import AppLayout from "./components/AppLayout";
const features = [
  {
    icon: "⌕",
    title: "AI Recruiter Verification",
    description:
      "Investigate recruiter identities, email addresses and claimed company associations.",
    color: "purple",
  },
  {
    icon: "◎",
    title: "Company Intelligence",
    description:
      "Check official websites, company domains and recruitment portals.",
    color: "cyan",
  },
  {
    icon: "⌘",
    title: "Fraud Pattern Detection",
    description:
      "Identify suspicious job offers, payment requests and impersonation indicators.",
    color: "pink",
  },
  {
    icon: "⬡",
    title: "Recruitment Trust Graph",
    description:
      "Discover connections between recruiters, companies, domains and reported incidents.",
    color: "blue",
  },
];

function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-hidden bg-transparent text-white">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-purple-700/20 blur-[120px]" />
        <div className="absolute -right-40 top-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <a href="#" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-purple-400/40 bg-purple-500/20 text-2xl text-purple-300">
            ◈
          </div>
          <span className="text-2xl font-bold tracking-wide">
            TRUST<span className="text-purple-400">HIRE</span>
          </span>
        </a>

        <div className="hidden items-center gap-9 text-sm text-gray-300 md:flex">
          <a href="#features" className="transition hover:text-purple-300">Features</a>
          <a href="#how-it-works" className="transition hover:text-purple-300">How it works</a>
          <a href="#about" className="transition hover:text-purple-300">About</a>
        </div>

        <Link
         to="/investigate"
         className="hidden rounded-xl border border-purple-400/40 bg-purple-500/20 px-6 py-3 font-semibold transition hover:bg-purple-500/40 md:block"
       >
        Start investigating ↗
       </Link>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-2xl md:hidden"
          aria-label="Toggle navigation"
        >
          ☰
        </button>

        {menuOpen && (
          <div className="absolute left-5 right-5 top-20 flex flex-col gap-5 rounded-2xl border border-white/10 bg-[#17132a] p-6 md:hidden">
            <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
            <Link to="/investigate" onClick={() => setMenuOpen(false)}>Start investigating ↗</Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <main className="relative z-10 mx-auto max-w-7xl px-6">
        <section className="grid min-h-[650px] items-center gap-16 py-20 lg:grid-cols-2">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-2 text-xs font-semibold tracking-widest text-purple-300">
              <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee]" />
              AI-POWERED RECRUITMENT INTELLIGENCE
            </div>

            <h1 className="max-w-2xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              Don't trust every opportunity.
              <span className="mt-2 block bg-gradient-to-r from-purple-400 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
                Verify it.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-gray-400">
              Fake recruiters. Fraudulent internships. Misleading job offers.
              TRUSTHIRE uses AI-powered investigation to help you understand
              who's really behind an opportunity.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#investigate"
                className="rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 px-7 py-4 font-semibold shadow-lg shadow-purple-900/40 transition hover:-translate-y-1 hover:shadow-purple-500/30"
              >
                Investigate an opportunity →
              </a>
              <a
                href="#how-it-works"
                className="rounded-xl border border-white/15 bg-white/5 px-7 py-4 font-semibold text-gray-200 backdrop-blur-xl transition hover:bg-white/10"
              >
                Explore platform
              </a>
            </div>

            <div className="mt-12 flex flex-wrap gap-7 text-sm text-gray-400">
              <span>✦ Evidence-based analysis</span>
              <span>✦ Explainable risk reports</span>
            </div>
          </div>

          {/* Glass investigation card */}
          <div className="relative">
            <div className="absolute -inset-5 rounded-[40px] bg-gradient-to-r from-purple-600/20 to-cyan-500/20 blur-3xl" />

            <div className="relative rounded-3xl border border-white/15 bg-white/[0.07] p-6 shadow-2xl shadow-purple-950/40 backdrop-blur-2xl sm:p-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div>
                  <p className="text-xs font-semibold tracking-widest text-purple-300">
                    TRUSTHIRE INTELLIGENCE
                  </p>
                  <h2 className="mt-2 text-xl font-bold">Investigation preview</h2>
                </div>
                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs text-cyan-300">
                  DEMO
                </span>
              </div>

              <div className="mt-7 rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 text-2xl text-purple-300">
                    ◈
                  </div>
                  <div>
                    <p className="font-semibold">Recruiter investigation</p>
                    <p className="mt-1 text-xs text-gray-400">
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
                    <div key={name} className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">{name}</span>
                      <span className="text-xs text-cyan-300">● {status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-purple-400/20 bg-purple-500/10 p-4">
                  <p className="text-2xl text-purple-300">⌘</p>
                  <p className="mt-2 text-sm font-semibold">AI Analysis</p>
                  <p className="mt-1 text-xs text-gray-400">Intelligent investigation</p>
                </div>
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4">
                  <p className="text-2xl text-cyan-300">⬡</p>
                  <p className="mt-2 text-sm font-semibold">Trust Graph</p>
                  <p className="mt-1 text-xs text-gray-400">Connected intelligence</p>
                </div>
              </div>

              <p className="mt-5 text-center text-xs text-gray-500">
                Illustrative interface preview · Not a live investigation
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-20 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold tracking-[0.25em] text-purple-400">
              INTELLIGENT PROTECTION
            </p>
            <h2 className="mt-4 text-4xl font-bold">
              More than a simple scam detector.
            </h2>
            <p className="mt-5 leading-7 text-gray-400">
              Investigate the people, organizations and digital connections
              behind recruitment opportunities.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:border-purple-400/40 hover:bg-white/[0.08]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-500/15 text-3xl text-purple-300">
                  {feature.icon}
                </div>
                <h3 className="mt-6 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-20 py-20">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-purple-500/10 via-white/[0.03] to-cyan-500/10 p-8 backdrop-blur-2xl sm:p-12">
            <p className="text-sm font-bold tracking-widest text-cyan-300">
              SIMPLE PROCESS. DEEP INVESTIGATION.
            </p>
            <h2 className="mt-4 text-3xl font-bold">How TRUSTHIRE works</h2>

            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {[
                ["01", "Submit an opportunity", "Upload an offer letter, screenshot or job posting."],
                ["02", "AI-powered investigation", "Analyze identity, company details, domains and suspicious patterns."],
                ["03", "Understand the findings", "Receive an explainable assessment with evidence and recommendations."],
              ].map(([number, title, description]) => (
                <div key={number}>
                  <span className="text-3xl font-bold text-purple-400">{number}</span>
                  <h3 className="mt-4 text-xl font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-400">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section id="investigate" className="scroll-mt-20 py-24 text-center">
          <div id="about" className="mx-auto max-w-3xl rounded-3xl border border-purple-400/20 bg-purple-500/[0.08] p-10 backdrop-blur-2xl sm:p-14">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-400/30 bg-purple-500/20 text-3xl text-purple-300">
              ◈
            </div>
            <h2 className="mt-7 text-3xl font-bold sm:text-4xl">
              Before you trust an opportunity, investigate it.
            </h2>
            <p className="mt-5 text-gray-400">
              Your next career opportunity deserves more than blind trust.
            </p>
            <Link
  to="/investigate"
  className="hidden rounded-xl border border-purple-400/40 bg-purple-500/20 px-6 py-3 font-semibold transition hover:bg-purple-500/40 md:block"
>
  Start investigating ↗
</Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-gray-500 sm:flex-row">
          <p>© 2026 TRUSTHIRE. AI-powered recruitment intelligence.</p>
          <p>Verify opportunities. Protect your future.</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Routes>
  {/* Public landing page — no sidebar */}
  <Route path="/" element={<HomePage />} />

  {/* Application pages — shared sidebar */}
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