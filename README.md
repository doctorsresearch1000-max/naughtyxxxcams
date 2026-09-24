# NaughtyXxxCams — Mini App

Landing ultra-ligera para **NaughtyXxxCams.com**, orientada a **Core Web Vitals**, SEO técnico y despliegue en **Cloudflare Pages**.

## Estructura

```
├── config/seo.json          # Fuente única de title, description, OG, TeleHub URL
├── scripts/generate-seo.mjs # Genera HTML estático (crawler-friendly)
├── public/
│   ├── index.template.html  # Plantilla con placeholders {{…}}
│   ├── index.html           # Generado — no editar a mano
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── site.webmanifest
│   ├── _headers             # Cabeceras de caché/seguridad (Cloudflare Pages)
│   └── assets/
└── package.json
```

## Configuración rápida

1. Edita **`config/seo.json`**:
   - `telehubUrl` — enlace real de TeleHub
   - `domain`, `title`, `description`, `ogImage`
2. Añade **`public/assets/og-cover.jpg`** (1200×630) para vistas previas en redes.
3. Genera la home:

```bash
npm run build
```

## Desarrollo local

```bash
npm run dev
```

Abre `http://localhost:8787`.

## Cloudflare Pages

| Campo | Valor |
|--------|--------|
| **Framework preset** | None |
| **Build command** | `npm run build` |
| **Build output directory** | `public` |
| **Root directory** | `/` (raíz del repo) |

Tras conectar el repositorio, cada push a `main` desplegará la carpeta `public` con `index.html` ya inyectado.

### Dominio y SEO

- Actualiza `public/sitemap.xml` y `public/robots.txt` si cambias el dominio canónico.
- El canonical y Open Graph se sincronizan desde `config/seo.json` en cada build.

## Rendimiento

- CSS crítico inline (sin frameworks).
- Fuentes del sistema (sin descargas de webfonts).
- `preconnect` / `dns-prefetch` hacia TeleHub.
- Cabeceras de caché inmutables para `/assets/*` vía `_headers`.

## Licencia

Propiedad privada — uso interno NaughtyXxxCams.
