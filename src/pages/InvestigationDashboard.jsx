
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
  LockKeyhole,
  UploadCloud,
} from 'lucide-react'

import { Link } from 'react-router-dom'

const investigationStages = [
  {
    number: '01',
    title: 'Document Extraction',
    description: 'Extracting recruiter details, contact information and job-related information from submitted evidence.',
    icon: FileSearch,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
  },
  {
    number: '02',
    title: 'Recruiter Verification',
    description: 'Examining recruiter identity, professional profiles, email addresses and available evidence.',
    icon: ShieldCheck,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
  {
    number: '03',
    title: 'Company Verification',
    description: 'Checking company identity, official presence and consistency of recruitment information.',
    icon: Building2,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
  {
    number: '04',
    title: 'Domain Intelligence',
    description: 'Inspecting website details, domain information and technical trust signals.',
    icon: Globe,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
  },
  {
    number: '05',
    title: 'Fraud Pattern Analysis',
    description: 'Looking for suspicious language, payment requests and inconsistencies across the evidence.',
    icon: BrainCircuit,
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
  },
]

export default function InvestigationDashboard() {
  return (
    <div className="min-h-screen text-white px-5 py-8 md:px-10">

      {/* Header */}
      <header className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-500/20">
            <ShieldCheck className="text-violet-400" size={25} />
          </div>

          <span className="text-xl font-bold tracking-wide">
            TRUSTHIRE
          </span>
        </div>

        <Link
          to="/investigate"
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
        >
          <ArrowLeft size={17} />
          Back to Investigation
        </Link>
      </header>

      <main className="max-w-7xl mx-auto mt-12">

        {/* Page heading */}
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

        {/* Demo notice */}
        <div className="glass-panel rounded-xl p-4 mb-7 flex items-start gap-3">
          <LockKeyhole className="text-cyan-400 mt-1 shrink-0" size={20} />
          <div>
            <p className="font-semibold text-sm">Dashboard preview</p>
            <p className="text-gray-400 text-xs mt-1">
              These are sample statuses. Live investigation results
              will appear when the backend and AI services are connected.
            </p>
          </div>
        </div>

        {/* Overview cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">

          <div className="glass-card rounded-2xl p-5">
            <div className="flex justify-between items-center">
              <p className="text-gray-400 text-sm">Investigation ID</p>
              <FileText className="text-violet-400" size={20} />
            </div>
            <h3 className="text-xl font-bold mt-4">TRH-DEMO-001</h3>
            <p className="text-gray-500 text-xs mt-2">Sample investigation</p>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="flex justify-between items-center">
              <p className="text-gray-400 text-sm">Analysis Progress</p>
              <Activity className="text-cyan-400" size={20} />
            </div>
            <h3 className="text-3xl font-bold mt-3">0%</h3>
            <p className="text-gray-500 text-xs mt-2">Awaiting backend connection</p>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="flex justify-between items-center">
              <p className="text-gray-400 text-sm">Investigation Status</p>
              <Clock3 className="text-yellow-400" size={20} />
            </div>
            <h3 className="text-xl font-bold mt-4">Pending</h3>
            <p className="text-gray-500 text-xs mt-2">Not started yet</p>
          </div>

        </div>

        {/* Progress section */}
        <section className="glass-panel rounded-2xl p-6 md:p-8 mb-8">

          <div className="flex flex-wrap justify-between items-center gap-3">
            <div>
              <h2 className="text-xl font-bold">Investigation Overview</h2>
              <p className="text-gray-400 text-sm mt-1">
                Overall progress across all investigation modules
              </p>
            </div>

            <span className="text-cyan-400 font-bold text-xl">0%</span>
          </div>

          <div className="w-full h-3 bg-white/10 rounded-full mt-6 overflow-hidden">
            <div className="h-full w-0 bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full" />
          </div>

          <div className="flex justify-between text-xs text-gray-500 mt-3">
            <span>Not started</span>
            <span>Completed</span>
          </div>

        </section>

        {/* Investigation modules */}
        <section className="mb-9">

          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-bold">Investigation Modules</h2>
              <p className="text-gray-400 text-sm mt-1">
                Five independent analysis modules
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {investigationStages.map((stage) => {
              const Icon = stage.icon

              return (
                <div
                  key={stage.number}
                  className="glass-card rounded-2xl p-6"
                >
                  <div className="flex justify-between items-start gap-4">

                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${stage.bg}`}>
                        <Icon className={stage.color} size={25} />
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          MODULE {stage.number}
                        </p>

                        <h3 className="font-bold text-lg">
                          {stage.title}
                        </h3>
                      </div>
                    </div>

                    <span className="flex items-center gap-1.5 text-xs text-yellow-300 bg-yellow-400/10 border border-yellow-400/20 rounded-full px-3 py-1.5 whitespace-nowrap">
                      <CircleDashed size={13} />
                      Pending
                    </span>

                  </div>

                  <p className="text-gray-400 text-sm leading-relaxed mt-5">
                    {stage.description}
                  </p>

                  <div className="mt-5 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-0 rounded-full" />
                  </div>

                  <p className="text-xs text-gray-500 mt-3">
                    Waiting for backend integration
                  </p>

                </div>
              )
            })}

          </div>
        </section>

        {/* Evidence section */}
        <section className="glass-panel rounded-2xl p-6 md:p-8 mb-8">

          <div className="flex items-center gap-3 mb-5">
            <div className="p-3 rounded-xl bg-cyan-500/10">
              <UploadCloud className="text-cyan-400" size={23} />
            </div>

            <div>
              <h2 className="text-xl font-bold">Evidence Repository</h2>
              <p className="text-gray-400 text-sm">
                Submitted documents and recruitment information
              </p>
            </div>
          </div>

          <div className="border border-dashed border-white/15 rounded-xl p-8 text-center">
            <FileText className="mx-auto text-gray-500" size={32} />

            <p className="font-semibold mt-3">No evidence connected</p>

            <p className="text-gray-500 text-sm mt-2">
              Submitted files will appear here after backend integration.
            </p>
          </div>

        </section>

        {/* Final assessment */}
        <section className="glass-panel rounded-2xl p-6 md:p-8 mb-10">

          <div className="flex items-center gap-3">
            <BrainCircuit className="text-violet-400" size={25} />

            <h2 className="text-xl font-bold">Final Risk Assessment</h2>
          </div>

          <p className="text-gray-400 text-sm mt-4 leading-relaxed">
            The final assessment will combine recruiter verification,
            company intelligence, domain signals, document evidence
            and fraud pattern analysis.
          </p>

          <div className="mt-6 rounded-xl bg-white/5 border border-white/10 p-5 text-center">
            <p className="text-gray-500 text-sm">Risk assessment unavailable</p>
            <p className="text-gray-400 text-xs mt-2">
              Waiting for investigation results. No risk classification
              has been assigned.
            </p>
          </div>

        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-gray-500 text-xs">
        © 2026 TRUSTHIRE · AI-Powered Recruitment Intelligence Platform
      </footer>

    </div>
  )
}
