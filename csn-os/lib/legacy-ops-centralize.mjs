/**
 * Centralización operativa aditiva del CSN legacy (6 bases full-page).
 * Solo crea vistas nuevas con prefijos CSN · / OC · — no modifica filas, descripciones ni vistas existentes.
 */
import { legacyRowCounts } from "./notion.mjs";

export const LEGACY_OPS = {
  hub: {
    label: "CAM SITE NETWORK OS",
    databaseId: "3f384cd0-85ae-80bd-be51-c17104511bfa",
    dataSourceId: "3f384cd0-85ae-8078-9afc-000be75ab268",
    url: "https://app.notion.com/p/3f384cd085ae80bdbe51c17104511bfa",
  },
  ops: {
    label: "OPERATIONS CENTER",
    databaseId: "3f484cd0-85ae-804d-b61a-d87b93c11734",
    dataSourceId: "3fd84cd0-85ae-82af-94b9-074cf3e37156",
    url: "https://app.notion.com/p/3f484cd085ae804db61ad87b93c11734",
  },
  issues: {
    label: "ISSUES & INCIDENTS",
    databaseId: "3f484cd0-85ae-80dd-aedb-f0e4004e88ea",
    dataSourceId: "ea084cd0-85ae-83ac-9f12-07292a3bb2da",
    url: "https://app.notion.com/p/3f484cd085ae80ddaedbf0e4004e88ea",
  },
  deploy: {
    label: "DEPLOYMENTS & RELEASES",
    databaseId: "3f484cd0-85ae-8011-af56-e1adfd30300b",
    dataSourceId: "36c84cd0-85ae-822f-a249-877e009315f9",
    url: "https://app.notion.com/p/3f484cd085ae8011af56e1adfd30300b",
  },
  kv: {
    label: "KNOWLEDGE VAULT",
    databaseId: "3f484cd0-85ae-800b-a34c-d0d4101255a0",
    dataSourceId: "41284cd0-85ae-829e-ac42-0771e6b6f412",
    url: "https://app.notion.com/p/3f484cd085ae800ba34cd0d4101255a0",
  },
  routine: {
    label: "ROUTINE & MAINTENANCE",
    databaseId: "3f484cd0-85ae-80a8-9091-e7bf1a16ba70",
    dataSourceId: "60284cd0-85ae-8292-8363-07d4ecd2598b",
    url: "https://app.notion.com/p/3f484cd085ae80a89091e7bf1a16ba70",
  },
};

export const VIEW_MARKER = "csn-legacy-ops-dashboard-v1";

/** @typedef {{ name: string, type?: string, filter?: object, sorts?: object[] }} ViewSpec */

/** Vistas de dashboard en el hub (orden 1–5). */
export const HUB_VIEW_SPECS = /** @type {ViewSpec[]} */ ([
  { name: "CSN · 1 — Network overview", type: "table" },
  {
    name: "CSN · 2 — Needs attention (sites Pending)",
    type: "table",
    filter: { property: "Status", rich_text: { contains: "Pending" } },
  },
  {
    name: "CSN · 3 — Active sites",
    type: "table",
    filter: { property: "Status", rich_text: { contains: "Active" } },
  },
  {
    name: "CSN · 4 — Quick access (áreas CSN)",
    type: "table",
    sorts: [{ property: "Domains", direction: "ascending" }],
  },
  {
    name: "CSN · 5 — By site (dominios)",
    type: "table",
    sorts: [{ property: "Domains", direction: "ascending" }],
  },
]);

/** Bandeja en OPERATIONS CENTER (filas de resumen por sitio). */
export const OPS_VIEW_SPECS = /** @type {ViewSpec[]} */ ([
  { name: "OC · All Tasks", type: "table" },
  {
    name: "OC · In progress",
    type: "table",
    filter: { property: "Status", rich_text: { contains: "In Progress" } },
  },
  {
    name: "OC · Blocked",
    type: "table",
    filter: { property: "Status", rich_text: { contains: "Blocked" } },
  },
  {
    name: "OC · Today / due text set",
    type: "table",
    filter: {
      and: [
        { property: "Due Date", rich_text: { is_not_empty: true } },
        { property: "Status", rich_text: { does_not_contain: "Done" } },
      ],
    },
  },
  {
    name: "OC · Overdue (abiertas con fecha)",
    type: "table",
    filter: {
      and: [
        { property: "Due Date", rich_text: { is_not_empty: true } },
        { property: "Status", rich_text: { does_not_contain: "Done" } },
      ],
    },
  },
  {
    name: "OC · Upcoming (Ready)",
    type: "table",
    filter: { property: "Status", rich_text: { contains: "Ready" } },
  },
  {
    name: "OC · By Site",
    type: "table",
    sorts: [{ property: "Site", direction: "ascending" }],
  },
]);

/** Acciones enlazadas desde la bandeja (bases especializadas, sin duplicar filas). */
export const ISSUES_VIEW_SPECS = /** @type {ViewSpec[]} */ ([
  {
    name: "OC · Open incidents",
    type: "table",
    filter: {
      or: [
        { property: "Status", status: { equals: "Abierto" } },
        { property: "Status", status: { equals: "Investigando" } },
      ],
    },
  },
  {
    name: "OC · High priority",
    type: "table",
    filter: { property: "Priority", select: { equals: "Alta" } },
  },
]);

