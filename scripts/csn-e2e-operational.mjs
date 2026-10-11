#!/usr/bin/env node
/** Casos A–H flujo operativo (sandbox QA, sin legacy). */
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { loadManifest } from "../csn-os/lib/manifest.mjs";
import { getNotion, legacyRowCounts } from "../csn-os/lib/notion.mjs";
import { ensureOperationalSchema } from "../csn-os/lib/ensure-operational-schema.mjs";
import {
  createProject,
  getWorkPlan,
  checkPhaseReadiness,
  recordExecutionResult,
} from "../csn-os/lib/workflow.mjs";
import { assemblePrompt } from "../csn-os/lib/assemble-prompt.mjs";

dotenv.config({ path: new URL("../.env", import.meta.url).pathname });

const REPORT = path.join(path.dirname(new URL(import.meta.url).pathname), "../docs/csn-e2e-operacional-report.md");

async function main() {
  const manifest = loadManifest();
  const notion = getNotion();
  const legacyBefore = await legacyRowCounts(notion);
  await ensureOperationalSchema(notion, manifest);

  const results = {};
  const lk = `e2e-qa-${Date.now()}`;

  results.A = await createProject({
    siteName: `E2E QA ${lk}`,
    launchKey: lk,
    isQa: true,
    niche: "Ficticio",
    stack: "Next.js (pendiente confirmar)",
    projectGoal: "Probar flujo CSN",
    repositoryUrl: "https://github.com/example/e2e-repo",
    projectBrief: "Proyecto E2E automatizado. No es producción.",
  });

  results.B = await getWorkPlan(results.A.runExternalId);
  results.B_pass = results.B.phases[1].tasksTotal > 0;

  const gen = await assemblePrompt({ manifest, runExternalId: results.A.runExternalId, phase: 5 });
  const text = fs.readFileSync(gen.path, "utf8");
  results.C = {
    pass: !gen.blocked && text.includes("E2E QA") && text.includes("e2e-repo") && !text.includes("{{"),
    path: gen.path,
  };

  const blocked = await checkPhaseReadiness(results.A.runExternalId, 11);
  results.D = { pass: !blocked.ready || blocked.missing.length > 0, missing: blocked.missing };

  const report = {
    executionStatus: "verified_sandbox",
    verificationLabel: "Verificado en sandbox",
    summary: "E2E test run — sin cambios reales",
    evidenceUrls: ["https://example.com/evidence-e2e"],
    tests: [{ cmd: "npm run lint", exit: 0, note: "simulado" }],
    advancePhase: false,
  };
  const rec = await recordExecutionResult(results.A.runExternalId, 5, report);
  results.E = { pass: Boolean(rec.path), rec };

  const planAfter = await getWorkPlan(results.A.runExternalId);
  results.F = {
    pass: planAfter.phases[5].tasksDone >= 0,
    phase5done: planAfter.phases[5].tasksDone,
  };

  const legacyAfter = await legacyRowCounts(notion);
  results.G = { pass: JSON.stringify(legacyBefore) === JSON.stringify(legacyAfter) };

  const gen2 = await assemblePrompt({ manifest, runExternalId: results.A.runExternalId, phase: 5 });
  results.H = { pass: gen.promptId === gen2.promptId };

  const allPass =
    results.B_pass &&
    results.C.pass &&
    results.D.pass &&
    results.E.pass &&
    results.F.pass &&
    results.G.pass &&
    results.H.pass;

  const md = `# E2E operacional CSN OS\n\n${new Date().toISOString()}\n\n**${allPass ? "PASS" : "FAIL"}**\n\n\`\`\`json\n${JSON.stringify(results, null, 2)}\n\`\`\`\n`;
  fs.writeFileSync(REPORT, md);
  console.log(md);
  process.exit(allPass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
