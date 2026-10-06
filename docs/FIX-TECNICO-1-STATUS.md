# Fix Técnico 1 — estado de implementación

## Completado en código (pendiente deploy a Cloudflare)

| Auditoría | Implementación |
|-----------|----------------|
| Host canónico apex | `middleware` 308 www→apex; `next.config` redirect por host; `getSiteUrl()` sin www |
| Sitemap ↔ perfiles | Catálogo unificado 25×100 live/offline; slugs compartidos con lookup |
| 404 perfiles | Solo tras **lookup runtime** en layout/páginas (`resolveModelProfile` + `notFound()`). El manifest build-time es **solo sitemap**, no bloquea perfiles en edge. |
| Edge cache perfiles | `revalidate=300`, middleware + `next.config` Cache-Control (incl. intent) |
| APIs no cacheables | `Cache-Control: private, no-store` en middleware `/api/*` y `next.config` |
| `/telegram` en sitemap | Eliminado de explore sitemap; redirect 301 a `/profile` |
| robots/sitemap URL | `getSiteUrl()` normalizado; `robots.txt` estático (○) |

## Requiere panel Cloudflare (fuera del repo)

- Regla **Bulk Redirect** o DNS: asegurar que `www` llega al Worker (si solo apex está en Pages, el redirect middleware no corre en www).
- Validar tras deploy: `curl -sI https://www.naughtyxxxcams.com/` → 308 a apex.

## Deploy

```bash
export CLOUDFLARE_API_TOKEN='…'
export CLOUDFLARE_ACCOUNT_ID='bbdfc44e34ccb66212863e42a81d671e'
bash scripts/deploy-cloudflare.sh
```

OAuth local: `npx wrangler login` en la **misma máquina** que ejecuta el script.
