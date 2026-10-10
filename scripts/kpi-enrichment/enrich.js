"use strict";

const { KPI_PROVIDERS } = require("./providers");
const {
  METRIC_IDS,
  METRIC_LABELS,
  listEnrichmentGaps,
  isMetricMissing,
} = require("./metrics");
const { log } = require("./logger");

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
      `Fila "${ctx.label}" (${ctx.pageId}): sin dominio detectado; no se pueden consultar APIs externas.`,
    );
    return finalize(ctx, merged, filledBy);
  }

  const targets = new Set(ctx.missing);
  if (process.env.KPI_ENRICH_OVERWRITE === "1") {
    for (const id of METRIC_IDS) targets.add(id);
  }

  if (targets.size === 0) {
    return finalize(ctx, merged, filledBy);
  }

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
      if (!targets.has(metricId) && !isMetricMissing(merged[metricId])) continue;

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

  return finalize(ctx, merged, filledBy);
}

/**
 * @param {import("./types").EnrichmentContext} ctx
 * @param {Record<string, number | null>} merged
 * @param {Record<string, string | null>} filledBy
 */
function finalize(ctx, merged, filledBy) {
  const stillMissing = listEnrichmentGaps(merged);
  for (const metricId of stillMissing) {
    const reason = !ctx.domain
      ? "añade dominio en columna Site/Domain/URL"
      : "ningún proveedor configurado devolvió valor";
    log.metricStillMissing(
      ctx.domain || ctx.label,
      METRIC_LABELS[metricId],
      reason,
    );
  }

  const mainDbChanged = Object.keys(filledBy).some((k) => filledBy[k] != null);

  return { merged, filledBy, stillMissing, mainDbChanged };
}

module.exports = { enrichRowMetrics };
