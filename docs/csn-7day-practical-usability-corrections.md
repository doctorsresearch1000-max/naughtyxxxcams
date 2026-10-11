# Correcciones de usabilidad — guía 7 días y panel

## Cambios en el repositorio

| Archivo | Cambio |
|---------|--------|
| `csn-os/launch-guide/days/day-01.mjs` … `day-07.mjs` | Contenido manual en español, estructura obligatoria (10 bloques lógicos) |
| `csn-os/launch-guide/guide-context.mjs` | URLs Notion desde manifest; cuaderno de proyecto; guía de puntuación dominio honesta |
| `csn-os/lib/launch-guide-builder.mjs` | Deja de auto-traducir manifest; ensambla días desde `days/*` |
| `csn-os/lib/notion-root-hub.mjs` | Hub **v8-practical** (sin consola como paso 1; referencia técnica al final) |
| `csn-os/lib/sync-launch-guide-notion.mjs` | Títulos `Guía 7 días — Día N — …`; busca por número de día |
| `csn-os/launch-guide/dia-*.md` | Regenerados desde `days/*` |

## Problemas corregidos (ejemplo Día 2)

- Instrucciones en inglés → pasos numerados en español con enlaces a Domain Candidates, Human Gates, CSN Knowledge.
- «TEMPLATE: Domain candidate evaluation» → citado el texto real del setup script + tabla de criterios 1–5 definida en la guía (no inventada como artículo largo en Notion).
- Ahrefs → opcional explícito.
- Un solo flujo de gate de compra (Pending, STOP) sin duplicar lógica confusa.
- Dos prompts Cursor: investigación (sin web) y plan DNS (repo opcional).
- Fin de día válido **con compra pendiente**.

## Prompts

- Sin `{{PLACEHOLDERS}}` del sistema: el usuario rellena **[CORCHETES]** en el prompt o usa el **cuaderno de proyecto** del Día 1.
- Cursor **no** crea filas Notion; entrega texto para pegar.
- Acciones externas (registrador, DNS, GSC) etiquetadas como manuales.

## Consola `/csn-console`

- **Retirada del camino principal.** Sigue existiendo para equipos que registren resultados en lote; la guía no la exige para leer ni copiar prompts.

## Limitaciones no resueltas sin más permisos/código

| Limitación | Motivo |
|------------|--------|
| Cursor no escribe en Notion | Sin integración Notion en el agente del usuario |
| Títulos de página Notion truncados si el markdown supera ~45k | `appendMarkdownAsBlocks` + slice en sync |
| Bloques de código en Notion pueden perder formato | Conversor markdown simple (sin fences completos) |
| Plantilla Knowledge «Domain candidate evaluation» sigue siendo breve en Notion | Solo se creó texto corto en `notion-csn-operational-complete.mjs`; la guía aporta la tabla operativa |
| Registro automático de tareas Done | Requiere consola/API o edición manual en Tasks |
| TeleHub | Sin fuente en repo |

## Tabla de verificación (después de corrección)

| Criterio | D1 | D2 | D3 | D4 | D5 | D6 | D7 |
|----------|----|----|----|----|----|----|-----|
| Claridad | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pasos concretos + URL | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Prompt copiable | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Accesos reales | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Verificación / fin de día | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Gestión errores / bloqueo | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pendientes explícitos | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

## Sincronización Notion — propuesta y riesgos

Ver `docs/csn-7day-notion-sync-proposal.md`.

**Comando:** `npm run csn:sync-7day-guide`

**Efecto verificado en código:**

1. **Raíz canónica** `3f684cd0-85ae-811f-a929-c4b4ccbcb56a`: borra bloques inline del hub, **no** child pages ni child databases (`deleteBlocksExceptChildPagesAndDatabases`).
2. **Siete páginas guía:** borra todos los bloques de cada página hijo cuyo título contiene `Guía 7 días` + `Día N`; **no** borra subpáginas hijas si las hubiera (`deleteAllBlocks` con keepChildPages false solo en esa página).
3. **No toca** bases legacy (CAM SITE NETWORK OS, KPI History, etc.).
4. **Riesgo:** páginas guía antiguas con el mismo número de día se reutilizan y **sobrescriben** contenido; títulos se actualizan a `Día N — [short title]`.
5. **Riesgo:** `csn:sync-hub` (otro script) puede volver a sobrescribir la portada con una versión antigua si se ejecuta después — usar solo `csn:sync-7day-guide` para publicar hub v8.
