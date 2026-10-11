import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import { loadManifest } from "./manifest.mjs";

dotenv.config({ path: new URL("../../.env", import.meta.url).pathname });

export function getNotion() {
  const key = process.env.NOTION_API_KEY?.trim();
  if (!key) throw new Error("NOTION_API_KEY missing");
  return new Client({ auth: key });
}

export function getDb(manifest, key) {
  const db = manifest.databases[key];
  if (!db?.id || !db?.dataSourceId) throw new Error(`Missing manifest database ${key}`);
  return db;
}

export async function queryByRichText(notion, dataSourceId, property, value) {
  const r = await notion.dataSources.query({
    data_source_id: dataSourceId,
    filter: { property, rich_text: { equals: value } },
  });
  return r.results;
}

export async function queryByTitle(notion, dataSourceId, property, value) {
  const r = await notion.dataSources.query({
    data_source_id: dataSourceId,
    filter: { property, title: { equals: value } },
  });
  return r.results;
}

export async function upsertByExternalId(notion, databaseId, dataSourceId, externalId, properties) {
  const existing = await queryByRichText(notion, dataSourceId, "External ID", externalId);
  if (existing[0]) {
    await notion.pages.update({ page_id: existing[0].id, properties });
    return { id: existing[0].id, created: false };
  }
  const page = await notion.pages.create({
    parent: { database_id: databaseId },
    properties: { ...properties, "External ID": { rich_text: [{ text: { content: externalId } }] } },
  });
  return { id: page.id, created: true };
}

export async function legacyRowCounts(notion) {
  const LEGACY = {
    hub: "3f384cd0-85ae-80bd-be51-c17104511bfa",
    ops: "3f484cd0-85ae-804d-b61a-d87b93c11734",
    kv: "3f484cd0-85ae-800b-a34c-d0d4101255a0",
    routine: "3f484cd0-85ae-80a8-9091-e7bf1a16ba70",
    issues: "3f484cd0-85ae-80dd-aedb-f0e4004e88ea",
    deploy: "3f484cd0-85ae-8011-af56-e1adfd30300b",
    kpi1: "00fb3a37-ccb2-4275-bce3-068b7b08b7e4",
    kpi2: "efdaa399-b73c-4e83-9bbd-f7cdaceb9daa",
  };
  const counts = {};
  for (const [k, id] of Object.entries(LEGACY)) {
    const db = await notion.databases.retrieve({ database_id: id });
    const ds = db.data_sources?.[0]?.id;
    let n = 0;
    let c;
    do {
      const r = await notion.dataSources.query({ data_source_id: ds, page_size: 100, start_cursor: c });
      n += r.results.length;
      c = r.has_more ? r.next_cursor : undefined;
    } while (c);
    counts[k] = n;
  }
  return counts;
}
