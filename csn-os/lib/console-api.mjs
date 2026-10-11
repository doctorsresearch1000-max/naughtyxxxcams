import fs from "fs";
import { loadManifest } from "./manifest.mjs";
import { getNotion, getDb, queryByRichText, legacyRowCounts } from "./notion.mjs";
import { createProject, getWorkPlan, recordExecutionResult, slugKey } from "./workflow.mjs";
import { assemblePrompt } from "./assemble-prompt.mjs";
import {
  listProjects,
  getContinueGuide,
  findNextTaskForRun,
  validateIntake,
  runExternalIdFromLaunchKey,
  getSiteMaintenanceOverview,
} from "./project-ux.mjs";

const rt = (text) => [{ text: { content: (text || "").slice(0, 2000) } }];

function taskRich(page, name) {
  const p = page.properties?.[name];
  if (!p) return "";
  if (p.type === "rich_text") return p.rich_text.map((t) => t.plain_text).join("");
  return "";
}

export function assertConsoleToken(headerValue) {
  const expected = process.env.CSN_CONSOLE_TOKEN?.trim();
  if (!expected) {
    throw new Error("CSN_CONSOLE_TOKEN no configurado en el servidor — consola deshabilitada");
  }
  const token = (headerValue || "").replace(/^Bearer\s+/i, "").trim();
  if (token !== expected) {
    throw new Error("No autorizado");
  }
}

export async function generateUniqueLaunchKey(siteName) {
  const manifest = loadManifest();
  const notion = getNotion();
  const sitesDb = getDb(manifest, "csnSites");
  const base = slugKey(siteName) || "sitio";
  for (let i = 0; i < 25; i++) {
    const suffix = i === 0 ? "" : `-${i + 1}`;
    const lk = `${base.slice(0, 36 - suffix.length)}${suffix}`;
    const ext = `csn:site:${lk}`;
    const existing = await queryByRichText(notion, sitesDb.dataSourceId, "External ID", ext);
    if (!existing[0]) return lk;
  }
  throw new Error("No se pudo generar launch-key única");
}

export async function createProjectFromForm(body) {
  const isProduction = body.environment === "production";
  const launchKey = body.launchKey?.trim() || (await generateUniqueLaunchKey(body.siteName));
  const intake = validateIntake({
    siteName: body.siteName,
    projectBrief: body.projectBrief,
    domain: body.domain,
    production: isProduction,
    isQa: !isProduction,
  });

  const result = await createProject({
    siteName: body.siteName,
    launchKey,
    isQa: !isProduction,
    domain: body.domain,
    niche: body.niche,
    stack: body.stack,
    monetization: body.monetization,
    projectGoal: body.projectGoal,
    repositoryUrl: body.repositoryUrl,
    projectBrief: body.projectBrief,
  });

  const guide = await getContinueGuide(launchKey);
  const plan = await getWorkPlan(result.runExternalId);
  const totalTasks = Object.values(plan.phases).reduce((s, p) => s + p.tasksTotal, 0);
  const doneTasks = Object.values(plan.phases).reduce((s, p) => s + p.tasksDone, 0);

  return {
    intake,
    launchKey,
    ...result,
    progress:
      totalTasks > 0
        ? { tasksDone: doneTasks, tasksTotal: totalTasks, percent: Math.round((doneTasks / totalTasks) * 100) }
        : { tasksDone: 0, tasksTotal: 0, percent: null, note: "Sin datos suficientes" },
    firstPending: guide.nextTask,
    continuePath: `/csn-console?tab=continuar&launchKey=${encodeURIComponent(launchKey)}`,
  };
}

export async function getProjectConsoleView(launchKey) {
  const guide = await getContinueGuide(launchKey);
  const manifest = loadManifest();
  const notion = getNotion();
  let acceptanceCriteria = "";
  let instructions = "";
  let repositoryUrl = "";
  if (guide.nextTask?.taskId) {
    const task = await notion.pages.retrieve({ page_id: guide.nextTask.taskId });
    acceptanceCriteria = taskRich(task, "Acceptance Criteria");
    instructions = taskRich(task, "Instructions");
    const runExt = runExternalIdFromLaunchKey(launchKey);
    const runs = await queryByRichText(notion, manifest.databases.projectRuns.dataSourceId, "External ID", runExt);
    const siteId = runs[0]?.properties.Site?.relation?.[0]?.id;
    if (siteId) {
      const site = await notion.pages.retrieve({ page_id: siteId });
      repositoryUrl = site.properties["Repository URL"]?.url || "";
    }
  }

  const projects = await listProjects({ includeQa: true });
  const meta = projects.find((p) => p.launchKey === launchKey);

  return {
    ...guide,
    meta,
    progress:
      meta && meta.tasksTotal > 0
        ? { tasksDone: meta.tasksDone, tasksTotal: meta.tasksTotal, percent: meta.progressPercent }
        : { note: "Sin datos suficientes" },
    nextTask: guide.nextTask
      ? {
          ...guide.nextTask,
          instructions,
          acceptanceCriteria,
        }
      : null,
    repositoryUrl,
  };
}

