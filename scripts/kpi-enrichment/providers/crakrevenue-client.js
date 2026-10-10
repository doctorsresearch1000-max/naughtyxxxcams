"use strict";

const { normalizeDomain } = require("../skip-domains");

const DEFAULT_SUBID_BY_DOMAIN = {
  "telehub.cam": "telehub_cam",
  "naughtyxxxcams.com": "naughtyxxxcams_com",
  "maturecamrooms.com": "maturecamrooms_com",
};

function readApiKey() {
  return (
    process.env.CRAKREVENUE_API_KEY?.trim() ||
    process.env.CRAK_API_KEY?.trim() ||
    ""
  );
}

function readSubIdMap() {
  const raw = process.env.CRAKREVENUE_SUBID_MAP?.trim();
  if (!raw) return { ...DEFAULT_SUBID_BY_DOMAIN };
  try {
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SUBID_BY_DOMAIN, ...parsed };
  } catch {
    return { ...DEFAULT_SUBID_BY_DOMAIN };
  }
}

function resolveSubIdForDomain(domain) {
  const bare = normalizeDomain(domain);
  if (!bare) return null;
  const map = readSubIdMap();
  return map[bare] || null;
}

function statsApiBaseUrl() {
  const override = process.env.CRAKREVENUE_STATS_API_URL?.trim();
  if (override) return override.replace(/\/$/, "");
  const networkId =
    process.env.CRAKREVENUE_STATS_NETWORK_ID?.trim() || "crakrevenue";
  return `https://${networkId}.api.hasoffers.com/Apiv3/json`;
}

function subIdFilterField() {
  return (
    process.env.CRAKREVENUE_SUBID_FIELD?.trim() || "Stat.affiliate_info1"
  );
}

function currentMonthDateRangeUtc() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const fmt = (d) => d.toISOString().slice(0, 10);
  return { startDate: fmt(start), endDate: fmt(end) };
}

function parseHasOffersPayout(payload) {
  if (!payload || typeof payload !== "object") return null;

  const totals = payload.response?.data?.totals?.Stat?.payout;
  if (totals !== undefined && totals !== null && totals !== "") {
    const n = Number.parseFloat(String(totals));
    return Number.isFinite(n) ? n : 0;
  }

  const rows = payload.response?.data;
  if (!rows || typeof rows !== "object") return null;

  let sum = 0;
  let found = false;
  for (const entry of Object.values(rows)) {
    if (!entry || typeof entry !== "object") continue;
    const payout = entry.Stat?.payout ?? entry.payout;
    if (payout === undefined || payout === null || payout === "") continue;
    const n = Number.parseFloat(String(payout));
    if (Number.isFinite(n)) {
      sum += n;
      found = true;
    }
  }
  return found ? sum : 0;
}

/**
 * @param {string} subId
 */
async function fetchMonthToDatePayoutForSubId(subId) {
  const apiKey = readApiKey();
  if (!apiKey) return null;

  const { startDate, endDate } = currentMonthDateRangeUtc();
  const subField = subIdFilterField();
  const params = new URLSearchParams();
  params.set("Target", "Affiliate_Report");
  params.set("Method", "getStats");
  params.set("api_key", apiKey);
  params.append("fields[]", "Stat.payout");
  params.append("fields[]", subField);
  params.append("groups[]", subField);
  params.set("filters[Stat.date][conditional]", "BETWEEN");
  params.append("filters[Stat.date][values][]", startDate);
  params.append("filters[Stat.date][values][]", endDate);
  params.set(`filters[${subField}][conditional]`, "EQUAL_TO");
  params.append(`filters[${subField}][values][]`, subId);
  params.set("totals", "1");

  const url = `${statsApiBaseUrl()}?${params.toString()}`;
  const timeoutMs = Number.parseInt(
    process.env.CRAKREVENUE_STATS_TIMEOUT_MS || "20000",
    10,
  );

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent":
          process.env.CRACKREVENUE_USER_AGENT?.trim() ||
          "NaughtyXxxCams-KPI-Sync/1.0",
      },
      signal: controller.signal,
    });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
    }
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error("Respuesta no JSON de CrakRevenue stats API");
    }
    if (json.response?.status === -1 || json.response?.errorMessage) {
      throw new Error(json.response?.errorMessage || "CrakRevenue API error");
    }
    return parseHasOffersPayout(json);
  } finally {
    clearTimeout(timer);
  }
}

module.exports = {
  readApiKey,
  resolveSubIdForDomain,
  fetchMonthToDatePayoutForSubId,
  currentMonthDateRangeUtc,
  DEFAULT_SUBID_BY_DOMAIN,
};
