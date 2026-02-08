import { useEffect, useRef, memo } from "react";

type Props = {
  symbol: string; // e.g. "NASDAQ:AAPL"
  height?: number;
};

function TradingViewMiniChart({ symbol, height = 220 }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.type = "text/javascript";
    script.async = true;

    script.innerHTML = JSON.stringify({
      symbol,
      locale: "en",
      dateRange: "12M",
      colorTheme: "dark",
      isTransparent: false,
      width: "100%",
      height: "260",
    });

    el.appendChild(script);

    return () => {
      el.innerHTML = "";
    };
  }, [symbol]);

  return (
    <div
      className="rounded-xl bg-black ring-1 ring-white/10 overflow-hidden"
      style={{ height }}
    >
      <div ref={containerRef} className="h-[calc(100%+34px)] w-full -mb-[34px]" />
    </div>
  );
}

export default memo(TradingViewMiniChart);
