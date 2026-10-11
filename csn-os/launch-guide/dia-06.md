# Guía 7 días — Día 6: SEO, autoridad y validación previa al lanzamiento

## Objetivo del día
Oportunidades SEO y backlink identificadas; gates de pago creados en pendiente.

**Nota realista:** Envío a GSC y outreach real pueden extenderse más allá del día 6.

## Fases CSN cubiertas
- Fase 8: SEO e indexación — Oportunidades SEO, sitemap y verificación en sitio renderizado.
- Fase 9: Autoridad y backlinks — Oportunidades de enlace; pagos requieren gate backlink.

## Antes de empezar
- Acceso a Notion «Cam Sites — SOP System».
- Decidir si el sitio es **prueba (QA)** o **producción** (producción exige más gates y dominio real).
- Tener listo: nombre comercial, nicho, objetivo, brief en prosa (qué debe hacer la web).
- Navegador para expireddomains.net y web.archive.org (día 2).
- Acceso de lectura al repositorio GitHub del sitio (días 4–5).

## Pasos que debes seguir
### Bloque fase 8
1) SEO Opportunities rows. 2) Sitemap/GSC steps in Knowledge (mark Unverified until GSC proof).

1. **Import SEO Opportunities**
   - Qué hacer: From GSC or manual research create SEO Opportunities rows with Target URL, Priority, link Site + Project Run.
   - Dónde: Notion (Tasks / tablas indicadas) y herramientas externas citadas en la instrucción.
   - Resultado: ≥2 SEO Opportunities rows.
   - Comprobar: ≥2 rows created.
2. **Sitemap submission plan**
   - Qué hacer: Document sitemap URL and GSC submission steps in Knowledge. Do not claim submitted unless verified in GSC UI.
   - Dónde: Notion (Tasks / tablas indicadas) y herramientas externas citadas en la instrucción.
   - Resultado: Runbook steps in Knowledge.
   - Comprobar: Steps documented.
### Bloque fase 9
1) Backlink Opportunities row. 2) Paid placement → Human Gate backlink Pending with USD Limits.

3. **Identify backlink opportunity**
   - Qué hacer: Create Backlink Opportunities row with Target, DR/Traffic notes, Outreach Status = Identified.
   - Dónde: Notion (Tasks / tablas indicadas) y herramientas externas citadas en la instrucción.
   - Resultado: Backlink Opportunities row linked to run.
   - Comprobar: Row exists.
4. **Request paid backlink Human Gate**
   - Qué hacer: Human Gates: Target Type = backlink, Target External ID = csn:backlink:{id}, Scope = single placement, Limits = max USD. Status = Pending. STOP before payment.
   - Dónde: Notion (Tasks / tablas indicadas) y herramientas externas citadas en la instrucción.
   - Resultado: Pending gate separate from domain/production gates.
   - Comprobar: Gate Status = Pending (not approved in this automation).
   - ⚠ Aprobación humana: csn:gate:policy:backlink

## Instrucciones para Cursor

### Cómo obtener el prompt con tus datos reales
1. Registra el proyecto (Día 1) en la consola **/csn-console** (formulario) o con ayuda de quien tenga acceso al servidor.
2. Abre **Continuar** → **Preparar prompt** para la fase actual; copia el texto completo.
3. Pega en Cursor en el repositorio autorizado. Cursor **no** se ejecuta solo al generar el prompt.

### Prompt — Import SEO Opportunities
```
# Cursor — Tarea CSN (Fase 8: SEO e indexación)

**ID de tarea (definición):** `csn:task:v2:p08:01`
**Proyecto:** {{NOMBRE_DE_TU_SITIO}} — Launch Key: {{TU_LAUNCH_KEY}}
**Clase de registro:** {{QA test-only O Production}}
**Repositorio:** {{URL_GITHUB}} (si ya existe)

## Rol
Eres ingeniero senior en la red Cam Site Network (CSN). Ejecuta **solo** esta tarea. No compres dominios, no cambies DNS de producción, no despliegues ni pagues backlinks sin un Human Gate **Approved** citado en Notion.

## Misión concreta
From GSC or manual research create SEO Opportunities rows with Target URL, Priority, link Site + Project Run.

## Precondiciones
Staging or prod URL known (sandbox: example URL).

## Entregable esperado
≥2 SEO Opportunities rows.

## Criterios de aceptación (verificables)
Unverified if GSC API not run — note in Notes.

## Evidencias a registrar en Notion
Opportunity row URLs.

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

### Prompt — Sitemap submission plan
```
# Cursor — Tarea CSN (Fase 8: SEO e indexación)

