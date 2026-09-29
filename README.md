# NaughtyXXXCams

Live cam discovery on **Next.js 15** (App Router) with Streamate/CrakRevenue catalog data, in-feed Jerkmate promos, and device-local collections synced via Telegram auth.

## Architecture (current)

| Area | Behavior |
|------|----------|
| **Home (`/`)** | Responsive dense grid (CAMB3-style): `MobileHomeDenseGrid` on small screens, `HomeTubeGrid` on desktop. SSR bootstrap via `HomeFeedServerBridge` + optional client warm (`HomeFeedWarm`). |
| **In-feed ads** | Native Jerkmate slots (`JerkmateTubeAdCard`) with logo watermark, sponsored overlays, and tracking URL. |
| **Collections** | Save-to-collection modal (`SaveToCollectionProvider`, `AddToCollectionModal`); bookmarks in `localStorage` with `nx-library-update` events. Grid/profile hearts use the same flow (`CardBookmarkButton`). |
| **Explore (`/explore`)** | Category search + grid; explore bootstrap prefetched on `/explore` (`ExploreBootstrapWarm` / `ExplorePageClient`), not from global bottom chrome. |
| **Compliance** | 18+ age gate (`AgeGate`) — confirmation stored as `localStorage.age_verified = 'true'`. |
| **Legacy feed** | `HomeVerticalFeed` (TikTok-style vertical snap) is **not** the home route; kept for reference only. |

## Stack

- **Next.js 15** + **Tailwind CSS**
- **OpenNext / Cloudflare Workers** (`wrangler.jsonc`, KV cache namespace)
- **Telegram** login for cross-session library sync

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production

```bash
npm run build
npm start
```

For Cloudflare: `opennextjs-cloudflare build` then deploy with Wrangler per `wrangler.jsonc`.

Key routes use `dynamic = 'force-dynamic'` where needed to avoid stale prerender on the edge.

## Project layout (high level)

```
src/
  app/                 # App Router pages
  components/
    home/              # Dense mobile home grid + cards
    cams/              # Tube cards, meta, platform badges, bookmarks
    collections/       # Save modal + provider
    compliance/        # Age gate
    ads/               # Jerkmate in-grid creatives
  lib/
    feed/              # Filtering, prefetch, bootstrap
    media/             # Card meta, synthetic view counts, CDN helpers
    user/              # Bookmarks, playlists, saved model refs
public/
  logos/jerkmate.png   # Jerkmate watermark for ad/catalog badges
```

## Scripts

- `npm run test:ads` — ad creative / policy checks
- `npm run build:next` — Next production build (used in CI)
