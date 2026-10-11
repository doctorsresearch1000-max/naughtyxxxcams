#!/usr/bin/env node
"use strict";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { loadManifest, CANONICAL_ROOT_ID } from "../csn-os/lib/manifest.mjs";
import { getNotion, getDb, queryByRichText, queryByTitle, legacyRowCounts } from "../csn-os/lib/notion.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rt = (text) => [{ text: { content: (text || "").slice(0, 2000) } }];

async function ensureSchema(notion, manifest) {
  const sop = manifest.databases.sopVersions.dataSourceId;
  await notion.dataSources.update({
    data_source_id: sop,
    properties: {
      "Artifact Type": {
        select: {
          options: [
            { name: "Network Standard", color: "blue" },
            { name: "Phase Specification", color: "green" },
            { name: "Prompt Template", color: "purple" },
            { name: "SOP Bundle", color: "gray" },
          ],
        },
      },
      "Artifact ID": { rich_text: {} },
      Scope: {
        select: {
          options: [
            { name: "network-wide", color: "blue" },
            { name: "project-specific", color: "orange" },
          ],
        },
      },
      Phase: { number: { format: "number" } },
      "Validation Status": {
        select: {
          options: [
            { name: "Draft", color: "default" },
            { name: "In Review", color: "yellow" },
            { name: "Approved", color: "green" },
            { name: "Deprecated", color: "gray" },
            { name: "Archived", color: "brown" },
          ],
        },
      },
      "Change Summary": { rich_text: {} },
      Supersedes: { rich_text: {} },
      Dependencies: { rich_text: {} },
      "Repository Path": { rich_text: {} },
      Owner: { rich_text: {} },
    },
  });
  await sleep(300);

  const tasks = manifest.databases.tasks.dataSourceId;
  await notion.dataSources.update({
    data_source_id: tasks,
    properties: {
      "Record Type": {
        select: {
          options: [
            { name: "Task definition", color: "blue" },
            { name: "Execution task", color: "green" },
          ],
        },
      },
      "Task Definition Ref": { rich_text: {} },
    },
  });
  await sleep(300);

  const sites = manifest.databases.csnSites.dataSourceId;
  await notion.dataSources.update({
    data_source_id: sites,
    properties: {
      "Repository URL": { url: {} },
      "Project Brief": { rich_text: {} },
    },
  });
  await sleep(300);

  const runs = manifest.databases.projectRuns.dataSourceId;
  await notion.dataSources.update({
    data_source_id: runs,
    properties: {
      "Project Brief": { rich_text: {} },
      "Architecture Summary": { rich_text: {} },
      "Generated Prompt ID": { rich_text: {} },
      "Generated Prompt Path": { rich_text: {} },
      "Source Versions": { rich_text: {} },
    },
  });
}

async function registerArtifacts(notion, manifest) {
  const catalog = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../csn-os/artifact-catalog.json"), "utf8"),
  );
  const dbId = manifest.databases.sopVersions.id;
  const ds = manifest.databases.sopVersions.dataSourceId;
  const created = [];

  const all = [
    ...catalog.standards.map((s) => ({
      artifactId: s.id,
      type: "Network Standard",
      name: s.name,
      version: s.version,
      path: s.path,
      phase: null,
    })),
    ...catalog.phases.map((p) => ({
      artifactId: p.artifactId,
      type: "Phase Specification",
      name: `Phase ${p.phase} Specification`,
      version: "1.0.0",
      path: p.path,
      phase: p.phase,
    })),
    ...catalog.promptTemplates.map((t) => ({
      artifactId: t.artifactId,
      type: "Prompt Template",
      name: t.artifactId.split(":").pop(),
      version: "1.0.0",
      path: t.path,
      phase: null,
    })),
  ];

  for (const a of all) {
    const existing = await queryByRichText(notion, ds, "Artifact ID", a.artifactId);
    const props = {
      Name: { title: [{ text: { content: a.name } }] },
      Version: { rich_text: rt(a.version) },
      Status: { select: { name: "Active" } },
      "Validation Status": { select: { name: "Approved" } },
      "Artifact Type": { select: { name: a.type } },
      "Artifact ID": { rich_text: rt(a.artifactId) },
      Scope: { select: { name: "network-wide" } },
      "Repository Path": { rich_text: rt(a.path) },
      Verified: { checkbox: a.type === "Phase Specification" },
      ...(a.phase ? { Phase: { number: a.phase } } : {}),
    };
    if (existing[0]) {
      await notion.pages.update({ page_id: existing[0].id, properties: props });
    } else {
      await notion.pages.create({ parent: { database_id: dbId }, properties: props });
      created.push(a.artifactId);
    }
    await sleep(150);
  }
  return created;
}

function v2ToTaskdef(ext) {
  return ext.replace("csn:task:v2:", "csn:taskdef:v1:");
}

