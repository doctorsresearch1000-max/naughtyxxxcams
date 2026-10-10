"use strict";

const {
  readPageTitle,
  readNumberProperty,
  resolveKpiPropertyKeys,
  findSchemaPropertyKey,
} = require("./notion-kpi-utils");
const { listMissingMetrics } = require("./kpi-enrichment/metrics");

const DOMAIN_PROPERTY_CANDIDATES = [
  "Site",
  "Domain",
  "URL",
  "Website",
  "Dominio",
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

/**
 * @param {import("@notionhq/client").Client} notion
 * @param {object} mainDs
 * @param {object} page
 */
function buildRowContext(mainDs, page, mainKpiKeys) {
  const domainKey = resolveDomainPropertyKey(mainDs.properties);
  const current = {
    monthlyRevenue: readNumberProperty(page, mainKpiKeys.monthlyRevenue),
    dailyClicks: readNumberProperty(page, mainKpiKeys.dailyClicks),
    indexedPages: readNumberProperty(page, mainKpiKeys.indexedPages),
  };

  return {
    pageId: page.id,
    label: readPageTitle(page),
    domain: readDomainFromPage(page, domainKey),
    current,
    missing: listMissingMetrics(current),
  };
}

function buildMainUpdateProperties(kpiKeys, metrics) {
  const properties = {};
  if (kpiKeys.monthlyRevenue && metrics.monthlyRevenue != null) {
    properties[kpiKeys.monthlyRevenue] = { number: metrics.monthlyRevenue };
  }
  if (kpiKeys.dailyClicks && metrics.dailyClicks != null) {
    properties[kpiKeys.dailyClicks] = { number: metrics.dailyClicks };
  }
  if (kpiKeys.indexedPages && metrics.indexedPages != null) {
    properties[kpiKeys.indexedPages] = { number: metrics.indexedPages };
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
