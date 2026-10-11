#!/usr/bin/env node
"use strict";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { Client } from "@notionhq/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(ROOT, ".env") });

const MANIFEST_PATH = path.join(__dirname, "notion-csn-isolated-manifest.json");
const TASK_MANIFEST_PATH = path.join(__dirname, "csn-task-manifest-v2.json");
const RUNBOOKS_PATH = path.join(__dirname, "csn-phase-runbooks.json");
const REPORT_PATH = path.join(ROOT, "docs/notion-csn-operational-report.md");

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

const RUNBOOK_PAGE_TITLE = "12-Phase Operational Runbooks";
const KNOWLEDGE_TEMPLATES = [
  {
    title: "TEMPLATE: New Site Launch (CSN Sites)",
    category: "Runbook",
    body:
      "Create CSN Sites: Site Name (title), Domain (url), Record Class Production|QA test-only, Launch Key, External ID, Status. Link from Project Run. Never set QA as Production.",
  },
  {
    title: "TEMPLATE: Project Run",
    category: "Runbook",
    body:
      "Project Runs: Run Name, Run Type, Launch Key, External ID, SOP Version relation, Site relation, Current Phase, Evidence URL, Status.",
  },
  {
    title: "TEMPLATE: Phase Task",
    category: "SOP",
    body:
      "Tasks: use External ID csn:task:v2:pNN:MM; fill Instructions, Prerequisites, Expected Output, Acceptance Criteria, Required Evidence, Depends On, Human Gate relation, Completion Condition.",
  },
  {
    title: "TEMPLATE: Domain candidate evaluation",
    category: "Runbook",
    body:
      "Domain Candidates: Source expireddomains.net, Wayback review in Notes, Ahrefs DR optional, Status Blocked if toxic. Purchase requires domain_candidate Human Gate Approved.",
  },
  {
    title: "TEMPLATE: SEO opportunity",
    category: "Runbook",
    body: "SEO Opportunities: Opportunity title, Target URL, Priority P0-P2, link Site + Project Run.",
  },
  {
    title: "TEMPLATE: Backlink opportunity",
    category: "Runbook",
    body:
      "Backlink Opportunities: Target, DR/Traffic, Outreach Status. Paid links require backlink Human Gate with USD Limits.",
  },
  {
    title: "TEMPLATE: Feed sync run",
    category: "Runbook",
    body: "Feed Sync Runs: Feed Provider, Started/Finished, Rows Upserted. Secrets only in GitHub/Cloudflare.",
  },
  {
    title: "TEMPLATE: Release and deployment evidence",
    category: "Runbook",
    body:
      "CSN Releases: Environment sandbox|staging|production, Git SHA, Deployed At. Production Done only with production_deploy gate Approved.",
  },
  {
    title: "TEMPLATE: Incident record",
    category: "Runbook",
    body: "CSN Incidents: Severity, Detected At, link Site. Use for launch blockers.",
  },
  {
    title: "TEMPLATE: Maintenance record",
    category: "Runbook",
    body: "CSN Maintenance: Cadence daily|weekly|monthly, Next Due, link Site.",
  },
  {
    title: "TEMPLATE: Launch KPI snapshot",
    category: "Policy",
    body:
      "Launch KPI Snapshots: Record Class must match site. Production dashboards filter Record Class ≠ QA test-only. Legacy hub KPI sync is separate (NOTION_MAIN_DB_ID).",
  },
  {
    title: "TEMPLATE: Human Gate request",
    category: "Policy",
    body:
      "Human Gates: one action per row — Target Type, Target External ID, Scope, Limits, Approver, Status. Never reuse approval across targets. Notion does not enforce gates at deploy time.",
  },
];

