DROP TABLE IF EXISTS supply_records;

CREATE TABLE supply_records (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  year INT NOT NULL,
  month TEXT NOT NULL,
  quarter TEXT NOT NULL,
  region TEXT NOT NULL,
  district TEXT NOT NULL,
  facility_tier TEXT NOT NULL,
  product_category TEXT NOT NULL,
  product_name TEXT NOT NULL,
  cyp_factor NUMERIC NOT NULL,
  actual_consumption NUMERIC NOT NULL,
  forecasted_demand NUMERIC NOT NULL,
  forecast_variance NUMERIC NOT NULL,
  forecast_variance_pct NUMERIC NOT NULL,
  unit_cost NUMERIC NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_sales NUMERIC NOT NULL,
  total_cost NUMERIC NOT NULL,
  gross_profit NUMERIC NOT NULL,
  stock_on_hand NUMERIC NOT NULL,
  monthly_avg_consumption NUMERIC NOT NULL,
  stock_cover_months NUMERIC NOT NULL,
  lead_time_days INT NOT NULL,
  stock_status TEXT NOT NULL
);

CREATE INDEX idx_sr_date ON supply_records(date);
CREATE INDEX idx_sr_region ON supply_records(region);
CREATE INDEX idx_sr_category ON supply_records(product_category);
CREATE INDEX idx_sr_product ON supply_records(product_name);