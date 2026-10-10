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

/**
 * @param {Record<MetricId, number | null | undefined>} metrics
 * @returns {MetricId[]}
 */
function listMissingMetrics(metrics) {
  return METRIC_IDS.filter((id) => isMetricMissing(metrics[id]));
}

module.exports = {
  METRIC_IDS,
  METRIC_LABELS,
  isMetricMissing,
  listMissingMetrics,
};
