# NaughtyXxxCams — UI Skeleton (Next.js)

Esqueleto visual **TikTok-style** para NaughtyXxxCams.com. Datos **mock** únicamente — sin APIs, DB ni sitemaps en esta fase.

## Stack

- **Next.js 15** (App Router, `src/app`)
- **Tailwind CSS** — paleta neón `#0B0F19` / `#FF007F` / `#00F0FF`
- **lucide-react** — iconografía

## Rutas

| Ruta | Vista |
|------|--------|
| `/` | Feed vertical full-screen con scroll snap |
| `/explore` | Búsqueda, pills de categorías, grid Trending |
| `/following` | Carrusel Live Nearby + lista Your models |
| `/profile` | Cuenta Telegram mock, banner sponsored, Continue Watching |

## Desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Producción

```bash
npm run build
npm start
```

Las vistas principales exportan `dynamic = 'force-dynamic'` y `fetchCache = 'force-no-store'` para evitar prerender estático en Cloudflare/OpenNext.

## Cloudflare (OpenNext + Wrangler)

- `wrangler.jsonc` apunta a `.open-next/worker.js` y define `NEXT_CACHE_WORKERS_KV` (sustituye `cache_placeholder` por el ID real del namespace en tu cuenta).
- Tras `opennextjs-cloudflare build`, despliega con Wrangler usando ese manifiesto.

## Estructura de componentes

```
src/
  components/
    BottomNav.tsx
    BrandLogo.tsx
    feed/
    explore/
    following/
  data/mock.ts
  app/
```

Edita `src/data/mock.ts` para cambiar streams, trending y perfiles de prueba.

## Cloudflare Pages (opcional)

- **Build command:** `npm run build`
- **Output directory:** `.next` → usar adapter o export según tu pipeline; para Node estándar, despliega en Vercel/Node o configura `@cloudflare/next-on-pages`.
