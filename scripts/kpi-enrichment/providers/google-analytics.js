"use strict";

const { log } = require("../logger");
const {
  hasGoogleServiceAccountCredentials,
  gaDataLagDays,
  gaRevenueLookbackDays,
  resolveGa4PropertyIdWithDiscovery,
  getAnalyticsDataClient,
} = require("./ga-client");

function parseMetricValue(response, index = 0) {
  const raw = response.rows?.[0]?.metricValues?.[index]?.value;
  if (raw === undefined || raw === null || raw === "") return null;
  const num = Number.parseFloat(raw);
  return Number.isFinite(num) ? num : null;
}

async function fetchMonthlyRevenue(client, propertyId) {
  const lookback = gaRevenueLookbackDays();
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [
      {
        startDate: `${lookback}daysAgo`,
        endDate: `${gaDataLagDays()}daysAgo`,
      },
    ],
    metrics: [{ name: "totalRevenue" }],
  });
  const revenue = parseMetricValue(response, 0);
  return revenue === null ? null : Math.round(revenue * 100) / 100;
}

/** Proveedor GA4 (ingresos mensuales; no está en la cadena activa si solo usas GSC). */
const googleAnalyticsProvider = {
  id: "google-analytics",
  label: "Google Analytics (GA4)",
  metrics: ["monthlyRevenue"],

  isConfigured() {
    return hasGoogleServiceAccountCredentials();
  },

  /**
   * @param {import("../types").EnrichmentContext} ctx
   * @returns {Promise<Partial<Record<import("../metrics").MetricId, number>>>}
   */
  async fetch(ctx) {
    if (!this.isConfigured()) {
      log.info(
        `${this.id}: omitido (sin service account; reutiliza GSC_SERVICE_ACCOUNT_JSON).`,
      );
      return {};
    }

    const propertyId = await resolveGa4PropertyIdWithDiscovery(ctx.domain);
    if (!propertyId) {
      log.warn(
        `${this.id}: sin GA4 property para ${ctx.domain} (define GA4_PROPERTY_MAP, GA4_PROPERTY_ID_<DOMINIO> o GA4_AUTO_DISCOVER_PROPERTIES=1).`,
      );
      return {};
    }

    const client = await getAnalyticsDataClient();
    if (!client) return {};

    const patch = {};
    const wantsRevenue = ctx.missing.includes("monthlyRevenue");

    try {
      if (wantsRevenue) {
        const monthlyRevenue = await fetchMonthlyRevenue(client, propertyId);
        if (monthlyRevenue !== null) {
          patch.monthlyRevenue = monthlyRevenue;
          log.info(
            `${this.id}: ${ctx.domain} monthlyRevenue=${monthlyRevenue} (property ${propertyId}, ${gaRevenueLookbackDays()}d)`,
          );
        } else {
          log.warn(
            `${this.id}: sin ingresos GA4 para ${ctx.domain} (property ${propertyId})`,
          );
        }
      }
    } catch (err) {
      const message = err?.message || String(err);
      log.error(
        `${this.id}: error en ${ctx.domain} (property ${propertyId}): ${message}`,
      );
      return {};
    }

    return patch;
  },
};

module.exports = { googleAnalyticsProvider };
