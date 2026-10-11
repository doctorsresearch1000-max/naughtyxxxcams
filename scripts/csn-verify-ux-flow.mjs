#!/usr/bin/env node
/** Valida flujo UX con proyecto QA e2e-qa-automation (remoto). */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { loadManifest } from "../csn-os/lib/manifest.mjs";
import { getNotion } from "../csn-os/lib/notion.mjs";
import { verifyRootHubFirstBlock } from "../csn-os/lib/notion-root-hub.mjs";
import { getContinueGuide, listProjects } from "../csn-os/lib/project-ux.mjs";
import { assemblePrompt } from "../csn-os/lib/assemble-prompt.mjs";
import { recordExecutionResult } from "../csn-os/lib/workflow.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const QA_LK = "e2e-qa-automation";

async function main() {
  const manifest = loadManifest();
  const notion = getNotion();
  const hub = await verifyRootHubFirstBlock(notion, manifest.rootPageId);
  const guide = await getContinueGuide(QA_LK);
  const projects = await listProjects({ includeQa: true });
  const qa = projects.find((p) => p.launchKey === QA_LK);

  const gen = await assemblePrompt({
    manifest,
    runExternalId: `csn:run:${QA_LK}`,
    phase: guide.nextTask?.phase || 1,
  });

  const failReport = {
    executionStatus: "failed",
    verificationLabel: "Prueba UX",
    summary: "Fallo simulado para verificar bloqueo",
    evidenceUrls: [],
    advancePhase: false,
  };
  const rec = await recordExecutionResult(`csn:run:${QA_LK}`, guide.nextTask?.phase || 5, failReport);

  const evidence = {
    at: new Date().toISOString(),
    hubCentroAcciones: hub.ok,
    hubPreview: hub.calloutPreview,
    qaProjectFound: Boolean(qa),
    qaIsTestOnly: qa?.recordClass?.includes("QA"),
    continueHasNextTask: Boolean(guide.nextTask),
    continueHasSteps: guide.steps?.length === 3,
    promptGenerated: Boolean(gen.path) && !gen.blocked,
    promptNotionUrl: gen.notionUrl || null,
    failureBlocks: rec.taskStatus === "Blocked",
    checks: {
      entryClear: hub.ok,
      planIdentifiable: Boolean(guide.planSummary || guide.currentPhase),
      promptSpecific: Boolean(gen.notionUrl),
      failureBlocksAdvance: rec.taskStatus === "Blocked",
      qaSeparated: qa?.isQa === true,
    },
  };
  evidence.checks.allPass = Object.values(evidence.checks).every((v) => v === true);

  const out = path.join(__dirname, "../docs/csn-ux-flow-evidence.json");
  fs.writeFileSync(out, JSON.stringify(evidence, null, 2));
  console.log(JSON.stringify(evidence, null, 2));
  process.exit(evidence.checks.allPass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
