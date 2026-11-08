import { SupplyRecord, DaxMeasure } from '../types/supplyChain';

export const DAX_MEASURES: DaxMeasure[] = [
  {
    id: 'total_actual_demand',
    name: 'Total Actual Demand',
    category: 'Demand & Forecast',
    formula: 'Total Actual Demand = SUM(SupplyChain[Actual_Consumption])',
    description: 'Aggregates all contraceptive units dispensed or consumed at the health facility level within the selected filter context.',
    powerBiSnippet: `Total Actual Demand = 
SUM ( SupplyChain[Actual_Consumption] )`,
    formatType: 'integer',
    unit: 'Units',
  },
  {
    id: 'total_forecasted_demand',
    name: 'Total Forecasted Demand',
    category: 'Demand & Forecast',
    formula: 'Total Forecasted Demand = SUM(SupplyChain[Forecasted_Demand])',
    description: 'Calculates the baseline statistical demand forecast projected for health supply chain replenishment.',
    powerBiSnippet: `Total Forecasted Demand = 
SUM ( SupplyChain[Forecasted_Demand] )`,
    formatType: 'integer',
    unit: 'Units',
  },
  {
    id: 'forecast_variance',
    name: 'Forecast Variance',
    category: 'Demand & Forecast',
    formula: 'Forecast Variance = [Total Actual Demand] - [Total Forecasted Demand]',
    description: 'Measures absolute unit difference between actual consumption and statistical forecast. Positive indicates under-forecasting (stockout risk); negative indicates over-forecasting.',
    powerBiSnippet: `Forecast Variance = 
[Total Actual Demand] - [Total Forecasted Demand]`,
    formatType: 'integer',
    unit: 'Units',
  },
  {
    id: 'forecast_variance_pct',
    name: 'Forecast Variance %',
    category: 'Demand & Forecast',
    formula: 'Forecast Variance % = DIVIDE([Forecast Variance], [Total Forecasted Demand], 0)',
    description: 'Normalized relative variance percentage against forecasted volume. Key KPI for warehouse space and buffer allocation.',
    powerBiSnippet: `Forecast Variance % = 
DIVIDE ( [Forecast Variance], [Total Forecasted Demand], 0 )`,
    formatType: 'percent',
    unit: '%',
  },
  {
    id: 'wape_pct',
    name: 'WAPE % (Weighted Absolute Error)',
    category: 'Demand & Forecast',
    formula: 'WAPE % = DIVIDE(SUMX(SupplyChain, ABS(SupplyChain[Actual_Consumption] - SupplyChain[Forecasted_Demand])), [Total Actual Demand], 0)',
    description: 'Weighted Absolute Percentage Error - gold standard metric for healthcare supply chain demand forecasting without distortion by zero-demand outliers.',
    powerBiSnippet: `WAPE % = 
DIVIDE (
    SUMX (
        SupplyChain,
        ABS ( SupplyChain[Actual_Consumption] - SupplyChain[Forecasted_Demand] )
    ),
    [Total Actual Demand],
    0
)`,
    formatType: 'percent',
    unit: '%',
  },
  {
    id: 'forecast_accuracy_pct',
    name: 'Forecast Accuracy % (1 - WAPE)',
    category: 'Demand & Forecast',
    formula: 'Forecast Accuracy % = 1 - [WAPE %]',
    description: 'Executive accuracy metric. Target benchmark for national contraceptive logistics is 85% - 92%.',
    powerBiSnippet: `Forecast Accuracy % = 
MAX ( 0, 1 - [WAPE %] )`,
    formatType: 'percent',
    unit: '%',
  },
  {
    id: 'mape_pct',
    name: 'MAPE % (Mean Absolute Pct Error)',
    category: 'Demand & Forecast',
    formula: 'MAPE % = AVERAGEX(SupplyChain, DIVIDE(ABS(SupplyChain[Actual_Consumption] - SupplyChain[Forecasted_Demand]), SupplyChain[Actual_Consumption], 0))',
    description: 'Mean of individual percentage errors across all region and commodity reporting lines.',
    powerBiSnippet: `MAPE % = 
AVERAGEX (
    SupplyChain,
    DIVIDE (
        ABS ( SupplyChain[Actual_Consumption] - SupplyChain[Forecasted_Demand] ),
        SupplyChain[Actual_Consumption],
        0
    )
)`,
    formatType: 'percent',
    unit: '%',
  },
  {
    id: 'total_sales',
    name: 'Total Procurement Sales / Value',
    category: 'Financial & Margin',
    formula: 'Total Sales = SUMX(SupplyChain, SupplyChain[Actual_Consumption] * SupplyChain[Unit_Price])',
    description: 'Monetary value of dispensed contraceptives evaluated at public health / social marketing distribution tariff prices.',
    powerBiSnippet: `Total Sales = 
SUMX (
    SupplyChain,
    SupplyChain[Actual_Consumption] * SupplyChain[Unit_Price]
)`,
    formatType: 'currency',
    unit: 'INR (₹)',
  },
  {
    id: 'total_cost',
    name: 'Total Procurement Cost',
    category: 'Financial & Margin',
    formula: 'Total Cost = SUMX(SupplyChain, SupplyChain[Actual_Consumption] * SupplyChain[Unit_Cost])',
    description: 'Total wholesale procurement cost allocated under National Health Mission (NHM) and state program budgets.',
    powerBiSnippet: `Total Cost = 
SUMX (
    SupplyChain,
    SupplyChain[Actual_Consumption] * SupplyChain[Unit_Cost]
)`,
    formatType: 'currency',
    unit: 'INR (₹)',
  },
  {
    id: 'gross_profit',
    name: 'Net Program Margin / Profit',
    category: 'Financial & Margin',
    formula: 'Net Program Profit = [Total Sales] - [Total Cost]',
    description: 'Operating cost recovery margin reinvested into state supply chain cold-chain logistics, transport fleet, and ASHA/ANM clinical incentives.',
    powerBiSnippet: `Net Program Profit = 
[Total Sales] - [Total Cost]`,
    formatType: 'currency',
    unit: 'INR (₹)',
  },
  {
    id: 'profit_margin_pct',
    name: 'Program Margin %',
    category: 'Financial & Margin',
    formula: 'Profit Margin % = DIVIDE([Net Program Profit], [Total Sales], 0)',
    description: 'Percentage cost recovery efficiency across subsidized and commercial family planning lines.',
    powerBiSnippet: `Profit Margin % = 
DIVIDE ( [Net Program Profit], [Total Sales], 0 )`,
    formatType: 'percent',
    unit: '%',
  },
  {
    id: 'stock_on_hand',
    name: 'Stock on Hand (SOH)',
    category: 'Supply Chain & Inventory',
    formula: 'Stock on Hand = SUM(SupplyChain[Stock_On_Hand])',
    description: 'Current physical inventory stored across central medical stores, regional depots, and peripheral health centers.',
    powerBiSnippet: `Stock on Hand = 
SUM ( SupplyChain[Stock_On_Hand] )`,
    formatType: 'integer',
    unit: 'Units',
  },
  {
    id: 'months_of_stock',
    name: 'Average Months of Stock (MOS)',
    category: 'Supply Chain & Inventory',
    formula: 'Average MOS = DIVIDE([Stock on Hand], [Total Actual Demand], 0)',
    description: 'Months of Stock coverage. Each monthly stock snapshot is divided by that same month\'s consumption, so summed stock over summed demand gives the average months of cover. Safe logistics operating corridor is 3.0 to 6.0 MOS.',
    powerBiSnippet: `Average MOS = 
DIVIDE ( [Stock on Hand], [Total Actual Demand], 0 )`,
    formatType: 'decimal',
    unit: 'MOS',
  },
  {
    id: 'stockout_risk_rate',
    name: 'Stockout Vulnerability Rate %',
    category: 'Supply Chain & Inventory',
    formula: 'Stockout Risk Rate % = DIVIDE(COUNTROWS(FILTER(SupplyChain, SupplyChain[Stock_Cover_Months] < 2.0)), COUNTROWS(SupplyChain), 0)',
    description: 'Percentage of reporting commodity lines with less than 2.0 months of stock coverage, posing imminent stockout risk to patients.',
    powerBiSnippet: `Stockout Risk Rate % = 
DIVIDE (
    COUNTROWS ( FILTER ( SupplyChain, SupplyChain[Stock_Cover_Months] < 2.0 ) ),
    COUNTROWS ( SupplyChain ),
    0
)`,
    formatType: 'percent',
    unit: '%',
  },
  {
    id: 'couple_years_protection',
    name: 'Total Couple Years of Protection (CYP)',
    category: 'Health Impact',
    formula: 'Total CYP = SUMX(SupplyChain, SupplyChain[Actual_Consumption] * SupplyChain[CYP_Factor])',
    description: 'Global USAID/WHO public health standard metric representing the estimated protection from unintended pregnancy provided by contraceptive methods.',
    powerBiSnippet: `Total CYP = 
SUMX (
    SupplyChain,
    SupplyChain[Actual_Consumption] * SupplyChain[CYP_Factor]
)`,
    formatType: 'integer',
    unit: 'CYP',
  },
];

