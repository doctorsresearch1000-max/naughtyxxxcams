"use strict";

const { KPI_PROVIDERS } = require("./providers");
const {
  METRIC_IDS,
  METRIC_LABELS,
  isMetricMissing,
} = require("./metrics");
const { log } = require("./logger");

const ZERO_REASON_NO_DOMAIN = "sin dominio";
const ZERO_REASON_NO_API_DATA =
  "sin datos reales de Search Console / APIs configuradas";

/**
 * @param {import("./types").EnrichmentContext} ctx
 * @returns {Promise<import("./types").EnrichmentResult>}
 */
async function enrichRowMetrics(ctx) {
  const merged = { ...ctx.current };
  const filledBy = {
    monthlyRevenue: null,
    dailyClicks: null,
    indexedPages: null,
  };

  if (!ctx.domain) {
    log.warn(
      `Fila "${ctx.label}" (${ctx.pageId}): sin dominio; las métricas se pondrán a 0.`,
    );
    return finalize(ctx, merged, filledBy);
  }

  const targets = new Set(ctx.missing);
  if (process.env.KPI_ENRICH_OVERWRITE === "1") {
    for (const id of METRIC_IDS) targets.add(id);
  }

  if (targets.size > 0) {
    for (const provider of KPI_PROVIDERS) {
      const relevant = provider.metrics.filter((m) => targets.has(m));
      if (relevant.length === 0) continue;

      let patch = {};
      try {
        patch = await provider.fetch({ ...ctx, missing: [...targets] });
      } catch (err) {
        log.error(
          `${provider.id} falló para ${ctx.domain}: ${err.message || err}`,
        );
        continue;
      }

      for (const metricId of relevant) {
        const value = patch[metricId];
        if (isMetricMissing(value)) continue;
        if (!targets.has(metricId) && !isMetricMissing(merged[metricId])) {
          continue;
        }

        merged[metricId] = value;
        filledBy[metricId] = provider.id;
        targets.delete(metricId);
        log.metricFilled(
          ctx.domain,
          METRIC_LABELS[metricId],
          value,
          provider.id,
        );
      }
    }
  }

  return finalize(ctx, merged, filledBy);
}

/**
 * @param {import("./types").EnrichmentContext} ctx
 * @param {Record<string, number | null>} merged
 * @param {Record<string, string | null>} filledBy
 */
function finalize(ctx, merged, filledBy) {
  const zeroReason = ctx.domain ? ZERO_REASON_NO_API_DATA : ZERO_REASON_NO_DOMAIN;

  for (const metricId of METRIC_IDS) {
    if (filledBy[metricId]) continue;
    if (merged[metricId] === 0) continue;
    merged[metricId] = 0;
    log.metricZeroed(ctx.domain || ctx.label, METRIC_LABELS[metricId], zeroReason);
  }

  const stillMissing = [];
  const mainDbChanged = METRIC_IDS.some((id) => merged[id] !== ctx.current[id]);

  return { merged, filledBy, stillMissing, mainDbChanged };
}

module.exports = { enrichRowMetrics };
