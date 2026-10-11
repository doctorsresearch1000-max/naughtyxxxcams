# Entrega — Guía de lanzamiento 7 días (CSN OS)

## Fuentes TeleHub / operativas utilizadas

No hay un informe suelto «agente TeleHub» en el repo. El conocimiento operativo proviene de:

| Fuente | Uso en la guía |
|--------|----------------|
| `scripts/csn-task-manifest-v2.json` | Pasos, criterios, evidencias y prompts Cursor por tarea (28 tareas) |
| `scripts/csn-phase-runbooks.json` | Secuencias expireddomains.net, Wayback, gates, Cloudflare, GitHub Actions |
| `csn-os/lib/phases-meta.json` | Nombres y resúmenes en español de las 12 fases |
| `csn-os/standards/*.md` (9) | Referenciados vía ensamblador (`assemble-prompt.mjs`) |
| `csn-os/prompt-templates/execution-phase.md` | Estructura de prompts ejecutables |
| `csn-os/prompt-templates/blocked-planning.md` | Cuando faltan brief/repo |
| `docs/csn-prompt-system-final-report.md` | Separación definición vs tarea ejecución, gates manuales |
| `docs/csn-phase-handoff-contract.md` | Cierre de día / fase y evidencias |
| `csn-os/prompts/DEMO-QA-live-offline-profiles.md` | Ejemplo verificado de prompt técnico en stack Next.js/cams (repo) |
| Procedimientos CrakRevenue / Cloudflare | Tareas p06:01, p04:01 (manifest + estándares feed/secrets) |

## Información que faltaba

- **Transcripción literal del agente TeleHub** no está en el repositorio → no citada; sustituida por manifest + runbooks verificados en sandbox.
- **Vistas Notion filtradas** siguen siendo manuales (API limitada).
- **Tiempo real de compra DNS y deploy prod** → declarado como dependencia externa en cada día.

## Organización 7 días ↔ 12 fases

| Día | Fases CSN | Tareas (conteo) |
|-----|-----------|-----------------|
| 1 | 1 | 3 |
| 2 | 2, 3, 4 | 8 |
| 3 | 7 | 1 |
| 4 | 5 | 2 |
| 5 | 6 | 2 |
| 6 | 8, 9 | 4 |
| 7 | 10, 11, 12 | 8 |

Archivos generados: `csn-os/launch-guide/dia-01.md` … `dia-07.md`, `index.json`.

## Páginas Notion

Siete páginas hijas de la raíz canónica `3f684cd0-85ae-811f-a929-c4b4ccbcb56a`:

- Título: `Guía 7 días — Día N: …`
- Sincronización: `npm run csn:sync-7day-guide`
- URLs registradas en `scripts/notion-csn-isolated-manifest.json` → `launchGuide7Day.pages`

Portada actualizada a **hub v7** (`csn-hub-marker-v7-7day`): calendario + enlace Día 1.

## Prompts

Cada día incluye un bloque **Instrucciones para Cursor** por tarea del manifest (texto completo en español, placeholders `{{TU_LAUNCH_KEY}}`).

Para prompts **contextualizados** con brief/repo del proyecto: `/csn-console` → Preparar prompt (ensamblador existente).

## Pruebas QA

`npm run csn:7day-walkthrough` → `docs/csn-7day-guide-walkthrough.json`

## Limitaciones

- Notion no ejecuta formularios; la consola `/csn-console` sigue siendo la interfaz de acción (ya existente, no nueva infra).
- `npm run csn:sync-hub` puede sobrescribir la portada si se ejecuta después de `csn:sync-7day-guide`; usar **sync-7day-guide** como fuente de verdad de la portada.
