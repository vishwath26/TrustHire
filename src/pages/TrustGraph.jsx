
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Network,
  UserRound,
  Building2,
  Globe,
  Mail,
  Phone,
  AlertTriangle,
  FileText,
  Info,
  ShieldCheck,
} from "lucide-react";

const nodes = [
  { id: "recruiter", label: "Recruiter", sub: "John Smith", type: "recruiter", x: 390, y: 85, detail: "A recruiter associated with the advertised internship. Identity verification is pending." },
  { id: "company", label: "Company", sub: "ABC Technologies", type: "company", x: 170, y: 205, detail: "The company named in the job opportunity. Its relationship with the recruiter requires verification." },
  { id: "email", label: "Email domain", sub: "gmail.com", type: "email", x: 390, y: 245, detail: "A free email provider is used instead of a verified company domain." },
  { id: "phone", label: "Phone number", sub: "+91 98XXXXXX21", type: "phone", x: 610, y: 205, detail: "A contact number supplied with the opportunity. No independent identity match is established." },
  { id: "website", label: "Website", sub: "abc-tech.example", type: "website", x: 170, y: 390, detail: "A website associated with the claimed company. Ownership and authenticity need independent checks." },
  { id: "incident", label: "Reported incident", sub: "Payment request", type: "incident", x: 610, y: 390, detail: "A sample report describes a registration-fee request. This is an allegation, not a confirmed fraud finding." },
  { id: "document", label: "Offer document", sub: "Internship offer.pdf", type: "document", x: 390, y: 470, detail: "A sample offer document whose details reportedly conflict with the job description." },
];

const connections = [
  ["recruiter", "company", "claims to represent"],
  ["recruiter", "email", "uses"],
  ["recruiter", "phone", "shares contact"],
  ["company", "website", "associated with"],
  ["phone", "incident", "mentioned in"],
  ["email", "incident", "mentioned in"],
  ["incident", "document", "references"],
];

const styles = {
  recruiter: { color: "#a78bfa", icon: UserRound },
  company: { color: "#22d3ee", icon: Building2 },
  email: { color: "#fbbf24", icon: Mail },
  phone: { color: "#34d399", icon: Phone },
  website: { color: "#60a5fa", icon: Globe },
  incident: { color: "#fb7185", icon: AlertTriangle },
  document: { color: "#c084fc", icon: FileText },
};

export default function TrustGraph() {
  const [selected, setSelected] = useState("recruiter");
  const activeNode = nodes.find((node) => node.id === selected);
  const ActiveIcon = styles[activeNode.type].icon;

  return (
    <main className="min-h-screen bg-[#080b14] text-white px-4 py-7 md:px-10">
      <div className="max-w-7xl mx-auto">
        <Link
          to="/report"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8"
        >
          <ArrowLeft size={16} />
          Back to risk report
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7">
          <div>
            <p className="text-sm text-cyan-400 mb-2">THREAT INTELLIGENCE</p>
            <h1 className="text-3xl md:text-4xl font-semibold">Recruitment Trust Graph</h1>
            <p className="text-gray-400 mt-2">
              Explore relationships between entities in this investigation.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400 border border-white/10 rounded-xl px-4 py-3">
            <Network size={17} className="text-cyan-300" />
            7 entities · 7 connections
          </div>
        </div>

        <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-4 flex gap-3 mb-6">
          <Info size={19} className="text-amber-300 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-200">Illustrative relationship graph</p>
            <p className="text-sm text-gray-400 mt-1">
              This is sample data, not a real investigation. A connection indicates a relationship to examine;
              it does not prove that an entity is fraudulent.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <section className="xl:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3 md:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 px-2 py-2">
              <div>
                <h2 className="font-semibold">Entity relationship map</h2>
                <p className="text-xs text-gray-500 mt-1">Select a node to inspect it</p>
              </div>
              <span className="text-xs text-gray-500">Sample investigation</span>
            </div>

            <div className="w-full overflow-x-auto">
              <svg viewBox="0 0 780 550" className="w-full min-w-[600px]" role="img" aria-label="Interactive recruitment entity relationship graph">
                {connections.map(([from, to, label]) => {
                  const a = nodes.find((n) => n.id === from);
                  const b = nodes.find((n) => n.id === to);
                  const highlighted = selected === from || selected === to;
                  return (
                    <g key={`${from}-${to}`}>
                      <line
                        x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                        stroke={highlighted ? "#67e8f9" : "#475569"}
                        strokeWidth={highlighted ? 2.5 : 1.5}
                        opacity={highlighted ? 0.9 : 0.55}
                      />
                      <title>{label}</title>
                    </g>
                  );
                })}

                {nodes.map((node) => {
                  const style = styles[node.type];
                  const active = selected === node.id;
                  return (
                    <g
                      key={node.id}
                      onClick={() => setSelected(node.id)}
                      className="cursor-pointer"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") setSelected(node.id);
                      }}
                    >
                      <circle
                        cx={node.x} cy={node.y} r={active ? 34 : 29}
                        fill={style.color}
                        fillOpacity={active ? 0.24 : 0.12}
                        stroke={style.color}
                        strokeWidth={active ? 3 : 1.5}
                      />
                      <circle
                        cx={node.x} cy={node.y} r="5"
                        fill={style.color}
                      />
                      <text
                        x={node.x} y={node.y + 51}
                        fill={active ? "#ffffff" : "#cbd5e1"}
                        fontSize="14" textAnchor="middle" fontWeight="600"
                      >
                        {node.label}
                      </text>
                      <text
                        x={node.x} y={node.y + 68}
                        fill="#94a3b8" fontSize="11" textAnchor="middle"
                      >
                        {node.sub}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-3 border-t border-white/10 pt-4 px-2">
              {Object.entries(styles).map(([type, style]) => (
                <div key={type} className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: style.color }} />
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </div>
              ))}
            </div>
          </section>

          <aside className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-xs text-cyan-400 tracking-wider mb-4">ENTITY DETAILS</p>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ backgroundColor: `${styles[activeNode.type].color}20`, color: styles[activeNode.type].color }}
            >
              <ActiveIcon size={23} />
            </div>
            <h2 className="text-xl font-semibold">{activeNode.label}</h2>
            <p className="text-sm text-gray-400 mt-1">{activeNode.sub}</p>
            <div className="border-t border-white/10 my-5" />
            <p className="text-xs text-gray-500 mb-2">INVESTIGATION NOTE</p>
            <p className="text-sm text-gray-300 leading-6">{activeNode.detail}</p>

            <div className="mt-6 rounded-xl bg-white/[0.04] border border-white/10 p-4">
              <div className="flex items-center gap-2 text-sm text-amber-300 mb-2">
                <Info size={16} />
                Interpretation
              </div>
              <p className="text-xs text-gray-400 leading-5">
                This relationship is an investigative lead. More independent evidence is needed before drawing a conclusion.
              </p>
            </div>
          </aside>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex gap-3">
          <ShieldCheck size={20} className="text-cyan-300 shrink-0" />
          <div>
            <h3 className="font-medium">Evidence before judgment</h3>
            <p className="text-sm text-gray-400 mt-1 leading-6">
              TRUSTHIRE uses connected entities to identify patterns for further review.
              A shared phone number, email, or website alone is not proof of fraud.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
