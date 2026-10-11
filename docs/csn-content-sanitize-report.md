# Auditoría y saneamiento — Cam Sites — SOP System

**Fecha:** 2026-10-11  
**Estado final:** **Bloqueado (parcial en repo)** — la integración Notion «Cursor Connection» no puede leer el stack canónico; correcciones de hub/etiquetas QA en Notion pendientes de re-share.

**Evidencias en repo:**

| Artefacto | Ruta |
|-----------|------|
| Auditoría local + intento remoto | `docs/csn-content-audit-raw.json` |
| Saneamiento aplicado (vacío si API bloqueada) | `docs/csn-content-sanitize-applied.json` |
| Aceptación / API | `docs/csn-acceptance-report.json` (`blocked: true`) |
| Última evidencia hub OK | `docs/csn-hub-integration-evidence.json` (2026-10-11 09:10 UTC) |
| Inventario canónico previo | `scripts/notion-csn-canonical-audit.json` |

---

## 1. Páginas y registros QA identificados

| Elemento | ID / clave | Categoría | Notas |
|----------|------------|-----------|--------|
| **Cam Sites — SOP System** (entrada canónica) | `3f684cd0-85ae-811f-a929-c4b4ccbcb56a` | Operativo | Hub A–G; 14 DB inline. API: **no accesible** ahora. |
| Raíz duplicada obsoleta | `3f684cd0-85ae-8115-841a-c9dc40395c58` | Duplicado / interno | Título «OBSOLETO — copia parcial»; API **sí** accesible. |
| Stack duplicado vacío (3 DB) | `95d161c2-…`, `4aa293a5-…`, `fc7a5d12-…` | Duplicado obsoleto | Sin filas; no usar. |
| **DEMO QA — LIVE/OFFLINE** | `csn:run:demo-qa-live-offline` / launch `demo-qa-live-offline` | QA/demo | 3 prompts publicados (evidencia en `csn-hub-integration-evidence.json`). |
| **FICTIONAL-SANDBOX-PROMPT-QA** | `csn:run:fictional-sandbox-prompt-qa` | QA/demo | Sandbox de ensamblado de prompts. |
| **QA-SANDBOX-NOTION** | `csn:qa-sandbox-notion:launch:v1` / `qa-sandbox-notion-launch-v1` | QA/demo | Idempotencia stage-c. |
| **E2E QA** (múltiples) | `csn:run:e2e-qa-<timestamp>` | QA/demo | Proliferación por `Date.now()` en E2E; **corregido en repo** → `e2e-qa-automation`. |
| Registros «E2E QA …» en Tasks | p. ej. `csn:taskrun:csn:run:e2e-qa-1791707778677:…` | QA/demo | ~100 taskruns en auditoría previa; mantener, filtrar por run. |
| **12-Phase Operational Runbooks** | `3f684cd0-85ae-81c4-86c9-f909182fa38c` | Operativo | Referencia por fase; no sustituye prompts de tarea. |
| **CSN OS Panel** | `3f684cd0-85ae-81ba-ab3f-db738b779058` | Interno/técnico | Rutas demo/panel secundarias; desplazado a sección G del hub. |
| Plantilla **blocked-planning** | `csn-os/prompt-templates/blocked-planning.md` | Interno/técnico | Emite lista de faltantes; no ejecutable hasta completar datos. |
| Plantilla **execution-phase** | `csn-os/prompt-templates/execution-phase.md` | Operativo | Prompt genérico por fase cuando no hay override. |
| Standards **Human Approval** / **Documentation and Evidence** | repo `csn-os/standards/*.md` | Operativo | Filas en SOP Versions / Knowledge; no son prompts Cursor. |
| **Master SOP v1 (Isolated)** | fila SOP Versions (stage-c) | Documentación | Bundle/catálogo; checklist en raíz sustituido por hub ES (informe integración). |

---

## 2. Vacíos, incompletos o redundantes

| Elemento | Problema | Clasificación |
|----------|----------|----------------|
| **Phase 1–12 Specification** (Notion SOP Versions) | Cuerpo en Notion a menudo vacío o solo metadata; fuente real `csn-os/phase-specs/phase-NN.md` | No son prompts vacíos ejecutables — **catálogo**. Hub v4 aclara esto. |
| Phase specs (repo) | `Work sequence` genérico en las 12 fases | Incompleto como prompt; **correcto** como spec — detalle en Tasks + manifest v2. |
| Tareas sin override | Usan `execution-phase.md` + campos Instructions en Notion | Operativo si Instructions/Acceptance rellenos; si no, `blocked-planning`. |
| Overrides QA (3 archivos) | Completos (>200 chars) | Operativo para demo/QA. |
| Hub sección D (antigua) | Mezclaba prompts QA en flujo principal | Redundante con C+E — **reorganizado** a G en código (`csn-hub-marker-v4`). |
| Raíz duplicada `…5c58` | Misma intención que canónica | Duplicado — conservada, renombrada OBSOLETO. |
| Muchos runs `e2e-qa-*` | Misma función, distintos timestamps | Duplicado operativo de prueba — no borrar; etiquetar QA + E2E idempotente. |

