# Guía 7 días — Día 5: Integraciones, feeds y monetización técnica

## Objetivo del día
Política de secretos (CrakRevenue/Cloudflare) documentada y Feed Sync Run registrado.

**Nota realista:** Basado en procedimientos del stack cam (HasOffers/CrakRevenue) del repo operativo.

## Fases CSN cubiertas
- Fase 6: Afiliación e integración de feeds — APIs oficiales, secretos fuera de Notion, registrar Feed Sync Runs.

## Antes de empezar
- Acceso a Notion «Cam Sites — SOP System».
- Decidir si el sitio es **prueba (QA)** o **producción** (producción exige más gates y dominio real).
- Tener listo: nombre comercial, nicho, objetivo, brief en prosa (qué debe hacer la web).
- Navegador para expireddomains.net y web.archive.org (día 2).
- Acceso de lectura al repositorio GitHub del sitio (días 4–5).

## Pasos que debes seguir
### Bloque fase 6
1) Knowledge article: secrets in GitHub Actions + Cloudflare only (names not values). 2) Feed Sync Runs row (simulated OK for QA). 3) Audit: no tokens in Notion.

1. **Document affiliate credential storage (outside Notion)**
   - Qué hacer: Record in CSN Knowledge: CrakRevenue / HasOffers keys live in GitHub Actions secrets (CRAKREVENUE_API_KEY) and Cloudflare env — never in Notion. Link to repo docs/CLOUDFLARE-DEPLOY-AUTH.md if present.
   - Dónde: Notion (Tasks / tablas indicadas) y herramientas externas citadas en la instrucción.
   - Resultado: Knowledge Policy article listing secret names only (not values).
   - Comprobar: Article mentions GitHub Secrets + Cloudflare as sole stores.
2. **Log Feed Sync Run**
   - Qué hacer: After a feed job runs (or simulated sandbox): create Feed Sync Runs row with Feed Provider, Started/Finished, Rows Upserted, link Site + Project Run.
   - Dónde: Notion (Tasks / tablas indicadas) y herramientas externas citadas en la instrucción.
   - Resultado: Feed Sync Runs row Status = Done for sandbox simulation.
   - Comprobar: Feed Sync Runs row exists for run.

## Instrucciones para Cursor

### Cómo obtener el prompt con tus datos reales
1. Registra el proyecto (Día 1) en la consola **/csn-console** (formulario) o con ayuda de quien tenga acceso al servidor.
2. Abre **Continuar** → **Preparar prompt** para la fase actual; copia el texto completo.
3. Pega en Cursor en el repositorio autorizado. Cursor **no** se ejecuta solo al generar el prompt.

### Prompt — Document affiliate credential storage (outside Notion)
```
# Cursor — Tarea CSN (Fase 6: Afiliación e integración de feeds)

**ID de tarea (definición):** `csn:task:v2:p06:01`
**Proyecto:** {{NOMBRE_DE_TU_SITIO}} — Launch Key: {{TU_LAUNCH_KEY}}
**Clase de registro:** {{QA test-only O Production}}
**Repositorio:** {{URL_GITHUB}} (si ya existe)

## Rol
Eres ingeniero senior en la red Cam Site Network (CSN). Ejecuta **solo** esta tarea. No compres dominios, no cambies DNS de producción, no despliegues ni pagues backlinks sin un Human Gate **Approved** citado en Notion.

## Misión concreta
Record in CSN Knowledge: CrakRevenue / HasOffers keys live in GitHub Actions secrets (CRAKREVENUE_API_KEY) and Cloudflare env — never in Notion. Link to repo docs/CLOUDFLARE-DEPLOY-AUTH.md if present.

## Precondiciones
Repo identified.

## Entregable esperado
Knowledge Policy article listing secret names only (not values).

## Criterios de aceptación (verificables)
No API keys pasted into any Notion property.

## Evidencias a registrar en Notion
Knowledge article URL.

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

### Prompt — Log Feed Sync Run
```
# Cursor — Tarea CSN (Fase 6: Afiliación e integración de feeds)

**ID de tarea (definición):** `csn:task:v2:p06:02`
**Proyecto:** {{NOMBRE_DE_TU_SITIO}} — Launch Key: {{TU_LAUNCH_KEY}}
**Clase de registro:** {{QA test-only O Production}}
**Repositorio:** {{URL_GITHUB}} (si ya existe)

## Rol
Eres ingeniero senior en la red Cam Site Network (CSN). Ejecuta **solo** esta tarea. No compres dominios, no cambies DNS de producción, no despliegues ni pagues backlinks sin un Human Gate **Approved** citado en Notion.

## Misión concreta
After a feed job runs (or simulated sandbox): create Feed Sync Runs row with Feed Provider, Started/Finished, Rows Upserted, link Site + Project Run.

## Precondiciones
csn:task:v2:p06:01.

## Entregable esperado
Feed Sync Runs row Status = Done for sandbox simulation.

## Criterios de aceptación (verificables)
Sandbox may use Rows Upserted = 0 with Notes 'simulated'.

## Evidencias a registrar en Notion
Feed Sync Runs row URL.

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
- [ ] Document affiliate credential storage (outside Notion): No API keys pasted into any Notion property.
- [ ] Log Feed Sync Run: Sandbox may use Rows Upserted = 0 with Notes 'simulated'.

Estados en Notion Tasks: **Not started** → **In progress** → **Done** (con evidencia) o **Blocked** (con motivo).

## Si algo falla
- Anota el mensaje de error y la URL de la fila Notion afectada.
- No avances de fase si `checkPhaseReadiness` / bloqueos listan brief, repo o fase anterior incompleta.
- Gates en **Pending** o **Rejected**: usar plantilla blocked-planning; no comprar ni desplegar.
- Crea fila en **CSN Incidents** si el fallo afecta al sitio.

## Criterio para terminar el día
- [ ] Article mentions GitHub Secrets + Cloudflare as sole stores.
- [ ] Feed Sync Runs row exists for run.

**Siguiente jornada:** Día 6