import { useEffect } from "react";
import TradingViewAdvancedChart from "../components/TradingViewAdvancedChart";
import TradingViewMarketSummary from "../components/TradingViewMarketSummary";
import TradingViewStockHeatmap from "../components/TradingViewStockHeatmap";
import TradingViewTickerTape from "../components/TradingViewTickerTape";
import { useTheme } from "../theme/ThemeContext";

export default function MarketPage() {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme("dark");
  }, [setTheme]);

  return (
    <section className="min-h-screen bg-[#0b0f14] text-white">
      <div className="mx-auto min-h-screen max-w-[1400px] px-6 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold">Market</h1>
          <p className="mt-2 text-sm text-white/60">
            Live widgets that auto-refresh
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left column: chart + ticker */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <div className="h-[640px] rounded-xl bg-black ring-1 ring-white/10">
              <TradingViewAdvancedChart symbol="NASDAQ:AAPL" />
            </div>

            <div className="rounded-xl bg-black p-4 ring-1 ring-white/10">
              <TradingViewTickerTape
                theme="dark"
                symbols="FOREXCOM:SPXUSD,FOREXCOM:NSXUSD,FOREXCOM:DJI,BITSTAMP:BTCUSD,BITSTAMP:ETHUSD,CMCMARKETS:GOLD,TSX:NA,TSX:TSX"
                showHover
              />
            </div>
          </div>

          {/* Right column: summary + heatmap */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="rounded-xl bg-black p-5 ring-1 ring-white/10">
              <div className="text-sm font-semibold text-white">TSX Summary</div>
              <div className="mt-4 h-[320px] overflow-auto rounded-lg border border-white/10 bg-black p-2">
                <TradingViewMarketSummary
                  exchange="TSX"
                  direction="vertical"
                  itemSize="medium"
                  theme="dark"
                />
              </div>
            </div>

            <div className="rounded-xl bg-black p-5 ring-1 ring-white/10">
              <div className="text-sm font-semibold text-white">TSX Heatmap</div>
              <div className="mt-4 h-[320px] overflow-hidden rounded-lg border border-white/10 bg-black p-0">
                <TradingViewStockHeatmap dataSource="TSX" height="100%" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
