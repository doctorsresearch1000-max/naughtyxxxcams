import { getNotion } from "./notion.mjs";

export const PRIMARY_ENTRY_TITLE = "Cam Sites — SOP System";
export const DUPLICATE_ROOT_ID = "3f684cd0-85ae-8115-841a-c9dc40395c58";
export const PARENT_CF_PAGES_ID = "3f484cd0-85ae-8032-bff1-c16e871e6357";

const EXPECTED_DB_TITLES = [
  "CSN Sites",
  "SOP Versions",
  "Project Runs",
  "Tasks",
  "Domain Candidates",
  "SEO Opportunities",
  "Backlink Opportunities",
  "Feed Sync Runs",
  "CSN Releases",
  "CSN Incidents",
  "CSN Maintenance",
  "CSN Knowledge",
  "Launch KPI Snapshots",
  "Human Gates",
];

/** Verifica que la página tiene las 14 DB inline (coincide con capturas del usuario). */
export async function verifyPrimaryEntryFingerprint(notion, pageId) {
  const dbs = [];
  let cursor;
  do {
    const res = await notion.blocks.children.list({ block_id: pageId, page_size: 100, start_cursor: cursor });
    for (const b of res.results) {
      if (b.type !== "child_database") continue;
      const db = await notion.databases.retrieve({ database_id: b.id });
      dbs.push(db.title?.[0]?.plain_text || "");
    }
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  const match =
    dbs.length >= 14 &&
    EXPECTED_DB_TITLES.every((t, i) => dbs[i] === t || dbs.includes(t));
  return { match, dbCount: dbs.length, dbTitles: dbs };
}

export async function alignPrimaryEntryPage(notion, manifest) {
  const pageId = manifest.rootPageId;
  const fp = await verifyPrimaryEntryFingerprint(notion, pageId);
  if (!fp.match) {
    throw new Error(
      `rootPageId ${pageId} no coincide con las 14 DB de Cam Sites — SOP System (encontradas: ${fp.dbCount})`,
    );
  }

  await notion.pages.update({
    page_id: pageId,
    icon: { type: "emoji", emoji: "🎥" },
    properties: {
      title: { title: [{ text: { content: PRIMARY_ENTRY_TITLE } }] },
    },
  });

  const page = await notion.pages.retrieve({ page_id: pageId });
  return { pageId, title: PRIMARY_ENTRY_TITLE, url: page.url, fingerprint: fp };
}

export async function disambiguateDuplicateRoot(notion) {
  try {
    await notion.pages.update({
      page_id: DUPLICATE_ROOT_ID,
      icon: { type: "emoji", emoji: "⚠️" },
      properties: {
        title: {
          title: [
            {
              text: {
                content: "OBSOLETO — copia parcial CSN OS (no usar)",
              },
            },
          ],
        },
      },
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export async function syncParentContainerIndex(notion, canonicalUrl) {
  const marker = "csn-primary-entry-index-v1";
  let cursor;
  const toDelete = [];
  do {
    const res = await notion.blocks.children.list({
      block_id: PARENT_CF_PAGES_ID,
      page_size: 100,
      start_cursor: cursor,
    });
    for (const b of res.results) {
      if (b.type === "child_page" || b.type === "child_database") continue;
      const txt = JSON.stringify(b);
      if (txt.includes(marker)) toDelete.push(b.id);
    }
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);

  for (const id of toDelete) {
    try {
      await notion.blocks.delete({ block_id: id });
    } catch {
      /* */
    }
  }

  await notion.blocks.children.append({
    block_id: PARENT_CF_PAGES_ID,
    position: { type: "start" },
    children: [
      {
        object: "block",
        type: "callout",
        callout: {
          icon: { emoji: "🎥" },
          rich_text: [
            {
              type: "text",
              text: {
                content: `Entrada principal CSN OS: «${PRIMARY_ENTRY_TITLE}» — ${marker}. No uses la copia marcada OBSOLETO.`,
                link: canonicalUrl ? { url: canonicalUrl } : undefined,
              },
            },
          ],
        },
      },
    ],
  });
}
