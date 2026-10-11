import fs from "fs";
import path from "path";
import { csnOsRoot } from "./manifest.mjs";
import { getDb, queryByRichText } from "./notion.mjs";
import { appendMarkdownAsBlocks, deleteAllBlocks, rt } from "./notion-markdown-blocks.mjs";

const PROMPT_PAGE_PREFIX = "📋 Prompt Cursor — ";

export async function ensurePromptChildPage(notion, taskPageId, taskTitle) {
  const title = PROMPT_PAGE_PREFIX + (taskTitle || "tarea").slice(0, 80);
  let cursor;
  do {
    const res = await notion.blocks.children.list({ block_id: taskPageId, page_size: 100, start_cursor: cursor });
    for (const b of res.results) {
      if (b.type !== "child_page") continue;
      const p = await notion.pages.retrieve({ page_id: b.id });
      const t = Object.values(p.properties).find((x) => x.type === "title");
      const plain = t?.title?.map((x) => x.plain_text).join("") || "";
      if (plain === title || plain.startsWith(PROMPT_PAGE_PREFIX)) return { pageId: p.id, url: p.url, title: plain };
    }
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  const created = await notion.pages.create({
    parent: { page_id: taskPageId },
    properties: { title: { title: [{ text: { content: title } }] } },
  });
  const page = await notion.pages.retrieve({ page_id: created.id });
  return { pageId: page.id, url: page.url, title };
}

export async function publishPromptToNotion({
  notion,
  manifest,
  taskPageId,
  taskTitle,
  markdown,
  promptId,
  localRelativePath,
  runPageId,
}) {
  const { pageId, url } = await ensurePromptChildPage(notion, taskPageId, taskTitle);
  await deleteAllBlocks(notion, pageId, false);
  await appendMarkdownAsBlocks(notion, pageId, markdown);

  await notion.pages.update({
    page_id: taskPageId,
    properties: {
      "Prompt Notion URL": { url },
      "Ruta prompt local": { rich_text: rt(localRelativePath || "") },
    },
  });

  if (runPageId) {
    await notion.pages.update({
      page_id: runPageId,
      properties: {
        "Prompt Notion URL": { url },
        "Generated Prompt ID": { rich_text: rt((promptId || "").slice(0, 2000)) },
        "Generated Prompt Path": { rich_text: rt(localRelativePath || "") },
      },
    });
  }

  return { notionPageId: pageId, notionUrl: url };
}

export async function findTaskByExternalId(notion, manifest, taskExternalId) {
  const tasksDb = getDb(manifest, "tasks");
  const rows = await queryByRichText(notion, tasksDb.dataSourceId, "External ID", taskExternalId);
  return rows[0] || null;
}

export function writeLocalPrompt(promptId, markdown) {
  const outDir = path.join(csnOsRoot(), "generated-prompts");
  fs.mkdirSync(outDir, { recursive: true });
  const safe = promptId.replace(/:/g, "_");
  const outFile = path.join(outDir, `${safe}.md`);
  fs.writeFileSync(outFile, markdown);
  return path.relative(path.join(csnOsRoot(), ".."), outFile);
}
