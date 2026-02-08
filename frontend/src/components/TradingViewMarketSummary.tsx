import { useEffect, useRef } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "tv-market-summary": {
        exchange?: string;
        direction?: "vertical" | "horizontal";
        "item-size"?: "compact" | "medium" | "large";
        theme?: "dark" | "light";
      };
    }
  }
}

type Props = {
  exchange?: string; // "TSX"
  direction?: "vertical" | "horizontal";
  itemSize?: "compact" | "medium" | "large";
  theme?: "dark" | "light";
};

export default function TradingViewMarketSummary({
  exchange = "TSX",
  direction = "vertical",
  itemSize = "compact",
  theme = "dark",
}: Props) {
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    const src = "https://widgets.tradingview-widget.com/w/en/tv-market-summary.js";
    if (document.querySelector(`script[src="${src}"]`)) return;

    const script = document.createElement("script");
    script.type = "module";
    script.src = src;
    document.body.appendChild(script);
  }, []);

  return (
    <div className="w-full">
        <tv-market-summary exchange={exchange} direction={direction} item-size={itemSize} theme={theme} />
    </div>
  );
}
