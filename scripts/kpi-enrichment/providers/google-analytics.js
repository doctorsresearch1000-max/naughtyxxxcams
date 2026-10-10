"use strict";

const { log } = require("../logger");

/** Proveedor GA4 / Google Analytics (ingresos, clics de sesión). */
const googleAnalyticsProvider = {
  id: "google-analytics",
  label: "Google Analytics (GA4)",
  metrics: ["monthlyRevenue", "dailyClicks"],

  isConfigured() {
    return Boolean(
      process.env.GA4_PROPERTY_ID?.trim() &&
        (process.env.GA4_SERVICE_ACCOUNT_JSON?.trim() ||
          process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim()),
    );
  },

  /**
   * @param {import("../types").EnrichmentContext} ctx
   * @returns {Promise<Partial<Record<import("../metrics").MetricId, number>>>}
   */
  async fetch(ctx) {
    if (!this.isConfigured()) {
      log.info(
        `${this.id}: omitido (define GA4_PROPERTY_ID y credenciales de servicio).`,
      );
      return {};
    }

    // Punto de extensión: @google-analytics/data o Reporting API v4.
    log.warn(
      `${this.id}: credenciales detectadas pero el cliente aún no está implementado para ${ctx.domain}.`,
    );
    return {};
  },
};

module.exports = { googleAnalyticsProvider };
