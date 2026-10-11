# Validación en Google Search Console (indexación)

## Qué corregimos

| Problema GSC | Causa | Corrección en código |
|--------------|--------|----------------------|
| **Rastreada: sin indexar** (~32 URLs tipo `/blowjobs-near-me`) | URLs spam del dominio antiguo; Google las sigue rastreando | **HTTP 410 Gone** + `X-Robots-Tag: noindex` en rutas raíz no válidas (`middleware.ts`) |
| **Página con redirección** | Cadenas `/category/...` → `/explore?cat=...` | Slugs desconocidos → **404**; catálogo válido → `/category/{slug}`; explore hub → `/explore/{slug}` |
| **Excluida por noindex** | 404 / páginas eliminadas | `not-found` con **solo** `noindex` (sin conflicto con `index` del layout) |

## Tras el deploy

1. **Comprobar en producción**
   - `curl -I https://naughtyxxxcams.com/blowjobs-near-me` → debe ser **410**
   - `curl -I https://naughtyxxxcams.com/category/blowjobs-near-me` → **404**
   - `curl -I "https://naughtyxxxcams.com/explore?cat=blowjobs-near-me"` → **308/301** a `/explore`
   - `/` y `/explore` y `/explore/latinas` → **200** con `robots: index`

2. **Search Console → Indexación de páginas**
   - Abre cada motivo (noindex, redirección, rastreada sin indexar).
   - Pulsa **Validar corrección** (solo después de que el deploy esté al **100%** en Cloudflare).

3. **Sitemap**
   - Enviar de nuevo `https://naughtyxxxcams.com/sitemap.xml` (Indexación → Sitemaps).

4. **Inspección de URL**
   - Probar `https://naughtyxxxcams.com/explore` → Solicitar indexación.
   - Probar un perfil indexable → Solicitar indexación.

La validación de GSC tarda **varios días**; las URLs 410 deberían pasar a “Excluida” o desaparecer del informe.
