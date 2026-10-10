"use strict";

function hasGoogleServiceAccountCredentials() {
  return Boolean(
    process.env.GSC_SERVICE_ACCOUNT_JSON?.trim() ||
      process.env.GA4_SERVICE_ACCOUNT_JSON?.trim() ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim(),
  );
}

function readInlineServiceAccountJson() {
  const raw =
    process.env.GA4_SERVICE_ACCOUNT_JSON?.trim() ||
    process.env.GSC_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) return null;
  return JSON.parse(raw);
}

function getServiceAccountClientOptions(scopes) {
  const credentials = readInlineServiceAccountJson();
  if (credentials) {
    return { credentials, scopes };
  }
  const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  if (!keyFile) return null;
  return { keyFile, scopes };
}

module.exports = {
  hasGoogleServiceAccountCredentials,
  readInlineServiceAccountJson,
  getServiceAccountClientOptions,
};
