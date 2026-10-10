"use strict";

const { googleAnalyticsProvider } = require("./google-analytics");
const { googleSearchConsoleProvider } = require("./google-search-console");
const { trafficEstimateProvider } = require("./traffic-estimate");
const { camNetworkSimulatedProvider } = require("./cam-network-simulated");

/** Orden de ejecución: el primero que aporte un valor gana por métrica. */
const KPI_PROVIDERS = [
  googleSearchConsoleProvider,
  googleAnalyticsProvider,
  trafficEstimateProvider,
  camNetworkSimulatedProvider,
];

module.exports = { KPI_PROVIDERS };
