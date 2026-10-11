import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadManifest } from "./manifest.mjs";
import { getNotion } from "./notion.mjs";
import { deleteAllBlocks, markdownToNotionBlocks, appendNotionBlocks } from "./notion-markdown-blocks.mjs";
import { buildAllDays, DAY_PLAN } from "./launch-guide-builder.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GUIDE_DIR = path.join(__dirname, "../launch-guide");
async function findChildPageByDay(notion, parentId, day) {
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
      if (t.includes(`Día ${day}`) && t.startsWith("Guía 7 días")) return { id: b.id, url: p.url, title: t };
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
    const title = d.pageTitle;
    const md = fs.readFileSync(path.join(GUIDE_DIR, `dia-${String(d.day).padStart(2, "0")}.md`), "utf8");

    let page = await findChildPageByDay(notion, rootId, d.day);
    if (!page) {
      const created = await notion.pages.create({
        parent: { page_id: rootId },
        properties: { title: { title: [{ text: { content: title } }] } },
        icon: { type: "emoji", emoji: d.day === 7 ? "🏁" : "📅" },
      });
      page = { id: created.id, url: created.url, title };
    } else if (page.title !== title) {
      await notion.pages.update({ page_id: page.id, properties: { title: { title: [{ text: { content: title } }] } } });
    }

    await deleteAllBlocks(notion, page.id, false);
    const blocks = markdownToNotionBlocks(md);
    await appendNotionBlocks(notion, page.id, blocks);
    pages.push({ day: d.day, title, pageId: page.id, url: page.url });
  }

  return { pages, guideDir: GUIDE_DIR };
}
