import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const CANONICAL_ROOT_ID = "3f684cd0-85ae-811f-a929-c4b4ccbcb56a";

export function loadManifest() {
  const p = path.join(__dirname, "../../scripts/notion-csn-isolated-manifest.json");
  const m = JSON.parse(fs.readFileSync(p, "utf8"));
  if (m.rootPageId !== CANONICAL_ROOT_ID) {
    throw new Error(
      `Manifest root ${m.rootPageId} does not match canonical ${CANONICAL_ROOT_ID}. Re-run audit.`,
    );
  }
  return m;
}

export function csnOsRoot() {
  return path.join(__dirname, "..");
}
