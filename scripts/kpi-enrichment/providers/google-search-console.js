"use strict";

const { log } = require("../logger");

/** Proveedor Google Search Console (clics diarios, páginas indexadas). */
const googleSearchConsoleProvider = {
  id: "google-search-console",
  label: "Google Search Console",
  metrics: ["dailyClicks", "indexedPages"],

  isConfigured() {
    return Boolean(
      process.env.GSC_SITE_URL?.trim() &&
        (process.env.GSC_SERVICE_ACCOUNT_JSON?.trim() ||
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
        `${this.id}: omitido (define GSC_SITE_URL y credenciales de servicio).`,
      );
      return {};
    }

    // Punto de extensión: Search Console API searchanalytics.query + sitemaps/index coverage.
    log.warn(
      `${this.id}: credenciales detectadas pero el cliente aún no está implementado para ${ctx.domain}.`,
    );
    return {};
  },
};

module.exports = { googleSearchConsoleProvider };
