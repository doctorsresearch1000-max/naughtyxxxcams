"use strict";

/** @typedef {'monthlyRevenue' | 'dailyClicks' | 'indexedPages'} MetricId */

const METRIC_IDS = ["monthlyRevenue", "dailyClicks", "indexedPages"];

const METRIC_LABELS = {
  monthlyRevenue: "Monthly Revenue",
  dailyClicks: "Daily Clicks",
  indexedPages: "Indexed Pages",
};

/**
 * @param {number | null | undefined} value
 */
function isMetricMissing(value) {
  return value === null || value === undefined;
}

/** Huecos a rellenar desde APIs (0 es un valor real guardado en Notion). */
function isEnrichmentGap(value) {
  return isMetricMissing(value);
}

/**
 * @param {Record<MetricId, number | null | undefined>} metrics
 * @returns {MetricId[]}
 */
function listMissingMetrics(metrics) {
  return METRIC_IDS.filter((id) => isMetricMissing(metrics[id]));
}

function listEnrichmentGaps(metrics) {
  return METRIC_IDS.filter((id) => isEnrichmentGap(metrics[id]));
}

module.exports = {
  METRIC_IDS,
  METRIC_LABELS,
  isMetricMissing,
  isEnrichmentGap,
  listMissingMetrics,
  listEnrichmentGaps,
};
