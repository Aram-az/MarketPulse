import { createContext, useContext, useState, type ReactNode } from "react";

export interface Trade {
  id: number;
  symbol: string;
  type: "Buy" | "Sell";
  price: string;
  pl: number;
  plText: string;
  duration?: string;
  status?: string;
  bias?: string;
  date?: string;
  quantity?: number;
  entryPrice?: number;
  exitPrice?: number;
  source?: string;
}

export interface AnalysisData {
  riskType: string;
  riskScore: string;
  insightBody: string;
}

export interface Guardrail {
  id: string;
  label: string;
  active: boolean;
  status: "Adhered" | "Violated" | "Pending";
  isCustom?: boolean;
}

export interface JournalEntry {
  id: string;
  date: string;
  text: string;
  mood: string;
}

export interface AnalysisSummary {
  netPL: string;
  winRate: string;
  tradesPerHour: string;
  totalTrades: number;
  riskType: string;
  riskScorePct: string;
  riskLevel: string;
  scores: {
    overtrading: number;
    lossAversion: number;
    revenge: number;
  };
  heatmap: number[];
  insightBody: string;
}

interface DataContextType {
  trades: Trade[];
  setTrades: (trades: Trade[]) => void;
  addTrades: (newTrades: Trade[]) => void;
  addTrade: (trade: Trade) => void;
  clearData: () => void;
  removeFile: (filename: string) => void;

  analyses: Record<string, AnalysisData>;
  addAnalysis: (source: string, data: AnalysisData) => void;

  analysis: AnalysisSummary | null;
  setAnalysis: (data: AnalysisSummary | null) => void;
  clearAnalysis: () => void;

  guardrails: Guardrail[];
  toggleGuardrail: (id: string) => void;
  addGuardrail: (label: string) => void;
  deleteGuardrail: (id: string) => void;
  updateGuardrailStatus: (id: string, status: "Adhered" | "Violated") => void;

  journalEntries: JournalEntry[];
  addJournalEntry: (text: string, mood: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [analyses, setAnalyses] = useState<Record<string, AnalysisData>>({});
  const [analysis, setAnalysis] = useState<AnalysisSummary | null>(null);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  const [guardrails, setGuardrails] = useState<Guardrail[]>([
    {
      id: "max_loss",
      label: "Max Daily Loss: $500",
      active: true,
      status: "Pending",
    },
    {
      id: "max_trades",
      label: "Max 5 Trades / Day",
      active: true,
      status: "Pending",
    },
    {
      id: "revenge_stop",
      label: "Stop Trading after 2 Losses",
      active: false,
      status: "Pending",
    },
  ]);

  const addTrades = (newTrades: Trade[]) =>
    setTrades((prev) => [...prev, ...newTrades]);
  const addTrade = (trade: Trade) => setTrades((prev) => [trade, ...prev]);
  const addAnalysis = (source: string, data: AnalysisData) =>
    setAnalyses((prev) => ({ ...prev, [source]: data }));

  const removeFile = (filename: string) => {
    setTrades((prev) => prev.filter((t) => t.source !== filename));
    setAnalyses((prev) => {
      const copy = { ...prev };
      delete copy[filename];
      return copy;
    });
  };

  const clearData = () => {
    setTrades([]);
    setAnalyses({});
  };

  const clearAnalysis = () => setAnalysis(null);

  const toggleGuardrail = (id: string) => {
    setGuardrails((prev) =>
      prev.map((g) => (g.id === id ? { ...g, active: !g.active } : g)),
    );
  };

  const addGuardrail = (label: string) => {
    setGuardrails((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        label,
        active: true,
        status: "Pending",
        isCustom: true,
      },
    ]);
  };

  const deleteGuardrail = (id: string) => {
    setGuardrails((prev) => prev.filter((g) => g.id !== id));
  };

  const updateGuardrailStatus = (
    id: string,
    status: "Adhered" | "Violated",
  ) => {
    setGuardrails((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status } : g)),
    );
  };

  const addJournalEntry = (text: string, mood: string) => {
    setJournalEntries((prev) => [
      {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(),
        text,
        mood,
      },
      ...prev,
    ]);
  };

  return (
    <DataContext.Provider
      value={{
        trades,
        setTrades,
        addTrades,
        addTrade,
        clearData,
        removeFile,
        analyses,
        addAnalysis,
        analysis,
        setAnalysis,
        clearAnalysis,
        guardrails,
        toggleGuardrail,
        addGuardrail,
        deleteGuardrail,
        updateGuardrailStatus,
        journalEntries,
        addJournalEntry,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within a DataProvider");
  return context;
}
