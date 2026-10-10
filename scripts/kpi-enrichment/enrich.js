"use strict";

const { KPI_PROVIDERS } = require("./providers");
const {
  METRIC_IDS,
  METRIC_LABELS,
  isMetricMissing,
} = require("./metrics");
const { log } = require("./logger");
const {
  metricNotAttempted,
  isSuccessfulOutcome,
} = require("./outcomes");

/**
 * Scheduled sync refreshes all KPI metrics by default.
 * KPI_ENRICH_GAP_ONLY=1 — only fetch metrics that are null/undefined in Notion (legacy).
 * KPI_ENRICH_OVERWRITE=1 — kept for compatibility; full refresh is already the default.
 *
 * @param {import("./types").EnrichmentContext} ctx
 * @param {typeof KPI_PROVIDERS} [providers]
 * @returns {Promise<import("./types").EnrichmentResult>}
 */
async function enrichRowMetrics(ctx, providers = KPI_PROVIDERS) {
  const outcomes = initOutcomes();
  const filledBy = {
    monthlyRevenue: null,
    dailyClicks: null,
    indexedPages: null,
  };
  const successfulUpdates = {};

  if (!ctx.domain) {
    log.warn(
      `Fila "${ctx.label}" (${ctx.pageId}): sin dominio; se conservan las métricas actuales.`,
    );
    return buildResult(ctx, ctx.current, filledBy, outcomes, successfulUpdates);
  }

  const refreshMetrics = resolveRefreshMetrics(ctx);
  const refreshSet = new Set(refreshMetrics);

  if (refreshSet.size === 0) {
    return buildResult(ctx, ctx.current, filledBy, outcomes, successfulUpdates);
  }

  const providerCtx = {
    ...ctx,
    refreshMetrics,
    missing: refreshMetrics,
  };

  for (const provider of providers) {
    const relevant = provider.metrics.filter((m) => refreshSet.has(m));
    if (relevant.length === 0) continue;

    let providerOutcomes = {};
    try {
      providerOutcomes = await provider.fetch(providerCtx);
    } catch (err) {
      const message = err?.message || String(err);
      log.error(`${provider.id} falló para ${ctx.domain}: ${message}`);
      for (const metricId of relevant) {
        if (outcomes[metricId].status === "not_attempted") {
          outcomes[metricId] = {
            status: "failure",
            message: `${provider.id}: ${message}`,
          };
        }
      }
      continue;
    }

    for (const metricId of relevant) {
      const outcome = providerOutcomes[metricId];
      if (!outcome) {
        if (outcomes[metricId].status === "not_attempted") {
          outcomes[metricId] = {
            status: "failure",
            message: `${provider.id}: sin resultado para ${METRIC_LABELS[metricId]}`,
          };
        }
        continue;
      }

      outcomes[metricId] = outcome;

      if (isSuccessfulOutcome(outcome)) {
        successfulUpdates[metricId] = outcome.value;
        filledBy[metricId] = provider.id;
        refreshSet.delete(metricId);
        log.metricFilled(
          ctx.domain,
          METRIC_LABELS[metricId],
          outcome.value,
          provider.id,
        );
      } else if (outcome.status === "failure") {
        log.error(
          `${ctx.domain} · ${METRIC_LABELS[metricId]}: ${outcome.message}`,
        );
      } else if (outcome.status === "skipped") {
        log.info(
          `${ctx.domain} · ${METRIC_LABELS[metricId]}: omitido (${outcome.reason})`,
        );
      }
    }
  }

  for (const metricId of refreshMetrics) {
    if (outcomes[metricId].status !== "not_attempted") continue;
    outcomes[metricId] = metricNotAttempted();
  }

  return buildResult(
    ctx,
    mergeForSnapshot(ctx.current, successfulUpdates),
    filledBy,
    outcomes,
    successfulUpdates,
  );
}

/**
 * @param {import("./types").EnrichmentContext} ctx
 * @returns {import("./metrics").MetricId[]}
 */
function resolveRefreshMetrics(ctx) {
  if (process.env.KPI_ENRICH_GAP_ONLY === "1") {
    return [...ctx.missing];
  }
  return [...METRIC_IDS];
}

function initOutcomes() {
  /** @type {Record<import("./metrics").MetricId, import("./outcomes").MetricOutcome>} */
  const outcomes = {};
  for (const id of METRIC_IDS) {
    outcomes[id] = metricNotAttempted();
  }
  return outcomes;
}

function mergeForSnapshot(current, successfulUpdates) {
  return {
    monthlyRevenue:
      successfulUpdates.monthlyRevenue !== undefined
        ? successfulUpdates.monthlyRevenue
        : current.monthlyRevenue,
    dailyClicks:
      successfulUpdates.dailyClicks !== undefined
        ? successfulUpdates.dailyClicks
        : current.dailyClicks,
    indexedPages:
      successfulUpdates.indexedPages !== undefined
        ? successfulUpdates.indexedPages
        : current.indexedPages,
  };
}

function buildResult(ctx, merged, filledBy, outcomes, successfulUpdates) {
  const stillMissing = METRIC_IDS.filter((id) => isMetricMissing(merged[id]));
  const mainDbChanged = METRIC_IDS.some(
    (id) =>
      successfulUpdates[id] !== undefined &&
      successfulUpdates[id] !== ctx.current[id],
  );
  const refreshIncomplete = METRIC_IDS.some((id) => {
    const status = outcomes[id].status;
    return status === "failure" || status === "skipped" || status === "not_attempted";
  });

  return {
    merged,
    filledBy,
    stillMissing,
    mainDbChanged,
    outcomes,
    successfulUpdates,
    refreshIncomplete,
  };
}

module.exports = {
  enrichRowMetrics,
  resolveRefreshMetrics,
  mergeForSnapshot,
};