export async function generatePromptForLaunchKey(launchKey, { phase } = {}) {
  const manifest = loadManifest();
  const runExternalId = runExternalIdFromLaunchKey(launchKey);
  const plan = await getWorkPlan(runExternalId);
  const phaseNum = phase || plan.nextRecommendedPhase;
  const nextTask = await findNextTaskForRun(runExternalId);
  const result = await assemblePrompt({
    manifest,
    runExternalId,
    phase: phaseNum,
    taskExternalId: nextTask?.externalId,
    publish: true,
  });
  const markdown = fs.readFileSync(result.path, "utf8");
  const view = await getProjectConsoleView(launchKey);
  return {
    ...result,
    markdown,
    phase: phaseNum,
    task: view.nextTask,
    repositoryUrl: view.repositoryUrl,
    siteName: view.siteName,
    disclaimer: "Prompt generado y publicado en Notion. Cursor no se ha ejecutado automáticamente.",
  };
}

export async function recordResultFromForm(launchKey, body) {
  const runExternalId = runExternalIdFromLaunchKey(launchKey);
  const view = await getProjectConsoleView(launchKey);
  const phase = body.phase || view.nextTask?.phase || (await getWorkPlan(runExternalId)).nextRecommendedPhase;

  const evidenceUrls = (body.evidenceUrls || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  if (body.outcome === "success" && evidenceUrls.length === 0) {
    throw new Error("Para marcar éxito verificado debes aportar al menos una URL de evidencia");
  }

  const statusMap = {
    success: "verified_sandbox",
    production: "verified_production",
    staging: "validated_staging",
    failure: "failed",
    blocked: "blocked",
  };
  const executionStatus = statusMap[body.outcome] || "failed";

  const report = {
    executionStatus,
    verificationLabel: body.verificationLabel || "Registrado desde consola web",
    summary: body.summary || "",
    evidenceUrls,
    tests: body.tests || [],
    advancePhase: Boolean(body.advancePhase) && body.outcome === "success",
  };

  const rec = await recordExecutionResult(runExternalId, phase, report);
  const after = await getProjectConsoleView(launchKey);
  return { record: rec, project: after };
}

async function resolveSiteAndRun(launchKey) {
  const manifest = loadManifest();
  const notion = getNotion();
  const siteExt = `csn:site:${launchKey}`;
  const sites = await queryByRichText(notion, manifest.databases.csnSites.dataSourceId, "External ID", siteExt);
  if (!sites[0]) throw new Error("Sitio no encontrado");
  const runExt = runExternalIdFromLaunchKey(launchKey);
  const runs = await queryByRichText(notion, manifest.databases.projectRuns.dataSourceId, "External ID", runExt);
  if (!runs[0]) throw new Error("Project run no encontrado");
  return { manifest, notion, site: sites[0], run: runs[0] };
}

export async function getMaintenanceConsoleView(launchKey) {
  const overview = await getSiteMaintenanceOverview(launchKey);
  const { manifest, notion, site, run } = await resolveSiteAndRun(launchKey);
  const siteId = site.id;

  async function listLinked(dataSourceId, titleProp) {
    const rows = [];
    let c;
    do {
      const r = await notion.dataSources.query({
        data_source_id: dataSourceId,
        filter: { property: "Site", relation: { contains: siteId } },
        page_size: 50,
        start_cursor: c,
      });
      rows.push(
        ...r.results.map((row) => ({
          id: row.id,
          url: row.url,
          title: row.properties[titleProp]?.title?.[0]?.plain_text || "(sin título)",
          status: row.properties.Status?.status?.name || "",
        })),
      );
      c = r.has_more ? r.next_cursor : undefined;
    } while (c);
    return rows;
  }

  const incidents = await listLinked(manifest.databases.csnIncidents.dataSourceId, "Incident");
  const maintenance = await listLinked(manifest.databases.csnMaintenance.dataSourceId, "Routine");
  const knowledge = await listLinked(manifest.databases.csnKnowledge.dataSourceId, "Article");

  return {
    ...overview,
    runUrl: run.url,
    incidents,
    maintenance,
    knowledge,
    canCreate: true,
  };
}

export async function createIncidentRow(launchKey, { title, severity, summary }) {
  const { manifest, notion, site, run } = await resolveSiteAndRun(launchKey);
  const page = await notion.pages.create({
    parent: { database_id: manifest.databases.csnIncidents.id },
    properties: {
      Incident: { title: [{ text: { content: title.slice(0, 200) } }] },
      Severity: { select: { name: severity || "SEV3" } },
      Status: { status: { name: "Not started" } },
      Site: { relation: [{ id: site.id }] },
      "Project Run": { relation: [{ id: run.id }] },
    },
  });
  if (summary) {
    await notion.pages.update({
      page_id: page.id,
      properties: {
        Status: { status: { name: "In progress" } },
      },
    });
  }
  return { id: page.id, url: page.url };
}

export async function createMaintenanceRow(launchKey, { title, cadence }) {
  const { manifest, notion, site } = await resolveSiteAndRun(launchKey);
  const page = await notion.pages.create({
    parent: { database_id: manifest.databases.csnMaintenance.id },
    properties: {
      Routine: { title: [{ text: { content: title.slice(0, 200) } }] },
      Cadence: { select: { name: cadence || "weekly" } },
      Status: { status: { name: "Not started" } },
      Site: { relation: [{ id: site.id }] },
    },
  });
  return { id: page.id, url: page.url };
}

export async function listProjectsGrouped() {
  const all = await listProjects({ includeQa: true });
  return {
    production: all.filter((p) => !p.isQa),
    qa: all.filter((p) => p.isQa),
  };
}

export async function consoleHealth() {
  const legacy = await legacyRowCounts(getNotion());
  return {
    ok: true,
    notion: Boolean(process.env.NOTION_API_KEY),
    tokenConfigured: Boolean(process.env.CSN_CONSOLE_TOKEN?.trim()),
    legacyCounts: legacy,
  };
}
