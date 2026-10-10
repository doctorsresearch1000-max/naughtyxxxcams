"use strict";

const { log } = require("../logger");
const {
  hasGscCredentials,
  getSearchConsoleClient,
  formatIsoDate,
  utcDaysAgo,
  gscDataLagDays,
  gscIndexedLookbackDays,
  siteUrlForDomain,
} = require("./gsc-client");

/**
 * Clics del último día disponible en Search Analytics (respeta GSC_DATA_LAG_DAYS).
 */
async function fetchDailyClicks(searchconsole, siteUrl) {
  const lag = gscDataLagDays();
  const day = formatIsoDate(utcDaysAgo(lag));

  const { data } = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: day,
      endDate: day,
      dataState: "final",
    },
  });

  const clicks = data.rows?.[0]?.clicks;
  return typeof clicks === "number" ? clicks : null;
}

/**
 * Proxy de páginas indexadas con tráfico: URLs distintas con impresiones en el periodo.
 */
async function fetchIndexedPagesEstimate(searchconsole, siteUrl) {
  const lag = gscDataLagDays();
  const endDate = formatIsoDate(utcDaysAgo(lag));
  const startDate = formatIsoDate(
    utcDaysAgo(lag + gscIndexedLookbackDays() - 1),
  );

  let total = 0;
  let startRow = 0;
  const rowLimit = 25000;

  while (true) {
    const { data } = await searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ["page"],
        rowLimit,
        startRow,
        dataState: "final",
      },
    });

    const rows = data.rows || [];
    total += rows.length;
    if (rows.length < rowLimit) break;
    startRow += rowLimit;
    if (startRow >= 100000) {
      log.warn(
        `google-search-console: tope de paginación alcanzado para ${siteUrl}`,
      );
      break;
    }
  }

  return total > 0 ? total : null;
}

/** Proveedor Google Search Console (clics diarios, páginas indexadas). */
const googleSearchConsoleProvider = {
  id: "google-search-console",
  label: "Google Search Console",
  metrics: ["dailyClicks", "indexedPages"],

  isConfigured() {
    return hasGscCredentials();
  },

  /**
   * @param {import("../types").EnrichmentContext} ctx
   * @returns {Promise<Partial<Record<import("../metrics").MetricId, number>>>}
   */
  async fetch(ctx) {
    if (!this.isConfigured()) {
      log.info(
        `${this.id}: omitido (sin credenciales; define GSC_SERVICE_ACCOUNT_JSON).`,
      );
      return {};
    }

    const siteUrl = siteUrlForDomain(ctx.domain);
    if (!siteUrl) {
      log.warn(`${this.id}: sin dominio en la fila; no se puede consultar GSC.`);
      return {};
    }

    const searchconsole = await getSearchConsoleClient();
    if (!searchconsole) return {};

    const patch = {};
    const wantsClicks = ctx.missing.includes("dailyClicks");
    const wantsIndexed = ctx.missing.includes("indexedPages");

    try {
      if (wantsClicks) {
        const clicks = await fetchDailyClicks(searchconsole, siteUrl);
        patch.dailyClicks = clicks ?? 0;
        log.info(
          `${this.id}: ${ctx.domain} dailyClicks=${patch.dailyClicks} (site ${siteUrl})`,
        );
      }

      if (wantsIndexed) {
        const indexed = await fetchIndexedPagesEstimate(searchconsole, siteUrl);
        patch.indexedPages = indexed ?? 0;
        log.info(
          `${this.id}: ${ctx.domain} indexedPages=${patch.indexedPages} (URLs con impresiones, ${gscIndexedLookbackDays()}d)`,
        );
      }
    } catch (err) {
      const message = err?.response?.data?.error?.message || err.message;
      log.error(`${this.id}: error en ${ctx.domain} (${siteUrl}): ${message}`);
      return {};
    }

    return patch;
  },
};

module.exports = { googleSearchConsoleProvider };
