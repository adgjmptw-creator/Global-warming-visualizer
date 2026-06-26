// Rendering layer: all visuals drawn with native DOM / <canvas>, no libraries.
// The visual language (color + motion + one big number) carries the meaning so
// the story reads with little or no text.

// Diverging blue -> white -> red scale (Ed-Hawkins / RdBu style).
const SCALE = [
  [-1.0, [5, 48, 97]],
  [-0.6, [33, 102, 172]],
  [-0.3, [67, 147, 195]],
  [-0.1, [146, 197, 222]],
  [0.0, [247, 247, 247]],
  [0.1, [253, 219, 199]],
  [0.3, [244, 165, 130]],
  [0.6, [214, 96, 77]],
  [1.0, [103, 0, 31]],
];

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

// Map a temperature anomaly to a color, normalized by the local range.
export function stripeColor(anomaly, absMax) {
  const t = clamp(anomaly / absMax, -1, 1);
  for (let i = 0; i < SCALE.length - 1; i++) {
    const [t0, c0] = SCALE[i];
    const [t1, c1] = SCALE[i + 1];
    if (t >= t0 && t <= t1) {
      const f = (t - t0) / (t1 - t0 || 1);
      const r = Math.round(c0[0] + (c1[0] - c0[0]) * f);
      const g = Math.round(c0[1] + (c1[1] - c0[1]) * f);
      const b = Math.round(c0[2] + (c1[2] - c0[2]) * f);
      return `rgb(${r}, ${g}, ${b})`;
    }
  }
  const last = SCALE[SCALE.length - 1][1];
  return `rgb(${last[0]}, ${last[1]}, ${last[2]})`;
}

// --- Warming stripes -------------------------------------------------------
export function renderStripes(container, series, stats) {
  container.innerHTML = '';
  const track = document.createElement('div');
  track.className = 'stripes-track';

  const tooltip = document.createElement('div');
  tooltip.className = 'stripe-tooltip';
  tooltip.setAttribute('role', 'status');

  series.years.forEach((year, i) => {
    const anom = stats.anomalies[i];
    const stripe = document.createElement('div');
    stripe.className = 'stripe';
    stripe.style.setProperty('--i', i);
    stripe.style.setProperty('--stripe-color', stripeColor(anom, stats.absMaxAnom));
    stripe.tabIndex = 0;
    const sign = anom >= 0 ? '+' : '';
    const label = `${year}: ${series.yearlyMean[i].toFixed(1)}°C (${sign}${anom.toFixed(1)}° vs baseline)`;
    stripe.setAttribute('aria-label', label);

    const show = () => {
      tooltip.textContent = label;
      tooltip.classList.add('visible');
      const cRect = container.getBoundingClientRect();
      const sRect = stripe.getBoundingClientRect();
      const x = sRect.left - cRect.left + sRect.width / 2;
      tooltip.style.left = `${clamp(x, 60, cRect.width - 60)}px`;
    };
    stripe.addEventListener('mouseenter', show);
    stripe.addEventListener('focus', show);
    stripe.addEventListener('mouseleave', () => tooltip.classList.remove('visible'));
    stripe.addEventListener('blur', () => tooltip.classList.remove('visible'));
    track.appendChild(stripe);
  });

  container.appendChild(track);
  container.appendChild(tooltip);

  // End labels (first / last year) — minimal orientation, not required to "get it".
  const ends = document.createElement('div');
  ends.className = 'stripes-ends';
  ends.innerHTML = `<span>${series.years[0]}</span><span>${series.years[series.years.length - 1]}</span>`;
  container.appendChild(ends);

  // Trigger the left-to-right reveal on the next frame.
  requestAnimationFrame(() => track.classList.add('revealed'));
}

// --- Big verdict number ----------------------------------------------------
export function renderVerdict(els, stats) {
  const warmer = stats.delta >= 0;
  const arrow = warmer ? '▲' : '▼';
  const sign = warmer ? '+' : '−';
  els.arrow.textContent = arrow;
  els.number.textContent = `${sign}${Math.abs(stats.delta).toFixed(1)}°C`;
  els.root.classList.toggle('warmer', warmer);
  els.root.classList.toggle('cooler', !warmer);
  els.root.style.setProperty(
    '--verdict-color',
    warmer ? stripeColor(stats.absMaxAnom, stats.absMaxAnom) : stripeColor(-stats.absMaxAnom, stats.absMaxAnom)
  );
  els.caption.textContent =
    `${stats.earlyYears[0]}–${stats.earlyYears[1]} vs ${stats.recentYears[0]}–${stats.recentYears[1]} average`;
}

