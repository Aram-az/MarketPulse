import { useEffect, useRef, memo } from "react";

type Props = {
  height?: number | string; // e.g. 640 or "100%"
};

function TradingViewTopStories({ height = "100%" }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Prevent duplicates in dev (StrictMode/HMR)
    el.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js";
    script.type = "text/javascript";
    script.async = true;

    script.innerHTML = JSON.stringify({
      displayMode: "regular",
      feedMode: "all_symbols",
      colorTheme: "dark",
      isTransparent: false,
      locale: "en",
      width: "100%",
      height: "100%",
    });

    el.appendChild(script);

    return () => {
      el.innerHTML = "";
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container"
      style={{ width: "100%", height }}
    >
      <div className="tradingview-widget-container__widget" style={{ width: "100%", height: "100%" }} />
      {/* Optional: keep attribution if you want it visible */}
      {/* <div className="tradingview-widget-copyright">...</div> */}
    </div>
  );
}

export default memo(TradingViewTopStories);
