#!/usr/bin/env node
/**
 * Verifica enlaces clicables y bloques code en guías Notion publicadas.
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { Client } from "@notionhq/client";
import { loadManifest } from "../csn-os/lib/manifest.mjs";
import { verifyRootHubFirstBlock } from "../csn-os/lib/notion-root-hub.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

async function scanPage(notion, pageId) {
  let cursor;
  let links = 0;
  let codes = 0;
  let literalMdLink = 0;
  const re = /\[[^\]]+\]\(https?:\/\//;
  do {
    const res = await notion.blocks.children.list({ block_id: pageId, page_size: 100, start_cursor: cursor });
    for (const b of res.results) {
      if (b.type === "code") codes++;
      const rts = b[b.type]?.rich_text || [];
      for (const t of rts) {
        if (t.text?.link?.url) links++;
        if (re.test(t.plain_text || "")) literalMdLink++;
      }
    }
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return { links, codes, literalMdLink };
}

async function main() {
  const notion = new Client({ auth: process.env.NOTION_API_KEY || process.env.NOTION_TOKEN });
  const m = loadManifest();
  const hub = await verifyRootHubFirstBlock(notion, m.rootPageId);
  const pages = m.launchGuide7Day?.pages || [];
  const perDay = {};
  for (const p of pages) {
    perDay[p.day] = await scanPage(notion, p.pageId);
  }
  const hubScan = await scanPage(notion, m.rootPageId);

  const checks = {
    hubOk: hub.ok && hub.titleOk,
    hubLinks: hubScan.links,
    eachDayHasCode: pages.every((p) => (perDay[p.day]?.codes || 0) >= 1),
    noLiteralMdLinks: Object.values(perDay).every((s) => s.literalMdLink === 0) && hubScan.literalMdLink === 0,
    minLinksPerDay: Object.values(perDay).every((s) => s.links >= 2),
  };
  checks.allPass =
    checks.hubOk &&
    checks.eachDayHasCode &&
    checks.noLiteralMdLinks &&
    checks.minLinksPerDay;

  const report = { at: new Date().toISOString(), perDay, hubScan, checks };
  const out = path.join(__dirname, "../docs/csn-7day-notion-publish-verify.json");
  fs.writeFileSync(out, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  process.exit(checks.allPass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