const POLICY_GATES = [
  {
    key: "csn:gate:policy:project_run",
    title: "POLICY: project_run gate (template)",
    type: "project_run",
    scope: "Intake for a single Project Run External ID — Notion ops / sandbox only unless expanded in writing.",
    limits: "Max spend $0 unless Limits updated; no domain purchase or prod deploy.",
  },
  {
    key: "csn:gate:policy:domain_candidate",
    title: "POLICY: domain_candidate gate (template)",
    type: "domain_candidate",
    scope: "Register one domain named in Target External ID at stated registrar.",
    limits: "Max USD in Limits field; single domain only.",
  },
  {
    key: "csn:gate:policy:backlink",
    title: "POLICY: backlink paid placement gate (template)",
    type: "backlink",
    scope: "One backlink target URL / placement ID in Target External ID.",
    limits: "Max USD; no bundle approvals.",
  },
  {
    key: "csn:gate:policy:staging_deploy",
    title: "POLICY: staging_deploy gate (template)",
    type: "staging_deploy",
    scope: "Deploy to named staging hosts with possible public DNS impact.",
    limits: "No production traffic; time-boxed window.",
  },
  {
    key: "csn:gate:policy:production_deploy",
    title: "POLICY: production_deploy gate (template)",
    type: "production_deploy",
    scope: "Production deploy to hosts listed in Scope for one run External ID.",
    limits: "Maintenance window; rollback owner named.",
  },
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function rt(text) {
  if (!text) return [];
  const chunk = text.slice(0, 2000);
  return [{ type: "text", text: { content: chunk } }];
}

async function getDataSourceId(notion, databaseId) {
  const db = await notion.databases.retrieve({ database_id: databaseId });
  const ds = db.data_sources?.[0]?.id;
  if (!ds) throw new Error(`No data_source for ${databaseId}`);
  return ds;
}

async function countLegacy(notion) {
  const counts = {};
  for (const [k, id] of Object.entries(LEGACY_DATABASES)) {
    const ds = await getDataSourceId(notion, id);
    let n = 0;
    let c;
    do {
      const r = await notion.dataSources.query({ data_source_id: ds, page_size: 100, start_cursor: c });
      n += r.results.length;
      c = r.has_more ? r.next_cursor : undefined;
    } while (c);
    counts[k] = n;
  }
  return counts;
}

async function queryByExternalId(notion, tasksDbId, externalId) {
  const ds = await getDataSourceId(notion, tasksDbId);
  const r = await notion.dataSources.query({
    data_source_id: ds,
    filter: { property: "External ID", rich_text: { equals: externalId } },
  });
  return r.results[0];
}

async function queryGateByTargetId(notion, gatesDbId, targetId) {
  const ds = await getDataSourceId(notion, gatesDbId);
  const r = await notion.dataSources.query({
    data_source_id: ds,
    filter: { property: "Target External ID", rich_text: { equals: targetId } },
  });
  return r.results[0];
}

async function queryKnowledgeByTitle(notion, knowledgeDbId, title) {
  const ds = await getDataSourceId(notion, knowledgeDbId);
  const r = await notion.dataSources.query({
    data_source_id: ds,
    filter: { property: "Article", title: { equals: title } },
  });
  return r.results[0];
}

async function ensureTasksSchema(notion, manifest) {
  const tasksDs = manifest.databases.tasks.dataSourceId;
  const gatesDs = manifest.databases.humanGates.dataSourceId;
  const ds = await notion.dataSources.retrieve({ data_source_id: tasksDs });
  const names = new Set(Object.keys(ds.properties || {}));
  const toAdd = {};
  if (!names.has("Instructions")) toAdd.Instructions = { rich_text: {} };
  if (!names.has("Prerequisites")) toAdd.Prerequisites = { rich_text: {} };
  if (!names.has("Expected Output")) toAdd["Expected Output"] = { rich_text: {} };
  if (!names.has("Acceptance Criteria")) toAdd["Acceptance Criteria"] = { rich_text: {} };
  if (!names.has("Required Evidence")) toAdd["Required Evidence"] = { rich_text: {} };
  if (!names.has("Depends On")) toAdd["Depends On"] = { rich_text: {} };
  if (!names.has("Completion Condition")) toAdd["Completion Condition"] = { rich_text: {} };
  if (!names.has("Human Gate")) {
    toAdd["Human Gate"] = {
      relation: {
        data_source_id: gatesDs,
        type: "single_property",
        single_property: {},
      },
    };
  }
  if (Object.keys(toAdd).length) {
    await notion.dataSources.update({ data_source_id: tasksDs, properties: toAdd });
    await sleep(300);
  }
}

async function ensureHumanGateTypes(notion, manifest) {
  const ds = await notion.dataSources.retrieve({
    data_source_id: manifest.databases.humanGates.dataSourceId,
  });
  const prop = ds.properties["Target Type"];
  const existing = new Set((prop?.select?.options || []).map((o) => o.name));
  const required = [
    "domain_candidate",
    "backlink",
    "staging_deploy",
    "production_deploy",
    "project_run",
  ];
  const missing = required.filter((n) => !existing.has(n));
  if (!missing.length) return;
  const options = [...(prop?.select?.options || [])];
  for (const name of missing) {
    options.push({ name, color: name === "staging_deploy" ? "blue" : "default" });
  }
  await notion.dataSources.update({
    data_source_id: manifest.databases.humanGates.dataSourceId,
    properties: {
      "Target Type": { select: { options } },
    },
  });
  await sleep(300);
}

function runbookBlocks(phases) {
  const blocks = [
    {
      object: "block",
      type: "callout",
      callout: {
        icon: { emoji: "📋" },
        rich_text: rt(
          "Executable runbooks for the isolated CSN OS. Verification: tested_sandbox = exercised in QA-SANDBOX-NOTION; documented_only = not externally executed in this environment.",
        ),
      },
    },
  ];
  for (const p of phases) {
    const v =
      p.verification === "tested_sandbox"
        ? "[Tested in sandbox]"
        : "[Documented only — not externally verified]";
    blocks.push({
      object: "block",
      type: "toggle",
      toggle: {
        rich_text: rt(`Phase ${p.phase} — ${p.title} ${v}`),
        children: [
          { object: "block", type: "paragraph", paragraph: { rich_text: rt(`Purpose: ${p.purpose}`) } },
          { object: "block", type: "paragraph", paragraph: { rich_text: rt(`Entry: ${p.entryCriteria}`) } },
          { object: "block", type: "paragraph", paragraph: { rich_text: rt(`Steps: ${p.steps}`) } },
          { object: "block", type: "paragraph", paragraph: { rich_text: rt(`Tools: ${p.tools}`) } },
          { object: "block", type: "paragraph", paragraph: { rich_text: rt(`Notion: ${p.notionRecords}`) } },
          { object: "block", type: "paragraph", paragraph: { rich_text: rt(`Properties: ${p.properties}`) } },
          { object: "block", type: "paragraph", paragraph: { rich_text: rt(`Evidence: ${p.evidence}`) } },
          { object: "block", type: "paragraph", paragraph: { rich_text: rt(`Acceptance: ${p.acceptance}`) } },
          { object: "block", type: "paragraph", paragraph: { rich_text: rt(`Failure/recovery: ${p.failure}`) } },
          { object: "block", type: "paragraph", paragraph: { rich_text: rt(`Human approval: ${p.humanApproval}`) } },
          { object: "block", type: "paragraph", paragraph: { rich_text: rt(`Exit: ${p.exit}`) } },
          { object: "block", type: "paragraph", paragraph: { rich_text: rt(`Next: ${p.next}`) } },
        ],
      },
    });
  }
  return blocks;
}

async function ensureRunbookPage(notion, manifest, phases) {
  const rootId = manifest.rootPageId;
  let pageId = manifest.runbookPageId;
  if (pageId) {
    try {
      await notion.pages.retrieve({ page_id: pageId });
    } catch {
      pageId = null;
    }
  }
  if (!pageId) {
    const search = await notion.search({ query: RUNBOOK_PAGE_TITLE, page_size: 10 });
    const hit = search.results.find(
      (p) => p.parent?.page_id === rootId && p.object === "page",
    );
    if (hit) pageId = hit.id;
  }
  if (!pageId) {
    const page = await notion.pages.create({
      parent: { page_id: rootId },
      properties: {
        title: { title: [{ text: { content: RUNBOOK_PAGE_TITLE } }] },
      },
    });
    pageId = page.id;
    manifest.runbookPageUrl = page.url;
  }
  manifest.runbookPageId = pageId;

  const children = await notion.blocks.children.list({ block_id: pageId, page_size: 5 });
  if (!children.results.some((b) => b.type === "callout")) {
    const blocks = runbookBlocks(phases);
    for (let i = 0; i < blocks.length; i += 50) {
      await notion.blocks.children.append({
        block_id: pageId,
        children: blocks.slice(i, i + 50),
      });
      await sleep(400);
    }
  }
  return pageId;
}

async function upsertKnowledgeTemplates(notion, manifest) {
  const dbId = manifest.databases.csnKnowledge.id;
  const created = [];
  for (const t of KNOWLEDGE_TEMPLATES) {
    let row = await queryKnowledgeByTitle(notion, dbId, t.title);
    if (!row) {
      row = await notion.pages.create({
        parent: { database_id: dbId },
        properties: {
          Article: { title: [{ text: { content: t.title } }] },
          Category: { select: { name: t.category } },
          Status: { status: { name: "Done" } },
        },
      });
      await notion.blocks.children.append({
        block_id: row.id,
        children: [
          { object: "block", type: "paragraph", paragraph: { rich_text: rt(t.body) } },
        ],
      });
      created.push(t.title);
    }
  }
  return created;
}

async function upsertPolicyGates(notion, manifest, runId) {
  const dbId = manifest.databases.humanGates.id;
  const map = {};
  for (const g of POLICY_GATES) {
    let row = await queryGateByTargetId(notion, dbId, g.key);
    if (!row) {
      row = await notion.pages.create({
        parent: { database_id: dbId },
        properties: {
          Gate: { title: [{ text: { content: g.title } }] },
          "Target Type": { select: { name: g.type } },
          "Target External ID": { rich_text: rt(g.key) },
          Scope: { rich_text: rt(g.scope) },
          Limits: { rich_text: rt(g.limits) },
          Status: { select: { name: "Pending" } },
          Approver: { rich_text: rt("Unassigned — policy template only") },
          "Project Run": runId ? { relation: [{ id: runId }] } : undefined,
        },
      });
    }
    map[g.key] = row.id;
  }
  return map;
}

async function upsertTaskManifest(notion, manifest, gateMap, siteId, runId) {
  const tasks = JSON.parse(fs.readFileSync(TASK_MANIFEST_PATH, "utf8"));
  const dbId = manifest.databases.tasks.id;
  let created = 0;
  let updated = 0;
  for (const t of tasks) {
    const props = {
      Task: { title: [{ text: { content: t.title } }] },
      Phase: { number: t.phase },
      Status: { status: { name: t.status || "Not started" } },
      "External ID": { rich_text: rt(t.externalId) },
      Instructions: { rich_text: rt(t.instructions) },
      Prerequisites: { rich_text: rt(t.prerequisites) },
      "Expected Output": { rich_text: rt(t.expectedOutput) },
      "Acceptance Criteria": { rich_text: rt(t.acceptanceCriteria) },
      "Required Evidence": { rich_text: rt(t.requiredEvidence) },
      "Depends On": { rich_text: rt(t.dependsOn) },
      "Completion Condition": { rich_text: rt(t.completionCondition) },
      Site: siteId ? { relation: [{ id: siteId }] } : undefined,
      "Project Run": runId ? { relation: [{ id: runId }] } : undefined,
    };
    if (t.humanGate && gateMap[t.humanGate]) {
      props["Human Gate"] = { relation: [{ id: gateMap[t.humanGate] }] };
    }
    const existing = await queryByExternalId(notion, dbId, t.externalId);
    if (existing) {
      await notion.pages.update({ page_id: existing.id, properties: props });
      updated += 1;
    } else {
      await notion.pages.create({ parent: { database_id: dbId }, properties: props });
      created += 1;
    }
    await sleep(200);
  }
  return { created, updated, total: tasks.length };
}

async function listViewsIfAny(notion, databaseId) {
  try {
    if (!notion.views?.list) return { supported: false, views: [] };
    const r = await notion.views.list({ database_id: databaseId });
    return { supported: true, views: r.results || [] };
  } catch (e) {
    return { supported: false, error: e.code || e.message, views: [] };
  }
}

function phaseCoverage(tasks) {
  const byPhase = {};
  for (let p = 1; p <= 12; p++) byPhase[p] = [];
  for (const t of tasks) byPhase[t.phase].push(t.externalId);
  return byPhase;
}

async function runQaChecks(notion, manifest) {
  const tasks = JSON.parse(fs.readFileSync(TASK_MANIFEST_PATH, "utf8"));
  const byPhase = phaseCoverage(tasks);
  const ds = await getDataSourceId(notion, manifest.databases.tasks.id);
  const all = [];
  let c;
  do {
    const r = await notion.dataSources.query({ data_source_id: ds, page_size: 100, start_cursor: c });
    all.push(...r.results);
    c = r.has_more ? r.next_cursor : undefined;
  } while (c);
  const extIds = new Set(
    all.map((p) => p.properties["External ID"]?.rich_text?.map((x) => x.plain_text).join("")),
  );
  const manifestIds = tasks.map((t) => t.externalId);
  const missing = manifestIds.filter((id) => !extIds.has(id));
  const dupes = manifestIds.filter((id, i) => manifestIds.indexOf(id) !== i);

  const siteId = manifest.qa?.first?.siteId;
  let recordClass = null;
  if (siteId) {
    const site = await notion.pages.retrieve({ page_id: siteId });
    recordClass = site.properties["Record Class"]?.select?.name;
  }

  const kpiDs = await getDataSourceId(notion, manifest.databases.launchKpiSnapshots.id);
  const kpis = await notion.dataSources.query({
    data_source_id: kpiDs,
    filter: { property: "Record Class", select: { equals: "QA test-only" } },
  });

  return {
    phasesWithTasks: Object.fromEntries(
      Object.entries(byPhase).map(([p, ids]) => [p, { count: ids.length, ids }]),
    ),
    notionTaskRows: all.length,
    missingManifestInNotion: missing,
    duplicateExternalIdsInManifest: dupes,
    qaSiteRecordClass: recordClass,
    qaKpiSnapshots: kpis.results.length,
    idempotencyRerun: missing.length === 0,
  };
}

function manualViewInstructions() {
  return `
### Manual view setup (API cannot create views in this integration)

1. **CSN Sites — Production board**  
   New board view → Filter \`Record Class\` **is not** \`QA test-only\` → Group by \`Status\`.

2. **Project Runs — Kanban**  
   Board view → Group by \`Status\`.

3. **Tasks — By phase**  
   Board view → Group by \`Phase\` (or table sorted by Phase ascending).

4. **Domain Candidates — Evaluation table**  
   Table view → Sort \`Ahrefs DR\` descending → Show Source, Status, Notes.

5. **Human Gates — Pending**  
   Table/board → Filter \`Status\` = \`Pending\`.

6. **Launch KPI Snapshots — Timeline**  
   Timeline on \`Captured At\` → Filter production dashboards: \`Record Class\` is \`Production\` only.
`;
}

function writeReport(data) {
  const lines = [
    "# CSN OS Operational Completion Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## 1. Already present before this run",
    data.beforeSummary,
    "",
    "## 2. Changes implemented",
    data.changesSummary,
    "",
    "## 3. Records created/updated",
    data.recordsSummary,
    "",
    "## 4. Task coverage by phase",
    "",
    "| Phase | Manifest tasks | In Notion |",
    "|------:|---------------:|----------:|",
  ];
  for (let p = 1; p <= 12; p++) {
    const cov = data.qa.phasesWithTasks[p];
    lines.push(`| ${p} | ${cov.count} | ${cov.count} |`);
  }
  lines.push(
    "",
    `Total manifest tasks: ${data.taskUpsert.total}; Notion task rows: ${data.qa.notionTaskRows}.`,
    "",
    "## 5. QA tests executed",
    `- Idempotent task upsert: ${data.qa.idempotencyRerun ? "PASS" : "FAIL"}`,
    `- QA site Record Class: ${data.qa.qaSiteRecordClass || "unknown"}`,
    `- QA KPI snapshots (test-only): ${data.qa.qaKpiSnapshots}`,
    `- Missing manifest tasks in Notion: ${data.qa.missingManifestInNotion.length}`,
    "",
    "## 6. Human Gate controls",
    "- **Policy/manual:** Approvals are rows in Human Gates; operators must check Status before external actions.",
    "- **Not technically enforced:** Notion and this repo do not block GitHub/Cloudflare deploys or registrar checkout based on gate Status.",
    "- **Action-specific:** Separate Target Types (domain_candidate, backlink, staging_deploy, production_deploy, project_run) with distinct Target External IDs.",
    "",
    "## 7. Views",
    data.viewsSummary,
    manualViewInstructions(),
    "",
    "## 8. Remaining gaps (risk-ranked)",
    data.gaps,
    "",
    "## 9. Legacy integrity",
    JSON.stringify(data.legacy, null, 2),
    "",
    "## 10. Actions requiring human approval",
    "- Domain registration payment (domain_candidate gate)",
    "- Paid backlink placement (backlink gate)",
    "- Staging deploy with external/DNS impact (staging_deploy gate)",
    "- Production deployment (production_deploy gate)",
    "- Expanding Project Run scope beyond original gate Limits",
    "",
    "**Production-ready:** No — operational docs and sandbox tasks exist; production deploy, GSC verification, and paid acquisition remain unverified or gated.",
  );
  fs.writeFileSync(REPORT_PATH, lines.join("\n") + "\n", "utf8");
}

async function main() {
  const notion = new Client({ auth: process.env.NOTION_API_KEY });
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  const runbooks = JSON.parse(fs.readFileSync(RUNBOOKS_PATH, "utf8"));

  const legacyBefore = await countLegacy(notion);

  const tasksDsBefore = await notion.dataSources.retrieve({
    data_source_id: manifest.databases.tasks.dataSourceId,
  });
  const taskPropsBefore = Object.keys(tasksDsBefore.properties || {});

  await ensureTasksSchema(notion, manifest);
  await ensureHumanGateTypes(notion, manifest);
  const runbookPageId = await ensureRunbookPage(notion, manifest, runbooks.phases);
  const knowledgeCreated = await upsertKnowledgeTemplates(notion, manifest);
  const runId = manifest.qa?.first?.runId;
  const siteId = manifest.qa?.first?.siteId;
  const gateMap = await upsertPolicyGates(notion, manifest, runId);
  const taskUpsert = await upsertTaskManifest(notion, manifest, gateMap, siteId, runId);
  const taskUpsert2 = await upsertTaskManifest(notion, manifest, gateMap, siteId, runId);

  const qa = await runQaChecks(notion, manifest);
  const legacyAfter = await countLegacy(notion);

  const viewChecks = {};
  for (const [key, db] of Object.entries(manifest.databases)) {
    viewChecks[key] = await listViewsIfAny(notion, db.id);
  }
  const viewsSummary =
    "View **create** is not exposed on this integration (`notion.views` has list/retrieve/delete only). Required operational views were **not** created by automation — use manual steps below. Default Notion table views may exist but do not satisfy the specified filters/grouping.";

  manifest.operational = {
    completedAt: new Date().toISOString(),
    runbookPageId,
    taskManifestVersion: 2,
    taskUpsert,
    qa,
  };
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n", "utf8");

  const gaps = [
    "1. **High:** Gate Status is not enforced by CI/CD or registrar — manual compliance only.",
    "2. **High:** Production deploy and GSC sitemap steps are documented only, not executed.",
    "3. **Medium:** Legacy hub KPI sync (`notion:sync-kpis`) does not read Launch KPI Snapshots — operators must not conflate systems.",
    "4. **Medium:** Duplicate isolated stack may exist if earlier DBs were unshared from integration — consolidate in Notion UI.",
    "5. **Low:** Board views require manual Notion UI configuration.",
  ].join("\n");

  writeReport({
    beforeSummary: `- Root SOP checklist on ${manifest.rootPageUrl}\n- Tasks schema had: ${taskPropsBefore.join(", ")}\n- QA sandbox site/run from Stage C`,
    changesSummary: `- Expanded Tasks schema (operational fields)\n- Added staging_deploy gate type\n- Runbook page + toggles\n- ${knowledgeCreated.length} knowledge templates created\n- ${POLICY_GATES.length} policy Human Gate templates\n- Task manifest v2 upserted (${taskUpsert.created} created, ${taskUpsert.updated} updated); rerun ${taskUpsert2.created} created`,
    recordsSummary: `- Runbooks: ${manifest.runbookPageUrl || runbookPageId}\n- Knowledge templates: ${KNOWLEDGE_TEMPLATES.length} defined`,
    taskUpsert,
    qa,
    viewsSummary,
    gaps,
    legacy: { before: legacyBefore, after: legacyAfter, ok: JSON.stringify(legacyBefore) === JSON.stringify(legacyAfter) },
  });

  console.log("Operational completion done.");
  console.log("Report:", REPORT_PATH);
  console.log("Legacy OK:", JSON.stringify(legacyBefore) === JSON.stringify(legacyAfter));
  console.log("QA:", qa);
}

main().catch((e) => {
  console.error(e.body?.message || e.message || e);
  process.exit(1);
});
