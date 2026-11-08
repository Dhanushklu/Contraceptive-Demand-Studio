import express from "express";
import cors from "cors";
import { pool } from "./db";

const app = express();
app.use(cors());
app.use(express.json());

// ---------- helpers ----------

// query-string name -> database column (only these can be filtered)
const FILTERS: Record<string, string> = {
  year: "year",
  quarter: "quarter",
  month: "month",
  region: "region",
  district: "district",
  facilityTier: "facility_tier",
  category: "product_category",
  product: "product_name",
  stockStatus: "stock_status",
};

// Builds "WHERE ..." from the query string, e.g. ?region=...&year=2025
// A value can be a comma-separated list: ?year=2025,2026
function buildWhere(query: Record<string, any>) {
  const conditions: string[] = [];
  const values: any[] = [];
  for (const [param, column] of Object.entries(FILTERS)) {
    const raw = query[param];
    if (raw === undefined || raw === "" || raw === "All") continue;
    const list = String(raw).split(",");
    values.push(list);
    conditions.push(`${column}::text = ANY($${values.length})`);
  }
  return {
    sql: conditions.length ? "WHERE " + conditions.join(" AND ") : "",
    values,
  };
}

// catches errors in async routes so the server doesn't crash
const wrap =
  (fn: express.RequestHandler): express.RequestHandler =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// ---------- routes ----------

// Friendly home page for http://localhost:3001
app.get("/", (_req, res) => {
  res.json({
    name: "Nova API",
    status: "running",
    try: [
      "/api/health",
      "/api/kpis",
      "/api/filters",
      "/api/monthly?year=2025",
      "/api/records",
    ],
  });
});

app.get(
  "/api/health",
  wrap(async (_req, res) => {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  })
);

// Values for the slicers/dropdowns
app.get(
  "/api/filters",
  wrap(async (_req, res) => {
    const get = async (col: string) =>
      (await pool.query(`SELECT DISTINCT ${col} AS v FROM supply_records ORDER BY v`)).rows.map(
        (r) => r.v
      );
    res.json({
      years: await get("year"),
      quarters: await get("quarter"),
      regions: await get("region"),
      districts: await get("district"),
      facilityTiers: await get("facility_tier"),
      categories: await get("product_category"),
      products: await get("product_name"),
      stockStatuses: await get("stock_status"),
    });
  })
);

// Full records (same field names as your SupplyRecord type)
app.get(
  "/api/records",
  wrap(async (req, res) => {
    const { sql, values } = buildWhere(req.query);
    const r = await pool.query(
      `SELECT
         id, date, year, month, quarter, region, district,
         facility_tier AS "facilityTier",
         product_category AS "productCategory",
         product_name AS "productName",
         cyp_factor AS "cypFactor",
         actual_consumption AS "actualConsumption",
         forecasted_demand AS "forecastedDemand",
         forecast_variance AS "forecastVariance",
         forecast_variance_pct AS "forecastVariancePct",
         unit_cost AS "unitCost",
         unit_price AS "unitPrice",
         total_sales AS "totalSales",
         total_cost AS "totalCost",
         gross_profit AS "grossProfit",
         stock_on_hand AS "stockOnHand",
         monthly_avg_consumption AS "monthlyAvgConsumption",
         stock_cover_months AS "stockCoverMonths",
         lead_time_days AS "leadTimeDays",
         stock_status AS "stockStatus"
       FROM supply_records ${sql}
       ORDER BY date, region, product_name`,
      values
    );
    res.json(r.rows);
  })
);

