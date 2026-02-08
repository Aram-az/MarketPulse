import { useEffect, useState } from "react";
import { useTheme } from "../theme/ThemeContext";
import TradingViewTopStories from "../components/TradingViewTopStories";
import TradingViewEconomicCalendar from "../components/TradingViewEconomicCalendar";

export default function NewsPage() {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme("dark");
  }, [setTheme]);

  // Quick filtering for the Economic Calendar widget (re-embeds with new params)
  const [countryFilter, setCountryFilter] = useState("ca");
  const [importanceFilter, setImportanceFilter] = useState("-1,0,1");

  return (
    <section className="min-h-screen bg-[#0b0f14] text-white">
      <div className="mx-auto min-h-screen max-w-[1400px] px-6 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold">News</h1>
          <p className="mt-2 text-sm text-white/60">
            Headlines + Canada economic events.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left: Economic calendar */}
          <div className="col-span-12 lg:col-span-4">
            <div className="rounded-xl bg-black p-5 ring-1 ring-white/10">
              <div className="flex items-start justify-between gap-4">
                <div className="text-sm font-semibold text-white">
                  Economic Calendar (CAN)
                </div>

                <button
                  type="button"
                  className="btn-futuristic-red"
                  onClick={() => {
                    setCountryFilter("ca");
                    setImportanceFilter("-1,0,1");
                  }}
                >
                  Reset
                </button>
              </div>

              {/* Quick filters */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="btn-futuristic-red"
                  onClick={() => setImportanceFilter("1")}
                  title="High importance only"
                >
                  High impact
                </button>

                <button
                  type="button"
                  className="btn-futuristic-red"
                  onClick={() => setImportanceFilter("0,1")}
                  title="Medium + High importance"
                >
                  Med + High
                </button>

                <button
                  type="button"
                  className="btn-futuristic-red"
                  onClick={() => setImportanceFilter("-1,0,1")}
                  title="All importance levels"
                >
                  All impact
                </button>

                <button
                  type="button"
                  className="btn-futuristic-red"
                  onClick={() => setCountryFilter(countryFilter === "ca" ? "us" : "ca")}
                  title="Toggle between CA and US"
                >
                  Country: {countryFilter.toUpperCase()}
                </button>
              </div>

              <div className="mt-4 h-[720px] overflow-hidden rounded-lg border border-white/10 bg-black">
                <TradingViewEconomicCalendar
                  countryFilter={countryFilter}
                  importanceFilter={importanceFilter}
                  height="100%"
                />
              </div>
            </div>
          </div>

          {/* Right: Top stories */}
          <div className="col-span-12 lg:col-span-8">
            <div className="rounded-xl bg-black p-5 ring-1 ring-white/10">

              <div className="mt-4 h-[720px] overflow-hidden rounded-lg border border-white/10 bg-black">
                <TradingViewTopStories height="100%" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
