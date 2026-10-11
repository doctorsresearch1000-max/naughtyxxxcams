# Reestructuración producto — guía 7 días (v10-build)

## Archivos modificados

- `csn-os/launch-guide/days/day-01.mjs` … `day-07.mjs` — formato 10 secciones, producto primero
- `csn-os/launch-guide/guide-product-format.mjs` — opciones A–E, Notion opcional al final
- `csn-os/launch-guide/guide-context.mjs` — títulos alineados a construcción
- `csn-os/lib/notion-root-hub.mjs` — hub `csn-hub-marker-v10-build`
- Conversor Notion sin cambios estructurales (enlaces + code blocks)

## Nueva estructura de jornadas

| Día | Construcción principal |
|-----|------------------------|
| 1 | Brief, elección visual A–E (humana), design system, `npm run dev` |
| 2 | Competencia + dominio limitado + código UI |
| 3 | pSEO + spec páginas alineada al diseño |
| 4 | Home, categorías, plantilla perfil en repo |
| 5 | Feed + monetización real o mock QA |
| 6 | SEO técnico en rutas reales |
| 7 | PASS/FAIL + launch-readiness |

## Estilo visual

- Documentado en Día 1: `VISUAL_OPTIONS` + prompt que **pregunta** al usuario si no hay decisión.
- Cursor no elige entre C y B sin confirmación humana.

## Prompts

- Todos exigen **inspeccionar repo** antes de editar.
- Días 4–7 orientados a **implementación** (archivos `src/` listados).
- Notion relegado a sección «Registro operativo (opcional)».

## Verificación Notion

Ejecutar tras sync:

```bash
npm run csn:sync-7day-guide
npm run csn:verify-notion-guide
```

## Estado implementación en repo del sitio

Esta tarea **no** modifica `src/` del monorepo cam; la guía instruye al usuario/Cursor a hacerlo. Etiquetas: guía = **Documentado**; código producto = **Pendiente** hasta que el usuario ejecute Día 4+.

## Bloqueos reales

- Credenciales feed, deploy prod, compra dominio, GSC — sin cambio.
