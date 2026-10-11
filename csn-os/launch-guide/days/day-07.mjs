import { notionLinks } from "../guide-context.mjs";
import { PREVIEW_STAGING, link, promptFence } from "../guide-sections.mjs";
import { PROMPT_DAY7_VALIDATION } from "../prompts-pseo.mjs";

export function renderDay07() {
  const u = notionLinks();
  return `# Día 7 — Preview, pruebas y decisión de lanzamiento

## 1. Qué vas a conseguir hoy
- **URL de preview** (local o pages.dev) registrada como evidencia.
- Checklist pSEO + funcional **pass/fail**.
- Gates producción Pending o N/A (QA).
- KPI snapshot + mantenimiento; decisión escrita lanzar / esperar / no listo.

## 2. Antes de empezar
- Días 4–6 con muestra perfiles.
- Checklist legal Día 3.

${PREVIEW_STAGING}

## 3. Tiempo
- **4–8 h** pruebas; deploy prod otro día.

## 4. Pasos

### Paso 1 — Preview
- **Qué:** Obtener URL según anexo; **example.com no cuenta como preview real**.
- **Evidencia:** ${link("Project Runs", u.projectRuns)} Evidence URL.

### Paso 2 — Validación Cursor
- **Qué:** Prompt §5 con lista exacta de URLs muestra.

### Paso 3 — Staging release
- **Qué:** ${link("CSN Releases", u.csnReleases)} staging Done si hay deploy; si solo local, Notes «evidencia local».

### Paso 4 — Gate producción
- **Qué:** Production class → gate production_deploy Pending; QA → Notes N/A.

### Paso 5 — KPI + Maintenance
- **Qué:** ${link("Launch KPI Snapshots", u.launchKpiSnapshots)} (ceros QA OK); ${link("CSN Maintenance", u.csnMaintenance)} ≥2 filas.

### Paso 6 — Decisión
- **Qué:** Notes run: «lanzar / no / esperar aprobación» sin afirmar prod live sin gate.

## 5. Prompt validación
${promptFence(PROMPT_DAY7_VALIDATION)}

## 6. Respuesta Cursor
- Tabla pruebas; bloqueantes vs mejoras.

## 7. Comprobar
- [ ] Evidence URL real (local o pages.dev)
- [ ] Muestra pSEO revisada
- [ ] Gate prod OK
- [ ] Decisión escrita

## 8. Si falla
- Sin preview: no cerrar como «listo prod»; registrar bloqueo e Incidents.

## 9. Pendiente
- Deploy prod, DNS, compras — solo con Approved.
`;
}
