# CSN — Fix 2: bandeja operativa central y fechas fiables

Marcador: `csn-legacy-ops-fix2-v1`  
Evidencia JSON: `docs/csn-legacy-ops-fix2-applied.json`  
Comando: `npm run csn:legacy-ops-fix2` (`--dry-run` opcional)

> El informe de la ejecución anterior (`docs/csn-legacy-ops-centralization-report.md`) se conserva sin modificaciones.

---

## 1. Relaciones creadas y verificadas

Propiedades **nuevas** en OPERATIONS CENTER (solo en ops; bases especializadas sin columnas inversas añadidas por la integración):

| Propiedad | Tipo | Destino |
|-----------|------|---------|
| `Due Date (date)` | date | (ya existía tras prueba API; conservada) |
| `Issue` | relation (single_property) | ISSUES & INCIDENTS |
| `Deployment` | relation (single_property) | DEPLOYMENTS & RELEASES |
| `Routine` | relation (single_property) | ROUTINE & MAINTENANCE |
| `Cam Site` | relation (single_property) | CAM SITE NETWORK OS (hub) |
| `CSN Task Key` | rich_text | Idempotencia `csn:ops:v2:{kind}:{pageId}` |

**Verificado:** fila de ejemplo `3f684cd0-85ae-81c6-bf33-efc7e03bbe3f` → `Issue` apunta a `3f684cd0-85ae-81d2-97bf-e5670618543e`. Las cuatro filas legacy de resumen por sitio tienen `Cam Site` enlazado al hub (p. ej. TeleHub → `3f484cd0-85ae-800d-a256-e4c5526ec8fa`).

---

## 2. Tareas vinculadas y creadas

### Filas legacy existentes (4) — solo adiciones

| Fila | Cambios |
|------|---------|
| ClickForCamGirls / MatureCamRooms / NaughtyXXXCams | `Cam Site` |
| TeleHub | `Cam Site` + `Due Date (date)` |

**No se modificaron** `Status`, `Due Date` (texto), `Priority`, títulos ni demás campos legacy.

### Nuevas tareas centrales (15)

| Origen | Cantidad | Criterio |
|--------|----------|----------|
| Issues | 4 | Abierto / Investigando / Mitigado (excl. Resuelto) |
| Deploy | 3 | Planeada / En preview |
| Routine | 8 | Pendiente |

Cada fila nueva enlaza **un** registro de origen vía `Issue`, `Deployment` o `Routine` y lleva `CSN Task Key` único.

### Pendiente de aprobación

| Registro | Motivo |
|----------|--------|
| Issue `3f584cd0-85ae-80e6-9c58-ca92ccf3e9db` | Abierto con **título vacío** — no se creó tarea central |

**Conteo ops:** 4 → **19** (+15). Resto de bases legacy sin cambio de filas.

**Idempotencia:** segunda ejecución → `opsRowDelta: 0`, `created: 0`.

---

## 3. Fechas

| Origen | Texto `Due Date` (intacto) | `Due Date (date)` | Notas |
|--------|---------------------------|-------------------|--------|
| TeleHub (fila legacy) | `11-09-2026` | `2026-09-11` | Interpretación **DD-MM-YYYY** (ES) |
| Resto ops legacy | vacío | vacío | — |
| Tareas nuevas | no rellenado | solo si el origen tenía `Due Date` date | la mayoría sin fecha en origen |

**Ambiguos / sin convertir:** ninguno adicional en esta ejecución (solo TeleHub tenía texto).

**Filtros temporales:** vistas `Bandeja · Today/Overdue/Upcoming` usan `equals|before|after: "today"` en API (verificado en `filter` almacenado).

---

## 4. Vistas creadas (OPERATIONS CENTER)

Nuevas (no se editaron `OC ·` ni `/database`):

- `Bandeja · All Tasks`
- `Bandeja · Today`
- `Bandeja · Overdue`
- `Bandeja · Blocked`
- `Bandeja · In Progress`
- `Bandeja · Upcoming`
- `Bandeja · Unscheduled`
- `Bandeja · By Site`

**Hub (acceso complementario):**

- `CSN · 6 — Sitios Pending (bandeja)`
- `CSN · 7 — Acceso: usar OPERATIONS CENTER`

**Verificado:** vista `/database` original conserva el mismo `id`; filtros `Bandeja ·` persisten en `views.retrieve`.

---

## 5. Comprobaciones de integridad

| Comprobación | Resultado |
|--------------|-----------|
| Filas hub/issues/deploy/routine/kv/KPI | Sin cambios |
| Descripciones de las 6 bases | Sin cambios |
| Vista por defecto `/database` en ops | Preservada |
| Duplicados por mismo origen | 0 en re-ejecución |
| Texto `Due Date` legacy | Intacto (TeleHub comprobado) |
| Nuevas bases de datos | 0 |

---

## 6. Limitaciones pendientes

- **Bloques de página** en bases full-page: sigue imposible vía API.
- **Issue sin título** (1): requiere decisión humana antes de centralizar.
- **TeleHub** en fila legacy sigue `Status: Done` — aparece en `Bandeja · All Tasks` pero no en vistas “abiertas”.
- **Fecha 11-09-2026:** si el operador usaba MM-DD-YYYY, `Due Date (date)` podría requerir corrección manual (no se sobrescribió el texto).
- **Validación runtime de filtros “today”** en UI: configuración API verificada; comportamiento dinámico en cliente Notion no ejecutado por el agente.

---

## 7. Siguiente acción

1. Completar el título del issue abierto sin nombre y volver a ejecutar `npm run csn:legacy-ops-fix2`, **o** enlazarlo manualmente desde ops.  
2. Usar **`Bandeja · Today` / `Overdue` / `Unscheduled`** como entrada diaria en [OPERATIONS CENTER](https://app.notion.com/p/3f484cd085ae804db61ad87b93c11734).

---

## Mapa rápido (confirmado)

```
OPERATIONS CENTER (19 filas)
  ├─ 4 resúmenes por sitio (legacy) + Cam Site → hub
  └─ 15 tareas con Issue | Deployment | Routine → registro origen
```
