import React from 'react';
import { Activity, Download, RefreshCw, Layers } from 'lucide-react';

export type ActiveTab = 
  | 'dashboard'
  | 'd3_heatmap'
  | 'dataset'
  | 'dax'
  | 'kpi_builder'
  | 'forecast_whatif'
  | 'datagrid';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onResetFilters: () => void;
  onOpenExportModal: () => void;
  totalRecords: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onResetFilters,
  onOpenExportModal,
  totalRecords,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-40 backdrop-blur-md">
      {/* Strict 3-Zone Top Bar Contract */}
      <div className="max-w-[1720px] mx-auto px-4 lg:px-6 h-14 flex items-center justify-between gap-6">
        
        {/* Zone 1: Brand wordmark (single element, clean typography) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Activity className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold tracking-tight text-white font-display whitespace-nowrap">
              Contraceptive Demand Studio
            </span>
            <span className="hidden xl:inline text-xs text-slate-400 font-sans">
              National Family Planning Supply Chain Analytics (India)
            </span>
          </div>
        </div>

        {/* Zone 2: Single-line navigation links/tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1 scrollbar-none text-xs md:text-sm font-medium">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-teal-500/15 text-teal-300 font-semibold border border-teal-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Executive Dashboard
          </button>

          <button
            onClick={() => onTabChange('d3_heatmap')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'd3_heatmap'
                ? 'bg-teal-500/15 text-teal-300 font-semibold border border-teal-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            D3 Heatmap
          </button>

          <button
            onClick={() => onTabChange('dataset')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'dataset'
                ? 'bg-teal-500/15 text-teal-300 font-semibold border border-teal-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            1. Data & Columns
          </button>

          <button
            onClick={() => onTabChange('dax')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'dax'
                ? 'bg-teal-500/15 text-teal-300 font-semibold border border-teal-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            2. DAX Measures
          </button>

          <button
            onClick={() => onTabChange('kpi_builder')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'kpi_builder'
                ? 'bg-teal-500/15 text-teal-300 font-semibold border border-teal-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            3. KPI Cards Studio
          </button>

          <button
            onClick={() => onTabChange('forecast_whatif')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'forecast_whatif'
                ? 'bg-teal-500/15 text-teal-300 font-semibold border border-teal-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            6-7. Forecast & What-If
          </button>

          <button
            onClick={() => onTabChange('datagrid')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'datagrid'
                ? 'bg-teal-500/15 text-teal-300 font-semibold border border-teal-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            8. Data Matrix & Sorter
          </button>
        </nav>

        {/* Zone 3: Primary action button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onResetFilters}
            title="Reset active slicers"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-teal-400 hover:bg-teal-300 rounded-md transition-colors shadow-sm whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>

      </div>
    </header>
  );
};
