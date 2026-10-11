#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { loadManifest } from "../csn-os/lib/manifest.mjs";
import { getNotion, legacyRowCounts } from "../csn-os/lib/notion.mjs";
import { syncLaunchGuidePages } from "../csn-os/lib/sync-launch-guide-notion.mjs";
import { syncCanonicalRootHub } from "../csn-os/lib/notion-root-hub.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

async function main() {
  const manifest = loadManifest();
  const notion = getNotion();
  const legacyBefore = await legacyRowCounts(notion);

  const guide = await syncLaunchGuidePages(manifest);
  const hub = await syncCanonicalRootHub(manifest, { guidePages: guide.pages });

  const legacyAfter = await legacyRowCounts(notion);
  const manifestPath = path.join(__dirname, "notion-csn-isolated-manifest.json");
  const m = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  m.launchGuide7Day = {
    syncedAt: new Date().toISOString(),
    pages: guide.pages,
    hubMarker: hub.hubMarker,
  };
  fs.writeFileSync(manifestPath, JSON.stringify(m, null, 2));

  const out = {
    at: new Date().toISOString(),
    guidePages: guide.pages,
    hub,
    legacyOk: JSON.stringify(legacyBefore) === JSON.stringify(legacyAfter),
  };
  const report = path.join(__dirname, "../docs/csn-7day-guide-sync.json");
  fs.writeFileSync(report, JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));
  process.exit(out.legacyOk && guide.pages.length === 7 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
