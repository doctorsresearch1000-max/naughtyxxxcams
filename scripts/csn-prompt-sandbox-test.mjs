#!/usr/bin/env node
"use strict";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { loadManifest } from "../csn-os/lib/manifest.mjs";
import { getNotion, getDb, queryByRichText, legacyRowCounts } from "../csn-os/lib/notion.mjs";
import { assemblePrompt } from "../csn-os/lib/assemble-prompt.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const REPORT = path.join(__dirname, "../docs/csn-prompt-system-sandbox-report.md");

async function countExecTasks(notion, ds, runId) {
  const r = await notion.dataSources.query({
    data_source_id: ds,
    filter: {
      and: [
        { property: "Record Type", select: { equals: "Execution task" } },
        { property: "Project Run", relation: { contains: runId } },
      ],
    },
    page_size: 100,
  });
  return r.results;
}

async function main() {
  const manifest = loadManifest();
  const notion = getNotion();
  const legacyBefore = await legacyRowCounts(notion);
  const tasksDs = getDb(manifest, "tasks").dataSourceId;
  const runsDs = getDb(manifest, "projectRuns").dataSourceId;

  const results = {};

  const ficRun = (
    await queryByRichText(notion, runsDs, "External ID", "csn:run:fictional-sandbox-prompt-qa")
  )[0];
  const qaRunExt = "csn:qa-sandbox-notion:launch:v1";
  const qaRun = (await queryByRichText(notion, runsDs, "External ID", qaRunExt))[0];

  results.test1_isolation = {
    pass: Boolean(ficRun && qaRun && ficRun.id !== qaRun.id),
    fictionalRun: ficRun?.id,
    qaRun: qaRun?.id,
  };

  const gen1 = await assemblePrompt({ manifest, runExternalId: "csn:run:fictional-sandbox-prompt-qa", phase: 5 });
  results.test2_phaseResolution = {
    pass: gen1.sourceVersions?.phaseSpec?.id === "csn:phase:v1:05",
    sourceVersions: gen1.sourceVersions,
  };

  const promptText = fs.readFileSync(gen1.path, "utf8");
  results.test3_promptQuality = {
    pass:
      !gen1.blocked &&
      promptText.includes("FICTIONAL-SANDBOX-PROMPT-QA") &&
      promptText.includes("npm run lint") &&
      !promptText.includes("{{REPOSITORY_URL}}"),
    blocked: gen1.blocked,
    path: gen1.path,
  };

  const ficSite = await notion.pages.retrieve({ page_id: ficRun.properties.Site.relation[0].id });
  const savedSiteBrief = ficSite.properties["Project Brief"]?.rich_text || [];
  const savedRunBrief = ficRun.properties["Project Brief"]?.rich_text || [];
  const savedRepo = ficSite.properties["Repository URL"]?.url || null;
  await notion.pages.update({
    page_id: ficSite.id,
    properties: { "Project Brief": { rich_text: [] }, "Repository URL": { url: null } },
  });
  await notion.pages.update({
    page_id: ficRun.id,
    properties: { "Project Brief": { rich_text: [] } },
  });
  const blocked = await assemblePrompt({
    manifest,
    runExternalId: "csn:run:fictional-sandbox-prompt-qa",
    phase: 5,
  });
  await notion.pages.update({
    page_id: ficSite.id,
    properties: {
      "Project Brief": { rich_text: savedSiteBrief },
      ...(savedRepo ? { "Repository URL": { url: savedRepo } } : {}),
    },
  });
  await notion.pages.update({
    page_id: ficRun.id,
    properties: { "Project Brief": { rich_text: savedRunBrief } },
  });
  results.test4_missingInputs = {
    pass: blocked.blocked && blocked.missing.length > 0,
    missing: blocked.missing,
  };

  const ficExec = ficRun ? await countExecTasks(notion, tasksDs, ficRun.id) : [];
  const qaExec = qaRun ? await countExecTasks(notion, tasksDs, qaRun.id) : [];
  results.test5_independentExecTasks = {
    pass: ficExec.length > 0 && qaExec.length > 0,
    fictionalCount: ficExec.length,
    qaCount: qaExec.length,
    overlap: ficExec.some((f) => qaExec.some((q) => q.id === f.id)),
  };

  const gen2 = await assemblePrompt({ manifest, runExternalId: "csn:run:fictional-sandbox-prompt-qa", phase: 5 });
  results.test6_idempotency = {
    pass: gen1.promptId === gen2.promptId,
    promptId: gen1.promptId,
  };

  const gates = await notion.dataSources.query({
    data_source_id: getDb(manifest, "humanGates").dataSourceId,
    page_size: 50,
  });
  const pendingProd = gates.results.find(
    (g) =>
      g.properties["Target Type"]?.select?.name === "production_deploy" &&
      g.properties.Status?.select?.name === "Pending",
  );
  const prodPrompt = await assemblePrompt({ manifest, runExternalId: "csn:run:fictional-sandbox-prompt-qa", phase: 11 });
  const prodText = fs.readFileSync(prodPrompt.path, "utf8");
  results.test7_gates = {
    pass: prodText.includes("manual") || prodText.includes("Manual") || prodText.includes("Approved"),
    hasPendingProdTemplate: Boolean(pendingProd),
    note: "Technical enforcement unavailable; prompt must not claim prod authorized without Approved gate",
  };

  results.test8_handoff = {
    pass: promptText.includes("Handoff") && promptText.includes("final report"),
  };

  const qaSite = qaRun
    ? await notion.pages.retrieve({ page_id: qaRun.properties.Site.relation[0].id })
    : null;
  results.test9_qaSeparation = {
    pass: qaSite?.properties["Record Class"]?.select?.name === "QA test-only",
    recordClass: qaSite?.properties["Record Class"]?.select?.name,
  };

  const legacyAfter = await legacyRowCounts(notion);
  results.test10_legacy = {
    pass: JSON.stringify(legacyBefore) === JSON.stringify(legacyAfter),
    before: legacyBefore,
    after: legacyAfter,
  };

  const allPass = Object.entries(results).every(([, v]) => v.pass !== false);
  const md = [
    "# CSN Prompt System — Sandbox Test Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    `Overall: ${allPass ? "**PASS**" : "**PARTIAL/FAIL**"}`,
    "",
    "```json",
    JSON.stringify(results, null, 2),
    "```",
    "",
    "## Sample prompt",
    `Path: \`${gen1.path}\``,
    "",
  ].join("\n");
  fs.writeFileSync(REPORT, md);
  console.log(md);
  process.exit(allPass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
