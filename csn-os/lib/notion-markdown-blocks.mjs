const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const MAX_TEXT = 2000;

/** Rich text con enlaces [label](url) y **negrita** (sin anidar). */
export function parseInlineMarkdown(text) {
  const out = [];
  const s = text || "";
  const re = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*)/g;
  let last = 0;
  let m;
  while ((m = re.exec(s)) !== null) {
    if (m.index > last) {
      out.push({ type: "text", text: { content: s.slice(last, m.index) } });
    }
    if (m[2] && m[3]) {
      out.push({ type: "text", text: { content: m[2], link: { url: m[3] } } });
    } else if (m[4]) {
      out.push({ type: "text", text: { content: m[4] }, annotations: { bold: true } });
    }
    last = m.index + m[0].length;
  }
  if (last < s.length) out.push({ type: "text", text: { content: s.slice(last) } });
  if (!out.length) out.push({ type: "text", text: { content: "" } });
  return out.flatMap((chunk) => splitRichTextChunk(chunk));
}

function splitRichTextChunk(chunk) {
  const content = chunk.text?.content ?? "";
  if (content.length <= MAX_TEXT) return [chunk];
  const parts = [];
  for (let i = 0; i < content.length; i += MAX_TEXT) {
    parts.push({
      type: "text",
      text: { content: content.slice(i, i + MAX_TEXT), link: chunk.text.link },
      annotations: chunk.annotations,
    });
  }
  return parts;
}

export const rt = (t) => parseInlineMarkdown(t);

function codeBlock(text, language = "plain text") {
  const chunks = [];
  for (let i = 0; i < text.length; i += MAX_TEXT) {
    chunks.push({ type: "text", text: { content: text.slice(i, i + MAX_TEXT) } });
  }
  return {
    object: "block",
    type: "code",
    code: { rich_text: chunks.length ? chunks : [{ type: "text", text: { content: "" } }], language },
  };
}

function heading(level, text) {
  const key = `heading_${level}`;
  return { object: "block", type: key, [key]: { rich_text: rt(text) } };
}

function para(text) {
  return { object: "block", type: "paragraph", paragraph: { rich_text: rt(text) } };
}

function bullet(text) {
  return { object: "block", type: "bulleted_list_item", bulleted_list_item: { rich_text: rt(text) } };
}

function todo(text, checked = false) {
  return { object: "block", type: "to_do", to_do: { rich_text: rt(text), checked } };
}

function divider() {
  return { object: "block", type: "divider", divider: {} };
}

/** Convierte markdown de la guía a bloques Notion (enlaces, código, listas, tablas simples). */
export function markdownToNotionBlocks(markdown) {
  const lines = markdown.split("\n");
  const children = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trimEnd();

    if (!trimmed.trim()) {
      i++;
      continue;
    }

    if (trimmed.startsWith("```")) {
      const lang = trimmed.slice(3).trim() || "plain text";
      const buf = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        buf.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++;
      children.push(codeBlock(buf.join("\n"), lang === "text" ? "plain text" : lang));
      continue;
    }

    if (trimmed.startsWith("# ")) {
      children.push(heading(1, trimmed.slice(2)));
      i++;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      children.push(heading(2, trimmed.slice(3)));
      i++;
      continue;
    }
    if (trimmed.startsWith("### ")) {
      children.push(heading(3, trimmed.slice(4)));
      i++;
      continue;
    }
    if (trimmed.startsWith("- [ ]")) {
      children.push(todo(trimmed.replace(/^- \[ \]\s*/, "")));
      i++;
      continue;
    }
    if (trimmed.startsWith("- ")) {
      children.push(bullet(trimmed.slice(2)));
      i++;
      continue;
    }
    if (/^\d+\.\s/.test(trimmed)) {
      children.push(bullet(trimmed));
      i++;
      continue;
    }

    if (trimmed.startsWith("|") && trimmed.includes("|")) {
      const tableLines = [trimmed];
      i++;
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i].trim());
        i++;
      }
      if (tableLines.length >= 2 && tableLines[1].replace(/[|\s-]/g, "") === "") {
        tableLines.splice(1, 1);
      }
      children.push(para("Tabla:"));
      for (const row of tableLines) {
        children.push(bullet(row));
      }
      continue;
    }

    children.push(para(trimmed));
    i++;
  }
  return children;
}

export async function deleteBlocksExceptChildPagesAndDatabases(notion, pageId) {
  let cursor;
  const ids = [];
  do {
    const res = await notion.blocks.children.list({ block_id: pageId, page_size: 100, start_cursor: cursor });
    for (const b of res.results) {
      if (b.type === "child_page" || b.type === "child_database") continue;
      ids.push(b.id);
    }
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  for (const id of ids) {
    try {
      await notion.blocks.delete({ block_id: id });
    } catch {
      /* gone */
    }
    await sleep(60);
  }
  return ids.length;
}

export async function deleteAllBlocks(notion, blockId, keepChildPages = false) {
  let cursor;
  const ids = [];
  do {
    const res = await notion.blocks.children.list({ block_id: blockId, page_size: 100, start_cursor: cursor });
    for (const b of res.results) {
      if (keepChildPages && b.type === "child_page") continue;
      ids.push(b.id);
    }
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  for (const id of ids) {
    try {
      await notion.blocks.delete({ block_id: id });
    } catch {
      /* gone */
    }
    await sleep(60);
  }
  return ids.length;
}

export async function appendNotionBlocks(notion, pageId, children) {
  for (let i = 0; i < children.length; i += 80) {
    await notion.blocks.children.append({ block_id: pageId, children: children.slice(i, i + 80) });
    await sleep(300);
  }
}

/** @deprecated use markdownToNotionBlocks + appendNotionBlocks */
export async function appendMarkdownAsBlocks(notion, pageId, markdown) {
  const children = markdownToNotionBlocks(markdown);
  await appendNotionBlocks(notion, pageId, children);
}
