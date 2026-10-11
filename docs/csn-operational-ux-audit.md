# Diagnóstico — flujo operativo CSN OS (pre-UX v5)

**Fecha:** 2026-10-11

## Recorrido real hoy (antes del rediseño v5)

| Paso | Qué hace el sistema | Intervención manual |
|------|---------------------|---------------------|
| 1. Registrar sitio | `createProject` crea fila CSN Sites + Project Run + 28 tareas ejecución | Operador ejecuta CLI o duplicaba filas en Notion |
| 2. Brief / repo | Campos en Notion o flags CLI | Sin brief → `blocked-planning` en prompts fase ≥2 |
| 3. Plan 12 fases | `getWorkPlan` lee tareas y fase actual del run | Solo lectura vía `plan` / `continuar` |
| 4. Siguiente tarea | Lógica nueva: `findNextTaskForRun` (fase actual, prioridad In progress → Not started) | No hay UI Notion; CLI `continuar` |
| 5. Prompt Cursor | `assemblePrompt` + publicación Notion | CLI; fase por defecto = fase recomendada del plan |
| 6. Resultado | `recordExecutionResult` → tareas + run | JSON con `executionStatus`; fallo → Blocked |
| 7. Avance fase | Solo si informe trae `advancePhase: true` y criterios | No automático por defecto |
| 8. Mantenimiento | Filas CSN Maintenance / Incidents por relación Site | **Sin workflow**; CLI `mantener` cuenta abiertas |

## Limitaciones (no simuladas)

- Notion no ejecuta Node: la portada muestra **instrucciones**, no botones.
- No hay wizard en Notion para recoger requisitos; `proyecto crear` + `validateIntake` avisan antes de bloqueos.
- **C. Mantener** no crea tareas de mejora; enlaza bases y resume conteos.
- Arquitectura / selección de stack no las genera el código; viven en brief y tareas del manifest.

## Cambios implementados (v5)

- Portada: **Centro de acciones** A / B / C; QA al final; sin demo LIVE/OFFLINE en flujo principal.
- CLI: `--launch-key`, comandos `continuar`, `proyectos`, `mantener`.
- Hub dinámico: lista proyectos **producción** con avance y enlaces a tarea/prompt.

## Validación (remoto, 2026-10-11)

| Prueba | Resultado |
|--------|-----------|
| Hub «Centro de acciones» v5 en Notion | OK (`csn-hub-marker-v5`) |
| `csn:verify-acceptance` | `allPass: true` |
| `csn:verify-ux-flow` (QA `e2e-qa-automation`) | `checks.allPass: true` |
| Legacy KPI/ops | Sin cambio de conteos |

Evidencia: `docs/csn-ux-flow-evidence.json`, `docs/csn-content-sanitize-applied.json`.

## Limitaciones restantes

- Portada lista proyectos **producción** dinámicamente; hoy hay 0 producción / 8 QA — sección B muestra mensaje orientativo hasta crear `--production=true`.
- Mantenimiento: solo consulta y enlaces; no genera backlog de mejoras.
- Notion sigue sin ejecutar comandos; el operador usa terminal (o copia la línea de la portada).
