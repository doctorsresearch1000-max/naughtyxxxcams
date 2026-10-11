import fs from "fs";
import path from "path";
import { csnOsRoot } from "./manifest.mjs";

/**
 * Prompts técnicos por sufijo de External ID (parte tras último ":") o clave completa de taskrun.
 */
const BY_SUFFIX = {
  "demo-live-offline-v1": "prompts/DEMO-QA-live-offline-profiles.md",
  "p05:02": "task-prompts/qa-ci-workflow-verification.md",
  "p06:01": "task-prompts/qa-affiliate-credentials-doc.md",
};

export function resolveTaskPromptFile(taskExternalId) {
  if (!taskExternalId) return null;
  const full = BY_SUFFIX[taskExternalId];
  if (full) return path.join(csnOsRoot(), full);
  const suffix = taskExternalId.split(":").pop();
  const rel = BY_SUFFIX[suffix];
  if (!rel) return null;
  const fp = path.join(csnOsRoot(), rel);
  return fs.existsSync(fp) ? fp : null;
}

export function loadTaskPromptMarkdown(taskExternalId) {
  const fp = resolveTaskPromptFile(taskExternalId);
  if (!fp) return null;
  return fs.readFileSync(fp, "utf8");
}
