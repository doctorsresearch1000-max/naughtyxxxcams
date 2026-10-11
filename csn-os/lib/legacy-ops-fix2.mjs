/**
 * Fix 2: bandeja relacional en OPERATIONS CENTER + Due Date (date) + vistas temporales.
 */
import { LEGACY_OPS, listViewsDetailed, ensureViewSpecs } from "./legacy-ops-centralize.mjs";
import { legacyRowCounts } from "./notion.mjs";

export const FIX2_MARKER = "csn-legacy-ops-fix2-v1";

export const OPS_SCHEMA_PROPS = {
  "Due Date (date)": { date: {} },
  Issue: {
    relation: {
      data_source_id: LEGACY_OPS.issues.dataSourceId,
      type: "single_property",
      single_property: {},
    },
  },
  Deployment: {
    relation: {
      data_source_id: LEGACY_OPS.deploy.dataSourceId,
      type: "single_property",
      single_property: {},
    },
  },
  Routine: {
    relation: {
      data_source_id: LEGACY_OPS.routine.dataSourceId,
      type: "single_property",
      single_property: {},
    },
  },
  "Cam Site": {
    relation: {
      data_source_id: LEGACY_OPS.hub.dataSourceId,
      type: "single_property",
      single_property: {},
    },
  },
  "CSN Task Key": { rich_text: {} },
};

const SITE_TO_HUB = {
  ClickForCamGirls: "3f484cd0-85ae-8032-bff1-c16e871e6357",
  TeleHub: "3f484cd0-85ae-800d-a256-e4c5526ec8fa",
  MatureCamRooms: "3f384cd0-85ae-80e4-bd3f-cc84f90bb0de",
  NaughtyXXXCams: "3f384cd0-85ae-801c-8ddb-f78c64aa7fc2",
};

const OPEN_NOT_DONE = { property: "Status", rich_text: { does_not_contain: "Done" } };

/** @type {import('./legacy-ops-centralize.mjs').ViewSpec[]} */
export const BANDEJA_VIEW_SPECS = [
  { name: "Bandeja · All Tasks", type: "table" },
  {
    name: "Bandeja · Today",
    type: "table",
    filter: {
      and: [OPEN_NOT_DONE, { property: "Due Date (date)", date: { equals: "today" } }],
    },
  },
  {
    name: "Bandeja · Overdue",
    type: "table",
    filter: {
      and: [OPEN_NOT_DONE, { property: "Due Date (date)", date: { before: "today" } }],
    },
  },
  {
    name: "Bandeja · Blocked",
    type: "table",
    filter: { property: "Status", rich_text: { contains: "Blocked" } },
  },
  {
    name: "Bandeja · In Progress",
    type: "table",
    filter: { property: "Status", rich_text: { contains: "In Progress" } },
  },
  {
    name: "Bandeja · Upcoming",
    type: "table",
    filter: {
      and: [OPEN_NOT_DONE, { property: "Due Date (date)", date: { after: "today" } }],
    },
  },
  {
    name: "Bandeja · Unscheduled",
    type: "table",
    filter: {
      and: [OPEN_NOT_DONE, { property: "Due Date (date)", date: { is_empty: true } }],
    },
  },
  {
    name: "Bandeja · By Site",
    type: "table",
    sorts: [{ property: "Site", direction: "ascending" }],
  },
];

export const HUB_FIX2_VIEW_SPECS = [
  {
    name: "CSN · 6 — Sitios Pending (bandeja)",
    type: "table",
    filter: { property: "Status", rich_text: { contains: "Pending" } },
  },
  {
    name: "CSN · 7 — Acceso: usar OPERATIONS CENTER",
    type: "table",
    sorts: [{ property: "Domains", direction: "ascending" }],
  },
];

function rt(text) {
  const s = String(text || "").slice(0, 2000);
  return s ? [{ type: "text", text: { content: s } }] : [];
}

function readRichText(prop) {
  if (!prop || prop.type !== "rich_text") return "";
  return prop.rich_text?.map((t) => t.plain_text).join("") || "";
}

function readTitle(row) {
  for (const v of Object.values(row.properties || {})) {
    if (v.type === "title") return v.title?.map((t) => t.plain_text).join("") || "";
  }
  return "";
}

function readSiteName(siteProp) {
  if (!siteProp) return "";
  if (siteProp.type === "rich_text") return readRichText(siteProp);
  if (siteProp.type === "multi_select") {
    const names = siteProp.multi_select?.map((m) => m.name) || [];
    if (names.includes("Toda la red")) return "Toda la red";
    return names[0] || "";
  }
  return "";
}

function readDateStart(prop) {
  if (!prop || prop.type !== "date" || !prop.date?.start) return null;
  return prop.date.start.slice(0, 10);
}

/**
 * Parsea DD-MM-YYYY o D-M-YYYY (convención ES). Devuelve ISO YYYY-MM-DD o null.
 */
