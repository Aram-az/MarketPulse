import React from "react";
import "../index.css";

const LandingPage: React.FC = () => {
	return (
		<main className="p-4">
			<section className="m-3">
				<div className="display">Display — 56px</div>
				<div className="h1">H1 — 40px</div>
				<div className="h2">H2 — 32px</div>
				<div className="h3">H3 — 24px</div>
			</section>

			<section className="m-3">
				<p className="body">
					Body (regular) — The quick brown fox jumps over the lazy dog. Use this
					for most paragraphs and longform text to ensure readability.
				</p>
				<p className="body-strong">
					Body (semibold) — For emphasis on inline text and stronger body
					content.
				</p>
				<p className="caption">Caption — 12px helper text / timestamps</p>
				<div className="overline">Overline — METADATA</div>
			</section>

			<section className="m-3">
				<button className="btn-futuristic-red">
					Primary Button
				</button>
			</section>

			<section className="m-3">
				<h4 className="body">Color swatches</h4>
				<div style={{ display: "flex", gap: "var(--space-3)" }}>
					<div className="p-3 bg-accent">Accent</div>
					<div className="p-3 text-primary">Primary</div>
					<div className="p-3 text-secondary">Secondary</div>
					<div className="p-3 text-muted">Muted</div>
				</div>
			</section>

			<section className="m-3">
				<h4 className="body">Spacing utilities</h4>
				<div className="m-1 p-1" style={{ background: "#f3f4f6" }}>
					m-1 / p-1
				</div>
				<div className="m-2 p-2" style={{ background: "#eef2ff" }}>
					m-2 / p-2
				</div>
				<div className="m-3 p-3" style={{ background: "#fff7ed" }}>
					m-3 / p-3
				</div>
			</section>

			<section className="m-3">
				<div className="sr-only">This label is only visible to screen readers</div>
				<div className="body">Visible text alongside an sr-only label.</div>
			</section>
		</main>
	);
};

export default LandingPage;
