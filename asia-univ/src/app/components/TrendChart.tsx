import React from "react";

interface TrendChartProps {
  history: number[];
}

export default function TrendChart({ history }: TrendChartProps) {
  // history is an array of ranks from current year back to 5 years ago
  // e.g., [1, 2, 3, 4, 5] (where index 0 is 2026, index 4 is 2022)
  // We want to plot from left to right (past to present): 2022 -> 2026

  const data = [...history].reverse(); // Now index 0 is 2022, index 4 is 2026
  const years = [2022, 2023, 2024, 2025, 2026];

  // SVG dimensions and padding
  const width = 600;
  const height = 300;
  const padding = 40;

  // Determine min and max ranks to scale the Y-axis
  // Rank 1 is at the TOP (highest Y value conceptually, but smallest pixel value)
  const maxRank = Math.max(...data, 10); // Ensure at least 10 for scale
  const minRank = Math.max(1, Math.min(...data) - 5); // Add some padding to the top

  // Function to calculate X and Y coordinates
  const getX = (index: number) => padding + (index * (width - padding * 2)) / (data.length - 1);
  const getY = (value: number) => padding + ((value - minRank) / (maxRank - minRank)) * (height - padding * 2);

  // Generate SVG path string
  const pathData = data
    .map((value, index) => {
      const x = getX(index);
      const y = getY(value);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <div className="w-full overflow-x-auto border border-slate-200 bg-white p-6 shadow-sm font-sans">
      <div className="mb-4">
        <h4 className="font-serif text-lg font-bold text-slate-900">5-Year Ranking Trajectory</h4>
        <p className="text-xs text-slate-500">Historical performance across the Asia University Index</p>
      </div>

      <div className="min-w-[500px]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          {/* Grid lines (horizontal) */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding + ratio * (height - padding * 2);
            const rankLabel = Math.round(minRank + ratio * (maxRank - minRank));
            return (
              <g key={ratio}>
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
                <text x={padding - 10} y={y + 4} textAnchor="end" className="fill-slate-400 text-[10px] font-mono">
                  #{rankLabel}
                </text>
              </g>
            );
          })}

          {/* X-axis labels (Years) */}
          {years.map((year, index) => {
            const x = getX(index);
            return (
              <text key={year} x={x} y={height - padding + 20} textAnchor="middle" className="fill-slate-500 text-[10px] font-bold">
                {year}
              </text>
            );
          })}

          {/* Trend Line */}
          <path d={pathData} fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data Points */}
          {data.map((value, index) => {
            const x = getX(index);
            const y = getY(value);
            return (
              <g key={index} className="group cursor-pointer">
                <circle cx={x} cy={y} r="5" fill="#ffffff" stroke="#b45309" strokeWidth="2" className="transition-all duration-200 group-hover:r-6 group-hover:fill-amber-700" />
                {/* Tooltip (CSS based hover) */}
                <text x={x} y={y - 15} textAnchor="middle" className="fill-amber-700 text-[10px] font-bold font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  #{value}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
