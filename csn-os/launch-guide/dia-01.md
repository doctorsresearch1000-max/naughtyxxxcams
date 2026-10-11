# Guía 7 días — Día 1: Definir el proyecto y los requisitos iniciales

## Objetivo del día
Proyecto registrado en Notion, sitio vinculado y aprobación de alcance (gate) creada.

**Nota realista:** Completable en un día si tienes claro el nicho y el brief.

## Fases CSN cubiertas
- Fase 1: Intake y aprobación de alcance — Definir el proyecto, crear registros y obtener aprobación de alcance antes de gastar o desplegar.

## Antes de empezar
- Acceso a Notion «Cam Sites — SOP System».
- Decidir si el sitio es **prueba (QA)** o **producción** (producción exige más gates y dominio real).
- Tener listo: nombre comercial, nicho, objetivo, brief en prosa (qué debe hacer la web).

## Pasos que debes seguir
### Bloque fase 1
1) Create Project Runs row (Run Type, Launch Key, External ID, SOP Version). 2) Create CSN Sites row with matching Launch Key and Record Class. 3) Relate Site on run. 4) Create Human Gate (project_run) with Scope + Limits for this run only. 5) Wait for Approved before scope expansion.

1. **Open Project Run for launch or QA sandbox**
   - Qué hacer: Create a Project Runs row: Run Type = New Site Launch (production intent) or QA Sandbox (test-only). Set Launch Key (stable string), External ID (csn:{site}:{launch}), link SOP Version = Active, Status = In progress, Current Phase = 1.
   - Dónde: Notion (Tasks / tablas indicadas) y herramientas externas citadas en la instrucción.
   - Resultado: Project Run page linked to SOP Version with Started date populated.
   - Comprobar: Project Run Status is In progress and Current Phase = 1.
2. **Create or link CSN Sites row**
   - Qué hacer: Create CSN Sites row: Site Name, Domain (URL), Record Class = Production OR QA test-only, Launch Key matches Project Run, External ID matches run scope. Relate Site on Project Run.
   - Dónde: Notion (Tasks / tablas indicadas) y herramientas externas citadas en la instrucción.
   - Resultado: CSN Sites row with correct Record Class and relations to Project Run.
   - Comprobar: Project Run → Site relation points to intended site row.
3. **Request scoped Human Gate for run intake**
   - Qué hacer: Create Human Gates row: Target Type = project_run, Target External ID = Project Run External ID, Scope lists allowed work (e.g. Notion ops only), Limits (max spend $0 for QA). Status = Pending until approver sets Approved.
   - Dónde: Notion (Tasks / tablas indicadas) y herramientas externas citadas en la instrucción.
   - Resultado: Pending Human Gate uniquely tied to this run (not blanket approval).
   - Comprobar: Gate Status = Approved for sandbox QA; Pending acceptable for production until human acts.
   - ⚠ Aprobación humana: csn:gate:policy:project_run

## Instrucciones para Cursor

### Cómo obtener el prompt con tus datos reales
1. Registra el proyecto (Día 1) en la consola **/csn-console** (formulario) o con ayuda de quien tenga acceso al servidor.
2. Abre **Continuar** → **Preparar prompt** para la fase actual; copia el texto completo.
3. Pega en Cursor en el repositorio autorizado. Cursor **no** se ejecuta solo al generar el prompt.

### Prompt — Open Project Run for launch or QA sandbox
```
# Cursor — Tarea CSN (Fase 1: Intake y aprobación de alcance)

**ID de tarea (definición):** `csn:task:v2:p01:01`
**Proyecto:** {{NOMBRE_DE_TU_SITIO}} — Launch Key: {{TU_LAUNCH_KEY}}
**Clase de registro:** {{QA test-only O Production}}
**Repositorio:** {{URL_GITHUB}} (si ya existe)

## Rol
Eres ingeniero senior en la red Cam Site Network (CSN). Ejecuta **solo** esta tarea. No compres dominios, no cambies DNS de producción, no despliegues ni pagues backlinks sin un Human Gate **Approved** citado en Notion.

## Misión concreta
Create a Project Runs row: Run Type = New Site Launch (production intent) or QA Sandbox (test-only). Set Launch Key (stable string), External ID (csn:{site}:{launch}), link SOP Version = Active, Status = In progress, Current Phase = 1.

## Precondiciones
Active SOP Versions row exists. Operator knows Launch Key naming convention.

## Entregable esperado
Project Run page linked to SOP Version with Started date populated.

## Criterios de aceptación (verificables)
Run Name, Launch Key, External ID, and SOP Version relation are non-empty; Evidence URL empty until Phase 10+.

## Evidencias a registrar en Notion
Screenshot or URL of Project Run row in Notion.

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

### Prompt — Create or link CSN Sites row
```
# Cursor — Tarea CSN (Fase 1: Intake y aprobación de alcance)