export interface EvaluatedMetrics {
  totalActualDemand: number;
  totalForecastedDemand: number;
  forecastVariance: number;
  forecastVariancePct: number;
  wapePct: number;
  forecastAccuracyPct: number;
  mapePct: number;
  totalSales: number;
  totalCost: number;
  grossProfit: number;
  profitMarginPct: number;
  stockOnHand: number;
  averageMOS: number;
  stockoutRiskRate: number;
  overstockRiskRate: number;
  totalCYP: number;
  averageLeadTime: number;
  recordsCount: number;
}

export function evaluateDataset(records: SupplyRecord[]): EvaluatedMetrics {
  if (records.length === 0) {
    return {
      totalActualDemand: 0,
      totalForecastedDemand: 0,
      forecastVariance: 0,
      forecastVariancePct: 0,
      wapePct: 0,
      forecastAccuracyPct: 0,
      mapePct: 0,
      totalSales: 0,
      totalCost: 0,
      grossProfit: 0,
      profitMarginPct: 0,
      stockOnHand: 0,
      averageMOS: 0,
      stockoutRiskRate: 0,
      overstockRiskRate: 0,
      totalCYP: 0,
      averageLeadTime: 0,
      recordsCount: 0,
    };
  }

  let totalActualDemand = 0;
  let totalForecastedDemand = 0;
  let totalAbsError = 0;
  let sumPape = 0;
  let totalSales = 0;
  let totalCost = 0;
  let stockOnHand = 0;
  let criticalStockoutCount = 0;
  let overstockCount = 0;
  let totalCYP = 0;
  let totalLeadTime = 0;

  for (const r of records) {
    totalActualDemand += r.actualConsumption;
    totalForecastedDemand += r.forecastedDemand;
    const absDiff = Math.abs(r.actualConsumption - r.forecastedDemand);
    totalAbsError += absDiff;
    if (r.actualConsumption > 0) {
      sumPape += absDiff / r.actualConsumption;
    }
    totalSales += r.totalSales;
    totalCost += r.totalCost;
    stockOnHand += r.stockOnHand;
    if (r.stockCoverMonths < 2.0) {
      criticalStockoutCount++;
    } else if (r.stockCoverMonths > 6.0) {
      overstockCount++;
    }
    totalCYP += r.actualConsumption * r.cypFactor;
    totalLeadTime += r.leadTimeDays;
  }

  const forecastVariance = totalActualDemand - totalForecastedDemand;
  const forecastVariancePct = totalForecastedDemand > 0 ? (forecastVariance / totalForecastedDemand) * 100 : 0;
  const wapePct = totalActualDemand > 0 ? (totalAbsError / totalActualDemand) * 100 : 0;
  const forecastAccuracyPct = Math.max(0, 100 - wapePct);
  const mapePct = records.length > 0 ? (sumPape / records.length) * 100 : 0;
  const grossProfit = totalSales - totalCost;
  const profitMarginPct = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;

  // Months of Stock: each record is a monthly stock snapshot paired with that month's
  // consumption, so total stock / total demand = average months of cover.
  const averageMOS = totalActualDemand > 0 ? stockOnHand / totalActualDemand : 0;

  const stockoutRiskRate = (criticalStockoutCount / records.length) * 100;
  const overstockRiskRate = (overstockCount / records.length) * 100;
  const averageLeadTime = totalLeadTime / records.length;

  return {
    totalActualDemand,
    totalForecastedDemand,
    forecastVariance,
    forecastVariancePct,
    wapePct,
    forecastAccuracyPct,
    mapePct,
    totalSales,
    totalCost,
    grossProfit,
    profitMarginPct,
    stockOnHand,
    averageMOS,
    stockoutRiskRate,
    overstockRiskRate,
    totalCYP,
    averageLeadTime,
    recordsCount: records.length,
  };
}

export function formatMetricValue(value: number, formatType: DaxMeasure['formatType']): string {
  if (isNaN(value)) return '0';
  switch (formatType) {
    case 'integer':
      return Math.round(value).toLocaleString('en-IN');
    case 'currency':
      if (Math.abs(value) >= 10000000) {
        return `₹${(value / 10000000).toFixed(2)} Cr`;
      } else if (Math.abs(value) >= 100000) {
        return `₹${(value / 100000).toFixed(2)} Lakh`;
      }
      return `₹${Math.round(value).toLocaleString('en-IN')}`;
    case 'percent':
      return `${value.toFixed(1)}%`;
    case 'decimal':
      return value.toFixed(2);
    default:
      return value.toLocaleString('en-IN');
  }
}