"use strict";

const { log } = require("../logger");
const {
  hasGscCredentials,
  getSearchConsoleClient,
  formatIsoDate,
  utcDaysAgo,
  gscDataLagDays,
  gscClicksWindowDays,
  gscIndexedLookbackDays,
  siteUrlForDomain,
} = require("./gsc-client");

/**
 * @param {import("googleapis").searchconsole_v1.Searchconsole} searchconsole
 * @param {string} siteUrl
 * @param {object} requestBody
 */
async function querySearchAnalytics(searchconsole, siteUrl, requestBody) {
  for (const dataState of ["final", "all"]) {
    const { data } = await searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: { ...requestBody, dataState },
    });
    if (data.rows?.length) {
      return { data, dataState };
    }
  }
  const { data } = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: { ...requestBody, dataState: "final" },
  });
  return { data, dataState: "final" };
}

/**
 * Clics agregados en un rango (sin dimensión date).
 */
async function fetchAggregateClicks(searchconsole, siteUrl, startDate, endDate) {
  const { data } = await querySearchAnalytics(searchconsole, siteUrl, {
    startDate,
    endDate,
  });
  const clicks = data.rows?.[0]?.clicks;
  return typeof clicks === "number" ? clicks : 0;
}

/**
 * Resuelve clics diarios: día único con lag → ventana 7d (último día con datos) → media en ventana.
 */
async function fetchDailyClicks(searchconsole, siteUrl, domainLabel) {
  const lag = gscDataLagDays();
  const windowDays = gscClicksWindowDays();
  const endDate = formatIsoDate(utcDaysAgo(lag));
  const windowStartDate = formatIsoDate(utcDaysAgo(lag + windowDays - 1));

  const singleDayClicks = await fetchAggregateClicks(
    searchconsole,
    siteUrl,
    endDate,
    endDate,
  );
  if (singleDayClicks > 0) {
    log.info(
      `google-search-console: ${domainLabel} dailyClicks=${singleDayClicks} (día ${endDate}, lag ${lag}d)`,
    );
    return singleDayClicks;
  }

  const { data: byDate, dataState } = await querySearchAnalytics(
    searchconsole,
    siteUrl,
    {
      startDate: windowStartDate,
      endDate,
      dimensions: ["date"],
      rowLimit: 25000,
    },
  );

  const rows = byDate.rows || [];
  if (rows.length > 0) {
    const sorted = [...rows].sort((a, b) =>
      String(b.keys?.[0] || "").localeCompare(String(a.keys?.[0] || "")),
    );
    const latestWithClicks = sorted.find((row) => (row.clicks || 0) > 0);
    if (latestWithClicks) {
      const day = latestWithClicks.keys?.[0];
      const clicks = latestWithClicks.clicks || 0;
      log.info(
        `google-search-console: ${domainLabel} dailyClicks=${clicks} (último día con datos ${day}, ventana ${windowStartDate}→${endDate}, ${dataState})`,
      );
      return clicks;
    }

    const totalClicks = rows.reduce((sum, row) => sum + (row.clicks || 0), 0);
    if (totalClicks > 0) {
      const avgDaily = Math.round(totalClicks / rows.length);
      log.info(
        `google-search-console: ${domainLabel} dailyClicks≈${avgDaily} (media ${totalClicks}/${rows.length} días con filas, ${windowStartDate}→${endDate})`,
      );
      return avgDaily;
    }
  }

  const windowTotal = await fetchAggregateClicks(
    searchconsole,
    siteUrl,
    windowStartDate,
    endDate,
  );
  if (windowTotal > 0) {
    const avgDaily = Math.round(windowTotal / windowDays);
    log.info(
      `google-search-console: ${domainLabel} dailyClicks≈${avgDaily} (media ventana ${windowTotal}/${windowDays}d, ${windowStartDate}→${endDate})`,
    );
    return avgDaily;
  }

  log.info(
    `google-search-console: ${domainLabel} dailyClicks=0 (sin clics ${windowStartDate}→${endDate}, lag ${lag}d)`,
  );
  return 0;
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
    const { data } = await querySearchAnalytics(searchconsole, siteUrl, {
      startDate,
      endDate,
      dimensions: ["page"],
      rowLimit,
      startRow,
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
        patch.dailyClicks = await fetchDailyClicks(
          searchconsole,
          siteUrl,
          ctx.domain,
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
