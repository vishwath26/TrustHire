
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ShieldAlert,
  Search,
  TrendingUp,
  Users,
  Globe,
  Phone,
  Mail,
  AlertTriangle,
  Clock,
  ExternalLink,
  Info,
  Filter,
} from "lucide-react";

const indicators = [
  {
    type: "Email domain",
    value: "gmail.com",
    reports: 18,
    category: "Free email provider",
    icon: Mail,
    color: "text-amber-300",
  },
  {
    type: "Phone number",
    value: "+91 98XXXXXX21",
    reports: 7,
    category: "Repeatedly reported",
    icon: Phone,
    color: "text-rose-300",
  },
  {
    type: "Website",
    value: "abc-tech.example",
    reports: 5,
    category: "Requires verification",
    icon: Globe,
    color: "text-cyan-300",
  },
];

const reports = [
  {
    title: "Internship registration fee request",
    description: "A student reported being asked to pay a fee before receiving an internship offer.",
    source: "Community report",
    time: "2 hours ago",
    status: "Needs review",
  },
  {
    title: "Recruiter using an unverified email",
    description: "An opportunity was shared using a personal email address rather than a verified company domain.",
    source: "Community report",
    time: "Yesterday",
    status: "Under review",
  },
  {
    title: "Conflicting offer letter details",
    description: "A submitted offer document contained details that differed from the original job description.",
    source: "Document analysis",
    time: "2 days ago",
    status: "Needs review",
  },
];

const patterns = [
  { label: "Upfront payment requests", count: 32, width: "82%" },
  { label: "Unverified recruiter identity", count: 24, width: "64%" },
  { label: "Personal email domains", count: 18, width: "48%" },
  { label: "Conflicting offer documents", count: 12, width: "32%" },
];

export default function ThreatIntelligence() {
  return (
    <main className="min-h-screen bg-[#080b14] text-white px-4 py-7 md:px-10">
      <div className="max-w-7xl mx-auto">

        <Link
          to="/trust-graph"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8"
        >
          <ArrowLeft size={16} />
          Back to Trust Graph
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-cyan-400 mb-2">COMMUNITY INTELLIGENCE</p>
            <h1 className="text-3xl md:text-4xl font-semibold">
              Threat Intelligence
            </h1>
            <p className="text-gray-400 mt-2">
              Discover reported recruitment threats and suspicious patterns.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm text-gray-400">
            <ShieldAlert size={18} className="text-cyan-300" />
            Intelligence centre
          </div>
        </div>

        <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-4 flex gap-3 mb-8">
          <Info size={19} className="text-amber-300 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-200">
              Demonstration data
            </p>
            <p className="text-sm text-gray-400 mt-1">
              All indicators, counts, reports and timestamps on this page are illustrative.
              They are not verified reports or real-world threat statistics.
            </p>
          </div>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <Users size={20} className="text-cyan-300 mb-4" />
            <p className="text-3xl font-semibold">42</p>
            <p className="text-sm text-gray-400 mt-1">Sample community reports</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <Globe size={20} className="text-amber-300 mb-4" />
            <p className="text-3xl font-semibold">15</p>
            <p className="text-sm text-gray-400 mt-1">Sample flagged indicators</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <TrendingUp size={20} className="text-rose-300 mb-4" />
            <p className="text-3xl font-semibold">4</p>
            <p className="text-sm text-gray-400 mt-1">Sample recurring patterns</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <Clock size={20} className="text-violet-300 mb-4" />
            <p className="text-3xl font-semibold">12</p>
            <p className="text-sm text-gray-400 mt-1">Sample reports under review</p>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-8">

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Suspicious indicators</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Repeatedly mentioned entities in sample reports.
                </p>
              </div>
              <Search size={19} className="text-gray-400" />
            </div>

            <div className="space-y-4">
              {indicators.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.value} className="rounded-xl border border-white/[0.08] bg-black/20 p-4">
                    <div className="flex items-start gap-3">
                      <Icon size={20} className={`${item.color} mt-1 shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">{item.type}</p>
                        <p className="font-medium mt-1 break-all">{item.value}</p>
                        <p className="text-xs text-gray-400 mt-1">{item.category}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold">{item.reports}</p>
                        <p className="text-xs text-gray-500">mentions</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Common fraud patterns</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Illustrative distribution of reported patterns.
                </p>
              </div>
              <TrendingUp size={19} className="text-gray-400" />
            </div>

            <div className="space-y-6">
              {patterns.map((pattern) => (
                <div key={pattern.label}>
                  <div className="flex justify-between gap-3 text-sm mb-2">
                    <span className="text-gray-300">{pattern.label}</span>
                    <span className="text-gray-400">{pattern.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-cyan-400"
                      style={{ width: pattern.width }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl font-semibold">Recent community reports</h2>
              <p className="text-sm text-gray-400 mt-1">
                Recent examples of reported recruitment concerns.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Filter size={16} />
              All categories
            </div>
          </div>

          <div className="space-y-3">
            {reports.map((report, index) => (
              <div key={index} className="rounded-xl border border-white/[0.08] bg-black/20 p-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div>
                    <h3 className="font-medium">{report.title}</h3>
                    <p className="text-sm text-gray-400 mt-2 leading-6">
                      {report.description}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
                      <span>{report.source}</span>
                      <span>·</span>
                      <span>{report.time}</span>
                    </div>
                  </div>

                  <span className="text-xs text-amber-300 bg-amber-400/10 px-3 py-1.5 rounded-full w-fit shrink-0">
                    {report.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex gap-3">
          <AlertTriangle size={20} className="text-amber-300 shrink-0" />
          <div>
            <h3 className="font-medium">Reports are investigative leads, not verdicts</h3>
            <p className="text-sm text-gray-400 mt-1 leading-6">
              A frequently mentioned email, phone number or domain is not automatically fraudulent.
              Reports should be reviewed, corroborated and handled responsibly before any public conclusion.
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mt-8">
          <p className="text-xs text-gray-500">TRUSTHIRE · Community threat intelligence</p>
          <Link
            to="/investigate"
            className="text-sm text-cyan-300 hover:text-cyan-200"
          >
            Start investigation →
          </Link>
        </div>
      </div>
    </main>
  );
}