export function parseLegacyDueText(text) {
  const s = String(text || "").trim();
  if (!s) return { iso: null, note: "empty" };
  const m = s.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (!m) return { iso: null, note: `unparsed_format:${s}` };
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return { iso: null, note: `invalid_calendar:${s}` };
  }
  const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return { iso, note: "parsed_dd_mm_yyyy", source: s };
}

function mapPriority(selectName) {
  const m = { Alta: "P1 High", Media: "P2 Medium", Baja: "P3 Low" };
  return m[selectName] || selectName || "P2 Medium";
}

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

export async function ensureOpsSchemaFix2(notion) {
  const ds = await notion.dataSources.retrieve({ data_source_id: LEGACY_OPS.ops.dataSourceId });
  const names = new Set(Object.keys(ds.properties || {}));
  const toAdd = {};
  for (const [name, def] of Object.entries(OPS_SCHEMA_PROPS)) {
    if (!names.has(name)) toAdd[name] = def;
  }
  if (!Object.keys(toAdd).length) return { added: [] };
  await notion.dataSources.update({
    data_source_id: LEGACY_OPS.ops.dataSourceId,
    properties: toAdd,
  });
  await new Promise((r) => setTimeout(r, 400));
  return { added: Object.keys(toAdd) };
}

function relationIds(row, propName) {
  const p = row.properties?.[propName];
  if (p?.type !== "relation") return [];
  return (p.relation || []).map((x) => x.id);
}

function taskKey(kind, pageId) {
  return `csn:ops:v2:${kind}:${pageId}`;
}

export function classifyActionableSources(issues, deploy, routine) {
  const pending = { issues: [], deploy: [], routine: [], skipped: [] };

  for (const row of issues) {
    const title = readTitle(row);
    const status = row.properties.Status?.status?.name;
    if (status === "Resuelto") continue;
    if (status === "Abierto" && !title.trim()) {
      pending.skipped.push({
        kind: "issue",
        id: row.id,
        reason: "title_empty_requires_approval",
        status,
      });
      continue;
    }
    if (["Abierto", "Investigando", "Mitigado"].includes(status)) {
      pending.issues.push({ row, status, title });
    }
  }

  for (const row of deploy) {
    const status = row.properties.Status?.status?.name;
    if (["Planeada", "En preview"].includes(status)) {
      pending.deploy.push({ row, status, title: readTitle(row) });
    }
  }

  for (const row of routine) {
    const status = row.properties.Status?.status?.name;
    if (status === "Pendiente") {
      pending.routine.push({ row, status, title: readTitle(row) });
    }
  }

  return pending;
}

