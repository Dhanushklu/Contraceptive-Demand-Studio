import { SupplyRecord, HealthRegion, ProductCategory, FacilityTier, StockStatus } from '../types/supplyChain';
  import { applyHoltWintersForecast } from '../services/forecastEngine';

export interface ContraceptiveProductMeta {
  name: string;
  category: ProductCategory;
  unitCost: number; // in INR (₹)
  unitPrice: number; // in INR (₹)
  cypFactor: number; // CYP per unit dispensed
  baseMonthlyDemand: number;
}

export const CONTRACEPTIVE_PRODUCTS: ContraceptiveProductMeta[] = [
  {
    name: 'Antara (DMPA-IM Injectable)',
    category: 'Injectables',
    unitCost: 42,
    unitPrice: 70,
    cypFactor: 0.25, // 4 doses per year = 1 CYP
    baseMonthlyDemand: 28000,
  },
  {
    name: 'Sayana Press / SubQ Antara',
    category: 'Injectables',
    unitCost: 55,
    unitPrice: 85,
    cypFactor: 0.25,
    baseMonthlyDemand: 16500,
  },
  {
    name: 'Chhaya (Centchroman Non-Hormonal)',
    category: 'Oral Pills',
    unitCost: 8,
    unitPrice: 15,
    cypFactor: 0.08,
    baseMonthlyDemand: 45000,
  },
  {
    name: 'Mala-N (Combined Oral Pills)',
    category: 'Oral Pills',
    unitCost: 4,
    unitPrice: 8,
    cypFactor: 0.067,
    baseMonthlyDemand: 52000,
  },
  {
    name: 'Cu-T 380A IUCD (10-Year)',
    category: 'IUDs',
    unitCost: 28,
    unitPrice: 50,
    cypFactor: 4.6,
    baseMonthlyDemand: 3600,
  },
  {
    name: 'Cu-T 375 IUCD (5-Year)',
    category: 'IUDs',
    unitCost: 35,
    unitPrice: 60,
    cypFactor: 3.5,
    baseMonthlyDemand: 2800,
  },
  {
    name: 'LNG-IUS (Hormonal Intrauterine)',
    category: 'IUDs',
    unitCost: 450,
    unitPrice: 750,
    cypFactor: 4.8,
    baseMonthlyDemand: 1100,
  },
  {
    name: 'Subdermal Single-Rod Implant',
    category: 'Implants',
    unitCost: 380,
    unitPrice: 600,
    cypFactor: 2.5,
    baseMonthlyDemand: 4800,
  },
  {
    name: 'Deluxe Nirodh (Box of 100)',
    category: 'Barrier / Condoms',
    unitCost: 65,
    unitPrice: 110,
    cypFactor: 0.83,
    baseMonthlyDemand: 24000,
  },
  {
    name: 'E-Pill / Easy-72 (Levonorgestrel)',
    category: 'Emergency Contraception',
    unitCost: 12,
    unitPrice: 28,
    cypFactor: 0.05,
    baseMonthlyDemand: 11500,
  },
];

export const REGIONS: { region: HealthRegion; district: string; weight: number; baseLeadTime: number }[] = [
  { region: 'Northern Zone (UP & NCR)', district: 'Lucknow & Meerut DDW', weight: 1.55, baseLeadTime: 14 },
  { region: 'Western Zone (Maharashtra & Gujarat)', district: 'Pune & Ahmedabad DDW', weight: 1.35, baseLeadTime: 12 },
  { region: 'Southern Zone (Tamil Nadu & Karnataka)', district: 'Chennai & Bengaluru DDW', weight: 1.20, baseLeadTime: 16 },
  { region: 'Eastern Zone (West Bengal & Bihar)', district: 'Kolkata & Patna DDW', weight: 1.10, baseLeadTime: 24 },
  { region: 'Central Zone (MP & Chhattisgarh)', district: 'Bhopal & Raipur DDW', weight: 0.90, baseLeadTime: 28 },
  { region: 'North-Eastern Zone (Assam & Seven Sisters)', district: 'Guwahati & Silchar DDW', weight: 0.70, baseLeadTime: 46 },
];

