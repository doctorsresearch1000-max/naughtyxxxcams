#!/usr/bin/env node
"use strict";

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const { Client } = require("@notionhq/client");
const {
  formatIdWithDashes,
  requireEnv,
  resolveKpiPropertyKeys,
  readPageTitle,
  readNumberProperty,
  todayIsoDate,
  findSchemaPropertyKey,
} = require("./notion-kpi-utils");

const RELATION_CANDIDATES = [
  "Source record",
  "Source Record",
  "CAM SITE NETWORK OS",
  "CAM Site Network OS",
];

async function queryAllPages(notion, databaseId) {
  const pages = [];
  let cursor;
  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
    });
    pages.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);
  return pages;
}

async function main() {
  const apiKey = requireEnv("NOTION_API_KEY");
  const mainDbId = formatIdWithDashes(requireEnv("NOTION_MAIN_DB_ID"));
  const historyDbId = formatIdWithDashes(requireEnv("NOTION_HISTORY_DB_ID"));

  const notion = new Client({ auth: apiKey });
  const snapshotDate = todayIsoDate();

  const [mainDb, historyDb] = await Promise.all([
    notion.databases.retrieve({ database_id: mainDbId }),
    notion.databases.retrieve({ database_id: historyDbId }),
  ]);

  const mainKpiKeys = resolveKpiPropertyKeys(mainDb.properties);
  const missing = Object.entries(mainKpiKeys)
    .filter(([, key]) => !key)
    .map(([name]) => name);
  if (missing.length) {
    console.warn(
      `⚠️  En la base principal no se encontraron propiedades para: ${missing.join(", ")}. ` +
        "Los valores faltantes se guardarán como vacíos en el histórico.",
    );
  }

  const relationKey =
    findSchemaPropertyKey(historyDb.properties, RELATION_CANDIDATES) ||
    Object.entries(historyDb.properties).find(
      ([, def]) => def?.type === "relation",
    )?.[0];

  if (!relationKey) {
    throw new Error(
      'No se encontró una propiedad Relation en "KPI History". Ejecuta setup-databases.js primero.',
    );
  }

  const mainPages = await queryAllPages(notion, mainDbId);
  console.log(
    `Sincronizando ${mainPages.length} registro(s) → histórico (${snapshotDate})…`,
  );

  let created = 0;
  for (const page of mainPages) {
    const title = readPageTitle(page);
    const monthlyRevenue = readNumberProperty(page, mainKpiKeys.monthlyRevenue);
    const dailyClicks = readNumberProperty(page, mainKpiKeys.dailyClicks);
    const indexedPages = readNumberProperty(page, mainKpiKeys.indexedPages);

    const properties = {
      Name: {
        title: [{ type: "text", text: { content: `${snapshotDate} — ${title}` } }],
      },
      [relationKey]: {
        relation: [{ id: page.id }],
      },
      Date: { date: { start: snapshotDate } },
    };

    if (historyDb.properties["Monthly Revenue"]) {
      properties["Monthly Revenue"] = { number: monthlyRevenue };
    }
    if (historyDb.properties["Daily Clicks"]) {
      properties["Daily Clicks"] = { number: dailyClicks };
    }
    if (historyDb.properties["Indexed Pages"]) {
      properties["Indexed Pages"] = { number: indexedPages };
    }

    await notion.pages.create({
      parent: { database_id: historyDbId },
      properties,
    });
    created += 1;
    console.log(`  + ${title}`);
  }

  console.log(`\n✅ Listo: ${created} fila(s) nuevas en KPI History (sin modificar la base principal).`);
}

main().catch((err) => {
  console.error("\n❌ Error en sync-kpis:", err.body?.message || err.message);
  process.exit(1);
});
