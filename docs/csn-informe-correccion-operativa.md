# Informe — Corrección del flujo operativo CSN OS

**Fecha:** 2026-10-11

## Fase 1 — Diagnóstico (estado inicial)

| Área | Hallazgo |
|------|----------|
| **Funciona** | Generador `assemble-prompt`, 12 phase-specs en repo, taskdef/taskrun, raíz canónica con datos |
| **Desconectado** | Sin página de panel en Notion; sin CLI unificada; usuario debía conocer varios scripts |
| **Falta** | Crear proyecto guiado, plan por fases en español, registrar resultados, readiness antes del prompt |
| **Confuso** | Segunda raíz parcial (3 DB); tareas mezcladas sin `Record Type` visible en flujo |
| **Duplicado** | Raíz `…8115…` — no usar |

## Fase 2 — Cambios realizados

- **CLI `npm run csn`** — `proyecto crear`, `plan`, `prompt`, `resultado`, `schema`, `panel`, `diagnostico`
- **Panel Notion** — [CSN OS — Panel de proyectos](https://app.notion.com/p/CSN-OS-Panel-de-proyectos-3f684cd085ae81baab3fdb738b779058) con secciones 1–4 y enlaces a DBs
- **Campos operativos** — Nicho, Stack, Monetización, Estado del proyecto, Objetivo; Último informe ejecución, Estado verificación
- **Generador** — Incorpora readiness, tareas de ejecución de la fase, nota de bloqueo
- **Guía** — `docs/GUIA-CSN-OS.md`

## Fase 3 — Pruebas

```bash
npm run csn:e2e   # PASS (casos A–H sandbox)
```

## Fase 4 — Verificación

- Legacy DB counts sin cambios en E2E
- Proyectos QA con `Record Class` = QA test-only
- Gates: documentados como control manual en panel y prompts

## Fase 5 — Limitaciones que permanecen

1. **Notion no genera prompts** — obligatorio usar terminal (`npm run csn -- prompt …`).
2. **Vistas filtradas** — API `views.create` no validada; configurar manualmente filtros QA en UI.
3. **Human Gates** — no bloquean CI/registrador.
4. **Contenido de fases** — mejorado en ensamblador; ampliar textos en `phase-specs` según proyectos reales.

## Próxima acción recomendada

1. Abrir el **Panel de proyectos** en Notion.
2. `npm run csn -- proyecto crear` con datos de un sitio real (o QA).
3. Completar **Project Brief** y **Repository URL** en Notion.
4. `npm run csn -- plan` → `prompt --phase=N --print` → Cursor → `resultado --json=…`
