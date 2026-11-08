import { SupplyRecord } from '../types/supplyChain';

export const SEASON = 12;
export const TRAIN_START = 12;
export const TEST_START = 18;

export interface HWParams {
  alpha: number; // level smoothing
  beta: number;  // trend smoothing
  gamma: number; // seasonal smoothing
}

export interface ModelScore {
  model: string;
  description: string;
  wapePct: number;
  mapePct: number;
  biasPct: number; // positive = under-forecast
  n: number;
}

/* ---------------- Baseline models ---------------- */

export function movingAverageForecast(y: number[], t: number, window = 3): number {
  if (t === 0) return y[0];
  const start = Math.max(0, t - window);
  let sum = 0;
  for (let i = start; i < t; i++) sum += y[i];
  return sum / (t - start);
}

export function seasonalNaiveForecast(y: number[], t: number): number {
  return t >= SEASON ? y[t - SEASON] : movingAverageForecast(y, t);
}

/* ---------------- Holt-Winters (multiplicative) ---------------- */

export function holtWintersOneStep(y: number[], p: HWParams): number[] {
  const n = y.length;
  const out: number[] = new Array(n);

  for (let t = 0; t < Math.min(SEASON, n); t++) out[t] = movingAverageForecast(y, t);
  if (n <= SEASON) return out;

  let level = y.slice(0, SEASON).reduce((a, b) => a + b, 0) / SEASON;
  let trend = 0;
  const seasonal: number[] = new Array(n).fill(1);
  for (let i = 0; i < SEASON; i++) seasonal[i] = y[i] / level;

  for (let t = SEASON; t < n; t++) {
    const s = seasonal[t - SEASON];
    out[t] = (level + trend) * s;

    const prevLevel = level;
    level = p.alpha * (y[t] / s) + (1 - p.alpha) * (prevLevel + trend);
    trend = p.beta * (level - prevLevel) + (1 - p.beta) * trend;
    seasonal[t] = p.gamma * (y[t] / level) + (1 - p.gamma) * s;
  }
  return out;
}

const ALPHAS = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8];
const BETAS = [0, 0.05, 0.1, 0.2, 0.3];
const GAMMAS = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6];

export function tuneHoltWinters(y: number[]): HWParams {
  let best: HWParams = { alpha: 0.3, beta: 0.1, gamma: 0.3 };
  let bestSse = Infinity;
  const trainEnd = Math.min(TEST_START, y.length);

  for (const alpha of ALPHAS) {
    for (const beta of BETAS) {
      for (const gamma of GAMMAS) {
        const f = holtWintersOneStep(y, { alpha, beta, gamma });
        let sse = 0;
        for (let t = TRAIN_START; t < trainEnd; t++) sse += (y[t] - f[t]) ** 2;
        if (sse < bestSse) {
          bestSse = sse;
          best = { alpha, beta, gamma };
        }
      }
    }
  }
  return best;
}

/* ---------------- Apply to the dataset ---------------- */

const seriesKey = (r: SupplyRecord) => `${r.region}||${r.productName}`;

function groupSeries(records: SupplyRecord[]): Map<string, SupplyRecord[]> {
  const map = new Map<string, SupplyRecord[]>();
  for (const r of records) {
    const k = seriesKey(r);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(r);
  }
  for (const list of map.values()) list.sort((a, b) => a.date.localeCompare(b.date));
  return map;
}

export function applyHoltWintersForecast(records: SupplyRecord[]): SupplyRecord[] {
  const updated = new Map<string, SupplyRecord>();

  for (const list of groupSeries(records).values()) {
    const y = list.map((r) => r.actualConsumption);
    const params = tuneHoltWinters(y);
    const f = holtWintersOneStep(y, params);

    list.forEach((r, i) => {
      const forecast = Math.max(0, Math.round(f[i]));
      const variance = r.actualConsumption - forecast;
      updated.set(r.id, {
        ...r,
        forecastedDemand: forecast,
        forecastVariance: variance,
        forecastVariancePct: forecast > 0 ? Number(((variance / forecast) * 100).toFixed(2)) : 0,
      });
    });
  }

  return records.map((r) => updated.get(r.id) ?? r);
}

/* ---------------- Model comparison (test months only) ---------------- */

function score(model: string, description: string, actual: number[], forecast: number[]): ModelScore {
  let absErr = 0;
  let sumActual = 0;
  let sumPct = 0;
  let sumErr = 0;
  for (let i = 0; i < actual.length; i++) {
    const e = actual[i] - forecast[i];
    absErr += Math.abs(e);
    sumErr += e;
    sumActual += actual[i];
    sumPct += actual[i] > 0 ? Math.abs(e) / actual[i] : 0;
  }
  return {
    model,
    description,
    wapePct: sumActual > 0 ? (absErr / sumActual) * 100 : 0,
    mapePct: actual.length > 0 ? (sumPct / actual.length) * 100 : 0,
    biasPct: sumActual > 0 ? (sumErr / sumActual) * 100 : 0,
    n: actual.length,
  };
}

export function compareModels(records: SupplyRecord[]): ModelScore[] {
  const actual: number[] = [];
  const ma: number[] = [];
  const sn: number[] = [];
  const hw: number[] = [];

  for (const list of groupSeries(records).values()) {
    const y = list.map((r) => r.actualConsumption);
    if (y.length <= TEST_START) continue;
    const f = holtWintersOneStep(y, tuneHoltWinters(y));
    for (let t = TEST_START; t < y.length; t++) {
      actual.push(y[t]);
      ma.push(movingAverageForecast(y, t));
      sn.push(seasonalNaiveForecast(y, t));
      hw.push(f[t]);
    }
  }

  return [
    score('3-Month Moving Average', 'Mean of the previous 3 months (baseline)', actual, ma),
    score('Seasonal Naive', 'Same month last year (baseline)', actual, sn),
    score('Holt-Winters', 'Level + trend + seasonality, tuned per series', actual, hw),
  ];
}