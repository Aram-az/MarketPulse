import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";

function setDarkMode(enabled: boolean) {
  document.documentElement.classList.toggle("dark", enabled);
}

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkModeState] = useState(false);

  // Light mode by default
  useEffect(() => {
    setDarkMode(false);
    setDarkModeState(false);
  }, []);

  const nav = useMemo(
    () => [
      { to: "/portfolio", label: "Portfolio" },
      { to: "/settings", label: "Settings" },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-[#f7f7f8] text-black">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={[
            "sticky top-0 h-screen shrink-0 border-r border-black/10 bg-white",
            "transition-[width] duration-200",
            sidebarOpen ? "w-72" : "w-16",
          ].join(" ")}
        >
          <div className="flex h-full flex-col">
            {/* Top controls */}
            <div className="flex items-center justify-between gap-2 p-3">
              <button
                type="button"
                onClick={() => setSidebarOpen((v) => !v)}
                className="rounded-lg p-2 hover:bg-black/5"
                aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
                title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              >
                {/* simple hamburger */}
                <div className="space-y-1">
                  <div className="h-0.5 w-5 bg-black/70" />
                  <div className="h-0.5 w-5 bg-black/70" />
                  <div className="h-0.5 w-5 bg-black/70" />
                </div>
              </button>

              {sidebarOpen && (
                <button type="button" className="btn-futuristic-red px-3 py-2">
                  New
                </button>
              )}
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-1 px-2">
              {nav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      "sidebar-item",
                      isActive ? "sidebar-item-active" : "",
                      !sidebarOpen ? "justify-center px-0" : "",
                    ].join(" ")
                  }
                >
                  {/* icon placeholder */}
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-black/5 text-xs">
                    {item.label[0]}
                  </span>

                  {sidebarOpen && <span>{item.label}</span>}
                </NavLink>
              ))}
            </nav>

            {/* Theme toggle only when open */}
            {sidebarOpen && (
              <div className="border-t border-black/10 p-3">
                <button
                  type="button"
                  onClick={() => {
                    const next = !darkMode;
                    setDarkModeState(next);
                    setDarkMode(next);
                  }}
                  className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-left text-sm hover:bg-black/5"
                >
                  Theme: {darkMode ? "Dark" : "Light"}
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 p-6">
          <div className="mx-auto w-full max-w-5xl">
            <div className="panel p-10">
              <h1 className="text-center text-xl font-semibold">
                Upload CSV For AI Trading Bias Analysis
              </h1>

              <div className="mt-10 dropzone-dotted">
                <div className="text-base font-medium">Drop your files here</div>
                <div className="mt-4 text-sm text-black/60">or</div>
                <div className="mt-4">
                  <button type="button" className="btn-futuristic-red px-5 py-3">
                    Search From Computer
                  </button>
                </div>
                <div className="mt-6 text-xs text-black/45">
                  Expected columns: Timestamp, Buy/sell, Asset, P/L.
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
