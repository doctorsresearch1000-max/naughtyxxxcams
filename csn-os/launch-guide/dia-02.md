# Guía 7 días — Día 2: Dominio, infraestructura y arquitectura

## Objetivo del día
Candidatos de dominio evaluados, decisión documentada y plan DNS/hosting en Conocimiento.

**Nota realista:** La compra de dominio requiere aprobación humana (gate); puede quedar pendiente sin bloquear el plan.

## Fases CSN cubiertas
- Fase 2: Investigación de dominios expirados — Buscar candidatos en expireddomains.net, revisar historial y puntuar sin comprar.
- Fase 3: Selección y preparación de registro — Elegir dominio y preparar compra; requiere gate domain_candidate Approved.
- Fase 4: Arquitectura, DNS y hosting — Documentar arquitectura y DNS; sin cutover de producción sin gate.

## Antes de empezar
- Acceso a Notion «Cam Sites — SOP System».
- Decidir si el sitio es **prueba (QA)** o **producción** (producción exige más gates y dominio real).
- Tener listo: nombre comercial, nicho, objetivo, brief en prosa (qué debe hacer la web).
- Navegador para expireddomains.net y web.archive.org (día 2).

## Pasos que debes seguir
### Bloque fase 2
1) expireddomains.net Deleted Domains + filters. 2) Export candidates → Domain Candidates (Source=expireddomains.net). 3) Wayback/archive review per row. 4) Score relevance in Notes
 pick primary. 5) Create domain_candidate Human Gate (Pending) before purchase.

1. **expireddomains.net search and export**
   - Qué hacer: Go to https://www.expireddomains.net/ → Deleted Domains. Apply filters (TLD, length, no adult-blocked TLDs per policy). Export candidate list. For each candidate create Domain Candidates row: Source = expireddomains.net, Domain title, link Site + Project Run, Status = Not started.
   - Dónde: Notion (Tasks / tablas indicadas) y herramientas externas citadas en la instrucción.
   - Resultado: ≥3 Domain Candidates rows with Source = expireddomains.net.
   - Comprobar: Domain Candidates count ≥ 3 for the run.
2. **Historical / Wayback review per candidate**
   - Qué hacer: For each Domain Candidate open web.archive.org and registrar history notes. Record Wayback Last Good date if clean; set Status = Blocked if spam/malware history. Document findings in Notes.
   - Dónde: Notion (Tasks / tablas indicadas) y herramientas externas citadas en la instrucción.
   - Resultado: Every candidate has Notes with history summary.
   - Comprobar: No candidate remains Not started without Notes.
3. **Relevance scoring and rank**
   - Qué hacer: Score topical fit (1–5) in Notes; optional Ahrefs DR in Ahrefs DR field if tool available. Mark top candidate Status = In progress; others remain Not started or Blocked.
   - Dónde: Notion (Tasks / tablas indicadas) y herramientas externas citadas en la instrucción.
   - Resultado: Single preferred candidate identified in Notes on Project Run.
   - Comprobar: One candidate marked In progress as primary pick.
4. **Request domain purchase Human Gate**
   - Qué hacer: Create Human Gates: Target Type = domain_candidate, Target External ID = csn:domain:{domain}:{runExternalId}, Scope = register specific domain at named registrar, Limits = max price USD. Status = Pending. STOP — do not purchase until Approved.
   - Dónde: Notion (Tasks / tablas indicadas) y herramientas externas citadas en la instrucción.
   - Resultado: Pending gate tied to one domain only.
   - Comprobar: Gate exists and remains Pending until human purchase approval.
   - ⚠ Aprobación humana: csn:gate:policy:domain_candidate
### Bloque fase 3
1) Confirm domain_candidate gate Approved for production (sandbox: document STOP if Pending). 2) Document rationale on Domain Candidates. 3) Update run Current Phase = 3.

5. **Confirm domain purchase gate status**
   - Qué hacer: Verify Human Gate for domain_candidate is Approved before any registrar checkout. If Pending or Rejected, stop and escalate.
   - Dónde: Notion (Tasks / tablas indicadas) y herramientas externas citadas en la instrucción.
   - Resultado: Gate Status documented on Project Run Notes.
   - Comprobar: For sandbox: gate may remain Pending and operator documents STOP. For prod: must be Approved.
   - ⚠ Aprobación humana: csn:gate:policy:domain_candidate
