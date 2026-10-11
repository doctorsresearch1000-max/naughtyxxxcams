# Día 6 — SEO técnico y reglas de indexación pSEO

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
- **Qué:** [SEO Opportunities](https://app.notion.com/p/050ba07cbe8f45ca93fa9bb30d9ed739) ≥2 tareas técnicas (canonical, sitemap, etc.).

### Paso 4 — Backlink (identificar solo)
- **Qué:** [Backlink Opportunities](https://app.notion.com/p/ff38edc78b1d43ceb6926c630058066e) una oportunidad; gate Pending si pago.

### Paso 5 — Revisión muestra
- **Qué:** Lista URLs en run Notes; pass/fail por fila reglas Día 3.

## 5. Prompts

### 5A — Reglas indexación
```text
# Día 6 — Reglas de indexación y QA pSEO

## Objetivo
Definir y verificar reglas antes de escalar miles de URLs. Inspeccionar el repo.

## Repo y preview
- Repo: [URL]
- Preview local o pages.dev: [URL o «solo localhost»]

## Comprobaciones en código
- robots.txt / meta robots en plantillas
- sitemap: solo URLs canónicas elegibles
- canonical en perfil y categoría
- detección duplicados / thin content (helpers existentes, ej. profileContentQuality)
- HTTP 404 para slugs inexistentes
- JSON-LD si existe, sin inventar campos

## Reglas de elegibilidad (documentar, no imponer conteo de palabras fijo)
- Datos mínimos por perfil para indexar
- Perfiles offline/eliminados: noindex o 404 según política
- Categorías vacías: no generar

## Entregables
- Tabla regla → dónde se implementa (archivo) → cómo probar localmente
- Lista URLs de muestra (5 perfiles + 2 categorías) para revisión manual
- Entradas sugeridas para SEO Opportunities en Notion (sin afirmar indexación en Google)
```

### 5B — SEO técnico
```text
# Día 6 — SEO técnico en repo (inspección)

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
No afirmar indexación Google.
```

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
