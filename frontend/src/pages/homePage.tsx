import { useRef, useState } from "react";

export default function HomePage() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  function onPickFile() {
    inputRef.current?.click();
  }

  function acceptFile(f: File | null) {
    if (!f) return;
    const ok = f.name.toLowerCase().endsWith(".csv") || f.type === "text/csv";
    if (!ok) return;
    setFile(f);
  }

  return (
    <div className="min-h-screen bg-[#f7f7f8] text-black dark:bg-[#0b0f14] dark:text-white">
      <main className="min-w-0 p-6">
        <div className="mx-auto w-full max-w-5xl">
          <div className="panel rounded-xl bg-white p-10 ring-1 ring-black/10 dark:bg-white/5 dark:ring-white/10">
            <h1 className="text-center text-xl font-semibold">
              Upload CSV For AI Trading Bias Analysis
            </h1>

            <div
              className={[
                "mt-10 rounded-xl border-2 border-dashed p-10 text-center",
                "border-black/15 bg-black/[0.02]",
                "dark:border-white/15 dark:bg-white/[0.03]",
                isDragging ? "border-[#DC143C]/60 bg-[#DC143C]/[0.06]" : "",
              ].join(" ")}
              onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(false);
                const f = e.dataTransfer.files?.[0] ?? null;
                acceptFile(f);
              }}
              role="button"
              tabIndex={0}
              onClick={onPickFile}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onPickFile();
              }}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => acceptFile(e.target.files?.[0] ?? null)}
              />

              <div className="text-base font-medium">
                {file ? `Selected: ${file.name}` : "Drop your CSV here"}
              </div>

              <div className="mt-4 text-sm text-black/60 dark:text-white/60">or</div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPickFile();
                  }}
                  className="btn-futuristic-red px-5 py-3"
                >
                  Search From Computer
                </button>
              </div>

              <div className="mt-6 text-xs text-black/45 dark:text-white/45">
                Expected columns: Timestamp, Buy/sell, Asset, P/L.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