6. **Document selection rationale**
   - Qué hacer: Update winning Domain Candidates Notes with rationale; set Project Run Current Phase = 3.
   - Dónde: Notion (Tasks / tablas indicadas) y herramientas externas citadas en la instrucción.
   - Resultado: Rationale paragraph in Notion.
   - Comprobar: Notes length > 50 chars with decision summary.
### Bloque fase 4
1) CSN Knowledge runbook: DNS table. 2) Sandbox hostname plan (QA: example/staging only). 3) Optional CSN Maintenance seed for DNS review.

7. **DNS and hosting plan in CSN Knowledge**
   - Qué hacer: Create or update CSN Knowledge runbook entry for the site: DNS records, Cloudflare Pages project name, apex vs www. Link from Project Run Evidence URL.
   - Dónde: Notion (Tasks / tablas indicadas) y herramientas externas citadas en la instrucción.
   - Resultado: Knowledge article Category = Runbook linked to Site.
   - Comprobar: Article Status = Done or In progress with complete DNS table.
8. **Sandbox DNS checklist (no prod cutover)**
   - Qué hacer: Document sandbox/staging hostnames only. Do not change production DNS for QA test-only sites.
   - Dónde: Notion (Tasks / tablas indicadas) y herramientas externas citadas en la instrucción.
   - Resultado: Checklist in Knowledge or Project Run Notes.
   - Comprobar: Checklist marked complete in Notes.

## Instrucciones para Cursor

### Cómo obtener el prompt con tus datos reales
1. Registra el proyecto (Día 1) en la consola **/csn-console** (formulario) o con ayuda de quien tenga acceso al servidor.
2. Abre **Continuar** → **Preparar prompt** para la fase actual; copia el texto completo.
3. Pega en Cursor en el repositorio autorizado. Cursor **no** se ejecuta solo al generar el prompt.

### Prompt — expireddomains.net search and export
```
# Cursor — Tarea CSN (Fase 2: Investigación de dominios expirados)

**ID de tarea (definición):** `csn:task:v2:p02:01`
**Proyecto:** {{NOMBRE_DE_TU_SITIO}} — Launch Key: {{TU_LAUNCH_KEY}}
**Clase de registro:** {{QA test-only O Production}}
**Repositorio:** {{URL_GITHUB}} (si ya existe)

## Rol
Eres ingeniero senior en la red Cam Site Network (CSN). Ejecuta **solo** esta tarea. No compres dominios, no cambies DNS de producción, no despliegues ni pagues backlinks sin un Human Gate **Approved** citado en Notion.

## Misión concreta
Go to https://www.expireddomains.net/ → Deleted Domains. Apply filters (TLD, length, no adult-blocked TLDs per policy). Export candidate list. For each candidate create Domain Candidates row: Source = expireddomains.net, Domain title, link Site + Project Run, Status = Not started.

## Precondiciones
Phase 1 complete; intake gate Approved for research scope.

## Entregable esperado
≥3 Domain Candidates rows with Source = expireddomains.net.

## Criterios de aceptación (verificables)
Each row linked to same Project Run and Site; no purchase actions performed.

## Evidencias a registrar en Notion
CSV export filename/date in Notes; filter screenshot optional.

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

### Prompt — Historical / Wayback review per candidate
```
# Cursor — Tarea CSN (Fase 2: Investigación de dominios expirados)

**ID de tarea (definición):** `csn:task:v2:p02:02`
**Proyecto:** {{NOMBRE_DE_TU_SITIO}} — Launch Key: {{TU_LAUNCH_KEY}}
**Clase de registro:** {{QA test-only O Production}}
**Repositorio:** {{URL_GITHUB}} (si ya existe)

## Rol
Eres ingeniero senior en la red Cam Site Network (CSN). Ejecuta **solo** esta tarea. No compres dominios, no cambies DNS de producción, no despliegues ni pagues backlinks sin un Human Gate **Approved** citado en Notion.

## Misión concreta
For each Domain Candidate open web.archive.org and registrar history notes. Record Wayback Last Good date if clean; set Status = Blocked if spam/malware history. Document findings in Notes.

## Precondiciones
csn:task:v2:p02:01.

## Entregable esperado
Every candidate has Notes with history summary.

## Criterios de aceptación (verificables)
Blocked candidates must not proceed to Phase 3 selection.

## Evidencias a registrar en Notion
Wayback URL pasted in Notes per candidate.

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

