import { useEffect, useRef, memo } from "react";

type Props = {
  dataSource?: string; // e.g. "TSX"
  height?: number | string; // e.g. 320 or "100%"
};

function TradingViewStockHeatmap({ dataSource = "TSX", height = "100%" }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Avoid duplicate widgets in dev (StrictMode/HMR)
    container.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js";
    script.type = "text/javascript";
    script.async = true;

    script.innerHTML = JSON.stringify({
      dataSource,
      blockSize: "market_cap_basic",
      blockColor: "change",
      grouping: "sector",
      locale: "en",
      symbolUrl: "",
      colorTheme: "dark",
      exchanges: [],
      hasTopBar: false,
      isDataSetEnabled: false,
      isZoomEnabled: true,
      hasSymbolTooltip: true,
      isMonoSize: false,
      width: "100%",
      height: "100%",
    });

    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [dataSource]);

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container"
      style={{ width: "100%", height }}
    >
      <div className="tradingview-widget-container__widget" style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

export default memo(TradingViewStockHeatmap);
