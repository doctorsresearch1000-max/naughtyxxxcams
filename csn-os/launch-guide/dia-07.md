# Guía 7 días — Día 7: Staging, decisión de lanzamiento y operación posterior

## Objetivo del día
Evidencia en staging, gates de producción (si aplica), snapshot KPI y rutinas de mantenimiento.

**Nota realista:** Producción solo con gate Approved; QA puede cerrar en sandbox sin deploy real.

## Fases CSN cubiertas
- Fase 10: Staging, QA y endurecimiento — Release en staging/sandbox, pruebas y Evidence URL.
- Fase 11: Lanzamiento a producción — Solo con gate production_deploy Approved; no automatizado.
- Fase 12: Medición, mantenimiento y handoff — Launch KPI Snapshot (aislado), mantenimiento y cierre del run.

## Antes de empezar
- Acceso a Notion «Cam Sites — SOP System».
- Decidir si el sitio es **prueba (QA)** o **producción** (producción exige más gates y dominio real).
- Tener listo: nombre comercial, nicho, objetivo, brief en prosa (qué debe hacer la web).
- Navegador para expireddomains.net y web.archive.org (día 2).
- Acceso de lectura al repositorio GitHub del sitio (días 4–5).
- **Día 7 producción:** aprobación humana explícita antes de deploy (gate production_deploy).

## Pasos que debes seguir
### Bloque fase 10
1) CSN Releases staging Done (or sandbox). 2) staging_deploy gate if real public staging. 3) Project Run Evidence URL populated.

1. **Staging release record**
   - Qué hacer: CSN Releases: Environment = staging, Status = In progress → Done when deploy completes. Git SHA required. Relate Site + Project Run.
   - Dónde: Notion (Tasks / tablas indicadas) y herramientas externas citadas en la instrucción.
   - Resultado: Staging release row with Deployed At.
   - Comprobar: Release Status = Done for sandbox simulation.
2. **Staging deploy Human Gate (if external impact)**
   - Qué hacer: If staging uses real DNS or public URLs with consequences: create Human Gates Target Type = staging_deploy (pending schema), Scope lists hostnames, Limits = no prod data. For QA-SANDBOX use example host only — gate optional but document.
   - Dónde: Notion (Tasks / tablas indicadas) y herramientas externas citadas en la instrucción.
   - Resultado: Gate row or explicit Notes 'no staging gate required for example.com QA'.
   - Comprobar: Documented decision.
   - ⚠ Aprobación humana: csn:gate:policy:staging_deploy
3. **Attach QA evidence to Project Run**
   - Qué hacer: Set Project Run Evidence URL to staging preview or test artifact. Current Phase = 10.
   - Dónde: Notion (Tasks / tablas indicadas) y herramientas externas citadas en la instrucción.
   - Resultado: Evidence URL non-empty.
   - Comprobar: Evidence URL populated.
### Bloque fase 11
1) production_deploy gate Pending. 2) CSN Releases production row Blocked. 3) QA sites: mark N/A — never prod deploy.

4. **Production deploy Human Gate**
   - Qué hacer: Create Human Gates Target Type = production_deploy, Target External ID = run External ID, Scope = prod hostnames, Limits = maintenance window. Status must be Pending until human approves. DO NOT deploy.
   - Dónde: Notion (Tasks / tablas indicadas) y herramientas externas citadas en la instrucción.
   - Resultado: Pending production gate.
   - Comprobar: Gate exists Pending or N/A documented for QA.
   - ⚠ Aprobación humana: csn:gate:policy:production_deploy
5. **Production release row (blocked until gate)**
   - Qué hacer: CSN Releases Environment = production, Status = Blocked until production_deploy gate Approved. No deploy action in automation.
   - Dónde: Notion (Tasks / tablas indicadas) y herramientas externas citadas en la instrucción.
   - Resultado: Production release row in Blocked/Not started.
   - Comprobar: Row exists; not Done.
   - ⚠ Aprobación humana: csn:gate:policy:production_deploy
### Bloque fase 12
1) Launch KPI Snapshots with Record Class matching site. 2) CSN Maintenance seeds. 3) Project Run Status Done if evidence + sandbox rules met.

6. **Launch KPI Snapshot (isolated DB)**
   - Qué hacer: Create Launch KPI Snapshots with metrics, Record Class matching site, link Site + Project Run. For QA use zeros and QA test-only. Legacy KPI History sync (npm run notion:sync-kpis) is separate — do not mix QA into hub KPI reporting.
   - Dónde: Notion (Tasks / tablas indicadas) y herramientas externas citadas en la instrucción.
   - Resultado: Snapshot row with Captured At.
   - Comprobar: Snapshot exists.
