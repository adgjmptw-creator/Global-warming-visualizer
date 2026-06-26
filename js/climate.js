// Data layer: geocoding, historical-climate fetch, aggregation, and stats.
//
// Data source: Open-Meteo (https://open-meteo.com) — free, no API key, CORS
// enabled, so everything runs client-side from the user's browser. No backend.

import { nearestSample } from './sample-data.js';

const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const ARCHIVE_URL = 'https://archive-api.open-meteo.com/v1/archive';
const START_YEAR = 1950;
const CACHE_PREFIX = 'gwviz:v1:';
const HOT_DAY_THRESHOLD = 30; // °C — a "scorching" day (daily max)

// ---------------------------------------------------------------------------
// Geocoding: place name -> candidate locations
// ---------------------------------------------------------------------------
export async function geocode(query, lang = 'en') {
  const q = (query || '').trim();
  if (!q) return [];
  const url = `${GEOCODE_URL}?name=${encodeURIComponent(q)}&count=5&language=${encodeURIComponent(lang)}&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`);
  const data = await res.json();
  return (data.results || []).map((r) => ({
    label: formatPlace(r),
    name: r.name,
    latitude: r.latitude,
    longitude: r.longitude,
    country: r.country,
    admin1: r.admin1,
  }));
}

function formatPlace(r) {
  return [r.name, r.admin1, r.country].filter(Boolean).join(', ');
}

// ---------------------------------------------------------------------------
// Historical climate: coordinates -> yearly series
// ---------------------------------------------------------------------------
export async function fetchClimate({ latitude, longitude, label }) {
  const cacheKey = `${CACHE_PREFIX}${latitude.toFixed(2)},${longitude.toFixed(2)}`;
  const cached = readCache(cacheKey);
  if (cached) return { ...cached, label: label || cached.label, source: cached.source };

  const lastFullYear = new Date().getFullYear() - 1;
  const url =
    `${ARCHIVE_URL}?latitude=${latitude}&longitude=${longitude}` +
    `&start_date=${START_YEAR}-01-01&end_date=${lastFullYear}-12-31` +
    `&daily=temperature_2m_mean,temperature_2m_max&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Climate fetch failed (${res.status})`);
  const data = await res.json();
  const series = aggregateDaily(data.daily, { latitude, longitude, label });
  if (!series.years.length) throw new Error('No climate data available for this place.');
  writeCache(cacheKey, series);
  return series;
}

// Fallback when the network/API is unavailable.
export function fallbackClimate({ latitude, longitude, label }) {
  const s = nearestSample(latitude ?? 35.69, longitude ?? 139.69);
  return {
    label: label || s.label,
    latitude: s.latitude,
    longitude: s.longitude,
    years: s.years.slice(),
    yearlyMean: s.yearlyMean.slice(),
    hotDays: s.hotDays.slice(),
    source: 'sample',
  };
}

// Roll daily arrays up into one value per *complete* calendar year.
function aggregateDaily(daily, meta) {
  const time = (daily && daily.time) || [];
  const mean = (daily && daily.temperature_2m_mean) || [];
  const max = (daily && daily.temperature_2m_max) || [];

  const buckets = new Map(); // year -> {sum, count, hot}
  for (let i = 0; i < time.length; i++) {
    const year = parseInt(time[i].slice(0, 4), 10);
    const m = mean[i];
    if (m === null || m === undefined || Number.isNaN(m)) continue;
    let b = buckets.get(year);
    if (!b) {
      b = { sum: 0, count: 0, hot: 0 };
      buckets.set(year, b);
    }
    b.sum += m;
    b.count += 1;
    const mx = max[i];
    if (mx !== null && mx !== undefined && mx >= HOT_DAY_THRESHOLD) b.hot += 1;
  }

  const years = [];
  const yearlyMean = [];
  const hotDays = [];
  for (const year of [...buckets.keys()].sort((a, b) => a - b)) {
    const b = buckets.get(year);
    if (b.count < 300) continue; // require a near-complete year
    years.push(year);
    yearlyMean.push(Math.round((b.sum / b.count) * 10) / 10);
    hotDays.push(b.hot);
  }

  return {
    label: meta.label,
    latitude: meta.latitude,
    longitude: meta.longitude,
    years,
    yearlyMean,
    hotDays,
    source: 'open-meteo',
  };
}

// ---------------------------------------------------------------------------
// Derived statistics for the visualizations
// ---------------------------------------------------------------------------
export function computeStats(series) {
  const { years, yearlyMean, hotDays } = series;
  const n = years.length;

  const baseline = computeBaseline(years, yearlyMean);
  const anomalies = yearlyMean.map((t) => Math.round((t - baseline) * 100) / 100);

  const trendPerYear = leastSquaresSlope(years, yearlyMean);
  const trendPerDecade = trendPerYear * 10;
  const intercept = meanOf(yearlyMean) - trendPerYear * meanOf(years);

  const earlyCount = Math.min(10, Math.floor(n / 2));
  const earlyMean = meanOf(yearlyMean.slice(0, earlyCount));
  const recentMean = meanOf(yearlyMean.slice(n - earlyCount));
  const delta = recentMean - earlyMean;

  const hottestIdx = argmax(yearlyMean);
  const coldestIdx = argmin(yearlyMean);

  const hotThen = Math.round(meanOf(hotDays.slice(0, earlyCount)));
  const hotNow = Math.round(meanOf(hotDays.slice(n - earlyCount)));

  const absMaxAnom = Math.max(0.01, ...anomalies.map((a) => Math.abs(a)));

  return {
    baseline: Math.round(baseline * 10) / 10,
    anomalies,
    absMaxAnom,
    trendPerDecade: Math.round(trendPerDecade * 100) / 100,
    trendLine: { slope: trendPerYear, intercept },
    delta: Math.round(delta * 10) / 10,
    earlyYears: [years[0], years[earlyCount - 1]],
    recentYears: [years[n - earlyCount], years[n - 1]],
    hottest: { year: years[hottestIdx], value: yearlyMean[hottestIdx] },
    coldest: { year: years[coldestIdx], value: yearlyMean[coldestIdx] },
    hotThen,
    hotNow,
    span: [years[0], years[n - 1]],
  };
}

function computeBaseline(years, values) {
  const idx = [];
  years.forEach((y, i) => {
    if (y >= 1951 && y <= 1980) idx.push(i);
  });
  if (idx.length >= 10) return meanOf(idx.map((i) => values[i]));
  return meanOf(values.slice(0, Math.min(10, values.length)));
}

function leastSquaresSlope(xs, ys) {
  const n = xs.length;
  const mx = meanOf(xs);
  const my = meanOf(ys);
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  return den === 0 ? 0 : num / den;
}

const meanOf = (a) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0);
const argmax = (a) => a.reduce((best, v, i) => (v > a[best] ? i : best), 0);
const argmin = (a) => a.reduce((best, v, i) => (v < a[best] ? i : best), 0);

// ---------------------------------------------------------------------------
// localStorage cache (best-effort; failures are non-fatal)
// ---------------------------------------------------------------------------
function readCache(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota or disabled storage — ignore */
  }
}
