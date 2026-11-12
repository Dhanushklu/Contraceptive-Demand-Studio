import "dotenv/config";
import pg from "pg";

// NUMERIC (1700) and BIGINT (20) come back as strings by default; convert them
pg.types.setTypeParser(1700, (v) => parseFloat(v));
pg.types.setTypeParser(20, (v) => parseInt(v, 10));

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 3,
});