### Prompt — Relevance scoring and rank
```
# Cursor — Tarea CSN (Fase 2: Investigación de dominios expirados)

**ID de tarea (definición):** `csn:task:v2:p02:03`
**Proyecto:** {{NOMBRE_DE_TU_SITIO}} — Launch Key: {{TU_LAUNCH_KEY}}
**Clase de registro:** {{QA test-only O Production}}
**Repositorio:** {{URL_GITHUB}} (si ya existe)

## Rol
Eres ingeniero senior en la red Cam Site Network (CSN). Ejecuta **solo** esta tarea. No compres dominios, no cambies DNS de producción, no despliegues ni pagues backlinks sin un Human Gate **Approved** citado en Notion.

## Misión concreta
Score topical fit (1–5) in Notes; optional Ahrefs DR in Ahrefs DR field if tool available. Mark top candidate Status = In progress; others remain Not started or Blocked.

## Precondiciones
csn:task:v2:p02:02.

## Entregable esperado
Single preferred candidate identified in Notes on Project Run.

## Criterios de aceptación (verificables)
Scoring rubric documented in CSN Knowledge TEMPLATE: Domain candidate evaluation.

## Evidencias a registrar en Notion
Project Run Evidence URL or Notes listing ranked domain.

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

### Prompt — Request domain purchase Human Gate
```
# Cursor — Tarea CSN (Fase 2: Investigación de dominios expirados)

**ID de tarea (definición):** `csn:task:v2:p02:04`
**Proyecto:** {{NOMBRE_DE_TU_SITIO}} — Launch Key: {{TU_LAUNCH_KEY}}
**Clase de registro:** {{QA test-only O Production}}
**Repositorio:** {{URL_GITHUB}} (si ya existe)

## Rol
Eres ingeniero senior en la red Cam Site Network (CSN). Ejecuta **solo** esta tarea. No compres dominios, no cambies DNS de producción, no despliegues ni pagues backlinks sin un Human Gate **Approved** citado en Notion.

## Misión concreta
Create Human Gates: Target Type = domain_candidate, Target External ID = csn:domain:{domain}:{runExternalId}, Scope = register specific domain at named registrar, Limits = max price USD. Status = Pending. STOP — do not purchase until Approved.

## Precondiciones
Primary candidate chosen.

## Entregable esperado
Pending gate tied to one domain only.

## Criterios de aceptación (verificables)
Target External ID matches exactly one Domain Candidates row.

## Evidencias a registrar en Notion
Human Gates row URL.

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

### Prompt — Confirm domain purchase gate status
```
# Cursor — Tarea CSN (Fase 3: Selección y preparación de registro)

**ID de tarea (definición):** `csn:task:v2:p03:01`
**Proyecto:** {{NOMBRE_DE_TU_SITIO}} — Launch Key: {{TU_LAUNCH_KEY}}
**Clase de registro:** {{QA test-only O Production}}
**Repositorio:** {{URL_GITHUB}} (si ya existe)

## Rol
Eres ingeniero senior en la red Cam Site Network (CSN). Ejecuta **solo** esta tarea. No compres dominios, no cambies DNS de producción, no despliegues ni pagues backlinks sin un Human Gate **Approved** citado en Notion.

## Misión concreta
Verify Human Gate for domain_candidate is Approved before any registrar checkout. If Pending or Rejected, stop and escalate.

## Precondiciones
csn:task:v2:p02:04.

## Entregable esperado
Gate Status documented on Project Run Notes.

## Criterios de aceptación (verificables)
No registrar payment without Approved gate (policy control; not API-enforced).

## Evidencias a registrar en Notion
Gate Status field screenshot.

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

### Prompt — Document selection rationale
```
# Cursor — Tarea CSN (Fase 3: Selección y preparación de registro)

**ID de tarea (definición):** `csn:task:v2:p03:02`
**Proyecto:** {{NOMBRE_DE_TU_SITIO}} — Launch Key: {{TU_LAUNCH_KEY}}
**Clase de registro:** {{QA test-only O Production}}
**Repositorio:** {{URL_GITHUB}} (si ya existe)

## Rol
Eres ingeniero senior en la red Cam Site Network (CSN). Ejecuta **solo** esta tarea. No compres dominios, no cambies DNS de producción, no despliegues ni pagues backlinks sin un Human Gate **Approved** citado en Notion.

## Misión concreta
Update winning Domain Candidates Notes with rationale; set Project Run Current Phase = 3.

## Precondiciones
csn:task:v2:p02:03.

