#!/usr/bin/env node
/**
 * Recorrido QA: Día 1 → registro → prompt → éxito/fallo (sin navegador).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import dotenv from "dotenv";
import { getNotion, legacyRowCounts } from "../csn-os/lib/notion.mjs";
import { loadManifest } from "../csn-os/lib/manifest.mjs";
import { verifyRootHubFirstBlock } from "../csn-os/lib/notion-root-hub.mjs";

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), "../.env") });

async function main() {
  if (!process.env.CSN_CONSOLE_TOKEN?.trim()) {
    process.env.CSN_CONSOLE_TOKEN = `walkthrough-${Date.now()}`;
  }
  const api = await import(pathToFileURL(path.join(path.dirname(fileURLToPath(import.meta.url)), "../csn-os/lib/console-api.mjs")).href);
  const manifest = loadManifest();
  const notion = getNotion();
  const legacyBefore = await legacyRowCounts(notion);
  const hub = await verifyRootHubFirstBlock(notion, manifest.rootPageId);

  const lk = `qa-guia-7d-${Date.now()}`;
  const checks = {};

  checks.hub7day = hub.ok && hub.titleOk;
  checks.day1PageExists = Boolean(manifest.launchGuide7Day?.pages?.find((p) => p.day === 1));

  const created = await api.createProjectFromForm({
    siteName: `QA Guía 7 días ${lk}`,
    projectBrief:
      "Sitio de prueba para validar la guía de 7 días. Nicho: live cams. Sin deploy ni DNS. Basado en procedimientos CSN del repo.",
    niche: "Live cams (QA)",
    projectGoal: "Validar recorrido día 1",
    repositoryUrl: "https://github.com/doctorsresearch1000-max/naughtyxxxcams",
    environment: "qa",
    launchKey: lk,
  });
  checks.createWithoutManualCli = Boolean(created.runId);
  checks.firstTask = Boolean(created.firstPending?.title);

  const view = await api.getProjectConsoleView(lk);
  checks.findDay1Task = Boolean(view.nextTask);

  const prompt = await api.generatePromptForLaunchKey(lk, { phase: 1 });
  checks.promptCopyReady = Boolean(prompt.markdown?.length > 400 && !prompt.blocked);

  const ok = await api.recordResultFromForm(lk, {
    outcome: "success",
    summary: "Walkthrough guía 7d — evidencia QA",
    evidenceUrls: "https://example.com/evidence-7day-walkthrough",
    advancePhase: false,
  });
  checks.registerEvidence = ok.record.taskStatus === "Done";

  const fail = await api.recordResultFromForm(lk, {
    outcome: "failure",
    summary: "Fallo simulado walkthrough",
    evidenceUrls: "",
  });
  checks.blockedOnFail = fail.record.taskStatus === "Blocked";

  const idem = await api.createProjectFromForm({
    siteName: `QA Guía 7 días ${lk}`,
    projectBrief: "Idempotencia",
    environment: "qa",
    launchKey: lk,
  });
  checks.idempotent = idem.executionTasks.reused >= 28;

  const legacyAfter = await legacyRowCounts(notion);
  checks.legacyUnchanged = JSON.stringify(legacyBefore) === JSON.stringify(legacyAfter);

  checks.allPass = Object.entries(checks)
    .filter(([k]) => k !== "allPass")
    .every(([, v]) => v === true);

  const report = {
    at: new Date().toISOString(),
    launchKey: lk,
    checks,
    day1GuideUrl: manifest.launchGuide7Day?.pages?.find((p) => p.day === 1)?.url,
  };
  const outPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "../docs/csn-7day-guide-walkthrough.json");
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  process.exit(checks.allPass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
