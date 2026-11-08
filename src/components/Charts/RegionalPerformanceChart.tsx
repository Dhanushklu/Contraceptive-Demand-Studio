import React, { useState } from 'react';
import { SupplyRecord, HealthRegion } from '../../types/supplyChain';
import { MapPin, ArrowUpDown, AlertCircle, Check } from 'lucide-react';

interface RegionalPerformanceChartProps {
  records: SupplyRecord[];
  selectedRegions: HealthRegion[];
  onSelectRegion: (region: HealthRegion) => void;
}

type SortKey = 'demand' | 'sales' | 'profit' | 'variance' | 'stockout';

interface RegionalSummary {
  region: HealthRegion;
  actualDemand: number;
  forecastDemand: number;
  variancePct: number;
  sales: number;
  cost: number;
  profit: number;
  profitMarginPct: number;
  avgMOS: number;
  criticalLines: number;
  totalLines: number;
}

export const RegionalPerformanceChart: React.FC<RegionalPerformanceChartProps> = ({
  records,
  selectedRegions,
  onSelectRegion,
}) => {
  const [sortKey, setSortKey] = useState<SortKey>('sales');

  // Group by region
  const regionMap = new Map<HealthRegion, RegionalSummary>();

  records.forEach((r) => {
    const existing = regionMap.get(r.region);
    if (!existing) {
      regionMap.set(r.region, {
        region: r.region,
        actualDemand: r.actualConsumption,
        forecastDemand: r.forecastedDemand,
        variancePct: 0,
        sales: r.totalSales,
        cost: r.totalCost,
        profit: r.grossProfit,
        profitMarginPct: 0,
        avgMOS: r.stockCoverMonths,
        criticalLines: r.stockCoverMonths < 2.0 ? 1 : 0,
        totalLines: 1,
      });
    } else {
      existing.actualDemand += r.actualConsumption;
      existing.forecastDemand += r.forecastedDemand;
      existing.sales += r.totalSales;
      existing.cost += r.totalCost;
      existing.profit += r.grossProfit;
      existing.avgMOS += r.stockCoverMonths;
      if (r.stockCoverMonths < 2.0) existing.criticalLines++;
      existing.totalLines++;
    }
  });

  const summaries = Array.from(regionMap.values()).map((s) => {
    return {
      ...s,
      variancePct: s.forecastDemand > 0 ? ((s.actualDemand - s.forecastDemand) / s.forecastDemand) * 100 : 0,
      profitMarginPct: s.sales > 0 ? (s.profit / s.sales) * 100 : 0,
      avgMOS: s.totalLines > 0 ? s.avgMOS / s.totalLines : 0,
    };
  });

  // Sort
  summaries.sort((a, b) => {
    if (sortKey === 'sales') return b.sales - a.sales;
    if (sortKey === 'profit') return b.profit - a.profit;
    if (sortKey === 'demand') return b.actualDemand - a.actualDemand;
    if (sortKey === 'variance') return Math.abs(b.variancePct) - Math.abs(a.variancePct);
    if (sortKey === 'stockout') return (b.criticalLines / b.totalLines) - (a.criticalLines / a.totalLines);
    return 0;
  });

  const maxSales = Math.max(...summaries.map((s) => s.sales), 1);
  const maxDemand = Math.max(...summaries.map((s) => s.actualDemand), 1);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
      {/* Title & Sort Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-slate-100 font-display">
            Regional Demand, Sales & Profits
          </h3>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-slate-800 text-[11px]">
          <span className="text-slate-400 px-1.5 flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3" />
            Sort:
          </span>
          <button
            onClick={() => setSortKey('sales')}
            className={`px-2 py-0.5 rounded transition-colors ${
              sortKey === 'sales' ? 'bg-slate-800 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sales (₹)
          </button>
          <button
            onClick={() => setSortKey('profit')}
            className={`px-2 py-0.5 rounded transition-colors ${
              sortKey === 'profit' ? 'bg-slate-800 text-teal-300 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Profits (₹)
          </button>
          <button
            onClick={() => setSortKey('demand')}
            className={`px-2 py-0.5 rounded transition-colors ${
              sortKey === 'demand' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Demand
          </button>
          <button
            onClick={() => setSortKey('variance')}
            className={`px-2 py-0.5 rounded transition-colors ${
              sortKey === 'variance' ? 'bg-slate-800 text-amber-300 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Variance
          </button>
        </div>
      </div>

      {/* Bar List */}
      <div className="space-y-2.5">
        {summaries.map((s) => {
          const isSelected = selectedRegions.includes(s.region);
          const salesPct = (s.sales / maxSales) * 100;
          const demandPct = (s.actualDemand / maxDemand) * 100;
          const stockoutRisk = (s.criticalLines / s.totalLines) * 100;

          return (
            <div
              key={s.region}
              onClick={() => onSelectRegion(s.region)}
              className={`p-2 rounded-md transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-teal-500/10 border-teal-500/50 shadow-xs'
                  : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-1.5 font-medium">
                  {isSelected ? (
                    <span className="w-4 h-4 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center text-[10px]">
                      <Check className="w-3 h-3" />
                    </span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  )}
                  <span className={isSelected ? 'text-teal-300 font-semibold' : 'text-slate-200'}>
                    {s.region}
                  </span>
                  {stockoutRisk > 10 && (
                    <span className="text-[10px] text-rose-400 flex items-center gap-0.5" title="Critical Stockout Risk in District Hubs">
                      <AlertCircle className="w-3 h-3" />
                      {stockoutRisk.toFixed(0)}% at risk
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 font-mono text-[11px] tabular-nums">
                  <span className="text-emerald-400 font-medium">₹{(s.sales / 100000).toFixed(1)}L sales</span>
                  <span className="text-teal-300">₹{(s.profit / 100000).toFixed(1)}L profit ({s.profitMarginPct.toFixed(0)}%)</span>
                  <span className="text-slate-400">{Math.round(s.actualDemand / 1000)}k units</span>
                </div>
              </div>

              {/* Stacked comparison bar */}
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-emerald-500/80 transition-all duration-300"
                  style={{ width: `${salesPct}%` }}
                  title={`Sales: ₹${Math.round(s.sales).toLocaleString('en-IN')}`}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                <span>Avg Stock Cover: <span className="font-mono text-slate-300">{s.avgMOS.toFixed(1)} MOS</span></span>
                <span>
                  Forecast Variance: <span className={`font-mono font-medium ${s.variancePct >= 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {s.variancePct >= 0 ? `+${s.variancePct.toFixed(1)}%` : `${s.variancePct.toFixed(1)}%`}
                  </span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/60 mt-2 flex justify-between">
        <span>Click any region to filter entire dashboard</span>
        <span className="text-teal-400">Green bar: Relative Procurement Sales</span>
      </div>
    </div>
  );
};
