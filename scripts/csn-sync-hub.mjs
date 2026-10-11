#!/usr/bin/env node
/**
 * Sincroniza hub en raíz canónica, runbooks ES, prompts de prueba y verificación.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { loadManifest } from "../csn-os/lib/manifest.mjs";
import { getNotion, legacyRowCounts } from "../csn-os/lib/notion.mjs";
import { ensureOperationalSchema } from "../csn-os/lib/ensure-operational-schema.mjs";
import { syncCanonicalRootHub, verifyRootHubFirstBlock } from "../csn-os/lib/notion-root-hub.mjs";
import {
  alignPrimaryEntryPage,
  disambiguateDuplicateRoot,
  syncParentContainerIndex,
  verifyPrimaryEntryFingerprint,
} from "../csn-os/lib/primary-entry-page.mjs";
import { syncRunbooksSpanish } from "../csn-os/lib/sync-runbooks-es.mjs";
import { assemblePrompt } from "../csn-os/lib/assemble-prompt.mjs";
import { createProject, syncExecutionTasksForRun } from "../csn-os/lib/workflow.mjs";
import { queryByRichText } from "../csn-os/lib/notion.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const DEMO_LAUNCH = "demo-qa-live-offline";
const DEMO_RUN_EXT = `csn:run:${DEMO_LAUNCH}`;
const DEMO_TASK_LIVE = `csn:taskrun:${DEMO_RUN_EXT}:demo-live-offline-v1`;

async function ensureDemoProject(notion, manifest) {
  await createProject({
    siteName: "DEMO QA — LIVE/OFFLINE Cam Profiles",
    launchKey: DEMO_LAUNCH,
    isQa: true,
    domain: "https://demoqa-liveoffline.example",
    niche: "Live cams (ficticio QA)",
    stack: "Next.js 16 + OpenNext Cloudflare (repo naughtyxxxcams)",
    monetization: "Afiliación CrakRevenue (solo documentación en QA)",
    projectGoal: "Validar flujo CSN OS con tarea técnica LIVE/OFFLINE",
    repositoryUrl: "https://github.com/doctorsresearch1000-max/naughtyxxxcams",
    projectBrief:
      "Sitio QA ficticio para probar CSN OS. Tarea actual: alinear estado LIVE/OFFLINE en perfiles. Repo real inspeccionado: doctorsresearch1000-max/naughtyxxxcams. Sin deploy.",
  });
  await syncExecutionTasksForRun(notion, manifest, DEMO_RUN_EXT);

  const tasksDb = manifest.databases.tasks;
  let task = (await queryByRichText(notion, tasksDb.dataSourceId, "External ID", DEMO_TASK_LIVE))[0];
  if (!task) {
    const run = (await queryByRichText(notion, manifest.databases.projectRuns.dataSourceId, "External ID", DEMO_RUN_EXT))[0];
    const siteId = run.properties.Site?.relation?.[0]?.id;
    task = await notion.pages.create({
      parent: { database_id: tasksDb.id },
      properties: {
        Task: { title: [{ text: { content: "[QA] Coherencia LIVE/OFFLINE en perfiles de modelo" } }] },
        "Record Type": { select: { name: "Execution task" } },
        "External ID": { rich_text: [{ text: { content: DEMO_TASK_LIVE } }] },
        Phase: { number: 7 },
        Status: { status: { name: "In progress" } },
        "Project Run": { relation: [{ id: run.id }] },
        ...(siteId ? { Site: { relation: [{ id: siteId }] } } : {}),
      },
    });
  }
  return task;
}

async function publishThreeQaTasks(manifest) {
  const notion = getNotion();
  await ensureDemoProject(notion, manifest);

  const tasks = [
    { ext: DEMO_TASK_LIVE, phase: 7 },
    { ext: `csn:taskrun:${DEMO_RUN_EXT}:p05:02`, phase: 5 },
    { ext: `csn:taskrun:${DEMO_RUN_EXT}:p06:01`, phase: 6 },
  ];

  const published = [];
  for (const t of tasks) {
    const row = await queryByRichText(notion, manifest.databases.tasks.dataSourceId, "External ID", t.ext);
    if (!row[0] && t.ext !== DEMO_TASK_LIVE) continue;
    const r = await assemblePrompt({
      manifest,
      runExternalId: DEMO_RUN_EXT,
      phase: t.phase,
      taskExternalId: t.ext,
      publish: true,
    });
    published.push({ taskExternalId: t.ext, notionUrl: r.notionUrl, blocked: r.blocked });
  }
  return published;
}

async function main() {
  const manifest = loadManifest();
  const notion = getNotion();
  const legacyBefore = await legacyRowCounts(notion);

  await ensureOperationalSchema(notion, manifest);
  const entry = await alignPrimaryEntryPage(notion, manifest);
  const dup = await disambiguateDuplicateRoot(notion);
  const published = await publishThreeQaTasks(manifest);
  const runbookUrl = await syncRunbooksSpanish(manifest);

  const run = (await queryByRichText(notion, manifest.databases.projectRuns.dataSourceId, "External ID", DEMO_RUN_EXT))[0];
  const task = (await queryByRichText(notion, manifest.databases.tasks.dataSourceId, "External ID", DEMO_TASK_LIVE))[0];

  const hub = await syncCanonicalRootHub(manifest, {
    runUrl: run?.url,
    taskUrl: task?.url,
    promptUrl: task?.properties["Prompt Notion URL"]?.url,
    promptLinks: await (async () => {
      const out = [];
      for (const p of published.filter((x) => x.notionUrl)) {
        const row = (await queryByRichText(notion, manifest.databases.tasks.dataSourceId, "External ID", p.taskExternalId))[0];
        out.push({
          name: row?.properties?.Task?.title?.[0]?.plain_text || p.taskExternalId,
          url: p.notionUrl,
        });
      }
      return out;
    })(),
  });

  await syncParentContainerIndex(notion, hub.rootUrl);
  const verify = await verifyRootHubFirstBlock(notion, manifest.rootPageId);
  const fingerprint = await verifyPrimaryEntryFingerprint(notion, manifest.rootPageId);
  const legacyAfter = await legacyRowCounts(notion);

  const evidence = {
    at: new Date().toISOString(),
    rootUrl: hub.rootUrl,
    runbookUrl,
    primaryEntry: entry,
    duplicateRoot: dup,
    hub,
    verifyRoot: verify,
    fingerprint,
    published,
    legacyOk: JSON.stringify(legacyBefore) === JSON.stringify(legacyAfter),
    legacyBefore,
    legacyAfter,
  };

  const out = path.join(__dirname, "../docs/csn-hub-integration-evidence.json");
  fs.writeFileSync(out, JSON.stringify(evidence, null, 2));
  console.log(JSON.stringify(evidence, null, 2));

  if (!verify.ok || !fingerprint.match || !evidence.legacyOk) process.exit(1);
  if (published.some((p) => !p.notionUrl || p.blocked)) process.exit(1);
}

main().catch((e) => {
  console.error(e.body?.message || e.message || e);
  process.exit(1);
});
