import { notionLinks } from "../guide-context.mjs";
import { link, promptFence } from "../guide-sections.mjs";
import { PROMPT_PSEO_SCALE_RULES } from "../prompts-pseo.mjs";

export function renderDay06() {
  const u = notionLinks();
  const promptTech = `# Día 6 — SEO técnico en repo (inspección)

Repo: [URL]
Preview: [localhost:3000 o pages.dev]

Implementar o verificar en código:
- title/description por plantilla perfil y categoría
- canonical
- robots meta / noindex reglas perfiles no elegibles
- sitemap generation y exclusión thin/duplicados
- enlaces internos relacionados
- 404 slug inválido

Referencias útiles en este stack: src/lib/seo/, sitemap routes, profileContentQuality.

Etiqueta cada ítem: Implementado | Probado local | Documentado | Pendiente.
No afirmar indexación Google.`;

  return `# Día 6 — SEO técnico y reglas de indexación pSEO

## 1. Qué vas a conseguir hoy
- Reglas de **elegibilidad** antes de escalar URLs.
- Cambios o informe SEO técnico en repo.
- **Muestra 5 perfiles + 2 categorías** revisados (metadata + contenido).
- Sitemap plan en Knowledge (Unverified en GSC hasta captura).

## 2. Antes de empezar
- Feed Día 5 documentado.
- Preview local o pages.dev (ver Día 4).

## 3. Tiempo
- **4–6 h**

## 4. Pasos

### Paso 1 — Reglas escala pSEO
- **Qué:** Prompt §5A → Knowledge «pSEO — Reglas indexación».

### Paso 2 — SEO técnico código
- **Qué:** Prompt §5B; commits en repo si aplica.

### Paso 3 — SEO Opportunities
- **Qué:** ${link("SEO Opportunities", u.seoOpportunities)} ≥2 tareas técnicas (canonical, sitemap, etc.).

### Paso 4 — Backlink (identificar solo)
- **Qué:** ${link("Backlink Opportunities", u.backlinkOpportunities)} una oportunidad; gate Pending si pago.

### Paso 5 — Revisión muestra
- **Qué:** Lista URLs en run Notes; pass/fail por fila reglas Día 3.

## 5. Prompts

### 5A — Reglas indexación
${promptFence(PROMPT_PSEO_SCALE_RULES)}

### 5B — SEO técnico
${promptFence(promptTech)}

## 6. Respuesta Cursor
- Tabla regla → archivo → prueba local.

## 7. Comprobar
- [ ] Reglas escritas
- [ ] Muestra revisada
- [ ] Sitemap accesible en preview si implementado

## 8. Si falla
- Sin preview público: solo localhost + anotar limitación.

## 9. Pendiente
- GSC verificación externa.
`;
}
