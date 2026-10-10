"use strict";

/**
 * @typedef {import("./metrics").MetricId} MetricId
 *
 * @typedef {object} EnrichmentContext
 * @property {string} pageId
 * @property {string} label
 * @property {string | null} domain
 * @property {Record<MetricId, number | null>} current
 * @property {MetricId[]} missing
 *
 * @typedef {object} EnrichmentResult
 * @property {Record<MetricId, number | null>} merged
 * @property {Record<MetricId, string | null>} filledBy
 * @property {MetricId[]} stillMissing
 * @property {boolean} mainDbChanged
 */

module.exports = {};
