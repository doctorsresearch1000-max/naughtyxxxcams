"use strict";

const { google } = require("googleapis");

/** @type {import("googleapis").searchconsole_v1.Searchconsole | null} */
let cachedSearchConsole = null;

function hasGscCredentials() {
  return Boolean(
    process.env.GSC_SERVICE_ACCOUNT_JSON?.trim() ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim(),
  );
}

async function getSearchConsoleClient() {
  if (cachedSearchConsole) return cachedSearchConsole;
  if (!hasGscCredentials()) return null;

  const scopes = ["https://www.googleapis.com/auth/webmasters.readonly"];
  let auth;

  const inlineJson = process.env.GSC_SERVICE_ACCOUNT_JSON?.trim();
  if (inlineJson) {
    auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(inlineJson),
      scopes,
    });
  } else {
    auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS.trim(),
      scopes,
    });
  }

  cachedSearchConsole = google.searchconsole({ version: "v1", auth });
  return cachedSearchConsole;
}

function formatIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function utcDaysAgo(days) {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - days);
  return date;
}

function gscDataLagDays() {
  const parsed = Number.parseInt(process.env.GSC_DATA_LAG_DAYS || "2", 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 2;
}

function gscIndexedLookbackDays() {
  const parsed = Number.parseInt(process.env.GSC_INDEXED_LOOKBACK_DAYS || "28", 10);
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : 28;
}

/**
 * @param {string | null | undefined} domain
 */
function siteUrlForDomain(domain) {
  const globalOverride = process.env.GSC_SITE_URL?.trim();
  if (globalOverride) return globalOverride;
  if (!domain) return null;
  const bare = domain.replace(/^www\./i, "").toLowerCase();
  return `sc-domain:${bare}`;
}

module.exports = {
  hasGscCredentials,
  getSearchConsoleClient,
  formatIsoDate,
  utcDaysAgo,
  gscDataLagDays,
  gscIndexedLookbackDays,
  siteUrlForDomain,
};