7. **Seed CSN Maintenance routines**
   - Qué hacer: Create CSN Maintenance rows (weekly KPI review, feed health) linked to Site.
   - Dónde: Notion (Tasks / tablas indicadas) y herramientas externas citadas en la instrucción.
   - Resultado: ≥2 maintenance rows.
   - Comprobar: ≥2 rows.
8. **Close Project Run**
   - Qué hacer: Set Current Phase = 12, Status = Done only if Evidence URL set and required gates resolved or N/A for QA. Document handoff in Notes.
   - Dónde: Notion (Tasks / tablas indicadas) y herramientas externas citadas en la instrucción.
   - Resultado: Project Run Status = Done (sandbox) or In progress (prod pending gates).
   - Comprobar: Status updated per sandbox rules.

## Instrucciones para Cursor

### Cómo obtener el prompt con tus datos reales
1. Registra el proyecto (Día 1) en la consola **/csn-console** (formulario) o con ayuda de quien tenga acceso al servidor.
2. Abre **Continuar** → **Preparar prompt** para la fase actual; copia el texto completo.
3. Pega en Cursor en el repositorio autorizado. Cursor **no** se ejecuta solo al generar el prompt.

### Prompt — Staging release record
```
# Cursor — Tarea CSN (Fase 10: Staging, QA y endurecimiento)

**ID de tarea (definición):** `csn:task:v2:p10:01`
**Proyecto:** {{NOMBRE_DE_TU_SITIO}} — Launch Key: {{TU_LAUNCH_KEY}}
**Clase de registro:** {{QA test-only O Production}}
**Repositorio:** {{URL_GITHUB}} (si ya existe)

## Rol
Eres ingeniero senior en la red Cam Site Network (CSN). Ejecuta **solo** esta tarea. No compres dominios, no cambies DNS de producción, no despliegues ni pagues backlinks sin un Human Gate **Approved** citado en Notion.

## Misión concreta
CSN Releases: Environment = staging, Status = In progress → Done when deploy completes. Git SHA required. Relate Site + Project Run.

## Precondiciones
CI documented.

## Entregable esperado
Staging release row with Deployed At.

## Criterios de aceptación (verificables)
QA sites use Environment = staging or sandbox only.

## Evidencias a registrar en Notion
Release URL + deploy log link in Notes.

## Pruebas
- Marca cada comprobación como: Implementado | Probado con éxito | Probado sin éxito | No probado | Bloqueado | Solo documentado.
- No afirmes despliegue ni compra sin evidencia URL.

## Si falta información
Si el brief o el repositorio están vacíos, detente y devuelve lista de campos faltantes (plantilla blocked-planning). No inventes dominios ni claves API.

## Al terminar
Indica URLs de filas Notion creadas/actualizadas y texto sugerido para el campo Resultado ejecución de la tarea.

---
*Generado desde `csn-task-manifest-v2.json` + estándares CSN. Para prompt con tus datos ya rellenados: consola `/csn-console` → Preparar prompt, o registro previo del proyecto.*

```

### Prompt — Staging deploy Human Gate (if external impact)
```
# Cursor — Tarea CSN (Fase 10: Staging, QA y endurecimiento)

**ID de tarea (definición):** `csn:task:v2:p10:02`
**Proyecto:** {{NOMBRE_DE_TU_SITIO}} — Launch Key: {{TU_LAUNCH_KEY}}
**Clase de registro:** {{QA test-only O Production}}
**Repositorio:** {{URL_GITHUB}} (si ya existe)

## Rol
Eres ingeniero senior en la red Cam Site Network (CSN). Ejecuta **solo** esta tarea. No compres dominios, no cambies DNS de producción, no despliegues ni pagues backlinks sin un Human Gate **Approved** citado en Notion.

## Misión concreta
If staging uses real DNS or public URLs with consequences: create Human Gates Target Type = staging_deploy (pending schema), Scope lists hostnames, Limits = no prod data. For QA-SANDBOX use example host only — gate optional but document.

## Precondiciones
csn:task:v2:p10:01.

## Entregable esperado
Gate row or explicit Notes 'no staging gate required for example.com QA'.

## Criterios de aceptación (verificables)
Gate not reused for production.

## Evidencias a registrar en Notion
Gate URL or waiver note.

## Pruebas
- Marca cada comprobación como: Implementado | Probado con éxito | Probado sin éxito | No probado | Bloqueado | Solo documentado.
- No afirmes despliegue ni compra sin evidencia URL.

## Si falta información
Si el brief o el repositorio están vacíos, detente y devuelve lista de campos faltantes (plantilla blocked-planning). No inventes dominios ni claves API.

## Al terminar
Indica URLs de filas Notion creadas/actualizadas y texto sugerido para el campo Resultado ejecución de la tarea.

---
*Generado desde `csn-task-manifest-v2.json` + estándares CSN. Para prompt con tus datos ya rellenados: consola `/csn-console` → Preparar prompt, o registro previo del proyecto.*

```

