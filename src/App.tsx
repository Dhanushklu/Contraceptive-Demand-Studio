import React, { useState, useMemo, useEffect } from 'react';
import { SupplyRecord, FilterState, HealthRegion, ProductCategory, StockStatus, FacilityTier } from './types/supplyChain';
import { REGIONS, CONTRACEPTIVE_PRODUCTS, FACILITY_TIERS } from './data/benchmarkDataset';
import { evaluateDataset } from './services/daxEngine';
import { Header, ActiveTab } from './components/Header';
import { SlicerBar } from './components/SlicerBar';
import { KpiCardsGrid } from './components/KpiCardsGrid';
import { MonthlyDemandChart } from './components/Charts/MonthlyDemandChart';
import { RegionalPerformanceChart } from './components/Charts/RegionalPerformanceChart';
import { MethodMixChart } from './components/Charts/MethodMixChart';
import { StockCoverMatrix } from './components/Charts/StockCoverMatrix';
import { SeasonalHeatmapD3 } from './components/Charts/SeasonalHeatmapD3';
import { DataMatrixTable } from './components/DataGrid/DataMatrixTable';
import { DatasetVerificationView } from './components/Views/DatasetVerificationView';
import { DaxMeasuresStudio } from './components/Views/DaxMeasuresStudio';
import { KpiCardBuilderView } from './components/Views/KpiCardBuilderView';
import { ForecastVariationView } from './components/Views/ForecastVariationView';
import { ExportModal } from './components/Views/ExportModal';
import TeamSection from './components/TeamSection';
import { Flame, TrendingUp } from 'lucide-react';

