#!/usr/bin/env node
/**
 * READ-ONLY preflight snapshot for CSN OPS consolidation rollback evidence.
 * Allowed Notion API: databases.retrieve, dataSources.retrieve/query,
 * views.list/retrieve, pages.retrieve — no writes.
 */
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { Client } from "@notionhq/client";
import { LEGACY_OPS } from "../csn-os/lib/legacy-ops-centralize.mjs";
import { legacyRowCounts } from "../csn-os/lib/notion.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

/** @type {readonly string[]} */
export const READ_ONLY_API_SURFACE = [
  "databases.retrieve",
  "dataSources.retrieve",
  "dataSources.query",
  "views.list",
  "views.retrieve",
  "pages.retrieve",
];

const KPI = {
  kpi1: "00fb3a37-ccb2-4275-bce3-068b7b08b7e4",
  kpi2: "efdaa399-b73c-4e83-9bbd-f7cdaceb9daa",
};

/** Expected site-summary OPS rows (empty CSN Task Key at last audit). */
export const EXPECTED_SUMMARY_PAGE_IDS = [
  "3f484cd0-85ae-80b6-bc72-f072478f6665",
  "3f484cd0-85ae-80b9-80d1-d2c3e15e259a",
  "3f484cd0-85ae-80aa-8eed-e1b180af54aa",
  "3f484cd0-85ae-8093-8a0d-fd7bb75e0f01",
];

const SOURCE_KEYS = ["issues", "deploy", "routine"];

function sha256File(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function relationIds(prop) {
  if (!prop || prop.type !== "relation") return [];
  return (prop.relation || []).map((r) => r.id);
}

function serializeProperties(properties) {
  const out = {};
  const unsupported = [];
  for (const [name, p] of Object.entries(properties || {})) {
    if (!p?.type) {
      unsupported.push({ property: name, reason: "missing_type" });
      continue;
    }
    out[name] = structuredClone(p);
    if (!READ_ONLY_SERIALIZABLE_TYPES.has(p.type)) {
      unsupported.push({ property: name, type: p.type, note: "stored_raw_verify_restore" });
    }
  }
  return { properties: out, unsupportedOnPage: unsupported };
}

const READ_ONLY_SERIALIZABLE_TYPES = new Set([
  "title",
  "rich_text",
  "number",
  "select",
  "multi_select",
  "status",
  "date",
  "checkbox",
  "url",
  "email",
  "phone_number",
  "relation",
  "people",
  "files",
  "formula",
  "rollup",
  "created_time",
  "created_by",
  "last_edited_time",
  "last_edited_by",
  "unique_id",
]);

async function queryAllRows(notion, dataSourceId) {
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
    await sleep(80);
  } while (cursor);
  return rows;
}

async function exportPageRow(notion, row) {
  let pageMeta = {
    archived: null,
    in_trash: null,
    url: row.url || null,
    UNSUPPORTED_BY_API: [],
  };
  try {
    const full = await notion.pages.retrieve({ page_id: row.id });
    pageMeta.archived = full.archived ?? null;
    pageMeta.in_trash = full.in_trash ?? null;
    pageMeta.url = full.url || pageMeta.url;
    if (full.object === "page" && full.properties === undefined) {
      pageMeta.UNSUPPORTED_BY_API.push("pages.retrieve returned no properties block");
    }
  } catch (e) {
    pageMeta.pageRetrieveError = e.body?.message || e.message;
  }
  await sleep(100);
  const { properties, unsupportedOnPage } = serializeProperties(row.properties);
  return {
    id: row.id,
    ...pageMeta,
    properties,
    relationTargets: extractRelationTargets(properties),
    propertyUnsupported: unsupportedOnPage,
  };
}

function extractRelationTargets(properties) {
  const rel = {};
  for (const [name, p] of Object.entries(properties || {})) {
    if (p.type === "relation") rel[name] = relationIds(p);
  }
  return rel;
}

async function exportDatabaseViews(notion, databaseId) {
  const views = [];
  const listed = await notion.views.list({ database_id: databaseId });
  for (const v of listed.results || []) {
    const vr = await notion.views.retrieve({ view_id: v.id });
    const entry = {
      id: vr.id,
      name: vr.name,
      type: vr.type,
      url: vr.url,
      filter: vr.filter ?? null,
      sorts: vr.sorts ?? null,
      quick_filters: vr.quick_filters ?? null,
      configuration: vr.configuration ?? null,
      data_source_id: vr.data_source_id ?? null,
      unsupported: [],
    };
    if (vr.group_by !== undefined) entry.group_by = vr.group_by;
    else entry.unsupported.push({ field: "group_by", label: "UNSUPPORTED_BY_API" });
    views.push(entry);
    await sleep(120);
  }
  return views;
}

