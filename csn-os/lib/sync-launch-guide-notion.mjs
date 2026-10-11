import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadManifest } from "./manifest.mjs";
import { getNotion } from "./notion.mjs";
import { deleteAllBlocks, appendMarkdownAsBlocks } from "./notion-markdown-blocks.mjs";
import { buildAllDays, DAY_PLAN } from "./launch-guide-builder.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GUIDE_DIR = path.join(__dirname, "../launch-guide");
const PAGE_TITLE_PREFIX = "Guía 7 días — Día";

async function findChildPageByTitle(notion, parentId, title) {
  let cursor;
  do {
    const res = await notion.blocks.children.list({ block_id: parentId, page_size: 100, start_cursor: cursor });
    for (const b of res.results) {
      if (b.type !== "child_page") continue;
      const p = await notion.pages.retrieve({ page_id: b.id });
      let t = "";
      for (const v of Object.values(p.properties || {})) {
        if (v.type === "title") t = v.title.map((x) => x.plain_text).join("");
      }
      if (t === title) return { id: b.id, url: p.url };
    }
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return null;
}

export async function syncLaunchGuidePages(manifest) {
  const notion = getNotion();
  const rootId = manifest.rootPageId;
  buildAllDays(GUIDE_DIR);

  const pages = [];
  for (const d of DAY_PLAN) {
    const title = `${PAGE_TITLE_PREFIX} ${d.day}: ${d.title}`;
    const md = fs.readFileSync(path.join(GUIDE_DIR, `dia-${String(d.day).padStart(2, "0")}.md`), "utf8");

    let page = await findChildPageByTitle(notion, rootId, title);
    if (!page) {
      const created = await notion.pages.create({
        parent: { page_id: rootId },
        properties: { title: { title: [{ text: { content: title } }] } },
        icon: { type: "emoji", emoji: d.day === 7 ? "🏁" : "📅" },
      });
      page = { id: created.id, url: created.url };
    }

    await deleteAllBlocks(notion, page.id, false);
    await appendMarkdownAsBlocks(notion, page.id, md.slice(0, 45000));
    pages.push({ day: d.day, title, pageId: page.id, url: page.url });
  }

  return { pages, guideDir: GUIDE_DIR };
}
