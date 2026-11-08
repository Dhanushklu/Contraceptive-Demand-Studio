import React, { useState } from 'react';
import { SupplyRecord, DaxMeasure } from '../../types/supplyChain';
import { DAX_MEASURES, evaluateDataset, formatMetricValue } from '../../services/daxEngine';
import { Code2, Copy, Check, Calculator, Sparkles, BookOpen, ArrowRight } from 'lucide-react';

interface DaxMeasuresStudioProps {
  records: SupplyRecord[];
  onProceedToKpiCards: () => void;
}

export const DaxMeasuresStudio: React.FC<DaxMeasuresStudioProps> = ({
  records,
  onProceedToKpiCards,
}) => {
  const [selectedMeasureId, setSelectedMeasureId] = useState<string>(DAX_MEASURES[0].id);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const evaluated = evaluateDataset(records);

  const selectedMeasure = DAX_MEASURES.find((m) => m.id === selectedMeasureId) || DAX_MEASURES[0];

  const getMetricEvaluatedValue = (id: string): { num: number; formatted: string } => {
    switch (id) {
      case 'total_actual_demand':
        return { num: evaluated.totalActualDemand, formatted: formatMetricValue(evaluated.totalActualDemand, 'integer') };
      case 'total_forecasted_demand':
        return { num: evaluated.totalForecastedDemand, formatted: formatMetricValue(evaluated.totalForecastedDemand, 'integer') };
      case 'forecast_variance':
        return { num: evaluated.forecastVariance, formatted: formatMetricValue(evaluated.forecastVariance, 'integer') };
      case 'forecast_variance_pct':
        return { num: evaluated.forecastVariancePct, formatted: formatMetricValue(evaluated.forecastVariancePct, 'percent') };
      case 'wape_pct':
        return { num: evaluated.wapePct, formatted: formatMetricValue(evaluated.wapePct, 'percent') };
      case 'forecast_accuracy_pct':
        return { num: evaluated.forecastAccuracyPct, formatted: formatMetricValue(evaluated.forecastAccuracyPct, 'percent') };
      case 'mape_pct':
        return { num: evaluated.mapePct, formatted: formatMetricValue(evaluated.mapePct, 'percent') };
      case 'total_sales':
        return { num: evaluated.totalSales, formatted: formatMetricValue(evaluated.totalSales, 'currency') };
      case 'total_cost':
        return { num: evaluated.totalCost, formatted: formatMetricValue(evaluated.totalCost, 'currency') };
      case 'gross_profit':
        return { num: evaluated.grossProfit, formatted: formatMetricValue(evaluated.grossProfit, 'currency') };
      case 'profit_margin_pct':
        return { num: evaluated.profitMarginPct, formatted: formatMetricValue(evaluated.profitMarginPct, 'percent') };
      case 'stock_on_hand':
        return { num: evaluated.stockOnHand, formatted: formatMetricValue(evaluated.stockOnHand, 'integer') };
      case 'months_of_stock':
        return { num: evaluated.averageMOS, formatted: formatMetricValue(evaluated.averageMOS, 'decimal') };
      case 'stockout_risk_rate':
        return { num: evaluated.stockoutRiskRate, formatted: formatMetricValue(evaluated.stockoutRiskRate, 'percent') };
      case 'couple_years_protection':
        return { num: evaluated.totalCYP, formatted: formatMetricValue(evaluated.totalCYP, 'integer') };
      default:
        return { num: 0, formatted: '0' };
    }
  };

  const handleCopy = (snippet: string, id: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = ['All', 'Demand & Forecast', 'Financial & Margin', 'Supply Chain & Inventory', 'Health Impact'];

  const filteredMeasures = activeCategory === 'All'
    ? DAX_MEASURES
    : DAX_MEASURES.filter((m) => m.category === activeCategory);

  const selectedVal = getMetricEvaluatedValue(selectedMeasure.id);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-teal-400 mb-1">
            Step 2 of 8 · DAX Modeling Engine (Power BI Compatible)
          </div>
          <h2 className="text-xl font-bold text-white font-display">
            Create and Evaluate DAX KPI Measures
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Inspect production DAX calculation formulas for demand forecasting, WAPE accuracy, supply cost recovery, and stockout vulnerability. All measures dynamically compute in real-time against active slicers.
          </p>
        </div>

        <button
          onClick={onProceedToKpiCards}
          className="flex items-center gap-2 px-4 py-2 bg-teal-400 hover:bg-teal-300 text-slate-950 font-semibold rounded-md text-xs transition-colors shadow-sm"
        >
          <span>Proceed to Step 3: KPI Cards Studio</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left: Measure Catalog List (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-teal-400" />
              <h3 className="text-sm font-semibold text-slate-100 font-display">
                DAX Measures Catalog ({DAX_MEASURES.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Live Evaluated
            </span>
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-1 mb-3">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-2 py-1 rounded text-[11px] transition-colors ${
                  activeCategory === c
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 font-semibold'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* List of Measures */}
          <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredMeasures.map((m) => {
              const val = getMetricEvaluatedValue(m.id);
              const isSelected = selectedMeasureId === m.id;

              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMeasureId(m.id)}
                  className={`p-2.5 rounded-md cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-teal-500/10 border-teal-500/50 shadow-xs'
                      : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-semibold ${isSelected ? 'text-teal-300' : 'text-slate-200'}`}>
                      [{m.name}]
                    </span>
                    <span className="font-mono text-xs font-bold text-white tabular-nums">
                      {val.formatted} {m.formatType === 'integer' && m.unit === 'Units' ? '' : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span className="truncate max-w-[200px]">{m.category}</span>
                    <span className="font-mono text-[10px] text-slate-400">{m.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Measure Inspector & Power BI Code Editor (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
          <div>
            {/* Header of Inspector */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-teal-400" />
                  <h3 className="text-base font-bold text-white font-display">
                    [{selectedMeasure.name}]
                  </h3>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700 font-mono">
                    {selectedMeasure.category}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedMeasure.description}
                </p>
              </div>

              {/* Dynamic Value Badge */}
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-right min-w-[130px]">
                <div className="text-[10px] text-slate-400 font-mono">CURRENT RESULT</div>
                <div className="text-xl font-bold font-mono text-teal-300 tabular-nums">
                  {selectedVal.formatted}
                </div>
              </div>
            </div>

            {/* DAX Formula Box */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-medium text-slate-300 flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-teal-400" />
                  Power BI DAX Formula Expression
                </span>
                <button
                  onClick={() => handleCopy(selectedMeasure.powerBiSnippet, selectedMeasure.id)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] transition-colors"
                >
                  {copiedId === selectedMeasure.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy DAX</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-950 rounded-lg p-3.5 border border-slate-800 font-mono text-xs text-teal-200 leading-relaxed overflow-x-auto selection:bg-teal-500/30">
                <pre>{selectedMeasure.powerBiSnippet}</pre>
              </div>
            </div>

            {/* DAX Architectural Logic & Breakdown */}
            <div className="mt-4 p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 text-xs space-y-1.5">
              <div className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Calculation Invariant & Business Rationale:
              </div>
              <p className="text-slate-400 leading-normal">
                This measure evaluates with row-context safety via <code className="text-teal-300">SUMX</code> and <code className="text-teal-300">DIVIDE</code> to prevent divide-by-zero exceptions in health facilities where demand or baseline forecasts are zero during non-reporting months.
              </p>
            </div>
          </div>

          {/* Quick Copy Snippet Banner */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Compatible with Power BI Desktop 2024+, Excel Power Pivot, and Analysis Services.</span>
            <span className="font-mono text-teal-400">Evaluated on {records.length} records</span>
          </div>
        </div>

      </div>
    </div>
  );
};
