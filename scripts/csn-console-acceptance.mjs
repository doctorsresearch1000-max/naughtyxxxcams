#!/usr/bin/env node
/**
 * Criterios de aceptación del flujo consola (motor console-api, sin navegador).
 * Requiere NOTION_API_KEY y CSN_CONSOLE_TOKEN en .env
 */
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import dotenv from "dotenv";
import { legacyRowCounts, getNotion } from "../csn-os/lib/notion.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const OUT = path.join(__dirname, "../docs/csn-console-acceptance.json");

async function main() {
  if (!process.env.CSN_CONSOLE_TOKEN?.trim()) {
    process.env.CSN_CONSOLE_TOKEN = `test-console-${Date.now()}`;
    console.warn("CSN_CONSOLE_TOKEN generado temporalmente para esta prueba");
  }

  const api = await import(pathToFileURL(path.join(__dirname, "../csn-os/lib/console-api.mjs")).href);
  const legacyBefore = await legacyRowCounts(getNotion());

  const lk = `qa-console-${Date.now()}`;
  const checks = {};

  const created = await api.createProjectFromForm({
    siteName: `QA Consola ${lk}`,
    projectBrief: "Proyecto de aceptación consola web. Nicho test. Sin deploy.",
    niche: "QA",
    projectGoal: "Validar flujo guiado",
    repositoryUrl: "https://github.com/doctorsresearch1000-max/naughtyxxxcams",
    environment: "qa",
    launchKey: lk,
  });
  checks.create = Boolean(created.runId && created.executionTasks);
  checks.notionRun = Boolean(created.runExternalId === `csn:run:${lk}`);

  const view1 = await api.getProjectConsoleView(lk);
  checks.nextTask = Boolean(view1.nextTask?.title);
  checks.progressFromTasks = view1.progress?.tasksTotal > 0;

  const prompt = await api.generatePromptForLaunchKey(lk);
  checks.prompt = Boolean(prompt.markdown?.length > 200 && prompt.notionUrl);

  const ok = await api.recordResultFromForm(lk, {
    outcome: "success",
    summary: "Aceptación consola — éxito simulado",
    evidenceUrls: "https://example.com/evidence-console-qa",
    advancePhase: false,
  });
  checks.successRecord = ok.record.taskStatus === "Done";

  const fail = await api.recordResultFromForm(lk, {
    outcome: "failure",
    summary: "Fallo simulado consola",
    evidenceUrls: "",
    advancePhase: false,
  });
  checks.failureBlocks = fail.record.taskStatus === "Blocked";

  const created2 = await api.createProjectFromForm({
    siteName: `QA Consola ${lk}`,
    projectBrief: "Idempotencia",
    environment: "qa",
    launchKey: lk,
  });
  checks.idempotent =
    created2.executionTasks.reused >= 28 && (created2.executionTasks.created || 0) === 0;

  const legacyAfter = await legacyRowCounts(getNotion());
  checks.legacyUnchanged = JSON.stringify(legacyBefore) === JSON.stringify(legacyAfter);

  checks.allPass = Object.entries(checks)
    .filter(([k]) => k !== "allPass")
    .every(([, v]) => v === true);

  const report = {
    at: new Date().toISOString(),
    launchKey: lk,
    legacyBefore,
    legacyAfter,
    checks,
    interface: "/csn-console",
    apiBase: "/api/csn",
  };
  fs.writeFileSync(OUT, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  process.exit(checks.allPass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
