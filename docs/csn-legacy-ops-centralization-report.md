# CSN — Informe de centralización operativa (legacy)

Generado: 2026-10-11 (marcador `csn-legacy-ops-dashboard-v1`)

## Mapa de dependencias (inspección real)

| Área | URL Notion | Tipo confirmado | `database_id` | `data_source_id` |
|------|------------|-----------------|---------------|------------------|
| CAM SITE NETWORK OS | [hub](https://app.notion.com/p/3f384cd085ae80bdbe51c17104511bfa) | **Base full-page** (no página con bloques) | `3f384cd0-85ae-80bd-be51-c17104511bfa` | `3f384cd0-85ae-8078-9afc-000be75ab268` |
| OPERATIONS CENTER | [ops](https://app.notion.com/p/3f484cd085ae804db61ad87b93c11734) | Base full-page | `3f484cd0-85ae-804d-b61a-d87b93c11734` | `3fd84cd0-85ae-82af-94b9-074cf3e37156` |
| ISSUES & INCIDENTS | [issues](https://app.notion.com/p/3f484cd085ae80ddaedbf0e4004e88ea) | Base full-page | `3f484cd0-85ae-80dd-aedb-f0e4004e88ea` | `ea084cd0-85ae-83ac-9f12-07292a3bb2da` |
| DEPLOYMENTS & RELEASES | [deploy](https://app.notion.com/p/3f484cd085ae8011af56e1adfd30300b) | Base full-page | `3f484cd0-85ae-8011-af56-e1adfd30300b` | `36c84cd0-85ae-822f-a249-877e009315f9` |
| KNOWLEDGE VAULT | [kv](https://app.notion.com/p/3f484cd085ae800ba34cd0d4101255a0) | Base full-page | `3f484cd0-85ae-800b-a34c-d0d4101255a0` | `41284cd0-85ae-829e-ac42-0771e6b6f412` |
| ROUTINE & MAINTENANCE | [routine](https://app.notion.com/p/3f484cd085ae80a89091e7bf1a16ba70) | Base full-page | `3f484cd0-85ae-80a8-9091-e7bf1a16ba70` | `60284cd0-85ae-8292-8363-07d4ecd2598b` |

**Relaciones confirmadas:** `KPI History` (relation) en hub y ops hacia bases KPI legacy (`kpi1`/`kpi2`). Issues/deploy/routine usan `Site` como `multi_select`; ops usa `Site` como `rich_text`. **No hay** relación API-verificada entre filas de OPERATIONS CENTER e incidencias/despliegues/rutinas (inferido: trabajo especializado vive en sus bases).

**Conteos de filas (antes = después):** hub 4, ops 4, issues 8, deploy 7, routine 9, kv 1, kpi1 52, kpi2 4.

Detalle de esquema: `docs/csn-legacy-ops-schema-snapshot.json`. Inspección: `docs/csn-legacy-ops-inspection.json`.

---

## 1. Implementado y verificado

- **Vistas nuevas** creadas vía `notion.views.create` (idempotente por nombre; re-ejecución no duplica). Evidencia: `docs/csn-legacy-ops-centralization-applied.json`.
- **CAM SITE NETWORK OS (dashboard):** 5 vistas `CSN · 1` … `CSN · 5` (overview, Pending, Active, acceso rápido ordenado por dominio, por sitio).
- **OPERATIONS CENTER (bandeja resumen por sitio):** 7 vistas `OC ·` (All Tasks, In progress, Blocked, Today/due text, Overdue text, Upcoming Ready, By Site).
- **Bandeja extendida sin duplicar registros:** vistas `OC ·` en ISSUES (Open incidents, High priority), DEPLOY (Upcoming, High priority, Not verified), ROUTINE (Pending, High priority pending), más `CSN · Knowledge — Vigente` en KV.
- **Integridad:** `legacyRowCounts` idéntico antes/después; descripciones de las seis bases sin cambios; vista por defecto `/database` intacta en cada base.
- **Scripts:** `npm run csn:legacy-ops-inspect`, `npm run csn:legacy-ops-centralize` (`--dry-run` opcional).

---

## 2. Implementado pero no verificado en UI humana

- Orden visual de pestañas de vistas en Notion (la API no garantiza orden en la barra).
- Filtros compuestos en bases con pocas filas (p. ej. `OC · Blocked` puede aparecer vacía si no hay estado «Blocked»).
- La vista `CSN · 4 — Quick access` es una tabla ordenada por dominio; **no** incluye enlaces clicables a las otras cinco bases (la API no permite bloques en estas páginas).

---

## 3. Pendiente / limitaciones técnicas

| Limitación | Impacto |
|------------|---------|
| Las seis URLs son **bases full-page**; `blocks.children.append` → «Block does not support children» | No se pueden añadir secciones de dashboard al final del cuerpo de página sin tocar descripción ni crear filas nuevas. |
| `Due Date` en OPERATIONS CENTER es **rich_text**, no `date` | No hay vista «Overdue» fiable por calendario; las vistas de fecha usan «texto de fecha relleno + no Done». |
| Sin relación ops ↔ issues/deploy/routine | Una sola tabla en OPERATIONS CENTER no lista incidencias/despliegues; hay que usar las pestañas `OC ·` en cada base especializada. |
| Parent `block_id` de las bases no compartido con la integración | No se puede colgar una página contenedora con linked databases bajo el mismo padre vía API. |
| Vistas `board` con agrupación | No configuradas (validación API exige `configuration.type`; se usaron tablas filtradas). |

**Acción humana recomendada (única más importante):** En Notion UI, fijar en **CAM SITE NETWORK OS** la vista `CSN · 1 — Network overview` como predeterminada y añadir **un callout manual** al inicio de la descripción de la base (o una página wiki hermana si creáis una) con enlaces a las otras cinco URLs — solo si aceptáis editar descripción o crear página fuera del alcance API actual.

---

## 4. Esquema

**Propiedades añadidas:** ninguna.

**Relaciones añadidas:** ninguna.

**Vistas añadidas:** ver listas en `docs/csn-legacy-ops-centralization-applied.json` → `viewResults.*.created`.

---

## 5. Protecciones

- No se archivaron, borraron ni modificaron filas de las seis bases ni KPI legacy.
- No se crearon bases de datos nuevas.
- No se alteraron estados, fechas ni responsables de tareas reales.
- No se modificaron descripciones, bloques ni la vista `/database` existente.
- Durante pruebas se creó y archivó una fila de prueba en hub (no cuenta en `legacyRowCounts`).

---

## 6. Próximo paso

Convertir **`Due Date` en OPERATIONS CENTER** de `rich_text` a `date` (migración manual en Notion, conservando valores) para habilitar vistas **Today** y **Overdue** reales; opcionalmente añadir relaciones desde ops hacia el registro origen en issues/deploy/routine cuando haya una fila de seguimiento explícita.

---

## Comandos

```bash
npm run csn:legacy-ops-inspect
npm run csn:legacy-ops-centralize
npm run csn:legacy-ops-centralize -- --dry-run
```