async function exportSchema(notion, databaseId, dataSourceId) {
  const db = await notion.databases.retrieve({ database_id: databaseId });
  const ds = await notion.dataSources.retrieve({ data_source_id: dataSourceId });
  const relations = {};
  for (const [k, v] of Object.entries(ds.properties || {})) {
    if (v.type !== "relation") continue;
    const rel = v.relation || {};
    relations[k] = {
      data_source_id: rel.data_source_id || rel.database_id || null,
      type: rel.type || null,
      dual_property: rel.dual_property || null,
      single_property: rel.single_property || null,
    };
  }
  return {
    databaseId,
    dataSourceId,
    databaseTitle: (db.title || []).map((t) => t.plain_text).join(""),
    descriptionPresent: Boolean((db.description || []).length),
    propertyTypes: Object.fromEntries(
      Object.entries(ds.properties || {}).map(([k, v]) => [k, v.type]),
    ),
    propertiesFull: structuredClone(ds.properties || {}),
    relations,
  };
}

function writeJson(dir, name, data) {
  const p = path.join(dir, name);
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
  return p;
}

export function validateSnapshotBundle(bundleDir, manifest) {
  const errors = [];
  const warnings = [];

  const ops = JSON.parse(fs.readFileSync(path.join(bundleDir, "ops-19-pages.json"), "utf8"));
  const sources = JSON.parse(fs.readFileSync(path.join(bundleDir, "sources-24-pages.json"), "utf8"));
  const summaries = JSON.parse(fs.readFileSync(path.join(bundleDir, "ops-site-summaries-kpi2.json"), "utf8"));

  if (ops.pages.length !== 19) errors.push(`OPS page count ${ops.pages.length} !== 19`);
  const opsIds = new Set(ops.pages.map((p) => p.id));
  if (opsIds.size !== 19) errors.push("Duplicate OPS page IDs");

  const bySource = {};
  for (const key of SOURCE_KEYS) {
    const section = sources[key];
    const expected = key === "issues" ? 8 : key === "deploy" ? 7 : 9;
    if (section.pages.length !== expected) {
      errors.push(`${key} count ${section.pages.length} !== ${expected}`);
    }
    const ids = section.pages.map((p) => p.id);
    if (new Set(ids).size !== ids.length) errors.push(`Duplicate IDs in ${key}`);
    bySource[key] = ids;
  }
  const allSourceIds = [...bySource.issues, ...bySource.deploy, ...bySource.routine];
  if (allSourceIds.length !== 24) errors.push(`Total source IDs ${allSourceIds.length} !== 24`);
  if (new Set(allSourceIds).size !== 24) errors.push("Duplicate across source databases");

  for (const sid of EXPECTED_SUMMARY_PAGE_IDS) {
    if (!opsIds.has(sid)) errors.push(`Missing expected summary OPS page ${sid}`);
  }

  if (summaries.pairs.length !== 4) errors.push(`Summary/kpi2 pairs ${summaries.pairs.length} !== 4`);

  for (const f of manifest.files || []) {
    const fp = path.join(bundleDir, f.name);
    if (!fs.existsSync(fp)) errors.push(`Missing file ${f.name}`);
    else {
      const h = sha256File(fp);
      if (h !== f.sha256) errors.push(`Hash mismatch ${f.name}`);
    }
  }

  if (!manifest.countsUnchanged) errors.push("countsUnchanged is false");

  const viewNotes = JSON.parse(fs.readFileSync(path.join(bundleDir, "ops-views-full.json"), "utf8"));
  for (const v of viewNotes.views) {
    for (const u of v.unsupported || []) {
      warnings.push(`View ${v.name}: ${u.field} ${u.label}`);
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}

async function main() {
  const apiKey = process.env.NOTION_API_KEY?.trim();
  if (!apiKey) {
    console.error("NOTION_API_KEY missing");
    process.exit(1);
  }

  const notion = new Client({ auth: apiKey });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outRoot = path.join(__dirname, "../local/csn-preflight-snapshots", stamp);
  fs.mkdirSync(outRoot, { recursive: true });

  const countsBefore = await legacyRowCounts(notion);

  const opsMeta = LEGACY_OPS.ops;
  const opsSchema = await exportSchema(notion, opsMeta.databaseId, opsMeta.dataSourceId);
  const opsRows = await queryAllRows(notion, opsMeta.dataSourceId);
  const opsPages = [];
  for (const row of opsRows) {
    opsPages.push(await exportPageRow(notion, row));
  }
  const opsViews = await exportDatabaseViews(notion, opsMeta.databaseId);

  const sourcesOut = {};
  for (const key of SOURCE_KEYS) {
    const meta = LEGACY_OPS[key];
    const rows = await queryAllRows(notion, meta.dataSourceId);
    const pages = [];
    for (const row of rows) {
      pages.push(await exportPageRow(notion, row));
    }
    sourcesOut[key] = {
      label: meta.label,
      databaseId: meta.databaseId,
      dataSourceId: meta.dataSourceId,
      pages,
    };
  }

  const summaryPairs = [];
  for (const pageId of EXPECTED_SUMMARY_PAGE_IDS) {
    const rec = opsPages.find((p) => p.id === pageId);
    if (!rec) {
      summaryPairs.push({ opsPageId: pageId, error: "not_in_ops_export" });
      continue;
    }
    const kpiIds = rec.relationTargets["KPI History"] || [];
    const camSite = rec.relationTargets["Cam Site"] || [];
    summaryPairs.push({
      opsPageId: pageId,
      camSiteRelationIds: camSite,
      kpiHistoryRelationIds: kpiIds,
      csnTaskKey: rec.properties["CSN Task Key"]?.rich_text?.map((t) => t.plain_text).join("") || "",
    });
  }

  const countsAfter = await legacyRowCounts(notion);
  const countsUnchanged = JSON.stringify(countsBefore) === JSON.stringify(countsAfter);

  const files = [];
  const write = (name, data) => {
    const p = writeJson(outRoot, name, data);
    files.push({ name, sha256: sha256File(p), bytes: fs.statSync(p).size });
    return p;
  };

  write("read-only-api-surface.json", { readOnly: true, allowed: READ_ONLY_API_SURFACE });
  write("ops-schema-full.json", opsSchema);
  write("ops-19-pages.json", {
    databaseId: opsMeta.databaseId,
    dataSourceId: opsMeta.dataSourceId,
    rowCount: opsPages.length,
    pages: opsPages,
  });
  write("ops-views-full.json", { databaseId: opsMeta.databaseId, viewCount: opsViews.length, views: opsViews });
  write("sources-24-pages.json", sourcesOut);
  write("ops-site-summaries-kpi2.json", { expectedSummaryIds: EXPECTED_SUMMARY_PAGE_IDS, pairs: summaryPairs });
  write("counts.json", { countsBefore, countsAfter, countsUnchanged });

  const manifest = {
    exportedAt: new Date().toISOString(),
    readOnly: true,
    bundleDir: outRoot,
    databaseIds: {
      ops: opsMeta.databaseId,
      issues: LEGACY_OPS.issues.databaseId,
      deploy: LEGACY_OPS.deploy.databaseId,
      routine: LEGACY_OPS.routine.databaseId,
      hub: LEGACY_OPS.hub.databaseId,
      kpi1: KPI.kpi1,
      kpi2: KPI.kpi2,
    },
    recordCounts: {
      ops: opsPages.length,
      issues: sourcesOut.issues.pages.length,
      deploy: sourcesOut.deploy.pages.length,
      routine: sourcesOut.routine.pages.length,
    },
    countsBefore,
    countsAfter,
    countsUnchanged,
    files,
    exportStatus: "complete",
    unsupportedNotes: [
      {
        topic: "notion_native_automations",
        label: "UNSUPPORTED_BY_API",
        humanCapture: "Notion UI → each database → Automations menu",
      },
      {
        topic: "view_group_by",
        label: "UNSUPPORTED_BY_API unless returned on view object",
        humanCapture: "Screenshot view settings if grouping used in UI",
      },
      {
        topic: "page_body_blocks",
        label: "NOT_INCLUDED",
        humanCapture: "Optional blocks.children.list per page if block rollback needed",
      },
    ],
  };

  write("manifest.json", manifest);

  const validation = validateSnapshotBundle(outRoot, manifest);
  write("validation-report.json", validation);

  console.log(
    JSON.stringify(
      {
        bundleDir: outRoot,
        countsUnchanged,
        validationOk: validation.ok,
        validationErrors: validation.errors,
        validationWarnings: validation.warnings,
        files: files.map((f) => f.name),
      },
      null,
      2,
    ),
  );
  process.exit(validation.ok ? 0 : 1);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  main().catch((e) => {
    console.error(e.body?.message || e.message || e);
    process.exit(1);
  });
}