// On a laptop (localhost) the API runs on port 3001.
// Once the site is online, the API lives on the same address, so no prefix is needed.
const IS_LOCAL = window.location.hostname === 'localhost';
const API_BASE = IS_LOCAL ? 'http://localhost:3001' : '';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Records come from the PostgreSQL database through the API
  const [baselineRecords, setBaselineRecords] = useState<SupplyRecord[]>([]);
  const [records, setRecords] = useState<SupplyRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [trendViewType, setTrendViewType] = useState<'heatmap' | 'line'>('heatmap');

  // Load all records from the backend once, when the app opens
  useEffect(() => {
    let cancelled = false;

    fetch(`${API_BASE}/api/records`)
      .then((res) => {
        if (!res.ok) throw new Error(`API error ${res.status}`);
        return res.json();
      })
      .then((data: SupplyRecord[]) => {
        if (cancelled) return;
        setBaselineRecords(data);
        setRecords(data);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setLoadError(err.message);
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Available metadata for slicers
  const allRegions: HealthRegion[] = useMemo(() => REGIONS.map((r) => r.region), []);
  const allCategories: ProductCategory[] = useMemo(
    () => Array.from(new Set(CONTRACEPTIVE_PRODUCTS.map((p) => p.category))),
    []
  );
  const allStockStatuses: StockStatus[] = ['Stockout Critical', 'Understocked', 'Adequate / Optimal', 'Overstocked'];
  const allTiers: FacilityTier[] = FACILITY_TIERS;
  const availableDateRange: [string, string] = ['2025-01', '2026-12'];

  // Central Filter State
  const [filters, setFilters] = useState<FilterState>({
    selectedRegions: [],
    selectedCategories: [],
    selectedProducts: [],
    selectedTiers: [],
    selectedStockStatuses: [],
    dateRange: ['2025-01', '2026-12'],
    searchQuery: '',
    metricMode: 'units',
    sortColumn: 'totalSales',
    sortDirection: 'desc',
  });

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.selectedRegions.length > 0) count++;
    if (filters.selectedCategories.length > 0) count++;
    if (filters.selectedStockStatuses.length > 0) count++;
    if (filters.dateRange[0] !== '2025-01' || filters.dateRange[1] !== '2026-12') count++;
    if (filters.searchQuery.trim().length > 0) count++;
    return count;
  }, [filters]);

  // Dynamic Filtering Logic
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Region filter
      if (filters.selectedRegions.length > 0 && !filters.selectedRegions.includes(r.region)) {
        return false;
      }
      // Category filter
      if (filters.selectedCategories.length > 0 && !filters.selectedCategories.includes(r.productCategory)) {
        return false;
      }
      // Stock Status filter
      if (filters.selectedStockStatuses.length > 0 && !filters.selectedStockStatuses.includes(r.stockStatus)) {
        return false;
      }
      // Date range filter
      if (r.date < filters.dateRange[0] || r.date > filters.dateRange[1]) {
        return false;
      }
      // Search query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matches =
          r.region.toLowerCase().includes(q) ||
          r.district.toLowerCase().includes(q) ||
          r.productName.toLowerCase().includes(q) ||
          r.productCategory.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [records, filters]);

  // Live evaluated DAX metrics
  const evaluatedMetrics = useMemo(() => {
    return evaluateDataset(filteredRecords);
  }, [filteredRecords]);

  // Slicer handlers
  const handleSelectRegionFromChart = (region: HealthRegion) => {
    if (filters.selectedRegions.includes(region)) {
      setFilters({
        ...filters,
        selectedRegions: filters.selectedRegions.filter((r) => r !== region),
      });
    } else {
      setFilters({
        ...filters,
        selectedRegions: [region],
      });
    }
  };

  const handleSelectCategoryFromChart = (category: ProductCategory) => {
    if (filters.selectedCategories.includes(category)) {
      setFilters({
        ...filters,
        selectedCategories: filters.selectedCategories.filter((c) => c !== category),
      });
    } else {
      setFilters({
        ...filters,
        selectedCategories: [category],
      });
    }
  };

  const handleFilterByStockStatus = (status: string) => {
    setFilters({
      ...filters,
      selectedStockStatuses: [status as StockStatus],
    });
  };

  const handleResetFilters = () => {
    setFilters({
      selectedRegions: [],
      selectedCategories: [],
      selectedProducts: [],
      selectedTiers: [],
      selectedStockStatuses: [],
      dateRange: ['2025-01', '2026-12'],
      searchQuery: '',
      metricMode: 'units',
      sortColumn: 'totalSales',
      sortDirection: 'desc',
    });
  };

  // Preset Scenario Loader (works on the records loaded from the database)
  const handleLoadPreset = (presetKey: 'baseline' | 'outreach' | 'crisis') => {
    if (presetKey === 'baseline') {
      setRecords(baselineRecords);
    } else if (presetKey === 'outreach') {
      // High Long-Acting Reversible Contraceptive uptake (Implants & Sayana Press)
      const adjusted = baselineRecords.map((r) => {
        if (r.productCategory === 'Implants' || r.productName.includes('Sayana Press')) {
          const newActual = Math.round(r.actualConsumption * 1.45);
          const variance = newActual - r.forecastedDemand;
          const variancePct = (variance / r.forecastedDemand) * 100;
          return {
            ...r,
            actualConsumption: newActual,
            forecastVariance: variance,
            forecastVariancePct: Number(variancePct.toFixed(2)),
            totalSales: Number((newActual * r.unitPrice).toFixed(2)),
            totalCost: Number((newActual * r.unitCost).toFixed(2)),
            grossProfit: Number(((newActual * r.unitPrice) - (newActual * r.unitCost)).toFixed(2)),
          };
        }
        return r;
      });
      setRecords(adjusted);
    } else if (presetKey === 'crisis') {
      // Disruption in North-Eastern & Central Zones -> stockouts & high lead time
      const adjusted = baselineRecords.map((r) => {
        if (r.region === 'North-Eastern Zone (Assam & Seven Sisters)' || r.region === 'Central Zone (MP & Chhattisgarh)') {
          const newStock = Math.round(r.stockOnHand * 0.35);
          const newMos = Number((newStock / Math.max(r.actualConsumption, 1)).toFixed(2));
          let stockStatus: StockStatus = 'Adequate / Optimal';
          if (newMos < 2.0) stockStatus = 'Stockout Critical';
          else if (newMos < 3.0) stockStatus = 'Understocked';
          return {
            ...r,
            stockOnHand: newStock,
            stockCoverMonths: newMos,
            stockStatus,
            leadTimeDays: r.leadTimeDays + 35,
          };
        }
        return r;
      });
      setRecords(adjusted);
    }
  };

  // Loading screen while the API responds
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-sans">
        <div className="text-sm text-slate-300">Loading data from the Nova database...</div>
      </div>
    );
  }

  // Error screen if the backend or database is not reachable
  if (loadError) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-sans p-6">
        <div className="max-w-md text-center space-y-3">
          <div className="text-lg font-bold text-red-400">Could not load data</div>
          <div className="text-sm text-slate-300">
            {IS_LOCAL ? (
              <>
                {loadError}. Make sure the backend is running with <code>npm run server</code> and the
                database is seeded with <code>npm run seed</code>.
              </>
            ) : (
              <>
                {loadError}. The server may be waking up. Please wait a few seconds and try again.
              </>
            )}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-md bg-teal-500/20 border border-teal-500/40 text-teal-300 text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Bar Contract (Wordmark Brand, 5 Nav tabs, Primary Action) */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onResetFilters={handleResetFilters}
        onOpenExportModal={() => setIsExportOpen(true)}
        totalRecords={filteredRecords.length}
      />

      {/* Interactive Power BI Style Slicer Bar */}
      <SlicerBar
        filters={filters}
        onFilterChange={setFilters}
        allRegions={allRegions}
        allCategories={allCategories}
        allStockStatuses={allStockStatuses}
        allTiers={allTiers}
        availableDateRange={availableDateRange}
        activeFilterCount={activeFilterCount}
      />

      {/* Main Workspace (Compact, high information density, designed for less scroll) */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-3 sm:p-4 lg:p-5 space-y-4">
        
        {/* Dedicated D3 Heatmap View */}
        {activeTab === 'd3_heatmap' && (
          <div className="space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-teal-400">
                  D3.js Spatial & Seasonal Analytics
                </div>
                <h2 className="text-lg font-bold text-white font-display">
                  Regional Contraceptive Demand Intensity Matrix
                </h2>
                <p className="text-xs text-slate-400">
                  Interactive D3 heatmap tracking temporal demand variations across Indian health zones to synchronize warehouse replenishment with peak family planning seasons.
                </p>
              </div>
            </div>

            <SeasonalHeatmapD3
              records={filteredRecords}
              selectedRegions={filters.selectedRegions}
              onSelectRegion={handleSelectRegionFromChart}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
                <div className="text-xs text-teal-400 font-semibold mb-1">Q3 Seasonal Spike (July Peak)</div>
                <div className="text-xs text-slate-300 leading-relaxed">
                  World Population Day (July 11) drives massive state-wide mobilization campaigns, elevating Antara and Chhaya uptake by +18% to +26% over baseline.
                </div>
              </div>
              <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
                <div className="text-xs text-purple-400 font-semibold mb-1">Post-Monsoon Window (Oct - Nov)</div>
                <div className="text-xs text-slate-300 leading-relaxed">
                  Mission Parivar Vikas intensifies outreach in central and northern high-TFR districts, creating secondary procurement demand peaks before winter.
                </div>
              </div>
              <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
                <div className="text-xs text-blue-400 font-semibold mb-1">Monsoon Logistics Buffer (June - Aug)</div>
                <div className="text-xs text-slate-300 leading-relaxed">
                  Rural clinic footfall dips slightly during peak sowing season, but road disruptions necessitate 4.5+ MOS safety stock in remote North-Eastern and Eastern districts.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Load Dataset & Verify Columns */}
        {activeTab === 'dataset' && (
          <DatasetVerificationView
            records={records}
            onLoadPreset={handleLoadPreset}
            onCustomDatasetUpload={(newRecs) => setRecords(newRecs)}
            onProceedToDax={() => setActiveTab('dax')}
          />
        )}

        {/* Tab 2: DAX KPI Measures Studio */}
        {activeTab === 'dax' && (
          <DaxMeasuresStudio
            records={filteredRecords}
            onProceedToKpiCards={() => setActiveTab('kpi_builder')}
          />
        )}

        {/* Tab 3: KPI Cards Studio */}
        {activeTab === 'kpi_builder' && (
          <KpiCardBuilderView
            records={filteredRecords}
            onProceedToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {/* Tab 6 & 7: Forecast Metrics & Variation Analysis / What-If */}
        {activeTab === 'forecast_whatif' && (
          <ForecastVariationView records={filteredRecords} />
        )}

        {/* Tab 8: Dedicated Data Grid & Sorter */}
        {activeTab === 'datagrid' && (
          <div className="space-y-3">
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-teal-400">Step 8 of 8 · Data Matrix & Sorting</div>
                <h2 className="text-lg font-bold text-white font-display">
                  Commodity Supply Ledger & Conditional Formatting
                </h2>
                <p className="text-xs text-slate-400">
                  1-click sort on Region, Sales (₹), Profits (₹), Actual Demand, Variance %, or Months of Stock (MOS).
                </p>
              </div>
            </div>
            <DataMatrixTable
              records={filteredRecords}
              onExportCsv={() => setIsExportOpen(true)}
            />
          </div>
        )}

        {/* Primary Tab: Executive Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            
            {/* 1. High-Impact KPI Cards Strip (Step 3) */}
            <KpiCardsGrid
              metrics={evaluatedMetrics}
              selectedMetricMode={filters.metricMode}
              onCardClick={(mode) => setFilters({ ...filters, metricMode: mode })}
            />

            {/* 2. Top Analytics Split: Monthly Demand Trend / D3 Heatmap vs. Regional Performance (Step 6) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* Monthly Demand Trend / D3 Heatmap (7 cols) */}
              <div className="lg:col-span-7 flex flex-col space-y-2">
                <div className="flex items-center justify-between px-0.5">
                  <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-md border border-slate-800 text-xs">
                    <button
                      onClick={() => setTrendViewType('heatmap')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                        trendViewType === 'heatmap'
                          ? 'bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/40 shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Flame className="w-3.5 h-3.5 text-teal-400" />
                      <span>D3 Seasonal Heatmap</span>
                    </button>
                    <button
                      onClick={() => setTrendViewType('line')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                        trendViewType === 'line'
                          ? 'bg-slate-800 text-white font-semibold shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                      <span>Monthly Trend Line</span>
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                    {trendViewType === 'heatmap' ? 'Region × Month Demand Intensity' : 'Actual vs Baseline Forecast'}
                  </span>
                </div>

                {trendViewType === 'heatmap' ? (
                  <SeasonalHeatmapD3
                    records={filteredRecords}
                    selectedRegions={filters.selectedRegions}
                    onSelectRegion={handleSelectRegionFromChart}
                  />
                ) : (
                  <MonthlyDemandChart
                    records={filteredRecords}
                    metricMode={filters.metricMode}
                  />
                )}
              </div>

              {/* Regional Performance & Sorter Chart (5 cols) */}
              <div className="lg:col-span-5">
                <RegionalPerformanceChart
                  records={filteredRecords}
                  selectedRegions={filters.selectedRegions}
                  onSelectRegion={handleSelectRegionFromChart}
                />
              </div>

            </div>

            {/* 3. Bottom Analytics Split: Contraceptive Method Mix & Stock Cover Corridor */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* Method Mix & CYP Impact (6 cols) */}
              <div className="lg:col-span-6">
                <MethodMixChart
                  records={filteredRecords}
                  selectedCategories={filters.selectedCategories}
                  onSelectCategory={handleSelectCategoryFromChart}
                />
              </div>

              {/* Stock Cover Corridor MOS Matrix (6 cols) */}
              <div className="lg:col-span-6">
                <StockCoverMatrix
                  records={filteredRecords}
                  onFilterByStatus={handleFilterByStockStatus}
                />
              </div>

            </div>

            {/* 4. Compact Interactive Data Matrix with 1-Click Sorting (Step 8) */}
            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <span>Supply Chain Commodity Data Matrix</span>
                  <span className="text-[11px] text-teal-400 font-mono font-normal">
                    ({filteredRecords.length} lines active)
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Click column headers to sort by Region, Profits, Sales, Demand or MOS
                </span>
              </div>

              <DataMatrixTable
                records={filteredRecords}
                onExportCsv={() => setIsExportOpen(true)}
              />
            </div>

          </div>
        )}

      </main>

      {/* Team section: member cards, detail panel, supervisor/department/university cards and footer */}
      <TeamSection />

      {/* Export Report & CSV Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        records={filteredRecords}
        metrics={evaluatedMetrics}
      />

    </div>
  );
}