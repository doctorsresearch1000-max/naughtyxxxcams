"use strict";

const { log } = require("../logger");
const {
  readApiKey,
  resolveSubIdForDomain,
  fetchMonthToDatePayoutForSubId,
  currentMonthDateRangeUtc,
} = require("./crakrevenue-client");

/** Ingresos del mes (MTD) por Sub-ID vía CrakRevenue stats API (HasOffers/TUNE). */
const crakRevenueProvider = {
  id: "crakrevenue",
  label: "CrakRevenue",
  metrics: ["monthlyRevenue"],

  isConfigured() {
    return Boolean(readApiKey());
  },

  /**
   * @param {import("../types").EnrichmentContext} ctx
   * @returns {Promise<Partial<Record<import("../metrics").MetricId, number>>>}
   */
  async fetch(ctx) {
    if (!this.isConfigured()) {
      log.info(
        `${this.id}: omitido (define CRAKREVENUE_API_KEY en el entorno).`,
      );
      return {};
    }

    if (!ctx.missing.includes("monthlyRevenue")) {
      return {};
    }

    const subId = resolveSubIdForDomain(ctx.domain);
    if (!subId) {
      log.warn(
        `${this.id}: ${ctx.domain || ctx.label} sin Sub-ID mapeado → monthlyRevenue=0`,
      );
      return { monthlyRevenue: 0 };
    }

    const { startDate, endDate } = currentMonthDateRangeUtc();

    try {
      const payout = await fetchMonthToDatePayoutForSubId(subId);
      const revenue =
        payout === null || payout === undefined
          ? 0
          : Math.round(Number(payout) * 100) / 100;

      log.info(
        `${this.id}: ${ctx.domain} monthlyRevenue=${revenue} (subid: ${subId}, ${startDate}→${endDate})`,
      );
      return { monthlyRevenue: revenue };
    } catch (err) {
      log.error(
        `${this.id}: error ${ctx.domain} (subid: ${subId}): ${err.message || err}`,
      );
      return { monthlyRevenue: 0 };
    }
  },
};

module.exports = { crakRevenueProvider };
