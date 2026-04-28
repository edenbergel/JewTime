# JewTime — זמנים

A Progressive Web App for halachic times (zmanim). Shows a live 24-hour circular clock with daytime, twilight, and night arcs, plus a card grid of all major zmanim for the day.

## Features

- **24-hour SVG clock** — gold arc for daytime, indigo for twilight, navy for night; tick marks for each zman in Hebrew
- **8 daily zmanim** — Alot HaShachar, Netz HaChamah, Sof Zman Shema (GRA), Chatzot, Mincha Gedola, Shkiat HaChamah, Tzeit HaKochavim, Chatzot Layla
- **Next zman highlight** — gold border and badge on whichever zman is coming up next
- **Live clock hand** — updates every second
- **City search** — type any city, pick from Nominatim/OpenStreetMap suggestions, timezone auto-resolved
- **GPS location** — one-tap button to use your device's position; falls back to Jerusalem if denied
- **PWA** — installable on iOS and Android, works fully offline after first load (zmanim are calculated client-side)
- **Frank Ruhl Libre** — Hebrew labels rendered in the classic Jewish typography font

## Stack

| Layer | Choice |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 |
| Zmanim | [kosher-zmanim](https://github.com/KosherJava/KosherZmanim) (GRA method) |
| Geocoding | [Nominatim](https://nominatim.openstreetmap.org/) (OpenStreetMap) |
| Timezone | [timeapi.io](https://timeapi.io/) |
| PWA | vite-plugin-pwa + Workbox |
| Fonts | Inter + Frank Ruhl Libre (Google Fonts) |

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
```

Output goes to `dist/`. The service worker and precache manifest are generated automatically by Workbox.

## Regenerating icons

Icons are generated from `public/icon.svg` using `@vite-pwa/assets-generator`:

```bash
npx @vite-pwa/assets-generator
```

This writes `pwa-64x64.png`, `pwa-192x192.png`, `pwa-512x512.png`, `maskable-icon-512x512.png`, `apple-touch-icon-180x180.png`, and `favicon.ico` into `public/`.

## Deployment

Deployed on Vercel. A `vercel.json` is included with:
- SPA rewrite (`/*` → `index.html`)
- `sw.js` and `manifest.webmanifest` served with `no-cache` so PWA updates ship immediately
- Hashed static assets served with `immutable` for maximum CDN cache efficiency

Every push to `main` triggers an automatic deploy.

## Halachic notes

All times follow the **GRA (Vilna Gaon)** method:
- Shaot zmaniyot = sunrise to sunset divided by 12
- Sof Zman Shema = 3 shaot zmaniyot after sunrise
- Chatzot Layla = solar midnight (solar noon + 12 hours)
- Tzeit = 3 stars visible (~8.5° below horizon, standard GRA opinion)

Times are for informational purposes. For halacha l'maaseh, consult a posek.
