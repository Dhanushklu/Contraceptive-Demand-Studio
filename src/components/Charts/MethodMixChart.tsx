import React from 'react';
import { SupplyRecord, ProductCategory } from '../../types/supplyChain';
import { PieChart, HeartHandshake, Check } from 'lucide-react';

interface MethodMixChartProps {
  records: SupplyRecord[];
  selectedCategories: ProductCategory[];
  onSelectCategory: (category: ProductCategory) => void;
}

const CATEGORY_COLORS: Record<ProductCategory, { bg: string; text: string; hex: string }> = {
  'Injectables': { bg: 'bg-teal-500', text: 'text-teal-400', hex: '#14b8a6' },
  'Implants': { bg: 'bg-purple-500', text: 'text-purple-400', hex: '#a855f7' },
  'Oral Pills': { bg: 'bg-sky-500', text: 'text-sky-400', hex: '#0ea5e9' },
  'IUDs': { bg: 'bg-amber-500', text: 'text-amber-400', hex: '#f59e0b' },
  'Barrier / Condoms': { bg: 'bg-emerald-500', text: 'text-emerald-400', hex: '#10b981' },
  'Emergency Contraception': { bg: 'bg-rose-500', text: 'text-rose-400', hex: '#f43f5e' },
};

export const MethodMixChart: React.FC<MethodMixChartProps> = ({
  records,
  selectedCategories,
  onSelectCategory,
}) => {
  const catMap = new Map<ProductCategory, { actual: number; sales: number; profit: number; cyp: number }>();

  let totalDemand = 0;
  let totalCYP = 0;

  records.forEach((r) => {
    totalDemand += r.actualConsumption;
    const cyp = r.actualConsumption * r.cypFactor;
    totalCYP += cyp;

    const existing = catMap.get(r.productCategory);
    if (!existing) {
      catMap.set(r.productCategory, {
        actual: r.actualConsumption,
        sales: r.totalSales,
        profit: r.grossProfit,
        cyp,
      });
    } else {
      existing.actual += r.actualConsumption;
      existing.sales += r.totalSales;
      existing.profit += r.grossProfit;
      existing.cyp += cyp;
    }
  });

  const categories = Array.from(catMap.entries())
    .map(([cat, data]) => ({
      category: cat,
      ...data,
      shareDemandPct: totalDemand > 0 ? (data.actual / totalDemand) * 100 : 0,
      shareCypPct: totalCYP > 0 ? (data.cyp / totalCYP) * 100 : 0,
    }))
    .sort((a, b) => b.cyp - a.cyp); // Sort by public health impact (CYP)

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <PieChart className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-semibold text-slate-100 font-display">
            Contraceptive Method Mix & CYP Impact
          </h3>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Total CYP: <span className="text-teal-300 font-bold">{(totalCYP / 1000).toFixed(0)}k</span>
        </div>
      </div>

      {/* Progress / Share Stack */}
      <div className="space-y-3">
        {/* Method Mix Visual Stack */}
        <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden flex shadow-inner">
          {categories.map((c) => (
            <div
              key={c.category}
              className="h-full transition-all duration-300 cursor-pointer hover:opacity-80"
              style={{
                width: `${c.shareDemandPct}%`,
                backgroundColor: CATEGORY_COLORS[c.category]?.hex || '#94a3b8',
              }}
              onClick={() => onSelectCategory(c.category)}
              title={`${c.category}: ${c.shareDemandPct.toFixed(1)}% of demand`}
            />
          ))}
        </div>

        {/* Detailed List */}
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {categories.map((c) => {
            const isSelected = selectedCategories.includes(c.category);
            const style = CATEGORY_COLORS[c.category] || { bg: 'bg-slate-500', text: 'text-slate-400', hex: '#64748b' };

            return (
              <div
                key={c.category}
                onClick={() => onSelectCategory(c.category)}
                className={`flex items-center justify-between p-1.5 rounded transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-purple-500/10 border-purple-500/40'
                    : 'bg-slate-950/30 border-slate-800/60 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: style.hex }}
                  />
                  <span className={`text-xs ${isSelected ? 'text-purple-300 font-semibold' : 'text-slate-200'}`}>
                    {c.category}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono tabular-nums">
                  <div className="text-right">
                    <span className="text-slate-300">{c.shareDemandPct.toFixed(1)}%</span>
                    <span className="text-[10px] text-slate-400 ml-1">Demand</span>
                  </div>
                  <div className="text-right">
                    <span className="text-teal-300 font-medium">{(c.cyp / 1000).toFixed(1)}k</span>
                    <span className="text-[10px] text-slate-400 ml-1">CYP</span>
                  </div>
                  <div className="text-right w-16">
                    <span className="text-emerald-400">₹{(c.sales / 100000).toFixed(1)}L</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60 mt-2">
        <span className="flex items-center gap-1">
          <HeartHandshake className="w-3 h-3 text-slate-400" />
          Implants & IUDs contribute highest Couple Years of Protection (CYP)
        </span>
        <span className="text-purple-400">Click to filter</span>
      </div>
    </div>
  );
};
