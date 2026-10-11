import { notionLinks } from "../guide-context.mjs";
import { link, promptFence } from "../guide-sections.mjs";
import { PROMPT_KEYWORD_RESEARCH } from "../prompts-pseo.mjs";

export function renderDay03() {
  const u = notionLinks();
  const promptArch = `# Día 3 — Arquitectura pSEO (familias de página)

Basado en el mapa de keywords ya acordado.

Define para cada familia (directorio, categoría, subcategoría, perfil, búsqueda solo si útil):
- Intención búsqueda
- Patrón URL (ej. /c/[slug], /model/[slug])
- Fuente datos (feed campo X)
- Plantilla React/route
- Enlaces internos entrantes/salientes
- Index: sí/no/condicional
- Riesgos: thin, duplicado, canibalización

NO generar todas las combinaciones de filtros. NO inventar volúmenes.
Entrega: tabla + diagrama texto + política LIVE/OFFLINE en SERP si aplica.`;

  const promptLegal = `# Día 3 — Checklist legal y wireframe (documentación)

Brief: [cuaderno]
Repo si existe: [URL]

Mapa páginas + menú texto + checklist age/privacy/terms/2257 (marcar revisión legal humana).
No asesoría jurídica definitiva.`;

  return `# Día 3 — Keywords, arquitectura pSEO y diseño

## 1. Qué vas a conseguir hoy
- **Mapa keywords long tail** con familias y prioridades (sin volúmenes inventados).
- **Arquitectura pSEO** (URLs, plantillas, indexación).
- **Wireframe** navegación + checklist legal en ${link("CSN Knowledge", u.csnKnowledge)}.
- Decisión qué familias existen (directorio, categoría, perfil; filtros solo si aportan).

## 2. Antes de empezar
- Cuaderno Día 1.
- Opcional: repo clonado para que Cursor lea rutas reales.

## 3. Tiempo
- **4–6 h** (investigación + documentación).
- No depende de dominio comprado.

## 4. Pasos

### Paso 1 — Investigación keywords (Cursor)
- **Qué:** Ejecutar prompt §5A; pegar resultado en Knowledge «pSEO — Mapa keywords».
- **Comprobar:** Cada fila tiene fuente (repo/brief/hipótesis).
- **Si falla:** sin repo, usar solo brief y marcar hipótesis.

### Paso 2 — Arquitectura pSEO
- **Qué:** Prompt §5B → artículo «pSEO — Arquitectura URLs».
- **Comprobar:** Reglas anti-canibalización escritas.

### Paso 3 — Wireframe y legales
- **Qué:** Prompt §5C → Policy «Checklist legal y páginas».
- **Dónde:** ${link("CSN Knowledge", u.csnKnowledge)}

### Paso 4 — SEO Opportunities (mínimo 2)
- **Qué:** ${link("SEO Opportunities", u.seoOpportunities)} desde ideas del mapa (título, URL objetivo, prioridad).

### Paso 5 — Notion run
- **Qué:** Current Phase 7 cuando Knowledge tenga los tres artículos.

## 5. Prompts

### 5A — Keywords long tail
${promptFence(PROMPT_KEYWORD_RESEARCH)}

### 5B — Arquitectura
${promptFence(promptArch)}

### 5C — Legal + wireframe
${promptFence(promptLegal)}

## 6. Respuesta Cursor
- Tablas markdown listas para Knowledge; sin métricas falsas.

## 7. Comprobar
- [ ] Mapa keywords + arquitectura + legal
- [ ] ≥2 SEO Opportunities
- [ ] LIVE/OFFLINE documentado si aplica

## 8. Si falla
- Sin repo: arquitectura provisional; marcar «validar con código Día 4».

## 9. Pendiente
- Implementación plantillas → Día 4.
`;
}
