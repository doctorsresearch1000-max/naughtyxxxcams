# Informe final — corrección guía 7 días + pSEO (2026-10-11)

## Cambios realizados

| Área | Archivos |
|------|----------|
| Conversor Notion | `csn-os/lib/notion-markdown-blocks.mjs` — enlaces `[t](url)`, **negrita**, bloques `code`, tablas como viñetas |
| Sync guía | `csn-os/lib/sync-launch-guide-notion.mjs` — usa `markdownToNotionBlocks` |
| Jornadas | `csn-os/launch-guide/days/day-01.mjs` … `day-07.mjs` |
| pSEO prompts | `csn-os/launch-guide/prompts-pseo.mjs` |
| Ayudas UX | `csn-os/launch-guide/guide-sections.mjs` (relaciones Notion, repo sin GitHub, preview, aprobaciones) |
| Calendario | `csn-os/launch-guide/guide-context.mjs` — Días 3–7 reorientados a pSEO + plantilla perfil |
| Panel | `csn-os/lib/notion-root-hub.mjs` — marker `csn-hub-marker-v9-pseo` |
| Verificación | `scripts/csn-verify-notion-guide-publish.mjs` |

## Problemas de auditoría resueltos

| Problema | Solución |
|----------|----------|
| Enlaces markdown no clicables en Notion | `parseInlineMarkdown` + `rt()` en todos los pasos |
| Prompts convertidos en headings | Bloques `type: code` por fences ``` |
| Consola obligatoria | Eliminada del flujo |
| Relaciones Site / SOP | `RELACIONAR_EN_NOTION`, `SOP_VERSION_AYUDA` |
| Sin repo / sin preview | `SIN_REPOSITORIO`, `PREVIEW_STAGING`; Día 7 no usa example.com como preview |
| Solo trámites Notion | Días 4–6 exigen código, muestra perfiles, reglas indexación |
| Día 2 paso 4 vs 6–8 | Redacción corregida; quitada jerga «manifest CSN» del dominio |

## pSEO — estado real

| Componente | Estado |
|------------|--------|
| Investigación keywords long tail | Prompt Día 3A; sin volúmenes inventados; fuentes repo/brief/hipótesis |
| Arquitectura URLs / familias | Prompt Día 3B + Knowledge |
| Plantilla maestra perfil | Prompt Día 4A referencia `modelProfile.ts`, `ModelProfileSlushyView`, SEO metadata, LIVE/OFFLINE |
| Feed → perfil | Día 5 + CrakRevenue paths en repo |
| Reglas escala / indexación | Prompt Día 6A + SEO técnico 6B |
| Validación muestra | Prompt Día 7 |

**No implementado en código en esta tarea** (queda para ejecución del usuario con Cursor): commits en repo, deploy, indexación Google.

## Notion verificado (post-sync)

Comando: `npm run csn:verify-notion-guide` → `docs/csn-7day-notion-publish-verify.json`

Última ejecución:

- `literalMdLink: 0` en hub y 7 días
- `codes ≥ 1` por día (prompts en bloque código)
- `links ≥ 2` por día (enlaces clicables API)
- Hub: `csn-hub-marker-v9-pseo`, 11 enlaces en cuerpo

Páginas actualizadas (mismos `pageId`, títulos actualizados):

- Día 1–7: ver `manifest.launchGuide7Day.pages`
- Raíz: https://app.notion.com/p/Cam-Sites-SOP-System-3f684cd085ae811fa929c4b4ccbcb56a

## Pruebas

| Prueba | Resultado |
|--------|-----------|
| `csn:sync-7day-guide` | OK, `legacyOk: true` |
| `csn:verify-notion-guide` | OK tras corrección script `allPass` |
| `csn:verify-acceptance` | Ejecutar en CI local si se requiere |

## Bloqueos que siguen dependiendo del usuario

- Aprobaciones Human Gate (compra, prod deploy, backlinks de pago)
- Credenciales CrakRevenue / Cloudflare
- URL `*.pages.dev` sin permiso Cloudflare
- Volúmenes SEO y GSC (validación externa)
- Revisión legal profesional

## TeleHub

Sin informe TeleHub en repo; prompts de perfil alineados con `csn-os/prompts/DEMO-QA-live-offline-profiles.md` y código real del monorepo.

## Limitaciones del conversor

- Tablas markdown → viñetas con filas `|`
- Sin bloques anidados complejos
- Límite 2000 caracteres por fragmento rich_text (código partido en chunks)
