"use strict";

/**
 * @typedef {import("./metrics").MetricId} MetricId
 * @typedef {import("./outcomes").MetricOutcome} MetricOutcome
 *
 * @typedef {object} EnrichmentContext
 * @property {string} pageId
 * @property {string} label
 * @property {string | null} domain
 * @property {Record<MetricId, number | null>} current
 * @property {MetricId[]} missing
 * @property {MetricId[]} [refreshMetrics]
 *
 * @typedef {object} EnrichmentResult
 * @property {Record<MetricId, number | null>} merged
 * @property {Record<MetricId, string | null>} filledBy
 * @property {MetricId[]} stillMissing
 * @property {boolean} mainDbChanged
 * @property {Record<MetricId, MetricOutcome>} outcomes
 * @property {Partial<Record<MetricId, number>>} successfulUpdates
 * @property {boolean} refreshIncomplete
 */

module.exports = {};
