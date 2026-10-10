#!/usr/bin/env node
"use strict";

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const { Client } = require("@notionhq/client");
const {
  formatIdWithDashes,
  requireEnv,
  todayIsoDate,
  getDatabaseDataSourceId,
} = require("./notion-kpi-utils");
const { enrichRowMetrics } = require("./kpi-enrichment/enrich");
const { METRIC_LABELS } = require("./kpi-enrichment/metrics");
const { log } = require("./kpi-enrichment/logger");
const { isSkippedDomain } = require("./kpi-enrichment/skip-domains");
const {
  queryAllDataSourceRows,
  buildRowContext,
  buildMainUpdateProperties,
  buildHistorySnapshotProperties,
  resolveHistoryRelationKey,
  resolveKpiPropertyKeys,
  resolveDomainPropertyKey,
} = require("./notion-kpi-sync");

async function main() {
  const dryRun = process.env.KPI_SYNC_DRY_RUN === "1";
  const apiKey = requireEnv("NOTION_API_KEY");
  const mainDbId = formatIdWithDashes(requireEnv("NOTION_MAIN_DB_ID"));
  const historyDbId = formatIdWithDashes(requireEnv("NOTION_HISTORY_DB_ID"));

  const notion = new Client({ auth: apiKey });
  const snapshotDate = todayIsoDate();

  log.section("Notion KPI sync");
  log.info(`Fecha de snapshot: ${snapshotDate}`);
  if (dryRun) log.warn("KPI_SYNC_DRY_RUN=1 — no se escribirá en Notion.");
  log.info(
    "Enriquecimiento: Google Search Console + CrakRevenue (política Real-or-Zero).",
  );

  const mainDataSourceId =
    process.env.NOTION_MAIN_DATA_SOURCE_ID?.trim() ||
    (await getDatabaseDataSourceId(notion, mainDbId)).dataSourceId;

  const historyDataSourceId =
    process.env.NOTION_HISTORY_DATA_SOURCE_ID?.trim() ||
    (await getDatabaseDataSourceId(notion, historyDbId)).dataSourceId;

  const [mainDs, historyDs] = await Promise.all([
    notion.dataSources.retrieve({ data_source_id: mainDataSourceId }),
    notion.dataSources.retrieve({ data_source_id: historyDataSourceId }),
  ]);

  const mainKpiKeys = resolveKpiPropertyKeys(mainDs.properties);
  const domainKey = resolveDomainPropertyKey(mainDs.properties);

  const schemaGaps = Object.entries(mainKpiKeys)
    .filter(([, key]) => !key)
    .map(([id]) => METRIC_LABELS[id] || id);
  if (schemaGaps.length) {
    log.warn(
      `Columnas no encontradas en CAM SITE NETWORK OS: ${schemaGaps.join(", ")}`,
    );
  }
  if (!domainKey) {
    log.warn(
      "No hay columna Site/Domain/URL; el enriquecimiento automático por dominio no podrá ejecutarse.",
    );
  } else {
    log.info(`Columna de dominio detectada: "${domainKey}"`);
  }

  const relationKey = resolveHistoryRelationKey(historyDs);
  if (!relationKey) {
    throw new Error(
      'No se encontró Relation en "KPI History". Ejecuta setup-databases.js.',
    );
  }

  const mainPages = await queryAllDataSourceRows(notion, mainDataSourceId);
  log.section(`Análisis (${mainPages.length} filas)`);

  const stats = {
    rows: mainPages.length,
    rowsWithGaps: 0,
    metricsAutofilled: 0,
    metricsManual: 0,
    mainUpdates: 0,
    historyRows: 0,
  };

  for (const page of mainPages) {
    const ctx = buildRowContext(mainDs, page, mainKpiKeys);
    const gapCount = ctx.missing.length;

    if (gapCount > 0) {
      stats.rowsWithGaps += 1;
      log.info(
        `${ctx.domain || ctx.label}: faltan ${gapCount} métrica(s) — ${ctx.missing
          .map((m) => METRIC_LABELS[m])
          .join(", ")}`,
      );
    } else {
      log.info(`${ctx.domain || ctx.label}: métricas completas en la base principal.`);
    }

    log.section(`Enriquecimiento · ${ctx.domain || ctx.label}`);

    let merged = ctx.current;
    let filledBy = {
      monthlyRevenue: null,
      dailyClicks: null,
      indexedPages: null,
    };
    let stillMissing = ctx.missing;
    let mainDbChanged = false;

    if (isSkippedDomain(ctx.domain)) {
      log.info(
        `${ctx.domain}: enriquecimiento omitido (dominio excluido; solo snapshot con datos actuales).`,
      );
    } else {
      const enriched = await enrichRowMetrics(ctx);
      merged = enriched.merged;
      filledBy = enriched.filledBy;
      stillMissing = enriched.stillMissing;
      mainDbChanged = enriched.mainDbChanged;
    }

    stats.metricsAutofilled += Object.values(filledBy).filter(Boolean).length;
    stats.metricsManual += stillMissing.length;

    if (mainDbChanged && !dryRun) {
      const patch = buildMainUpdateProperties(
        mainDs.properties,
        mainKpiKeys,
        merged,
        ctx.current,
      );
      if (Object.keys(patch).length > 0) {
        await notion.pages.update({
          page_id: page.id,
          properties: patch,
        });
        stats.mainUpdates += 1;
        log.success(
          `Base principal actualizada (${Object.keys(patch).join(", ")}).`,
        );
      }
    } else if (mainDbChanged && dryRun) {
      log.info("DRY RUN: se omitió actualización de la base principal.");
    }

    if (!dryRun) {
      const properties = buildHistorySnapshotProperties(
        historyDs,
        relationKey,
        page.id,
        snapshotDate,
        ctx.label,
        merged,
      );
      await notion.pages.create({
        parent: { type: "data_source_id", data_source_id: historyDataSourceId },
        properties,
      });
      stats.historyRows += 1;
      log.success(`Histórico: snapshot creado para ${ctx.domain || ctx.label}.`);
    } else {
      log.info("DRY RUN: se omitió fila en KPI History.");
    }
  }

  log.section("Resumen");
  log.info(`Filas procesadas: ${stats.rows}`);
  log.info(`Filas con huecos iniciales: ${stats.rowsWithGaps}`);
  log.success(`Métricas autocompletadas: ${stats.metricsAutofilled}`);
  log.info(`Actualizaciones en base principal: ${stats.mainUpdates}`);
  log.success(`Filas añadidas a KPI History: ${stats.historyRows}`);
}

main().catch((err) => {
  log.error(err.body?.message || err.message);
  process.exit(1);
});
