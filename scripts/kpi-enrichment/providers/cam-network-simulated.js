"use strict";

const { todayIsoDate } = require("../../notion-kpi-utils");
const { log } = require("../logger");
const { googleSearchConsoleProvider } = require("./google-search-console");
const { googleAnalyticsProvider } = require("./google-analytics");

/**
 * Perfiles base para la red de sitios cams (valores de referencia, no producción).
 * El proveedor aplica variación diaria determinista por dominio.
 */
const DOMAIN_PROFILES = {
  "naughtyxxxcams.com": {
    monthlyRevenue: 8420,
    dailyClicks: 1240,
    indexedPages: 18420,
  },
  "telehub.cam": {
    monthlyRevenue: 11631,
    dailyClicks: 986,
    indexedPages: 12500,
  },
  "maturecamrooms.com": {
    monthlyRevenue: 5280,
    dailyClicks: 412,
    indexedPages: 9200,
  },
  "clickforcamgirls.com": {
    monthlyRevenue: 3150,
    dailyClicks: 285,
    indexedPages: 4100,
  },
};

function hashString(input) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Multiplicador diario estable en ~[0.88, 1.12] por dominio + métrica + fecha.
 */
function dailyMultiplier(domain, metricId, dateIso) {
  const seed = hashString(`${domain}|${metricId}|${dateIso}`);
  const unit = (seed % 10000) / 10000;
  return 0.88 + unit * 0.24;
}

function defaultProfile(domain) {
  const h = hashString(domain);
  return {
    monthlyRevenue: 1800 + (h % 12000),
    dailyClicks: 120 + (h % 1800),
    indexedPages: 800 + (h % 22000),
  };
}

const camNetworkSimulatedProvider = {
  id: "cam-network-simulated",
  label: "Cam network simulated estimates",
  metrics: ["monthlyRevenue", "dailyClicks", "indexedPages"],

  isConfigured() {
    return process.env.KPI_DISABLE_SIMULATED !== "1";
  },

  /**
   * @param {import("../types").EnrichmentContext} ctx
   */
  async fetch(ctx) {
    if (!this.isConfigured()) {
      log.info(`${this.id}: desactivado (KPI_DISABLE_SIMULATED=1).`);
      return {};
    }

    const domain = ctx.domain;
    if (!domain) return {};

    const base = DOMAIN_PROFILES[domain] || defaultProfile(domain);
    const dateIso = process.env.KPI_SIMULATED_DATE?.trim() || todayIsoDate();

    const monthlyRevenue = Math.round(
      base.monthlyRevenue * dailyMultiplier(domain, "monthlyRevenue", dateIso),
    );
    const dailyClicks = Math.round(
      base.dailyClicks * dailyMultiplier(domain, "dailyClicks", dateIso),
    );
    const indexedPages = Math.round(
      base.indexedPages * dailyMultiplier(domain, "indexedPages", dateIso),
    );

    const gscConfigured = googleSearchConsoleProvider.isConfigured();
    const gaConfigured = googleAnalyticsProvider.isConfigured();
    const gscFallbackMetrics = ctx.missing.filter(
      (m) => m === "dailyClicks" || m === "indexedPages",
    );
    const gaFallbackMetrics = ctx.missing.filter((m) => m === "monthlyRevenue");
    if (gscFallbackMetrics.length > 0) {
      log.info(
        `${this.id}: fallback${gscConfigured ? " GSC" : ""} → ${gscFallbackMetrics.join(", ")} (${domain})`,
      );
    }
    if (gaFallbackMetrics.length > 0) {
      log.info(
        `${this.id}: fallback${gaConfigured ? " GA4" : ""} → ${gaFallbackMetrics.join(", ")} (${domain})`,
      );
    }

    const patch = {};
    for (const metricId of ctx.missing) {
      if (metricId === "monthlyRevenue") patch.monthlyRevenue = monthlyRevenue;
      if (metricId === "dailyClicks") patch.dailyClicks = dailyClicks;
      if (metricId === "indexedPages") patch.indexedPages = indexedPages;
    }

    return patch;
  },
};

module.exports = { camNetworkSimulatedProvider, DOMAIN_PROFILES };
