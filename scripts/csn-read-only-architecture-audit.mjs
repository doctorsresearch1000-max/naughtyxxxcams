#!/usr/bin/env node
/**
 * READ-ONLY CSN architecture audit.
 * Uses only: databases.retrieve, dataSources.retrieve/query, views.list/retrieve,
 * pages.retrieve, blocks.children.list, search (read).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { Client } from "@notionhq/client";
import { LEGACY_OPS } from "../csn-os/lib/legacy-ops-centralize.mjs";
import { legacyRowCounts } from "../csn-os/lib/notion.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const MANIFEST_PATH = path.join(__dirname, "notion-csn-isolated-manifest.json");

const KPI_LEGACY = {
  kpi1: { id: "00fb3a37-ccb2-4275-bce3-068b7b08b7e4", label: "KPI History (legacy 1)" },
  kpi2: { id: "efdaa399-b73c-4e83-9bbd-f7cdaceb9daa", label: "KPI History (legacy 2)" },
};

const READ_ONLY_OPS = new Set([
  "databases.retrieve",
  "dataSources.retrieve",
  "dataSources.query",
  "views.list",
  "views.retrieve",
  "pages.retrieve",
  "blocks.children.list",
  "search",
]);

async function queryAll(notion, dataSourceId) {
  const rows = [];
  let cursor;
  do {
    const r = await notion.dataSources.query({
      data_source_id: dataSourceId,
      page_size: 100,
      start_cursor: cursor,
    });
    rows.push(...r.results);
    cursor = r.has_more ? r.next_cursor : undefined;
  } while (cursor);
  return rows;
}

function plainDescription(desc) {
  if (!desc?.length) return "";
  return desc.map((d) => d.plain_text || "").join("");
}

function summarizeRow(row) {
  const props = {};
  for (const [name, p] of Object.entries(row.properties || {})) {
    if (p.type === "title") props[name] = (p.title || []).map((t) => t.plain_text).join("").slice(0, 120);
    else if (p.type === "select") props[name] = p.select?.name;
    else if (p.type === "status") props[name] = p.status?.name;
    else if (p.type === "rich_text") {
      const t = (p.rich_text || []).map((x) => x.plain_text).join("").slice(0, 80);
      if (t) props[name] = t;
    } else if (p.type === "relation") props[name] = `[relation:${p.relation?.length || 0}]`;
    else if (p.type === "multi_select") props[name] = (p.multi_select || []).map((m) => m.name);
    else if (p.type === "date" && p.date?.start) props[name] = p.date.start.slice(0, 10);
    else if (p.type === "checkbox") props[name] = p.checkbox;
    else if (p.type === "number") props[name] = p.number;
    else if (p.type === "url" && p.url) props[name] = "[url]";
  }
  return { id: row.id, props };
}

async function inspectDatabase(notion, { databaseId, dataSourceId, label }) {
  const db = await notion.databases.retrieve({ database_id: databaseId });
  const ds = await notion.dataSources.retrieve({ data_source_id: dataSourceId });
  const propertyTypes = Object.fromEntries(
    Object.entries(ds.properties || {}).map(([k, v]) => [k, v.type]),
  );
  const relations = {};
  for (const [k, v] of Object.entries(ds.properties || {})) {
    if (v.type !== "relation") continue;
    const rel = v.relation || {};
    relations[k] = {
      data_source_id: rel.data_source_id || rel.database_id || null,
      type: rel.type,
    };
  }
  const views = [];
  try {
    const listed = await notion.views.list({ database_id: databaseId });
    for (const v of listed.results || []) {
      const vr = await notion.views.retrieve({ view_id: v.id });
      views.push({
        id: vr.id,
        name: vr.name,
        type: vr.type,
        hasFilter: Boolean(vr.filter),
        filterSummary: vr.filter ? JSON.stringify(vr.filter).slice(0, 200) : null,
      });
      await new Promise((r) => setTimeout(r, 120));
    }
  } catch (e) {
    views.push({ error: e.body?.message || e.message });
  }

  const rows = await queryAll(notion, dataSourceId);
  const samples = rows.slice(0, 5).map(summarizeRow);
  const statusHistogram = {};
  for (const row of rows) {
    for (const key of ["Status", "Estado"]) {
      const p = row.properties[key];
      if (!p) continue;
      const val =
        p.status?.name || p.select?.name || (p.rich_text || []).map((t) => t.plain_text).join("") || "?";
      statusHistogram[key] = statusHistogram[key] || {};
      statusHistogram[key][val] = (statusHistogram[key][val] || 0) + 1;
    }
  }

  return {
    label,
    databaseId,
    dataSourceId,
    url: db.url || ds.url,
    title: (db.title || ds.title || []).map((t) => t.plain_text).join("").trim(),
    descriptionExcerpt: plainDescription(db.description || ds.description).slice(0, 400),
    isInline: ds.is_inline,
    rowCount: rows.length,
    propertyTypes,
    relations,
    views,
    statusHistogram,
    samples,
  };
}

async function inspectSopRoot(notion, rootPageId) {
  const page = await notion.pages.retrieve({ page_id: rootPageId });
  const childDbs = [];
  const blockTypes = {};
  let cursor;
  do {
    const res = await notion.blocks.children.list({
      block_id: rootPageId,
      page_size: 100,
      start_cursor: cursor,
    });
    for (const b of res.results) {
      blockTypes[b.type] = (blockTypes[b.type] || 0) + 1;
      if (b.type === "child_database") {
        try {
          const db = await notion.databases.retrieve({ database_id: b.id });
          childDbs.push({
            blockId: b.id,
            title: db.title?.map((t) => t.plain_text).join(""),
          });
        } catch {
          childDbs.push({ blockId: b.id, title: "?" });
        }
      }
      if (b.type === "child_page") {
        const t = b.child_page?.title || "";
        childDbs.push({ childPage: t, blockId: b.id });
      }
    }
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);

  let title = "";
  for (const v of Object.values(page.properties || {})) {
    if (v.type === "title") title = v.title?.map((t) => t.plain_text).join("");
  }

  return {
    rootPageId,
    url: page.url,
    title,
    blockTypes,
    childDatabases: childDbs.filter((x) => x.title && !x.childPage),
    childPages: childDbs.filter((x) => x.childPage).map((x) => x.childPage),
  };
}

async function main() {
  const notion = new Client({ auth: process.env.NOTION_API_KEY });
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  const countsStart = await legacyRowCounts(notion);

  const inventory = {
    auditedAt: new Date().toISOString(),
    readOnly: true,
    allowedApiSurface: [...READ_ONLY_OPS],
    countsStart,
    legacySix: {},
    kpiLegacy: {},
    isolatedFourteen: {},
    sopRoot: null,
    manifestRootPageId: manifest.rootPageId,
    runbookPageId: manifest.runbookPageId,
  };

  for (const [key, meta] of Object.entries(LEGACY_OPS)) {
    inventory.legacySix[key] = await inspectDatabase(notion, {
      databaseId: meta.databaseId,
      dataSourceId: meta.dataSourceId,
      label: meta.label,
    });
    await new Promise((r) => setTimeout(r, 200));
  }

  for (const [key, meta] of Object.entries(KPI_LEGACY)) {
    const db = await notion.databases.retrieve({ database_id: meta.id });
    const dsId = db.data_sources?.[0]?.id;
    if (dsId) {
      inventory.kpiLegacy[key] = await inspectDatabase(notion, {
        databaseId: meta.id,
        dataSourceId: dsId,
        label: meta.label,
      });
    }
  }

  for (const [key, db] of Object.entries(manifest.databases)) {
    inventory.isolatedFourteen[key] = await inspectDatabase(notion, {
      databaseId: db.id,
      dataSourceId: db.dataSourceId,
      label: db.title,
    });
    await new Promise((r) => setTimeout(r, 150));
  }

  inventory.sopRoot = await inspectSopRoot(notion, manifest.rootPageId);

  const countsEnd = await legacyRowCounts(notion);
  inventory.countsEnd = countsEnd;
  inventory.countsUnchanged = JSON.stringify(countsStart) === JSON.stringify(countsEnd);

  const outJson = path.join(__dirname, "../docs/csn-read-only-architecture-audit.json");
  fs.writeFileSync(outJson, JSON.stringify(inventory, null, 2));
  console.log(
    JSON.stringify({
      outJson,
      countsUnchanged: inventory.countsUnchanged,
      countsEnd,
      legacyOpsRows: countsEnd.ops,
    }),
  );
}

main().catch((e) => {
  console.error(e.body?.message || e.message || e);
  process.exit(1);
});
