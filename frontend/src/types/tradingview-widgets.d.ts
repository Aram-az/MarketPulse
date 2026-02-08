import type * as React from "react";

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      "tv-market-summary": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        exchange?: string;
        direction?: "vertical" | "horizontal";
        "item-size"?: "compact" | "medium" | "large";
        theme?: "dark" | "light";
      };

      "tv-ticker-tape": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        symbols?: string;
        theme?: "dark" | "light";
        "show-hover"?: string;
      };
    }
  }
}

export {};
