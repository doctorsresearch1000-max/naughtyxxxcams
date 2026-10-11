import { loadManifest } from "./manifest.mjs";
import { getNotion, getDb, queryByRichText } from "./notion.mjs";
import { getWorkPlan, checkPhaseReadiness, executionTasksForRun } from "./workflow.mjs";

function rt(page, name) {
  const p = page.properties?.[name];
  if (!p) return "";
  if (p.type === "rich_text") return p.rich_text.map((t) => t.plain_text).join("");
  if (p.type === "title") return p.title.map((t) => t.plain_text).join("");
  return "";
}

export function runExternalIdFromLaunchKey(launchKey) {
  return `csn:run:${launchKey}`;
}

export function validateIntake(opts) {
  const missing = [];
  if (!opts.siteName?.trim()) missing.push("nombre del sitio (--nombre=)");
  const brief = (opts.projectBrief || "").trim();
  if (!brief || brief === "Pendiente") {
    missing.push("resumen del proyecto (--brief=) — obligatorio antes de generar prompts de fase ≥2");
  }
  if (opts.production === true || opts.isQa === false) {
    if (!opts.domain?.trim()) missing.push("dominio previsto (--dominio=) para sitios de producción");
  }
  return {
    ok: missing.length === 0,
    missing,
    note:
      "Puedes registrar el proyecto con datos mínimos; el generador devolverá «planificación bloqueada» si faltan requisitos para la fase.",
  };
}

async function queryAllRuns(notion, dataSourceId) {
  const rows = [];
  let c;
  do {
    const r = await notion.dataSources.query({ data_source_id: dataSourceId, page_size: 100, start_cursor: c });
    rows.push(...r.results);
    c = r.has_more ? r.next_cursor : undefined;
  } while (c);
  return rows;
}

export async function listProjects({ includeQa = true, productionOnly = false } = {}) {
  const manifest = loadManifest();
  const notion = getNotion();
  const runsDb = getDb(manifest, "projectRuns");
  const runs = await queryAllRuns(notion, runsDb.dataSourceId);
  const out = [];

  for (const run of runs) {
    const siteRel = run.properties.Site?.relation?.[0]?.id;
    if (!siteRel) continue;
    const site = await notion.pages.retrieve({ page_id: siteRel });
    const recordClass = site.properties["Record Class"]?.select?.name || "";
    const isQa = recordClass.includes("QA");
    if (productionOnly && isQa) continue;
    if (!includeQa && isQa) continue;

    const launchKey = rt(run, "Launch Key");
    const runExt = rt(run, "External ID");
    const plan = await getWorkPlan(runExt);
    const totalTasks = Object.values(plan.phases).reduce((s, p) => s + p.tasksTotal, 0);
    const doneTasks = Object.values(plan.phases).reduce((s, p) => s + p.tasksDone, 0);
    const pct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

    out.push({
      launchKey,
      runExternalId: runExt,
      runName: rt(run, "Run Name"),
      siteName: rt(site, "Site Name"),
      recordClass,
      isQa,
      runUrl: run.url,
      siteUrl: site.url,
      currentPhase: plan.currentPhase,
      phaseNameEs: plan.phases[plan.currentPhase]?.nameEs || "",
      progressPercent: pct,
      tasksDone: doneTasks,
      tasksTotal: totalTasks,
      status: run.properties.Status?.status?.name || "",
    });
  }

  out.sort((a, b) => {
    if (a.isQa !== b.isQa) return a.isQa ? 1 : -1;
    return (b.runName || "").localeCompare(a.runName || "");
  });
  return out;
}

export async function findNextTaskForRun(runExternalId) {
  const manifest = loadManifest();
  const notion = getNotion();
  const runs = await queryByRichText(notion, manifest.databases.projectRuns.dataSourceId, "External ID", runExternalId);
  if (!runs[0]) return null;
  const run = runs[0];
  const plan = await getWorkPlan(runExternalId);
  const phase = plan.nextRecommendedPhase;
  const tasks = (await executionTasksForRun(notion, manifest, run.id)).filter(
    (t) => t.properties.Phase?.number === phase,
  );
  const order = ["In progress", "Not started", "Blocked", "Done"];
  for (const st of order) {
    const hit = tasks.find((t) => t.properties.Status?.status?.name === st && st !== "Done");
    if (hit) {
      return {
        phase,
        phaseNameEs: plan.phases[phase]?.nameEs,
        taskId: hit.id,
        taskUrl: hit.url,
        title: hit.properties.Task?.title?.[0]?.plain_text || "",
        status: hit.properties.Status?.status?.name,
        externalId: rt(hit, "External ID"),
        promptUrl: hit.properties["Prompt Notion URL"]?.url || null,
      };
    }
  }
  return tasks[0]
    ? {
        phase,
        phaseNameEs: plan.phases[phase]?.nameEs,
        taskId: tasks[0].id,
        taskUrl: tasks[0].url,
        title: tasks[0].properties.Task?.title?.[0]?.plain_text || "",
        status: tasks[0].properties.Status?.status?.name,
        externalId: rt(tasks[0], "External ID"),
        promptUrl: tasks[0].properties["Prompt Notion URL"]?.url || null,
      }
    : null;
}

