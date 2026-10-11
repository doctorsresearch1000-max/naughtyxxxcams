import { notionLinks } from "../guide-context.mjs";

export function renderDay07() {
  const n = notionLinks();
  return `# Día 7 — Comprueba la web y decide el lanzamiento

## 1. Qué vas a conseguir hoy

**Evidencia de staging** (URL de preview), decisión documentada sobre **producción** (gate Pending o N/A en QA), **snapshot KPI** de lanzamiento y **rutinas de mantenimiento** — sin asumir que la web ya está en producción.

## 2. Qué necesitas antes de empezar

- CI documentado (Día 4).
- Checklist legal (Día 3).
- **Staging:** versión de la web para probar antes del lanzamiento público.

## 3. Tiempo estimado y dependencias

| | |
|--|--|
| **Tiempo** | 4–8 horas de pruebas; deploy prod puede ser otro día |
| **Producción** | Solo con Human Gate **production_deploy** Approved |

## 4. Pasos

### Paso 1 — Release de staging

- **Qué hacer:** [CSN Releases](${n.csnReleases}) · **Environment** = staging · **Status** In progress → Done cuando tengas preview · **Git SHA** · enlaces Site y Run.
- **Comprobar:** URL de preview en Notes o Evidence URL del run.

### Paso 2 — Gate de staging (si aplica)

- Si la preview usa DNS público con impacto, crea gate **staging_deploy** con hostnames listados. En QA con example.com, escribe en Notes: «no se requiere gate staging».

### Paso 3 — Evidencia en Project Run

- **Qué hacer:** Rellena **Evidence URL** del [Project Run](${n.projectRuns}) con la preview · **Current Phase** = 10.
- **Comprobar:** QA no afirma lanzamiento producción.

### Paso 4 — Gate de producción (solo Production)

- **Qué hacer:** Si Record Class es **Production**, [Human Gates](${n.humanGates}) · **production_deploy** · Pending · NO desplegar. Si es **QA test-only**, anota en Notes «N/A QA» y no crees deploy prod.

### Paso 5 — Fila release producción bloqueada

- **Qué hacer:** CSN Releases · **production** · **Blocked** o Not started · sin SHA hasta deploy real aprobado.

### Paso 6 — Launch KPI Snapshot

- **Qué hacer:** [Launch KPI Snapshots](${n.launchKpiSnapshots}) · métricas (ceros OK en QA) · Record Class igual que el Site.

### Paso 7 — Mantenimiento

- **Qué hacer:** [CSN Maintenance](${n.csnMaintenance}) · ≥2 filas (ej. revisión semanal KPI, salud del feed) · cadencia definida.

### Paso 8 — Cerrar el run (QA)

- En QA puedes poner run **Done** solo si Evidence URL existe y gates prod son N/A. En producción real, **In progress** hasta deploy aprobado.

## 5. Prompt listo para copiar en Cursor

\`\`\`
# Día 7 — Lista de pruebas en staging (sin deploy prod)

## Objetivo
Generar checklist de QA manual para la preview del sitio de cams.

## Contexto
- URL preview: [URL STAGING]
- Repo: [URL]
- QA o producción: [QA / Producción]

## Tareas
1. Checklist: home carga, enlaces afiliado, age gate, páginas legales enlazadas, perfiles LIVE/OFFLINE coherentes si aplica al repo.
2. Separar «bloqueante lanzamiento» vs «mejora».
3. Texto para Evidence URL y Notes de cierre.

## Límites
- No ejecutar deploy a producción.
- No marcar KPI reales de producción en QA.

## Entregables
Checklist markdown + resumen para Notion.
\`\`\`

## 6. Qué revisar en la respuesta de Cursor

Éxito: pruebas concretas según tu URL. Fallo: «listo para producción» sin gate.

## 7. Cuándo terminar el día

- [ ] Release staging Done con enlace verificable.
- [ ] Evidence URL en Project Run.
- [ ] Gate prod Pending o N/A QA documentado.
- [ ] Launch KPI Snapshot + ≥2 Maintenance.
- [ ] Decisión escrita: «lanzar / no lanzar / esperar aprobación».

## 8. Qué queda pendiente

Deploy producción, compras, DNS cutover, KPI legacy del hub (sync separado — no mezclar QA).

**Fin del calendario objetivo de 7 días.** El mantenimiento continúa según filas CSN Maintenance.
`;
}
