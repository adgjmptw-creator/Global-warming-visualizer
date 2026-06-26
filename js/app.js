// App controller: wires input (search / suggestions / geolocation / chips) to
// the data layer and the renderers, and manages loading / error / sample state.

import { geocode, fetchClimate, fallbackClimate, computeStats } from './climate.js';
import { renderStripes, renderVerdict, renderTrendChart, renderHotDays } from './render.js';

const $ = (sel) => document.querySelector(sel);

const els = {
  body: document.body,
  searchInput: $('#search-input'),
  suggestions: $('#search-suggestions'),
  locateBtn: $('#locate-btn'),
  chips: document.querySelectorAll('.chip'),
  loading: $('#loading'),
  error: $('#error'),
  errorRetry: $('#error-retry'),
  results: $('#results'),
  placeName: $('#place-name'),
  sampleNote: $('#sample-note'),
  stripes: $('#stripes'),
  verdictRoot: $('#verdict'),
  verdictArrow: $('#verdict-arrow'),
  verdictNumber: $('#verdict-number'),
  verdictCaption: $('#verdict-caption'),
  trendCanvas: $('#trend-chart'),
  trendCaption: $('#trend-caption'),
  hotdays: $('#hotdays'),
  hotCaption: $('#hot-caption'),
  hottest: $('#highlight-hottest'),
  baseline: $('#highlight-baseline'),
};

let current = null; // { series, stats } — kept for resize redraws

// ---------------------------------------------------------------------------
// Search & suggestions
// ---------------------------------------------------------------------------
let debounceTimer = null;
els.searchInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  const q = els.searchInput.value.trim();
  if (q.length < 2) {
    clearSuggestions();
    return;
  }
  debounceTimer = setTimeout(() => showSuggestions(q), 320);
});

els.searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    clearTimeout(debounceTimer);
    handleEnter(els.searchInput.value.trim());
  } else if (e.key === 'Escape') {
    clearSuggestions();
  }
});

document.addEventListener('click', (e) => {
  if (!els.suggestions.contains(e.target) && e.target !== els.searchInput) clearSuggestions();
});

async function showSuggestions(q) {
  try {
    const results = await geocode(q);
    if (!results.length) {
      clearSuggestions();
      return;
    }
    els.suggestions.innerHTML = '';
    results.forEach((r) => {
      const li = document.createElement('li');
      li.className = 'suggestion';
      li.textContent = r.label;
      li.tabIndex = 0;
      const pick = () => {
        els.searchInput.value = r.label;
        clearSuggestions();
        loadLocation(r);
      };
      li.addEventListener('click', pick);
      li.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') pick();
      });
      els.suggestions.appendChild(li);
    });
    els.suggestions.classList.add('open');
  } catch {
    clearSuggestions(); // offline: silently fall back to chips / Enter
  }
}

function clearSuggestions() {
  els.suggestions.innerHTML = '';
  els.suggestions.classList.remove('open');
}

async function handleEnter(q) {
  if (!q) return;
  clearSuggestions();
  try {
    const results = await geocode(q);
    if (results.length) {
      els.searchInput.value = results[0].label;
      loadLocation(results[0]);
      return;
    }
  } catch {
    /* fall through to fallback */
  }
  // No geocode (no match / offline): show sample data so the app still responds.
  loadLocation({ label: q, latitude: undefined, longitude: undefined }, { forceFallback: true });
}

// ---------------------------------------------------------------------------
// Geolocation & example chips
// ---------------------------------------------------------------------------
els.locateBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    loadLocation({ label: 'Your location', latitude: undefined, longitude: undefined }, { forceFallback: true });
    return;
  }
  els.locateBtn.classList.add('busy');
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      els.locateBtn.classList.remove('busy');
      loadLocation({
        label: 'Your location',
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
    },
    () => {
      els.locateBtn.classList.remove('busy');
      showError('Could not get your location. Try searching for a city instead.');
    },
    { timeout: 10000 }
  );
});

els.chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    loadLocation({
      label: chip.dataset.label,
      latitude: parseFloat(chip.dataset.lat),
      longitude: parseFloat(chip.dataset.lon),
    });
  });
});

els.errorRetry.addEventListener('click', () => {
  els.error.hidden = true;
  els.searchInput.focus();
});

// ---------------------------------------------------------------------------
// Core: load -> compute -> render
// ---------------------------------------------------------------------------
async function loadLocation(place, opts = {}) {
  showLoading();
  let series;
  let usedFallback = false;
  try {
    if (opts.forceFallback) throw new Error('fallback requested');
    series = await fetchClimate(place);
  } catch {
    series = fallbackClimate(place);
    usedFallback = true;
  }

  try {
    const stats = computeStats(series);
    current = { series, stats };
    paint(series, stats, usedFallback || series.source === 'sample');
  } catch {
    showError('Something went wrong building the chart. Please try another location.');
  }
}

function paint(series, stats, isSample) {
  els.placeName.textContent = series.label;
  els.sampleNote.hidden = !isSample;

  renderStripes(els.stripes, series, stats);
  renderVerdict(
    { root: els.verdictRoot, arrow: els.verdictArrow, number: els.verdictNumber, caption: els.verdictCaption },
    stats
  );
  renderTrendChart(els.trendCanvas, series, stats);
  renderHotDays(els.hotdays, stats);

  const perDec = stats.trendPerDecade;
  els.trendCaption.textContent =
    `${perDec >= 0 ? '+' : '−'}${Math.abs(perDec).toFixed(2)}°C per decade`;
  els.hotCaption.textContent =
    `Days at or above 30°C — ${stats.earlyYears[0]}–${stats.earlyYears[1]} vs ${stats.recentYears[0]}–${stats.recentYears[1]}`;
  els.hottest.textContent = `${stats.hottest.year}`;
  els.baseline.textContent = `${stats.baseline.toFixed(1)}°C`;

  hideOverlays();
  els.results.hidden = false;
  els.body.classList.add('has-results');
  els.results.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ---------------------------------------------------------------------------
// State helpers
// ---------------------------------------------------------------------------
function showLoading() {
  els.error.hidden = true;
  els.loading.hidden = false;
}
function hideOverlays() {
  els.loading.hidden = true;
  els.error.hidden = true;
}
function showError(msg) {
  els.loading.hidden = true;
  $('#error-message').textContent = msg;
  els.error.hidden = false;
}

// Redraw the canvas chart on resize (stripes/hot-days are CSS-fluid).
let resizeTimer = null;
window.addEventListener('resize', () => {
  if (!current) return;
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => renderTrendChart(els.trendCanvas, current.series, current.stats), 150);
});
