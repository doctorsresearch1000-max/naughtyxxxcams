#!/usr/bin/env node
/**
 * Wire OPERATIONS CENTER (user entry) to the four section pages + Operations Hub.
 * Full-page databases cannot take link_to_page blocks via API; uses description mentions + hub body links.
 */
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { Client } from "@notionhq/client";
import { LEGACY_OPS } from "../csn-os/lib/legacy-ops-centralize.mjs";

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), "../.env") });

const MARKER = "csn-ops-entry-nav-v1";
const HUB_PAGE_ID = "3f684cd0-85ae-81e1-b204-fca74513f38a";
const OBSOLETO_PAGE_ID = "3f684cd0-85ae-8115-841a-c9dc40395c58";

const SECTIONS = [
  { title: "INCIDENTS", pageId: "3f684cd0-85ae-8139-b41d-fef080bd0709" },
  { title: "DEPLOYMENTS", pageId: "3f684cd0-85ae-8121-810a-d498bed21190" },
  { title: "KNOWLEDGE BASE", pageId: "3f684cd0-85ae-811c-8be7-d59faabb91ed" },
  { title: "ROUTINE & MAINTENANCE", pageId: "3f684cd0-85ae-81e1-8b7a-d9f626d02ad8" },
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

function pageTitle(page) {
  return page.properties?.title?.title?.map((t) => t.plain_text).join("") || "";
}

function descriptionText(desc) {
  return (desc || []).map((x) => x.plain_text || "").join("");
}

async function diagnose(notion) {
  const opsDb = await notion.databases.retrieve({ database_id: LEGACY_OPS.ops.databaseId });
  const hubPage = await notion.pages.retrieve({ page_id: HUB_PAGE_ID });
  const hubBlocks = await listBlocks(notion, HUB_PAGE_ID);
  const linkTargets = hubBlocks
    .filter((b) => b.type === "link_to_page")
    .map((b) => b.link_to_page?.page_id);

  let appendProbe = "not_tried";
  try {
    await notion.blocks.children.append({
      block_id: LEGACY_OPS.ops.databaseId,
      children: [{ type: "paragraph", paragraph: { rich_text: [{ type: "text", text: { content: "probe" } }] } }],
    });
    appendProbe = "unexpected_ok";
  } catch (e) {
    appendProbe = e.message?.includes("does not support children") ? "block_does_not_support_children" : e.message;
  }

  const sectionUrls = {};
  for (const s of SECTIONS) {
    sectionUrls[s.title] = (await notion.pages.retrieve({ page_id: s.pageId })).url;
  }

  return {
    userEntryOperationsCenter: {
      kind: "full_page_database",
      id: opsDb.id,
      title: opsDb.title?.map((t) => t.plain_text).join(""),
      url: opsDb.url,
      parent: opsDb.parent,
      descriptionExcerpt: descriptionText(opsDb.description).slice(0, 200),
      topLevelBlocks: (await listBlocks(notion, LEGACY_OPS.ops.databaseId)).length,
      blocksChildrenAppend: appendProbe,
    },
    operationsHubPage: {
      id: hubPage.id,
      title: pageTitle(hubPage),
      url: hubPage.url,
      parent: hubPage.parent,
      underObsoleto: hubPage.parent?.page_id === OBSOLETO_PAGE_ID,
      linkToPageCount: linkTargets.length,
      linkToPageTargets: linkTargets,
      childPageCount: hubBlocks.filter((b) => b.type === "child_page").length,
    },
    sectionUrls,
    conclusion:
      "Users who favorite OPERATIONS CENTER open the database URL, not CSN — Operations Hub (under OBSOLETO). link_to_page blocks exist only on the Hub page.",
  };
}

function buildOpsDescription(sectionPages, hubPage) {
  const desc = [
    {
      type: "text",
      text: {
        content: `${MARKER}\nControl operativo de todos los sitios de CAM SITE NETWORK OS.\n`,
      },
    },
    {
      type: "text",
      text: {
        content:
          "▸ Secciones operativas (enlaces nativos a página — abrir desde aquí si entraste por OPERATIONS CENTER):\n",
      },
    },
  ];
  for (const s of sectionPages) {
    desc.push({ type: "text", text: { content: `${s.title}: ` } });
    desc.push({ type: "mention", mention: { type: "page", page: { id: s.pageId } } });
    desc.push({ type: "text", text: { content: "\n" } });
  }
  desc.push({
    type: "text",
    text: { content: "\n▸ Navegación con link_to_page (misma sección, página dedicada): " },
  });
  desc.push({ type: "mention", mention: { type: "page", page: { id: hubPage.id } } });
  desc.push({
    type: "text",
    text: { content: `\n(${hubPage.url})\n` },
  });
  return desc;
}

async function ensureOpsDescription(notion, sectionPages, hubPage) {
  const db = await notion.databases.retrieve({ database_id: LEGACY_OPS.ops.databaseId });
  const current = descriptionText(db.description);
  if (current.includes(MARKER)) {
    return { action: "already_set", url: db.url };
  }
  const updated = await notion.databases.update({
    database_id: LEGACY_OPS.ops.databaseId,
    description: buildOpsDescription(sectionPages, hubPage),
  });
  return { action: "updated", url: updated.url };
}

async function rebuildHubNav(notion, hubPage, sectionPages) {
  const blocks = await listBlocks(notion, HUB_PAGE_ID);
  for (const b of blocks) {
    if (b.type === "child_page") continue;
    try {
      await notion.blocks.delete({ block_id: b.id });
      await sleep(120);
    } catch {
      /* skip */
    }
  }

  const opsUrl = LEGACY_OPS.ops.url;
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
                "Section navigation for OPERATIONS CENTER. Open a section below (native page links). The consolidated task table stays at ",
            },
          },
          {
            type: "text",
            text: { content: "OPERATIONS CENTER", link: { url: opsUrl } },
          },
          { type: "text", text: { content: "." } },
        ],
      },
    },
    ...sectionPages.map((s) => ({
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
              content: "← Back to OPERATIONS CENTER (all tasks & site summaries)",
              link: { url: opsUrl },
            },
          },
        ],
      },
    },
  ];

  await notion.blocks.children.append({ block_id: HUB_PAGE_ID, children });
  return { hubUrl: hubPage.url, sectionCount: sectionPages.length };
}

