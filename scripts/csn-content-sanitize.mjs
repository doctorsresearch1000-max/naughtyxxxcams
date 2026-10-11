#!/usr/bin/env node
/**
 * Saneamiento idempotente: etiqueta QA, sincroniza hub (navegación), sin borrar filas ni tocar legacy.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { loadManifest } from "../csn-os/lib/manifest.mjs";
import { getNotion, getDb, legacyRowCounts } from "../csn-os/lib/notion.mjs";
import { syncCanonicalRootHub } from "../csn-os/lib/notion-root-hub.mjs";
import { classifyRowLocal } from "../csn-os/lib/content-audit-local.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const REPORT = path.join(__dirname, "../docs/csn-content-sanitize-applied.json");

function rt(page, name) {
  const p = page.properties?.[name];
  if (!p) return "";
  if (p.type === "rich_text") return p.rich_text.map((t) => t.plain_text).join("");
  if (p.type === "title") return p.title.map((t) => t.plain_text).join("");
  return "";
}

async function queryAll(notion, dataSourceId) {
  const rows = [];
  let c;
  do {
    const r = await notion.dataSources.query({
      data_source_id: dataSourceId,
      page_size: 100,
      start_cursor: c,
    });
    rows.push(...r.results);
    c = r.has_more ? r.next_cursor : undefined;
  } while (c);
  return rows;
}

async function tagQaSites(notion, manifest) {
  const sitesDb = getDb(manifest, "csnSites");
  const sites = await queryAll(notion, sitesDb.dataSourceId);
  const corrections = [];
  for (const s of sites) {
    const name = rt(s, "Site Name");
    const lk = rt(s, "Launch Key");
    const ext = rt(s, "External ID");
    const rc = s.properties["Record Class"]?.select?.name || "";
    const cls = classifyRowLocal({ siteName: name, launchKey: lk, externalId: ext, recordClass: rc });
    if (!cls || rc === "QA test-only") continue;
    await notion.pages.update({
      page_id: s.id,
      properties: {
        "Record Class": { select: { name: "QA test-only" } },
      },
    });
    corrections.push({
      type: "site_record_class",
      id: s.id,
      url: s.url,
      from: rc,
      to: "QA test-only",
      reason: cls.reason,
    });
  }
  return corrections;
}

async function tagQaRuns(notion, manifest) {
  const runsDb = getDb(manifest, "projectRuns");
  const runs = await queryAll(notion, runsDb.dataSourceId);
  const corrections = [];
  for (const r of runs) {
    const lk = rt(r, "Launch Key");
    const name = rt(r, "Run Name");
    const runType = r.properties["Run Type"]?.select?.name || "";
    const qa =
      /^(demo-qa|e2e-qa|fictional|qa-sandbox)/i.test(lk) ||
      /^e2e-qa-\d+$/i.test(lk) ||
      /DEMO QA|E2E QA|FICTIONAL|QA-SANDBOX/i.test(name);
    if (!qa || runType === "QA Sandbox") continue;
    await notion.pages.update({
      page_id: r.id,
      properties: {
        "Run Type": { select: { name: "QA Sandbox" } },
      },
    });
    corrections.push({
      type: "run_type",
      id: r.id,
      url: r.url,
      from: runType,
      to: "QA Sandbox",
      launchKey: lk,
    });
  }
  return corrections;
}

async function main() {
  const manifest = loadManifest();
  const notion = getNotion();
  const rootId = manifest.rootPageId;

  let legacyBefore;
  try {
    await notion.pages.retrieve({ page_id: rootId });
  } catch (e) {
    const blocked = {
      at: new Date().toISOString(),
      blocked: true,
      code: e.code,
      message: e.message,
      corrections: [],
      hint:
        "Re-conecta «Cam Sites — SOP System» (3f684cd0-85ae-811f-a929-c4b4ccbcb56a) y las 14 DB CSN a Cursor Connection, luego npm run csn:content-sanitize",
    };
    fs.writeFileSync(REPORT, JSON.stringify(blocked, null, 2));
    console.error(JSON.stringify(blocked, null, 2));
    process.exit(2);
  }

  legacyBefore = await legacyRowCounts(notion);
  const siteFixes = await tagQaSites(notion, manifest);
  const runFixes = await tagQaRuns(notion, manifest);
  const hub = await syncCanonicalRootHub(manifest);
  const legacyAfter = await legacyRowCounts(notion);

  const applied = {
    at: new Date().toISOString(),
    blocked: false,
    rootPageId: rootId,
    hubMarker: "csn-hub-marker-v4",
    corrections: [...siteFixes, ...runFixes],
    hub,
    legacyIntegrityOk: JSON.stringify(legacyBefore) === JSON.stringify(legacyAfter),
    legacyBefore,
    legacyAfter,
  };
  fs.writeFileSync(REPORT, JSON.stringify(applied, null, 2));
  console.log(JSON.stringify(applied, null, 2));
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
