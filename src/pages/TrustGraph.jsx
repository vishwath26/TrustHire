import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
import { getGraph, listInvestigations } from "../api";

const styles = {
  recruiter: { color: "#a78bfa", icon: UserRound },
  company: { color: "#22d3ee", icon: Building2 },
  email: { color: "#fbbf24", icon: Mail },
  phone: { color: "#34d399", icon: Phone },
  website: { color: "#60a5fa", icon: Globe },
  incident: { color: "#fb7185", icon: AlertTriangle },
  document: { color: "#c084fc", icon: FileText },
};

function layout(nodes) {
  const cx = 390;
  const cy = 275;
  const rx = 260;
  const ry = 190;

  return nodes.map((node, index) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / Math.max(nodes.length, 1);
    return {
      ...node,
      x: cx + rx * Math.cos(angle),
      y: cy + ry * Math.sin(angle),
    };
  });
}

export default function TrustGraph() {
  const { publicId } = useParams();
  const navigate = useNavigate();
  const [graph, setGraph] = useState(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        if (!publicId) {
          const list = await listInvestigations();
          if (cancelled) return;
          if (list[0]) navigate(`/trust-graph/${list[0].public_id}`, { replace: true });
          else setError("Run an investigation to build a trust graph.");
          return;
        }

        const data = await getGraph(publicId);
        if (cancelled) return;
        setGraph(data);
        setSelected(data.nodes[0]?.id || "");
      } catch (loadError) {
        if (!cancelled) setError(loadError.message);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [publicId, navigate]);

  const nodes = useMemo(() => layout(graph?.nodes || []), [graph]);
  const connections = graph?.edges || [];
  const activeNode = nodes.find((node) => node.id === selected) || nodes[0];
  const ActiveIcon = activeNode ? (styles[activeNode.type] || styles.document).icon : FileText;

  return (
    <main className="min-h-screen bg-[#080b14] text-white px-4 py-7 md:px-10">
      <div className="max-w-7xl mx-auto">
        <Link
          to={publicId ? `/report/${publicId}` : "/report"}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8"
        >
          <ArrowLeft size={16} />
          Back to risk report
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7">
          <div>
            <p className="text-sm text-cyan-400 mb-2">THREAT INTELLIGENCE</p>
            <h1 className="text-3xl md:text-4xl font-semibold">Recruitment Trust Graph</h1>
            <p className="text-gray-400 mt-2">Relationships extracted from this investigation.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400 border border-white/10 rounded-xl px-4 py-3">
            <Network size={17} className="text-cyan-300" />
            {nodes.length} entities · {connections.length} connections
          </div>
        </div>

        {error && <p className="text-sm text-red-200 mb-6">{error}</p>}

        {graph && nodes.length > 0 && activeNode && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <section className="xl:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3 md:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 px-2 py-2">
                <div>
                  <h2 className="font-semibold">Entity relationship map</h2>
                  <p className="text-xs text-gray-500 mt-1">Select a node to inspect it</p>
                </div>
                <span className="text-xs text-gray-500">{graph.public_id}</span>
              </div>

              <div className="w-full overflow-x-auto">
                <svg viewBox="0 0 780 550" className="w-full min-w-[600px]" role="img" aria-label="Recruitment entity relationship graph">
                  {connections.map((edge) => {
                    const a = nodes.find((node) => node.id === edge.source);
                    const b = nodes.find((node) => node.id === edge.target);
                    if (!a || !b) return null;
                    const highlighted = selected === edge.source || selected === edge.target;
                    return (
                      <g key={`${edge.source}-${edge.target}-${edge.label}`}>
                        <line
                          x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                          stroke={highlighted ? "#67e8f9" : "#475569"}
                          strokeWidth={highlighted ? 2.5 : 1.5}
                          opacity={highlighted ? 0.9 : 0.55}
                        />
                        <title>{edge.label}</title>
                      </g>
                    );
                  })}

                  {nodes.map((node) => {
                    const style = styles[node.type] || styles.document;
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
                        <circle cx={node.x} cy={node.y} r="5" fill={style.color} />
                        <text x={node.x} y={node.y + 51} fill={active ? "#ffffff" : "#cbd5e1"} fontSize="14" textAnchor="middle" fontWeight="600">
                          {node.label}
                        </text>
                        <text x={node.x} y={node.y + 68} fill="#94a3b8" fontSize="11" textAnchor="middle">
                          {node.sub}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </section>

            <aside className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <p className="text-xs text-cyan-400 tracking-wider mb-4">ENTITY DETAILS</p>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{
                  backgroundColor: `${(styles[activeNode.type] || styles.document).color}20`,
                  color: (styles[activeNode.type] || styles.document).color,
                }}
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
                  A connection is a lead. It does not prove that an entity is fraudulent.
                </p>
              </div>
            </aside>
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex gap-3">
          <ShieldCheck size={20} className="text-cyan-300 shrink-0" />
          <div>
            <h3 className="font-medium">Evidence before judgment</h3>
            <p className="text-sm text-gray-400 mt-1 leading-6">
              TRUSTHIRE connects the recruiter, company, domains, and files from one investigation.
              A shared phone number, email, or website alone is not proof of fraud.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