export async function applyLegacyOpsFix2(notion, { dryRun = false } = {}) {
  const countsBefore = await legacyRowCounts(notion);
  const viewsBeforeOps = await listViewsDetailed(notion, LEGACY_OPS.ops.databaseId);
  const defaultView = viewsBeforeOps.find((v) => v.name === "/database");

  const schema = dryRun ? { added: [] } : await ensureOpsSchemaFix2(notion);

  const [opsRows, issueRows, deployRows, routineRows] = await Promise.all([
    queryAll(notion, LEGACY_OPS.ops.dataSourceId),
    queryAll(notion, LEGACY_OPS.issues.dataSourceId),
    queryAll(notion, LEGACY_OPS.deploy.dataSourceId),
    queryAll(notion, LEGACY_OPS.routine.dataSourceId),
  ]);

  const linked = {
    existingOpsUpdated: [],
    created: [],
    skippedDuplicates: [],
    dateMigrations: [],
    dateUnparsed: [],
  };

  const existingByKey = new Set();
  const existingByRelation = { Issue: new Set(), Deployment: new Set(), Routine: new Set() };
  for (const row of opsRows) {
    const key = readRichText(row.properties["CSN Task Key"]);
    if (key) existingByKey.add(key);
    for (const rel of ["Issue", "Deployment", "Routine"]) {
      for (const id of relationIds(row, rel)) existingByRelation[rel].add(id);
    }
  }

  const actionable = classifyActionableSources(issueRows, deployRows, routineRows);

  if (!dryRun) {
    for (const row of opsRows) {
      const siteName = readSiteName(row.properties.Site);
      const hubId = SITE_TO_HUB[siteName];
      const dueText = readRichText(row.properties["Due Date"]);
      const parsed = parseLegacyDueText(dueText);
      const patch = {};
      if (hubId && !relationIds(row, "Cam Site").includes(hubId)) {
        patch["Cam Site"] = { relation: [{ id: hubId }] };
      }
      const currentDate = row.properties["Due Date (date)"];
      if (parsed.iso && !readDateStart(currentDate)) {
        patch["Due Date (date)"] = { date: { start: parsed.iso } };
        linked.dateMigrations.push({
          pageId: row.id,
          title: readTitle(row) || readRichText(row.properties["Next Action"]),
          sourceText: dueText,
          iso: parsed.iso,
          note: parsed.note,
        });
      } else if (dueText && !parsed.iso) {
        linked.dateUnparsed.push({ pageId: row.id, dueText, note: parsed.note });
      }
      if (Object.keys(patch).length) {
        await notion.pages.update({ page_id: row.id, properties: patch });
        linked.existingOpsUpdated.push({ pageId: row.id, patch: Object.keys(patch) });
        await new Promise((r) => setTimeout(r, 250));
      }
    }
  }

  async function createCentralTask(kind, sourceRow, statusOps, relationProp) {
    const sourceId = sourceRow.id;
    if (existingByRelation[relationProp].has(sourceId)) {
      linked.skippedDuplicates.push({ kind, sourceId, reason: "relation_exists" });
      return;
    }
    const key = taskKey(kind, sourceId);
    if (existingByKey.has(key)) {
      linked.skippedDuplicates.push({ kind, sourceId, reason: "task_key_exists" });
      return;
    }

    const title = readTitle(sourceRow);
    const siteName = readSiteName(sourceRow.properties.Site);
    const hubId = SITE_TO_HUB[siteName];
    const category =
      sourceRow.properties.Category?.select?.name ||
      readRichText(sourceRow.properties["Category "]) ||
      kind;
    const priority = mapPriority(sourceRow.properties.Priority?.select?.name);
    const dueIso = readDateStart(sourceRow.properties["Due Date"]);

    const props = {
      "Next Action": { title: rt(title) },
      Task: { rich_text: rt(title.slice(0, 500)) },
      Status: { rich_text: rt(statusOps) },
      Site: { rich_text: rt(siteName) },
      Priority: { rich_text: rt(priority) },
      "Category ": { rich_text: rt(category) },
      [relationProp]: { relation: [{ id: sourceId }] },
      "CSN Task Key": { rich_text: rt(key) },
    };
    if (hubId) props["Cam Site"] = { relation: [{ id: hubId }] };
    if (dueIso) props["Due Date (date)"] = { date: { start: dueIso } };

    if (dryRun) {
      linked.created.push({ dryRun: true, kind, sourceId, title, key });
      return;
    }

    const page = await notion.pages.create({
      parent: { database_id: LEGACY_OPS.ops.databaseId },
      properties: props,
    });
    existingByRelation[relationProp].add(sourceId);
    existingByKey.add(key);
    linked.created.push({ pageId: page.id, kind, sourceId, title, key });
    await new Promise((r) => setTimeout(r, 300));
  }

  const statusIssue = "In Progress";
  const statusDeployReady = "Ready";
  const statusDeployPreview = "In Progress";
  const statusRoutine = "Ready";

  for (const { row } of actionable.issues) {
    await createCentralTask("issue", row, statusIssue, "Issue");
  }
  for (const { row, status } of actionable.deploy) {
    const st = status === "En preview" ? statusDeployPreview : statusDeployReady;
    await createCentralTask("deploy", row, st, "Deployment");
  }
  for (const { row } of actionable.routine) {
    await createCentralTask("routine", row, statusRoutine, "Routine");
  }

  const viewResults = {};
  if (!dryRun) {
    const opsNames = new Set((await listViewsDetailed(notion, LEGACY_OPS.ops.databaseId)).map((v) => v.name));
    viewResults.ops = await ensureViewSpecs(notion, LEGACY_OPS.ops, BANDEJA_VIEW_SPECS, opsNames);

    const hubNames = new Set((await listViewsDetailed(notion, LEGACY_OPS.hub.databaseId)).map((v) => v.name));
    viewResults.hub = await ensureViewSpecs(notion, LEGACY_OPS.hub, HUB_FIX2_VIEW_SPECS, hubNames);
  }

  const countsAfter = dryRun ? countsBefore : await legacyRowCounts(notion);
  const viewsAfterOps = dryRun ? viewsBeforeOps : await listViewsDetailed(notion, LEGACY_OPS.ops.databaseId);
  const defaultViewAfter = viewsAfterOps.find((v) => v.name === "/database");

  const verification = {
    defaultViewPreserved: Boolean(defaultView && defaultViewAfter && defaultView.id === defaultViewAfter.id),
    bandejaViews: dryRun
      ? BANDEJA_VIEW_SPECS.map((s) => s.name)
      : viewsAfterOps.filter((v) => v.name.startsWith("Bandeja ·")).map((v) => ({
          name: v.name,
          filter: v.filter,
        })),
  };

  return {
    marker: FIX2_MARKER,
    at: new Date().toISOString(),
    dryRun,
    countsBefore,
    countsAfter,
    schema,
    actionable: {
      issues: actionable.issues.length,
      deploy: actionable.deploy.length,
      routine: actionable.routine.length,
      skipped: actionable.skipped,
    },
    linked,
    viewResults,
    verification,
    opsRowDelta: countsAfter.ops - countsBefore.ops,
  };
}
