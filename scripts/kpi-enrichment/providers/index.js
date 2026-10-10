"use strict";

const { googleAnalyticsProvider } = require("./google-analytics");
const { googleSearchConsoleProvider } = require("./google-search-console");
const { trafficEstimateProvider } = require("./traffic-estimate");

/** Orden de ejecución: el primero que aporte un valor gana por métrica. */
const KPI_PROVIDERS = [
  googleSearchConsoleProvider,
  googleAnalyticsProvider,
  trafficEstimateProvider,
];

module.exports = { KPI_PROVIDERS };
