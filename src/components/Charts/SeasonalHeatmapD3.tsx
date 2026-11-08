import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { SupplyRecord, HealthRegion } from '../../types/supplyChain';
import { Flame, Info, Eye, Sparkles, Filter, Calendar } from 'lucide-react';

interface SeasonalHeatmapD3Props {
  records: SupplyRecord[];
  onSelectRegion?: (region: HealthRegion) => void;
  selectedRegions?: HealthRegion[];
}

type IntensityMetric = 'demand' | 'index' | 'variance' | 'sales';
type ViewGrouping = 'all_months' | 'calendar_months';

export const SeasonalHeatmapD3: React.FC<SeasonalHeatmapD3Props> = ({
  records,
  onSelectRegion,
  selectedRegions = [],
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [metric, setMetric] = useState<IntensityMetric>('demand');
  const [grouping, setGrouping] = useState<ViewGrouping>('all_months');
  const [hoveredCell, setHoveredCell] = useState<{
    region: string;
    monthLabel: string;
    value: number;
    actualDemand: number;
    forecastDemand: number;
    variancePct: number;
    sales: number;
    x: number;
    y: number;
  } | null>(null);

  // Extract unique regions and months
  const processedData = useMemo(() => {
    if (records.length === 0) return { matrix: [], regions: [], months: [], minVal: 0, maxVal: 0 };

    const regionSet = new Set<string>();
    const monthSet = new Set<string>();

    records.forEach((r) => {
      regionSet.add(r.region);
      monthSet.add(grouping === 'all_months' ? r.date : r.month);
    });

    const regionsList = Array.from(regionSet);
    let monthsList = Array.from(monthSet);

    if (grouping === 'all_months') {
      monthsList.sort(); // Chronological YYYY-MM
    } else {
      const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      monthsList.sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));
    }

    // Aggregate values for each cell (region x month)
    const cellMap = new Map<string, {
      actual: number;
      forecast: number;
      sales: number;
      count: number;
    }>();

    records.forEach((r) => {
      const mKey = grouping === 'all_months' ? r.date : r.month;
      const key = `${r.region}___${mKey}`;
      const existing = cellMap.get(key);
      if (!existing) {
        cellMap.set(key, {
          actual: r.actualConsumption,
          forecast: r.forecastedDemand,
          sales: r.totalSales,
          count: 1,
        });
      } else {
        existing.actual += r.actualConsumption;
        existing.forecast += r.forecastedDemand;
        existing.sales += r.totalSales;
        existing.count += 1;
      }
    });

    // Compute regional mean for indexing
    const regionMeanMap = new Map<string, number>();
    regionsList.forEach((reg) => {
      let sum = 0;
      let cnt = 0;
      monthsList.forEach((m) => {
        const c = cellMap.get(`${reg}___${m}`);
        if (c) {
          sum += c.actual;
          cnt++;
        }
      });
      regionMeanMap.set(reg, cnt > 0 ? sum / cnt : 1);
    });

    // Build flat matrix for D3
    const matrix: {
      region: string;
      month: string;
      value: number;
      actual: number;
      forecast: number;
      variancePct: number;
      sales: number;
    }[] = [];

    let minVal = Infinity;
    let maxVal = -Infinity;

    regionsList.forEach((reg) => {
      const regMean = regionMeanMap.get(reg) || 1;
      monthsList.forEach((m) => {
        const data = cellMap.get(`${reg}___${m}`) || { actual: 0, forecast: 0, sales: 0, count: 0 };
        const variancePct = data.forecast > 0 ? ((data.actual - data.forecast) / data.forecast) * 100 : 0;
        const demandIndex = (data.actual / regMean) * 100;

        let cellVal = data.actual;
        if (metric === 'index') cellVal = demandIndex;
        else if (metric === 'variance') cellVal = variancePct;
        else if (metric === 'sales') cellVal = data.sales;

        if (cellVal < minVal) minVal = cellVal;
        if (cellVal > maxVal) maxVal = cellVal;

        matrix.push({
          region: reg,
          month: m,
          value: cellVal,
          actual: data.actual,
          forecast: data.forecast,
          variancePct,
          sales: data.sales,
        });
      });
    });

    if (minVal === Infinity) minVal = 0;
    if (maxVal === -Infinity) maxVal = 100;

    return { matrix, regions: regionsList, months: monthsList, minVal, maxVal };
  }, [records, metric, grouping]);

  // Render D3 Heatmap
  useEffect(() => {
    if (!svgRef.current || processedData.matrix.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const margin = { top: 35, right: 30, bottom: 50, left: 165 };
    const width = 840;
    const height = 240;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // D3 Scales
    const xScale = d3
      .scaleBand()
      .domain(processedData.months)
      .range([0, innerWidth])
      .padding(0.08);

    const yScale = d3
      .scaleBand()
      .domain(processedData.regions)
      .range([0, innerHeight])
      .padding(0.12);

    // Color Interpolator
    let colorScale: d3.ScaleSequential<string, never>;

    if (metric === 'variance') {
      // Diverging color scale for variance (Rose negative -> Slate -> Emerald positive)
      colorScale = d3.scaleSequential(
        d3.interpolateRgbBasis(['#f43f5e', '#334155', '#10b981'])
      ).domain([Math.min(-20, processedData.minVal), Math.max(20, processedData.maxVal)]);
    } else {
      // High-intensity teal/cyan gradient
      colorScale = d3.scaleSequential(
        d3.interpolateRgbBasis([
          '#0f172a', // deep dark slate (lowest)
          '#0d4a4d', // subtle deep teal
          '#0d9488', // vibrant teal
          '#2dd4bf', // bright cyan
          '#a7f3d0', // pale radiant mint (peak intensity)
        ])
      ).domain([processedData.minVal, processedData.maxVal]);
    }

    // X Axis (Months)
    const xAxis = d3.axisBottom(xScale).tickSize(0);
    g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(xAxis)
      .call((ax) => ax.select('.domain').remove())
      .selectAll('text')
      .style('fill', '#94a3b8')
      .style('font-family', 'DM Sans')
      .style('font-size', grouping === 'all_months' && processedData.months.length > 12 ? '9px' : '11px')
      .style('font-weight', '500')
      .attr('transform', grouping === 'all_months' && processedData.months.length > 12 ? 'rotate(-35)' : 'rotate(0)')
      .style('text-anchor', grouping === 'all_months' && processedData.months.length > 12 ? 'end' : 'middle')
      .attr('dy', grouping === 'all_months' && processedData.months.length > 12 ? '0.5em' : '1.2em');

    // Y Axis (Regions)
    const yAxis = d3.axisLeft(yScale).tickSize(0);
    g.append('g')
      .call(yAxis)
      .call((ay) => ay.select('.domain').remove())
      .selectAll('text')
      .style('fill', (d) => (selectedRegions.includes(d as HealthRegion) ? '#2dd4bf' : '#cbd5e1'))
      .style('font-family', 'DM Sans')
      .style('font-size', '11px')
      .style('font-weight', (d) => (selectedRegions.includes(d as HealthRegion) ? '700' : '500'))
      .style('cursor', 'pointer')
      .on('click', (_, d) => {
        if (onSelectRegion) onSelectRegion(d as HealthRegion);
      })
      .text((d) => {
        const textStr = String(d);
        return textStr.replace(' Zone', '').replace(' (UP & NCR)', '').replace(' (Maharashtra & Gujarat)', '').replace(' (Tamil Nadu & Karnataka)', '').replace(' (West Bengal & Bihar)', '').replace(' (MP & Chhattisgarh)', '').replace(' (Assam & Seven Sisters)', '');
      });

    // Render Heatmap Rectangles with D3 transitions
    const cells = g
      .selectAll('rect.cell')
      .data(processedData.matrix)
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('x', (d) => xScale(d.month) || 0)
      .attr('y', (d) => yScale(d.region) || 0)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('fill', '#0f172a')
      .style('stroke', (d) => (selectedRegions.includes(d.region as HealthRegion) ? '#2dd4bf' : '#1e293b'))
      .style('stroke-width', (d) => (selectedRegions.includes(d.region as HealthRegion) ? '1.5px' : '0.5px'))
      .style('cursor', 'pointer');

    // Transition in color fill
    cells
      .transition()
      .duration(400)
      .attr('fill', (d) => colorScale(d.value));

    // Cell interactions
    cells
      .on('mouseenter', (event: MouseEvent, d) => {
        d3.select<SVGRectElement, unknown>(event.currentTarget as SVGRectElement)
          .transition()
          .duration(100)
          .style('stroke', '#ffffff')
          .style('stroke-width', '2px')
          .style('filter', 'brightness(1.2)');

        const [x, y] = d3.pointer(event, containerRef.current);
        setHoveredCell({
          region: d.region,
          monthLabel: d.month,
          value: d.value,
          actualDemand: d.actual,
          forecastDemand: d.forecast,
          variancePct: d.variancePct,
          sales: d.sales,
          x,
          y,
        });
      })
      .on('mouseleave', (event: MouseEvent, d) => {
        d3.select<SVGRectElement, unknown>(event.currentTarget as SVGRectElement)
          .transition()
          .duration(150)
          .style('stroke', selectedRegions.includes(d.region as HealthRegion) ? '#2dd4bf' : '#1e293b')
          .style('stroke-width', selectedRegions.includes(d.region as HealthRegion) ? '1.5px' : '0.5px')
          .style('filter', 'none');

        setHoveredCell(null);
      })
      .on('click', (_, d) => {
        if (onSelectRegion) onSelectRegion(d.region as HealthRegion);
      });

    // Horizontal Color Legend Bar on Top Right
    const legendWidth = 140;
    const legendHeight = 8;
    const legendG = svg
      .append('g')
      .attr('transform', `translate(${width - margin.right - legendWidth}, 12)`);

    // Create gradient definition in SVG defs
    const defs = svg.append('defs');
    const linearGradient = defs
      .append('linearGradient')
      .attr('id', 'd3-heatmap-legend-gradient');

    linearGradient
      .selectAll('stop')
      .data([
        { offset: '0%', color: colorScale(processedData.minVal) },
        { offset: '50%', color: colorScale((processedData.minVal + processedData.maxVal) / 2) },
        { offset: '100%', color: colorScale(processedData.maxVal) },
      ])
      .enter()
      .append('stop')
      .attr('offset', (d) => d.offset)
      .attr('stop-color', (d) => d.color);

    legendG
      .append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .attr('rx', 2)
      .style('fill', 'url(#d3-heatmap-legend-gradient)');

    // Legend Min / Max Labels
    legendG
      .append('text')
      .attr('x', 0)
      .attr('y', legendHeight + 11)
      .style('fill', '#94a3b8')
      .style('font-size', '9px')
      .style('font-family', 'JetBrains Mono')
      .text(
        metric === 'sales'
          ? `₹${(processedData.minVal / 100000).toFixed(0)}L`
          : metric === 'variance'
          ? `${processedData.minVal.toFixed(0)}%`
          : metric === 'index'
          ? `${processedData.minVal.toFixed(0)}%`
          : `${Math.round(processedData.minVal / 1000)}k`
      );

    legendG
      .append('text')
      .attr('x', legendWidth)
      .attr('y', legendHeight + 11)
      .attr('text-anchor', 'end')
      .style('fill', '#94a3b8')
      .style('font-size', '9px')
      .style('font-family', 'JetBrains Mono')
      .text(
        metric === 'sales'
          ? `₹${(processedData.maxVal / 100000).toFixed(1)}L`
          : metric === 'variance'
          ? `+${processedData.maxVal.toFixed(0)}%`
          : metric === 'index'
          ? `${processedData.maxVal.toFixed(0)}%`
          : `${Math.round(processedData.maxVal / 1000)}k`
      );

    legendG
      .append('text')
      .attr('x', legendWidth / 2)
      .attr('y', -3)
      .attr('text-anchor', 'middle')
      .style('fill', '#64748b')
      .style('font-size', '9px')
      .style('font-family', 'DM Sans')
      .text('Intensity Scale');

  }, [processedData, metric, grouping, selectedRegions, onSelectRegion]);

  return (
    <div
      ref={containerRef}
      className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 relative flex flex-col justify-between"
    >
      {/* Top Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-teal-400" />
          <h3 className="text-sm font-semibold text-slate-100 font-display flex items-center gap-1.5">
            <span>D3 Demand Intensity Heatmap</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30">
              D3.js Powered
            </span>
          </h3>
        </div>

        {/* View & Metric Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          
          {/* Timeline Grouping */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded border border-slate-800 text-[11px]">
            <button
              onClick={() => setGrouping('all_months')}
              className={`px-2 py-0.5 rounded transition-colors ${
                grouping === 'all_months'
                  ? 'bg-slate-800 text-teal-300 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              24-Month Timeline
            </button>
            <button
              onClick={() => setGrouping('calendar_months')}
              className={`px-2 py-0.5 rounded transition-colors ${
                grouping === 'calendar_months'
                  ? 'bg-slate-800 text-teal-300 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Annual Seasonality (Jan-Dec)
            </button>
          </div>

          {/* Metric Selector */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded border border-slate-800 text-[11px]">
            <span className="text-slate-400 px-1.5 font-medium">Metric:</span>
            <button
              onClick={() => setMetric('demand')}
              className={`px-2 py-0.5 rounded transition-colors ${
                metric === 'demand'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Demand Units
            </button>
            <button
              onClick={() => setMetric('index')}
              className={`px-2 py-0.5 rounded transition-colors ${
                metric === 'index'
                  ? 'bg-slate-800 text-teal-300 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Demand as percentage of regional monthly average"
            >
              Season Index %
            </button>
            <button
              onClick={() => setMetric('sales')}
              className={`px-2 py-0.5 rounded transition-colors ${
                metric === 'sales'
                  ? 'bg-slate-800 text-emerald-300 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Value (₹)
            </button>
            <button
              onClick={() => setMetric('variance')}
              className={`px-2 py-0.5 rounded transition-colors ${
                metric === 'variance'
                  ? 'bg-slate-800 text-amber-300 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Variance %
            </button>
          </div>

        </div>
      </div>

      {/* SVG Canvas rendered by D3 */}
      <div className="relative w-full overflow-x-auto">
        <svg ref={svgRef} className="w-full h-52 select-none" />

        {/* Floating Custom Tooltip */}
        {hoveredCell && (
          <div
            className="absolute pointer-events-none bg-slate-950/95 border border-slate-700 p-2.5 rounded shadow-2xl text-xs z-30 backdrop-blur-md min-w-[210px]"
            style={{
              left: `${Math.min(78, Math.max(12, (hoveredCell.x / 840) * 100))}%`,
              top: `${Math.max(10, hoveredCell.y - 120)}px`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="font-semibold text-slate-200 border-b border-slate-800 pb-1 mb-1.5 flex justify-between items-center">
              <span className="text-teal-300 font-medium">{hoveredCell.region}</span>
              <span className="font-mono text-slate-400">{hoveredCell.monthLabel}</span>
            </div>

            <div className="space-y-1 font-mono text-[11px]">
              <div className="flex justify-between gap-3">
                <span className="text-slate-400 font-sans">Actual Dispensed:</span>
                <span className="font-bold text-white">
                  {Math.round(hoveredCell.actualDemand).toLocaleString('en-IN')} units
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-400 font-sans">Baseline Forecast:</span>
                <span className="text-slate-300">
                  {Math.round(hoveredCell.forecastDemand).toLocaleString('en-IN')} units
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-400 font-sans">Forecast Variance:</span>
                <span className={hoveredCell.variancePct >= 0 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {hoveredCell.variancePct >= 0 ? `+${hoveredCell.variancePct.toFixed(1)}%` : `${hoveredCell.variancePct.toFixed(1)}%`}
                </span>
              </div>
              <div className="flex justify-between gap-3 pt-1 border-t border-slate-800">
                <span className="text-slate-400 font-sans">Procurement Value:</span>
                <span className="text-emerald-400 font-bold">
                  ₹{(hoveredCell.sales / 100000).toFixed(2)} Lakh
                </span>
              </div>
            </div>

            <div className="mt-1.5 pt-1 border-t border-slate-800/80 text-[10px] text-teal-400 font-sans flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Click cell to cross-filter by {hoveredCell.region}</span>
            </div>
          </div>
        )}
      </div>

      {/* Seasonal Insights Banner */}
      <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/60 mt-1 flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span>
            <strong>Seasonal Takeaway:</strong> Bright cells highlight post-monsoon uptake surges in Oct-Nov & World Population Day in July. Northern & Western zones exhibit highest sustained demand intensity.
          </span>
        </span>
        <span className="text-teal-400 shrink-0 font-medium">Click any row label to slice</span>
      </div>
    </div>
  );
};
