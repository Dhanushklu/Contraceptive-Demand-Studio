import React, { useState } from 'react';
import { SupplyRecord, SimulationParameters } from '../../types/supplyChain';
import { evaluateDataset } from '../../services/daxEngine';
import { Sliders, AlertOctagon, TrendingUp, ShieldAlert, Sparkles, RefreshCw, BarChart2, DollarSign } from 'lucide-react';

interface ForecastVariationViewProps {
  records: SupplyRecord[];
}

export const ForecastVariationView: React.FC<ForecastVariationViewProps> = ({ records }) => {
  const [params, setParams] = useState<SimulationParameters>({
    demandSurgePercent: 15,
    leadTimeDelayDays: 14,
    safetyStockBufferMonths: 3.5,
    priceAdjustmentPercent: 0,
  });

  const baseMetrics = evaluateDataset(records);

  // Compute Simulated Metrics based on sliders
  const demandMultiplier = 1 + params.demandSurgePercent / 100;
  const simulatedActualDemand = baseMetrics.totalActualDemand * demandMultiplier;
  const simulatedVariance = simulatedActualDemand - baseMetrics.totalForecastedDemand;
  const simulatedVariancePct = baseMetrics.totalForecastedDemand > 0 ? (simulatedVariance / baseMetrics.totalForecastedDemand) * 100 : 0;

  // Stockout simulation: higher demand + longer lead time reduces effective MOS
  const leadTimeFactor = 1 + params.leadTimeDelayDays / 30; // each 30 days reduces buffer
  const simulatedAvgMOS = (baseMetrics.stockOnHand / (simulatedActualDemand / 24)) / leadTimeFactor;
  
  // Stockout risk calculation
  const simulatedStockoutRiskRate = Math.min(
    100,
    Math.max(2, baseMetrics.stockoutRiskRate * (demandMultiplier * 1.3) * (1 + params.leadTimeDelayDays / 45))
  );

  // Emergency procurement cost needed to cover deficit in INR (₹)
  const emergencyUnitsNeeded = Math.max(0, simulatedActualDemand - baseMetrics.stockOnHand * 0.4);
  const emergencyProcurementCost = emergencyUnitsNeeded * 68; // average blended unit cost with rush freight in INR (₹)

  // Unmet need
  const couplesAtRisk = Math.round((emergencyUnitsNeeded * 0.25) * 1.2);

  // Tracking signal calculation (Sum of errors / MAD)
  const mad = baseMetrics.totalActualDemand > 0 ? (baseMetrics.totalActualDemand * (baseMetrics.wapePct / 100)) / records.length : 1;
  const trackingSignal = mad > 0 ? (baseMetrics.forecastVariance / records.length) / mad : 0;
  const biasLabel = trackingSignal > 1.5 
    ? 'Significant Under-Forecasting (Demand exceeds supplies -> Severe Stockout Hazard)'
    : trackingSignal < -1.5 
    ? 'Significant Over-Forecasting (Supplies exceed demand -> Expiration & Wastage Hazard)'
    : 'Balanced Forecast (Within +/- 1.5 Tracking Signal Corridor)';

  const resetSimulation = () => {
    setParams({
      demandSurgePercent: 0,
      leadTimeDelayDays: 0,
      safetyStockBufferMonths: 3.5,
      priceAdjustmentPercent: 0,
    });
  };

  return (
    <div className="space-y-4">
      {/* Step Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-5">
        <div className="text-xs font-semibold text-teal-400 mb-1">
          Step 6 & 7 of 8 · Statistical Forecast Metrics & Scenario Simulation
        </div>
        <h2 className="text-xl font-bold text-white font-display">
          Forecast Metrics, Variance Analysis & Supply Chain Stress Testing
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Evaluate WAPE, MAPE, and bias tracking signals. Simulate demand surges, supply disruptions, and lead-time shocks to quantify stockout vulnerability and emergency funding requirements.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* WAPE */}
        <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
          <div className="text-xs text-slate-400 flex justify-between">
            <span>WAPE Error</span>
            <span className="font-mono text-purple-400">Target &lt; 15%</span>
          </div>
          <div className="text-2xl font-bold font-mono text-purple-300 mt-1 tabular-nums">
            {baseMetrics.wapePct.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Weighted Absolute Percentage Error</div>
        </div>

        {/* Forecast Accuracy */}
        <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
          <div className="text-xs text-slate-400 flex justify-between">
            <span>Forecast Accuracy</span>
            <span className="font-mono text-emerald-400">1 - WAPE</span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-300 mt-1 tabular-nums">
            {baseMetrics.forecastAccuracyPct.toFixed(1)}%
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">Meets National Procurement Target</div>
        </div>

        {/* Tracking Signal */}
        <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
          <div className="text-xs text-slate-400 flex justify-between">
            <span>Tracking Signal (Bias)</span>
            <span className="font-mono text-slate-400">Safe: ±4.0</span>
          </div>
          <div className={`text-2xl font-bold font-mono mt-1 tabular-nums ${Math.abs(trackingSignal) > 2 ? 'text-amber-400' : 'text-teal-300'}`}>
            {trackingSignal >= 0 ? `+${trackingSignal.toFixed(2)}` : trackingSignal.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {trackingSignal > 0 ? 'Slight Under-forecast' : 'Slight Over-forecast'}
          </div>
        </div>

        {/* Total Variance */}
        <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
          <div className="text-xs text-slate-400 flex justify-between">
            <span>Cumulative Variance</span>
            <span className="font-mono text-slate-400">Actual vs Fcst</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
            {baseMetrics.forecastVariance >= 0 ? `+${Math.round(baseMetrics.forecastVariance).toLocaleString()}` : Math.round(baseMetrics.forecastVariance).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {baseMetrics.forecastVariancePct >= 0 ? `+${baseMetrics.forecastVariancePct.toFixed(1)}%` : `${baseMetrics.forecastVariancePct.toFixed(1)}%`} net divergence
          </div>
        </div>
      </div>

      {/* Bias Diagnosis Callout */}
      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-semibold text-slate-200">Statistical Bias Diagnostic: </span>
          <span className="text-slate-400">{biasLabel}</span>
        </div>
      </div>

      {/* Interactive Scenario Simulator Grid */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-bold text-white font-display">
              Supply Chain Stress Testing & What-If Simulator
            </h3>
          </div>

          <button
            onClick={resetSimulation}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Scenario</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Sliders (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Slider 1: Demand Surge */}
            <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800/80">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-slate-200">
                  Demand Surge / Uptake Shock:
                </span>
                <span className="font-mono text-xs font-bold text-teal-400">
                  {params.demandSurgePercent >= 0 ? `+${params.demandSurgePercent}%` : `${params.demandSurgePercent}%`}
                </span>
              </div>
              <input
                type="range"
                min="-25"
                max="50"
                step="5"
                value={params.demandSurgePercent}
                onChange={(e) => setParams({ ...params, demandSurgePercent: Number(e.target.value) })}
                className="w-full accent-teal-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>-25% (Clinic Closures)</span>
                <span>Baseline (0%)</span>
                <span>+50% (National Outreach)</span>
              </div>
            </div>

            {/* Slider 2: Lead Time Delay */}
            <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800/80">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-slate-200">
                  Supplier Delivery Delay:
                </span>
                <span className="font-mono text-xs font-bold text-amber-400">
                  +{params.leadTimeDelayDays} Days
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="7"
                value={params.leadTimeDelayDays}
                onChange={(e) => setParams({ ...params, leadTimeDelayDays: Number(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>0 Days (On-Time)</span>
                <span>+30 Days (Customs Hold)</span>
                <span>+60 Days (Port Disruption)</span>
              </div>
            </div>

            {/* Slider 3: Safety Stock Buffer */}
            <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800/80">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-slate-200">
                  Safety Stock Buffer Target:
                </span>
                <span className="font-mono text-xs font-bold text-blue-400">
                  {params.safetyStockBufferMonths} MOS
                </span>
              </div>
              <input
                type="range"
                min="1.5"
                max="6.0"
                step="0.5"
                value={params.safetyStockBufferMonths}
                onChange={(e) => setParams({ ...params, safetyStockBufferMonths: Number(e.target.value) })}
                className="w-full accent-blue-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>1.5 MOS (Lean)</span>
                <span>3.5 MOS (WHO Standard)</span>
                <span>6.0 MOS (Heavy Buffer)</span>
              </div>
            </div>

          </div>

          {/* Simulation Output Dashboard (6 cols) */}
          <div className="lg:col-span-6 bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-xs text-slate-400 font-medium mb-3 flex items-center justify-between">
                <span>SIMULATED IMPACT OUTCOMES</span>
                <span className="text-teal-400 font-mono text-[11px]">Real-Time Model</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                
                {/* Simulated Stockout Vulnerability */}
                <div className="bg-slate-900 p-3 rounded border border-slate-800">
                  <div className="text-[11px] text-slate-400">Projected Stockout Risk</div>
                  <div className={`text-xl font-bold font-mono mt-0.5 tabular-nums ${simulatedStockoutRiskRate > 20 ? 'text-rose-400' : 'text-amber-400'}`}>
                    {simulatedStockoutRiskRate.toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Baseline: {baseMetrics.stockoutRiskRate.toFixed(1)}%
                  </div>
                </div>

                {/* Simulated Stock Cover */}
                <div className="bg-slate-900 p-3 rounded border border-slate-800">
                  <div className="text-[11px] text-slate-400">Adjusted Months of Stock</div>
                  <div className={`text-xl font-bold font-mono mt-0.5 tabular-nums ${simulatedAvgMOS < 2.5 ? 'text-rose-400' : 'text-white'}`}>
                    {simulatedAvgMOS.toFixed(1)} MOS
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Safe Range: 3.0 - 6.0
                  </div>
                </div>

                {/* Emergency Procurement Needed */}
                <div className="bg-slate-900 p-3 rounded border border-slate-800">
                  <div className="text-[11px] text-slate-400">Emergency Budget Required</div>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5 tabular-nums">
                    ₹{(emergencyProcurementCost / 100000).toFixed(1)} Lakh
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {Math.round(emergencyUnitsNeeded).toLocaleString()} units deficit
                  </div>
                </div>

                {/* Unmet Family Planning Need */}
                <div className="bg-slate-900 p-3 rounded border border-slate-800">
                  <div className="text-[11px] text-slate-400">Unmet Couple Need</div>
                  <div className="text-xl font-bold font-mono text-rose-300 mt-0.5 tabular-nums">
                    {(couplesAtRisk / 1000).toFixed(0)}k couples
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Potential stockout impact
                  </div>
                </div>

              </div>
            </div>

            {/* Tactical Action Recommendation */}
            <div className="p-3 bg-teal-500/10 rounded border border-teal-500/30 text-xs">
              <span className="font-semibold text-teal-300">Procurement Officer Directive: </span>
              <span className="text-slate-300">
                {params.leadTimeDelayDays > 14 || params.demandSurgePercent > 10
                  ? `Trigger expedited purchase order with central medical stores. Reallocate ${Math.round(emergencyUnitsNeeded * 0.4).toLocaleString()} units from Metropolitan Hub to rural Northern Savannah to avert stockouts.`
                  : 'Current replenishment buffer is adequate to sustain health facility demand within normal variance.'}
              </span>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
