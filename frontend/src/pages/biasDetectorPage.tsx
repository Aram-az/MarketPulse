import { useMemo, useState } from "react";
const BIAS_API = "http://localhost:8000";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

type BiasResult = {
  score: number;
  level: "low" | "medium" | "high";
  metrics: Record<string, JsonValue>;
  triggers: string[];
  recommendations: string[];
  charts: Record<string, JsonValue>;
};

type AnalyzeResponse = {
  generatedAt: string;
  summary: Record<string, JsonValue>;
  biases: Record<string, BiasResult>;
  warnings: string[];
};

const MOCKS = [
  { label: "Calm Trader", value: "calm_trader" },
  { label: "Overtrader", value: "overtrader" },
  { label: "Loss Averse Trader", value: "loss_averse_trader" },
  { label: "Revenge Trader", value: "revenge_trader" },
];

function levelBadge(level: string) {
  const base = "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold";
  if (level === "high") return `${base} bg-red-100 text-red-700`;
  if (level === "medium") return `${base} bg-yellow-100 text-yellow-800`;
  return `${base} bg-green-100 text-green-700`;
}

export default function BiasDetectorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [mock, setMock] = useState<string>(MOCKS[0].value);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<AnalyzeResponse | null>(null);

  const sortedBiases = useMemo(() => {
    if (!data?.biases) return [];
    return Object.entries(data.biases).sort((a, b) => (b[1].score ?? 0) - (a[1].score ?? 0));
  }, [data]);

  async function runMock() {
    setLoading(true);
    setErr(null);
    setData(null);
    try {
      const res = await fetch(`${BIAS_API}/api/analyze/mock?name=${encodeURIComponent(mock)}`, { method: "POST" });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.detail || "Mock analyze failed");
      setData(j);
    } catch (e: unknown) {
    const msg =
        e instanceof Error ? e.message : "Unknown error";
    setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  async function runUpload() {
    if (!file) {
      setErr("Pick a CSV/XLSX file first.");
      return;
    }
    setLoading(true);
    setErr(null);
    setData(null);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch(`${BIAS_API}/api/analyze`, { method: "POST", body: fd });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.detail || "Upload analyze failed");
      setData(j);
    } catch (e: unknown) {
  const msg =
        e instanceof Error ? e.message : "Unknown error";
    setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 text-gray-900">
      <div className="rounded-2xl bg-white shadow p-6 space-y-4 text-gray-900">
        <h1 className="text-2xl font-bold">Bias Detector</h1>
        <p className="text-sm text-gray-600">
          Run a mock dataset or upload your own trades file (CSV/XLSX) and view bias results.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border p-4 space-y-3">
            <div className="font-semibold">Mock datasets</div>
            <select
              className="w-full border rounded-lg p-2"
              value={mock}
              onChange={(e) => setMock(e.target.value)}
              disabled={loading}
            >
              {MOCKS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <button
              className="w-full rounded-lg bg-black text-white py-2 disabled:opacity-60"
              onClick={runMock}
              disabled={loading}
            >
              {loading ? "Running…" : "Run Mock"}
            </button>
          </div>

          <div className="rounded-xl border p-4 space-y-3">
            <div className="font-semibold">Upload your file</div>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              disabled={loading}
              className="w-full"
            />
            <button
              className="w-full rounded-lg bg-blue-600 text-white py-2 disabled:opacity-60"
              onClick={runUpload}
              disabled={loading}
            >
              {loading ? "Uploading…" : "Analyze Upload"}
            </button>
            <div className="text-xs text-gray-500">
              Required columns: timestamp, asset, side, quantity, entry_price, exit_price, profit_loss, balance
            </div>
          </div>
        </div>

        {err && (
          <div className="rounded-lg bg-red-50 text-red-700 p-3 text-sm">
            {err}
          </div>
        )}
      </div>

      {data && (
        <>
          <div className="rounded-2xl bg-white shadow p-6 space-y-4 text-gray-900">
            <h2 className="text-xl font-bold">Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {Object.entries(data.summary || {}).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 border rounded-lg p-3">
                  <div className="text-gray-600">{k}</div>
                  <div className="font-semibold text-right break-all">{String(v)}</div>
                </div>
              ))}
            </div>

            {!!data.warnings?.length && (
              <div className="rounded-lg bg-yellow-50 text-yellow-800 p-3 text-sm">
                <div className="font-semibold mb-1">Warnings</div>
                <ul className="list-disc ml-5">
                  {data.warnings.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold">Bias Results</h2>

            {sortedBiases.map(([name, b]) => (
              <div key={name} className="rounded-2xl bg-white shadow p-6 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-lg font-bold capitalize">{name.replaceAll("_", " ")}</div>
                  <div className="flex items-center gap-3">
                    <div className={levelBadge(b.level)}>{b.level.toUpperCase()}</div>
                    <div className="text-sm font-semibold">Score: {Math.round(b.score)}</div>
                  </div>
                </div>

                {!!b.triggers?.length && (
                  <div>
                    <div className="font-semibold">Triggers</div>
                    <ul className="list-disc ml-5 text-sm text-gray-700">
                      {b.triggers.map((t, i) => <li key={i}>{t}</li>)}
                    </ul>
                  </div>
                )}

                {!!b.recommendations?.length && (
                  <div>
                    <div className="font-semibold">Recommendations</div>
                    <ul className="list-disc ml-5 text-sm text-gray-700">
                      {b.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                )}

                {/* Optional: show raw metrics quickly */}
                <details className="text-sm">
                  <summary className="cursor-pointer font-semibold">Metrics (details)</summary>
                  <pre className="mt-2 bg-gray-50 border rounded-lg p-3 overflow-auto">
{JSON.stringify(b.metrics, null, 2)}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}