import express from "express";
import cors from "cors";
import { config } from "dotenv";

config({ path: "./keydata.env" });

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT || 5000);
const API_KEY = process.env.ALPHAVANTAGE_API_KEY;

// ---- In-memory state ----
/** symbol -> { quote, fetchedAt } */
const cache = new Map();
/** symbol -> Promise */
const inflight = new Map();
/** ordered list of watched symbols for round-robin refresh */
let watchOrder = [];
const watchSet = new Set();

function normalizeSymbols(raw) {
  return String(raw || "")
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
}

async function fetchOneQuote(symbol) {
  if (!API_KEY) throw new Error("Missing ALPHAVANTAGE_API_KEY");

  const url = new URL("https://www.alphavantage.co/query");
  url.searchParams.set("function", "GLOBAL_QUOTE");
  url.searchParams.set("symbol", symbol);
  url.searchParams.set("apikey", API_KEY);

  const r = await fetch(url);
  const j = await r.json();

  // Rate-limit responses commonly come back in a "Note" field
  if (j?.Note) throw new Error("Rate limited");

  const q = j?.["Global Quote"];
  if (!q) throw new Error("No quote data");

  const price = Number(q["05. price"] ?? 0);
  const change = Number(q["09. change"] ?? 0);
  const changePercent = Number(String(q["10. change percent"] ?? "0").replace("%", "") || 0);

  return {
    symbol,
    price,
    change,
    changePercent,
    updatedAt: new Date().toISOString(),
  };
}

// Register symbols to be refreshed in background (called from frontend)
app.get("/api/watch", (req, res) => {
  const symbols = normalizeSymbols(req.query.symbols).slice(0, 100);

  for (const s of symbols) {
    if (!watchSet.has(s)) {
      watchSet.add(s);
      watchOrder.push(s);
    }
  }

  res.json({ watched: watchOrder });
});

// Read quotes (returns cached immediately; also triggers refresh if stale)
app.get("/api/quotes", async (req, res) => {
  const symbols = normalizeSymbols(req.query.symbols).slice(0, 100);

  // If user hits /api/quotes directly, auto-add to watch list as well
  for (const s of symbols) {
    if (!watchSet.has(s)) {
      watchSet.add(s);
      watchOrder.push(s);
    }
  }

  const quotes = symbols
    .map((s) => cache.get(s)?.quote)
    .filter(Boolean);

  res.json({ quotes });
});

// Background refresher: 1 symbol every 12s (≈5/min)
setInterval(async () => {
  if (!API_KEY) return;
  if (watchOrder.length === 0) return;

  // round-robin
  const symbol = watchOrder.shift();
  watchOrder.push(symbol);

  if (inflight.has(symbol)) return;

  const p = fetchOneQuote(symbol)
    .then((quote) => {
      cache.set(symbol, { quote, fetchedAt: Date.now() });
    })
    .catch(() => {
      // keep old cached value on errors / rate limits
    })
    .finally(() => {
      inflight.delete(symbol);
    });

  inflight.set(symbol, p);
}, 12000);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running: http://127.0.0.1:${PORT}`);
});
