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
import {
  listProjects,
  getContinueGuide,
  getSiteMaintenanceOverview,
  runExternalIdFromLaunchKey,
  validateIntake,
} from "../csn-os/lib/project-ux.mjs";

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

function resolveRunExternalId(opts) {
  if (opts["run-external-id"]) return opts["run-external-id"];
  if (opts["launch-key"]) return runExternalIdFromLaunchKey(opts["launch-key"]);
  return null;
}

function printPlan(plan) {
  console.log(`\n📋 Plan de trabajo — ${plan.runName}`);
  console.log(`   Clave: ${plan.runExternalId.replace("csn:run:", "")} | Clase: ${plan.recordClass} | Fase: ${plan.currentPhase}\n`);
  for (const p of Object.values(plan.phases).sort((a, b) => a.id - b.id)) {
    const icon =
      p.status === "complete" ? "✅" : p.status === "current" ? "▶️" : p.status === "locked" ? "🔒" : "⬜";
    console.log(
      `${icon} Fase ${p.id}: ${p.nameEs} — tareas ${p.tasksDone}/${p.tasksTotal}${p.blockers?.length ? ` ⚠ ${p.blockers.join("; ")}` : ""}`,
    );
  }
  const lk = plan.runExternalId.replace("csn:run:", "");
  console.log(`\nSiguiente paso: npm run csn -- prompt --launch-key=${lk}\n`);
}

async function diagnostico() {
  const manifest = loadManifest();
  const notion = getNotion();
  const legacy = await legacyRowCounts(notion);
  console.log(
    JSON.stringify(
      {
        queFunciona: [
          "proyecto crear + continuar + prompt/resultado por --launch-key",
          "Plan 12 fases y tareas de ejecución en Notion",
          "Publicación de prompts en página hija de la tarea",
          "Bloqueo de tareas ante fallos (estado Blocked)",
        ],
        manualEnNotion: [
          "Aprobaciones Human Gates (producción, dominio, etc.)",
          "Filas de mantenimiento/incidencias si aún no existen",
        ],
        noImplementado: [
          "Botones ni formularios nativos en Notion",
          "Planificación automática de arquitectura sin brief del operador",
          "Selección de siguiente tarea sin leer estado en Notion",
        ],
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
CSN OS — comandos (usa --launch-key= cuando puedas; evita memorizar IDs):

  diagnostico
  schema | panel | sync-hub
  proyecto crear --nombre=... --launch-key=... --brief=... [--repo=] [--production=true]
  proyectos [--solo-produccion]
  continuar --launch-key=...     Plan, bloqueos, tarea sugerida y pasos
  mantener --launch-key=...      Mantenimiento e incidencias del sitio
  plan --launch-key=... | --run-external-id=...
  prompt --launch-key=... [--phase=N] [--print]
  resultado --launch-key=... --json=informe.json [--phase=N]
  readiness --launch-key=... --phase=N

Ejemplo flujo completo:
  npm run csn -- proyecto crear --nombre="Mi sitio" --launch-key=mi-sitio --brief="Alcance..."
  npm run csn -- continuar --launch-key=mi-sitio
  npm run csn -- prompt --launch-key=mi-sitio --print
  npm run csn -- resultado --launch-key=mi-sitio --json=informe.json
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
  if (cmd === "sync-hub") {
    const { spawn } = await import("child_process");
    const r = spawn("node", [new URL("./csn-sync-hub.mjs", import.meta.url).pathname], { stdio: "inherit" });
    r.on("close", (c) => process.exit(c ?? 0));
    return;
  }
  if (cmd === "demo-live-offline") {
    const { spawn } = await import("child_process");
    const r = spawn("node", [new URL("./csn-demo-live-offline.mjs", import.meta.url).pathname], {
      stdio: "inherit",
    });
    r.on("close", (c) => process.exit(c ?? 0));
    return;
  }
  if (cmd === "proyecto-crear") {
    const isProduction = opts.production === "true";
    const intake = validateIntake({
      siteName: opts.nombre,
      projectBrief: opts.brief,
      domain: opts.dominio,
      production: isProduction,
      isQa: !isProduction,
    });
    if (!intake.ok) {
      console.warn("⚠ Requisitos incompletos para un flujo sin bloqueos:\n - " + intake.missing.join("\n - "));
      console.warn(intake.note);
    }
    const r = await createProject({
      siteName: opts.nombre || "Nuevo sitio QA",
      launchKey: opts["launch-key"],
      isQa: !isProduction,
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
  if (cmd === "proyectos") {
    const list = await listProjects({
      includeQa: opts["solo-produccion"] !== true,
      productionOnly: opts["solo-produccion"] === true,
    });
    console.log(JSON.stringify(list, null, 2));
    return;
  }
  if (cmd === "continuar") {
    const lk = opts["launch-key"];
    if (!lk) {
      const list = await listProjects({ includeQa: true });
      console.log("Proyectos registrados:\n");
      for (const p of list) {
        console.log(
          `${p.isQa ? "[QA] " : ""}${p.siteName} — fase ${p.currentPhase}, ${p.progressPercent}% — continuar: npm run csn -- continuar --launch-key=${p.launchKey}`,
        );
      }
      return;
    }
    const guide = await getContinueGuide(lk);
    console.log(JSON.stringify(guide, null, 2));
    return;
  }
  if (cmd === "mantener") {
    const lk = opts["launch-key"];
    if (!lk) {
      console.error("Indica --launch-key=<clave del proyecto>");
      process.exit(1);
    }
    const m = await getSiteMaintenanceOverview(lk);
    console.log(JSON.stringify(m, null, 2));
    return;
  }
  const runExt = resolveRunExternalId(opts);
  if (!runExt && ["plan", "readiness", "sync-tareas", "prompt", "resultado"].includes(cmd)) {
    console.error("Falta --launch-key= o --run-external-id=");
    process.exit(1);
  }
  if (cmd === "plan") {
    printPlan(await getWorkPlan(runExt));
    return;
  }
  if (cmd === "readiness") {
    const r = await checkPhaseReadiness(runExt, Number(opts.phase || 1));
    console.log(JSON.stringify(r, null, 2));
    return;
  }
  if (cmd === "sync-tareas") {
    const manifest = loadManifest();
    const r = await syncExecutionTasksForRun(getNotion(), manifest, runExt);
    console.log(r);
    return;
  }
  if (cmd === "prompt") {
    const manifest = loadManifest();
    let phase = opts.phase ? Number(opts.phase) : null;
    if (!phase) {
      const plan = await getWorkPlan(runExt);
      phase = plan.nextRecommendedPhase;
    }
    const result = await assemblePrompt({
      manifest,
      runExternalId: runExt,
      phase,
      taskExternalId: opts["task-external-id"],
    });
    console.log(JSON.stringify({ ...result, copyHint: `cat ${result.path}` }, null, 2));
    if (opts.print) console.log("\n" + fs.readFileSync(result.path, "utf8"));
    return;
  }
  if (cmd === "resultado") {
    let phase = opts.phase ? Number(opts.phase) : null;
    if (!phase) {
      const plan = await getWorkPlan(runExt);
      phase = plan.nextRecommendedPhase;
    }
    const body = JSON.parse(fs.readFileSync(opts.json, "utf8"));
    const r = await recordExecutionResult(runExt, phase, body);
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
