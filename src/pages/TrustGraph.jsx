
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
  Activity,
} from "lucide-react";
import { getGraph, listInvestigations } from "../api";

const styles = {
  recruiter: {
    color: "#39D98A",
    icon: UserRound,
    label: "Recruiter",
  },
  company: {
    color: "#72CFA3",
    icon: Building2,
    label: "Company",
  },
  email: {
    color: "#A3BFAF",
    icon: Mail,
    label: "Email",
  },
  phone: {
    color: "#8BC9B0",
    icon: Phone,
    label: "Phone",
  },
  website: {
    color: "#64B99A",
    icon: Globe,
    label: "Website",
  },
  incident: {
    color: "#F06464",
    icon: AlertTriangle,
    label: "Incident",
  },
  document: {
    color: "#A6B9AE",
    icon: FileText,
    label: "Document",
  },
};

function layout(nodes) {
  const cx = 390;
  const cy = 275;
  const rx = 260;
  const ry = 190;

  return nodes.map((node, index) => {
    const angle =
      -Math.PI / 2 +
      (index * 2 * Math.PI) / Math.max(nodes.length, 1);

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

          if (list[0]) {
            navigate(`/trust-graph/${list[0].public_id}`, {
              replace: true,
            });
          } else {
            setError("Run an investigation to build a trust graph.");
          }

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

  const nodes = useMemo(
    () => layout(graph?.nodes || []),
    [graph]
  );

  const connections = graph?.edges || [];

  const activeNode =
    nodes.find((node) => node.id === selected) || nodes[0];

  const activeStyle = activeNode
    ? styles[activeNode.type] || styles.document
    : styles.document;

  const ActiveIcon = activeStyle.icon;

  return (
    <main className="min-h-screen bg-[#080D0B] text-[#F3F7F4] px-4 py-7 md:px-8 xl:px-10">
      <div className="max-w-[1500px] mx-auto">

        {/* Top navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-9">
          <Link
            to={publicId ? `/report/${publicId}` : "/report"}
            className="inline-flex items-center gap-2 text-sm text-[#9BAC A2] hover:text-[#39D98A] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to risk report
          </Link>

          <div className="flex items-center gap-2 rounded-xl border border-[#1D4935] bg-[#0D1A13] px-4 py-2.5 text-sm text-[#A7B5AE]">
            <Network size={17} className="text-[#39D98A]" />
            <span>{nodes.length} entities</span>
            <span className="text-[#52675C]">·</span>
            <span>{connections.length} connections</span>
          </div>
        </div>

        {/* Page heading */}
        <section className="mb-9">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#145438] bg-[#0B2418] px-4 py-2 text-xs font-semibold tracking-[0.14em] text-[#39D98A] mb-5">
            <Activity size={15} />
            THREAT INTELLIGENCE
          </div>

          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            Recruitment Trust{" "}
            <span className="text-[#39D98A]">Graph</span>
          </h1>

          <p className="text-[#9BAC A2] text-base md:text-lg mt-4 max-w-2xl leading-7">
            Explore relationships between recruiters, companies,
            contact details and documents identified during this
            investigation.
          </p>
        </section>

        {/* Error message */}
        {error && (
          <div className="rounded-xl border border-red-400/20 bg-red-400/[0.06] p-4 mb-7 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Graph content */}
        {graph && nodes.length > 0 && activeNode && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

            {/* Graph panel */}
            <section className="xl:col-span-2 rounded-2xl border border-[#153B2B] bg-[#101B15]/90 backdrop-blur-xl p-4 md:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.15)]">

              <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <Network size={19} className="text-[#39D98A]" />
                    <h2 className="font-semibold text-lg">
                      Entity relationship map
                    </h2>
                  </div>
                  <p className="text-sm text-[#82958A] mt-1">
                    Select an entity to explore its details
                  </p>
                </div>

                <span className="text-xs text-[#718278] bg-[#0A120E] border border-[#20372A] rounded-lg px-3 py-2">
                  {graph.public_id}
                </span>
              </div>

              {/* Graph visualization */}
              <div className="w-full overflow-x-auto rounded-xl border border-[#1A3829] bg-[#0A120E]">
                <svg
                  viewBox="0 0 780 550"
                  className="w-full min-w-[600px]"
                  role="img"
                  aria-label="Recruitment entity relationship graph"
                >
                  <defs>
                    <pattern
                      id="graph-grid"
                      width="30"
                      height="30"
                      patternUnits="userSpaceOnUse"
                    >
                      <circle
                        cx="1"
                        cy="1"
                        r="1"
                        fill="#294536"
                        opacity="0.45"
                      />
                    </pattern>
                  </defs>

                  <rect
                    width="780"
                    height="550"
                    fill="url(#graph-grid)"
                  />

                  {/* Connections */}
                  {connections.map((edge) => {
                    const a = nodes.find(
                      (node) => node.id === edge.source
                    );

                    const b = nodes.find(
                      (node) => node.id === edge.target
                    );

                    if (!a || !b) return null;

                    const highlighted =
                      selected === edge.source ||
                      selected === edge.target;

                    return (
                      <g
                        key={`${edge.source}-${edge.target}-${edge.label}`}
                      >
                        <line
                          x1={a.x}
                          y1={a.y}
                          x2={b.x}
                          y2={b.y}
                          stroke={highlighted ? "#39D98A" : "#496253"}
                          strokeWidth={highlighted ? 2.5 : 1.4}
                          opacity={highlighted ? 0.9 : 0.45}
                        />
                        <title>{edge.label}</title>
                      </g>
                    );
                  })}

                  {/* Entity nodes */}
                  {nodes.map((node) => {
                    const style =
                      styles[node.type] || styles.document;

                    const active = selected === node.id;

                    return (
                      <g
                        key={node.id}
                        onClick={() => setSelected(node.id)}
                        className="cursor-pointer"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (
                            event.key === "Enter" ||
                            event.key === " "
                          ) {
                            event.preventDefault();
                            setSelected(node.id);
                          }
                        }}
                      >
                        {active && (
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r="43"
                            fill={style.color}
                            fillOpacity="0.08"
                          />
                        )}

                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={active ? 34 : 29}
                          fill={style.color}
                          fillOpacity={active ? 0.2 : 0.1}
                          stroke={style.color}
                          strokeWidth={active ? 2.8 : 1.5}
                        />

                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="5"
                          fill={style.color}
                        />

                        <text
                          x={node.x}
                          y={node.y + 51}
                          fill={active ? "#F3F7F4" : "#C1CEC6"}
                          fontSize="14"
                          textAnchor="middle"
                          fontWeight="600"
                        >
                          {node.label}
                        </text>

                        <text
                          x={node.x}
                          y={node.y + 68}
                          fill="#82958A"
                          fontSize="11"
                          textAnchor="middle"
                        >
                          {node.sub}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Legend */}
              <div className="mt-5 pt-5 border-t border-[#20372A]">
                <p className="text-xs font-semibold tracking-wider text-[#82958A] mb-4">
                  ENTITY LEGEND
                </p>

                <div className="flex flex-wrap gap-x-6 gap-y-3">
                  {Object.entries(styles).map(([key, style]) => {
                    const Icon = style.icon;

                    return (
                      <div
                        key={key}
                        className="flex items-center gap-2 text-xs text-[#9BAC9F]"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: style.color }}
                        />
                        <Icon size={14} />
                        {style.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Entity details panel */}
            <aside className="rounded-2xl border border-[#153B2B] bg-[#101B15]/90 backdrop-blur-xl p-6 shadow-[0_12px_40px_rgba(0,0,0,0.15)]">

              <div className="flex items-center justify-between mb-6">
                <p className="text-xs font-semibold tracking-[0.15em] text-[#39D98A]">
                  ENTITY DETAILS
                </p>

                <span className="w-2 h-2 rounded-full bg-[#39D98A]" />
              </div>

              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 border"
                style={{
                  backgroundColor: `${activeStyle.color}15`,
                  borderColor: `${activeStyle.color}45`,
                  color: activeStyle.color,
                }}
              >
                <ActiveIcon size={25} />
              </div>

              <h2 className="text-xl font-semibold break-words">
                {activeNode.label}
              </h2>

              <p className="text-sm text-[#82958A] mt-2">
                {activeNode.sub}
              </p>

              <div className="border-t border-[#20372A] my-6" />

              <p className="text-xs font-semibold tracking-wider text-[#718278] mb-3">
                INVESTIGATION NOTE
              </p>

              <p className="text-sm text-[#B5C2BA] leading-7 break-words">
                {activeNode.detail}
              </p>

              <div className="mt-7 rounded-xl border border-[#28533C] bg-[#0B2418]/70 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#39D98A] mb-2">
                  <Info size={16} />
                  Interpretation
                </div>

                <p className="text-xs text-[#9BAC9F] leading-6">
                  A connection is an investigative lead. It does
                  not independently prove that an entity is
                  fraudulent.
                </p>
              </div>
            </aside>
          </div>
        )}

        {/* Empty state */}
        {graph && nodes.length === 0 && (
          <div className="rounded-2xl border border-[#153B2B] bg-[#101B15] p-12 text-center">
            <Network
              size={34}
              className="mx-auto text-[#39D98A] mb-4"
            />
            <h2 className="text-lg font-semibold">
              No entities found
            </h2>
            <p className="text-sm text-[#82958A] mt-2">
              This investigation does not contain enough extracted
              entities to display a relationship graph.
            </p>
          </div>
        )}

        {/* Bottom information panel */}
        <div className="mt-7 rounded-2xl border border-[#17452F] bg-[#0B2016]/80 p-5 md:p-6 flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#103624] flex items-center justify-center shrink-0">
            <ShieldCheck size={21} className="text-[#39D98A]" />
          </div>

          <div>
            <h3 className="font-semibold text-[#E6F0E9]">
              Evidence before judgment
            </h3>
            <p className="text-sm text-[#9BAC9F] mt-2 leading-6">
              TRUSTHIRE connects recruiters, companies, domains
              and files from one investigation. A shared phone
              number, email or website alone is not proof of fraud.
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