async function verify(notion, sectionPages) {
  const opsDb = await notion.databases.retrieve({ database_id: LEGACY_OPS.ops.databaseId });
  const hubBlocks = await listBlocks(notion, HUB_PAGE_ID);
  const linkTargets = hubBlocks.filter((b) => b.type === "link_to_page").map((b) => b.link_to_page?.page_id);
  const mentions = (opsDb.description || [])
    .filter((x) => x.type === "mention" && x.mention?.type === "page")
    .map((x) => x.mention.page.id);

  const hubPage = await notion.pages.retrieve({ page_id: HUB_PAGE_ID });
  const out = {
    opsUrl: opsDb.url,
    opsDescriptionHasMarker: descriptionText(opsDb.description).includes(MARKER),
    opsMentionedSectionIds: mentions,
    hubUrl: hubPage.url,
    hubLinkToPageTargets: linkTargets,
    ok:
      descriptionText(opsDb.description).includes(MARKER) &&
      SECTIONS.every((s) => mentions.includes(s.pageId)) &&
      linkTargets.length === 4 &&
      SECTIONS.every((s) => linkTargets.includes(s.pageId)),
    sectionUrls: {},
  };
  for (const s of sectionPages) {
    out.sectionUrls[s.title] = (await notion.pages.retrieve({ page_id: s.pageId })).url;
  }
  return out;
}

async function main() {
  const notion = new Client({ auth: process.env.NOTION_API_KEY });
  const report = { at: new Date().toISOString(), marker: MARKER };

  report.diagnosis = await diagnose(notion);

  const hubPage = await notion.pages.retrieve({ page_id: HUB_PAGE_ID });
  const sectionPages = SECTIONS.map((s) => ({ ...s, url: report.diagnosis.sectionUrls[s.title] }));

  report.opsDescription = await ensureOpsDescription(notion, sectionPages, hubPage);
  report.hubNav = await rebuildHubNav(notion, hubPage, sectionPages);
  report.verification = await verify(notion, sectionPages);

  report.userMustOpen = {
    primaryEntryWhenUsingOperationsCenterDb: report.verification.opsUrl,
    sectionNavigationViaDescriptionMentions: "Under the OPERATIONS CENTER title (database description)",
    alternateFullLinkToPageNav: report.verification.hubUrl,
    manualUiIfNeeded: [
      "Share the parent page that hosts CAM SITE NETWORK OS + OPERATIONS CENTER with the integration if you need API edits on that container (block_id parent is not shared today).",
      "In Notion UI: drag «CSN — Operations Hub» out of «OBSOLETO» to sidebar top level (API cannot reparent to workspace).",
      "Optional: favorite OPERATIONS CENTER and use description page mentions, or favorite CSN — Operations Hub for link_to_page cards.",
    ],
  };

  console.log(JSON.stringify(report, null, 2));
  process.exit(report.verification.ok ? 0 : 1);
}

main().catch((e) => {
  console.error(e.body?.message || e.message || e);
  process.exit(1);
});
