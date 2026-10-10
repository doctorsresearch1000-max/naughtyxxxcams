"use strict";

const { log } = require("../logger");

/**
 * Placeholder para scrapers o APIs de estimación de tráfico (Similarweb, etc.).
 * Actívalo con TRAFFIC_ESTIMATE_API_URL + TRAFFIC_ESTIMATE_API_KEY.
 */
const trafficEstimateProvider = {
  id: "traffic-estimate",
  label: "Traffic estimate API / scraper",
  metrics: ["dailyClicks"],

  isConfigured() {
    return Boolean(
      process.env.TRAFFIC_ESTIMATE_API_URL?.trim() &&
        process.env.TRAFFIC_ESTIMATE_API_KEY?.trim(),
    );
  },

  /**
   * @param {import("../types").EnrichmentContext} ctx
   * @returns {Promise<Partial<Record<import("../metrics").MetricId, number>>>}
   */
  async fetch(ctx) {
    if (!this.isConfigured()) {
      log.info(
        `${this.id}: omitido (TRAFFIC_ESTIMATE_API_URL / TRAFFIC_ESTIMATE_API_KEY).`,
      );
      return {};
    }

    log.warn(
      `${this.id}: endpoint configurado; implementa la llamada HTTP en providers/traffic-estimate.js para ${ctx.domain}.`,
    );
    return {};
  },
};

module.exports = { trafficEstimateProvider };
