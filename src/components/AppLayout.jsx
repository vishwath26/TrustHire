
import { useState } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import {
  ShieldCheck,
  LayoutDashboard,
  FileSearch,
  FolderOpen,
  Network,
  ShieldAlert,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

const navigation = [
  {
    title: "WORKSPACE",
    links: [
      { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { name: "New Investigation", path: "/investigate", icon: FileSearch },
      { name: "My Investigations", path: "/my-investigations", icon: FolderOpen },
    ],
  },
  {
    title: "INTELLIGENCE",
    links: [
      { name: "Threat Intelligence", path: "/threat-intelligence", icon: ShieldAlert },
      { name: "Trust Graph", path: "/trust-graph", icon: Network },
    ],
  },
];

function Sidebar({ closeMenu }) {
  return (
    <div className="h-full flex flex-col bg-[#0b1020] border-r border-white/10">
      <Link to="/" className="flex items-center gap-3 px-6 py-7">
        <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
          <ShieldCheck size={23} className="text-cyan-300" />
        </div>
        <div>
          <h1 className="font-bold tracking-wide text-lg">TRUSTHIRE</h1>
          <p className="text-[10px] tracking-[0.2em] text-gray-500">
            RECRUITMENT INTELLIGENCE
          </p>
        </div>
      </Link>

      <div className="px-4 mt-4 flex-1">
        {navigation.map((group) => (
          <div key={group.title} className="mb-8">
            <p className="text-[10px] tracking-[0.18em] text-gray-500 font-semibold px-3 mb-3">
              {group.title}
            </p>

            <div className="space-y-1">
              {group.links.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-3 rounded-xl text-sm transition ${
                        isActive
                          ? "bg-cyan-400/10 text-cyan-300 border border-cyan-400/10"
                          : "text-gray-400 hover:text-white hover:bg-white/[0.05]"
                      }`
                    }
                  >
                    <span className="flex items-center gap-3">
                      <Icon size={18} />
                      {item.name}
                    </span>
                    <ChevronRight size={15} className="opacity-50" />
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <p className="text-xs text-gray-300">System workspace</p>
          </div>
          <p className="text-xs text-gray-500 leading-5">
            AI investigation services will be available after backend integration.
          </p>
        </div>
        <p className="text-[10px] text-gray-600 text-center mt-4">
          TRUSTHIRE © 2026
        </p>
      </div>
    </div>
  );
}

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#080b14]">
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 z-40">
        <Sidebar />
      </aside>

      <div className="lg:ml-64 min-w-0">
        <header className="lg:hidden sticky top-0 z-30 h-16 bg-[#0b1020]/95 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-2">
            <ShieldCheck size={23} className="text-cyan-300" />
            <span className="font-bold tracking-wide">TRUSTHIRE</span>
          </Link>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg border border-white/10 text-gray-300"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </header>

        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 top-16 z-40 bg-black/60">
            <div className="w-72 max-w-[85vw] h-full">
              <Sidebar closeMenu={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        <div className="min-h-screen min-w-0 w-full overflow-x-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
