import { useEffect, useRef, memo } from "react";

type Props = {
  countryFilter?: string;      // e.g. "ca"
  importanceFilter?: string;   // e.g. "-1,0,1"
  height?: number | string;    // e.g. 720 or "100%"
};

function TradingViewEconomicCalendar({
  countryFilter = "ca",
  importanceFilter = "-1,0,1",
  height = "100%",
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
    script.type = "text/javascript";
    script.async = true;

    script.innerHTML = JSON.stringify({
      colorTheme: "dark",
      isTransparent: false,
      locale: "en",
      countryFilter,
      importanceFilter,
      width: "100%",
      height: "100%",
    });

    el.appendChild(script);

    return () => {
      el.innerHTML = "";
    };
  }, [countryFilter, importanceFilter]);

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

export default memo(TradingViewEconomicCalendar);
