export type ProductCategory = 
  | 'Injectables' 
  | 'Implants' 
  | 'Oral Pills' 
  | 'IUDs' 
  | 'Barrier / Condoms' 
  | 'Emergency Contraception';

export type HealthRegion = 
  | 'Northern Zone (UP & NCR)' 
  | 'Western Zone (Maharashtra & Gujarat)' 
  | 'Southern Zone (Tamil Nadu & Karnataka)' 
  | 'Eastern Zone (West Bengal & Bihar)' 
  | 'Central Zone (MP & Chhattisgarh)' 
  | 'North-Eastern Zone (Assam & Seven Sisters)';

export type FacilityTier = 
  | 'State Drug Warehouse (SWH)' 
  | 'District Drug Warehouse (DDW)' 
  | 'Community Health Centre (CHC)' 
  | 'Primary Health Centre / Ayushman Arogya Mandir';

export type StockStatus = 
  | 'Stockout Critical' // MOS < 2.0
  | 'Understocked'      // MOS 2.0 - 2.9
  | 'Adequate / Optimal' // MOS 3.0 - 6.0
  | 'Overstocked';      // MOS > 6.0

export interface SupplyRecord {
  id: string;
  date: string; // YYYY-MM
  year: number;
  month: string;
  quarter: string;
  region: HealthRegion;
  district: string;
  facilityTier: FacilityTier;
  productCategory: ProductCategory;
  productName: string;
  cypFactor: number; // Couple Years of Protection conversion
  actualConsumption: number; // Units dispensed/consumed
  forecastedDemand: number; // Units predicted
  forecastVariance: number; // Actual - Forecast
  forecastVariancePct: number; // (Actual - Forecast) / Forecast * 100
  unitCost: number; // Procurement cost in INR (₹)
  unitPrice: number; // Program selling/distribution price in INR (₹)
  totalSales: number; // Actual * unitPrice in INR (₹)
  totalCost: number; // Actual * unitCost in INR (₹)
  grossProfit: number; // totalSales - totalCost (Program Surplus/Margin in ₹)
  stockOnHand: number; // Physical inventory in units
  monthlyAvgConsumption: number;
  stockCoverMonths: number; // MOS = StockOnHand / MonthlyAvgConsumption
  leadTimeDays: number; // Delivery lead time
  stockStatus: StockStatus;
}

export interface FilterState {
  selectedRegions: HealthRegion[];
  selectedCategories: ProductCategory[];
  selectedProducts: string[];
  selectedTiers: FacilityTier[];
  selectedStockStatuses: StockStatus[];
  dateRange: [string, string];
  searchQuery: string;
  metricMode: 'units' | 'sales' | 'profit' | 'variance';
  sortColumn: keyof SupplyRecord;
  sortDirection: 'asc' | 'desc';
}

export interface DaxMeasure {
  id: string;
  name: string;
  category: 'Demand & Forecast' | 'Financial & Margin' | 'Supply Chain & Inventory' | 'Health Impact';
  formula: string;
  description: string;
  powerBiSnippet: string;
  formatType: 'integer' | 'currency' | 'percent' | 'decimal';
  unit: string;
}

export interface ColumnVerification {
  columnName: string;
  expectedType: 'Date' | 'Text' | 'Integer' | 'Currency' | 'Percentage' | 'Categorical';
  detectedType: string;
  nonNullCount: number;
  totalCount: number;
  nullPercentage: number;
  sampleValues: (string | number)[];
  status: 'verified' | 'warning' | 'missing';
  description: string;
}

export interface SimulationParameters {
  demandSurgePercent: number; // e.g. -20% to +50%
  leadTimeDelayDays: number;  // e.g. 0 to 60 days
  safetyStockBufferMonths: number; // e.g. 1 to 6 months
  priceAdjustmentPercent: number; // e.g. -20% to +20%
}