**ID de tarea (definición):** `csn:task:v2:p08:02`
**Proyecto:** {{NOMBRE_DE_TU_SITIO}} — Launch Key: {{TU_LAUNCH_KEY}}
**Clase de registro:** {{QA test-only O Production}}
**Repositorio:** {{URL_GITHUB}} (si ya existe)

## Rol
Eres ingeniero senior en la red Cam Site Network (CSN). Ejecuta **solo** esta tarea. No compres dominios, no cambies DNS de producción, no despliegues ni pagues backlinks sin un Human Gate **Approved** citado en Notion.

## Misión concreta
Document sitemap URL and GSC submission steps in Knowledge. Do not claim submitted unless verified in GSC UI.

## Precondiciones
csn:task:v2:p08:01.

## Entregable esperado
Runbook steps in Knowledge.

## Criterios de aceptación (verificables)
Marked Unverified until GSC confirmation captured.

## Evidencias a registrar en Notion
Knowledge URL.

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

### Prompt — Identify backlink opportunity
```
# Cursor — Tarea CSN (Fase 9: Autoridad y backlinks)

**ID de tarea (definición):** `csn:task:v2:p09:01`
**Proyecto:** {{NOMBRE_DE_TU_SITIO}} — Launch Key: {{TU_LAUNCH_KEY}}
**Clase de registro:** {{QA test-only O Production}}
**Repositorio:** {{URL_GITHUB}} (si ya existe)

## Rol
Eres ingeniero senior en la red Cam Site Network (CSN). Ejecuta **solo** esta tarea. No compres dominios, no cambies DNS de producción, no despliegues ni pagues backlinks sin un Human Gate **Approved** citado en Notion.

## Misión concreta
Create Backlink Opportunities row with Target, DR/Traffic notes, Outreach Status = Identified.

## Precondiciones
SEO baseline started.

## Entregable esperado
Backlink Opportunities row linked to run.

## Criterios de aceptación (verificables)
No outreach sent without gate for paid links.

## Evidencias a registrar en Notion
Row URL.

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

### Prompt — Request paid backlink Human Gate
```
# Cursor — Tarea CSN (Fase 9: Autoridad y backlinks)

**ID de tarea (definición):** `csn:task:v2:p09:02`
**Proyecto:** {{NOMBRE_DE_TU_SITIO}} — Launch Key: {{TU_LAUNCH_KEY}}
**Clase de registro:** {{QA test-only O Production}}
**Repositorio:** {{URL_GITHUB}} (si ya existe)

## Rol
Eres ingeniero senior en la red Cam Site Network (CSN). Ejecuta **solo** esta tarea. No compres dominios, no cambies DNS de producción, no despliegues ni pagues backlinks sin un Human Gate **Approved** citado en Notion.

## Misión concreta
Human Gates: Target Type = backlink, Target External ID = csn:backlink:{id}, Scope = single placement, Limits = max USD. Status = Pending. STOP before payment.

## Precondiciones
csn:task:v2:p09:01.

## Entregable esperado
Pending gate separate from domain/production gates.

## Criterios de aceptación (verificables)
Limits field includes dollar cap.

## Evidencias a registrar en Notion
Gate row URL.

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
- [ ] Import SEO Opportunities: Unverified if GSC API not run — note in Notes.
- [ ] Sitemap submission plan: Marked Unverified until GSC confirmation captured.
- [ ] Identify backlink opportunity: No outreach sent without gate for paid links.
- [ ] Request paid backlink Human Gate: Limits field includes dollar cap.

Estados en Notion Tasks: **Not started** → **In progress** → **Done** (con evidencia) o **Blocked** (con motivo).

## Si algo falla
- Anota el mensaje de error y la URL de la fila Notion afectada.
- No avances de fase si `checkPhaseReadiness` / bloqueos listan brief, repo o fase anterior incompleta.
- Gates en **Pending** o **Rejected**: usar plantilla blocked-planning; no comprar ni desplegar.
- Crea fila en **CSN Incidents** si el fallo afecta al sitio.

## Criterio para terminar el día
- [ ] ≥2 rows created.
- [ ] Steps documented.
- [ ] Row exists.
- [ ] Gate Status = Pending (not approved in this automation).

**Siguiente jornada:** Día 7