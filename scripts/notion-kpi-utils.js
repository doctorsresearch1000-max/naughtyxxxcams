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

function readNumberProperty(page, propertyKey) {
  if (!propertyKey) return null;
  const prop = page.properties?.[propertyKey];
  if (!prop || prop.type !== "number") return null;
  return prop.number;
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

module.exports = {
  KPI_PROPERTY_NAMES,
  normalizeId,
  formatIdWithDashes,
  findSchemaPropertyKey,
  resolveKpiPropertyKeys,
  readPageTitle,
  readNumberProperty,
  todayIsoDate,
  requireEnv,
};
