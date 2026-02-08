import { useEffect, useRef, memo } from "react";

type Props = {
  exchange?: string; // "US", "NASDAQ", "NYSE", "TSX", etc.
  height?: number | string;
};

function TradingViewHotlists({ exchange = "US", height = "100%" }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-hotlists.js";
    script.type = "text/javascript";
    script.async = true;

    script.innerHTML = JSON.stringify({
      exchange,
      colorTheme: "dark",
      dateRange: "12M",
      showChart: true,
      locale: "en",
      largeChartUrl: "",
      isTransparent: false,
      showSymbolLogo: false,
      showFloatingTooltip: false,
      plotLineColorGrowing: "rgba(76, 175, 80, 1)",
      plotLineColorFalling: "rgba(242, 54, 69, 1)",
      gridLineColor: "rgba(240, 243, 250, 0)",
      scaleFontColor: "#DBDBDB",
      belowLineFillColorGrowing: "rgba(41, 98, 255, 0.12)",
      belowLineFillColorFalling: "rgba(41, 98, 255, 0.12)",
      belowLineFillColorGrowingBottom: "rgba(41, 98, 255, 0)",
      belowLineFillColorFallingBottom: "rgba(41, 98, 255, 0)",
      symbolActiveColor: "rgba(41, 98, 255, 0.12)",
      width: "100%",
      height: "100%",
    });

    el.appendChild(script);

    return () => {
      el.innerHTML = "";
    };
  }, [exchange]);

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

export default memo(TradingViewHotlists);
