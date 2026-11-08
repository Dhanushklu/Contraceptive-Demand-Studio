import React from 'react';
import { SupplyRecord } from '../../types/supplyChain';
import { ShieldAlert, CheckCircle2, AlertTriangle, PackageOpen } from 'lucide-react';

interface StockCoverMatrixProps {
  records: SupplyRecord[];
  onFilterByStatus?: (status: string) => void;
}

export const StockCoverMatrix: React.FC<StockCoverMatrixProps> = ({
  records,
  onFilterByStatus,
}) => {
  let criticalCount = 0;
  let understockedCount = 0;
  let adequateCount = 0;
  let overstockedCount = 0;

  records.forEach((r) => {
    if (r.stockCoverMonths < 2.0) criticalCount++;
    else if (r.stockCoverMonths < 3.0) understockedCount++;
    else if (r.stockCoverMonths <= 6.0) adequateCount++;
    else overstockedCount++;
  });

  const total = Math.max(records.length, 1);
  const criticalPct = (criticalCount / total) * 100;
  const underPct = (understockedCount / total) * 100;
  const adequatePct = (adequateCount / total) * 100;
  const overPct = (overstockedCount / total) * 100;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
      {/* Title */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-slate-100 font-display">
            Supply Chain Stock Cover Corridor (MOS)
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Safe Band: 3.0 - 6.0 MOS
        </span>
      </div>

      {/* Stock Health Segmented Bar */}
      <div className="space-y-3">
        <div className="h-4 w-full bg-slate-950 rounded-md overflow-hidden flex border border-slate-800">
          <div
            className="h-full bg-rose-500/90 transition-all duration-300"
            style={{ width: `${criticalPct}%` }}
            title={`Stockout Critical (< 2 MOS): ${criticalCount} records (${criticalPct.toFixed(1)}%)`}
          />
          <div
            className="h-full bg-amber-500/90 transition-all duration-300"
            style={{ width: `${underPct}%` }}
            title={`Understocked (2 - 3 MOS): ${understockedCount} records (${underPct.toFixed(1)}%)`}
          />
          <div
            className="h-full bg-emerald-500/90 transition-all duration-300"
            style={{ width: `${adequatePct}%` }}
            title={`Adequate (3 - 6 MOS): ${adequateCount} records (${adequatePct.toFixed(1)}%)`}
          />
          <div
            className="h-full bg-blue-500/90 transition-all duration-300"
            style={{ width: `${overPct}%` }}
            title={`Overstocked (> 6 MOS): ${overstockedCount} records (${overPct.toFixed(1)}%)`}
          />
        </div>

        {/* Status Breakdown Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          
          {/* Critical */}
          <div
            onClick={() => onFilterByStatus?.('Stockout Critical')}
            className="p-2 rounded bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between text-[11px] text-rose-400 font-medium">
              <span>&lt; 2.0 MOS</span>
              <AlertTriangle className="w-3 h-3 text-rose-400" />
            </div>
            <div className="text-base font-bold font-mono text-rose-300 mt-0.5">
              {criticalCount} <span className="text-xs font-normal text-rose-400">({criticalPct.toFixed(1)}%)</span>
            </div>
            <div className="text-[10px] text-rose-400/80">Stockout Critical</div>
          </div>

          {/* Understocked */}
          <div
            onClick={() => onFilterByStatus?.('Understocked')}
            className="p-2 rounded bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between text-[11px] text-amber-400 font-medium">
              <span>2.0 - 2.9 MOS</span>
              <PackageOpen className="w-3 h-3 text-amber-400" />
            </div>
            <div className="text-base font-bold font-mono text-amber-300 mt-0.5">
              {understockedCount} <span className="text-xs font-normal text-amber-400">({underPct.toFixed(1)}%)</span>
            </div>
            <div className="text-[10px] text-amber-400/80">Understocked</div>
          </div>

          {/* Optimal */}
          <div
            onClick={() => onFilterByStatus?.('Adequate / Optimal')}
            className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between text-[11px] text-emerald-400 font-medium">
              <span>3.0 - 6.0 MOS</span>
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            </div>
            <div className="text-base font-bold font-mono text-emerald-300 mt-0.5">
              {adequateCount} <span className="text-xs font-normal text-emerald-400">({adequatePct.toFixed(1)}%)</span>
            </div>
            <div className="text-[10px] text-emerald-400/80">Optimal Buffer</div>
          </div>

          {/* Overstocked */}
          <div
            onClick={() => onFilterByStatus?.('Overstocked')}
            className="p-2 rounded bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between text-[11px] text-blue-400 font-medium">
              <span>&gt; 6.0 MOS</span>
              <PackageOpen className="w-3 h-3 text-blue-400" />
            </div>
            <div className="text-base font-bold font-mono text-blue-300 mt-0.5">
              {overstockedCount} <span className="text-xs font-normal text-blue-400">({overPct.toFixed(1)}%)</span>
            </div>
            <div className="text-[10px] text-blue-400/80">Expiration Risk</div>
          </div>

        </div>
      </div>

      <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/60 mt-2 flex justify-between">
        <span>Click any risk segment to filter high-priority supply bottlenecks</span>
        <span className="font-mono text-slate-400">WHO/UNFPA Standard</span>
      </div>
    </div>
  );
};
