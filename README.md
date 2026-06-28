# Is It Getting Hotter Here? 🌡️

A neighborhood-scale global-warming visualizer. Type your town (or tap **📍 Use my
location**) and *see* — at a glance, with almost no text — whether it has actually been
getting hotter over the last ~70 years.

Global warming is usually told as a planetary story. This makes it **personal and local**:
your own place, your own warming stripes, your own number.

## What you see

1. **Warming stripes** — one colored bar per year (blue = cooler, red = hotter), the
   iconic [#ShowYourStripes](https://showyourstripes.info/) visual. The shift from blue to
   red reads instantly.
2. **One big number** — how much warmer (or cooler) recent years are versus mid-century,
   with an up/down arrow and color.
3. **Trend chart** — yearly average temperature with a least-squares trend line and a
   "°C per decade" figure.
4. **Scorching days** — days at or above 30 °C, then vs now — a tangible, everyday measure.
5. **Highlights** — hottest year on record and the 1951–1980 baseline.

You can also **scrub the trend chart** (hover or drag) to read any year's exact
temperature, open an optional explainer of what the stripes mean, and **save or
share** the result as an image card (uses the OS share sheet where available,
otherwise downloads a PNG).

## Languages

The UI is available in 11 languages (chosen for broad global reach): English,
中文 (Chinese), हिन्दी (Hindi), Español, العربية (Arabic, right-to-left),
Français, Português, Русский, Bahasa Indonesia, বাংলা (Bengali), and 日本語
(Japanese). The initial language is **auto-detected from the browser** and can be
changed with the 🌐 switcher (top corner); the choice is remembered. Place-name
search results are localized too (Open-Meteo geocoding `language` parameter).

All strings live in `js/i18n.js`. To add a language, append an entry to
`SUPPORTED`, add a matching block to `STRINGS` (and city names to `CITY_NAMES`).

## How it works

- **Pure static site** — plain HTML/CSS/vanilla JS, no build step, no framework, no backend.
- **Data is fetched client-side in your browser** from [Open-Meteo](https://open-meteo.com)
  (free, no API key, CORS-enabled):
  - **Geocoding API** turns a place name into coordinates.
  - **Historical Weather API** (ERA5 reanalysis) returns daily temperatures back to 1950,
    which the app aggregates into yearly means, anomalies, a trend, and hot-day counts.
- Results are cached in `localStorage` so revisiting a place is instant.
- If the live archive can't be reached, the app falls back to a small **bundled sample
  dataset** (clearly labelled) so it always renders something.

No accounts, no tracking, no server — everything happens in the browser.

## Run locally

```bash
# from the repo root
python3 -m http.server 8000
# then open http://localhost:8000
```

(Any static file server works. Opening `index.html` via `file://` won't work because the
app uses ES modules.)

## Deploy (GitHub Pages)

A workflow at `.github/workflows/deploy.yml` publishes the site automatically.

1. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Push to the development branch — the workflow uploads the repo root and deploys it.
3. The site goes live at `https://<user>.github.io/<repo>/`.

## Project layout

```
index.html            # markup: hero/search + results
styles.css            # all styling, color scale, animations, responsive
js/app.js             # controller: input → fetch → compute → render
js/climate.js         # Open-Meteo fetch, yearly aggregation, stats, caching
js/render.js          # warming stripes, canvas chart, scorching-days, verdict
js/sample-data.js     # bundled offline fallback dataset
.github/workflows/    # GitHub Pages deploy
```

## Credits

- Temperature data: **[Open-Meteo](https://open-meteo.com)** (ERA5 reanalysis).
- Warming-stripes color concept: **Ed Hawkins**, University of Reading
  ([#ShowYourStripes](https://showyourstripes.info/)).
