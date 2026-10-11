# Propuesta de sincronización Notion — guía práctica v8

## Correspondencia archivo → página

| Archivo repo | Página Notion (patrón título) | ID conocido (última sync) |
|--------------|-------------------------------|---------------------------|
| `csn-os/launch-guide/dia-01.md` | Guía 7 días — Día 1 — Define tu proyecto | ver `manifest.launchGuide7Day.pages[0]` |
| `dia-02.md` | … Día 2 — Evalúa el dominio… | idem |
| … | … | … |
| `dia-07.md` | … Día 7 — Comprueba la web… | idem |
| (generado) `notion-root-hub.mjs` | Hijos inline de raíz `3f684cd0-85ae-811f-a929-c4b4ccbcb56a` | — |

## Mecanismo (`csn-sync-7day-guide.mjs`)

1. `buildAllDays` → escribe `dia-*.md` desde `csn-os/launch-guide/days/*.mjs`.
2. `syncLaunchGuidePages` → por cada día: localiza child page por `Guía 7 días` + `Día N`, vacía bloques, `appendMarkdownAsBlocks` (máx. 45 000 caracteres).
3. `syncCanonicalRootHub` → reemplaza bloques superiores de la portada (hub v8).

## Qué NO se modifica

- Child **databases** bajo la raíz (14 tablas CSN).
- Child pages que no coincidan con el patrón de guía (runbooks, prompts, etc.).
- Bases legacy fuera del manifest aislado.

## Qué SÍ se sobrescribe

- Todo el contenido en bloques de las 7 páginas guía.
- Bloques de texto/callout del hub en la portada (no el título de la página raíz).

## Recomendación operativa

Ejecutar `npm run csn:sync-7day-guide` tras validar markdown en repo. No ejecutar `npm run csn:sync-hub` a continuación salvo que se haya alineado ese script con hub v8.
