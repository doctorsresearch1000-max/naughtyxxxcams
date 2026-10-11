import fs from "fs";
import path from "path";
import crypto from "crypto";
import { loadManifest } from "./manifest.mjs";
import { getNotion, getDb, queryByRichText, legacyRowCounts } from "./notion.mjs";
const phasesMeta = JSON.parse(
  fs.readFileSync(new URL("./phases-meta.json", import.meta.url), "utf8"),
);

const rt = (text) => [{ text: { content: (text || "").slice(0, 2000) } }];

function slugKey(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export async function syncExecutionTasksForRun(notion, manifest, runExternalId) {
  const tasksDb = getDb(manifest, "tasks");
  const runs = await queryByRichText(notion, manifest.databases.projectRuns.dataSourceId, "External ID", runExternalId);
  if (!runs[0]) throw new Error(`Run no encontrado: ${runExternalId}`);
  const run = runs[0];
  const siteId = run.properties.Site?.relation?.[0]?.id;

  const defs = [];
  let c;
  do {
    const r = await notion.dataSources.query({
      data_source_id: tasksDb.dataSourceId,
      filter: { property: "Record Type", select: { equals: "Task definition" } },
      page_size: 100,
      start_cursor: c,
    });
    defs.push(...r.results);
    c = r.has_more ? r.next_cursor : undefined;
  } while (c);

  let created = 0;
  let reused = 0;
  for (const def of defs) {
    const defExt = def.properties["External ID"]?.rich_text?.map((t) => t.plain_text).join("") || "";
    if (!defExt.startsWith("csn:taskdef:")) continue;
    const suffix = defExt.replace("csn:taskdef:v1:", "");
    const execExt = `csn:taskrun:${runExternalId}:${suffix}`;
    const existing = await queryByRichText(notion, tasksDb.dataSourceId, "External ID", execExt);
    if (existing[0]) {
      reused++;
      continue;
    }
    const title = def.properties.Task?.title?.[0]?.plain_text || suffix;
    await notion.pages.create({
      parent: { database_id: tasksDb.id },
      properties: {
        Task: { title: [{ text: { content: title } }] },
        "Record Type": { select: { name: "Execution task" } },
        "External ID": { rich_text: rt(execExt) },
        "Task Definition Ref": { rich_text: rt(defExt) },
        Phase: def.properties.Phase,
        Status: { status: { name: "Not started" } },
        "Project Run": { relation: [{ id: run.id }] },
        ...(siteId ? { Site: { relation: [{ id: siteId }] } } : {}),
      },
    });
    created++;
  }
  return { created, reused };
}

export async function createProject({
  siteName,
  launchKey,
  isQa = true,
  domain,
  niche,
  stack,
  monetization,
  projectGoal,
  repositoryUrl,
  projectBrief,
}) {
  const manifest = loadManifest();
  const notion = getNotion();
  const sitesDb = getDb(manifest, "csnSites");
  const runsDb = getDb(manifest, "projectRuns");

  const lk = launchKey || slugKey(siteName);
  const siteExt = `csn:site:${lk}`;
  const runExt = `csn:run:${lk}`;

  let site = (await queryByRichText(notion, sitesDb.dataSourceId, "External ID", siteExt))[0];
  if (!site) {
    site = await notion.pages.create({
      parent: { database_id: sitesDb.id },
      properties: {
        "Site Name": { title: [{ text: { content: siteName } }] },
        "Record Class": { select: { name: isQa ? "QA test-only" : "Production" } },
        Domain: domain ? { url: domain } : undefined,
        "Launch Key": { rich_text: rt(lk) },
        "External ID": { rich_text: rt(siteExt) },
        Nicho: { rich_text: rt(niche || "Pendiente") },
        Stack: { rich_text: rt(stack || "Pendiente") },
        Monetización: { rich_text: rt(monetization || "Pendiente") },
        "Estado del proyecto": { select: { name: "En planificación" } },
        "Objetivo principal": { rich_text: rt(projectGoal || "Pendiente") },
        "Project Brief": {
          rich_text: rt(
            projectBrief ||
              `Proyecto: ${siteName}. Nicho: ${niche || "pendiente"}. Objetivo: ${projectGoal || "pendiente"}.`,
          ),
        },
        ...(repositoryUrl ? { "Repository URL": { url: repositoryUrl } } : {}),
        Status: { status: { name: "In progress" } },
        "Primary Phase": { number: 1 },
      },
    });
  }

  let run = (await queryByRichText(notion, runsDb.dataSourceId, "External ID", runExt))[0];
  if (!run) {
    run = await notion.pages.create({
      parent: { database_id: runsDb.id },
      properties: {
        "Run Name": { title: [{ text: { content: `Lanzamiento — ${siteName}` } }] },
        "Run Type": { select: { name: isQa ? "QA Sandbox" : "New Site Launch" } },
        "External ID": { rich_text: rt(runExt) },
        "Launch Key": { rich_text: rt(lk) },
        Site: { relation: [{ id: site.id }] },
        Status: { status: { name: "In progress" } },
        "Current Phase": { number: 1 },
        "Project Brief": { rich_text: rt(site.properties["Project Brief"]?.rich_text?.map((t) => t.plain_text).join("") || "") },
      },
    });
  }

  const tasks = await syncExecutionTasksForRun(notion, manifest, runExt);
  return {
    siteExternalId: siteExt,
    runExternalId: runExt,
    siteId: site.id,
    runId: run.id,
    launchKey: lk,
    executionTasks: tasks,
  };
}

async function executionTasksForRun(notion, manifest, runId) {
  const tasksDb = getDb(manifest, "tasks");
  const all = [];
  let c;
  do {
    const r = await notion.dataSources.query({
      data_source_id: tasksDb.dataSourceId,
      filter: {
        and: [
          { property: "Record Type", select: { equals: "Execution task" } },
          { property: "Project Run", relation: { contains: runId } },
        ],
      },
      page_size: 100,
      start_cursor: c,
    });
    all.push(...r.results);
    c = r.has_more ? r.next_cursor : undefined;
  } while (c);
  return all;
}

export async function getWorkPlan(runExternalId) {
  const manifest = loadManifest();
  const notion = getNotion();
  const runs = await queryByRichText(notion, manifest.databases.projectRuns.dataSourceId, "External ID", runExternalId);
  if (!runs[0]) throw new Error(`Run no encontrado: ${runExternalId}`);
  const run = runs[0];
  const currentPhase = run.properties["Current Phase"]?.number || 1;
  const site = run.properties.Site?.relation?.[0]?.id
    ? await notion.pages.retrieve({ page_id: run.properties.Site.relation[0].id })
    : null;
  const domain = site?.properties.Domain?.url || "";
  const recordClass = site?.properties["Record Class"]?.select?.name || "";

  const execTasks = await executionTasksForRun(notion, manifest, run.id);
  const byPhase = {};
  for (const p of phasesMeta.phases) {
    const phaseTasks = execTasks.filter((t) => t.properties.Phase?.number === p.id);
    const done = phaseTasks.filter((t) => t.properties.Status?.status?.name === "Done").length;
    const total = phaseTasks.length;
    let status = "not_started";
    if (total && done === total) status = "complete";
    else if (done > 0 || phaseTasks.some((t) => t.properties.Status?.status?.name === "In progress"))
      status = "in_progress";
    if (p.id === currentPhase) status = status === "complete" ? "complete" : "current";
    if (p.id > currentPhase && status === "not_started") status = "locked";

    const blockers = [];
    if (p.id === 4 && !domain) blockers.push("Sin dominio: omitir cutover DNS de producción; usar staging/ejemplo.");
    if (p.gates?.includes("production_deploy") && recordClass.includes("QA"))
      blockers.push("N/A en QA test-only para producción.");

    byPhase[p.id] = {
      ...p,
      tasksTotal: total,
      tasksDone: done,
      status,
      blockers,
    };
  }

  return {
    runExternalId,
    runName: run.properties["Run Name"]?.title?.[0]?.plain_text,
    currentPhase,
    recordClass,
    domain,
    phases: byPhase,
    nextRecommendedPhase: currentPhase <= 12 ? currentPhase : 12,
  };
}

export async function checkPhaseReadiness(runExternalId, phase) {
  const plan = await getWorkPlan(runExternalId);
  const manifest = loadManifest();
  const notion = getNotion();
  const runs = await queryByRichText(notion, manifest.databases.projectRuns.dataSourceId, "External ID", runExternalId);
  const run = runs[0];
  const site = await notion.pages.retrieve({ page_id: run.properties.Site.relation[0].id });

  const missing = [];
  const brief =
    run.properties["Project Brief"]?.rich_text?.map((t) => t.plain_text).join("") ||
    site.properties["Project Brief"]?.rich_text?.map((t) => t.plain_text).join("");
  if (!brief?.trim() || brief.includes("Pendiente") && phase > 1) missing.push("Project Brief incompleto (Notion: CSN Sites / Project Runs)");

  const repo = site.properties["Repository URL"]?.url;
  if (phase >= 5 && !repo) missing.push("Repository URL (CSN Sites)");

  if (phase > 1) {
    const prev = plan.phases[phase - 1];
    if (prev && prev.tasksTotal > 0 && prev.tasksDone < prev.tasksTotal)
      missing.push(`Fase ${phase - 1} sin tareas de ejecución completadas (${prev.tasksDone}/${prev.tasksTotal})`);
  }

  const gatesDb = manifest.databases.humanGates.dataSourceId;
  const gates = await notion.dataSources.query({ data_source_id: gatesDb, page_size: 50 });
  const runGates = gates.results.filter((g) => g.properties["Project Run"]?.relation?.some((r) => r.id === run.id));

  const meta = phasesMeta.phases.find((p) => p.id === phase);
  for (const gt of meta?.gates || []) {
    if (gt === "production_deploy" && site.properties["Record Class"]?.select?.name?.includes("QA")) continue;
    const approved = runGates.find(
      (g) => g.properties["Target Type"]?.select?.name === gt && g.properties.Status?.select?.name === "Approved",
    );
    if (!approved && (gt === "production_deploy" || gt === "domain_candidate"))
      missing.push(`Human Gate ${gt} = Approved (control manual, no bloqueo técnico)`);
  }

  return { ready: missing.length === 0, missing, plan };
}

export async function recordExecutionResult(runExternalId, phase, report) {
  const manifest = loadManifest();
  const notion = getNotion();
  const runs = await queryByRichText(notion, manifest.databases.projectRuns.dataSourceId, "External ID", runExternalId);
  const run = runs[0];
  if (!run) throw new Error("Run no encontrado");

  const reportId = `csn:report:${runExternalId}:p${String(phase).padStart(2, "0")}:${Date.now()}`;
  const dir = path.join(path.dirname(new URL(import.meta.url).pathname), "../execution-reports", runExternalId.replace(/:/g, "_"));
  fs.mkdirSync(dir, { recursive: true });
  const fp = path.join(dir, `phase-${String(phase).padStart(2, "0")}.json`);
  fs.writeFileSync(fp, JSON.stringify({ reportId, ...report, recordedAt: new Date().toISOString() }, null, 2));

  const execTasks = (await executionTasksForRun(notion, manifest, run.id)).filter(
    (t) => t.properties.Phase?.number === phase,
  );

  const statusMap = {
    not_started: "Not started",
    in_progress: "In progress",
    blocked: "Blocked",
    implemented_pending: "In progress",
    verified_sandbox: "Done",
    rejected: "Blocked",
  };
  const notionStatus = statusMap[report.executionStatus] || "In progress";

  for (const t of execTasks) {
    await notion.pages.update({
      page_id: t.id,
      properties: {
        Status: { status: { name: notionStatus } },
        "Required Evidence": {
          rich_text: rt((report.evidenceUrls || []).join("\n") || report.summary || ""),
        },
        "Resultado ejecución": {
          rich_text: rt(`${report.executionStatus}: ${report.summary || ""}`.slice(0, 2000)),
        },
      },
    });
  }

  await notion.pages.update({
    page_id: run.id,
    properties: {
      "Último informe ejecución": {
        rich_text: rt(`${report.executionStatus}: ${report.summary || ""}`.slice(0, 2000)),
      },
      "Estado verificación": {
        select: { name: report.verificationLabel || "Implementado pendiente verificación" },
      },
      ...(report.evidenceUrls?.[0] ? { "Evidence URL": { url: report.evidenceUrls[0] } } : {}),
      ...(report.advancePhase && phase < 12 ? { "Current Phase": { number: phase + 1 } } : {}),
    },
  });

  return { reportId, path: fp };
}

export { legacyRowCounts };
