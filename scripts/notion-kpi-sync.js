"use strict";

const {
  readPageTitle,
  readNumberProperty,
  resolveKpiPropertyKeys,
  findSchemaPropertyKey,
  extractDomainFromGscUrl,
} = require("./notion-kpi-utils");
const { listEnrichmentGaps } = require("./kpi-enrichment/metrics");

const DOMAIN_PROPERTY_CANDIDATES = [
  "Site",
  "Domain",
  "URL",
  "Website",
  "Dominio",
  "Issues & Incidents",
  "site",
  "domain",
];

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

function readDomainFromPage(page, domainPropertyKey) {
  if (!domainPropertyKey) return null;
  const prop = page.properties?.[domainPropertyKey];
  if (!prop) return null;

  let raw = "";
  switch (prop.type) {
    case "url":
      raw = prop.url || "";
      break;
    case "rich_text":
      raw = (prop.rich_text || []).map((t) => t.plain_text).join("");
      break;
    case "title":
      raw = (prop.title || []).map((t) => t.plain_text).join("");
      break;
    case "select":
      raw = prop.select?.name || "";
      break;
    case "formula":
      raw =
        prop.formula?.type === "string"
          ? prop.formula.string || ""
          : String(prop.formula?.number ?? "");
      break;
    default:
      return null;
  }

  return normalizeDomain(raw);
}

function normalizeDomain(raw) {
  if (!raw || typeof raw !== "string") return null;
  let value = raw.trim().toLowerCase();
  if (!value) return null;
  value = value.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  value = value.replace(/^www\./, "");
  if (!value.includes(".")) return null;
  return value;
}

function resolveDomainPropertyKey(schema) {
  return findSchemaPropertyKey(schema, DOMAIN_PROPERTY_CANDIDATES);
}

function resolveRowDomain(page, schema) {
  const domainKey = resolveDomainPropertyKey(schema);
  const fromColumn = readDomainFromPage(page, domainKey);
  if (fromColumn) return fromColumn;

  const gscProp = page.properties?.GSC;
  if (gscProp?.type === "rich_text") {
    const gscText = (gscProp.rich_text || []).map((t) => t.plain_text).join("");
    const fromGsc = extractDomainFromGscUrl(gscText);
    if (fromGsc) return fromGsc;
  }

  return null;
}

function rowDisplayLabel(page, domain) {
  if (domain) return domain;
  const title = readPageTitle(page);
  return title === "Untitled" ? page.id.slice(0, 8) : title;
}

/**
 * @param {object} mainDs
 * @param {object} page
 */
function buildRowContext(mainDs, page, mainKpiKeys) {
  const current = {
    monthlyRevenue: readNumberProperty(page, mainKpiKeys.monthlyRevenue),
    dailyClicks: readNumberProperty(page, mainKpiKeys.dailyClicks),
    indexedPages: readNumberProperty(page, mainKpiKeys.indexedPages),
  };

  const domain = resolveRowDomain(page, mainDs.properties);

  return {
    pageId: page.id,
    label: rowDisplayLabel(page, domain),
    domain,
    current,
    missing: listEnrichmentGaps(current),
  };
}

function formatMetricProperty(schemaType, metricId, value) {
  if (value == null) return null;
  if (schemaType === "number") {
    return { number: value };
  }
  if (schemaType === "rich_text") {
    let content;
    if (metricId === "monthlyRevenue") {
      content = `$${Number(value).toFixed(2)}`;
    } else if (metricId === "indexedPages") {
      content = Math.round(value).toLocaleString("en-US");
    } else {
      content = String(Math.round(value));
    }
    return {
      rich_text: [{ type: "text", text: { content } }],
    };
  }
  return { number: value };
}

function buildMainUpdateProperties(mainSchema, kpiKeys, metrics, previous) {
  const properties = {};
  const map = {
    monthlyRevenue: kpiKeys.monthlyRevenue,
    dailyClicks: kpiKeys.dailyClicks,
    indexedPages: kpiKeys.indexedPages,
  };

  for (const [metricId, propertyKey] of Object.entries(map)) {
    if (!propertyKey) continue;
    const next = metrics[metricId];
    const prev = previous[metricId];
    if (next === prev) continue;
    if (next === null || next === undefined) continue;
    const schemaType = mainSchema[propertyKey]?.type;
    const prop = formatMetricProperty(schemaType, metricId, next);
    if (prop) properties[propertyKey] = prop;
  }

  return properties;
}

function buildHistorySnapshotProperties(
  historyDs,
  relationKey,
  pageId,
  snapshotDate,
  label,
  metrics,
) {
  const properties = {
    Name: {
      title: [
        {
          type: "text",
          text: { content: `${snapshotDate} — ${label}` },
        },
      ],
    },
    [relationKey]: {
      relation: [{ id: pageId }],
    },
    Date: { date: { start: snapshotDate } },
  };

  if (historyDs.properties["Monthly Revenue"]) {
    properties["Monthly Revenue"] = { number: metrics.monthlyRevenue };
  }
  if (historyDs.properties["Daily Clicks"]) {
    properties["Daily Clicks"] = { number: metrics.dailyClicks };
  }
  if (historyDs.properties["Indexed Pages"]) {
    properties["Indexed Pages"] = { number: metrics.indexedPages };
  }

  return properties;
}

function resolveHistoryRelationKey(historyDs) {
  return (
    findSchemaPropertyKey(historyDs.properties, RELATION_CANDIDATES) ||
    Object.entries(historyDs.properties).find(
      ([, def]) => def?.type === "relation",
    )?.[0]
  );
}

module.exports = {
  queryAllDataSourceRows,
  buildRowContext,
  buildMainUpdateProperties,
  buildHistorySnapshotProperties,
  resolveHistoryRelationKey,
  resolveKpiPropertyKeys,
  resolveDomainPropertyKey,
};
