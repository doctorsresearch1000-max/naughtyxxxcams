# Auditoría de usabilidad — guía 7 días (antes / después)

**Fecha:** 2026-10-11  
**Fuentes inspeccionadas:** `dia-01..07.md` (generación anterior), `launch-guide-builder.mjs`, `sync-launch-guide-notion.mjs`, `notion-root-hub.mjs`, `csn-task-manifest-v2.json`, `notion-csn-operational-complete.mjs` (TEMPLATE Domain candidate).

**TeleHub:** no hay informe ni conversación del agente TeleHub en el repositorio; no se atribuyen recomendaciones no verificadas.

## Problemas transversales (antes)

| Problema | Evidencia |
|----------|-----------|
| Texto en inglés mezclado con español | `dia-02.md` líneas 21–28, títulos de tarea en inglés |
| «Tablas indicadas» sin URL | Todas las jornadas generadas automáticamente |
| Consola `/csn-console` como camino principal | Sección obligatoria en cada día |
| Placeholders `{{TU_LAUNCH_KEY}}` en prompts | `dia-01.md` |
| Prompts que asumen Notion/API | «Registra en Notion» sin separar rol Cursor vs humano |
| Rúbrica Ahrefs / TEMPLATE como si existiera detalle | Manifest cita TEMPLATE; contenido real es una línea en setup script |
| Panel con consola primero y 14 DB implícitas | `notion-root-hub.mjs` v7 |
| Misma información triplicada (objetivo, pasos, criterios) | Estructura auto-generada |

## Evaluación por día

Criterios: **C** claridad · **P** pasos concretos · **R** prompt copiable · **A** accesos reales · **V** verificación · **E** errores · **F** fin de día

| Día | Antes (C P R A V E F) | Después (C P R A V E F) | Notas |
|-----|------------------------|-------------------------|-------|
| 1 | 2 2 2 3 3 2 3 | 5 5 5 5 5 4 5 | Notion manual con URLs manifest; prompt sin Notion |
| 2 | 1 2 2 2 2 2 2 | 5 5 5 5 5 5 5 | Glosario, Wayback, gate único, sin Ahrefs obligatorio |
| 3 | 2 2 2 3 2 2 3 | 4 4 4 5 4 4 4 | Legal = checklist, no asesoría |
| 4 | 2 2 2 4 3 2 3 | 4 5 4 5 5 4 4 | Distingue revisar CI vs deploy |
| 5 | 2 2 2 4 2 2 3 | 4 4 4 5 4 4 4 | Secretos solo nombres |
| 6 | 2 2 2 3 2 2 3 | 4 4 4 5 4 4 4 | GSC Unverified honesto |
| 7 | 2 2 2 3 3 2 3 | 4 5 4 5 5 4 5 | QA N/A prod gates |

Escala 1–5 (5 = usable por no técnico sin ayuda externa).

## Panel raíz (antes / después)

| Aspecto | Antes (v7) | Después (v8) |
|---------|------------|--------------|
| Mensaje principal | Callout técnico 12 fases | Título «GUÍA DE LANZAMIENTO» + recorrido 7 días |
| Primer paso | Consola /csn-console | Abrir Día 1 + 3 instrucciones |
| Listado 14 DB en cuerpo | Implícito «debajo de esta página» | Solo en referencia técnica (subconjunto + panel) |
| Bloqueos | No | Sección D con acciones concretas |
