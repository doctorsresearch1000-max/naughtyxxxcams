import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TASKS = JSON.parse(fs.readFileSync(path.join(__dirname, "../../scripts/csn-task-manifest-v2.json"), "utf8"));
const PHASES = JSON.parse(fs.readFileSync(path.join(__dirname, "./phases-meta.json"), "utf8")).phases;
const RUNBOOKS = JSON.parse(fs.readFileSync(path.join(__dirname, "../../scripts/csn-phase-runbooks.json"), "utf8")).phases;

/** Fases CSN → jornada (7 días objetivo; compras/DNS prod pueden retrasarse). */
export const DAY_PLAN = [
  {
    day: 1,
    title: "Definir el proyecto y los requisitos iniciales",
    phases: [1],
    outcome: "Proyecto registrado en Notion, sitio vinculado y aprobación de alcance (gate) creada.",
    realistic: "Completable en un día si tienes claro el nicho y el brief.",
  },
  {
    day: 2,
    title: "Dominio, infraestructura y arquitectura",
    phases: [2, 3, 4],
    outcome: "Candidatos de dominio evaluados, decisión documentada y plan DNS/hosting en Conocimiento.",
    realistic: "La compra de dominio requiere aprobación humana (gate); puede quedar pendiente sin bloquear el plan.",
  },
  {
    day: 3,
    title: "Experiencia, estructura y cumplimiento inicial",
    phases: [7],
    outcome: "Checklist de páginas legales y UX documentado en CSN Knowledge.",
    realistic: "No sustituye diseño gráfico completo; define qué debe existir antes de lanzar.",
  },
  {
    day: 4,
    title: "Repositorio, CI y calidad de código",
    phases: [5],
    outcome: "Repositorio enlazado, release sandbox y evidencia de CI en Notion.",
    realistic: "Requiere acceso al repositorio GitHub del sitio.",
  },
  {
    day: 5,
    title: "Integraciones, feeds y monetización técnica",
    phases: [6],
    outcome: "Política de secretos (CrakRevenue/Cloudflare) documentada y Feed Sync Run registrado.",
    realistic: "Basado en procedimientos del stack cam (HasOffers/CrakRevenue) del repo operativo.",
  },
  {
    day: 6,
    title: "SEO, autoridad y validación previa al lanzamiento",
    phases: [8, 9],
    outcome: "Oportunidades SEO y backlink identificadas; gates de pago creados en pendiente.",
    realistic: "Envío a GSC y outreach real pueden extenderse más allá del día 6.",
  },
  {
    day: 7,
    title: "Staging, decisión de lanzamiento y operación posterior",
    phases: [10, 11, 12],
    outcome: "Evidencia en staging, gates de producción (si aplica), snapshot KPI y rutinas de mantenimiento.",
    realistic: "Producción solo con gate Approved; QA puede cerrar en sandbox sin deploy real.",
  },
];

function tasksForPhases(phaseIds) {
  return TASKS.filter((t) => phaseIds.includes(t.phase));
}

function phaseEs(id) {
  return PHASES.find((p) => p.id === id);
}

function runbookEs(phaseId) {
  const rb = RUNBOOKS.find((p) => p.phase === phaseId);
  if (!rb) return null;
  return rb;
}

export function buildCursorPromptEs(task, ctx = {}) {
  const phase = phaseEs(task.phase);
  return `# Cursor — Tarea CSN (Fase ${task.phase}: ${phase?.nameEs || ""})

**ID de tarea (definición):** \`${task.externalId}\`
**Proyecto:** {{NOMBRE_DE_TU_SITIO}} — Launch Key: {{TU_LAUNCH_KEY}}
**Clase de registro:** {{QA test-only O Production}}
**Repositorio:** {{URL_GITHUB}} (si ya existe)

## Rol
Eres ingeniero senior en la red Cam Site Network (CSN). Ejecuta **solo** esta tarea. No compres dominios, no cambies DNS de producción, no despliegues ni pagues backlinks sin un Human Gate **Approved** citado en Notion.

## Misión concreta
${task.instructions}

## Precondiciones
${task.prerequisites || "Fase anterior completada según Notion."}

## Entregable esperado
${task.expectedOutput}

## Criterios de aceptación (verificables)
${task.acceptanceCriteria}

## Evidencias a registrar en Notion
${task.requiredEvidence}

## Pruebas
- Marca cada comprobación como: Implementado | Probado con éxito | Probado sin éxito | No probado | Bloqueado | Solo documentado.
- No afirmes despliegue ni compra sin evidencia URL.

## Si falta información
Si el brief o el repositorio están vacíos, detente y devuelve lista de campos faltantes (plantilla blocked-planning). No inventes dominios ni claves API.

## Al terminar
Indica URLs de filas Notion creadas/actualizadas y texto sugerido para el campo Resultado ejecución de la tarea.

---
*Generado desde \`csn-task-manifest-v2.json\` + estándares CSN. Para prompt con tus datos ya rellenados: consola \`/csn-console\` → Preparar prompt, o registro previo del proyecto.*
`;
}

