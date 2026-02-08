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

// --- HOURLY ACTIVITY CHART (Neutral / Institutional) ---
interface HourlyChartProps {
  data: { hour: number; trades: number }[];
}

export const HourlyActivityChart = ({ data }: HourlyChartProps) => {
  return (
    // FIX: Added flex and flex-col to manage height distribution
    <div className="h-[300px] w-full flex flex-col animate-in fade-in duration-700">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          Circadian Rhythm (Trades/Hour)
        </h4>
        <span className="text-xs text-gray-500">Time of Day Analysis</span>
      </div>

      {/* FIX: wrapper with flex-1 and min-h-0 ensures Recharts gets valid dimensions */}
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#222"
              vertical={false}
            />
            <XAxis
              dataKey="hour"
              stroke="#444"
              tick={{ fontSize: 10, fill: "#666" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#000",
                border: "1px solid #333",
                color: "#fff",
              }}
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
              // @ts-ignore
              labelFormatter={(label) =>
                `${label}:00 - ${Number(label) + 1}:00`
              }
            />
            <Bar dataKey="trades" radius={[2, 2, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.trades > 10 ? "#FFFFFF" : "#333333"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- PNL DISTRIBUTION CHART (Risk Focused) ---
interface PnLChartProps {
  data: { bin_start: number; bin_end: number; count: number }[];
}

export const PnLDistributionChart = ({ data }: PnLChartProps) => {
  const cleanData = data.filter((d) => d.count > 0);

  return (
    // FIX: Added flex and flex-col
    <div className="h-[300px] w-full flex flex-col animate-in fade-in duration-700 delay-100">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          Emotion Distribution (P/L)
        </h4>
        <span className="text-xs text-gray-500">Win/Loss Histogram</span>
      </div>

      {/* FIX: wrapper with flex-1 */}
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={cleanData} barCategoryGap={1}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#222"
              vertical={false}
            />
            <XAxis
              dataKey="bin_start"
              stroke="#444"
              tick={{ fontSize: 10, fill: "#666" }}
              tickFormatter={(val) => `$${Math.round(val)}`}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#000",
                border: "1px solid #333",
                color: "#fff",
              }}
              // @ts-ignore
              formatter={(value) => [value, "Trades"]}
              // @ts-ignore
              labelFormatter={(label) => `P/L ~ $${Math.round(Number(label))}`}
            />
            <ReferenceLine x={0} stroke="#444" strokeDasharray="3 3" />
            <Bar dataKey="count">
              {cleanData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.bin_start < 0 ? "#DC143C" : "#FFFFFF"}
                  fillOpacity={entry.bin_start < 0 ? 0.9 : 0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
