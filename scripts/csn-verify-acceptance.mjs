#!/usr/bin/env node
/** Pruebas de aceptación read-only contra Notion remoto. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { loadManifest } from "../csn-os/lib/manifest.mjs";
import { getNotion, legacyRowCounts, queryByRichText } from "../csn-os/lib/notion.mjs";
import { verifyRootHubFirstBlock } from "../csn-os/lib/notion-root-hub.mjs";
import {
  DUPLICATE_ROOT_ID,
  PRIMARY_ENTRY_TITLE,
  verifyPrimaryEntryFingerprint,
} from "../csn-os/lib/primary-entry-page.mjs";

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), "../.env") });

const DEMO_TASK_EXT = "csn:taskrun:csn:run:demo-qa-live-offline:demo-live-offline-v1";

async function main() {
  const manifest = loadManifest();
  const notion = getNotion();
  const rootId = manifest.rootPageId;
  const out = path.join(path.dirname(fileURLToPath(import.meta.url)), "../docs/csn-acceptance-report.json");

  let legacy;
  try {
    await notion.pages.retrieve({ page_id: rootId });
  } catch (e) {
    const blocked = {
      at: new Date().toISOString(),
      blocked: true,
      code: e.code,
      message: e.message,
      primaryPage: { id: rootId, expectedTitle: PRIMARY_ENTRY_TITLE },
      hint:
        "Notion API sin acceso al stack canónico. Comparte Cam Sites — SOP System + 14 DB con Cursor Connection.",
      acceptance: { allPass: false, apiAccess: false },
    };
    fs.writeFileSync(out, JSON.stringify(blocked, null, 2));
    console.log(JSON.stringify(blocked, null, 2));
    process.exit(2);
  }

  legacy = await legacyRowCounts(notion);

  const page = await notion.pages.retrieve({ page_id: rootId });
  let title = "";
  for (const v of Object.values(page.properties || {})) {
    if (v.type === "title") title = v.title.map((t) => t.plain_text).join("");
  }

  const hub = await verifyRootHubFirstBlock(notion, rootId);
  const fp = await verifyPrimaryEntryFingerprint(notion, rootId);

  const dup = await notion.pages.retrieve({ page_id: DUPLICATE_ROOT_ID });
  let dupTitle = "";
  for (const v of Object.values(dup.properties || {})) {
    if (v.type === "title") dupTitle = v.title.map((t) => t.plain_text).join("");
  }

  const task = (await queryByRichText(notion, manifest.databases.tasks.dataSourceId, "External ID", DEMO_TASK_EXT))[0];
  const promptUrl = task?.properties["Prompt Notion URL"]?.url;
  let promptParent = null;
  if (promptUrl) {
    const promptId = promptUrl.split("-").pop()?.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5");
    // resolve from task children
    const kids = await notion.blocks.children.list({ block_id: task.id, page_size: 20 });
    const child = kids.results.find((b) => b.type === "child_page");
    if (child) {
      const pp = await notion.pages.retrieve({ page_id: child.id });
      promptParent = { taskId: task.id, promptPageId: child.id, url: pp.url };
    }
  }

  const threeTasks = [
    DEMO_TASK_EXT,
    `csn:taskrun:csn:run:demo-qa-live-offline:p05:02`,
    `csn:taskrun:csn:run:demo-qa-live-offline:p06:01`,
  ];
  const prompts = [];
  for (const ext of threeTasks) {
    const row = (await queryByRichText(notion, manifest.databases.tasks.dataSourceId, "External ID", ext))[0];
    if (!row) continue;
    prompts.push({
      ext,
      title: row.properties.Task?.title?.[0]?.plain_text,
      notionUrl: row.properties["Prompt Notion URL"]?.url,
      localPath: row.properties["Ruta prompt local"]?.rich_text?.[0]?.plain_text,
    });
  }

  const report = {
    at: new Date().toISOString(),
    primaryPage: { id: rootId, title, url: page.url, expectedTitle: PRIMARY_ENTRY_TITLE },
    navigation: { hubOk: hub.ok, hubPreview: hub.calloutPreview, dbFingerprint: fp },
    duplicate: { id: DUPLICATE_ROOT_ID, title: dupTitle, disambiguated: dupTitle.includes("OBSOLETO") },
    promptChain: promptParent,
    threePrompts: prompts,
    legacyCounts: legacy,
    acceptance: {
      nav1_title: title === PRIMARY_ENTRY_TITLE,
      nav2_centroAcciones: hub.ok,
      nav3_db14: fp.match,
      nav4_promptFromTask: Boolean(promptUrl),
      nav5_duplicateNamed: dupTitle.includes("OBSOLETO"),
      gen_threePrompts: prompts.length >= 3 && prompts.every((p) => p.notionUrl),
      gen_urlsMatchTasks: prompts.every((p) => p.notionUrl?.startsWith("https://")),
    },
  };

  report.acceptance.allPass = Object.entries(report.acceptance)
    .filter(([k]) => k !== "allPass")
    .every(([, v]) => v === true);

  fs.writeFileSync(out, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.acceptance.allPass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
