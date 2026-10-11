#!/usr/bin/env node
/** Read-only Phase 3 verification for CSN Operations Hub + four sections. */
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { Client } from "@notionhq/client";
import { LEGACY_OPS } from "../csn-os/lib/legacy-ops-centralize.mjs";
import { legacyRowCounts } from "../csn-os/lib/notion.mjs";

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), "../.env") });

const HUB_ID = "3f684cd0-85ae-81e1-b204-fca74513f38a";
const SECTIONS = [
  { title: "INCIDENTS", pageId: "3f684cd0-85ae-8139-b41d-fef080bd0709", dbKey: "issues" },
  { title: "DEPLOYMENTS", pageId: "3f684cd0-85ae-8121-810a-d498bed21190", dbKey: "deploy" },
  { title: "KNOWLEDGE BASE", pageId: "3f684cd0-85ae-811c-8be7-d59faabb91ed", dbKey: "kv" },
  { title: "ROUTINE & MAINTENANCE", pageId: "3f684cd0-85ae-81e1-8b7a-d9f626d02ad8", dbKey: "routine" },
];

async function listBlocks(notion, id) {
  const out = [];
  let c;
  do {
    const r = await notion.blocks.children.list({ block_id: id, page_size: 100, start_cursor: c });
    out.push(...r.results);
    c = r.has_more ? r.next_cursor : undefined;
  } while (c);
  return out;
}

async function main() {
  const notion = new Client({ auth: process.env.NOTION_API_KEY });
  const report = { counts: await legacyRowCounts(notion) };

  const hubPage = await notion.pages.retrieve({ page_id: HUB_ID });
  const hubBlocks = await listBlocks(notion, HUB_ID);
  report.hub = {
    url: hubPage.url,
    linkToPageTargets: hubBlocks.filter((b) => b.type === "link_to_page").map((b) => b.link_to_page?.page_id),
    embedCount: hubBlocks.filter((b) => b.type === "embed").length,
    childDatabaseOnHub: hubBlocks.filter((b) => b.type === "child_database").length,
  };

  report.sections = {};
  for (const s of SECTIONS) {
    const page = await notion.pages.retrieve({ page_id: s.pageId });
    const blocks = await listBlocks(notion, s.pageId);
    const db = await notion.databases.retrieve({ database_id: LEGACY_OPS[s.dbKey].databaseId });
    const ds = db.data_sources?.[0]?.id;
    const q = await notion.dataSources.query({ data_source_id: ds, page_size: 100 });
    report.sections[s.title] = {
      url: page.url,
      embedCount: blocks.filter((b) => b.type === "embed").length,
      dbId: db.id,
      parentMatches: db.parent?.page_id === s.pageId,
      inline: db.is_inline,
      inTrash: db.in_trash,
      rows: q.results.length,
    };
  }

  const opsQ = await notion.dataSources.query({
    data_source_id: LEGACY_OPS.ops.dataSourceId,
    page_size: 100,
  });
  report.ops = { url: LEGACY_OPS.ops.url, rows: opsQ.results.length };

  report.ok =
    report.ops.rows === 28 &&
    report.counts.issues === 8 &&
    report.counts.deploy === 7 &&
    report.counts.routine === 9 &&
    report.counts.kv === 1 &&
    report.hub.linkToPageTargets.length === 4 &&
    SECTIONS.every((s) => report.hub.linkToPageTargets.includes(s.pageId)) &&
    report.hub.embedCount === 0 &&
    report.hub.childDatabaseOnHub === 0 &&
    Object.values(report.sections).every((x) => x.embedCount === 0 && x.parentMatches && x.inline && !x.inTrash) &&
    report.sections["KNOWLEDGE BASE"].dbId === LEGACY_OPS.kv.databaseId;

  console.log(JSON.stringify(report, null, 2));
  process.exit(report.ok ? 0 : 1);
}

main().catch((e) => {
  console.error(e.body?.message || e.message || e);
  process.exit(1);
});
