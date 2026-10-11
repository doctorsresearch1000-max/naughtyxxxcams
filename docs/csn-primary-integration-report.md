# Integración CSN OS en «Cam Sites — SOP System»

## Página principal identificada (API + capturas)

| Campo | Valor |
|--------|--------|
| **Título** | Cam Sites — SOP System |
| **ID** | `3f684cd0-85ae-811f-a929-c4b4ccbcb56a` |
| **URL** | https://app.notion.com/p/Cam-Sites-SOP-System-3f684cd085ae811fa929c4b4ccbcb56a |
| **Icono** | 🎥 (API) |

**Criterio de coincidencia con capturas:** las 14 bases de datos inline en el mismo orden (CSN Sites → Human Gates), más el callout de aislamiento (ahora en español). Antes el título API era «Cam Site Network OS — SOP System (Isolated)»; se alineó con el nombre de la captura sin crear página nueva.

**Duplicado desambiguado:** `3f684cd0-85ae-8115-841a-c9dc40395c58` → título «OBSOLETO — copia parcial CSN OS (no usar)».

**Nota:** la integración no tiene acceso de búsqueda a «Command Centre»; el padre API sigue siendo la página CloudFlare Pages (`3f484cd0-85ae-8032-bff1-c16e871e6357`), con índice al inicio que enlaza la entrada principal.

## Reutilizado (sin nuevas raíces ni DBs)

- 14 bases de datos existentes en la misma página.
- Runbooks (`runbookPageId`), panel secundario, prompts bajo tareas.
- Scripts: `assemble-prompt`, `publish-prompt-notion`, `csn-sync-hub`, `workflow`.

## Navegación

1. Abrir **Cam Sites — SOP System** → callout «Empieza aquí» + secciones A–F.
2. **B/C:** enlaces a CSN Sites, Project Runs, Tasks.
3. **D:** lista de 3 prompts QA con enlaces directos.
4. **F:** runbooks en español.
5. Tarea → subpágina «📋 Prompt Cursor — …» + propiedad **Prompt Notion URL**.

## Código tocado

- `csn-os/lib/primary-entry-page.mjs` — título, icono, huella 14 DB, duplicado, índice padre.
- `csn-os/lib/notion-root-hub.mjs` — hub A–F en español.
- `csn-os/lib/workflow.mjs` — fallos → Blocked, `nextRecommended`.
- `csn-os/lib/assemble-prompt.mjs` — bloque «Tarea focalizada».
- `scripts/csn-sync-hub.mjs`, `scripts/csn-verify-acceptance.mjs`.

## Tres prompts (Notion)

1. LIVE/OFFLINE — https://app.notion.com/p/Prompt-Cursor-QA-Coherencia-LIVE-OFFLINE-en-perfiles-de-modelo-3f684cd085ae816f939cd41fb9e15b4f  
2. CI workflow — https://app.notion.com/p/Prompt-Cursor-CI-workflow-verification-repo-3f684cd085ae81e7a1d5d072de997352  
3. Credenciales afiliado — https://app.notion.com/p/Prompt-Cursor-Document-affiliate-credential-storage-outside-Notion-3f684cd085ae810cbf1dfa186d6e6c39  

## Comandos

- `npm run csn:sync-hub` — republicar hub, prompts QA, runbooks (idempotente).
- `npm run csn:verify-acceptance` — pruebas de aceptación contra Notion remoto.
- `npm run csn:e2e` — flujo genérico proyecto nuevo + Notion URL.

## Pruebas de aceptación

Ver `docs/csn-acceptance-report.json` — `allPass: true` en la última ejecución.

## Legacy / QA

- Conteos legacy sin cambios (hub 4, ops 4, kv 1, routine 9, issues 8, deploy 7, kpi1 52, kpi2 4).
- QA marcado en Record Class; sin escritura en OPERATIONS/KNOWLEDGE/KPI legacy.

## Limitaciones

- Vistas Kanban/filtradas en Notion UI siguen siendo manuales donde la API no las crea.
- El Master SOP en inglés inline de capturas antiguas se sustituyó por hub ES + runbooks; no se duplica el texto largo en la raíz.
- Páginas prompt legacy bajo el panel pueden seguir existiendo; la ruta oficial es tarea → Prompt Notion URL.
