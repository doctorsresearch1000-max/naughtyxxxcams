"use strict";

const { google } = require("googleapis");
const { BetaAnalyticsDataClient } = require("@google-analytics/data");
const {
  hasGoogleServiceAccountCredentials,
  getServiceAccountClientOptions,
} = require("../google-credentials");
const { normalizeDomain } = require("../skip-domains");

/** @type {BetaAnalyticsDataClient | null} */
let cachedDataClient = null;
/** @type {Map<string, string>} */
const discoveredPropertyByDomain = new Map();

function gaDataLagDays() {
  const parsed = Number.parseInt(process.env.GA4_DATA_LAG_DAYS || "1", 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 1;
}

function gaRevenueLookbackDays() {
  const parsed = Number.parseInt(process.env.GA4_REVENUE_LOOKBACK_DAYS || "30", 10);
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : 30;
}

function domainEnvKey(domain) {
  return domain
    .replace(/^www\./i, "")
    .toLowerCase()
    .replace(/\./g, "_")
    .replace(/-/g, "_")
    .toUpperCase();
}

function readPropertyMap() {
  const raw = process.env.GA4_PROPERTY_MAP?.trim();
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * @param {string | null | undefined} domain
 */
function resolveGa4PropertyId(domain) {
  if (!domain) return null;
  const bare = normalizeDomain(domain);
  const map = readPropertyMap();
  if (map[bare]) {
    return String(map[bare]).replace(/^properties\//, "");
  }

  const perDomainEnv = process.env[`GA4_PROPERTY_ID_${domainEnvKey(bare)}`]?.trim();
  if (perDomainEnv) {
    return perDomainEnv.replace(/^properties\//, "");
  }

  const global = process.env.GA4_PROPERTY_ID?.trim();
  if (global) return global.replace(/^properties\//, "");

  return discoveredPropertyByDomain.get(bare) || null;
}

async function getAnalyticsDataClient() {
  if (cachedDataClient) return cachedDataClient;
  const options = getServiceAccountClientOptions([
    "https://www.googleapis.com/auth/analytics.readonly",
  ]);
  if (!options) return null;

  cachedDataClient = new BetaAnalyticsDataClient(options);
  return cachedDataClient;
}

async function getAnalyticsAdminAuth() {
  const options = getServiceAccountClientOptions([
    "https://www.googleapis.com/auth/analytics.readonly",
  ]);
  if (!options) return null;
  const auth = new google.auth.GoogleAuth(options);
  return auth;
}

/**
 * Descubre property ID buscando web data streams cuyo defaultUri contiene el dominio.
 * @param {string} domain
 */
async function discoverGa4PropertyId(domain) {
  const bare = normalizeDomain(domain);
  if (!bare) return null;
  if (discoveredPropertyByDomain.has(bare)) {
    return discoveredPropertyByDomain.get(bare);
  }

  const auth = await getAnalyticsAdminAuth();
  if (!auth) return null;

  const admin = google.analyticsadmin({ version: "v1beta", auth });
  let pageToken;
  do {
    const { data } = await admin.accountSummaries.list({
      pageSize: 200,
      pageToken,
    });
    for (const account of data.accountSummaries || []) {
      for (const propertySummary of account.propertySummaries || []) {
        const propertyResource = propertySummary.property;
        if (!propertyResource) continue;
        const streams = await admin.properties.dataStreams.list({
          parent: propertyResource,
        });
        for (const stream of streams.data.dataStreams || []) {
          const uri = stream.webStreamData?.defaultUri || "";
          if (uri.toLowerCase().includes(bare)) {
            const id = propertyResource.replace(/^properties\//, "");
            discoveredPropertyByDomain.set(bare, id);
            return id;
          }
        }
      }
    }
    pageToken = data.nextPageToken;
  } while (pageToken);

  return null;
}

/**
 * @param {string} domain
 */
async function resolveGa4PropertyIdWithDiscovery(domain) {
  const direct = resolveGa4PropertyId(domain);
  if (direct) return direct;
  if (process.env.GA4_AUTO_DISCOVER_PROPERTIES !== "1") {
    return null;
  }
  try {
    return await discoverGa4PropertyId(domain);
  } catch {
    return null;
  }
}

module.exports = {
  hasGoogleServiceAccountCredentials,
  gaDataLagDays,
  gaRevenueLookbackDays,
  resolveGa4PropertyId,
  resolveGa4PropertyIdWithDiscovery,
  getAnalyticsDataClient,
};
