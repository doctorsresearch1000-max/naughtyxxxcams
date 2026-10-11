#!/usr/bin/env node
/**
 * Repair CSN Operations Hub: real inline DBs on sections, working hub navigation.
 */
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { Client } from "@notionhq/client";
import { LEGACY_OPS } from "../csn-os/lib/legacy-ops-centralize.mjs";
import { legacyRowCounts } from "../csn-os/lib/notion.mjs";

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), "../.env") });

const HUB_ID = "3f684cd0-85ae-81e1-b204-fca74513f38a";
const ARCHIVE_ID = "3f684cd0-85ae-815c-bc99-ee597e0fbf45";

const SECTIONS = [
  { title: "INCIDENTS", pageId: "3f684cd0-85ae-8139-b41d-fef080bd0709", dbKey: "issues" },
  { title: "DEPLOYMENTS", pageId: "3f684cd0-85ae-8121-810a-d498bed21190", dbKey: "deploy" },
  { title: "KNOWLEDGE BASE", pageId: "3f684cd0-85ae-811c-8be7-d59faabb91ed", dbKey: "kv" },
  { title: "ROUTINE & MAINTENANCE", pageId: "3f684cd0-85ae-81e1-8b7a-d9f626d02ad8", dbKey: "routine" },
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

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

async function deleteEmbedsOnly(notion, pageId) {
  const removed = [];
  for (const b of await listBlocks(notion, pageId)) {
    if (b.type === "embed") {
      await notion.blocks.delete({ block_id: b.id });
      removed.push(b.id);
      await sleep(150);
    }
  }
  return removed;
}

async function ensureInlineDb(notion, dbKey, pageId) {
  const meta = LEGACY_OPS[dbKey];
  const db = await notion.databases.retrieve({ database_id: meta.databaseId });
  if (db.parent?.page_id === pageId && db.is_inline) {
    return { action: "already_inline", databaseId: db.id, rows: null };
  }
  const updated = await notion.databases.update({
    database_id: meta.databaseId,
    parent: { type: "page_id", page_id: pageId },
    is_inline: true,
  });
  const ds = updated.data_sources?.[0]?.id;
  const q = await notion.dataSources.query({ data_source_id: ds, page_size: 100 });
  return { action: "moved_inline", databaseId: updated.id, rows: q.results.length, parent: updated.parent };
}

async function rebuildHub(notion, sectionUrls) {
  const blocks = await listBlocks(notion, HUB_ID);
  for (const b of blocks) {
    if (b.type === "child_page") continue;
    try {
      await notion.blocks.delete({ block_id: b.id });
      await sleep(120);
    } catch {
      /* skip */
    }
  }

  const archive = await notion.pages.retrieve({ page_id: ARCHIVE_ID });
  const children = [
    {
      type: "callout",
      callout: {
        icon: { type: "emoji", emoji: "🧭" },
        rich_text: [
          {
            type: "text",
            text: {
              content:
                "Choose a section below. Each opens a dedicated workspace with a live database — not a link to OPERATIONS CENTER.",
            },
          },
        ],
      },
    },
    ...SECTIONS.map((s) => ({
      type: "link_to_page",
      link_to_page: { type: "page_id", page_id: s.pageId },
    })),
    { type: "divider", divider: {} },
    {
      type: "paragraph",
      paragraph: {
        rich_text: [
          {
            type: "text",
            text: {
              content: "Advanced: consolidated OPS mirror database (24 tasks + 4 site summaries)",
              link: { url: LEGACY_OPS.ops.url },
            },
          },
        ],
      },
    },
    {
      type: "paragraph",
      paragraph: {
        rich_text: [
          {
            type: "text",
            text: { content: "Site registry: ", link: null },
          },
          {
            type: "text",
            text: { content: "CAM SITE NETWORK OS", link: { url: LEGACY_OPS.hub.url } },
          },
        ],
      },
    },
    {
      type: "paragraph",
      paragraph: {
        rich_text: [
          {
            type: "text",
            text: { content: "Legacy source archive (read-only)", link: { url: archive.url } },
          },
        ],
      },
    },
  ];

  await notion.blocks.children.append({ block_id: HUB_ID, children });
  return { archiveUrl: archive.url, sectionUrls };
}

async function main() {
  const notion = new Client({ auth: process.env.NOTION_API_KEY });
  const report = {
    diagnosis: {
      embedBlocksFailForSelfHostedNotionUrls:
        "Embed blocks pointed at app.notion.com database view URLs; these often render as broken or non-interactive for the workspace user.",
      hubHadNoLinkToPageNavigation:
        "Section child pages existed in the sidebar only; hub body used text links and embeds instead of link_to_page blocks.",
      knowledgeBaseWasCorrect:
        "KNOWLEDGE VAULT already inline via databases.update (child_database block) — pattern reused for other sections.",
      apiCannotCreateLinkedOpsViews:
        "Notion API cannot append linked views of OPERATIONS CENTER on a page; sections use authoritative legacy source DBs inline (same records, original IDs).",
    },
    countsBefore: await legacyRowCounts(notion),
    sections: {},
  };

  for (const s of SECTIONS) {
    report.sections[s.title] = {
      pageUrl: (await notion.pages.retrieve({ page_id: s.pageId })).url,
      embedsRemoved: await deleteEmbedsOnly(notion, s.pageId),
      db: await ensureInlineDb(notion, s.dbKey, s.pageId),
    };
  }

  const sectionUrls = {};
  for (const s of SECTIONS) {
    sectionUrls[s.title] = (await notion.pages.retrieve({ page_id: s.pageId })).url;
  }

  const hubPage = await notion.pages.retrieve({ page_id: HUB_ID });
  report.hub = {
    url: hubPage.url,
    rebuild: await rebuildHub(notion, sectionUrls),
    sectionUrls,
  };

  report.countsAfter = await legacyRowCounts(notion);
  const opsQ = await notion.dataSources.query({
    data_source_id: LEGACY_OPS.ops.dataSourceId,
    page_size: 100,
  });
  report.opsRowCount = opsQ.results.length;
  report.kvDatabaseId = LEGACY_OPS.kv.databaseId;
  report.manualUi = [
    "Favorite «CSN — Operations Hub» in the Notion sidebar.",
    "Optional: on INCIDENTS/DEPLOYMENTS/ROUTINE pages, pick a saved view in the inline database header (source DB native views).",
    "To add OPERATIONS CENTER filtered linked views on section pages: Notion UI → /linked view of database → OPERATIONS CENTER → pick CSN · Open Incidents (etc.). API cannot create these blocks.",
  ];

  report.ok =
    report.opsRowCount === 28 &&
    report.countsAfter.issues === 8 &&
    report.countsAfter.deploy === 7 &&
    report.countsAfter.routine === 9 &&
    report.countsAfter.kv === 1;

  console.log(JSON.stringify(report, null, 2));
  process.exit(report.ok ? 0 : 1);
}

main().catch((e) => {
  console.error(e.body?.message || e.message || e);
  process.exit(1);
});