### Prompt — Attach QA evidence to Project Run
```
# Cursor — Tarea CSN (Fase 10: Staging, QA y endurecimiento)

**ID de tarea (definición):** `csn:task:v2:p10:03`
**Proyecto:** {{NOMBRE_DE_TU_SITIO}} — Launch Key: {{TU_LAUNCH_KEY}}
**Clase de registro:** {{QA test-only O Production}}
**Repositorio:** {{URL_GITHUB}} (si ya existe)

## Rol
Eres ingeniero senior en la red Cam Site Network (CSN). Ejecuta **solo** esta tarea. No compres dominios, no cambies DNS de producción, no despliegues ni pagues backlinks sin un Human Gate **Approved** citado en Notion.

## Misión concreta
Set Project Run Evidence URL to staging preview or test artifact. Current Phase = 10.

## Precondiciones
csn:task:v2:p10:01.

## Entregable esperado
Evidence URL non-empty.

## Criterios de aceptación (verificables)
URL must not assert production launch for QA Record Class.

## Evidencias a registrar en Notion
Evidence URL field.

## Pruebas
- Marca cada comprobación como: Implementado | Probado con éxito | Probado sin éxito | No probado | Bloqueado | Solo documentado.
- No afirmes despliegue ni compra sin evidencia URL.

## Si falta información
Si el brief o el repositorio están vacíos, detente y devuelve lista de campos faltantes (plantilla blocked-planning). No inventes dominios ni claves API.

## Al terminar
Indica URLs de filas Notion creadas/actualizadas y texto sugerido para el campo Resultado ejecución de la tarea.

---
*Generado desde `csn-task-manifest-v2.json` + estándares CSN. Para prompt con tus datos ya rellenados: consola `/csn-console` → Preparar prompt, o registro previo del proyecto.*

```

### Prompt — Production deploy Human Gate
```
# Cursor — Tarea CSN (Fase 11: Lanzamiento a producción)

**ID de tarea (definición):** `csn:task:v2:p11:01`
**Proyecto:** {{NOMBRE_DE_TU_SITIO}} — Launch Key: {{TU_LAUNCH_KEY}}
**Clase de registro:** {{QA test-only O Production}}
**Repositorio:** {{URL_GITHUB}} (si ya existe)

## Rol
Eres ingeniero senior en la red Cam Site Network (CSN). Ejecuta **solo** esta tarea. No compres dominios, no cambies DNS de producción, no despliegues ni pagues backlinks sin un Human Gate **Approved** citado en Notion.

## Misión concreta
Create Human Gates Target Type = production_deploy, Target External ID = run External ID, Scope = prod hostnames, Limits = maintenance window. Status must be Pending until human approves. DO NOT deploy.

## Precondiciones
Staging evidence complete; Record Class = Production only.

## Entregable esperado
Pending production gate.

## Criterios de aceptación (verificables)
QA test-only sites skip this task (mark Done with Notes 'N/A QA').

## Evidencias a registrar en Notion
Gate row.

## Pruebas
- Marca cada comprobación como: Implementado | Probado con éxito | Probado sin éxito | No probado | Bloqueado | Solo documentado.
- No afirmes despliegue ni compra sin evidencia URL.

## Si falta información
Si el brief o el repositorio están vacíos, detente y devuelve lista de campos faltantes (plantilla blocked-planning). No inventes dominios ni claves API.

## Al terminar
Indica URLs de filas Notion creadas/actualizadas y texto sugerido para el campo Resultado ejecución de la tarea.

---
*Generado desde `csn-task-manifest-v2.json` + estándares CSN. Para prompt con tus datos ya rellenados: consola `/csn-console` → Preparar prompt, o registro previo del proyecto.*

```

