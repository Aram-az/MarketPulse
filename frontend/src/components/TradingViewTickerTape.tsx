import { useEffect, useRef } from "react";

type Props = {
  symbols?: string; // your comma-separated string
  theme?: "dark" | "light";
  showHover?: boolean;
};

export default function TradingViewTickerTape({
  symbols = "FOREXCOM:SPXUSD,FOREXCOM:NSXUSD,FOREXCOM:DJI,BITSTAMP:BTCUSD,BITSTAMP:ETHUSD,CMCMARKETS:GOLD,TSX:NA,TSX:TSX",
  theme = "dark",
  showHover = true,
}: Props) {
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    const src = "https://widgets.tradingview-widget.com/w/en/tv-ticker-tape.js";
    if (document.querySelector(`script[src="${src}"]`)) return;

    const script = document.createElement("script");
    script.type = "module";
    script.src = src;
    document.body.appendChild(script);
  }, []);

  return (
    <div className="w-full">
      <tv-ticker-tape
        // If you added a .d.ts for tv-market-summary, add this too (see note below)
        symbols={symbols}
        {...(showHover ? { "show-hover": "" } : {})}
        theme={theme}
      />
    </div>
  );
}
