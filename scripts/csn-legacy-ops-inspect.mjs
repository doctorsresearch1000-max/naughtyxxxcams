#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { Client } from "@notionhq/client";
import { legacyRowCounts } from "../csn-os/lib/notion.mjs";
import { LEGACY_OPS } from "../csn-os/lib/legacy-ops-centralize.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const LEGACY = {
  hub: { id: "3f384cd0-85ae-80bd-be51-c17104511bfa", label: "CAM SITE NETWORK OS" },
  ops: { id: "3f484cd0-85ae-804d-b61a-d87b93c11734", label: "OPERATIONS CENTER" },
  issues: { id: "3f484cd0-85ae-80dd-aedb-f0e4004e88ea", label: "ISSUES & INCIDENTS" },
  deploy: { id: "3f484cd0-85ae-8011-af56-e1adfd30300b", label: "DEPLOYMENTS & RELEASES" },
  kv: { id: "3f484cd0-85ae-800b-a34c-d0d4101255a0", label: "KNOWLEDGE VAULT" },
  routine: { id: "3f484cd0-85ae-80a8-9091-e7bf1a16ba70", label: "ROUTINE & MAINTENANCE" },
};

function formatId(id) {
  const raw = String(id).replace(/-/g, "");
  if (raw.length !== 32) return id;
  return `${raw.slice(0, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}-${raw.slice(16, 20)}-${raw.slice(20)}`;
}

async function blockFingerprint(notion, blockId) {
  let n = 0;
  let types = {};
  let cursor;
  do {
    const r = await notion.blocks.children.list({ block_id: blockId, page_size: 100, start_cursor: cursor });
    for (const b of r.results) {
      n++;
      types[b.type] = (types[b.type] || 0) + 1;
    }
    cursor = r.has_more ? r.next_cursor : undefined;
  } while (cursor);
  return { count: n, types };
}

async function dbSchema(notion, databaseId) {
  const db = await notion.databases.retrieve({ database_id: formatId(databaseId) });
  const props = {};
  for (const [k, v] of Object.entries(db.properties || {})) props[k] = v.type;
  return {
    databaseId: formatId(databaseId),
    title: db.title?.map((t) => t.plain_text).join("") || "",
    properties: props,
    dataSourceId: db.data_sources?.[0]?.id,
  };
}

async function resolvePageOrDb(notion, id) {
  const fid = formatId(id);
  try {
    const p = await notion.pages.retrieve({ page_id: fid });
    let title = "";
    for (const v of Object.values(p.properties || {})) {
      if (v.type === "title") title = v.title.map((t) => t.plain_text).join("");
    }
    return { kind: "page", id: fid, title, url: p.url, parent: p.parent };
  } catch {
    /* not a page */
  }
  try {
    const s = await dbSchema(notion, fid);
    return { kind: "database", ...s };
  } catch (e) {
    return { kind: "error", message: e.message };
  }
}

async function sampleRows(notion, dataSourceId, limit = 3) {
  const r = await notion.dataSources.query({ data_source_id: dataSourceId, page_size: limit });
  return r.results.map((row) => {
    const props = {};
    for (const [k, v] of Object.entries(row.properties || {})) {
      if (v.type === "title") props[k] = v.title?.map((t) => t.plain_text).join("");
      else if (v.type === "select") props[k] = v.select?.name;
      else if (v.type === "status") props[k] = v.status?.name;
      else if (v.type === "date") props[k] = v.date?.start;
      else if (v.type === "relation") props[k] = `[relation:${v.relation?.length || 0}]`;
      else props[k] = v.type;
    }
    return { id: row.id, props };
  });
}

async function main() {
  const notion = new Client({ auth: process.env.NOTION_API_KEY });
  const countsBefore = await legacyRowCounts(notion);
  const report = {
    at: new Date().toISOString(),
    countsBefore,
    note: "Las seis URLs CSN legacy son bases full-page (no páginas con bloques hijos vía API).",
    areas: {},
  };

  for (const [key, meta] of Object.entries(LEGACY)) {
    const resolved = await resolvePageOrDb(notion, meta.id);
    const fp = await blockFingerprint(notion, formatId(meta.id));
    const area = { label: meta.label, resolved, blockFingerprint: fp };
    if (resolved.kind === "database" && resolved.dataSourceId) {
      area.configDataSourceId = LEGACY_OPS[key]?.dataSourceId;
      area.sampleRows = await sampleRows(notion, resolved.dataSourceId);
    } else if (resolved.kind === "page") {
      area.childDatabases = [];
      let cursor;
      do {
        const r = await notion.blocks.children.list({ block_id: resolved.id, page_size: 100, start_cursor: cursor });
        for (const b of r.results) {
          if (b.type === "child_database") area.childDatabases.push({ id: b.id });
        }
        cursor = r.has_more ? r.next_cursor : undefined;
      } while (cursor);
    }
    report.areas[key] = area;
  }

  const out = path.join(__dirname, "../docs/csn-legacy-ops-inspection.json");
  fs.writeFileSync(out, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ out, countsBefore, keys: Object.keys(report.areas) }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
