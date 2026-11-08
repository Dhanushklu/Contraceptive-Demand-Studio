import React, { useState } from 'react';
import { SupplyRecord } from '../../types/supplyChain';
import { EvaluatedMetrics } from '../../services/daxEngine';
import { X, Download, FileText, Check, Printer, ShieldCheck } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: SupplyRecord[];
  metrics: EvaluatedMetrics;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  records,
  metrics,
}) => {
  const [copiedSummary, setCopiedSummary] = useState(false);

  if (!isOpen) return null;

  const exportCsv = () => {
    const headers = [
      'Record_ID',
      'Date',
      'Region',
      'District',
      'Facility_Tier',
      'Product_Category',
      'Product_Name',
      'Actual_Consumption',
      'Forecasted_Demand',
      'Variance_Units',
      'Variance_Pct',
      'Unit_Price',
      'Unit_Cost',
      'Total_Sales_INR',
      'Gross_Profit_INR',
      'Stock_On_Hand',
      'Months_Of_Stock',
      'Stock_Status',
    ];

    const rows = records.map((r) => [
      r.id,
      r.date,
      `"${r.region}"`,
      `"${r.district}"`,
      `"${r.facilityTier}"`,
      `"${r.productCategory}"`,
      `"${r.productName}"`,
      r.actualConsumption,
      r.forecastedDemand,
      r.forecastVariance,
      r.forecastVariancePct,
      r.unitPrice,
      r.unitCost,
      r.totalSales,
      r.grossProfit,
      r.stockOnHand,
      r.stockCoverMonths,
      `"${r.stockStatus}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `contraceptive_demand_forecast_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const executiveBrief = `EXECUTIVE SUPPLY CHAIN BRIEF: CONTRACEPTIVE DEMAND & REPLENISHMENT
Date: ${new Date().toISOString().slice(0, 10)}
Scope: ${records.length} commodity line items across 6 health regions

KEY PERFORMANCE INDICATORS:
- Total Actual Demand: ${Math.round(metrics.totalActualDemand).toLocaleString('en-IN')} units
- Total Forecasted Demand: ${Math.round(metrics.totalForecastedDemand).toLocaleString('en-IN')} units
- Forecast Variance: ${metrics.forecastVariance >= 0 ? `+${Math.round(metrics.forecastVariance).toLocaleString('en-IN')}` : Math.round(metrics.forecastVariance).toLocaleString('en-IN')} (${metrics.forecastVariancePct.toFixed(1)}%)
- Forecast Accuracy (1 - WAPE): ${metrics.forecastAccuracyPct.toFixed(1)}% (WAPE: ${metrics.wapePct.toFixed(1)}%)
- Total Procurement Sales Value: ₹${(metrics.totalSales / 100000).toFixed(1)} Lakh (₹${Math.round(metrics.totalSales).toLocaleString('en-IN')})
- Net Program Margin / Cost Recovery: ₹${(metrics.grossProfit / 100000).toFixed(1)} Lakh (${metrics.profitMarginPct.toFixed(1)}%)
- Average Stock Cover: ${metrics.averageMOS.toFixed(1)} Months of Stock (Target: 3.0 - 6.0 MOS)
- Stockout Vulnerability Rate: ${metrics.stockoutRiskRate.toFixed(1)}%
- Public Health Impact: ${(metrics.totalCYP / 1000).toFixed(0)}k Couple Years of Protection (CYP)`;

  const copyBrief = () => {
    navigator.clipboard.writeText(executiveBrief);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-6 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-md bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-5 h-5 text-teal-400" />
          <h3 className="text-lg font-bold text-white font-display">
            Export Health Supply Chain Intelligence Report
          </h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Generate production-ready logistics data exports, Power BI compatible CSV feeds, or executive narrative briefs.
        </p>

        {/* Metrics Summary Strip */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-lg border border-slate-800 mb-4 text-xs font-mono">
          <div>
            <div className="text-slate-400 text-[10px]">TOTAL DISPENSED</div>
            <div className="text-white font-bold">{Math.round(metrics.totalActualDemand).toLocaleString('en-IN')} units</div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px]">FORECAST ACCURACY</div>
            <div className="text-teal-300 font-bold">{metrics.forecastAccuracyPct.toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px]">PROGRAM VALUE</div>
            <div className="text-emerald-400 font-bold">₹{(metrics.totalSales / 100000).toFixed(1)} Lakh</div>
          </div>
        </div>

        {/* Executive Text Preview */}
        <div className="bg-slate-950 rounded-lg p-3.5 border border-slate-800 mb-5 font-mono text-[11px] text-slate-300 max-h-48 overflow-y-auto leading-relaxed">
          <pre className="whitespace-pre-wrap">{executiveBrief}</pre>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={copyBrief}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-md transition-colors font-medium"
          >
            {copiedSummary ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5 text-teal-400" />
                <span>Copy Text Brief</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-md transition-colors font-medium"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Print Brief</span>
            </button>

            <button
              onClick={exportCsv}
              className="flex items-center gap-2 px-4 py-2 bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs rounded-md transition-colors font-semibold shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV ({records.length} Records)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
