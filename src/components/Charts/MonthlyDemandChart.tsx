import React, { useState } from 'react';
import { SupplyRecord } from '../../types/supplyChain';
import { BarChart3, TrendingUp, Info } from 'lucide-react';

interface MonthlyDemandChartProps {
  records: SupplyRecord[];
  metricMode: 'units' | 'sales' | 'profit' | 'variance';
}

interface MonthlySummary {
  date: string;
  label: string;
  actual: number;
  forecast: number;
  variance: number;
  variancePct: number;
  sales: number;
  profit: number;
}

export const MonthlyDemandChart: React.FC<MonthlyDemandChartProps> = ({
  records,
  metricMode,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Group by month
  const monthlyMap = new Map<string, MonthlySummary>();

  records.forEach((r) => {
    const existing = monthlyMap.get(r.date);
    if (!existing) {
      monthlyMap.set(r.date, {
        date: r.date,
        label: `${r.month} '${String(r.year).slice(2)}`,
        actual: r.actualConsumption,
        forecast: r.forecastedDemand,
        variance: r.forecastVariance,
        variancePct: 0,
        sales: r.totalSales,
        profit: r.grossProfit,
      });
    } else {
      existing.actual += r.actualConsumption;
      existing.forecast += r.forecastedDemand;
      existing.variance += r.forecastVariance;
      existing.sales += r.totalSales;
      existing.profit += r.grossProfit;
    }
  });

  const sortedMonths = Array.from(monthlyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  
  sortedMonths.forEach((m) => {
    m.variancePct = m.forecast > 0 ? ((m.actual - m.forecast) / m.forecast) * 100 : 0;
  });

  if (sortedMonths.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-6 flex flex-col items-center justify-center text-slate-500 h-72">
        <BarChart3 className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm">No monthly trend data matches the current filter selection.</p>
      </div>
    );
  }

  // Chart dimensions
  const width = 800;
  const height = 240;
  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  // Values based on metric mode
  const getValues = (m: MonthlySummary) => {
    if (metricMode === 'sales') return { v1: m.sales, v2: m.forecast * 0.95 }; // rough forecast val
    if (metricMode === 'profit') return { v1: m.profit, v2: m.profit * 0.9 };
    return { v1: m.actual, v2: m.forecast };
  };

  const maxVal = Math.max(
    ...sortedMonths.map((m) => {
      const { v1, v2 } = getValues(m);
      return Math.max(v1, v2);
    }),
    1
  ) * 1.1;

  const minVal = 0;

  const getX = (index: number) => {
    if (sortedMonths.length <= 1) return paddingLeft + chartW / 2;
    return paddingLeft + (index / (sortedMonths.length - 1)) * chartW;
  };

  const getY = (val: number) => {
    return paddingTop + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;
  };

  // Generate SVG path for Actual
  const actualPathD = sortedMonths
    .map((m, i) => {
      const { v1 } = getValues(m);
      return `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(v1).toFixed(1)}`;
    })
    .join(' ');

  // Generate SVG path for Forecast
  const forecastPathD = sortedMonths
    .map((m, i) => {
      const { v2 } = getValues(m);
      return `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(v2).toFixed(1)}`;
    })
    .join(' ');

  // Area fill path for Actual
  const areaPathD = sortedMonths.length > 0
    ? `${actualPathD} L ${getX(sortedMonths.length - 1).toFixed(1)} ${(paddingTop + chartH).toFixed(1)} L ${getX(0).toFixed(1)} ${(paddingTop + chartH).toFixed(1)} Z`
    : '';

  const hoveredMonth = hoveredIndex !== null ? sortedMonths[hoveredIndex] : null;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 relative flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-teal-400" />
          <h3 className="text-sm font-semibold text-slate-100 font-display">
            Monthly Demand Trend vs. Forecast
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            ({sortedMonths.length} Periods)
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-teal-400 rounded-full" />
            <span className="text-slate-300 font-medium">Actual Dispensed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-slate-400 border-t border-dashed border-slate-300" />
            <span className="text-slate-400">Baseline Forecast</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-amber-500/20 border border-amber-500/50 rounded-xs" />
            <span className="text-slate-400">Variance Delta</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-48 lg:h-56 select-none"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d9488" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="varianceBarGradientPos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="varianceBarGradientNeg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = paddingTop + chartH - pct * chartH;
            const gridVal = minVal + pct * (maxVal - minVal);
            const formatted = metricMode === 'sales' || metricMode === 'profit'
              ? (gridVal >= 100000 ? `₹${(gridVal / 100000).toFixed(1)}L` : `₹${(gridVal / 1000).toFixed(0)}k`)
              : `${(gridVal / 1000).toFixed(0)}k`;

            return (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray={i === 0 ? undefined : '3,3'}
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="JetBrains Mono"
                >
                  {formatted}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          {areaPathD && <path d={areaPathD} fill="url(#actualGradient)" />}

          {/* Baseline Forecast line (Dashed) */}
          <path
            d={forecastPathD}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1.75"
            strokeDasharray="4,4"
          />

          {/* Actual line (Solid Teal) */}
          <path
            d={actualPathD}
            fill="none"
            stroke="#2dd4bf"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points & Interactive Hover Columns */}
          {sortedMonths.map((m, i) => {
            const { v1 } = getValues(m);
            const x = getX(i);
            const y = getY(v1);
            const isHovered = hoveredIndex === i;

            return (
              <g key={m.date}>
                {/* Invisible hover trigger column */}
                <rect
                  x={x - (chartW / sortedMonths.length) / 2}
                  y={paddingTop}
                  width={chartW / sortedMonths.length}
                  height={chartH + paddingBottom}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                />

                {/* Vertical hover guide */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={paddingTop}
                    x2={x}
                    y2={paddingTop + chartH}
                    stroke="#2dd4bf"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                    opacity="0.7"
                  />
                )}

                {/* Data point circle */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 5 : 3}
                  fill={isHovered ? '#2dd4bf' : '#0f766e'}
                  stroke="#0f172a"
                  strokeWidth={isHovered ? 2 : 1.5}
                />

                {/* X axis labels (show every 2nd or 3rd month if many) */}
                {(i % 2 === 0 || sortedMonths.length < 12) && (
                  <text
                    x={x}
                    y={paddingTop + chartH + 18}
                    textAnchor="middle"
                    fill={isHovered ? '#f1f5f9' : '#64748b'}
                    fontSize="10"
                    fontFamily="DM Sans"
                  >
                    {m.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoveredMonth && hoveredIndex !== null && (
          <div
            className="absolute top-2 pointer-events-none bg-slate-950/95 border border-slate-700 p-2.5 rounded shadow-xl text-xs z-20 backdrop-blur-md min-w-[190px]"
            style={{
              left: `${Math.min(75, Math.max(15, (getX(hoveredIndex) / width) * 100))}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="font-semibold text-slate-200 border-b border-slate-800 pb-1 mb-1.5 flex justify-between">
              <span>{hoveredMonth.label}</span>
              <span className="font-mono text-slate-400">{hoveredMonth.date}</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between gap-3">
                <span className="text-teal-400">Actual Dispensed:</span>
                <span className="font-mono font-bold text-white">
                  {Math.round(hoveredMonth.actual).toLocaleString()} units
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-400">Forecast Demand:</span>
                <span className="font-mono text-slate-300">
                  {Math.round(hoveredMonth.forecast).toLocaleString()} units
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-400">Variance:</span>
                <span className={`font-mono font-semibold ${hoveredMonth.variance >= 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {hoveredMonth.variance >= 0 ? `+${Math.round(hoveredMonth.variance).toLocaleString()}` : Math.round(hoveredMonth.variance).toLocaleString()} ({hoveredMonth.variancePct.toFixed(1)}%)
                </span>
              </div>
              <div className="flex justify-between gap-3 pt-1 border-t border-slate-800/80">
                <span className="text-slate-400">Sales Value:</span>
                <span className="font-mono text-emerald-400">
                  ₹{Math.round(hoveredMonth.sales).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-400">Program Margin:</span>
                <span className="font-mono text-cyan-400">
                  ₹{Math.round(hoveredMonth.profit).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer indicator */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60 mt-1">
        <span className="flex items-center gap-1">
          <Info className="w-3 h-3 text-slate-400" />
          Click individual months or hover data points for variance diagnosis
        </span>
        <span className="font-mono text-slate-400">
          Peak Month: {sortedMonths.reduce((prev, curr) => (curr.actual > prev.actual ? curr : prev), sortedMonths[0])?.label}
        </span>
      </div>
    </div>
  );
};