// KPI cards
app.get(
  "/api/kpis",
  wrap(async (req, res) => {
    const { sql, values } = buildWhere(req.query);
    const r = await pool.query(
      `SELECT
         COUNT(*)::int AS records,
         COALESCE(SUM(actual_consumption), 0) AS "totalConsumption",
         COALESCE(SUM(forecasted_demand), 0) AS "totalForecast",
         COALESCE(SUM(total_sales), 0) AS "totalSales",
         COALESCE(SUM(total_cost), 0) AS "totalCost",
         COALESCE(SUM(gross_profit), 0) AS "grossProfit",
         COALESCE(SUM(actual_consumption * cyp_factor), 0) AS "totalCYP",
         COALESCE(AVG(stock_cover_months), 0) AS "avgStockCoverMonths",
         COALESCE(AVG(lead_time_days), 0) AS "avgLeadTimeDays",
         COALESCE(100 - AVG(ABS(forecast_variance_pct)), 0) AS "forecastAccuracyPct",
         COUNT(*) FILTER (WHERE stock_status = 'Stockout Critical')::int AS "stockoutCount"
       FROM supply_records ${sql}`,
      values
    );
    res.json(r.rows[0]);
  })
);

// Monthly demand chart: actual vs forecast
app.get(
  "/api/monthly",
  wrap(async (req, res) => {
    const { sql, values } = buildWhere(req.query);
    const r = await pool.query(
      `SELECT date, year, month,
              SUM(actual_consumption) AS "actual",
              SUM(forecasted_demand) AS "forecast"
       FROM supply_records ${sql}
       GROUP BY date, year, month
       ORDER BY date`,
      values
    );
    res.json(r.rows);
  })
);

// Regional performance chart
app.get(
  "/api/regions",
  wrap(async (req, res) => {
    const { sql, values } = buildWhere(req.query);
    const r = await pool.query(
      `SELECT region,
              SUM(actual_consumption) AS "actual",
              SUM(forecasted_demand) AS "forecast",
              SUM(total_sales) AS "sales",
              SUM(gross_profit) AS "grossProfit",
              AVG(stock_cover_months) AS "avgStockCoverMonths",
              AVG(lead_time_days) AS "avgLeadTimeDays"
       FROM supply_records ${sql}
       GROUP BY region
       ORDER BY SUM(actual_consumption) DESC`,
      values
    );
    res.json(r.rows);
  })
);

// Method / product mix chart
app.get(
  "/api/products",
  wrap(async (req, res) => {
    const { sql, values } = buildWhere(req.query);
    const r = await pool.query(
      `SELECT product_category AS "category",
              product_name AS "product",
              SUM(actual_consumption) AS "actual",
              SUM(forecasted_demand) AS "forecast",
              SUM(actual_consumption * cyp_factor) AS "cyp",
              SUM(total_sales) AS "sales"
       FROM supply_records ${sql}
       GROUP BY product_category, product_name
       ORDER BY SUM(actual_consumption) DESC`,
      values
    );
    res.json(r.rows);
  })
);

// Stock cover matrix: region x product
app.get(
  "/api/stock-cover",
  wrap(async (req, res) => {
    const { sql, values } = buildWhere(req.query);
    const r = await pool.query(
      `SELECT region,
              product_name AS "product",
              AVG(stock_cover_months) AS "avgStockCoverMonths",
              SUM(stock_on_hand) AS "stockOnHand"
       FROM supply_records ${sql}
       GROUP BY region, product_name
       ORDER BY region, product_name`,
      values
    );
    res.json(r.rows);
  })
);

// Seasonal heatmap: month x region
app.get(
  "/api/seasonal",
  wrap(async (req, res) => {
    const { sql, values } = buildWhere(req.query);
    const r = await pool.query(
      `SELECT month, region, SUM(actual_consumption) AS "actual"
       FROM supply_records ${sql}
       GROUP BY month, region`,
      values
    );
    res.json(r.rows);
  })
);

// Stock status counts
app.get(
  "/api/stock-status",
  wrap(async (req, res) => {
    const { sql, values } = buildWhere(req.query);
    const r = await pool.query(
      `SELECT stock_status AS "status", COUNT(*)::int AS "count"
       FROM supply_records ${sql}
       GROUP BY stock_status
       ORDER BY COUNT(*) DESC`,
      values
    );
    res.json(r.rows);
  })
);

// ---------- error handler (must be last) ----------
app.use(
  (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
);

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));