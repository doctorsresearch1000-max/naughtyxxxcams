#!/usr/bin/env node
"use strict";

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const fs = require("fs");
const path = require("path");
const { Client } = require("@notionhq/client");
const {
  formatIdWithDashes,
  requireEnv,
} = require("./notion-kpi-utils");

const MAIN_DB_TITLE = "CAM SITE NETWORK OS";
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

  const mainDb = await notion.databases.retrieve({ database_id: mainDbId });
  const parent = mainDb.parent;

  if (!parent || parent.type !== "page_id") {
    throw new Error(
      `La base principal debe tener un padre de tipo página. Padre actual: ${JSON.stringify(parent)}. ` +
        "Mueve la base bajo una página en Notion o crea KPI History manualmente bajo esa página.",
    );
  }

  console.log(`Base principal encontrada. Creando "${HISTORY_DB_TITLE}"…`);

  const historyDb = await notion.databases.create({
    parent: { type: "page_id", page_id: parent.page_id },
    title: [{ type: "text", text: { content: HISTORY_DB_TITLE } }],
    properties: {
      Name: { title: {} },
      [RELATION_PROPERTY_NAME]: {
        relation: {
          database_id: mainDbId,
          type: "dual_property",
          dual_property: { synced_property_name: REVERSE_RELATION_NAME },
        },
      },
      "Monthly Revenue": { number: { format: "dollar" } },
      "Daily Clicks": { number: { format: "number" } },
      "Indexed Pages": { number: { format: "number" } },
      Date: { date: {} },
    },
  });

  console.log("\n✅ Base de datos creada correctamente.");
  console.log(`   Título: ${HISTORY_DB_TITLE}`);
  console.log(`   ID: ${historyDb.id}`);
  console.log(`   Relación → "${MAIN_DB_TITLE}" (propiedad "${RELATION_PROPERTY_NAME}")`);
  console.log(
    `   En la base principal se añadió la relación inversa "${REVERSE_RELATION_NAME}" (no modifica filas existentes).`,
  );

  await appendHistoryDbIdToEnv(historyDb.id);
  console.log(
    "\nSe actualizó NOTION_HISTORY_DB_ID en .env. Ya puedes ejecutar: node scripts/sync-kpis.js",
  );
}

async function appendHistoryDbIdToEnv(historyDbId) {
  const envPath = path.resolve(__dirname, "../.env");
  let content = fs.existsSync(envPath)
    ? fs.readFileSync(envPath, "utf8")
    : "";

  const line = `NOTION_HISTORY_DB_ID=${historyDbId}`;
  if (/^NOTION_HISTORY_DB_ID=.*/m.test(content)) {
    content = content.replace(/^NOTION_HISTORY_DB_ID=.*/m, line);
  } else {
    content = content.trimEnd() + `\n${line}\n`;
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