// --- Trend chart (canvas) --------------------------------------------------
export function renderTrendChart(canvas, series, stats) {
  const dpr = window.devicePixelRatio || 1;
  const cssW = canvas.clientWidth || 600;
  const cssH = canvas.clientHeight || 280;
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);

  const pad = { l: 44, r: 16, t: 16, b: 28 };
  const w = cssW - pad.l - pad.r;
  const h = cssH - pad.t - pad.b;

  const xs = series.years;
  const ys = series.yearlyMean;
  const xMin = xs[0];
  const xMax = xs[xs.length - 1];
  let yMin = Math.min(...ys);
  let yMax = Math.max(...ys);
  const yPadDeg = Math.max(0.5, (yMax - yMin) * 0.12);
  yMin -= yPadDeg;
  yMax += yPadDeg;

  const X = (yr) => pad.l + ((yr - xMin) / (xMax - xMin || 1)) * w;
  const Y = (t) => pad.t + (1 - (t - yMin) / (yMax - yMin || 1)) * h;

  const styles = getComputedStyle(document.documentElement);
  const grid = styles.getPropertyValue('--chart-grid').trim() || '#e2e6ee';
  const ink = styles.getPropertyValue('--chart-ink').trim() || '#9aa3b2';
  const lineCol = styles.getPropertyValue('--chart-line').trim() || '#5b6472';

  // Horizontal gridlines + temperature labels.
  ctx.font = '11px system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  const ticks = 4;
  for (let i = 0; i <= ticks; i++) {
    const t = yMin + ((yMax - yMin) * i) / ticks;
    const y = Y(t);
    ctx.strokeStyle = grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.l, y);
    ctx.lineTo(pad.l + w, y);
    ctx.stroke();
    ctx.fillStyle = ink;
    ctx.textAlign = 'right';
    ctx.fillText(`${t.toFixed(1)}°`, pad.l - 8, y);
  }

  // X labels: first & last year.
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(String(xMin), X(xMin), pad.t + h + 8);
  ctx.fillText(String(xMax), X(xMax), pad.t + h + 8);

  // Yearly line.
  ctx.strokeStyle = lineCol;
  ctx.lineWidth = 1.5;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  xs.forEach((yr, i) => {
    const px = X(yr);
    const py = Y(ys[i]);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.stroke();

  // Trend line (least squares) drawn bold in the warming color.
  const { slope, intercept } = stats.trendLine;
  const ty0 = slope * xMin + intercept;
  const ty1 = slope * xMax + intercept;
  ctx.strokeStyle = stats.trendPerDecade >= 0 ? '#d6604d' : '#2166ac';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(X(xMin), Y(ty0));
  ctx.lineTo(X(xMax), Y(ty1));
  ctx.stroke();

  // Hottest-year marker.
  const hi = series.years.indexOf(stats.hottest.year);
  if (hi >= 0) {
    ctx.fillStyle = '#67001f';
    ctx.beginPath();
    ctx.arc(X(stats.hottest.year), Y(series.yearlyMean[hi]), 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

// --- Scorching-days panel --------------------------------------------------
export function renderHotDays(container, stats) {
  const then = stats.hotThen;
  const now = stats.hotNow;
  const maxVal = Math.max(then, now, 1);
  container.innerHTML = '';

  const makeRow = (labelYears, count, accent) => {
    const row = document.createElement('div');
    row.className = 'hotday-row';
    const years = document.createElement('div');
    years.className = 'hotday-years';
    years.textContent = labelYears;
    const bar = document.createElement('div');
    bar.className = 'hotday-bar';
    const fill = document.createElement('div');
    fill.className = 'hotday-fill';
    fill.style.setProperty('--target', `${(count / maxVal) * 100}%`);
    if (accent) fill.classList.add('accent');
    const icon = document.createElement('span');
    icon.className = 'hotday-icon';
    icon.textContent = '☀️';
    fill.appendChild(icon);
    bar.appendChild(fill);
    const num = document.createElement('div');
    num.className = 'hotday-num';
    num.textContent = `${count}`;
    row.append(years, bar, num);
    return row;
  };

  const range = (a, b) => `${a}–${String(b).slice(2)}`;
  container.appendChild(makeRow(range(stats.earlyYears[0], stats.earlyYears[1]), then, false));
  container.appendChild(makeRow(range(stats.recentYears[0], stats.recentYears[1]), now, true));
  requestAnimationFrame(() => container.classList.add('revealed'));
}
