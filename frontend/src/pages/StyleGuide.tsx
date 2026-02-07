// src/pages/StyleGuide.tsx
// A simple page that renders examples of your CSS utilities/components
// so you can visually inspect them.

import React from "react";
import "../index.css";

export default function StyleGuide() {
  return (
    <div style={{ minHeight: "100vh", background: "rgb(var(--color-bg))" }}>
      {/* Demo navbar using your navbar classes */}

      {/* Content */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        <h1 className="h1">MarketPulse — Style Guide</h1>
        <p className="body text-muted" style={{ marginTop: 8 }}>
          This page renders your typography, spacing utilities, and components.
        </p>

        {/* Typography */}
        <section style={{ marginTop: 32 }}>
          <p className="overline">Typography</p>
          <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
            <div>
              <p className="caption">.display</p>
              <p className="display">Display Text</p>
            </div>

            <div>
              <p className="caption">.h1</p>
              <p className="h1">Heading 1</p>
            </div>

            <div>
              <p className="caption">.h2</p>
              <p className="h2">Heading 2</p>
            </div>

            <div>
              <p className="caption">.h3</p>
              <p className="h3">Heading 3</p>
            </div>

            <div>
              <p className="caption">.body</p>
              <p className="body">
                Body text example: MarketPulse monitors model outputs and helps
                detect bias signals.
              </p>
            </div>

            <div>
              <p className="caption">.body-strong</p>
              <p className="body-strong">
                Strong body text example: Audit fairness, drift, and data
                quality.
              </p>
            </div>

            <div>
              <p className="caption">.caption / .overline</p>
              <p className="caption">Caption text example</p>
              <p className="overline">Overline text example</p>
            </div>

            <div>
              <p className="caption">.button-text</p>
              <span className="button-text">BUTTON TEXT</span>
            </div>
          </div>
        </section>

        {/* Text color utilities */}
        <section style={{ marginTop: 32 }}>
          <p className="overline">Text Colors</p>
          <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
            <p className="body text-primary">.text-primary</p>
            <p className="body text-secondary">.text-secondary</p>
            <p className="body text-muted">.text-muted</p>
            <p
              className="body text-inverse"
              style={{ background: "#111", padding: 8 }}
            >
              .text-inverse (on dark bg)
            </p>
            <p className="body text-accent">.text-accent</p>
          </div>
        </section>

        {/* Spacing utilities */}
        <section style={{ marginTop: 32 }}>
          <p className="overline">Spacing (Margin / Padding)</p>

          <div style={{ display: "grid", gap: 16, marginTop: 12 }}>
            <div>
              <p className="caption">Padding: .p-1 → .p-5</p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <div
                    key={n}
                    className={`p-${n}`}
                    style={{
                      border: "1px solid rgba(255,255,255,0.2)",
                      background: "rgba(255,255,255,0.06)",
                      borderRadius: 12,
                    }}
                  >
                    <span className="caption">{`.p-${n}`}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="caption">
                Margin: .m-1 → .m-5 (boxes have their own margin)
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 0,
                  flexWrap: "wrap",
                  border: "1px dashed rgba(255,255,255,0.2)",
                  padding: 8,
                  borderRadius: 12,
                }}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <div
                    key={n}
                    className={`m-${n} p-2`}
                    style={{
                      border: "1px solid rgba(255,255,255,0.2)",
                      background: "rgba(255,255,255,0.06)",
                      borderRadius: 12,
                    }}
                  >
                    <span className="caption">{`.m-${n}`}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section style={{ marginTop: 32 }}>
          <p className="overline">Buttons</p>
          <div
            style={{
              display: "flex",
              gap: 16,
              marginTop: 12,
              flexWrap: "wrap",
            }}
          >
            <button className="btn-futuristic-red">
              <span className="btn-label">Futuristic Red</span>
            </button>

            <button
              className="bg-accent p-3"
              style={{ borderRadius: 12, border: "none" }}
            >
              <span className="button-text">.bg-accent</span>
            </button>
          </div>
        </section>

        {/* Accessibility utilities */}
        <section style={{ marginTop: 32 }}>
          <p className="overline">Accessibility</p>
          <div style={{ marginTop: 12 }}>
            <label className="body-strong" htmlFor="email">
              Email <span className="sr-only">(required)</span>
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@domain.com"
              style={{
                marginTop: 8,
                width: "min(520px, 100%)",
                padding: "12px 12px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.06)",
                color: "white",
                outline: "none",
              }}
            />
            <p className="caption" style={{ marginTop: 8 }}>
              The “(required)” text is visually hidden via <code>.sr-only</code>
              .
            </p>
          </div>
        </section>

        {/* Notes */}
        <section style={{ marginTop: 40 }}>
          <p className="overline">Notes</p>
          <ul style={{ marginTop: 12, color: "rgba(255,255,255,0.8)" }}>
            <li className="body">
              Your CSS defines <code>.siteNav__spacer</code> (double
              underscore), but your NavBar code sometimes uses{" "}
              <code>siteNav_spacer</code>. Those won’t match—use the exact class
              name from CSS.
            </li>
            <li className="body" style={{ marginTop: 8 }}>
              Your <code>.navbar_link</code> uses <code>font-weight: 40</code>,
              which isn’t valid for most fonts. Use 400/500/600/etc if needed.
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
