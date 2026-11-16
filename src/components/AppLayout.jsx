
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
  Settings,
  ChevronDown,
} from "lucide-react";

const navigation = [
  {
    title: "WORKSPACE",
    links: [
      {
        name: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        name: "New Investigation",
        path: "/investigate",
        icon: FileSearch,
      },
      {
        name: "My Investigations",
        path: "/my-investigations",
        icon: FolderOpen,
      },
    ],
  },
  {
    title: "INTELLIGENCE",
    links: [
      {
        name: "Threat Intelligence",
        path: "/threat-intelligence",
        icon: ShieldAlert,
      },
      {
        name: "Trust Graph",
        path: "/trust-graph",
        icon: Network,
      },
    ],
  },
];

function Sidebar({ closeMenu }) {
  return (
    <aside className="app-sidebar">
      <div className="app-sidebar-inner">

        {/* BRAND */}
        <Link
          to="/"
          onClick={closeMenu}
          className="flex items-center gap-3 px-5 py-6"
        >
          <div className="brand-icon">
            <ShieldCheck size={22} strokeWidth={2} />
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="brand-name">
              TRUSTHIRE
            </span>

            <span className="brand-subtitle">
              RECRUITMENT INTELLIGENCE
            </span>
          </div>
        </Link>

        <div className="mx-5 border-t border-white/[0.06]" />

        {/* NAVIGATION */}
        <nav className="flex-1 px-4 pt-7">

          {navigation.map((group) => (
            <div key={group.title} className="mb-8">

              <p className="nav-section-title">
                {group.title}
              </p>

              <div className="flex flex-col gap-1">

                {group.links.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={closeMenu}
                      className={({ isActive }) =>
                        `nav-item ${
                          isActive ? "active" : ""
                        }`
                      }
                    >
                      <Icon size={17} strokeWidth={1.8} />

                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}

              </div>
            </div>
          ))}

        </nav>

        {/* BOTTOM SECTION */}
        <div className="p-4">

          <div className="rounded-lg border border-white/[0.07] bg-white/[0.025] p-3">

            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />

              <span className="text-xs font-medium text-gray-300">
                Recruitment Intelligence
              </span>
            </div>

            <p className="text-[11px] leading-5 text-gray-500">
              Investigate opportunities. Identify suspicious
              recruiters. Make informed decisions.
            </p>

          </div>

          <button
            type="button"
            className="mt-4 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-gray-400 transition hover:bg-white/[0.04] hover:text-white"
          >
            <Settings size={16} />

            <span className="text-xs">
              Workspace
            </span>

          </button>

          <div className="mt-3 border-t border-white/[0.06] pt-4">
            <p className="text-center text-[10px] tracking-wider text-gray-600">
              TRUSTHIRE © 2026
            </p>
          </div>

        </div>
      </div>
    </aside>
  );
}

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMenu = () => setMobileOpen(false);

  return (
    <div className="app-shell">

      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* MAIN CONTENT */}
      <div className="app-main min-w-0">

        {/* MOBILE HEADER */}
        <header className="app-mobile-header">

          <Link to="/" className="flex items-center gap-2">
            <div className="brand-icon !h-8 !w-8">
              <ShieldCheck size={19} />
            </div>

            <span className="brand-name text-base">
              TRUSTHIRE
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg border border-white/10 p-2 text-gray-300 hover:bg-white/5"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X size={20} />
            ) : (
              <Menu size={20} />
            )}
          </button>

        </header>

        {/* MOBILE NAVIGATION */}
        {mobileOpen && (
          <div
            className="fixed inset-0 top-[62px] z-40 bg-black/65 backdrop-blur-sm lg:hidden"
            onClick={closeMenu}
          >
            <div
              className="h-full w-[280px] max-w-[85vw]"
              onClick={(event) => event.stopPropagation()}
            >
              <Sidebar closeMenu={closeMenu} />
            </div>
          </div>
        )}

        {/* PAGE CONTENT */}
        <main className="min-h-screen min-w-0 w-full overflow-x-hidden">
          <Outlet />
        </main>

      </div>
    </div>
  );
}