export const FACILITY_TIERS: FacilityTier[] = [
  'State Drug Warehouse (SWH)',
  'District Drug Warehouse (DDW)',
  'Community Health Centre (CHC)',
  'Primary Health Centre / Ayushman Arogya Mandir',
];

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export function generateBenchmarkData(): SupplyRecord[] {
  const records: SupplyRecord[] = [];
  let recordId = 1;

  // 24 months from 2025-01 to 2026-12
  const dates: { dateStr: string; year: number; month: string; quarter: string; monthIndex: number }[] = [];
  
  for (const year of [2025, 2026]) {
    for (let m = 0; m < 12; m++) {
      const monthNum = String(m + 1).padStart(2, '0');
      const dateStr = `${year}-${monthNum}`;
      const q = `Q${Math.floor(m / 3) + 1}`;
      dates.push({
        dateStr,
        year,
        month: MONTH_NAMES[m],
        quarter: q,
        monthIndex: (year - 2025) * 12 + m,
      });
    }
  }

  dates.forEach((d) => {
    // Seasonal multiplier: Mission Parivar Vikas drives and World Population Day (July) campaigns
    const seasonTrend = 1 + 0.08 * Math.sin((d.monthIndex / 12) * 2 * Math.PI) + (d.monthIndex * 0.007);
    const campaignBoost = (d.month === 'Jul' || d.month === 'Nov') ? 1.15 : 1.0;

    REGIONS.forEach((reg, regIndex) => {
      CONTRACEPTIVE_PRODUCTS.forEach((prod, prodIndex) => {
        const seedBase = (d.monthIndex * 1000) + (regIndex * 100) + prodIndex;
        const rand1 = seededRandom(seedBase);
        const rand2 = seededRandom(seedBase + 1);
        const rand3 = seededRandom(seedBase + 2);

        // Actual consumption calculation
        const baseline = (prod.baseMonthlyDemand / 6) * reg.weight * seasonTrend * campaignBoost;
        const actualNoise = 0.90 + (rand1 * 0.22);
        const actual = Math.round(baseline * actualNoise);

        // Forecasted demand
        const forecastNoise = 0.88 + (rand2 * 0.25);
        const forecast = Math.round(baseline * forecastNoise);

        const variance = actual - forecast;
        const variancePct = forecast > 0 ? (variance / forecast) * 100 : 0;

        // Stock on hand (North-East faces longer lead times and stockout exposure)
        const stockMultiplier = reg.region === 'North-Eastern Zone (Assam & Seven Sisters)' 
          ? (1.3 + rand3 * 2.7) 
          : reg.region === 'Northern Zone (UP & NCR)'
          ? (3.5 + rand3 * 3.5)
          : (2.5 + rand3 * 3.4);

        const stockOnHand = Math.round(actual * stockMultiplier);
        const monthlyAvgConsumption = actual;
        const stockCoverMonths = Number((stockOnHand / Math.max(monthlyAvgConsumption, 1)).toFixed(2));

        let stockStatus: StockStatus = 'Adequate / Optimal';
        if (stockCoverMonths < 2.0) {
          stockStatus = 'Stockout Critical';
        } else if (stockCoverMonths < 3.0) {
          stockStatus = 'Understocked';
        } else if (stockCoverMonths > 6.0) {
          stockStatus = 'Overstocked';
        }

        // Financials in INR (₹)
        const totalSales = Number((actual * prod.unitPrice).toFixed(2));
        const totalCost = Number((actual * prod.unitCost).toFixed(2));
        const grossProfit = Number((totalSales - totalCost).toFixed(2));

        // Assign facility tier
        const facilityTier = regIndex === 0 
          ? 'State Drug Warehouse (SWH)' 
          : regIndex === 1 || regIndex === 2 
          ? 'District Drug Warehouse (DDW)' 
          : prodIndex % 2 === 0 
          ? 'Community Health Centre (CHC)' 
          : 'Primary Health Centre / Ayushman Arogya Mandir';

        const leadTimeDays = Math.round(reg.baseLeadTime * (0.85 + rand3 * 0.35));

        records.push({
          id: `FPLMIS-${String(recordId++).padStart(5, '0')}`,
          date: d.dateStr,
          year: d.year,
          month: d.month,
          quarter: d.quarter,
          region: reg.region,
          district: reg.district,
          facilityTier,
          productCategory: prod.category,
          productName: prod.name,
          cypFactor: prod.cypFactor,
          actualConsumption: actual,
          forecastedDemand: forecast,
          forecastVariance: variance,
          forecastVariancePct: Number(variancePct.toFixed(2)),
          unitCost: prod.unitCost,
          unitPrice: prod.unitPrice,
          totalSales,
          totalCost,
          grossProfit,
          stockOnHand,
          monthlyAvgConsumption,
          stockCoverMonths,
          leadTimeDays,
          stockStatus,
        });
      });
    });
  });

  return records;
}

  export const INITIAL_DATASET = applyHoltWintersForecast(generateBenchmarkData());