export async function getContinueGuide(launchKeyOrRunExt) {
  const launchKey = launchKeyOrRunExt.startsWith("csn:run:")
    ? launchKeyOrRunExt.replace("csn:run:", "")
    : launchKeyOrRunExt;
  const runExternalId = runExternalIdFromLaunchKey(launchKey);
  const plan = await getWorkPlan(runExternalId);
  const phase = plan.nextRecommendedPhase;
  const readiness = await checkPhaseReadiness(runExternalId, phase);
  const nextTask = await findNextTaskForRun(runExternalId);
  const projects = await listProjects({ includeQa: true });
  const meta = projects.find((p) => p.launchKey === launchKey);

  return {
    launchKey,
    runExternalId,
    runUrl: meta?.runUrl,
    siteName: meta?.siteName,
    recordClass: meta?.recordClass,
    progressPercent: meta?.progressPercent,
    currentPhase: plan.currentPhase,
    phaseNameEs: plan.phases[phase]?.nameEs,
    readiness,
    nextTask,
    planSummary: Object.values(plan.phases)
      .filter((p) => p.status === "current" || p.status === "in_progress")
      .map((p) => `Fase ${p.id} ${p.nameEs}: ${p.tasksDone}/${p.tasksTotal}`)
      .join(" · "),
    steps: [
      {
        step: 1,
        label: "Ver plan y bloqueos",
        action: `npm run csn -- continuar --launch-key=${launchKey}`,
      },
      {
        step: 2,
        label: "Generar o abrir prompt para Cursor",
        action: `npm run csn -- prompt --launch-key=${launchKey}`,
        nota: nextTask?.promptUrl ? `Ya publicado: ${nextTask.promptUrl}` : "Publica en Notion y enlaza a la tarea",
      },
      {
        step: 3,
        label: "Registrar resultado tras ejecutar en Cursor",
        action: `npm run csn -- resultado --launch-key=${launchKey} --json=informe.json`,
        nota: "Un fallo deja la tarea en Bloqueada; no avanza la fase sin evidencia y advancePhase en el informe",
      },
    ],
  };
}

export async function getSiteMaintenanceOverview(launchKey) {
  const manifest = loadManifest();
  const notion = getNotion();
  const siteExt = `csn:site:${launchKey}`;
  const sites = await queryByRichText(notion, manifest.databases.csnSites.dataSourceId, "External ID", siteExt);
  if (!sites[0]) {
    return { ok: false, reason: "Sitio no encontrado para ese launch-key" };
  }
  const siteId = sites[0].id;
  const siteName = rt(sites[0], "Site Name");

  async function countOpen(dataSourceId, statusProp = "Status") {
    let n = 0;
    let c;
    do {
      const r = await notion.dataSources.query({
        data_source_id: dataSourceId,
        filter: { property: "Site", relation: { contains: siteId } },
        page_size: 100,
        start_cursor: c,
      });
      for (const row of r.results) {
        const st = row.properties[statusProp]?.status?.name || row.properties[statusProp]?.select?.name || "";
        if (!st || st === "Open" || st === "In progress" || st === "Not started") n++;
      }
      c = r.has_more ? r.next_cursor : undefined;
    } while (c);
    return n;
  }

  const maintDb = manifest.databases.csnMaintenance;
  const incDb = manifest.databases.csnIncidents;
  const maintenanceOpen = await countOpen(maintDb.dataSourceId);
  const incidentsOpen = await countOpen(incDb.dataSourceId);

  return {
    ok: true,
    siteName,
    siteUrl: sites[0].url,
    launchKey,
    maintenanceOpen,
    incidentsOpen,
    implemented: true,
    limits: [
      "No hay flujo automático de «mejoras pendientes»; se consultan filas en CSN Maintenance e Incidents vinculadas al sitio.",
      "Si no hay filas, el mantenimiento aún no está registrado en Notion.",
    ],
    links: {
      maintenance: maintDb.url,
      incidents: incDb.url,
      knowledge: manifest.databases.csnKnowledge.url,
    },
  };
}

/** Datos para la portada Notion (proyectos reales primero, QA aparte). */
export async function buildHubSnapshots() {
  const all = await listProjects({ includeQa: true });
  const production = all.filter((p) => !p.isQa);
  const qa = all.filter((p) => p.isQa);
  const cards = [];
  for (const p of production.slice(0, 8)) {
    const guide = await getContinueGuide(p.launchKey);
    cards.push({ ...p, nextTask: guide.nextTask, readinessMissing: guide.readiness.missing });
  }
  return { production, qa, productionCards: cards };
}