### Prompt — Production release row (blocked until gate)
```
# Cursor — Tarea CSN (Fase 11: Lanzamiento a producción)

**ID de tarea (definición):** `csn:task:v2:p11:02`
**Proyecto:** {{NOMBRE_DE_TU_SITIO}} — Launch Key: {{TU_LAUNCH_KEY}}
**Clase de registro:** {{QA test-only O Production}}
**Repositorio:** {{URL_GITHUB}} (si ya existe)

## Rol
Eres ingeniero senior en la red Cam Site Network (CSN). Ejecuta **solo** esta tarea. No compres dominios, no cambies DNS de producción, no despliegues ni pagues backlinks sin un Human Gate **Approved** citado en Notion.

## Misión concreta
CSN Releases Environment = production, Status = Blocked until production_deploy gate Approved. No deploy action in automation.

## Precondiciones
csn:task:v2:p11:01.

## Entregable esperado
Production release row in Blocked/Not started.

## Criterios de aceptación (verificables)
Git SHA empty until real deploy.

## Evidencias a registrar en Notion
Release row URL.

## Pruebas
- Marca cada comprobación como: Implementado | Probado con éxito | Probado sin éxito | No probado | Bloqueado | Solo documentado.
- No afirmes despliegue ni compra sin evidencia URL.

## Si falta información
Si el brief o el repositorio están vacíos, detente y devuelve lista de campos faltantes (plantilla blocked-planning). No inventes dominios ni claves API.

## Al terminar
Indica URLs de filas Notion creadas/actualizadas y texto sugerido para el campo Resultado ejecución de la tarea.

---
*Generado desde `csn-task-manifest-v2.json` + estándares CSN. Para prompt con tus datos ya rellenados: consola `/csn-console` → Preparar prompt, o registro previo del proyecto.*

```

### Prompt — Launch KPI Snapshot (isolated DB)
```
# Cursor — Tarea CSN (Fase 12: Medición, mantenimiento y handoff)

**ID de tarea (definición):** `csn:task:v2:p12:01`
**Proyecto:** {{NOMBRE_DE_TU_SITIO}} — Launch Key: {{TU_LAUNCH_KEY}}
**Clase de registro:** {{QA test-only O Production}}
**Repositorio:** {{URL_GITHUB}} (si ya existe)

## Rol
Eres ingeniero senior en la red Cam Site Network (CSN). Ejecuta **solo** esta tarea. No compres dominios, no cambies DNS de producción, no despliegues ni pagues backlinks sin un Human Gate **Approved** citado en Notion.

## Misión concreta
Create Launch KPI Snapshots with metrics, Record Class matching site, link Site + Project Run. For QA use zeros and QA test-only. Legacy KPI History sync (npm run notion:sync-kpis) is separate — do not mix QA into hub KPI reporting.

## Precondiciones
Run near completion.

## Entregable esperado
Snapshot row with Captured At.

## Criterios de aceptación (verificables)
Record Class must match site; production reporting must filter QA test-only.

## Evidencias a registrar en Notion
Snapshot row URL.

## Pruebas
- Marca cada comprobación como: Implementado | Probado con éxito | Probado sin éxito | No probado | Bloqueado | Solo documentado.
- No afirmes despliegue ni compra sin evidencia URL.

## Si falta información
Si el brief o el repositorio están vacíos, detente y devuelve lista de campos faltantes (plantilla blocked-planning). No inventes dominios ni claves API.

## Al terminar
Indica URLs de filas Notion creadas/actualizadas y texto sugerido para el campo Resultado ejecución de la tarea.

---
*Generado desde `csn-task-manifest-v2.json` + estándares CSN. Para prompt con tus datos ya rellenados: consola `/csn-console` → Preparar prompt, o registro previo del proyecto.*

```

