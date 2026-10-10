"use strict";

const KPI_PROPERTY_NAMES = {
  monthlyRevenue: ["Monthly Revenue", "monthly revenue", "Revenue"],
  dailyClicks: ["Daily Clicks", "daily clicks", "Clicks"],
  indexedPages: ["Indexed Pages", "indexed pages", "Pages Indexed"],
};

function normalizeId(id) {
  if (!id || typeof id !== "string") return "";
  return id.replace(/-/g, "").trim();
}

function formatIdWithDashes(raw) {
  const id = normalizeId(raw);
  if (id.length !== 32) return raw.trim();
  return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`;
}

function findSchemaPropertyKey(schema, candidates) {
  const keys = Object.keys(schema || {});
  for (const candidate of candidates) {
    const exact = keys.find((k) => k === candidate);
    if (exact) return exact;
    const lower = candidate.toLowerCase();
    const match = keys.find((k) => k.toLowerCase() === lower);
    if (match) return match;
  }
  return null;
}

function resolveKpiPropertyKeys(schema) {
  return {
    monthlyRevenue: findSchemaPropertyKey(schema, KPI_PROPERTY_NAMES.monthlyRevenue),
    dailyClicks: findSchemaPropertyKey(schema, KPI_PROPERTY_NAMES.dailyClicks),
    indexedPages: findSchemaPropertyKey(schema, KPI_PROPERTY_NAMES.indexedPages),
  };
}

function readPageTitle(page) {
  const props = page.properties || {};
  for (const value of Object.values(props)) {
    if (value?.type === "title" && Array.isArray(value.title)) {
      return value.title.map((t) => t.plain_text).join("") || "Untitled";
    }
  }
  return "Untitled";
}

function parseNumberFromText(text) {
  if (text === null || text === undefined) return null;
  const raw = String(text).trim();
  if (!raw) return null;
  const cleaned = raw.replace(/[$€£,\s]/g, "");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function readNumberProperty(page, propertyKey) {
  if (!propertyKey) return null;
  const prop = page.properties?.[propertyKey];
  if (!prop) return null;
  if (prop.type === "number") {
    return prop.number === null ? null : prop.number;
  }
  if (prop.type === "rich_text") {
    const text = (prop.rich_text || []).map((t) => t.plain_text).join("");
    return parseNumberFromText(text);
  }
  return null;
}

function extractDomainFromGscUrl(text) {
  if (!text) return null;
  const match = text.match(
    /resource_id=(?:sc-domain%3A|sc-domain:)([a-z0-9.-]+)/i,
  );
  return match ? match[1].toLowerCase() : null;
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value || value.includes("TU_") || value === "AQUI") {
    throw new Error(
      `Configura ${name} en .env (valor actual inválido o placeholder).`,
    );
  }
  return value;
}

async function getDatabaseDataSourceId(notion, databaseId) {
  const db = await notion.databases.retrieve({ database_id: databaseId });
  const dataSourceId = db.data_sources?.[0]?.id;
  if (!dataSourceId) {
    throw new Error(
      `La base ${databaseId} no expone data_sources; comprueba permisos de la integración.`,
    );
  }
  return { database: db, dataSourceId };
}

async function resolveParentPageId(notion, mainDatabaseId, mainDataSourceId) {
  const override = process.env.NOTION_PARENT_PAGE_ID?.trim();
  if (override) {
    return formatIdWithDashes(override);
  }

  const { database: mainDb } = await getDatabaseDataSourceId(
    notion,
    mainDatabaseId,
  );
  const parent = mainDb.parent;

  if (parent?.type === "page_id") {
    return parent.page_id;
  }

  if (parent?.type === "block_id") {
    try {
      let blockId = parent.block_id;
      for (let depth = 0; depth < 12 && blockId; depth += 1) {
        const block = await notion.blocks.retrieve({ block_id: blockId });
        if (block.parent?.type === "page_id") {
          return block.parent.page_id;
        }
        blockId =
          block.parent?.type === "block_id" ? block.parent.block_id : null;
      }
    } catch {
      // La integración suele no ver bloques ancestros; se usa el fallback inferior.
    }
  }

  const firstPage = await notion.dataSources.query({
    data_source_id: mainDataSourceId,
    page_size: 1,
  });
  const pageId = firstPage.results[0]?.id;
  if (!pageId) {
    throw new Error(
      "No se pudo resolver una página padre. Define NOTION_PARENT_PAGE_ID en .env " +
        "(página del workspace donde quieras la base KPI History) y compártela con la integración.",
    );
  }

  console.warn(
    "⚠️  La base principal no cuelga de una página accesible; KPI History se creará como subpágina de la primera fila.",
  );
  return pageId;
}

module.exports = {
  KPI_PROPERTY_NAMES,
  normalizeId,
  formatIdWithDashes,
  findSchemaPropertyKey,
  resolveKpiPropertyKeys,
  readPageTitle,
  readNumberProperty,
  parseNumberFromText,
  extractDomainFromGscUrl,
  todayIsoDate,
  requireEnv,
  getDatabaseDataSourceId,
  resolveParentPageId,
};
