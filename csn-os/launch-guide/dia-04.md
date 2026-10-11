# Guía 7 días — Día 4: Repositorio, CI y calidad de código

## Objetivo del día
Repositorio enlazado, release sandbox y evidencia de CI en Notion.

**Nota realista:** Requiere acceso al repositorio GitHub del sitio.

## Fases CSN cubiertas
- Fase 5: Repositorio y CI — Inspeccionar repo, CI y evidencias de lint/test.

## Antes de empezar
- Acceso a Notion «Cam Sites — SOP System».
- Decidir si el sitio es **prueba (QA)** o **producción** (producción exige más gates y dominio real).
- Tener listo: nombre comercial, nicho, objetivo, brief en prosa (qué debe hacer la web).
- Navegador para expireddomains.net y web.archive.org (día 2).
- Acceso de lectura al repositorio GitHub del sitio (días 4–5).

## Pasos que debes seguir
### Bloque fase 5
1) Document repo URL. 2) CSN Releases sandbox row. 3) Store GitHub Actions run URL in Release Notes.

1. **Repository and branch strategy**
   - Qué hacer: Document GitHub repo URL on CSN Sites Notes or Knowledge. Create CSN Releases row Environment = sandbox, Status = Not started, Git SHA when available.
   - Dónde: Notion (Tasks / tablas indicadas) y herramientas externas citadas en la instrucción.
   - Resultado: CSN Releases row linked to Site and Project Run.
   - Comprobar: At least one CSN Releases row exists for run.
2. **CI workflow verification (repo)**
   - Qué hacer: In GitHub: confirm workflow runs lint/test on PR. Record workflow URL in Release Notes or Knowledge. Command locally: npm run lint && npm test (if applicable).
   - Dónde: Notion (Tasks / tablas indicadas) y herramientas externas citadas en la instrucción.
   - Resultado: CI green on main or PR link stored.
   - Comprobar: Evidence URL or Release Notes contains Actions link.

## Instrucciones para Cursor

### Cómo obtener el prompt con tus datos reales
1. Registra el proyecto (Día 1) en la consola **/csn-console** (formulario) o con ayuda de quien tenga acceso al servidor.
2. Abre **Continuar** → **Preparar prompt** para la fase actual; copia el texto completo.
3. Pega en Cursor en el repositorio autorizado. Cursor **no** se ejecuta solo al generar el prompt.

### Prompt — Repository and branch strategy
```
# Cursor — Tarea CSN (Fase 5: Repositorio y CI)

**ID de tarea (definición):** `csn:task:v2:p05:01`
**Proyecto:** {{NOMBRE_DE_TU_SITIO}} — Launch Key: {{TU_LAUNCH_KEY}}
**Clase de registro:** {{QA test-only O Production}}
**Repositorio:** {{URL_GITHUB}} (si ya existe)

## Rol
Eres ingeniero senior en la red Cam Site Network (CSN). Ejecuta **solo** esta tarea. No compres dominios, no cambies DNS de producción, no despliegues ni pagues backlinks sin un Human Gate **Approved** citado en Notion.

## Misión concreta
Document GitHub repo URL on CSN Sites Notes or Knowledge. Create CSN Releases row Environment = sandbox, Status = Not started, Git SHA when available.

## Precondiciones
Phase 4 DNS plan drafted.

## Entregable esperado
CSN Releases row linked to Site and Project Run.

## Criterios de aceptación (verificables)
Repo URL is public https GitHub link.

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

### Prompt — CI workflow verification (repo)
```
# Cursor — Tarea CSN (Fase 5: Repositorio y CI)

**ID de tarea (definición):** `csn:task:v2:p05:02`
**Proyecto:** {{NOMBRE_DE_TU_SITIO}} — Launch Key: {{TU_LAUNCH_KEY}}
**Clase de registro:** {{QA test-only O Production}}
**Repositorio:** {{URL_GITHUB}} (si ya existe)

## Rol
Eres ingeniero senior en la red Cam Site Network (CSN). Ejecuta **solo** esta tarea. No compres dominios, no cambies DNS de producción, no despliegues ni pagues backlinks sin un Human Gate **Approved** citado en Notion.

## Misión concreta
In GitHub: confirm workflow runs lint/test on PR. Record workflow URL in Release Notes or Knowledge. Command locally: npm run lint && npm test (if applicable).

## Precondiciones
csn:task:v2:p05:01.

## Entregable esperado
CI green on main or PR link stored.

## Criterios de aceptación (verificables)
Do not claim success without a workflow run URL.

## Evidencias a registrar en Notion
GitHub Actions run URL in Notion rich text.

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
- [ ] Repository and branch strategy: Repo URL is public https GitHub link.
- [ ] CI workflow verification (repo): Do not claim success without a workflow run URL.

Estados en Notion Tasks: **Not started** → **In progress** → **Done** (con evidencia) o **Blocked** (con motivo).

## Si algo falla
- Anota el mensaje de error y la URL de la fila Notion afectada.
- No avances de fase si `checkPhaseReadiness` / bloqueos listan brief, repo o fase anterior incompleta.
- Gates en **Pending** o **Rejected**: usar plantilla blocked-planning; no comprar ni desplegar.
- Crea fila en **CSN Incidents** si el fallo afecta al sitio.

## Criterio para terminar el día
- [ ] At least one CSN Releases row exists for run.
- [ ] Evidence URL or Release Notes contains Actions link.

**Siguiente jornada:** Día 5