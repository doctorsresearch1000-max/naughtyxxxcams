#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { Client } from "@notionhq/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });
const manifest = JSON.parse(
  fs.readFileSync(path.join(__dirname, "notion-csn-isolated-manifest.json"), "utf8"),
);

const notion = new Client({ auth: process.env.NOTION_API_KEY });

async function allRows(dsId) {
  const rows = [];
  let c;
  do {
    const r = await notion.dataSources.query({
      data_source_id: dsId,
      page_size: 100,
      start_cursor: c,
    });
    rows.push(...r.results);
    c = r.has_more ? r.next_cursor : undefined;
  } while (c);
  return rows;
}

function title(p) {
  for (const v of Object.values(p.properties || {})) {
    if (v.type === "title") return v.title?.map((t) => t.plain_text).join("");
  }
  return "";
}
function rt(p, name) {
  const x = p.properties?.[name];
  if (x?.type === "rich_text") return x.rich_text?.map((t) => t.plain_text).join("");
  return "";
}

const schemas = {};
for (const [k, db] of Object.entries(manifest.databases)) {
  const ds = await notion.dataSources.retrieve({ data_source_id: db.dataSourceId });
  schemas[k] = Object.fromEntries(
    Object.entries(ds.properties || {}).map(([n, p]) => [n, p.type]),
  );
}
console.log("=== SCHEMAS ===\n", JSON.stringify(schemas, null, 2));

for (const [k, db] of Object.entries(manifest.databases)) {
  const rows = await allRows(db.dataSourceId);
  console.log("COUNT", k, rows.length);
  if (k === "tasks") {
    for (const r of rows) {
      console.log(
        " TASK",
        title(r),
        "phase",
        r.properties.Phase?.number,
        "ext",
        rt(r, "External ID"),
      );
    }
  }
  if (k === "humanGates") {
    for (const r of rows) {
      console.log(
        " GATE",
        title(r),
        rt(r, "Target External ID"),
        r.properties.Status?.select?.name,
        r.properties["Target Type"]?.select?.name,
      );
    }
  }
  if (k === "csnKnowledge") {
    for (const r of rows) console.log(" KNOW", title(r));
  }
}

const blocks = await notion.blocks.children.list({
  block_id: manifest.rootPageId,
  page_size: 100,
});
console.log(
  "ROOT blocks",
  blocks.results.length,
  blocks.results.map(
    (b) =>
      b.type +
      ":" +
      (b[b.type]?.rich_text?.[0]?.plain_text?.slice(0, 50) || ""),
  ),
);
