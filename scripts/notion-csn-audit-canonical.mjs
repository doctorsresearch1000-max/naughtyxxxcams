#!/usr/bin/env node
"use strict";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { Client } from "@notionhq/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const ROOT_TITLE = "Cam Site Network OS — SOP System (Isolated)";
const RUNBOOK_TITLE = "12-Phase Operational Runbooks";
const LEGACY = {
  hub: "3f384cd0-85ae-80bd-be51-c17104511bfa",
  ops: "3f484cd0-85ae-804d-b61a-d87b93c11734",
  kv: "3f484cd0-85ae-800b-a34c-d0d4101255a0",
  routine: "3f484cd0-85ae-80a8-9091-e7bf1a16ba70",
  issues: "3f484cd0-85ae-80dd-aedb-f0e4004e88ea",
  deploy: "3f484cd0-85ae-8011-af56-e1adfd30300b",
  kpi1: "00fb3a37-ccb2-4275-bce3-068b7b08b7e4",
  kpi2: "efdaa399-b73c-4e83-9bbd-f7cdaceb9daa",
};

const EXPECTED_DBS = [
  "CSN Sites",
  "SOP Versions",
  "Project Runs",
  "Tasks",
  "Domain Candidates",
  "SEO Opportunities",
  "Backlink Opportunities",
  "Feed Sync Runs",
  "CSN Releases",
  "CSN Incidents",
  "CSN Maintenance",
  "CSN Knowledge",
  "Launch KPI Snapshots",
  "Human Gates",
];

async function countDs(notion, dataSourceId) {
  let n = 0;
  let c;
  do {
    const r = await notion.dataSources.query({
      data_source_id: dataSourceId,
      page_size: 100,
      start_cursor: c,
    });
    n += r.results.length;
    c = r.has_more ? r.next_cursor : undefined;
  } while (c);
  return n;
}

async function legacyCounts(notion) {
  const out = {};
  for (const [k, id] of Object.entries(LEGACY)) {
    const db = await notion.databases.retrieve({ database_id: id });
    const ds = db.data_sources?.[0]?.id;
    out[k] = ds ? await countDs(notion, ds) : -1;
  }
  return out;
}

function pageTitle(page) {
  for (const v of Object.values(page.properties || {})) {
    if (v.type === "title") return v.title?.map((t) => t.plain_text).join("") || "";
  }
  return page.object === "page" ? "" : "";
}

async function findIsolatedRoots(notion) {
  const res = await notion.search({ query: "SOP System (Isolated)", page_size: 50 });
  const roots = [];
  for (const r of res.results) {
    if (r.object !== "page") continue;
    const t = pageTitle(r) || r.properties?.title?.title?.[0]?.plain_text;
    if (t === ROOT_TITLE) roots.push(r);
  }
  return roots;
}

async function scanRoot(notion, rootPage) {
  const childDbs = [];
  let cursor;
  do {
    const blocks = await notion.blocks.children.list({
      block_id: rootPage.id,
      page_size: 100,
      start_cursor: cursor,
    });
    for (const b of blocks.results) {
      if (b.type !== "child_database") continue;
      try {
        const db = await notion.databases.retrieve({ database_id: b.id });
        const title = db.title?.map((t) => t.plain_text).join("") || "";
        const ds = db.data_sources?.[0]?.id;
        const rowCount = ds ? await countDs(notion, ds) : 0;
        childDbs.push({
          title,
          id: db.id,
          dataSourceId: ds,
          url: db.url,
          rowCount,
        });
      } catch (e) {
        childDbs.push({ title: "?", id: b.id, error: e.code });
      }
    }
    cursor = blocks.has_more ? blocks.next_cursor : undefined;
  } while (cursor);

  let runbook = null;
  const search = await notion.search({ query: RUNBOOK_TITLE, page_size: 20 });
  for (const p of search.results) {
    if (p.object !== "page" || p.parent?.page_id !== rootPage.id) continue;
    const t = pageTitle(p);
    if (t === RUNBOOK_TITLE) runbook = { id: p.id, url: p.url };
  }

  const tasksDb = childDbs.find((d) => d.title === "Tasks");
  let taskSample = [];
  let taskdefCount = 0;
  let taskrunCount = 0;
  if (tasksDb?.dataSourceId) {
    const ds = await notion.dataSources.retrieve({ data_source_id: tasksDb.dataSourceId });
    const hasRecordType = Boolean(ds.properties?.["Record Type"]);
    const rows = await notion.dataSources.query({
      data_source_id: tasksDb.dataSourceId,
      page_size: 100,
    });
    for (const row of rows.results) {
      const ext =
        row.properties["External ID"]?.rich_text?.map((t) => t.plain_text).join("") || "";
      const rt = row.properties["Record Type"]?.select?.name || "(none)";
      if (rt === "Task definition") taskdefCount++;
      else taskrunCount++;
      if (taskSample.length < 5) taskSample.push({ ext, recordType: rt });
    }
    tasksDb.hasRecordType = hasRecordType;
    tasksDb.taskdefCount = taskdefCount;
    tasksDb.taskrunCount = taskrunCount;
  }

  const score =
    childDbs.filter((d) => EXPECTED_DBS.includes(d.title)).length * 10 +
    childDbs.reduce((s, d) => s + (d.rowCount || 0), 0) +
    (runbook ? 50 : 0) +
    (tasksDb?.rowCount > 20 ? 30 : 0);

  return {
    rootId: rootPage.id,
    rootUrl: rootPage.url,
    parent: rootPage.parent,
    childDbs,
    runbook,
    tasksDb,
    taskSample,
    score,
    dbTitles: childDbs.map((d) => d.title).sort(),
  };
}

async function main() {
  const notion = new Client({ auth: process.env.NOTION_API_KEY });
  const legacyBefore = await legacyCounts(notion);
  const roots = await findIsolatedRoots(notion);

  const stacks = [];
  for (const root of roots) {
    try {
      stacks.push(await scanRoot(notion, root));
    } catch (e) {
      stacks.push({ rootId: root.id, error: e.message });
    }
  }

  stacks.sort((a, b) => (b.score || 0) - (a.score || 0));
  const manifestPath = path.join(__dirname, "notion-csn-isolated-manifest.json");
  let manifest = null;
  if (fs.existsSync(manifestPath)) {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  }

  const report = {
    auditedAt: new Date().toISOString(),
    legacyCounts: legacyBefore,
    isolatedRootsFound: roots.length,
    stacks,
    manifestRootId: manifest?.rootPageId,
    manifestMatches: stacks.map((s) => ({
      rootId: s.rootId,
      matchesManifest: s.rootId === manifest?.rootPageId,
    })),
    recommendedCanonical: stacks[0]?.rootId,
    recommendationReason:
      stacks.length === 0
        ? "No accessible isolated root — STOP"
        : stacks.length === 1
          ? "Single accessible root"
          : `Highest score (${stacks[0]?.score}): more DBs/records/runbook/tasks`,
    ambiguous: stacks.length > 1 && stacks[0]?.score === stacks[1]?.score,
  };

  const outPath = path.join(__dirname, "notion-csn-canonical-audit.json");
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + "\n");
  console.log(JSON.stringify(report, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
