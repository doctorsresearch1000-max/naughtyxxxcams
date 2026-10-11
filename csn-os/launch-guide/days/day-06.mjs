import { notionLinks } from "../guide-context.mjs";

export function renderDay06() {
  const n = notionLinks();
  return `# Día 6 — Prepara el SEO y evalúa autoridad

## 1. Qué vas a conseguir hoy

Al menos **dos oportunidades SEO** en Notion, un **plan de sitemap** (sin afirmar envío a Google si no lo verificaste) y **una oportunidad de backlink** identificada, con gate de pago en Pending si implica dinero.

## 2. Qué necesitas antes de empezar

- URL de staging o, en QA, URL de ejemplo acordada (ej. preview de Cloudflare).
- **SEO:** optimización para buscadores (títulos, URLs, sitemap).
- **GSC (Google Search Console):** herramienta gratuita de Google para ver indexación (opcional hoy).

## 3. Tiempo estimado y dependencias

| | |
|--|--|
| **Tiempo** | 3–5 horas |
| **Herramientas de pago** | Opcionales (Ahrefs, etc.) |

## 4. Pasos

### Paso 1 — Crear SEO Opportunities

- **Qué hacer:** [SEO Opportunities](${n.seoOpportunities}) → **New** (mínimo 2) · título, URL objetivo, prioridad · enlaza Site y Project Run.
- **Comprobar:** ≥2 filas.

### Paso 2 — Plan de sitemap en Knowledge

- **Qué hacer:** Artículo Runbook: URL del sitemap (ej. \`/sitemap.xml\`), pasos para enviarlo en GSC. Marca **Unverified** hasta tener captura de GSC.
- **Comprobar:** No dice «enviado» sin prueba.

### Paso 3 — Backlink identificado

- **Qué hacer:** [Backlink Opportunities](${n.backlinkOpportunities}) → **New** · sitio objetivo · notas de tráfico/DR si las tienes gratis · **Outreach** = Identified.
- **Comprobar:** No envías emails de pago sin gate.

### Paso 4 — Gate si el enlace es de pago

- **Qué hacer:** [Human Gates](${n.humanGates}) · **backlink** · Scope un placement · **Limits** USD · **Pending**.

## 5. Prompt listo para copiar en Cursor

\`\`\`
# Día 6 — SEO técnico en el repo (sin GSC remoto)

## Objetivo
Revisar el código para SEO on-page y proponer entradas para Notion.

## Contexto
- Repo: [URL]
- URL pública o preview: [URL]
- Nicho: [BRIEF]

## Tareas
1. Revisar metadata, sitemap, robots si existen en el repo.
2. Proponer ≥2 SEO Opportunities (título, URL, prioridad P0-P2).
3. Pasos para verificar sitemap (marcar Unverified si no puedes abrir GSC).
4. Una idea de backlink realista (sin contactar aún).

## Límites
- No afirmar posiciones en Google ni DR inventados.

## Entregables
Texto para pegar en SEO Opportunities y Knowledge.
\`\`\`

## 6. Qué revisar en la respuesta de Cursor

Éxito: referencias a archivos reales del repo. Fallo: métricas inventadas.

## 7. Cuándo terminar el día

- [ ] ≥2 SEO Opportunities.
- [ ] Plan sitemap documentado (Unverified si aplica).
- [ ] Backlink Opportunity + gate Pending si hay coste.

## 8. Qué queda pendiente

Outreach real, enlaces de pago, verificación GSC (días posteriores).
`;
}
