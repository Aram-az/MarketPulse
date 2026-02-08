import { createContext, useContext, useState, type ReactNode } from "react";

// --- TYPES ---
export interface Trade {
  id: number;
  symbol: string;
  type: string;
  price: number;
  pl: number;
  quantity: number;
  entry_price: number;
  exit_price: number;
  entry_date: string;
  source_file?: string;
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

  insightBody: string;
  charts: {
    hourly: { hour: number; trades: number }[];
    pnlDistribution: { bin_start: number; bin_end: number; count: number }[];
    winLossRatio: any[];
  };
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

interface DataContextType {
  // Analysis State
  analysis: AnalysisSummary | null;
  setAnalysis: (data: AnalysisSummary | null) => void;
  clearAnalysis: () => void;

  // Data Versioning (The "Refresh Signal")
  dataVersion: number;
  refreshData: () => void;

  // Guardrails
  guardrails: Guardrail[];
  toggleGuardrail: (id: string) => void;
  addGuardrail: (label: string) => void;
  deleteGuardrail: (id: string) => void;

  // Journal
  journalEntries: JournalEntry[];
  addJournalEntry: (text: string, mood: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [analysis, setAnalysis] = useState<AnalysisSummary | null>(null);
  const [dataVersion, setDataVersion] = useState(0); // This triggers refetches

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

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  // Call this whenever an upload or delete happens
  const refreshData = () => setDataVersion((v) => v + 1);

  const clearAnalysis = () => {
    setAnalysis(null);
    refreshData();
  };

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
        analysis,
        setAnalysis,
        clearAnalysis,
        dataVersion,
        refreshData,
        guardrails,
        toggleGuardrail,
        addGuardrail,
        deleteGuardrail,
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
