import fs from "fs";
import { pool } from "./db";
import { generateBenchmarkData } from "../src/data/benchmarkDataset";

// [database column, field name in your SupplyRecord]
const COLUMNS: [string, string][] = [
  ["id", "id"],
  ["date", "date"],
  ["year", "year"],
  ["month", "month"],
  ["quarter", "quarter"],
  ["region", "region"],
  ["district", "district"],
  ["facility_tier", "facilityTier"],
  ["product_category", "productCategory"],
  ["product_name", "productName"],
  ["cyp_factor", "cypFactor"],
  ["actual_consumption", "actualConsumption"],
  ["forecasted_demand", "forecastedDemand"],
  ["forecast_variance", "forecastVariance"],
  ["forecast_variance_pct", "forecastVariancePct"],
  ["unit_cost", "unitCost"],
  ["unit_price", "unitPrice"],
  ["total_sales", "totalSales"],
  ["total_cost", "totalCost"],
  ["gross_profit", "grossProfit"],
  ["stock_on_hand", "stockOnHand"],
  ["monthly_avg_consumption", "monthlyAvgConsumption"],
  ["stock_cover_months", "stockCoverMonths"],
  ["lead_time_days", "leadTimeDays"],
  ["stock_status", "stockStatus"],
];

async function seed() {
  await pool.query(fs.readFileSync("server/schema.sql", "utf8"));

  const rows: any[] = generateBenchmarkData();
  const cols = COLUMNS.map(([c]) => c).join(", ");
  const batchSize = 500;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const values: any[] = [];
    const placeholders = batch.map((row) => {
      const ph = COLUMNS.map(([, key]) => {
        values.push(row[key]);
        return `$${values.length}`;
      });
      return `(${ph.join(",")})`;
    });
    await pool.query(
      `INSERT INTO supply_records (${cols}) VALUES ${placeholders.join(",")}`,
      values
    );
  }

  console.log(`Inserted ${rows.length} rows`);
  await pool.end();
}

seed().catch((e) => {
  console.error("Seed failed:", e.message);
  process.exit(1);
});