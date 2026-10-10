"use strict";

const DEFAULT_SKIP_DOMAINS = ["clickforcamgirls.com"];

function normalizeDomain(domain) {
  if (!domain) return "";
  return domain.replace(/^www\./i, "").trim().toLowerCase();
}

function getSkipDomains() {
  const fromEnv = (process.env.KPI_SKIP_DOMAINS || "")
    .split(",")
    .map((d) => normalizeDomain(d))
    .filter(Boolean);
  return new Set([...DEFAULT_SKIP_DOMAINS.map(normalizeDomain), ...fromEnv]);
}

function isSkippedDomain(domain) {
  const bare = normalizeDomain(domain);
  if (!bare) return false;
  return getSkipDomains().has(bare);
}

module.exports = { isSkippedDomain, getSkipDomains, normalizeDomain };
