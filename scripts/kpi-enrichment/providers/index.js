"use strict";

const { googleSearchConsoleProvider } = require("./google-search-console");

/** Solo Google Search Console (métricas reales). Sin simulaciones. */
const KPI_PROVIDERS = [googleSearchConsoleProvider];

module.exports = { KPI_PROVIDERS };
