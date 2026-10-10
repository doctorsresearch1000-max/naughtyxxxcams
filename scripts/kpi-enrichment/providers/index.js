"use strict";

const { googleSearchConsoleProvider } = require("./google-search-console");
const { crakRevenueProvider } = require("./crakrevenue");

/** Fuentes reales: GSC (clics/indexación) + CrakRevenue (ingresos). Sin simulaciones. */
const KPI_PROVIDERS = [
  googleSearchConsoleProvider,
  crakRevenueProvider,
];

module.exports = { KPI_PROVIDERS };
