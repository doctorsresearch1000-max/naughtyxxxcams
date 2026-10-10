"use strict";

const { log } = require("../logger");
const {
  metricSuccess,
  metricFailure,
  metricSkipped,
} = require("../outcomes");
const {
  readApiKey,
  resolveSubIdForDomain,
  fetchMonthToDatePayoutForSubId,
  currentMonthDateRangeUtc,
} = require("./crakrevenue-client");

function refreshList(ctx) {
  return ctx.refreshMetrics?.length ? ctx.refreshMetrics : ctx.missing;
}

/** Ingresos MTD por Sub ID 2 (Stat.affiliate_info2 / aff_sub2) vía CrakRevenue stats API. */
const crakRevenueProvider = {
  id: "crakrevenue",
  label: "CrakRevenue",
  metrics: ["monthlyRevenue"],

  isConfigured() {
    return Boolean(readApiKey());
  },

  /**
   * @param {import("../types").EnrichmentContext} ctx
   * @returns {Promise<Partial<Record<import("../metrics").MetricId, import("../outcomes").MetricOutcome>>>}
   */
  async fetch(ctx) {
    const refresh = refreshList(ctx);
    if (!refresh.includes("monthlyRevenue")) {
      return {};
    }

    if (!this.isConfigured()) {
      log.info(
        `${this.id}: omitido (define CRAKREVENUE_API_KEY en el entorno).`,
      );
      return { monthlyRevenue: metricSkipped("CrakRevenue no configurado") };
    }

    const subId = resolveSubIdForDomain(ctx.domain);
    if (!subId) {
      log.warn(
        `${this.id}: ${ctx.domain || ctx.label} sin Sub-ID mapeado (se conserva el valor en Notion).`,
      );
      return {
        monthlyRevenue: metricSkipped("sin Sub-ID mapeado para el dominio"),
      };
    }

    const { startDate, endDate } = currentMonthDateRangeUtc();

    try {
      const payout = await fetchMonthToDatePayoutForSubId(subId);
      if (payout === null || payout === undefined) {
        return {
          monthlyRevenue: metricFailure(
            "respuesta vacía de CrakRevenue stats API",
          ),
        };
      }
      const revenue = Math.round(Number(payout) * 100) / 100;
      if (!Number.isFinite(revenue)) {
        return {
          monthlyRevenue: metricFailure("payout no numérico en respuesta API"),
        };
      }

      log.info(
        `${this.id}: ${ctx.domain} monthlyRevenue=${revenue} (subid: ${subId}, ${startDate}→${endDate})`,
      );
      return { monthlyRevenue: metricSuccess(revenue) };
    } catch (err) {
      log.error(
        `${this.id}: error ${ctx.domain} (subid: ${subId}): ${err.message || err}`,
      );
      return {
        monthlyRevenue: metricFailure(err.message || String(err)),
      };
    }
  },
};

module.exports = { crakRevenueProvider };
