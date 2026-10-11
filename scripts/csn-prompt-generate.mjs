#!/usr/bin/env node
import { loadManifest } from "../csn-os/lib/manifest.mjs";
import { assemblePrompt } from "../csn-os/lib/assemble-prompt.mjs";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  }),
);

const runExternalId = args["run-external-id"] || args.runExternalId;
const phase = Number(args.phase || 5);
if (!runExternalId) {
  console.error("Usage: --run-external-id=<run External ID> --phase=5");
  process.exit(1);
}

const manifest = loadManifest();
const result = await assemblePrompt({ manifest, runExternalId, phase });
console.log(JSON.stringify(result, null, 2));
