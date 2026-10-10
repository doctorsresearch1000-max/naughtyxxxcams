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
  getDatabaseDataSourceId,
} = require("./notion-kpi-utils");

const RELATION_CANDIDATES = [
  "Source record",
  "Source Record",
  "CAM SITE NETWORK OS",
  "CAM Site Network OS",
];

async function queryAllDataSourceRows(notion, dataSourceId) {
  const pages = [];
  let cursor;
  do {
    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
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

  const mainDataSourceId =
    process.env.NOTION_MAIN_DATA_SOURCE_ID?.trim() ||
    (await getDatabaseDataSourceId(notion, mainDbId)).dataSourceId;

  const historyDataSourceId =
    process.env.NOTION_HISTORY_DATA_SOURCE_ID?.trim() ||
    (await getDatabaseDataSourceId(notion, historyDbId)).dataSourceId;

  const [mainDs, historyDs] = await Promise.all([
    notion.dataSources.retrieve({ data_source_id: mainDataSourceId }),
    notion.dataSources.retrieve({ data_source_id: historyDataSourceId }),
  ]);

  const mainKpiKeys = resolveKpiPropertyKeys(mainDs.properties);
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
    findSchemaPropertyKey(historyDs.properties, RELATION_CANDIDATES) ||
    Object.entries(historyDs.properties).find(
      ([, def]) => def?.type === "relation",
    )?.[0];

  if (!relationKey) {
    throw new Error(
      'No se encontró una propiedad Relation en "KPI History". Ejecuta setup-databases.js primero.',
    );
  }

  const mainPages = await queryAllDataSourceRows(notion, mainDataSourceId);
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

    if (historyDs.properties["Monthly Revenue"]) {
      properties["Monthly Revenue"] = { number: monthlyRevenue };
    }
    if (historyDs.properties["Daily Clicks"]) {
      properties["Daily Clicks"] = { number: dailyClicks };
    }
    if (historyDs.properties["Indexed Pages"]) {
      properties["Indexed Pages"] = { number: indexedPages };
    }

    await notion.pages.create({
      parent: { type: "data_source_id", data_source_id: historyDataSourceId },
      properties,
    });
    created += 1;
    console.log(`  + ${title || page.id}`);
  }

  console.log(
    `\n✅ Listo: ${created} fila(s) nuevas en KPI History (sin modificar la base principal).`,
  );
}

main().catch((err) => {
  console.error("\n❌ Error en sync-kpis:", err.body?.message || err.message);
  process.exit(1);
});
