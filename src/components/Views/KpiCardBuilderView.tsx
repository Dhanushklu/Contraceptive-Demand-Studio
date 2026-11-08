import React, { useState } from 'react';
import { SupplyRecord } from '../../types/supplyChain';
import { evaluateDataset, DAX_MEASURES } from '../../services/daxEngine';
import { Sliders, Copy, Check, Eye, LayoutGrid, ArrowRight, ShieldCheck, TrendingUp, AlertTriangle } from 'lucide-react';

interface KpiCardBuilderViewProps {
  records: SupplyRecord[];
  onProceedToDashboard: () => void;
}

export const KpiCardBuilderView: React.FC<KpiCardBuilderViewProps> = ({
  records,
  onProceedToDashboard,
}) => {
  const [selectedKpi, setSelectedKpi] = useState<string>('demand');
  const [accentColor, setAccentColor] = useState<'teal' | 'emerald' | 'purple' | 'amber' | 'rose'>('teal');
  const [showSparkline, setShowSparkline] = useState<boolean>(true);
  const [targetComparison, setTargetComparison] = useState<boolean>(true);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const evaluated = evaluateDataset(records);

  const kpiConfigs: Record<string, { title: string; value: string; subtext: string; delta: string; daxMeasure: string }> = {
    demand: {
      title: 'Total Actual Demand',
      value: `${Math.round(evaluated.totalActualDemand).toLocaleString()} units`,
      subtext: `Baseline Forecast: ${Math.round(evaluated.totalForecastedDemand).toLocaleString()}`,
      delta: evaluated.forecastVariance >= 0 ? `+${evaluated.forecastVariancePct.toFixed(1)}% variance` : `${evaluated.forecastVariancePct.toFixed(1)}% variance`,
      daxMeasure: '[Total Actual Demand]',
    },
    sales: {
      title: 'Procurement Sales Value',
      value: `₹${(evaluated.totalSales / 100000).toFixed(1)} Lakh`,
      subtext: `Total Wholesale Cost: ₹${(evaluated.totalCost / 100000).toFixed(1)} Lakh`,
      delta: `+₹${(evaluated.grossProfit / 100000).toFixed(1)} Lakh net margin`,
      daxMeasure: '[Total Sales]',
    },
    profit: {
      title: 'Net Program Margin',
      value: `₹${(evaluated.grossProfit / 100000).toFixed(1)} Lakh`,
      subtext: `Cost Recovery: ${evaluated.profitMarginPct.toFixed(1)}%`,
      delta: 'Self-sustaining corridor',
      daxMeasure: '[Net Program Profit]',
    },
    accuracy: {
      title: 'Forecast Accuracy (1 - WAPE)',
      value: `${evaluated.forecastAccuracyPct.toFixed(1)}%`,
      subtext: `WAPE Error: ${evaluated.wapePct.toFixed(1)}% · MAPE: ${evaluated.mapePct.toFixed(1)}%`,
      delta: evaluated.forecastAccuracyPct >= 85 ? 'Meets 85% Target' : 'Below 85% Target',
      daxMeasure: '[Forecast Accuracy %]',
    },
    mos: {
      title: 'Months of Stock (MOS)',
      value: `${evaluated.averageMOS.toFixed(1)} MOS`,
      subtext: 'Optimal Safe Corridor: 3.0 - 6.0 Months',
      delta: evaluated.averageMOS < 3.0 ? 'Understocked' : evaluated.averageMOS > 6.0 ? 'Overstocked' : 'Optimal Inventory',
      daxMeasure: '[Average MOS]',
    },
    stockout: {
      title: 'Stockout Vulnerability Rate',
      value: `${evaluated.stockoutRiskRate.toFixed(1)}%`,
      subtext: `Total CYP Protected: ${(evaluated.totalCYP / 1000).toFixed(0)}k`,
      delta: evaluated.stockoutRiskRate > 15 ? 'Critical Alert' : 'Nominal Risk',
      daxMeasure: '[Stockout Risk Rate %]',
    },
  };

  const current = kpiConfigs[selectedKpi] || kpiConfigs.demand;

  const colorStyles = {
    teal: { border: 'border-teal-500/50', text: 'text-teal-400', bar: 'bg-teal-400', badge: 'bg-teal-500/10 text-teal-300' },
    emerald: { border: 'border-emerald-500/50', text: 'text-emerald-400', bar: 'bg-emerald-400', badge: 'bg-emerald-500/10 text-emerald-300' },
    purple: { border: 'border-purple-500/50', text: 'text-purple-400', bar: 'bg-purple-400', badge: 'bg-purple-500/10 text-purple-300' },
    amber: { border: 'border-amber-500/50', text: 'text-amber-400', bar: 'bg-amber-400', badge: 'bg-amber-500/10 text-amber-300' },
    rose: { border: 'border-rose-500/50', text: 'text-rose-400', bar: 'bg-rose-400', badge: 'bg-rose-500/10 text-rose-300' },
  }[accentColor];

  const generatedPowerBiCardJson = `// Power BI Modern Card Visual Configuration
Card_Title = "${current.title}"
Primary_Measure = ${current.daxMeasure}
Accent_Color = "${colorStyles.text}"
Target_Reference_Label = "${current.subtext}"
Status_Badge_Rule = IF(${current.daxMeasure} >= [Target], "#10b981", "#ef4444")`;

  const copyCardJson = () => {
    navigator.clipboard.writeText(generatedPowerBiCardJson);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-teal-400 mb-1">
            Step 3 of 8 · Executive Visual Card Architecture
          </div>
          <h2 className="text-xl font-bold text-white font-display">
            Build and Customize Health Supply Chain KPI Cards
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Configure visual metrics, dynamic reference labels, sparkline trends, and conditional alert triggers for executive reporting.
          </p>
        </div>

        <button
          onClick={onProceedToDashboard}
          className="flex items-center gap-2 px-4 py-2 bg-teal-400 hover:bg-teal-300 text-slate-950 font-semibold rounded-md text-xs transition-colors shadow-sm"
        >
          <span>View on Executive Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left: Controls & Customizer (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Sliders className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-semibold text-slate-100 font-display">
              Card Visual Properties
            </h3>
          </div>

          {/* KPI Selector */}
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1.5">
              Target Supply Chain KPI:
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'demand', label: 'Actual Demand' },
                { id: 'sales', label: 'Procurement Sales' },
                { id: 'profit', label: 'Program Margin' },
                { id: 'accuracy', label: 'Forecast Accuracy' },
                { id: 'mos', label: 'Months of Stock' },
                { id: 'stockout', label: 'Stockout Risk' },
              ].map((k) => (
                <button
                  key={k.id}
                  onClick={() => setSelectedKpi(k.id)}
                  className={`px-3 py-2 text-xs rounded text-left transition-colors border ${
                    selectedKpi === k.id
                      ? 'bg-teal-500/20 text-teal-300 border-teal-500/50 font-semibold'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {k.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Palette */}
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1.5">
              Color Accent Tone:
            </label>
            <div className="flex items-center gap-2">
              {[
                { id: 'teal', label: 'Teal (Public Health)', bg: 'bg-teal-400' },
                { id: 'emerald', label: 'Emerald (Revenue)', bg: 'bg-emerald-400' },
                { id: 'purple', label: 'Purple (Impact)', bg: 'bg-purple-400' },
                { id: 'amber', label: 'Amber (Warning)', bg: 'bg-amber-400' },
                { id: 'rose', label: 'Rose (Critical Alert)', bg: 'bg-rose-400' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setAccentColor(c.id as any)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${c.bg} ${
                    accentColor === c.id ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
              <span>Show Progress / Health Fill Bar</span>
              <input
                type="checkbox"
                checked={showSparkline}
                onChange={(e) => setShowSparkline(e.target.checked)}
                className="rounded accent-teal-400"
              />
            </label>

            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
              <span>Show Target & Variance Reference Delta</span>
              <input
                type="checkbox"
                checked={targetComparison}
                onChange={(e) => setTargetComparison(e.target.checked)}
                className="rounded accent-teal-400"
              />
            </label>
          </div>
        </div>

        {/* Right: Live Preview & Power BI Specification (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Live Preview Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-5">
            <div className="text-xs text-slate-400 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <Eye className="w-3.5 h-3.5 text-teal-400" />
                Live Card Visual Preview
              </span>
              <span className="font-mono text-[10px] text-teal-400">1440px Scaled</span>
            </div>

            {/* The Rendered Card */}
            <div className={`p-5 rounded-lg bg-slate-950 border ${colorStyles.border} shadow-lg transition-all`}>
              <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
                <span className="font-medium text-slate-200">{current.title}</span>
                <span className="font-mono text-xs text-slate-400">{current.daxMeasure}</span>
              </div>

              <div className={`text-3xl font-bold font-mono tabular-nums tracking-tight ${colorStyles.text}`}>
                {current.value}
              </div>

              {targetComparison && (
                <div className="flex items-center gap-2 mt-2 text-xs">
                  <span className="text-slate-400">{current.subtext}</span>
                  <span className="text-slate-600">·</span>
                  <span className={`px-2 py-0.5 rounded font-mono text-[11px] font-medium border ${colorStyles.badge}`}>
                    {current.delta}
                  </span>
                </div>
              )}

              {showSparkline && (
                <div className="mt-3.5 h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className={`h-full ${colorStyles.bar} rounded-full`} style={{ width: '78%' }} />
                </div>
              )}
            </div>
          </div>

          {/* Generated Code Block */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-medium text-slate-300">
                Power BI Visual Configuration Code
              </span>
              <button
                onClick={copyCardJson}
                className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] transition-colors"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Config</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded font-mono text-xs text-teal-300 border border-slate-800 overflow-x-auto">
              <pre>{generatedPowerBiCardJson}</pre>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
