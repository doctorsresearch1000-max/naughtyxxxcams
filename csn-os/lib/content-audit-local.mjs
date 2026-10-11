import fs from "fs";
import path from "path";
import { csnOsRoot } from "./manifest.mjs";

const PHASE_SECTIONS = [
  { key: "purpose", label: "Objetivo y alcance", patterns: [/## Purpose and outcome/i] },
  { key: "entry", label: "Precondiciones", patterns: [/## Entry criteria/i] },
  { key: "work", label: "Instrucciones / secuencia", patterns: [/## Work sequence/i] },
  { key: "acceptance", label: "Criterios de aceptación", patterns: [/## Acceptance criteria/i] },
  { key: "evidence", label: "Evidencias", patterns: [/## Evidence requirements/i] },
  { key: "human", label: "Aprobación humana", patterns: [/## Human approval/i] },
  { key: "deliverables", label: "Entregables", patterns: [/## Expected deliverables/i] },
];

/** Phase specs are catalog metadata — not copy-paste Cursor prompts. */
export function auditPhaseSpecsLocal() {
  const dir = path.join(csnOsRoot(), "phase-specs");
  const files = fs.readdirSync(dir).filter((f) => /^phase-\d{2}\.md$/.test(f));
  const phases = [];
  for (const file of files.sort()) {
    const body = fs.readFileSync(path.join(dir, file), "utf8");
    const phase = Number(file.match(/phase-(\d+)/)[1]);
    const sections = {};
    const missing = [];
    for (const s of PHASE_SECTIONS) {
      const ok = s.patterns.some((p) => p.test(body));
      sections[s.key] = ok;
      if (!ok) missing.push(s.label);
    }
    const repoPath = `csn-os/phase-specs/${file}`;
    const thinWork =
      (body.match(/## Work sequence\n([\s\S]*?)\n##/)?.[1]?.trim().length || 0) < 40;
    phases.push({
      phase,
      file,
      repositoryPath: repoPath,
      classification: "Documentación de fase (catálogo SOP Versions — no prompt ejecutable)",
      sectionsPresent: sections,
      missingSections: missing,
      notes: thinWork
        ? "Work sequence es genérico; el detalle ejecutable está en Tasks + execution-phase.md o overrides en csn-os/task-prompts/"
        : null,
      executablePromptSource: "Tasks → assemble-prompt (execution-phase o override por External ID)",
    });
  }
  return phases;
}

export const KNOWN_QA_LAUNCH_KEYS = [
  "demo-qa-live-offline",
  "e2e-qa-automation",
  "fictional-sandbox-prompt-qa",
  "qa-sandbox-notion-launch-v1",
];

export const KNOWN_QA_PATTERNS = {
  siteName: [/^(E2E QA|DEMO QA|FICTIONAL-SANDBOX)/i, /QA-SANDBOX/i],
  launchKey: [/^e2e-qa-/i, ...KNOWN_QA_LAUNCH_KEYS.map((k) => new RegExp(`^${k}$`, "i"))],
  runExternalId: [
    "csn:run:demo-qa-live-offline",
    "csn:run:e2e-qa-automation",
    "csn:run:fictional-sandbox-prompt-qa",
    "csn:qa-sandbox-notion:launch:v1",
  ],
};

export function classifyRowLocal({ siteName, launchKey, externalId, recordClass }) {
  const lk = (launchKey || "").trim();
  const ext = (externalId || "").trim();
  const name = (siteName || "").trim();
  if (recordClass === "QA test-only") {
    return { category: "QA/demo", reason: "Record Class ya QA test-only" };
  }
  if (KNOWN_QA_LAUNCH_KEYS.includes(lk)) {
    return { category: "QA/demo", reason: `Launch Key conocido: ${lk}` };
  }
  if (KNOWN_QA_PATTERNS.runExternalId.includes(ext)) {
    return { category: "QA/demo", reason: `External ID QA: ${ext}` };
  }
  if (KNOWN_QA_PATTERNS.launchKey.some((re) => re.test(lk))) {
    return { category: "QA/demo", reason: `Launch Key patrón QA: ${lk}` };
  }
  if (KNOWN_QA_PATTERNS.siteName.some((re) => re.test(name))) {
    return { category: "QA/demo", reason: `Nombre sitio QA: ${name}` };
  }
  if (/^e2e-qa-\d+$/.test(lk)) {
    return { category: "QA/demo", reason: "Run E2E con timestamp (legado); marcar QA test-only" };
  }
  return null;
}

export function auditTaskPromptOverrides() {
  const entries = [
    { key: "demo-live-offline-v1", path: "prompts/DEMO-QA-live-offline-profiles.md" },
    { key: "p05:02", path: "task-prompts/qa-ci-workflow-verification.md" },
    { key: "p06:01", path: "task-prompts/qa-affiliate-credentials-doc.md" },
  ];
  return entries.map(({ key, path: rel }) => {
    const fp = path.join(csnOsRoot(), rel);
    const exists = fs.existsSync(fp);
    const chars = exists ? fs.readFileSync(fp, "utf8").length : 0;
    return {
      key,
      path: rel,
      exists,
      nonEmpty: chars > 200,
      classification: exists && chars > 200 ? "Operativo (prompt ejecutable)" : "Incompleto",
    };
  });
}
