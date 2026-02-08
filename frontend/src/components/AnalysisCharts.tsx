import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

// --- HOURLY ACTIVITY CHART (Overtrading) ---
interface HourlyChartProps {
  data: { hour: number; trades: number }[];
}

export const HourlyActivityChart = ({ data }: HourlyChartProps) => {
  return (
    <div className="h-[300px] w-full animate-in fade-in duration-700">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          Circadian Rhythm (Trades/Hour)
        </h4>
        <span className="text-xs text-gray-500">Time of Day Analysis</span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
          <XAxis
            dataKey="hour"
            stroke="#666"
            tick={{ fontSize: 10, fill: "#888" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111",
              border: "1px solid #333",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
            }}
            cursor={{ fill: "rgba(255,255,255,0.05)" }}
            // FIX: Type 'label' as 'any' to satisfy Recharts strict types
            labelFormatter={(label: any) =>
              `${label}:00 - ${Number(label) + 1}:00`
            }
          />
          <Bar dataKey="trades" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.trades > 10 ? "#DC143C" : "#3b82f6"}
                fillOpacity={0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// --- PNL DISTRIBUTION CHART (Loss Aversion) ---
interface PnLChartProps {
  data: { bin_start: number; bin_end: number; count: number }[];
}

export const PnLDistributionChart = ({ data }: PnLChartProps) => {
  const cleanData = data.filter((d) => d.count > 0);

  return (
    <div className="h-[300px] w-full animate-in fade-in duration-700 delay-100">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          Emotion Distribution (P/L)
        </h4>
        <span className="text-xs text-gray-500">Win/Loss Histogram</span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={cleanData} barCategoryGap={1}>
          <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
          <XAxis
            dataKey="bin_start"
            stroke="#666"
            tick={{ fontSize: 10, fill: "#888" }}
            tickFormatter={(val) => `$${Math.round(val)}`}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111",
              border: "1px solid #333",
              borderRadius: "8px",
            }}
            // FIX: Type 'value' as 'any' because Recharts passes number | string | undefined
            formatter={(value: any) => [value, "Trades"]}
            // FIX: Type 'label' as 'any'
            labelFormatter={(label: any) =>
              `P/L ~ $${Math.round(Number(label))}`
            }
          />
          <ReferenceLine
            x={0}
            stroke="#fff"
            strokeDasharray="3 3"
            opacity={0.5}
          />
          <Bar dataKey="count">
            {cleanData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.bin_start < 0 ? "#ef4444" : "#10b981"}
                fillOpacity={0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