export const DEPLOY_VIEW_SPECS = /** @type {ViewSpec[]} */ ([
  {
    name: "OC · Upcoming",
    type: "table",
    filter: {
      or: [
        { property: "Status", status: { equals: "Planeada" } },
        { property: "Status", status: { equals: "En preview" } },
      ],
    },
  },
  {
    name: "OC · High priority",
    type: "table",
    filter: { property: "Priority", select: { equals: "Alta" } },
  },
  {
    name: "OC · Not verified",
    type: "table",
    filter: { property: "Verificado", checkbox: { equals: false } },
  },
]);

export const ROUTINE_VIEW_SPECS = /** @type {ViewSpec[]} */ ([
  {
    name: "OC · Pending",
    type: "table",
    filter: { property: "Status", status: { equals: "Pendiente" } },
  },
  {
    name: "OC · High priority pending",
    type: "table",
    filter: {
      and: [
        { property: "Status", status: { equals: "Pendiente" } },
        { property: "Priority", select: { equals: "Alta" } },
      ],
    },
  },
]);

export const KV_VIEW_SPECS = /** @type {ViewSpec[]} */ ([
  {
    name: "CSN · Knowledge — Vigente",
    type: "table",
    filter: { property: "Estado", select: { equals: "Vigente" } },
  },
]);

export const VIEW_PLAN = [
  { key: "hub", specs: HUB_VIEW_SPECS },
  { key: "ops", specs: OPS_VIEW_SPECS },
  { key: "issues", specs: ISSUES_VIEW_SPECS },
  { key: "deploy", specs: DEPLOY_VIEW_SPECS },
  { key: "routine", specs: ROUTINE_VIEW_SPECS },
  { key: "kv", specs: KV_VIEW_SPECS },
];

function plainDescription(desc) {
  if (!desc?.length) return "";
  return desc.map((d) => d.plain_text || "").join("");
}

export async function snapshotLegacyDescriptions(notion) {
  const out = {};
  for (const [key, meta] of Object.entries(LEGACY_OPS)) {
    const db = await notion.databases.retrieve({ database_id: meta.databaseId });
    out[key] = plainDescription(db.description);
  }
  return out;
}

export async function listViewsDetailed(notion, databaseId) {
  const listed = await notion.views.list({ database_id: databaseId });
  const views = [];
  for (const v of listed.results || []) {
    const vr = await notion.views.retrieve({ view_id: v.id });
    views.push({ id: vr.id, name: vr.name, type: vr.type, filter: vr.filter ?? null });
  }
  return views;
}

export async function ensureViewSpecs(notion, meta, specs, existingNames) {
  const created = [];
  const skipped = [];
  for (const spec of specs) {
    if (existingNames.has(spec.name)) {
      skipped.push(spec.name);
      continue;
    }
    const body = {
      database_id: meta.databaseId,
      data_source_id: meta.dataSourceId,
      name: spec.name,
      type: spec.type || "table",
    };
    if (spec.filter) body.filter = spec.filter;
    if (spec.sorts) body.sorts = spec.sorts;
    const view = await notion.views.create(body);
    created.push({ id: view.id, name: view.name, url: view.url });
    existingNames.add(spec.name);
    await new Promise((r) => setTimeout(r, 350));
  }
  return { created, skipped };
}

export async function applyLegacyOpsCentralization(notion, { dryRun = false } = {}) {
  const countsBefore = await legacyRowCounts(notion);
  const descriptionsBefore = await snapshotLegacyDescriptions(notion);
  const viewResults = {};

  for (const { key, specs } of VIEW_PLAN) {
    const meta = LEGACY_OPS[key];
    const viewsBefore = await listViewsDetailed(notion, meta.databaseId);
    const names = new Set(viewsBefore.map((v) => v.name));
    if (dryRun) {
      viewResults[key] = {
        viewsBefore: viewsBefore.length,
        wouldCreate: specs.filter((s) => !names.has(s.name)).map((s) => s.name),
      };
      continue;
    }
    const { created, skipped } = await ensureViewSpecs(notion, meta, specs, names);
    const viewsAfter = await listViewsDetailed(notion, meta.databaseId);
    viewResults[key] = {
      viewsBefore: viewsBefore.length,
      viewsAfter: viewsAfter.length,
      created,
      skipped,
      viewNames: viewsAfter.map((v) => v.name),
    };
  }

  const countsAfter = dryRun ? countsBefore : await legacyRowCounts(notion);
  const descriptionsAfter = dryRun ? descriptionsBefore : await snapshotLegacyDescriptions(notion);

  const descriptionsUnchanged = Object.keys(descriptionsBefore).every(
    (k) => descriptionsBefore[k] === descriptionsAfter[k],
  );

  return {
    marker: VIEW_MARKER,
    at: new Date().toISOString(),
    dryRun,
    countsBefore,
    countsAfter,
    legacyIntegrityOk: JSON.stringify(countsBefore) === JSON.stringify(countsAfter),
    descriptionsUnchanged,
    descriptionsBefore,
    descriptionsAfter,
    viewResults,
    apiLimits: {
      fullPageDatabaseBlocks:
        "Las seis URLs son bases full-page: blocks.children.append en database_id devuelve «Block does not support children».",
      unifiedTray:
        "La bandeja unificada se implementa como vistas OC · en OPERATIONS CENTER más vistas OC · en issues/deploy/routine (misma fuente de verdad, sin filas duplicadas).",
      overdueDates:
        "Due Date en OPERATIONS CENTER es rich_text (no date): no hay filtro fiable «vencido hoy» vía API.",
    },
  };
}
