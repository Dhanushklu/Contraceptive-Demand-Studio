import React from 'react';
import { EvaluatedMetrics } from '../services/daxEngine';
import { TrendingUp, TrendingDown, AlertTriangle, ShieldCheck, IndianRupee, Layers, Activity, Calendar } from 'lucide-react';

interface KpiCardsGridProps {
  metrics: EvaluatedMetrics;
  onCardClick?: (metricType: 'units' | 'sales' | 'profit' | 'variance') => void;
  selectedMetricMode: 'units' | 'sales' | 'profit' | 'variance';
}

const formatInr = (val: number) => {
  if (Math.abs(val) >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  } else if (Math.abs(val) >= 100000) {
    return `₹${(val / 100000).toFixed(1)}L`;
  }
  return `₹${Math.round(val).toLocaleString('en-IN')}`;
};

export const KpiCardsGrid: React.FC<KpiCardsGridProps> = ({
  metrics,
  onCardClick,
  selectedMetricMode,
}) => {
  const isVariancePositive = metrics.forecastVariance >= 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      
      {/* Card 1: Total Demand */}
      <div 
        onClick={() => onCardClick?.('units')}
        className={`bg-slate-900/80 p-3.5 rounded-lg border transition-all cursor-pointer relative overflow-hidden group ${
          selectedMetricMode === 'units'
            ? 'border-teal-500/60 ring-1 ring-teal-500/40 bg-slate-900'
            : 'border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-medium text-slate-300">Total Actual Demand</span>
          <Activity className="w-3.5 h-3.5 text-teal-400 group-hover:scale-110 transition-transform" />
        </div>
        <div className="text-xl lg:text-2xl font-bold font-mono tabular-nums text-white tracking-tight">
          {Math.round(metrics.totalActualDemand).toLocaleString('en-IN')}
        </div>
        <div className="flex items-center gap-1.5 mt-1.5 text-[11px]">
          <span className="text-slate-400">Fcst:</span>
          <span className="font-mono text-slate-300">{Math.round(metrics.totalForecastedDemand).toLocaleString('en-IN')}</span>
          <span className="text-slate-600">·</span>
          <span className={`font-mono font-medium ${isVariancePositive ? 'text-amber-400' : 'text-emerald-400'}`}>
            {isVariancePositive ? `+${metrics.forecastVariancePct.toFixed(1)}%` : `${metrics.forecastVariancePct.toFixed(1)}%`}
          </span>
        </div>
        <div className="mt-2 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-teal-400 rounded-full transition-all duration-500" 
            style={{ width: `${Math.min(100, Math.max(10, (metrics.totalActualDemand / (metrics.totalForecastedDemand || 1)) * 100))}%` }} 
          />
        </div>
      </div>

      {/* Card 2: Total Sales / Value */}
      <div 
        onClick={() => onCardClick?.('sales')}
        className={`bg-slate-900/80 p-3.5 rounded-lg border transition-all cursor-pointer relative overflow-hidden group ${
          selectedMetricMode === 'sales'
            ? 'border-emerald-500/60 ring-1 ring-emerald-500/40 bg-slate-900'
            : 'border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-medium text-slate-300">Procurement Value</span>
          <IndianRupee className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
        </div>
        <div className="text-xl lg:text-2xl font-bold font-mono tabular-nums text-emerald-400 tracking-tight">
          {formatInr(metrics.totalSales)}
        </div>
        <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-400">
          <span>Cost:</span>
          <span className="font-mono text-slate-300">{formatInr(metrics.totalCost)}</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400 font-mono">
            ₹{metrics.totalActualDemand > 0 ? (metrics.totalSales / metrics.totalActualDemand).toFixed(1) : '0'}/unit
          </span>
        </div>
        <div className="mt-2 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-400 rounded-full transition-all duration-500" 
            style={{ width: '85%' }} 
          />
        </div>
      </div>

      {/* Card 3: Net Program Profit / Margin */}
      <div 
        onClick={() => onCardClick?.('profit')}
        className={`bg-slate-900/80 p-3.5 rounded-lg border transition-all cursor-pointer relative overflow-hidden group ${
          selectedMetricMode === 'profit'
            ? 'border-cyan-500/60 ring-1 ring-cyan-500/40 bg-slate-900'
            : 'border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-medium text-slate-300">Net Program Margin</span>
          <TrendingUp className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
        </div>
        <div className="text-xl lg:text-2xl font-bold font-mono tabular-nums text-cyan-300 tracking-tight">
          {formatInr(metrics.grossProfit)}
        </div>
        <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-400">
          <span>Margin:</span>
          <span className="font-mono font-medium text-cyan-400">
            {metrics.profitMarginPct.toFixed(1)}%
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400">Cost Recovery</span>
        </div>
        <div className="mt-2 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-cyan-400 rounded-full transition-all duration-500" 
            style={{ width: `${Math.min(100, Math.max(10, metrics.profitMarginPct * 2))}%` }} 
          />
        </div>
      </div>

      {/* Card 4: Forecast Accuracy (1 - WAPE) */}
      <div 
        onClick={() => onCardClick?.('variance')}
        className={`bg-slate-900/80 p-3.5 rounded-lg border transition-all cursor-pointer relative overflow-hidden group ${
          selectedMetricMode === 'variance'
            ? 'border-purple-500/60 ring-1 ring-purple-500/40 bg-slate-900'
            : 'border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-medium text-slate-300">Forecast Accuracy</span>
          <ShieldCheck className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
        </div>
        <div className="text-xl lg:text-2xl font-bold font-mono tabular-nums text-purple-300 tracking-tight">
          {metrics.forecastAccuracyPct.toFixed(1)}%
        </div>
        <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-400">
          <span>WAPE:</span>
          <span className="font-mono text-purple-400 font-medium">{metrics.wapePct.toFixed(1)}%</span>
          <span className="text-slate-600">·</span>
          <span>MAPE: <span className="font-mono text-slate-300">{metrics.mapePct.toFixed(1)}%</span></span>
        </div>
        <div className="mt-2 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-purple-400 rounded-full transition-all duration-500" 
            style={{ width: `${Math.min(100, metrics.forecastAccuracyPct)}%` }} 
          />
        </div>
      </div>

      {/* Card 5: Average Months of Stock (MOS) */}
      <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-medium text-slate-300">Average Stock Cover</span>
          <Layers className="w-3.5 h-3.5 text-blue-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl lg:text-2xl font-bold font-mono tabular-nums text-white tracking-tight">
            {metrics.averageMOS.toFixed(1)}
          </span>
          <span className="text-xs text-slate-400 font-sans">MOS</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-400">
          <span>Target:</span>
          <span className="font-mono text-slate-300">3.0 - 6.0</span>
          <span className="text-slate-600">·</span>
          <span className={`font-medium ${metrics.averageMOS < 3.0 ? 'text-rose-400' : metrics.averageMOS > 6.0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {metrics.averageMOS < 3.0 ? 'Low Stock' : metrics.averageMOS > 6.0 ? 'Overstock' : 'Optimal'}
          </span>
        </div>
        <div className="mt-2 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-400 rounded-full transition-all duration-500" 
            style={{ width: `${Math.min(100, (metrics.averageMOS / 8) * 100)}%` }} 
          />
        </div>
      </div>

      {/* Card 6: Stockout Vulnerability & CYP */}
      <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-medium text-slate-300">Stockout Risk Rate</span>
          <AlertTriangle className={`w-3.5 h-3.5 ${metrics.stockoutRiskRate > 15 ? 'text-rose-400' : 'text-amber-400'}`} />
        </div>
        <div className={`text-xl lg:text-2xl font-bold font-mono tabular-nums tracking-tight ${metrics.stockoutRiskRate > 15 ? 'text-rose-400' : 'text-amber-300'}`}>
          {metrics.stockoutRiskRate.toFixed(1)}%
        </div>
        <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-400">
          <span>CYP Impact:</span>
          <span className="font-mono text-teal-300 font-medium">
            {(metrics.totalCYP / 1000).toFixed(0)}k
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400">{metrics.averageLeadTime.toFixed(0)}d Lead</span>
        </div>
        <div className="mt-2 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${metrics.stockoutRiskRate > 15 ? 'bg-rose-500' : 'bg-amber-400'}`} 
            style={{ width: `${Math.min(100, Math.max(5, metrics.stockoutRiskRate * 3))}%` }} 
          />
        </div>
      </div>

    </div>
  );
};
