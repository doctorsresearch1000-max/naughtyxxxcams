import { link } from "./guide-sections.mjs";
import { notionLinks } from "./guide-context.mjs";

export function notionOptionalBlock() {
  const u = notionLinks();
  return `
## Registro operativo en Notion (opcional — no bloquea el código)

Solo si tu equipo usa CSN para trazabilidad:

- ${link("Project Run", u.projectRuns)} — notas del día, Evidence URL cuando tengas preview.
- ${link("CSN Incidents", u.csnIncidents)} — bloqueos reales (sin API key, build roto).
- ${link("Human Gates", u.humanGates)} — compras, DNS prod, deploy prod (Pending hasta aprobación).

No crees filas antes de tener un resultado en el producto que registrar.
`;
}

export function promptFence(body) {
  return "```text\n" + body.trim() + "\n```";
}

export const VISUAL_OPTIONS = `
## Opciones de dirección de producto (elige UNA — no la elige Cursor)

**A. Directorio clásico** — Grid de tarjetas, LIVE/OFFLINE, filtros y categorías visibles. Mejor para pSEO y directorios.

**B. Tube site** — Grid denso, miniaturas grandes, categorías/etiquetas, páginas detalle. Descubrimiento visual.

**C. Descubrimiento tipo TikTok** — Mobile-first, tarjetas grandes o feed vertical. No asumir autoplay ni feed infinito sin datos del proveedor. Evaluar SEO desktop y rutas indexables.

**D. Híbrido** — Directorio SEO + módulo descubrimiento visual. Perfiles con CTA claro.

**E. Editorial / magazine** — Bloques destacados, menos densidad. Solo con estrategia editorial real.

Si no hay decisión documentada, **detente y pregunta al usuario** cuál opción (A–E) antes de implementar UI.
`;
