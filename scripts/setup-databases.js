#!/usr/bin/env node
"use strict";

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const fs = require("fs");
const path = require("path");
const { Client } = require("@notionhq/client");
const {
  formatIdWithDashes,
  requireEnv,
  getDatabaseDataSourceId,
  resolveParentPageId,
} = require("./notion-kpi-utils");

const HISTORY_DB_TITLE = "KPI History";
const RELATION_PROPERTY_NAME = "Source record";
const REVERSE_RELATION_NAME = "KPI History";

async function main() {
  const apiKey = requireEnv("NOTION_API_KEY");
  const mainDbId = formatIdWithDashes(requireEnv("NOTION_MAIN_DB_ID"));

  const notion = new Client({ auth: apiKey });

  const existingHistoryId = process.env.NOTION_HISTORY_DB_ID?.trim();
  if (existingHistoryId && !existingHistoryId.includes("TU_")) {
    const historyId = formatIdWithDashes(existingHistoryId);
    try {
      const db = await notion.databases.retrieve({ database_id: historyId });
      console.log(
        `La base "KPI History" ya está configurada (${db.id}). No se creó otra.`,
      );
      return;
    } catch {
      console.warn(
        "NOTION_HISTORY_DB_ID está definido pero no es accesible; se creará una base nueva.",
      );
    }
  }

  const { dataSourceId: mainDataSourceId } = await getDatabaseDataSourceId(
    notion,
    mainDbId,
  );
  const parentPageId = await resolveParentPageId(
    notion,
    mainDbId,
    mainDataSourceId,
  );

  console.log(`Creando "${HISTORY_DB_TITLE}"…`);

  const historyDb = await notion.databases.create({
    parent: { type: "page_id", page_id: parentPageId },
    title: [{ type: "text", text: { content: HISTORY_DB_TITLE } }],
    initial_data_source: {
      properties: {
        Name: { title: {} },
        [RELATION_PROPERTY_NAME]: {
          relation: {
            data_source_id: mainDataSourceId,
            type: "dual_property",
            dual_property: { synced_property_name: REVERSE_RELATION_NAME },
          },
        },
        "Monthly Revenue": { number: { format: "dollar" } },
        "Daily Clicks": { number: { format: "number" } },
        "Indexed Pages": { number: { format: "number" } },
        Date: { date: {} },
      },
    },
  });

  const historyDataSourceId = historyDb.data_sources?.[0]?.id;

  console.log("\n✅ Base de datos creada correctamente.");
  console.log(`   Título: ${HISTORY_DB_TITLE}`);
  console.log(`   ID (NOTION_HISTORY_DB_ID): ${historyDb.id}`);
  if (historyDataSourceId) {
    console.log(`   Data source ID: ${historyDataSourceId}`);
  }
  console.log(
    `   Relación → base principal (propiedad "${RELATION_PROPERTY_NAME}")`,
  );
  console.log(
    `   En la base principal se añadió la relación inversa "${REVERSE_RELATION_NAME}".`,
  );

  await appendEnvValues({
    NOTION_HISTORY_DB_ID: historyDb.id,
    ...(historyDataSourceId
      ? { NOTION_HISTORY_DATA_SOURCE_ID: historyDataSourceId }
      : {}),
    NOTION_MAIN_DATA_SOURCE_ID: mainDataSourceId,
  });
  console.log(
    "\nSe actualizó .env (NOTION_HISTORY_DB_ID). Ejecuta: node scripts/sync-kpis.js",
  );
}

async function appendEnvValues(entries) {
  const envPath = path.resolve(__dirname, "../.env");
  let content = fs.existsSync(envPath)
    ? fs.readFileSync(envPath, "utf8")
    : "";

  for (const [key, value] of Object.entries(entries)) {
    const line = `${key}=${value}`;
    const re = new RegExp(`^${key}=.*`, "m");
    if (re.test(content)) {
      content = content.replace(re, line);
    } else {
      content = content.trimEnd() + `\n${line}\n`;
    }
  }
  fs.writeFileSync(envPath, content, "utf8");
}

main().catch((err) => {
  console.error("\n❌ Error en setup-databases:", err.body?.message || err.message);
  if (err.code === "object_not_found") {
    console.error(
      "Comprueba NOTION_MAIN_DB_ID, que la integración tenga acceso a la base y el token sea válido.",
    );
  }
  process.exit(1);
});