### Prompt — Seed CSN Maintenance routines
```
# Cursor — Tarea CSN (Fase 12: Medición, mantenimiento y handoff)

**ID de tarea (definición):** `csn:task:v2:p12:02`
**Proyecto:** {{NOMBRE_DE_TU_SITIO}} — Launch Key: {{TU_LAUNCH_KEY}}
**Clase de registro:** {{QA test-only O Production}}
**Repositorio:** {{URL_GITHUB}} (si ya existe)

## Rol
Eres ingeniero senior en la red Cam Site Network (CSN). Ejecuta **solo** esta tarea. No compres dominios, no cambies DNS de producción, no despliegues ni pagues backlinks sin un Human Gate **Approved** citado en Notion.

## Misión concreta
Create CSN Maintenance rows (weekly KPI review, feed health) linked to Site.

## Precondiciones
Site active.

## Entregable esperado
≥2 maintenance rows.

## Criterios de aceptación (verificables)
Cadence set.

## Evidencias a registrar en Notion
Maintenance row URLs.

## Pruebas
- Marca cada comprobación como: Implementado | Probado con éxito | Probado sin éxito | No probado | Bloqueado | Solo documentado.
- No afirmes despliegue ni compra sin evidencia URL.

## Si falta información
Si el brief o el repositorio están vacíos, detente y devuelve lista de campos faltantes (plantilla blocked-planning). No inventes dominios ni claves API.

## Al terminar
Indica URLs de filas Notion creadas/actualizadas y texto sugerido para el campo Resultado ejecución de la tarea.

---
*Generado desde `csn-task-manifest-v2.json` + estándares CSN. Para prompt con tus datos ya rellenados: consola `/csn-console` → Preparar prompt, o registro previo del proyecto.*

```

### Prompt — Close Project Run
```
# Cursor — Tarea CSN (Fase 12: Medición, mantenimiento y handoff)

**ID de tarea (definición):** `csn:task:v2:p12:03`
**Proyecto:** {{NOMBRE_DE_TU_SITIO}} — Launch Key: {{TU_LAUNCH_KEY}}
**Clase de registro:** {{QA test-only O Production}}
**Repositorio:** {{URL_GITHUB}} (si ya existe)

## Rol
Eres ingeniero senior en la red Cam Site Network (CSN). Ejecuta **solo** esta tarea. No compres dominios, no cambies DNS de producción, no despliegues ni pagues backlinks sin un Human Gate **Approved** citado en Notion.

## Misión concreta
Set Current Phase = 12, Status = Done only if Evidence URL set and required gates resolved or N/A for QA. Document handoff in Notes.

## Precondiciones
csn:task:v2:p12:01.

## Entregable esperado
Project Run Status = Done (sandbox) or In progress (prod pending gates).

## Criterios de aceptación (verificables)
Done without Evidence URL is policy violation — not API enforced.

## Evidencias a registrar en Notion
Final run state screenshot.

## Pruebas
- Marca cada comprobación como: Implementado | Probado con éxito | Probado sin éxito | No probado | Bloqueado | Solo documentado.
- No afirmes despliegue ni compra sin evidencia URL.

## Si falta información
Si el brief o el repositorio están vacíos, detente y devuelve lista de campos faltantes (plantilla blocked-planning). No inventes dominios ni claves API.

## Al terminar
Indica URLs de filas Notion creadas/actualizadas y texto sugerido para el campo Resultado ejecución de la tarea.

---
*Generado desde `csn-task-manifest-v2.json` + estándares CSN. Para prompt con tus datos ya rellenados: consola `/csn-console` → Preparar prompt, o registro previo del proyecto.*

```

## Cómo comprobar el resultado
- [ ] Staging release record: QA sites use Environment = staging or sandbox only.
- [ ] Staging deploy Human Gate (if external impact): Gate not reused for production.
- [ ] Attach QA evidence to Project Run: URL must not assert production launch for QA Record Class.
- [ ] Production deploy Human Gate: QA test-only sites skip this task (mark Done with Notes 'N/A QA').
- [ ] Production release row (blocked until gate): Git SHA empty until real deploy.
- [ ] Launch KPI Snapshot (isolated DB): Record Class must match site; production reporting must filter QA test-only.
- [ ] Seed CSN Maintenance routines: Cadence set.
- [ ] Close Project Run: Done without Evidence URL is policy violation — not API enforced.

Estados en Notion Tasks: **Not started** → **In progress** → **Done** (con evidencia) o **Blocked** (con motivo).

## Si algo falla
- Anota el mensaje de error y la URL de la fila Notion afectada.
- No avances de fase si `checkPhaseReadiness` / bloqueos listan brief, repo o fase anterior incompleta.
- Gates en **Pending** o **Rejected**: usar plantilla blocked-planning; no comprar ni desplegar.
- Crea fila en **CSN Incidents** si el fallo afecta al sitio.

## Criterio para terminar el día
- [ ] Release Status = Done for sandbox simulation.
- [ ] Documented decision.
- [ ] Evidence URL populated.
- [ ] Gate exists Pending or N/A documented for QA.
- [ ] Row exists; not Done.
- [ ] Snapshot exists.
- [ ] ≥2 rows.
- [ ] Status updated per sandbox rules.

**Siguiente jornada:** Día — fin del calendario objetivo