function sectionBeforeStart(day, phaseIds) {
  const lines = [
    "- Acceso a Notion «Cam Sites — SOP System».",
    "- Decidir si el sitio es **prueba (QA)** o **producción** (producción exige más gates y dominio real).",
    "- Tener listo: nombre comercial, nicho, objetivo, brief en prosa (qué debe hacer la web).",
  ];
  if (phaseIds.some((p) => p >= 2)) lines.push("- Navegador para expireddomains.net y web.archive.org (día 2).");
  if (phaseIds.some((p) => p >= 5)) lines.push("- Acceso de lectura al repositorio GitHub del sitio (días 4–5).");
  if (phaseIds.includes(11)) lines.push("- **Día 7 producción:** aprobación humana explícita antes de deploy (gate production_deploy).");
  return lines.join("\n");
}

export function buildDayMarkdown(dayConfig) {
  const { day, title, phases, outcome, realistic } = dayConfig;
  const tasks = tasksForPhases(phases);
  const lines = [];
  lines.push(`# Guía 7 días — Día ${day}: ${title}`);
  lines.push("");
  lines.push("## Objetivo del día");
  lines.push(outcome);
  lines.push("");
  lines.push(`**Nota realista:** ${realistic}`);
  lines.push("");
  lines.push("## Fases CSN cubiertas");
  for (const pid of phases) {
    const p = phaseEs(pid);
    lines.push(`- Fase ${pid}: ${p?.nameEs} — ${p?.summaryEs}`);
  }
  lines.push("");
  lines.push("## Antes de empezar");
  lines.push(sectionBeforeStart(day, phases));
  lines.push("");
  lines.push("## Pasos que debes seguir");
  let step = 1;
  for (const pid of phases) {
    const rb = runbookEs(pid);
    if (rb?.steps) {
      lines.push(`### Bloque fase ${pid}`);
      lines.push(rb.steps.replace(/;/g, "\n"));
      lines.push("");
    }
    for (const task of tasks.filter((t) => t.phase === pid)) {
      lines.push(`${step}. **${task.title}**`);
      lines.push(`   - Qué hacer: ${task.instructions}`);
      lines.push(`   - Dónde: Notion (Tasks / tablas indicadas) y herramientas externas citadas en la instrucción.`);
      lines.push(`   - Resultado: ${task.expectedOutput}`);
      lines.push(`   - Comprobar: ${task.completionCondition}`);
      if (task.humanGate) lines.push(`   - ⚠ Aprobación humana: ${task.humanGate}`);
      step++;
    }
  }
  lines.push("");
  lines.push("## Instrucciones para Cursor");
  lines.push("");
  lines.push("### Cómo obtener el prompt con tus datos reales");
  lines.push("1. Registra el proyecto (Día 1) en la consola **/csn-console** (formulario) o con ayuda de quien tenga acceso al servidor.");
  lines.push("2. Abre **Continuar** → **Preparar prompt** para la fase actual; copia el texto completo.");
  lines.push("3. Pega en Cursor en el repositorio autorizado. Cursor **no** se ejecuta solo al generar el prompt.");
  lines.push("");
  for (const task of tasks) {
    lines.push(`### Prompt — ${task.title}`);
    lines.push("```");
    lines.push(buildCursorPromptEs(task));
    lines.push("```");
    lines.push("");
  }
  lines.push("## Cómo comprobar el resultado");
  for (const task of tasks) {
    lines.push(`- [ ] ${task.title}: ${task.acceptanceCriteria}`);
  }
  lines.push("");
  lines.push("Estados en Notion Tasks: **Not started** → **In progress** → **Done** (con evidencia) o **Blocked** (con motivo).");
  lines.push("");
  lines.push("## Si algo falla");
  lines.push("- Anota el mensaje de error y la URL de la fila Notion afectada.");
  lines.push("- No avances de fase si `checkPhaseReadiness` / bloqueos listan brief, repo o fase anterior incompleta.");
  lines.push("- Gates en **Pending** o **Rejected**: usar plantilla blocked-planning; no comprar ni desplegar.");
  lines.push("- Crea fila en **CSN Incidents** si el fallo afecta al sitio.");
  lines.push("");
  lines.push("## Criterio para terminar el día");
  for (const task of tasks) {
    lines.push(`- [ ] ${task.completionCondition}`);
  }
  lines.push("");
  lines.push(`**Siguiente jornada:** Día ${day < 7 ? day + 1 : "— fin del calendario objetivo"}`);
  return lines.join("\n");
}

export function buildAllDays(outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  const index = [];
  for (const d of DAY_PLAN) {
    const md = buildDayMarkdown(d);
    const file = `dia-${String(d.day).padStart(2, "0")}.md`;
    fs.writeFileSync(path.join(outDir, file), md);
    index.push({ day: d.day, title: d.title, file, phases: d.phases });
  }
  fs.writeFileSync(path.join(outDir, "index.json"), JSON.stringify({ days: index, generatedFrom: ["csn-task-manifest-v2.json", "phases-meta.json", "csn-phase-runbooks.json"] }, null, 2));
  return index;
}
