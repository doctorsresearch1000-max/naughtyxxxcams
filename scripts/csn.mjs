#!/usr/bin/env node
/**
 * CSN OS — CLI operativa (Notion + generador de prompts).
 * Uso: npm run csn -- <comando> [opciones]
 */
import fs from "fs";
import dotenv from "dotenv";
import { loadManifest } from "../csn-os/lib/manifest.mjs";
import { getNotion, legacyRowCounts } from "../csn-os/lib/notion.mjs";
import { ensureOperationalSchema } from "../csn-os/lib/ensure-operational-schema.mjs";
import {
  createProject,
  getWorkPlan,
  checkPhaseReadiness,
  recordExecutionResult,
  syncExecutionTasksForRun,
} from "../csn-os/lib/workflow.mjs";
import { assemblePrompt } from "../csn-os/lib/assemble-prompt.mjs";
import { syncProjectPanel } from "./csn-panel-sync.mjs";

dotenv.config({ path: new URL("../.env", import.meta.url).pathname });

function parseArgs(argv) {
  const cmd = argv[0];
  const opts = {};
  for (const a of argv.slice(1)) {
    const m = a.match(/^--([^=]+)=(.*)$/);
    if (m) opts[m[1]] = m[2];
    else if (a.startsWith("--")) opts[a.slice(2)] = true;
  }
  return { cmd, opts };
}

function printPlan(plan) {
  console.log(`\n📋 Plan de trabajo — ${plan.runName} (${plan.runExternalId})`);
  console.log(`   Clase: ${plan.recordClass} | Dominio: ${plan.domain || "(pendiente)"} | Fase actual: ${plan.currentPhase}\n`);
  for (const p of Object.values(plan.phases).sort((a, b) => a.id - b.id)) {
    const icon =
      p.status === "complete" ? "✅" : p.status === "current" ? "▶️" : p.status === "locked" ? "🔒" : "⬜";
    console.log(
      `${icon} Fase ${p.id}: ${p.nameEs} — tareas ${p.tasksDone}/${p.tasksTotal}${p.blockers?.length ? ` ⚠ ${p.blockers.join("; ")}` : ""}`,
    );
    console.log(`   ${p.summaryEs}`);
  }
  console.log(
    "\nSiguiente paso recomendado: generar prompt para fase",
    plan.nextRecommendedPhase,
    "→ npm run csn -- prompt --run-external-id=" + plan.runExternalId + " --phase=" + plan.nextRecommendedPhase,
  );
}

async function diagnostico() {
  const manifest = loadManifest();
  const notion = getNotion();
  const legacy = await legacyRowCounts(notion);
  console.log(
    JSON.stringify(
      {
        queFunciona: [
          "CLI csn (proyecto, plan, prompt, resultado)",
          "Generador assemble-prompt + artefactos en csn-os/",
          "14 DB aisladas en raíz canónica",
          "Task definition vs execution task",
        ],
        desconectado: [
          "Notion no ejecuta Node: el panel enlaza instrucciones CLI",
          "Vistas filtradas: creación API limitada",
        ],
        falta: ["Copiar al portapapeles nativo en CI", "UI Notion sin botones reales"],
        duplicado: ["Segunda raíz parcial (3 DB) — ignorar"],
        canonicalRoot: manifest.rootPageId,
        legacyCounts: legacy,
      },
      null,
      2,
    ),
  );
}

async function main() {
  const raw = process.argv.slice(2);
  if (raw[0] === "proyecto" && raw[1] === "crear") raw.splice(0, 2, "proyecto-crear");
  const { cmd, opts } = parseArgs(raw);
  if (!cmd || cmd === "help") {
    console.log(`
CSN OS — comandos:

  diagnostico                    Estado del sistema
  schema                         Aplicar propiedades operativas en Notion
  panel                          Sincronizar página «Panel de proyectos»
  proyecto crear --nombre=...      Crear sitio + run + tareas (--qa=true por defecto)
  plan --run-external-id=...     Ver plan de 12 fases
  readiness --run-external-id=... --phase=N
  sync-tareas --run-external-id=...
  prompt --run-external-id=... --phase=N [--print]
  resultado --run-external-id=... --phase=N --json=archivo.json

Ejemplo:
  npm run csn -- proyecto crear --nombre="Mi Sitio QA" --launch-key=mi-sitio-qa
  npm run csn -- plan --run-external-id=csn:run:mi-sitio-qa
  npm run csn -- prompt --run-external-id=csn:run:mi-sitio-qa --phase=5 --print
`);
    return;
  }

  if (cmd === "diagnostico") return diagnostico();
  if (cmd === "schema") {
    const manifest = loadManifest();
    await ensureOperationalSchema(getNotion(), manifest);
    console.log("Schema operativo actualizado.");
    return;
  }
  if (cmd === "panel") {
    const url = await syncProjectPanel();
    console.log("Panel:", url);
    return;
  }
  if (cmd === "proyecto-crear") {
    const r = await createProject({
      siteName: opts.nombre || "Nuevo sitio QA",
      launchKey: opts["launch-key"],
      isQa: opts.qa !== "false" && opts.production !== "true",
      domain: opts.dominio,
      niche: opts.nicho,
      stack: opts.stack,
      monetization: opts.monetizacion,
      projectGoal: opts.objetivo,
      repositoryUrl: opts.repo,
      projectBrief: opts.brief,
    });
    console.log(JSON.stringify(r, null, 2));
    return;
  }
  if (cmd === "plan") {
    const plan = await getWorkPlan(opts["run-external-id"]);
    printPlan(plan);
    return;
  }
  if (cmd === "readiness") {
    const r = await checkPhaseReadiness(opts["run-external-id"], Number(opts.phase || 1));
    console.log(JSON.stringify(r, null, 2));
    return;
  }
  if (cmd === "sync-tareas") {
    const manifest = loadManifest();
    const r = await syncExecutionTasksForRun(getNotion(), manifest, opts["run-external-id"]);
    console.log(r);
    return;
  }
  if (cmd === "prompt") {
    const manifest = loadManifest();
    const phase = Number(opts.phase || 1);
    const result = await assemblePrompt({
      manifest,
      runExternalId: opts["run-external-id"],
      phase,
    });
    console.log(JSON.stringify({ ...result, copyHint: `cat ${result.path}` }, null, 2));
    if (opts.print) console.log("\n" + fs.readFileSync(result.path, "utf8"));
    return;
  }
  if (cmd === "resultado") {
    const body = JSON.parse(fs.readFileSync(opts.json, "utf8"));
    const r = await recordExecutionResult(opts["run-external-id"], Number(opts.phase), body);
    console.log(r);
    return;
  }

  console.error("Comando desconocido:", cmd);
  process.exit(1);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
