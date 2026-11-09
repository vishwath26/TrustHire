
import { useRef, useState } from 'react'
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
} from 'lucide-react'
import { Link as RouterLink } from 'react-router-dom'

export default function Investigate() {
  const fileInput = useRef(null)
  const [files, setFiles] = useState([])
  const [jobUrl, setJobUrl] = useState('')
  const [recruiterUrl, setRecruiterUrl] = useState('')
  const [companyUrl, setCompanyUrl] = useState('')
  const [dragging, setDragging] = useState(false)
  const [message, setMessage] = useState('')

  const addFiles = (selectedFiles) => {
    const incoming = Array.from(selectedFiles)
    setFiles((previous) => {
      const combined = [...previous, ...incoming]
      return combined.filter(
        (file, index) =>
          combined.findIndex(
            (item) =>
              item.name === file.name &&
              item.size === file.size
          ) === index
      )
    })
  }

  const removeFile = (index) => {
    setFiles((previous) => previous.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    if (!jobUrl && !recruiterUrl && !companyUrl && files.length === 0) {
      setMessage('Please provide a link or upload at least one file.')
      return
    }

    setMessage(
      'Your submission is ready! The investigation engine will be connected in a later development phase.'
    )
  }

  return (
    <div className="min-h-screen bg-[#090817] text-slate-100">
      <div className="mx-auto max-w-7xl px-5 py-8 md:px-10">

        {/* Navigation */}
        <nav className="mb-12 flex items-center justify-between">
          <RouterLink to="/" className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-500/20 p-2.5 text-violet-300">
              <ShieldCheck size={25} />
            </div>
            <span className="text-xl font-bold tracking-wide">
              TRUST<span className="text-violet-400">HIRE</span>
            </span>
          </RouterLink>

          <RouterLink
            to="/"
            className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/10"
          >
            <ArrowLeft size={16} />
            Back to Home
          </RouterLink>
        </nav>

        {/* Heading */}
        <div className="mb-10 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-xs font-semibold tracking-wider text-violet-300">
            <Sparkles size={14} />
            AI-POWERED RECRUITMENT INTELLIGENCE
          </div>

          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            Investigate an{' '}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">
              Opportunity
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-400 md:text-base">
            Submit recruitment details, recruiter profiles or documents.
            TRUSTHIRE will help you examine the evidence behind an opportunity.
          </p>
        </div>

        <div className="grid gap-7 lg:grid-cols-[1.5fr_0.8fr]">

          {/* Main form */}
          <div className="space-y-7">

            {/* URL section */}
            <section className="glass-panel rounded-3xl p-6 md:p-8">
              <div className="mb-7 flex items-center gap-3">
                <div className="rounded-xl bg-violet-500/15 p-3 text-violet-300">
                  <Link size={21} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Opportunity links</h2>
                  <p className="text-sm text-slate-400">
                    Add the available recruitment URLs
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                    <Globe size={15} className="text-cyan-300" />
                    Job opportunity URL
                  </label>
                  <input
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    placeholder="https://example.com/job-opening"
                    className="w-full rounded-xl border border-white/10 bg-[#0c0a1d]/80 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-600 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/10"
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                    <UserRound size={15} className="text-violet-300" />
                    Recruiter profile URL
                  </label>
                  <input
                    value={recruiterUrl}
                    onChange={(e) => setRecruiterUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/recruiter"
                    className="w-full rounded-xl border border-white/10 bg-[#0c0a1d]/80 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-600 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/10"
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                    <Building2 size={15} className="text-cyan-300" />
                    Company website or profile URL
                  </label>
                  <input
                    value={companyUrl}
                    onChange={(e) => setCompanyUrl(e.target.value)}
                    placeholder="https://company.com"
                    className="w-full rounded-xl border border-white/10 bg-[#0c0a1d]/80 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-600 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/10"
                  />
                </div>
              </div>
            </section>

            {/* Upload section */}
            <section className="glass-panel rounded-3xl p-6 md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-cyan-400/10 p-3 text-cyan-300">
                  <FileSearch size={21} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Upload evidence</h2>
                  <p className="text-sm text-slate-400">
                    Upload documents, screenshots or conversations
                  </p>
                </div>
              </div>

              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragging(false)
                  addFiles(e.dataTransfer.files)
                }}
                onClick={() => fileInput.current?.click()}
                className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition md:p-12 ${
                  dragging
                    ? 'border-violet-400 bg-violet-500/10'
                    : 'border-violet-400/30 bg-violet-500/[0.04] hover:border-violet-400/70 hover:bg-violet-500/[0.08]'
                }`}
              >
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/25 to-cyan-400/15 text-violet-300">
                  <UploadCloud size={32} />
                </div>

                <h3 className="mb-2 text-lg font-semibold">
                  Drop your files here
                </h3>
                <p className="mb-5 text-sm text-slate-400">
                  or click to browse your device
                </p>

                <span className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300">
                  Choose files
                </span>

                <p className="mt-5 text-xs text-slate-500">
                  PDF, PNG, JPG, JPEG, TXT, DOC and DOCX
                </p>

                <input
                  ref={fileInput}
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.txt,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    addFiles(e.target.files)
                    e.target.value = ''
                  }}
                />
              </div>

              {files.length > 0 && (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">
                      Selected files ({files.length})
                    </h3>
                    <button
                      onClick={() => setFiles([])}
                      className="text-xs text-slate-400 hover:text-red-400"
                    >
                      Remove all
                    </button>
                  </div>

                  {files.map((file, index) => (
                    <div
                      key={`${file.name}-${file.size}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <FileText className="shrink-0 text-cyan-300" size={20} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {file.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => removeFile(index)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
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
              onClick={handleSubmit}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-500 py-4 font-semibold shadow-lg shadow-violet-900/30 transition hover:-translate-y-1 hover:shadow-violet-700/30"
            >
              <Search size={19} />
              Prepare Investigation
            </button>

            {message && (
              <div className="flex items-start gap-3 rounded-xl border border-violet-400/20 bg-violet-500/10 p-4 text-sm text-violet-200">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                {message}
              </div>
            )}

            <p className="text-center text-xs text-slate-500">
              This is an evidence-submission interface. No investigation is
              performed until the backend is connected.
            </p>
          </div>

          {/* Right information panel */}
          <aside className="space-y-6">
            <section className="glass-panel rounded-3xl p-6">
              <div className="mb-6 flex items-center gap-3">
                <Shield className="text-violet-300" size={22} />
                <h2 className="font-semibold">What we investigate</h2>
              </div>

              <div className="space-y-5">
                {[
                  {
                    icon: UserRound,
                    title: 'Recruiter identity',
                    detail: 'Examine recruiter details and available evidence.',
                  },
                  {
                    icon: Building2,
                    title: 'Company authenticity',
                    detail: 'Examine company identity and online presence.',
                  },
                  {
                    icon: Globe,
                    title: 'Domain intelligence',
                    detail: 'Inspect website and domain-related signals.',
                  },
                  {
                    icon: FileSearch,
                    title: 'Document analysis',
                    detail: 'Look for inconsistencies in submitted documents.',
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <div className="rounded-xl bg-white/5 p-2.5 text-cyan-300">
                      <item.icon size={19} />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">{item.title}</h3>
                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="overflow-hidden rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-600/20 to-cyan-500/10 p-6">
              <Sparkles className="mb-4 text-violet-300" size={25} />
              <h2 className="mb-2 text-lg font-semibold">
                Evidence before assumptions.
              </h2>
              <p className="text-sm leading-6 text-slate-300">
                TRUSTHIRE is designed to assess available evidence, highlight
                suspicious signals and explain uncertainty. An unverified
                opportunity is not automatically fraudulent.
              </p>
            </section>
          </aside>
        </div>

        <footer className="mt-14 border-t border-white/10 pt-6 text-center text-xs text-slate-500">
          © 2026 TRUSTHIRE · Recruitment Intelligence Platform
        </footer>
      </div>
    </div>
  )
}
