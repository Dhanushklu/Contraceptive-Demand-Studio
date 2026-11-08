import React from 'react';
import { FilterState, HealthRegion, ProductCategory, StockStatus, FacilityTier } from '../types/supplyChain';
import { Filter, X, Calendar, MapPin, Package, ShieldAlert, DollarSign } from 'lucide-react';

interface SlicerBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  allRegions: HealthRegion[];
  allCategories: ProductCategory[];
  allStockStatuses: StockStatus[];
  allTiers: FacilityTier[];
  availableDateRange: [string, string];
  activeFilterCount: number;
}

export const SlicerBar: React.FC<SlicerBarProps> = ({
  filters,
  onFilterChange,
  allRegions,
  allCategories,
  allStockStatuses,
  allTiers,
  availableDateRange,
  activeFilterCount,
}) => {
  const toggleRegion = (region: HealthRegion) => {
    const exists = filters.selectedRegions.includes(region);
    const updated = exists
      ? filters.selectedRegions.filter((r) => r !== region)
      : [...filters.selectedRegions, region];
    onFilterChange({ ...filters, selectedRegions: updated });
  };

  const toggleCategory = (cat: ProductCategory) => {
    const exists = filters.selectedCategories.includes(cat);
    const updated = exists
      ? filters.selectedCategories.filter((c) => c !== cat)
      : [...filters.selectedCategories, cat];
    onFilterChange({ ...filters, selectedCategories: updated });
  };

  const setStockStatus = (status: StockStatus | 'ALL') => {
    if (status === 'ALL') {
      onFilterChange({ ...filters, selectedStockStatuses: [] });
    } else {
      const exists = filters.selectedStockStatuses.includes(status);
      const updated = exists
        ? filters.selectedStockStatuses.filter((s) => s !== status)
        : [status];
      onFilterChange({ ...filters, selectedStockStatuses: updated });
    }
  };

  const setDatePreset = (preset: 'ALL' | '2025' | '2026' | 'LAST6') => {
    if (preset === 'ALL') {
      onFilterChange({ ...filters, dateRange: availableDateRange });
    } else if (preset === '2025') {
      onFilterChange({ ...filters, dateRange: ['2025-01', '2025-12'] });
    } else if (preset === '2026') {
      onFilterChange({ ...filters, dateRange: ['2026-01', '2026-12'] });
    } else if (preset === 'LAST6') {
      onFilterChange({ ...filters, dateRange: ['2026-07', '2026-12'] });
    }
  };

  const clearAllFilters = () => {
    onFilterChange({
      ...filters,
      selectedRegions: [],
      selectedCategories: [],
      selectedProducts: [],
      selectedTiers: [],
      selectedStockStatuses: [],
      dateRange: availableDateRange,
      searchQuery: '',
    });
  };

  return (
    <div className="bg-slate-900/90 border-b border-slate-800 py-2.5 px-4 lg:px-6">
      <div className="max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Left: Slicer Groups */}
        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
          
          {/* Slicer Indicator */}
          <div className="flex items-center gap-1.5 text-slate-400 font-medium shrink-0 pr-1">
            <Filter className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Slicers:</span>
            {activeFilterCount > 0 && (
              <span className="text-[11px] font-mono px-1.5 py-0.2 bg-teal-500/20 text-teal-300 rounded font-semibold">
                {activeFilterCount} Active
              </span>
            )}
          </div>

          {/* Region Slicer Dropdown / Buttons */}
          <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-md border border-slate-800">
            <MapPin className="w-3 h-3 text-slate-400 ml-1" />
            <span className="text-slate-400 text-[11px] font-medium mr-1">Region:</span>
            <button
              onClick={() => onFilterChange({ ...filters, selectedRegions: [] })}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                filters.selectedRegions.length === 0
                  ? 'bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All (6)
            </button>
            {allRegions.map((reg) => {
              const isSelected = filters.selectedRegions.includes(reg);
              const shortName = reg.replace(' Region', '').replace(' Coastal', '').replace(' Plateau', '');
              return (
                <button
                  key={reg}
                  onClick={() => toggleRegion(reg)}
                  className={`px-2 py-0.5 rounded text-[11px] transition-colors whitespace-nowrap ${
                    isSelected
                      ? 'bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={reg}
                >
                  {shortName}
                </button>
              );
            })}
          </div>

          {/* Method / Product Slicer */}
          <div className="hidden md:flex items-center gap-1 bg-slate-950/70 p-1 rounded-md border border-slate-800">
            <Package className="w-3 h-3 text-slate-400 ml-1" />
            <span className="text-slate-400 text-[11px] font-medium mr-1">Method:</span>
            <button
              onClick={() => onFilterChange({ ...filters, selectedCategories: [] })}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                filters.selectedCategories.length === 0
                  ? 'bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            {allCategories.map((cat) => {
              const isSelected = filters.selectedCategories.includes(cat);
              const label = cat === 'Emergency Contraception' ? 'ECP' : cat === 'Barrier / Condoms' ? 'Condoms' : cat;
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-2 py-0.5 rounded text-[11px] transition-colors whitespace-nowrap ${
                    isSelected
                      ? 'bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Date Range Presets */}
          <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-md border border-slate-800">
            <Calendar className="w-3 h-3 text-slate-400 ml-1" />
            <button
              onClick={() => setDatePreset('ALL')}
              className={`px-2 py-0.5 rounded text-[11px] ${
                filters.dateRange[0] === '2025-01' && filters.dateRange[1] === '2026-12'
                  ? 'bg-slate-800 text-teal-300 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              24M
            </button>
            <button
              onClick={() => setDatePreset('2025')}
              className={`px-2 py-0.5 rounded text-[11px] ${
                filters.dateRange[0] === '2025-01' && filters.dateRange[1] === '2025-12'
                  ? 'bg-slate-800 text-teal-300 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2025
            </button>
            <button
              onClick={() => setDatePreset('2026')}
              className={`px-2 py-0.5 rounded text-[11px] ${
                filters.dateRange[0] === '2026-01' && filters.dateRange[1] === '2026-12'
                  ? 'bg-slate-800 text-teal-300 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2026
            </button>
            <button
              onClick={() => setDatePreset('LAST6')}
              className={`px-2 py-0.5 rounded text-[11px] ${
                filters.dateRange[0] === '2026-07' && filters.dateRange[1] === '2026-12'
                  ? 'bg-slate-800 text-teal-300 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Recent 6M
            </button>
          </div>

          {/* Stock Risk Filter */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-950/70 p-1 rounded-md border border-slate-800">
            <ShieldAlert className="w-3 h-3 text-rose-400 ml-1" />
            <span className="text-slate-400 text-[11px] mr-1">Risk:</span>
            <button
              onClick={() => setStockStatus('ALL')}
              className={`px-1.5 py-0.5 rounded text-[11px] ${
                filters.selectedStockStatuses.length === 0 ? 'bg-slate-800 text-white' : 'text-slate-400'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStockStatus('Stockout Critical')}
              className={`px-1.5 py-0.5 rounded text-[11px] transition-colors ${
                filters.selectedStockStatuses.includes('Stockout Critical')
                  ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/40'
                  : 'text-rose-400/80 hover:text-rose-300'
              }`}
              title="Stockout Critical (< 2.0 Months of Stock)"
            >
              Stockout (&lt;2 MOS)
            </button>
            <button
              onClick={() => setStockStatus('Overstocked')}
              className={`px-1.5 py-0.5 rounded text-[11px] transition-colors ${
                filters.selectedStockStatuses.includes('Overstocked')
                  ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
                  : 'text-amber-400/80 hover:text-amber-300'
              }`}
              title="Overstocked (> 6.0 Months of Stock)"
            >
              Overstocked (&gt;6 MOS)
            </button>
          </div>

        </div>

        {/* Right: Metric Mode Toggle & Clear All */}
        <div className="flex items-center gap-2">
          
          {/* Metric View Mode */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-md border border-slate-800">
            <button
              onClick={() => onFilterChange({ ...filters, metricMode: 'units' })}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                filters.metricMode === 'units'
                  ? 'bg-slate-800 text-white shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Units
            </button>
            <button
              onClick={() => onFilterChange({ ...filters, metricMode: 'sales' })}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                filters.metricMode === 'sales'
                  ? 'bg-slate-800 text-emerald-300 shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sales (₹)
            </button>
            <button
              onClick={() => onFilterChange({ ...filters, metricMode: 'profit' })}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                filters.metricMode === 'profit'
                  ? 'bg-slate-800 text-teal-300 shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Profits (₹)
            </button>
            <button
              onClick={() => onFilterChange({ ...filters, metricMode: 'variance' })}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                filters.metricMode === 'variance'
                  ? 'bg-slate-800 text-amber-300 shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Variance
            </button>
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 px-2 py-1 text-[11px] text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 rounded transition-colors"
              title="Clear all active slicers"
            >
              <X className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}

        </div>

      </div>
    </div>
  );
};