## Entregable esperado
Rationale paragraph in Notion.

## Criterios de aceptación (verificables)
References scoring from Phase 2.

## Evidencias a registrar en Notion
Domain Candidates Notes URL.

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

### Prompt — DNS and hosting plan in CSN Knowledge
```
# Cursor — Tarea CSN (Fase 4: Arquitectura, DNS y hosting)

**ID de tarea (definición):** `csn:task:v2:p04:01`
**Proyecto:** {{NOMBRE_DE_TU_SITIO}} — Launch Key: {{TU_LAUNCH_KEY}}
**Clase de registro:** {{QA test-only O Production}}
**Repositorio:** {{URL_GITHUB}} (si ya existe)

## Rol
Eres ingeniero senior en la red Cam Site Network (CSN). Ejecuta **solo** esta tarea. No compres dominios, no cambies DNS de producción, no despliegues ni pagues backlinks sin un Human Gate **Approved** citado en Notion.

## Misión concreta
Create or update CSN Knowledge runbook entry for the site: DNS records, Cloudflare Pages project name, apex vs www. Link from Project Run Evidence URL.

## Precondiciones
Site row exists.

## Entregable esperado
Knowledge article Category = Runbook linked to Site.

## Criterios de aceptación (verificables)
No secrets in article; only hostnames and record types.

## Evidencias a registrar en Notion
CSN Knowledge article URL.

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

### Prompt — Sandbox DNS checklist (no prod cutover)
```
# Cursor — Tarea CSN (Fase 4: Arquitectura, DNS y hosting)

**ID de tarea (definición):** `csn:task:v2:p04:02`
**Proyecto:** {{NOMBRE_DE_TU_SITIO}} — Launch Key: {{TU_LAUNCH_KEY}}
**Clase de registro:** {{QA test-only O Production}}
**Repositorio:** {{URL_GITHUB}} (si ya existe)

## Rol
Eres ingeniero senior en la red Cam Site Network (CSN). Ejecuta **solo** esta tarea. No compres dominios, no cambies DNS de producción, no despliegues ni pagues backlinks sin un Human Gate **Approved** citado en Notion.

## Misión concreta
Document sandbox/staging hostnames only. Do not change production DNS for QA test-only sites.

## Precondiciones
Record Class verified.

## Entregable esperado
Checklist in Knowledge or Project Run Notes.

## Criterios de aceptación (verificables)
QA test-only sites use example.com or staging subdomain only.

## Evidencias a registrar en Notion
Notes stating no prod DNS change.

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
- [ ] expireddomains.net search and export: Each row linked to same Project Run and Site; no purchase actions performed.
- [ ] Historical / Wayback review per candidate: Blocked candidates must not proceed to Phase 3 selection.
- [ ] Relevance scoring and rank: Scoring rubric documented in CSN Knowledge TEMPLATE: Domain candidate evaluation.
- [ ] Request domain purchase Human Gate: Target External ID matches exactly one Domain Candidates row.
- [ ] Confirm domain purchase gate status: No registrar payment without Approved gate (policy control; not API-enforced).
- [ ] Document selection rationale: References scoring from Phase 2.
- [ ] DNS and hosting plan in CSN Knowledge: No secrets in article; only hostnames and record types.
- [ ] Sandbox DNS checklist (no prod cutover): QA test-only sites use example.com or staging subdomain only.

Estados en Notion Tasks: **Not started** → **In progress** → **Done** (con evidencia) o **Blocked** (con motivo).

## Si algo falla
- Anota el mensaje de error y la URL de la fila Notion afectada.
- No avances de fase si `checkPhaseReadiness` / bloqueos listan brief, repo o fase anterior incompleta.
- Gates en **Pending** o **Rejected**: usar plantilla blocked-planning; no comprar ni desplegar.
- Crea fila en **CSN Incidents** si el fallo afecta al sitio.

## Criterio para terminar el día
- [ ] Domain Candidates count ≥ 3 for the run.
- [ ] No candidate remains Not started without Notes.
- [ ] One candidate marked In progress as primary pick.
- [ ] Gate exists and remains Pending until human purchase approval.
- [ ] For sandbox: gate may remain Pending and operator documents STOP. For prod: must be Approved.
- [ ] Notes length > 50 chars with decision summary.
- [ ] Article Status = Done or In progress with complete DNS table.
- [ ] Checklist marked complete in Notes.

**Siguiente jornada:** Día 3