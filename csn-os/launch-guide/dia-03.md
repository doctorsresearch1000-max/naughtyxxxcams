# Guía 7 días — Día 3: Experiencia, estructura y cumplimiento inicial

## Objetivo del día
Checklist de páginas legales y UX documentado en CSN Knowledge.

**Nota realista:** No sustituye diseño gráfico completo; define qué debe existir antes de lanzar.

## Fases CSN cubiertas
- Fase 7: Producto, UX, contenido y cumplimiento — Páginas legales y UX; escalar temas legales a revisión humana.

## Antes de empezar
- Acceso a Notion «Cam Sites — SOP System».
- Decidir si el sitio es **prueba (QA)** o **producción** (producción exige más gates y dominio real).
- Tener listo: nombre comercial, nicho, objetivo, brief en prosa (qué debe hacer la web).
- Navegador para expireddomains.net y web.archive.org (día 2).
- Acceso de lectura al repositorio GitHub del sitio (días 4–5).

## Pasos que debes seguir
### Bloque fase 7
1) CSN Knowledge Policy checklist. 2) CSN Incidents for blocking gaps.

1. **Compliance page checklist**
   - Qué hacer: Create CSN Knowledge checklist: age gate, 2257, privacy, terms. Link Site relation. Mark gaps in Issues via CSN Incidents if blocking.
   - Dónde: Notion (Tasks / tablas indicadas) y herramientas externas citadas en la instrucción.
   - Resultado: Knowledge article Category = Policy.
   - Comprobar: Checklist Status = In progress minimum.

## Instrucciones para Cursor

### Cómo obtener el prompt con tus datos reales
1. Registra el proyecto (Día 1) en la consola **/csn-console** (formulario) o con ayuda de quien tenga acceso al servidor.
2. Abre **Continuar** → **Preparar prompt** para la fase actual; copia el texto completo.
3. Pega en Cursor en el repositorio autorizado. Cursor **no** se ejecuta solo al generar el prompt.

### Prompt — Compliance page checklist
```
# Cursor — Tarea CSN (Fase 7: Producto, UX, contenido y cumplimiento)

**ID de tarea (definición):** `csn:task:v2:p07:01`
**Proyecto:** {{NOMBRE_DE_TU_SITIO}} — Launch Key: {{TU_LAUNCH_KEY}}
**Clase de registro:** {{QA test-only O Production}}
**Repositorio:** {{URL_GITHUB}} (si ya existe)

## Rol
Eres ingeniero senior en la red Cam Site Network (CSN). Ejecuta **solo** esta tarea. No compres dominios, no cambies DNS de producción, no despliegues ni pagues backlinks sin un Human Gate **Approved** citado en Notion.

## Misión concreta
Create CSN Knowledge checklist: age gate, 2257, privacy, terms. Link Site relation. Mark gaps in Issues via CSN Incidents if blocking.

## Precondiciones
Site row exists.

## Entregable esperado
Knowledge article Category = Policy.

## Criterios de aceptación (verificables)
Each required page listed with owner.

## Evidencias a registrar en Notion
Article URL.

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
- [ ] Compliance page checklist: Each required page listed with owner.

Estados en Notion Tasks: **Not started** → **In progress** → **Done** (con evidencia) o **Blocked** (con motivo).

## Si algo falla
- Anota el mensaje de error y la URL de la fila Notion afectada.
- No avances de fase si `checkPhaseReadiness` / bloqueos listan brief, repo o fase anterior incompleta.
- Gates en **Pending** o **Rejected**: usar plantilla blocked-planning; no comprar ni desplegar.
- Crea fila en **CSN Incidents** si el fallo afecta al sitio.

## Criterio para terminar el día
- [ ] Checklist Status = In progress minimum.

**Siguiente jornada:** Día 4