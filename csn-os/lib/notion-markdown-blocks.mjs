const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const rt = (t) => [{ type: "text", text: { content: (t || "").slice(0, 2000) } }];

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

export async function appendMarkdownAsBlocks(notion, pageId, markdown) {
  const lines = markdown.split("\n");
  const children = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    if (line.startsWith("# ")) {
      children.push({ object: "block", type: "heading_1", heading_1: { rich_text: rt(line.slice(2)) } });
    } else if (line.startsWith("## ")) {
      children.push({ object: "block", type: "heading_2", heading_2: { rich_text: rt(line.slice(3)) } });
    } else if (line.startsWith("### ")) {
      children.push({ object: "block", type: "heading_3", heading_3: { rich_text: rt(line.slice(4)) } });
    } else if (line.startsWith("- [ ]")) {
      children.push({
        object: "block",
        type: "to_do",
        to_do: { rich_text: rt(line.replace(/^- \[ \]\s*/, "")), checked: false },
      });
    } else if (line.startsWith("- ")) {
      children.push({ object: "block", type: "bulleted_list_item", bulleted_list_item: { rich_text: rt(line.slice(2)) } });
    } else if (line.startsWith("```")) {
      continue;
    } else {
      children.push({ object: "block", type: "paragraph", paragraph: { rich_text: rt(line) } });
    }
  }
  for (let i = 0; i < children.length; i += 80) {
    await notion.blocks.children.append({ block_id: pageId, children: children.slice(i, i + 80) });
    await sleep(300);
  }
}
