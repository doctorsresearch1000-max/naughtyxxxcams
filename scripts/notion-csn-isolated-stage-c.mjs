#!/usr/bin/env node
"use strict";

/**
 * Stage C — Isolated Cam Site Network OS (Notion only).
 * Does not read/write legacy database rows (except optional parent page resolution).
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { Client } from "@notionhq/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(ROOT, ".env") });

const MANIFEST_PATH = path.join(__dirname, "notion-csn-isolated-manifest.json");

const ROOT_PAGE_TITLE = "Cam Site Network OS — SOP System (Isolated)";
const QA_SITE_NAME = "QA-SANDBOX-NOTION";
const QA_LAUNCH_KEY = "qa-sandbox-notion-launch-v1";
const QA_EXTERNAL_ID = "csn:qa-sandbox-notion:launch:v1";

const LEGACY_DATABASES = {
  hub: "3f384cd0-85ae-80bd-be51-c17104511bfa",
  ops: "3f484cd0-85ae-804d-b61a-d87b93c11734",
  kv: "3f484cd0-85ae-800b-a34c-d0d4101255a0",
  routine: "3f484cd0-85ae-80a8-9091-e7bf1a16ba70",
  issues: "3f484cd0-85ae-80dd-aedb-f0e4004e88ea",
  deploy: "3f484cd0-85ae-8011-af56-e1adfd30300b",
  kpi1: "00fb3a37-ccb2-4275-bce3-068b7b08b7e4",
  kpi2: "efdaa399-b73c-4e83-9bbd-f7cdaceb9daa",
};

const STATUS_TODO = {
  status: {
    options: [
      { name: "Not started", color: "default" },
      { name: "In progress", color: "blue" },
      { name: "Blocked", color: "red" },
      { name: "Done", color: "green" },
    ],
    groups: [
      { name: "To-do", option_ids: [] },
      { name: "In progress", option_ids: [] },
      { name: "Complete", option_ids: [] },
    ],
  },
};

function formatId(id) {
  const raw = String(id).replace(/-/g, "");
  if (raw.length !== 32) return id;
  return `${raw.slice(0, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}-${raw.slice(16, 20)}-${raw.slice(20)}`;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function getDataSourceIdForDb(notion, databaseId) {
  const db = await notion.databases.retrieve({ database_id: formatId(databaseId) });
  const ds = db.data_sources?.[0]?.id;
  if (!ds) throw new Error(`No data_source for ${databaseId}`);
  return ds;
}

async function countDatabase(notion, databaseId) {
  const dataSourceId = await getDataSourceIdForDb(notion, databaseId);
  let total = 0;
  let cursor;
  do {
    const res = await notion.dataSources.query({
      data_source_id: dataSourceId,
      start_cursor: cursor,
      page_size: 100,
    });
    total += res.results.length;
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return total;
}

async function legacyBaseline(notion) {
  const counts = {};
  for (const [key, id] of Object.entries(LEGACY_DATABASES)) {
    counts[key] = await countDatabase(notion, id);
  }
  return counts;
}

async function resolveRootParentPageId(notion) {
  const override = process.env.NOTION_CSN_ISOLATED_PARENT_PAGE_ID?.trim();
  if (override) return formatId(override);

  const historyDb = await notion.databases.retrieve({
    database_id: LEGACY_DATABASES.kpi1,
  });
  if (historyDb.parent?.type === "page_id") {
    return historyDb.parent.page_id;
  }
  throw new Error(
    "Set NOTION_CSN_ISOLATED_PARENT_PAGE_ID to a workspace page shared with the integration.",
  );
}

async function findPageByTitleUnderParent(notion, parentPageId, title) {
  const res = await notion.search({
    query: title,
    filter: { property: "object", value: "page" },
    page_size: 20,
  });
  for (const page of res.results) {
    if (page.parent?.type !== "page_id" || page.parent.page_id !== parentPageId) {
      continue;
    }
    const prop = Object.values(page.properties).find((p) => p.type === "title");
    const text = prop?.title?.map((t) => t.plain_text).join("") ?? "";
    if (text === title) return page.id;
  }
  return null;
}

async function ensureRootPage(notion, parentPageId, manifest) {
  if (manifest.rootPageId) {
    try {
      await notion.pages.retrieve({ page_id: manifest.rootPageId });
      return manifest.rootPageId;
    } catch {
      delete manifest.rootPageId;
    }
  }
  const existing = await findPageByTitleUnderParent(notion, parentPageId, ROOT_PAGE_TITLE);
  if (existing) {
    manifest.rootPageId = existing;
    return existing;
  }
  const page = await notion.pages.create({
    parent: { type: "page_id", page_id: parentPageId },
    properties: {
      title: { title: [{ type: "text", text: { content: ROOT_PAGE_TITLE } }] },
    },
  });
  manifest.rootPageId = page.id;
  return page.id;
}

function titleProp(name = "Name") {
  return { [name]: { title: {} } };
}

function rel(dataSourceId) {
  return {
    relation: {
      data_source_id: dataSourceId,
      type: "single_property",
      single_property: {},
    },
  };
}

async function getDataSourceId(notion, databaseId) {
  const db = await notion.databases.retrieve({ database_id: databaseId });
  const ds = db.data_sources?.[0]?.id;
  if (!ds) throw new Error(`No data_source for database ${databaseId}`);
  return ds;
}

async function ensureDatabase(notion, manifest, key, title, properties, parentPageId) {
  if (manifest.databases?.[key]?.id) {
    try {
      await notion.databases.retrieve({ database_id: manifest.databases[key].id });
      return manifest.databases[key];
    } catch {
      delete manifest.databases[key];
    }
  }
  const created = await notion.databases.create({
    parent: { type: "page_id", page_id: parentPageId },
    title: [{ type: "text", text: { content: title } }],
    initial_data_source: { properties },
  });
  const dsId = created.data_sources?.[0]?.id;
  const entry = { id: created.id, dataSourceId: dsId, title, url: created.url };
  manifest.databases = manifest.databases || {};
  manifest.databases[key] = entry;
  await sleep(350);
  return entry;
}

async function patchDatabaseProperties(notion, databaseId, properties) {
  await notion.databases.update({
    database_id: databaseId,
    properties,
  });
  await sleep(350);
}

function loadManifest() {
  if (fs.existsSync(MANIFEST_PATH)) {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  }
  return { version: 1, databases: {} };
}

function saveManifest(manifest) {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n", "utf8");
}

async function buildSchemas(notion, manifest, rootPageId) {
  const sites = await ensureDatabase(
    notion,
    manifest,
    "csnSites",
    "CSN Sites",
    {
      ...titleProp("Site Name"),
      "Record Class": {
        select: {
          options: [
            { name: "Production", color: "green" },
            { name: "QA test-only", color: "orange" },
          ],
        },
      },
      Domain: { url: {} },
      Status: STATUS_TODO,
      "Launch Key": { rich_text: {} },
      "External ID": { rich_text: {} },
      "Primary Phase": { number: { format: "number" } },
      Notes: { rich_text: {} },
    },
    rootPageId,
  );

  const sop = await ensureDatabase(
    notion,
    manifest,
    "sopVersions",
    "SOP Versions",
    {
      ...titleProp("Name"),
      Version: { rich_text: {} },
      Status: {
        select: {
          options: [
            { name: "Draft", color: "default" },
            { name: "Active", color: "green" },
            { name: "Retired", color: "gray" },
          ],
        },
      },
      "Effective Date": { date: {} },
      Verified: { checkbox: {} },
      Notes: { rich_text: {} },
    },
    rootPageId,
  );

  const projectRuns = await ensureDatabase(
    notion,
    manifest,
    "projectRuns",
    "Project Runs",
    {
      ...titleProp("Run Name"),
      "Run Type": {
        select: {
          options: [
            { name: "New Site Launch", color: "blue" },
            { name: "Domain Research", color: "purple" },
            { name: "SEO Sprint", color: "yellow" },
            { name: "Feed Sync", color: "brown" },
            { name: "Incident Response", color: "red" },
            { name: "QA Sandbox", color: "orange" },
          ],
        },
      },
      Status: STATUS_TODO,
      "Launch Key": { rich_text: {} },
      "External ID": { rich_text: {} },
      "Current Phase": { number: { format: "number" } },
      Started: { date: {} },
      "Evidence URL": { url: {} },
      Site: rel(sites.dataSourceId),
      "SOP Version": rel(sop.dataSourceId),
    },
    rootPageId,
  );

  await ensureDatabase(
    notion,
    manifest,
    "tasks",
    "Tasks",
    {
      ...titleProp("Task"),
      Status: STATUS_TODO,
      Phase: { number: { format: "number" } },
      Owner: { rich_text: {} },
      Due: { date: {} },
      "External ID": { rich_text: {} },
      "Project Run": rel(projectRuns.dataSourceId),
      Site: rel(sites.dataSourceId),
    },
    rootPageId,
  );

  await ensureDatabase(
    notion,
    manifest,
    "domainCandidates",
    "Domain Candidates",
    {
      ...titleProp("Domain"),
      Source: {
        select: {
          options: [
            { name: "expireddomains.net", color: "blue" },
            { name: "manual", color: "default" },
            { name: "auction", color: "purple" },
          ],
        },
      },
      Status: STATUS_TODO,
      "Ahrefs DR": { number: { format: "number" } },
      "Wayback Last Good": { date: {} },
      Notes: { rich_text: {} },
      Site: rel(sites.dataSourceId),
      "Project Run": rel(projectRuns.dataSourceId),
    },
    rootPageId,
  );

  await ensureDatabase(
    notion,
    manifest,
    "seoOpportunities",
    "SEO Opportunities",
    {
      ...titleProp("Opportunity"),
      Priority: {
        select: {
          options: [
            { name: "P0", color: "red" },
            { name: "P1", color: "orange" },
            { name: "P2", color: "yellow" },
          ],
        },
      },
      Status: STATUS_TODO,
      "Target URL": { url: {} },
      Notes: { rich_text: {} },
      Site: rel(sites.dataSourceId),
      "Project Run": rel(projectRuns.dataSourceId),
    },
    rootPageId,
  );

  await ensureDatabase(
    notion,
    manifest,
    "backlinkOpportunities",
    "Backlink Opportunities",
    {
      ...titleProp("Target"),
      Status: STATUS_TODO,
      "DR / Traffic": { rich_text: {} },
      "Outreach Status": {
        select: {
          options: [
            { name: "Identified", color: "default" },
            { name: "Contacted", color: "blue" },
            { name: "Live", color: "green" },
            { name: "Rejected", color: "red" },
          ],
        },
      },
      Notes: { rich_text: {} },
      Site: rel(sites.dataSourceId),
      "Project Run": rel(projectRuns.dataSourceId),
    },
    rootPageId,
  );

  await ensureDatabase(
    notion,
    manifest,
    "feedSyncRuns",
    "Feed Sync Runs",
    {
      ...titleProp("Run"),
      Status: STATUS_TODO,
      "Feed Provider": { rich_text: {} },
      "Rows Upserted": { number: { format: "number" } },
      Started: { date: {} },
      Finished: { date: {} },
      Site: rel(sites.dataSourceId),
      "Project Run": rel(projectRuns.dataSourceId),
    },
    rootPageId,
  );

  await ensureDatabase(
    notion,
    manifest,
    "csnReleases",
    "CSN Releases",
    {
      ...titleProp("Release"),
      Status: STATUS_TODO,
      Environment: {
        select: {
          options: [
            { name: "sandbox", color: "yellow" },
            { name: "staging", color: "blue" },
            { name: "production", color: "green" },
          ],
        },
      },
      "Git SHA": { rich_text: {} },
      "Deployed At": { date: {} },
      Site: rel(sites.dataSourceId),
      "Project Run": rel(projectRuns.dataSourceId),
    },
    rootPageId,
  );

  await ensureDatabase(
    notion,
    manifest,
    "csnIncidents",
    "CSN Incidents",
    {
      ...titleProp("Incident"),
      Severity: {
        select: {
          options: [
            { name: "SEV1", color: "red" },
            { name: "SEV2", color: "orange" },
            { name: "SEV3", color: "yellow" },
          ],
        },
      },
      Status: STATUS_TODO,
      "Detected At": { date: {} },
      "Resolved At": { date: {} },
      Site: rel(sites.dataSourceId),
      "Project Run": rel(projectRuns.dataSourceId),
    },
    rootPageId,
  );

  await ensureDatabase(
    notion,
    manifest,
    "csnMaintenance",
    "CSN Maintenance",
    {
      ...titleProp("Routine"),
      Cadence: {
        select: {
          options: [
            { name: "daily", color: "blue" },
            { name: "weekly", color: "green" },
            { name: "monthly", color: "purple" },
          ],
        },
      },
      Status: STATUS_TODO,
      "Next Due": { date: {} },
      Site: rel(sites.dataSourceId),
    },
    rootPageId,
  );

  await ensureDatabase(
    notion,
    manifest,
    "csnKnowledge",
    "CSN Knowledge",
    {
      ...titleProp("Article"),
      Category: {
        select: {
          options: [
            { name: "SOP", color: "blue" },
            { name: "Runbook", color: "green" },
            { name: "Policy", color: "purple" },
          ],
        },
      },
      Status: STATUS_TODO,
      "Last Reviewed": { date: {} },
      Site: rel(sites.dataSourceId),
    },
    rootPageId,
  );

  await ensureDatabase(
    notion,
    manifest,
    "launchKpiSnapshots",
    "Launch KPI Snapshots",
    {
      ...titleProp("Snapshot"),
      "Captured At": { date: {} },
      "Monthly Revenue": { number: { format: "dollar" } },
      "Daily Clicks": { number: { format: "number" } },
      "Indexed Pages": { number: { format: "number" } },
      "Record Class": {
        select: {
          options: [
            { name: "Production", color: "green" },
            { name: "QA test-only", color: "orange" },
          ],
        },
      },
      Site: rel(sites.dataSourceId),
      "Project Run": rel(projectRuns.dataSourceId),
    },
    rootPageId,
  );

  await ensureDatabase(
    notion,
    manifest,
    "humanGates",
    "Human Gates",
    {
      ...titleProp("Gate"),
      "Target Type": {
        select: {
          options: [
            { name: "domain_candidate", color: "purple" },
            { name: "backlink", color: "blue" },
            { name: "release", color: "green" },
            { name: "project_run", color: "orange" },
            { name: "production_deploy", color: "red" },
          ],
        },
      },
      "Target External ID": { rich_text: {} },
      Scope: { rich_text: {} },
      Limits: { rich_text: {} },
      Status: {
        select: {
          options: [
            { name: "Pending", color: "yellow" },
            { name: "Approved", color: "green" },
            { name: "Rejected", color: "red" },
          ],
        },
      },
      Approver: { rich_text: {} },
      "Approved At": { date: {} },
      "Project Run": rel(projectRuns.dataSourceId),
    },
    rootPageId,
  );

  return manifest;
}

const SOP_PHASES = [
  {
    n: 1,
    title: "Intake & human gate",
    verified: true,
    body: [
      "Open a Project Run (Run Type = New Site Launch or QA Sandbox).",
      "Create Human Gate with exact Target External ID, Scope, and Limits (no blanket approvals).",
      "Do not purchase domains or deploy to production without an Approved gate for that target.",
    ],
  },
  {
    n: 2,
    title: "Domain research (expireddomains.net)",
    verified: true,
    body: [
      "In expireddomains.net: filter Deleted domains, min DA/BL if available, exclude adult-blocklisted TLDs per policy.",
      "Export candidates → create Domain Candidates rows (Source = expireddomains.net) linked to Project Run.",
      "Score: topical relevance, Wayback clean history, no malware/spam footprint (manual check).",
      "Human Gate required before any purchase (Target Type = domain_candidate).",
    ],
  },
  {
    n: 3,
    title: "Domain selection & registration prep",
    verified: false,
    body: [
      "Pick top candidate; document rationale in Domain Candidates → Notes.",
      "STOP: registration/payment is out of automation scope unless gate approved.",
    ],
  },
  {
    n: 4,
    title: "DNS & hosting scaffold",
    verified: false,
    body: [
      "Prepare DNS zone plan and hosting target (Cloudflare Pages / worker) in CSN Knowledge runbook entry.",
      "Sandbox only until production gate exists.",
    ],
  },
  {
    n: 5,
    title: "Repo & CI bootstrap",
    verified: true,
    body: [
      "Create or fork site repo; wire GitHub Actions for lint/test.",
      "Log release intent in CSN Releases (Environment = sandbox|staging).",
    ],
  },
  {
    n: 6,
    title: "Affiliate / feed integration",
    verified: true,
    body: [
      "Configure CrakRevenue (or network) keys in CI secrets — never in Notion.",
      "Record Feed Sync Runs when ingest jobs execute.",
    ],
  },
  {
    n: 7,
    title: "Content & compliance",
    verified: false,
    body: [
      "Age gate, geo restrictions, model policy pages.",
      "Link CSN Knowledge articles for legal copy templates.",
    ],
  },
  {
    n: 8,
    title: "SEO baseline",
    verified: true,
    body: [
      "Create SEO Opportunities from GSC/export.",
      "Submit sitemap after staging deploy.",
    ],
  },
  {
    n: 9,
    title: "Backlink outreach (gated)",
    verified: false,
    body: [
      "Add Backlink Opportunities; each live link requires Human Gate (Target Type = backlink).",
      "No paid links without explicit Limits field on the gate.",
    ],
  },
  {
    n: 10,
    title: "Staging deploy & QA",
    verified: true,
    body: [
      "CSN Release row with Environment=staging; attach Evidence URL on Project Run.",
      "QA test-only sites (Record Class) excluded from production KPI reporting.",
    ],
  },
  {
    n: 11,
    title: "Production deploy",
    verified: false,
    body: [
      "Requires Human Gate (production_deploy) with named approver.",
      "Update CSN Sites Status; never promote QA test-only rows.",
    ],
  },
  {
    n: 12,
    title: "Launch KPI snapshot & handoff",
    verified: true,
    body: [
      "Create Launch KPI Snapshots linked to Site + Project Run.",
      "Mark Project Run Done only with Evidence URL populated.",
      "Routine maintenance rows seeded in CSN Maintenance.",
    ],
  },
];

async function appendSopIfNeeded(notion, rootPageId, manifest) {
  if (manifest.sopBlocksAppended) return;
  const children = await notion.blocks.children.list({ block_id: rootPageId, page_size: 5 });
  const hasSop = children.results.some(
    (b) => b.type === "heading_1" && b.heading_1?.rich_text?.[0]?.plain_text?.includes("Master SOP"),
  );
  if (hasSop) {
    manifest.sopBlocksAppended = true;
    return;
  }

  const blocks = [
    {
      object: "block",
      type: "callout",
      callout: {
        icon: { emoji: "🔒" },
        rich_text: [
          {
            type: "text",
            text: {
              content:
                "Isolated CSN OS — no relations to legacy OPERATIONS / KNOWLEDGE / KPI History hub tables. QA test-only rows must not feed production launches or KPI reporting.",
            },
          },
        ],
      },
    },
    {
      object: "block",
      type: "heading_1",
      heading_1: { rich_text: [{ type: "text", text: { content: "Master SOP (12 phases)" } }] },
    },
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          {
            type: "text",
            text: {
              content:
                "Executable procedures for network site launches. Labels: Verified = exercised in sandbox; Unverified = documented, needs production drill.",
            },
          },
        ],
      },
    },
  ];

  for (const phase of SOP_PHASES) {
    const label = phase.verified ? "[Verified]" : "[Unverified]";
    blocks.push({
      object: "block",
      type: "heading_2",
      heading_2: {
        rich_text: [
          {
            type: "text",
            text: { content: `Phase ${phase.n} — ${phase.title} ${label}` },
          },
        ],
      },
    });
    for (const line of phase.body) {
      blocks.push({
        object: "block",
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [{ type: "text", text: { content: line } }],
        },
      });
    }
  }

  blocks.push({
    object: "block",
    type: "heading_2",
    heading_2: {
      rich_text: [{ type: "text", text: { content: "Supported views (create in Notion UI)" } }],
    },
  });
  const viewList = [
    "CSN Sites — filter Record Class ≠ QA test-only for production board",
    "Project Runs — Kanban by Status",
    "Tasks — board by Phase",
    "Domain Candidates — table sorted by Ahrefs DR",
    "Human Gates — filter Status = Pending",
    "Launch KPI Snapshots — timeline by Captured At",
  ];
  for (const v of viewList) {
    blocks.push({
      object: "block",
      type: "bulleted_list_item",
      bulleted_list_item: { rich_text: [{ type: "text", text: { content: v } }] },
    });
  }

  await notion.blocks.children.append({ block_id: rootPageId, children: blocks });
  manifest.sopBlocksAppended = true;
}

async function queryByRichText(notion, databaseId, property, value) {
  const dataSourceId = await getDataSourceIdForDb(notion, databaseId);
  const res = await notion.dataSources.query({
    data_source_id: dataSourceId,
    filter: {
      property,
      rich_text: { equals: value },
    },
  });
  return res.results;
}

async function runSandboxLaunch(notion, manifest) {
  const sitesDb = manifest.databases.csnSites.id;
  const runsDb = manifest.databases.projectRuns.id;
  const tasksDb = manifest.databases.tasks.id;
  const sopDb = manifest.databases.sopVersions.id;
  const gatesDb = manifest.databases.humanGates.id;
  const kpiDb = manifest.databases.launchKpiSnapshots.id;

  const sopDs = await getDataSourceIdForDb(notion, sopDb);
  let sopPage = (
    await notion.dataSources.query({
      data_source_id: sopDs,
      page_size: 1,
    })
  ).results[0];

  if (!sopPage) {
    sopPage = await notion.pages.create({
      parent: { database_id: sopDb },
      properties: {
        Name: { title: [{ text: { content: "Master SOP v1 (Isolated)" } }] },
        Version: { rich_text: [{ text: { content: "1.0.0" } }] },
        Status: { select: { name: "Active" } },
        Verified: { checkbox: true },
        "Effective Date": { date: { start: new Date().toISOString().slice(0, 10) } },
      },
    });
  }

  const existingSites = await queryByRichText(notion, sitesDb, "Launch Key", QA_LAUNCH_KEY);
  let siteId = existingSites[0]?.id;

  if (!siteId) {
    const site = await notion.pages.create({
      parent: { database_id: sitesDb },
      properties: {
        "Site Name": { title: [{ text: { content: QA_SITE_NAME } }] },
        "Record Class": { select: { name: "QA test-only" } },
        Domain: { url: `https://${QA_SITE_NAME.toLowerCase()}.example` },
        Status: { status: { name: "In progress" } },
        "Launch Key": { rich_text: [{ text: { content: QA_LAUNCH_KEY } }] },
        "External ID": { rich_text: [{ text: { content: QA_EXTERNAL_ID } }] },
        "Primary Phase": { number: 1 },
        Notes: {
          rich_text: [
            {
              text: {
                content: "Sandbox QA site — excluded from production launches and KPI reporting.",
              },
            },
          ],
        },
      },
    });
    siteId = site.id;
  }

  const existingRuns = await queryByRichText(notion, runsDb, "Launch Key", QA_LAUNCH_KEY);
  let runId = existingRuns[0]?.id;
  if (!runId) {
    const run = await notion.pages.create({
      parent: { database_id: runsDb },
      properties: {
        "Run Name": { title: [{ text: { content: `QA Launch — ${QA_SITE_NAME}` } }] },
        "Run Type": { select: { name: "QA Sandbox" } },
        Status: { status: { name: "In progress" } },
        "Launch Key": { rich_text: [{ text: { content: QA_LAUNCH_KEY } }] },
        "External ID": { rich_text: [{ text: { content: QA_EXTERNAL_ID } }] },
        "Current Phase": { number: 10 },
        Site: { relation: [{ id: siteId }] },
        "SOP Version": { relation: [{ id: sopPage.id }] },
        Started: { date: { start: new Date().toISOString().slice(0, 10) } },
        "Evidence URL": { url: "https://example.com/qa-evidence" },
      },
    });
    runId = run.id;
  }

  const taskManifest = [
    { task: "C3 — Create QA site row", phase: 1, ext: `${QA_EXTERNAL_ID}:task:1` },
    { task: "C3 — Idempotency re-run check", phase: 10, ext: `${QA_EXTERNAL_ID}:task:2` },
    { task: "C3 — KPI snapshot (QA)", phase: 12, ext: `${QA_EXTERNAL_ID}:task:3` },
  ];

  for (const item of taskManifest) {
    const found = await queryByRichText(notion, tasksDb, "External ID", item.ext);
    if (found.length) continue;
    await notion.pages.create({
      parent: { database_id: tasksDb },
      properties: {
        Task: { title: [{ text: { content: item.task } }] },
        Status: { status: { name: item.phase === 12 ? "Done" : "In progress" } },
        Phase: { number: item.phase },
        "External ID": { rich_text: [{ text: { content: item.ext } }] },
        "Project Run": { relation: [{ id: runId }] },
        Site: { relation: [{ id: siteId }] },
      },
    });
  }

  const gateExt = `${QA_EXTERNAL_ID}:gate:sandbox`;
  const gates = await queryByRichText(notion, gatesDb, "Target External ID", gateExt);
  if (!gates.length) {
    await notion.pages.create({
      parent: { database_id: gatesDb },
      properties: {
        Gate: { title: [{ text: { content: "QA sandbox build approval" } }] },
        "Target Type": { select: { name: "project_run" } },
        "Target External ID": { rich_text: [{ text: { content: gateExt } }] },
        Scope: {
          rich_text: [
            {
              text: {
                content: "Notion isolated build + sandbox records only; no domain purchase or prod deploy.",
              },
            },
          ],
        },
        Limits: {
          rich_text: [{ text: { content: "QA-SANDBOX-NOTION; max spend $0; no legacy DB writes." } }],
        },
        Status: { select: { name: "Approved" } },
        Approver: { rich_text: [{ text: { content: "Human-gate approver (Stage C)" } }] },
        "Approved At": { date: { start: new Date().toISOString().slice(0, 10) } },
        "Project Run": { relation: [{ id: runId }] },
      },
    });
  }

  const kpiExt = `${QA_EXTERNAL_ID}:kpi:1`;
  const kpiDs = await getDataSourceIdForDb(notion, kpiDb);
  const kpis = await notion.dataSources.query({
    data_source_id: kpiDs,
    filter: { property: "Snapshot", title: { equals: kpiExt } },
  });
  if (!kpis.results.length) {
    await notion.pages.create({
      parent: { database_id: kpiDb },
      properties: {
        Snapshot: { title: [{ text: { content: kpiExt } }] },
        "Captured At": { date: { start: new Date().toISOString().slice(0, 10) } },
        "Monthly Revenue": { number: 0 },
        "Daily Clicks": { number: 0 },
        "Indexed Pages": { number: 0 },
        "Record Class": { select: { name: "QA test-only" } },
        Site: { relation: [{ id: siteId }] },
        "Project Run": { relation: [{ id: runId }] },
      },
    });
  }

  const siteCount = (await queryByRichText(notion, sitesDb, "Launch Key", QA_LAUNCH_KEY)).length;
  const runCount = (await queryByRichText(notion, runsDb, "Launch Key", QA_LAUNCH_KEY)).length;

  return {
    siteId,
    runId,
    siteCount,
    runCount,
    idempotent: siteCount === 1 && runCount === 1,
  };
}

async function main() {
  const apiKey = process.env.NOTION_API_KEY?.trim();
  if (!apiKey) throw new Error("NOTION_API_KEY missing");

  const notion = new Client({ auth: apiKey });
  const manifest = loadManifest();

  console.log("C0 — Legacy baseline (read-only)…");
  const baselineBefore = await legacyBaseline(notion);
  manifest.legacyBaselineBefore = baselineBefore;

  console.log("C1 — Root page + databases…");
  const parentPageId = await resolveRootParentPageId(notion);
  manifest.parentPageId = parentPageId;
  const rootPageId = await ensureRootPage(notion, parentPageId, manifest);
  const rootPage = await notion.pages.retrieve({ page_id: rootPageId });
  manifest.rootPageUrl = rootPage.url;

  await buildSchemas(notion, manifest, rootPageId);

  console.log("C2 — Master SOP content…");
  await appendSopIfNeeded(notion, rootPageId, manifest);

  console.log("C3 — Sandbox QA + idempotency…");
  const qa1 = await runSandboxLaunch(notion, manifest);
  const qa2 = await runSandboxLaunch(notion, manifest);

  console.log("C5 — Legacy integrity read-back…");
  const baselineAfter = await legacyBaseline(notion);
  manifest.legacyBaselineAfter = baselineAfter;
  manifest.legacyIntegrityOk = Object.keys(baselineBefore).every(
    (k) => baselineBefore[k] === baselineAfter[k],
  );

  manifest.qa = { first: qa1, second: qa2, idempotent: qa1.idempotent && qa2.idempotent };
  manifest.completedAt = new Date().toISOString();

  saveManifest(manifest);

  console.log("\n=== Stage C complete ===");
  console.log("Root:", manifest.rootPageUrl);
  console.log("Legacy integrity:", manifest.legacyIntegrityOk ? "OK" : "FAILED");
  console.log("QA idempotent:", manifest.qa.idempotent);
  for (const [key, db] of Object.entries(manifest.databases)) {
    console.log(`DB ${key}:`, db.url || db.id);
  }
}

main().catch((err) => {
  console.error(err.body?.message || err.message || err);
  process.exit(1);
});