---

## 3. Correcciones aplicadas (con IDs)

| Corrección | ID / referencia | Verificado en Notion |
|------------|-----------------|----------------------|
| Hub navegación: QA fuera del flujo principal (sección G), callout Phase Spec ≠ prompt | `csn-hub-marker-v4` en `csn-os/lib/notion-root-hub.mjs` | **No** — requiere `npm run csn:content-sanitize` o `csn:sync-hub` tras re-share |
| E2E idempotente `e2e-qa-automation` | `scripts/csn-e2e-operational.mjs` | **No** — E2E no ejecutado (API) |
| Script auditoría `csn:content-audit` | `docs/csn-content-audit-raw.json` | Local **sí** |
| Script saneamiento QA tags + hub | `scripts/csn-content-sanitize.mjs` | **Pendiente** (API) |
| Aceptación con fallo explícito si API caída | `docs/csn-acceptance-report.json` | **Sí** (blocked documentado) |

---

## 4. Conservado y por qué

- **14 bases CSN** y relaciones existentes — requisito del sistema.
- **Registros E2E/QA históricos** — evidencia y pruebas; separación vía `Record Class` / `Run Type` / filtros de vista.
- **Legacy OPERATIONS, KPI History, etc.** — no modificados (conteos intactos en última corrida conocida).
- **Tres prompts demo publicados** — necesarios para cadena tarea → prompt verificada anteriormente.
- **Página OBSOLETO** — evita confusión sin borrar contenido.

---

## 5. Resultado pruebas flujo completo

| Paso | Resultado | Evidencia |
|------|-----------|-----------|
| 1. Sitio QA aislado | No re-ejecutado | API bloqueada |
| 2. Plan técnico / dependencias | No re-ejecutado | — |
| 3. Prompt específico en tarea | Última OK 09:10 UTC | `csn-hub-integration-evidence.json` |
| 4. Éxito + evidencias | Última OK en integración previa | `csn-demo-flow-evidence.json` |
| 5. Fallo → Blocked | Implementado en `workflow.mjs` | No re-verificado hoy |
| 6. No avanzar fase sin criterios | `checkPhaseReadiness` | No re-verificado hoy |
| 7. Re-sync sin duplicar | Hub idempotente por marcador | No re-verificado hoy |

**Comandos tras restaurar API:**

```bash
npm run csn:content-sanitize   # etiquetas QA + hub v4
npm run csn:verify-acceptance
npm run csn:e2e
npm run csn:content-sanitize   # segunda pasada idempotencia hub/tags
```

---

## 6. Bloqueos que requieren decisión humana

1. **Re-share Notion:** página [Cam Sites — SOP System](https://app.notion.com/p/Cam-Sites-SOP-System-3f684cd085ae811fa929c4b4ccbcb56a) y las 14 bases hijas con la integración **Cursor Connection** (integration_id `3f584cd0-85ae-810b-9426-0027a382248e`).
2. **Producción real:** ningún sitio `Record Class = Production` auditado hoy; confirmar nombres/launch keys antes de operar.
3. **Limpieza opcional de runs E2E legacy:** solo archivar en vistas Notion, no borrar filas (política del encargo).
4. **Contenido técnico en Phase specs:** ampliar `Work sequence` por fase solo si el operador quiere más detalle en catálogo (no sustituye tareas).

---

## 7. Estado final

| Dimensión | Estado |
|-----------|--------|
| Modelo operativo (repo + diseño Notion) | **Parcialmente operativo** |
| Contenido Notion remoto verificado hoy | **Bloqueado** (API) |
| Navegación hub | **Lista en código**; aplicación pendiente |
| Separación QA | **Lógica lista** (`classifyRowLocal`, filtros documentados); etiquetado remoto pendiente |
| Prompts vacíos presentados como ejecutables | **Mitigado** (`blocked-planning`, overrides, callout Phase Spec) |

**Prompts ejecutables conocidos (última verificación remota):**

- `csn:taskrun:csn:run:demo-qa-live-offline:demo-live-offline-v1`
- `csn:taskrun:csn:run:demo-qa-live-offline:p05:02`
- `csn:taskrun:csn:run:demo-qa-live-offline:p06:01`

URLs en `docs/csn-acceptance-report.json` (histórico) y `docs/csn-hub-integration-evidence.json`.
