import React, { useState, useMemo } from 'react';
import { SupplyRecord } from '../../types/supplyChain';
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Download, FileSpreadsheet, Eye } from 'lucide-react';

interface DataMatrixTableProps {
  records: SupplyRecord[];
  onSelectRecord?: (record: SupplyRecord) => void;
  onExportCsv?: () => void;
}

type SortField = keyof SupplyRecord;

export const DataMatrixTable: React.FC<DataMatrixTableProps> = ({
  records,
  onSelectRecord,
  onExportCsv,
}) => {
  const [sortField, setSortField] = useState<SortField>('totalSales');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [localSearch, setLocalSearch] = useState<string>('');
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default descending for high-value first
    }
  };

  const filteredRecords = useMemo(() => {
    if (!localSearch.trim()) return records;
    const q = localSearch.toLowerCase();
    return records.filter(
      (r) =>
        r.region.toLowerCase().includes(q) ||
        r.district.toLowerCase().includes(q) ||
        r.productName.toLowerCase().includes(q) ||
        r.productCategory.toLowerCase().includes(q) ||
        r.date.includes(q) ||
        r.facilityTier.toLowerCase().includes(q)
    );
  }, [records, localSearch]);

  const sortedRecords = useMemo(() => {
    const list = [...filteredRecords];
    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }

      return 0;
    });
    return list;
  }, [filteredRecords, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.ceil(sortedRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRecords.slice(start, start + pageSize);
  }, [sortedRecords, currentPage, pageSize]);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 group-hover:text-slate-300" />;
    }
    return sortAsc ? (
      <ArrowUp className="w-3 h-3 text-teal-400 font-bold" />
    ) : (
      <ArrowDown className="w-3 h-3 text-teal-400 font-bold" />
    );
  };

  // Direct export CSV
  const downloadCsv = () => {
    if (onExportCsv) {
      onExportCsv();
      return;
    }
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

    const rows = sortedRecords.map((r) => [
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
    link.setAttribute('download', `contraceptive_demand_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-lg overflow-hidden flex flex-col">
      {/* Top Controls */}
      <div className="p-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/40">
        
        {/* Left: Search & Count */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter region, commodity, district..."
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 w-56 sm:w-72"
            />
          </div>

          <span className="text-xs text-slate-400 font-mono">
            Showing <strong className="text-slate-200">{sortedRecords.length}</strong> of {records.length} records
          </span>
        </div>

        {/* Right: Sort quick indicator & Export button */}
        <div className="flex items-center gap-2">
          {/* Quick Sort Shortcut Pills */}
          <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-400 mr-2">
            <span>Quick Sort:</span>
            <button
              onClick={() => handleSort('region')}
              className={`px-1.5 py-0.5 rounded transition-colors ${sortField === 'region' ? 'bg-slate-800 text-teal-300 font-semibold' : 'hover:text-white'}`}
            >
              Region
            </button>
            <button
              onClick={() => handleSort('totalSales')}
              className={`px-1.5 py-0.5 rounded transition-colors ${sortField === 'totalSales' ? 'bg-slate-800 text-emerald-300 font-semibold' : 'hover:text-white'}`}
            >
              Sales
            </button>
            <button
              onClick={() => handleSort('grossProfit')}
              className={`px-1.5 py-0.5 rounded transition-colors ${sortField === 'grossProfit' ? 'bg-slate-800 text-cyan-300 font-semibold' : 'hover:text-white'}`}
            >
              Profits
            </button>
            <button
              onClick={() => handleSort('actualConsumption')}
              className={`px-1.5 py-0.5 rounded transition-colors ${sortField === 'actualConsumption' ? 'bg-slate-800 text-white font-semibold' : 'hover:text-white'}`}
            >
              Demand
            </button>
            <button
              onClick={() => handleSort('stockCoverMonths')}
              className={`px-1.5 py-0.5 rounded transition-colors ${sortField === 'stockCoverMonths' ? 'bg-slate-800 text-blue-300 font-semibold' : 'hover:text-white'}`}
            >
              MOS
            </button>
          </div>

          <button
            onClick={downloadCsv}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded font-medium transition-colors"
            title="Export filtered records as CSV"
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
            <span>CSV</span>
          </button>
        </div>

      </div>

      {/* Table Container (contained height with less scroll) */}
      <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          {/* Header */}
          <thead className="bg-slate-950/90 text-slate-400 sticky top-0 z-10 border-b border-slate-800 select-none">
            <tr>
              <th
                onClick={() => handleSort('region')}
                className="py-2.5 px-3 font-medium cursor-pointer hover:text-white group whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>Region & District</span>
                  {renderSortIcon('region')}
                </div>
              </th>

              <th
                onClick={() => handleSort('productName')}
                className="py-2.5 px-3 font-medium cursor-pointer hover:text-white group whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>Commodity</span>
                  {renderSortIcon('productName')}
                </div>
              </th>

              <th
                onClick={() => handleSort('date')}
                className="py-2.5 px-2 font-medium cursor-pointer hover:text-white group whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>Period</span>
                  {renderSortIcon('date')}
                </div>
              </th>

              <th
                onClick={() => handleSort('actualConsumption')}
                className="py-2.5 px-3 font-medium text-right cursor-pointer hover:text-white group whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Actual</span>
                  {renderSortIcon('actualConsumption')}
                </div>
              </th>

              <th
                onClick={() => handleSort('forecastedDemand')}
                className="py-2.5 px-3 font-medium text-right cursor-pointer hover:text-white group whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Forecast</span>
                  {renderSortIcon('forecastedDemand')}
                </div>
              </th>

              <th
                onClick={() => handleSort('forecastVariancePct')}
                className="py-2.5 px-3 font-medium text-right cursor-pointer hover:text-white group whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Variance %</span>
                  {renderSortIcon('forecastVariancePct')}
                </div>
              </th>

              <th
                onClick={() => handleSort('totalSales')}
                className="py-2.5 px-3 font-medium text-right cursor-pointer hover:text-white group whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Sales (₹)</span>
                  {renderSortIcon('totalSales')}
                </div>
              </th>

              <th
                onClick={() => handleSort('grossProfit')}
                className="py-2.5 px-3 font-medium text-right cursor-pointer hover:text-white group whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Profit (₹)</span>
                  {renderSortIcon('grossProfit')}
                </div>
              </th>

              <th
                onClick={() => handleSort('stockCoverMonths')}
                className="py-2.5 px-3 font-medium text-right cursor-pointer hover:text-white group whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>MOS</span>
                  {renderSortIcon('stockCoverMonths')}
                </div>
              </th>

              <th
                onClick={() => handleSort('stockStatus')}
                className="py-2.5 px-3 font-medium cursor-pointer hover:text-white group whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>Stock Status</span>
                  {renderSortIcon('stockStatus')}
                </div>
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-500 font-sans">
                  No supply chain records found matching the active filter and search terms.
                </td>
              </tr>
            ) : (
              paginatedRecords.map((r) => {
                // Conditional styling for variance
                const absVar = Math.abs(r.forecastVariancePct);
                const varianceColor =
                  absVar <= 5
                    ? 'text-emerald-400'
                    : absVar <= 15
                    ? 'text-amber-400'
                    : 'text-rose-400 font-bold';

                // Conditional styling for MOS
                let mosBadgeStyle = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
                if (r.stockCoverMonths < 2.0) {
                  mosBadgeStyle = 'text-rose-400 bg-rose-500/10 border-rose-500/30 font-bold';
                } else if (r.stockCoverMonths < 3.0) {
                  mosBadgeStyle = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
                } else if (r.stockCoverMonths > 6.0) {
                  mosBadgeStyle = 'text-blue-400 bg-blue-500/10 border-blue-500/30';
                }

                return (
                  <tr
                    key={r.id}
                    onClick={() => onSelectRecord?.(r)}
                    className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                  >
                    {/* Region */}
                    <td className="py-2.5 px-3 font-sans">
                      <div className="font-medium text-slate-200">{r.region}</div>
                      <div className="text-[10px] text-slate-400">{r.district} · {r.facilityTier}</div>
                    </td>

                    {/* Commodity */}
                    <td className="py-2.5 px-3 font-sans">
                      <div className="text-slate-200">{r.productName}</div>
                      <div className="text-[10px] text-teal-400/80">{r.productCategory}</div>
                    </td>

                    {/* Date */}
                    <td className="py-2.5 px-2 text-slate-400 text-[11px]">
                      {r.date}
                    </td>

                    {/* Actual */}
                    <td className="py-2.5 px-3 text-right text-slate-100 tabular-nums">
                      {r.actualConsumption.toLocaleString()}
                    </td>

                    {/* Forecast */}
                    <td className="py-2.5 px-3 text-right text-slate-400 tabular-nums">
                      {r.forecastedDemand.toLocaleString()}
                    </td>

                    {/* Variance % */}
                    <td className={`py-2.5 px-3 text-right tabular-nums ${varianceColor}`}>
                      {r.forecastVariancePct >= 0 ? `+${r.forecastVariancePct.toFixed(1)}%` : `${r.forecastVariancePct.toFixed(1)}%`}
                    </td>

                    {/* Sales */}
                    <td className="py-2.5 px-3 text-right text-emerald-400 tabular-nums font-medium">
                      ₹{r.totalSales.toLocaleString('en-IN')}
                    </td>

                    {/* Profit */}
                    <td className="py-2.5 px-3 text-right text-cyan-300 tabular-nums font-medium">
                      ₹{r.grossProfit.toLocaleString('en-IN')}
                    </td>

                    {/* MOS */}
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] border ${mosBadgeStyle}`}>
                        {r.stockCoverMonths.toFixed(1)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3 font-sans">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded inline-block whitespace-nowrap ${
                          r.stockStatus === 'Stockout Critical'
                            ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20 font-semibold'
                            : r.stockStatus === 'Understocked'
                            ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                            : r.stockStatus === 'Overstocked'
                            ? 'text-blue-400 bg-blue-500/10 border border-blue-500/20'
                            : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                        }`}
                      >
                        {r.stockStatus}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-2.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 bg-slate-950/40">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none text-xs"
          >
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <span>
            Page <strong className="text-white">{currentPage}</strong> of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
            >
              Prev
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
