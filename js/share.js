// Build a self-contained "warming card" PNG and share it via the OS share sheet
// (Web Share API, with the image attached) or download it as a fallback.
// No libraries: the card is drawn directly on an offscreen canvas.

import { stripeColor } from './render.js';

const W = 1080;
const H = 1350;
const PAD = 72;

function fitFont(ctx, text, weight, startPx, maxWidth, minPx = 34) {
  let px = startPx;
  do {
    ctx.font = `${weight} ${px}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) break;
    px -= 2;
  } while (px > minPx);
  return px;
}

// Draw the shareable card and return the canvas.
export function renderShareCard(series, stats, t) {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const cx = W / 2;

  // Background.
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#11161f');
  bg.addColorStop(1, '#0b0e14');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = 'center';

  // Tagline (the headline question, with emphasis markup stripped).
  const tagline = t('hero.titleHTML').replace(/<\/?em>/g, '');
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#aab2c2';
  ctx.font = '400 40px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(tagline, cx, 130);

  // Place name (shrinks to fit).
  const px = fitFont(ctx, series.label, '800', 76, W - PAD * 2);
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 ${px}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText(series.label, cx, 220);

  // Warming stripes band.
  const bandX = PAD;
  const bandY = 280;
  const bandW = W - PAD * 2;
  const bandH = 430;
  const n = series.years.length;
  const sw = bandW / n;
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = stripeColor(stats.anomalies[i], stats.absMaxAnom);
    // +1 avoids hairline gaps between stripes.
    ctx.fillRect(bandX + i * sw, bandY, Math.ceil(sw) + 1, bandH);
  }
  // Year endpoints under the band.
  ctx.fillStyle = '#8a93a4';
  ctx.font = '400 30px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(String(series.years[0]), bandX, bandY + bandH + 44);
  ctx.textAlign = 'right';
  ctx.fillText(String(series.years[n - 1]), bandX + bandW, bandY + bandH + 44);

  // Big verdict number.
  const warmer = stats.delta >= 0;
  const verdict = `${warmer ? '▲ +' : '▼ −'}${Math.abs(stats.delta).toFixed(1)}°C`;
  ctx.textAlign = 'center';
  ctx.fillStyle = warmer ? '#ff5a4d' : '#4da3ff';
  ctx.font = '800 150px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(verdict, cx, 940);

  // Captions: which periods, and per-decade trend.
  ctx.fillStyle = '#c2cad6';
  ctx.font = '400 36px system-ui, sans-serif';
  const cap = t('verdict.caption', {
    a: stats.earlyYears[0],
    b: stats.earlyYears[1],
    c: stats.recentYears[0],
    d: stats.recentYears[1],
  });
  ctx.fillText(cap, cx, 1010);

  const perDec = stats.trendPerDecade;
  const perDecStr = `${perDec >= 0 ? '+' : '−'}${Math.abs(perDec).toFixed(2)}`;
  ctx.fillStyle = '#8a93a4';
  ctx.font = '400 32px system-ui, sans-serif';
  ctx.fillText(t('trend.perDecade', { v: perDecStr }), cx, 1062);

  // Footer: site URL + attribution.
  const url = location.host + location.pathname.replace(/\/$/, '');
  ctx.fillStyle = '#aab2c2';
  ctx.font = '600 32px system-ui, sans-serif';
  ctx.fillText(url, cx, 1270);
  ctx.fillStyle = '#6f7888';
  ctx.font = '400 26px system-ui, sans-serif';
  ctx.fillText('Data: Open-Meteo (ERA5) · Colors: #ShowYourStripes', cx, 1312);

  return canvas;
}

function slug(label) {
  return (label || 'place')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'place';
}

function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

// Share via the OS share sheet (image attached) or fall back to a download.
export async function shareResult(series, stats, t) {
  const canvas = renderShareCard(series, stats, t);
  const blob = await canvasToBlob(canvas);
  if (!blob) return;
  const filename = `warming-${slug(series.label)}.png`;
  const url = location.origin + location.pathname;
  const file = new File([blob], filename, { type: 'image/png' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: t('meta.title'), text: `${t('share.text')} ${url}` });
      return;
    } catch (e) {
      if (e && e.name === 'AbortError') return; // user dismissed the sheet
      // otherwise fall through to download
    }
  }

  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}
