// App controller: wires input (search / suggestions / geolocation / chips) to
// the data layer and the renderers, and manages loading / error / sample state.

import { geocode, fetchClimate, fallbackClimate, computeStats } from './climate.js';
import { renderStripes, renderVerdict, renderTrendChart, renderHotDays } from './render.js';
import { SUPPORTED, getLang, setLang, t, applyStatic, localizedCities } from './i18n.js';
import { shareResult } from './share.js';

const $ = (sel) => document.querySelector(sel);

const els = {
  body: document.body,
  langSelect: $('#lang-select'),
  searchInput: $('#search-input'),
  suggestions: $('#search-suggestions'),
  locateBtn: $('#locate-btn'),
  chips: $('#chips'),
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
  shareBtn: $('#share-btn'),
};

els.shareBtn.addEventListener('click', async () => {
  if (!current) return;
  els.shareBtn.disabled = true;
  try {
    await shareResult(current.series, current.stats, t);
  } finally {
    els.shareBtn.disabled = false;
  }
});

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
  const items = [...els.suggestions.querySelectorAll('.suggestion')];
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    if (!items.length) return;
    e.preventDefault();
    const dir = e.key === 'ArrowDown' ? 1 : -1;
    sugIdx = (sugIdx + dir + items.length) % items.length;
    items.forEach((el, i) => el.classList.toggle('active', i === sugIdx));
  } else if (e.key === 'Enter') {
    e.preventDefault();
    clearTimeout(debounceTimer);
    if (sugIdx >= 0 && items[sugIdx]) {
      items[sugIdx].click();
    } else {
      handleEnter(els.searchInput.value.trim());
    }
  } else if (e.key === 'Escape') {
    clearSuggestions();
  }
});

let sugIdx = -1;

document.addEventListener('click', (e) => {
  if (!els.suggestions.contains(e.target) && e.target !== els.searchInput) clearSuggestions();
});

async function showSuggestions(q) {
  try {
    const results = await geocode(q, getLang());
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
  sugIdx = -1;
}

async function handleEnter(q) {
  if (!q) return;
  clearSuggestions();
  try {
    const results = await geocode(q, getLang());
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
    loadLocation({ label: t('place.yourLocation'), isYourLocation: true, latitude: undefined, longitude: undefined }, { forceFallback: true });
    return;
  }
  els.locateBtn.classList.add('busy');
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      els.locateBtn.classList.remove('busy');
      loadLocation({
        label: t('place.yourLocation'),
        isYourLocation: true,
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
    },
    () => {
      els.locateBtn.classList.remove('busy');
      showError(t('error.locate'));
    },
    { timeout: 10000 }
  );
});

// Build the localized example chips for the current language.
function buildChips() {
  els.chips.innerHTML = '';
  localizedCities().forEach((c) => {
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.type = 'button';
    chip.textContent = c.short;
    chip.addEventListener('click', () => {
      loadLocation({ label: c.full, cityId: c.id, latitude: c.lat, longitude: c.lon });
    });
    els.chips.appendChild(chip);
  });
}

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
    current = { series, stats, place, isSample: usedFallback || series.source === 'sample' };
    paint(series, stats, current.isSample);
  } catch {
    showError(t('error.generic'));
  }
}

function paint(series, stats, isSample) {
  els.placeName.textContent = series.label;
  els.sampleNote.hidden = !isSample;

  // Reveal first so the canvas has its real layout width before we draw/scale it.
  hideOverlays();
  els.results.hidden = false;
  els.body.classList.add('has-results');

  renderStripes(els.stripes, series, stats, t);
  renderVerdict(
    { root: els.verdictRoot, arrow: els.verdictArrow, number: els.verdictNumber, caption: els.verdictCaption },
    stats,
    t
  );
  renderTrendChart(els.trendCanvas, series, stats);
  renderHotDays(els.hotdays, stats);

  const perDec = stats.trendPerDecade;
  const perDecStr = `${perDec >= 0 ? '+' : '−'}${Math.abs(perDec).toFixed(2)}`;
  els.trendCaption.textContent = t('trend.perDecade', { v: perDecStr });
  els.hotCaption.textContent = t('hot.caption', {
    a: stats.earlyYears[0],
    b: stats.earlyYears[1],
    c: stats.recentYears[0],
    d: stats.recentYears[1],
  });
  els.hottest.textContent = `${stats.hottest.year}`;
  els.baseline.textContent = `${stats.baseline.toFixed(1)}°C`;

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

// ---------------------------------------------------------------------------
// Language: build switcher, auto-detect/apply, re-render on change
// ---------------------------------------------------------------------------
function buildLangSwitcher() {
  els.langSelect.innerHTML = '';
  SUPPORTED.forEach((l) => {
    const opt = document.createElement('option');
    opt.value = l.code;
    opt.textContent = l.name;
    els.langSelect.appendChild(opt);
  });
  els.langSelect.value = getLang();
  els.langSelect.addEventListener('change', () => {
    setLang(els.langSelect.value);
    applyStatic();
    buildChips();
    // Re-render the current result so dynamic captions/tooltips re-translate.
    if (current) {
      relabelCurrent();
      paint(current.series, current.stats, current.isSample);
    }
  });
}

// Re-localize the result heading when the language changes (for places we can
// map back to a known name: example cities and "your location").
function relabelCurrent() {
  const p = current.place || {};
  if (p.cityId) {
    const c = localizedCities().find((x) => x.id === p.cityId);
    if (c) current.series.label = c.full;
  } else if (p.isYourLocation) {
    current.series.label = t('place.yourLocation');
  }
}

// Panels drift in as they enter the viewport, guiding the eye down the story.
function setupReveal() {
  const panels = document.querySelectorAll('.panel');
  if (!('IntersectionObserver' in window)) {
    panels.forEach((p) => p.classList.add('in-view'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('in-view');
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  panels.forEach((p) => io.observe(p));
}

function init() {
  buildLangSwitcher();
  applyStatic(); // auto-detected language on first load
  buildChips();
  setupReveal();
}

init();
