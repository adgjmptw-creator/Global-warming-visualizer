// Bundled fallback climate data.
//
// Used when the live Open-Meteo API can't be reached (offline, network error,
// or restricted environments). The series are generated deterministically from
// realistic per-city parameters so the app can always tell its story. They are
// CLEARLY LABELLED as sample data in the UI and are NOT a substitute for the
// real, location-specific reanalysis data fetched from Open-Meteo in a browser.

const START_YEAR = 1950;
const END_YEAR = 2023;

// Deterministic pseudo-noise in [-1, 1] so the demo looks organic but is stable.
function noise(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

function buildSeries({ baseMean, warmingPerYear, hotBase, hotGrowth, seed }) {
  const years = [];
  const yearlyMean = [];
  const hotDays = [];
  for (let y = START_YEAR; y <= END_YEAR; y++) {
    const t = y - START_YEAR;
    years.push(y);
    const mean = baseMean + warmingPerYear * t + noise(y + seed) * 0.45;
    yearlyMean.push(Math.round(mean * 10) / 10);
    const hot = hotBase + hotGrowth * t + noise(y * 2 + seed) * 3.5;
    hotDays.push(Math.max(0, Math.round(hot)));
  }
  return { years, yearlyMean, hotDays };
}

// Each entry: a city we can demo without any network access.
export const SAMPLE_CITIES = [
  {
    label: 'Tokyo, Japan',
    latitude: 35.6895,
    longitude: 139.6917,
    ...buildSeries({ baseMean: 14.6, warmingPerYear: 0.033, hotBase: 28, hotGrowth: 0.42, seed: 11 }),
  },
  {
    label: 'London, United Kingdom',
    latitude: 51.5074,
    longitude: -0.1278,
    ...buildSeries({ baseMean: 10.1, warmingPerYear: 0.026, hotBase: 2, hotGrowth: 0.09, seed: 23 }),
  },
  {
    label: 'New York, United States',
    latitude: 40.7128,
    longitude: -74.006,
    ...buildSeries({ baseMean: 12.1, warmingPerYear: 0.024, hotBase: 11, hotGrowth: 0.16, seed: 37 }),
  },
  {
    label: 'Sydney, Australia',
    latitude: -33.8688,
    longitude: 151.2093,
    ...buildSeries({ baseMean: 17.9, warmingPerYear: 0.018, hotBase: 8, hotGrowth: 0.07, seed: 53 }),
  },
];

// Pick the bundled city nearest to the requested coordinates (for "use my
// location" / arbitrary searches when offline). Always returns something.
export function nearestSample(latitude, longitude) {
  let best = SAMPLE_CITIES[0];
  let bestDist = Infinity;
  for (const c of SAMPLE_CITIES) {
    const d = (c.latitude - latitude) ** 2 + (c.longitude - longitude) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return best;
}

export function sampleByLabel(label) {
  const needle = (label || '').toLowerCase();
  return SAMPLE_CITIES.find((c) => c.label.toLowerCase().includes(needle)) || null;
}
