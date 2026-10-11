#!/usr/bin/env node
/** Inventario local + remoto (si la integración tiene acceso) del contenido CSN. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { loadManifest } from "../csn-os/lib/manifest.mjs";
import { getNotion, getDb, legacyRowCounts } from "../csn-os/lib/notion.mjs";
import {
  auditPhaseSpecsLocal,
  auditTaskPromptOverrides,
  classifyRowLocal,
  KNOWN_QA_LAUNCH_KEYS,
} from "../csn-os/lib/content-audit-local.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const OUT_JSON = path.join(__dirname, "../docs/csn-content-audit-raw.json");

function rt(page, name) {
  const p = page.properties?.[name];
  if (!p) return "";
  if (p.type === "rich_text") return p.rich_text.map((t) => t.plain_text).join("");
  if (p.type === "title") return p.title.map((t) => t.plain_text).join("");
  return "";
}

async function probeNotionAccess(notion, rootId) {
  try {
    await notion.pages.retrieve({ page_id: rootId });
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      code: e.code,
      message: e.message,
      hint:
        "Comparte la página «Cam Sites — SOP System» y las 14 bases CSN con la integración «Cursor Connection».",
    };
  }
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

async function auditRemote(notion, manifest) {
  const sitesDb = getDb(manifest, "csnSites");
  const runsDb = getDb(manifest, "projectRuns");
  const sopDb = getDb(manifest, "sopVersions");

  const sites = await queryAll(notion, sitesDb.dataSourceId);
  const runs = await queryAll(notion, runsDb.dataSourceId);
  const sopRows = await queryAll(notion, sopDb.dataSourceId);

  const siteAudit = sites.map((s) => {
    const name = rt(s, "Site Name");
    const lk = rt(s, "Launch Key");
    const ext = rt(s, "External ID");
    const rc = s.properties["Record Class"]?.select?.name || "";
    const cls = classifyRowLocal({ siteName: name, launchKey: lk, externalId: ext, recordClass: rc });
    return {
      id: s.id,
      url: s.url,
      siteName: name,
      launchKey: lk,
      externalId: ext,
      recordClass: rc,
      classification: cls?.category || (rc === "Production" ? "Operativo" : "Revisar"),
      classificationReason: cls?.reason || null,
      needsQaTag: Boolean(cls && rc !== "QA test-only"),
    };
  });

  const runAudit = runs.map((r) => {
    const name = rt(r, "Run Name");
    const lk = rt(r, "Launch Key");
    const ext = rt(r, "External ID");
    const runType = r.properties["Run Type"]?.select?.name || "";
    const qa =
      runType.includes("QA") ||
      KNOWN_QA_LAUNCH_KEYS.includes(lk) ||
      /^e2e-qa-/i.test(lk) ||
      /DEMO QA|E2E QA|FICTIONAL/i.test(name);
    return {
      id: r.id,
      url: r.url,
      runName: name,
      launchKey: lk,
      externalId: ext,
      runType,
      classification: qa ? "QA/demo" : "Operativo / revisar",
    };
  });

  const phaseSpecs = sopRows
    .filter((row) => {
      const t = row.properties.Name?.title?.[0]?.plain_text || "";
      return /Phase \d+ Specification/i.test(t);
    })
    .map((row) => {
      const title = row.properties.Name?.title?.[0]?.plain_text || "";
      const repoPath = rt(row, "Repository Path");
      const artifactType = row.properties["Artifact Type"]?.select?.name || "";
      return {
        id: row.id,
        url: row.url,
        title,
        artifactType,
        repositoryPath: repoPath,
        classification: "Documentación de fase (catálogo — no prompt Cursor)",
        notionBodyAudited: false,
        note: "Cuerpo en Notion puede estar vacío si solo se materializó metadata; fuente: csn-os/phase-specs/",
      };
    });

  return {
    sites: siteAudit,
    projectRuns: runAudit,
    phaseSpecificationRows: phaseSpecs,
    counts: {
      sites: sites.length,
      runs: runs.length,
      sopRows: sopRows.length,
      qaSitesNeedingTag: siteAudit.filter((s) => s.needsQaTag).length,
    },
  };
}

async function main() {
  const manifest = loadManifest();
  const notion = getNotion();
  const local = {
    phaseSpecs: auditPhaseSpecsLocal(),
    taskPromptOverrides: auditTaskPromptOverrides(),
    knownQaLaunchKeys: KNOWN_QA_LAUNCH_KEYS,
  };

  const access = await probeNotionAccess(notion, manifest.rootPageId);
  const report = {
    at: new Date().toISOString(),
    canonicalRootId: manifest.rootPageId,
    runbookPageId: manifest.runbookPageId,
    panelPageId: manifest.panelPageId,
    duplicateRootId: "3f684cd0-85ae-8115-841a-c9dc40395c58",
    notionAccess: access,
    local,
    remote: null,
    legacyCounts: null,
    staticInventory: {
      note: "IDs de referencia de auditoría previa (2026-10-11) cuando API respondía",
      priorAuditFile: "scripts/notion-csn-canonical-audit.json",
      qaProjects: [
        {
          launchKey: "demo-qa-live-offline",
          runExternalId: "csn:run:demo-qa-live-offline",
          label: "DEMO QA — LIVE/OFFLINE Cam Profiles",
        },
        {
          launchKey: "fictional-sandbox-prompt-qa",
          runExternalId: "csn:run:fictional-sandbox-prompt-qa",
          label: "FICTIONAL-SANDBOX-PROMPT-QA",
        },
        {
          launchKey: "qa-sandbox-notion-launch-v1",
          runExternalId: "csn:qa-sandbox-notion:launch:v1",
          label: "QA-SANDBOX-NOTION",
        },
        {
          launchKey: "e2e-qa-automation",
          runExternalId: "csn:run:e2e-qa-automation",
          label: "E2E QA automation (recomendado post-saneamiento)",
        },
      ],
      supportPages: [
        { name: "12-Phase Operational Runbooks", id: manifest.runbookPageId },
        { name: "CSN OS Panel", id: manifest.panelPageId },
        { name: "blocked-planning template", id: "csn:prompttpl:v1:blocked-planning", path: "csn-os/prompt-templates/blocked-planning.md" },
        { name: "execution-phase template", id: "csn:prompttpl:v1:execution-phase", path: "csn-os/prompt-templates/execution-phase.md" },
      ],
    },
  };

  if (access.ok) {
    report.legacyCounts = await legacyRowCounts(notion);
    report.remote = await auditRemote(notion, manifest);
  }

  fs.writeFileSync(OUT_JSON, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ written: OUT_JSON, notionAccess: access }, null, 2));
  process.exit(access.ok ? 0 : 2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
