/** Prompts largos reutilizables (pSEO + plantilla perfil). Repo de referencia: stack Next.js en este monorepo. */

export const PROMPT_KEYWORD_RESEARCH = `# Día 3 — Investigación keywords long tail (pSEO cams)

## Objetivo
Producir un mapa de keywords y arquitectura de URLs para un sitio de webcam. Yo validaré volúmenes fuera de Cursor si hace falta.

## Lo que TÚ (Cursor) puedes hacer
- Inferir patrones de búsqueda del nicho a partir del brief y del código (categorías, atributos, slugs en repo).
- Leer rutas y componentes (ej. perfiles, categorías) si tengo repo abierto.
- Proponer familias de página, intención, URL patrón, riesgo de canibalización.
- Marcar cada fila: Fuente = repo | brief | hipótesis (requiere validación externa).

## Lo que NO debes hacer
- Inventar volúmenes de búsqueda, KD, tráfico o rankings de competidores.
- Afirmar que has consultado Google Search Console o Ahrefs.
- Listar miles de URLs sin justificar datos y utilidad.

## Contexto (editar antes de enviar)
- Brief y mercados/idiomas: [PEGAR DEL CUADERNO]
- Repo (si existe): [URL o ruta local]
- Competidores que YO nombre: [lista o «ninguno aún»]

## Entregables
1. Tabla: familia (directorio / categoría / perfil / otro), intención, ejemplo keyword long tail, URL patrón, plantilla, prioridad P0-P2, riesgo canibalización.
2. Reglas LIVE vs OFFLINE en URLs/títulos solo si los datos del feed lo permiten.
3. Lista de validaciones externas (GSC, búsqueda manual, herramienta SEO) sin inventar resultados.
4. Bloque «Qué pegar en CSN Knowledge» (markdown).`;

export const PROMPT_MASTER_PROFILE = `# Día 4 — Plantilla maestra de perfil de modelo

## Objetivo
Diseñar e implementar (o corregir) la plantilla reutilizable de perfil en el repositorio real. Trabajo en código; yo registro evidencia en Notion.

## Repositorio
[URL GITHUB — obligatorio para marcar «Implementado»]

## Archivos de referencia en este stack (inspeccionar, no asumir)
- src/lib/profile/modelProfile.ts — ModelProfileView, status live/offline
- src/components/profile/ModelProfileSlushyView.tsx — UI perfil
- src/lib/seo/model-profile-metadata.ts — metadata SEO
- src/lib/profile/useProfileStreamPlayer.ts — LIVE API cliente
- Rutas bajo src/app/ que sirven /model o perfil (buscar profileSlug)

## Requisitos de la plantilla
1. Identidad: nombre artístico, slug estable, sin inventar biografía factual.
2. LIVE/OFFLINE coherente entre badge, reproductor y metadata (documentar fuente de verdad).
3. Categorías/atributos solo si existen en datos del feed.
4. Title/description/canonical únicos por perfil; no duplicar solo cambiando nombre.
5. Estados vacíos: sin foto, sin categoría, modelo eliminado del feed.
6. Enlaces internos a categoría y perfiles relacionados con reglas claras.
7. Móvil y rendimiento: no cargar iframe live si offline.

## Alcance
- Editar solo archivos de perfil/SEO necesarios.
- Sin deploy, sin secretos, sin Notion API.

## Muestra antes de escalar
Implementar o verificar **3 perfiles** (1 live, 1 offline, 1 datos mínimos) con datos reales o mock QA etiquetado.

## Entregables
- Resumen de cambios y archivos tocados.
- Checklist: Implementado / Probado local / Solo documentado.
- Capturas o rutas locales a probar (ej. /model/[slug]).
- Texto para CSN Knowledge «Plantilla perfil v1».`;

export const PROMPT_PSEO_SCALE_RULES = `# Día 6 — Reglas de indexación y QA pSEO

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
- Entradas sugeridas para SEO Opportunities en Notion (sin afirmar indexación en Google)`;

export const PROMPT_DAY7_VALIDATION = `# Día 7 — Validación muestra pSEO + lanzamiento

## Objetivo
Validar muestra representativa y checklist de lanzamiento. Sin deploy producción.

## Preview
[URL localhost o pages.dev]

## Pruebas obligatorias (marcar cada una)
1. Home y navegación a categoría y perfil.
2. Perfil LIVE: badge y CTA coherentes.
3. Perfil OFFLINE: sin stream engañoso.
4. View-source o herramientas dev: title, canonical, meta robots en muestra.
5. Sitemap accesible si existe; contar que no incluya URLs bloqueadas.
6. Age gate y enlaces legales desde footer.
7. Enlaces afiliado no rotos (muestra).

## pSEO muestra
Revisar exactamente: [LISTA 3-5 URLs de perfiles + 2 categorías]

## Límites
- No afirmar indexación Google sin GSC.
- No deploy prod sin gate humano.

## Entregables
- Tabla pass/fail por prueba
- Decisión: listo para pedir deploy / necesita más trabajo / bloqueado por [razón]
- Texto Evidence URL y notas para Project Run`;