**ID de tarea (definición):** `csn:task:v2:p01:02`
**Proyecto:** {{NOMBRE_DE_TU_SITIO}} — Launch Key: {{TU_LAUNCH_KEY}}
**Clase de registro:** {{QA test-only O Production}}
**Repositorio:** {{URL_GITHUB}} (si ya existe)

## Rol
Eres ingeniero senior en la red Cam Site Network (CSN). Ejecuta **solo** esta tarea. No compres dominios, no cambies DNS de producción, no despliegues ni pagues backlinks sin un Human Gate **Approved** citado en Notion.

## Misión concreta
Create CSN Sites row: Site Name, Domain (URL), Record Class = Production OR QA test-only, Launch Key matches Project Run, External ID matches run scope. Relate Site on Project Run.

## Precondiciones
csn:task:v2:p01:01 complete.

## Entregable esperado
CSN Sites row with correct Record Class and relations to Project Run.

## Criterios de aceptación (verificables)
QA test-only sites must never use Record Class = Production.

## Evidencias a registrar en Notion
CSN Sites row URL in Project Run notes or Evidence URL field on run.

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

### Prompt — Request scoped Human Gate for run intake
```
# Cursor — Tarea CSN (Fase 1: Intake y aprobación de alcance)

**ID de tarea (definición):** `csn:task:v2:p01:03`
**Proyecto:** {{NOMBRE_DE_TU_SITIO}} — Launch Key: {{TU_LAUNCH_KEY}}
**Clase de registro:** {{QA test-only O Production}}
**Repositorio:** {{URL_GITHUB}} (si ya existe)

## Rol
Eres ingeniero senior en la red Cam Site Network (CSN). Ejecuta **solo** esta tarea. No compres dominios, no cambies DNS de producción, no despliegues ni pagues backlinks sin un Human Gate **Approved** citado en Notion.

## Misión concreta
Create Human Gates row: Target Type = project_run, Target External ID = Project Run External ID, Scope lists allowed work (e.g. Notion ops only), Limits (max spend $0 for QA). Status = Pending until approver sets Approved.

## Precondiciones
Project Run External ID defined.

## Entregable esperado
Pending Human Gate uniquely tied to this run (not blanket approval).

## Criterios de aceptación (verificables)
Gate Scope and Limits mention exact run/site; no other targets referenced as approved.

## Evidencias a registrar en Notion
Human Gates row URL; approver name when Approved.

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
- [ ] Open Project Run for launch or QA sandbox: Run Name, Launch Key, External ID, and SOP Version relation are non-empty; Evidence URL empty until Phase 10+.
- [ ] Create or link CSN Sites row: QA test-only sites must never use Record Class = Production.
- [ ] Request scoped Human Gate for run intake: Gate Scope and Limits mention exact run/site; no other targets referenced as approved.

Estados en Notion Tasks: **Not started** → **In progress** → **Done** (con evidencia) o **Blocked** (con motivo).

## Si algo falla
- Anota el mensaje de error y la URL de la fila Notion afectada.
- No avances de fase si `checkPhaseReadiness` / bloqueos listan brief, repo o fase anterior incompleta.
- Gates en **Pending** o **Rejected**: usar plantilla blocked-planning; no comprar ni desplegar.
- Crea fila en **CSN Incidents** si el fallo afecta al sitio.

## Criterio para terminar el día
- [ ] Project Run Status is In progress and Current Phase = 1.
- [ ] Project Run → Site relation points to intended site row.
- [ ] Gate Status = Approved for sandbox QA; Pending acceptable for production until human acts.

**Siguiente jornada:** Día 2