async function migrateTasks(notion, manifest) {
  const tasksDb = manifest.databases.tasks;
  const ds = tasksDb.dataSourceId;
  let cursor;
  const rows = [];
  do {
    const r = await notion.dataSources.query({ data_source_id: ds, page_size: 100, start_cursor: cursor });
    rows.push(...r.results);
    cursor = r.has_more ? r.next_cursor : undefined;
  } while (cursor);

  let defs = 0;
  let execs = 0;
  for (const row of rows) {
    const ext = row.properties["External ID"]?.rich_text?.map((t) => t.plain_text).join("") || "";
    if (!ext) continue;
    const recordType = row.properties["Record Type"]?.select?.name;
    if (ext.startsWith("csn:taskrun:")) continue;

    let newExt = ext;
    if (ext.startsWith("csn:task:v2:")) newExt = v2ToTaskdef(ext);

    const props = {
      "Record Type": { select: { name: "Task definition" } },
      "External ID": { rich_text: rt(newExt) },
      "Task Definition Ref": { rich_text: rt(newExt) },
      Site: { relation: [] },
      "Project Run": { relation: [] },
    };
    await notion.pages.update({ page_id: row.id, properties: props });
    defs++;
    await sleep(120);
  }
  return { defs, execs, rows: rows.length };
}

async function ensureSandboxFictional(notion, manifest) {
  const sitesDb = manifest.databases.csnSites;
  const runsDb = manifest.databases.projectRuns;
  const siteExt = "csn:site:fictional-sandbox-prompt-qa";
  const runExt = "csn:run:fictional-sandbox-prompt-qa";

  let site = (await queryByRichText(notion, sitesDb.dataSourceId, "External ID", siteExt))[0];
  if (!site) {
    site = await notion.pages.create({
      parent: { database_id: sitesDb.id },
      properties: {
        "Site Name": { title: [{ text: { content: "FICTIONAL-SANDBOX-PROMPT-QA" } }] },
        "Record Class": { select: { name: "QA test-only" } },
        Domain: { url: "https://fictional-sandbox.example" },
        "External ID": { rich_text: rt(siteExt) },
        "Launch Key": { rich_text: rt("fictional-sandbox-prompt-qa") },
        "Repository URL": { url: "https://github.com/example/fictional-sandbox-repo" },
        "Project Brief": {
          rich_text: rt(
            "Fictional cam site for prompt-system QA. Audience: test only. Monetization: none. No real credentials.",
          ),
        },
        Status: { status: { name: "In progress" } },
      },
    });
  }

  let run = (await queryByRichText(notion, runsDb.dataSourceId, "External ID", runExt))[0];
  if (!run) {
    run = await notion.pages.create({
      parent: { database_id: runsDb.id },
      properties: {
        "Run Name": { title: [{ text: { content: "Fictional Prompt QA Run" } }] },
        "Run Type": { select: { name: "QA Sandbox" } },
        "External ID": { rich_text: rt(runExt) },
        "Launch Key": { rich_text: rt("fictional-sandbox-prompt-qa") },
        Site: { relation: [{ id: site.id }] },
        Status: { status: { name: "In progress" } },
        "Current Phase": { number: 5 },
        "Project Brief": {
          rich_text: rt(
            "Fictional brief: validate prompt assembly only. Framework TBD after repo inspection.",
          ),
        },
      },
    });
  }
  return { siteId: site.id, runExt, siteExt };
}

async function syncExecutionTasks(notion, manifest, runExternalId) {
  const tasksDb = manifest.databases.tasks;
  const runs = await queryByRichText(notion, manifest.databases.projectRuns.dataSourceId, "External ID", runExternalId);
  if (!runs[0]) throw new Error("run not found");
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
        Task: { title: [{ text: { content: `[Run] ${title}` } }] },
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
    await sleep(100);
  }
  return { created, reused, total: defs.length };
}

async function main() {
  const manifest = loadManifest();
  if (manifest.rootPageId !== CANONICAL_ROOT_ID) {
    throw new Error("Refusing setup: manifest root is not canonical.");
  }
  const notion = getNotion();
  const legacyBefore = await legacyRowCounts(notion);

  console.log("Schema updates…");
  await ensureSchema(notion, manifest);
  console.log("Register artifacts…");
  const newArts = await registerArtifacts(notion, manifest);
  console.log("Migrate task definitions…");
  const mig = await migrateTasks(notion, manifest);
  console.log("Fictional sandbox…");
  const fictional = await ensureSandboxFictional(notion, manifest);
  console.log("Sync execution tasks for QA runs…");
  const qaRun = manifest.qa?.first?.runId
    ? (
        await notion.pages.retrieve({ page_id: manifest.qa.first.runId })
      ).properties["External ID"]?.rich_text?.map((t) => t.plain_text).join("")
    : "csn:qa-sandbox-notion:launch:v1";
  const execQa = await syncExecutionTasks(notion, manifest, qaRun);
  const execFic = await syncExecutionTasks(notion, manifest, fictional.runExt);

  const legacyAfter = await legacyRowCounts(notion);
  const summary = {
    canonicalRoot: CANONICAL_ROOT_ID,
    newArtifacts: newArts.length,
    taskMigration: mig,
    fictional,
    executionTasks: { qa: execQa, fictional: execFic },
    legacyIntegrity: legacyBefore,
    legacyOk: JSON.stringify(legacyBefore) === JSON.stringify(legacyAfter),
  };
  fs.writeFileSync(
    path.join(__dirname, "notion-csn-prompt-setup-summary.json"),
    JSON.stringify(summary, null, 2) + "\n",
  );
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((e) => {
  console.error(e.body?.message || e.message || e);
  process.exit(1);
});
