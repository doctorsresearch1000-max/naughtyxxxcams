"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { enrichRowMetrics, resolveRefreshMetrics } = require("./enrich");
const {
  metricSuccess,
  metricFailure,
  metricSkipped,
} = require("./outcomes");
const { isSkippedDomain } = require("./skip-domains");
const {
  buildMainUpdateFromSuccessful,
  buildHistorySnapshotProperties,
  resolveHistoryRelationKey,
} = require("../notion-kpi-sync");

function baseCtx(overrides = {}) {
  return {
    pageId: "page-1",
    label: "telehub.cam",
    domain: "telehub.cam",
    current: {
      monthlyRevenue: 120,
      dailyClicks: 493,
      indexedPages: 50,
    },
    missing: [],
    ...overrides,
  };
}

function mockProviders(fetchImpl) {
  return [
    {
      id: "mock-gsc",
      label: "Mock GSC",
      metrics: ["dailyClicks", "indexedPages"],
      isConfigured: () => true,
      fetch: fetchImpl.gsc,
    },
    {
      id: "mock-crak",
      label: "Mock Crak",
      metrics: ["monthlyRevenue"],
      isConfigured: () => true,
      fetch: fetchImpl.crak,
    },
  ];
}

describe("resolveRefreshMetrics", () => {
  it("refreshes all metrics by default even when Notion values exist", () => {
    const ctx = baseCtx({ missing: [] });
    assert.deepEqual(resolveRefreshMetrics(ctx), [
      "monthlyRevenue",
      "dailyClicks",
      "indexedPages",
    ]);
  });

  it("refreshes only gaps when KPI_ENRICH_GAP_ONLY=1", () => {
    const prev = process.env.KPI_ENRICH_GAP_ONLY;
    process.env.KPI_ENRICH_GAP_ONLY = "1";
    try {
      const ctx = baseCtx({ missing: ["monthlyRevenue"] });
      assert.deepEqual(resolveRefreshMetrics(ctx), ["monthlyRevenue"]);
    } finally {
      if (prev === undefined) delete process.env.KPI_ENRICH_GAP_ONLY;
      else process.env.KPI_ENRICH_GAP_ONLY = prev;
    }
  });
});

describe("enrichRowMetrics", () => {
  it("1) existing non-zero metrics trigger provider refresh", async () => {
    const providers = mockProviders({
      gsc: async (ctx) => {
        assert.ok(ctx.refreshMetrics.includes("dailyClicks"));
        assert.ok(ctx.refreshMetrics.includes("indexedPages"));
        return {
          dailyClicks: metricSuccess(500),
          indexedPages: metricSuccess(60),
        };
      },
      crak: async (ctx) => {
        assert.ok(ctx.refreshMetrics.includes("monthlyRevenue"));
        return { monthlyRevenue: metricSuccess(200) };
      },
    });

    const result = await enrichRowMetrics(baseCtx(), providers);
    assert.equal(result.outcomes.dailyClicks.status, "success");
    assert.equal(result.outcomes.monthlyRevenue.status, "success");
    assert.equal(result.merged.dailyClicks, 500);
    assert.equal(result.merged.monthlyRevenue, 200);
    assert.equal(result.mainDbChanged, true);
  });

  it("2-3) successful GSC and Crak update their metrics", async () => {
    const providers = mockProviders({
      gsc: async () => ({
        dailyClicks: metricSuccess(10),
        indexedPages: metricSuccess(20),
      }),
      crak: async () => ({ monthlyRevenue: metricSuccess(99.5) }),
    });
    const result = await enrichRowMetrics(
      baseCtx({
        current: { monthlyRevenue: null, dailyClicks: null, indexedPages: null },
        missing: ["monthlyRevenue", "dailyClicks", "indexedPages"],
      }),
      providers,
    );
    assert.equal(result.merged.dailyClicks, 10);
    assert.equal(result.merged.indexedPages, 20);
    assert.equal(result.merged.monthlyRevenue, 99.5);
  });

  it("4) GSC auth error preserves existing clicks and indexed pages", async () => {
    const providers = mockProviders({
      gsc: async () => ({
        dailyClicks: metricFailure("auth error"),
        indexedPages: metricFailure("auth error"),
      }),
      crak: async () => ({ monthlyRevenue: metricSuccess(120) }),
    });
    const ctx = baseCtx();
    const result = await enrichRowMetrics(ctx, providers);
    assert.equal(result.merged.dailyClicks, 493);
    assert.equal(result.merged.indexedPages, 50);
    assert.equal(result.merged.monthlyRevenue, 120);
    assert.equal(result.mainDbChanged, false);
    assert.deepEqual(result.successfulUpdates, { monthlyRevenue: 120 });
  });

  it("5) CrakRevenue error preserves existing monthly revenue", async () => {
    const providers = mockProviders({
      gsc: async () => ({
        dailyClicks: metricSuccess(1),
        indexedPages: metricSuccess(2),
      }),
      crak: async () => ({
        monthlyRevenue: metricFailure("HTTP 500"),
      }),
    });
    const result = await enrichRowMetrics(baseCtx(), providers);
    assert.equal(result.merged.monthlyRevenue, 120);
    assert.equal(result.merged.dailyClicks, 1);
    assert.equal(result.successfulUpdates.monthlyRevenue, undefined);
  });

  it("6) skipped provider preserves its metrics", async () => {
    const providers = mockProviders({
      gsc: async () => ({
        dailyClicks: metricSuccess(5),
        indexedPages: metricSuccess(6),
      }),
      crak: async () => ({
        monthlyRevenue: metricSkipped("CrakRevenue no configurado"),
      }),
    });
    const result = await enrichRowMetrics(baseCtx(), providers);
    assert.equal(result.merged.monthlyRevenue, 120);
    assert.equal(result.outcomes.monthlyRevenue.status, "skipped");
  });

  it("7) genuine zero from successful query updates the metric", async () => {
    const providers = mockProviders({
      gsc: async () => ({
        dailyClicks: metricSuccess(0),
        indexedPages: metricSuccess(0),
      }),
      crak: async () => ({ monthlyRevenue: metricSuccess(0) }),
    });
    const result = await enrichRowMetrics(baseCtx(), providers);
    assert.equal(result.merged.dailyClicks, 0);
    assert.equal(result.merged.indexedPages, 0);
    assert.equal(result.merged.monthlyRevenue, 0);
    assert.equal(result.mainDbChanged, true);
  });

  it("8) partial success updates only successful metrics in patch", async () => {
    const providers = mockProviders({
      gsc: async () => ({
        dailyClicks: metricSuccess(77),
        indexedPages: metricFailure("timeout"),
      }),
      crak: async () => ({ monthlyRevenue: metricFailure("down") }),
    });
    const ctx = baseCtx();
    const result = await enrichRowMetrics(ctx, providers);
    const patch = buildMainUpdateFromSuccessful(
      {
        "Daily Clicks": { type: "number" },
        "Indexed Pages": { type: "number" },
        "Monthly Revenue": { type: "rich_text" },
      },
      {
        dailyClicks: "Daily Clicks",
        indexedPages: "Indexed Pages",
        monthlyRevenue: "Monthly Revenue",
      },
      result.successfulUpdates,
      ctx.current,
    );
    assert.deepEqual(Object.keys(patch), ["Daily Clicks"]);
    assert.equal(patch["Daily Clicks"].number, 77);
  });

  it("9) existing numeric zero does not block provider calls", async () => {
    const providers = mockProviders({
      gsc: async (ctx) => {
        assert.ok(ctx.refreshMetrics.includes("dailyClicks"));
        return {
          dailyClicks: metricSuccess(42),
          indexedPages: metricSuccess(3),
        };
      },
      crak: async () => ({ monthlyRevenue: metricSuccess(1) }),
    });
    const result = await enrichRowMetrics(
      baseCtx({
        current: { monthlyRevenue: 0, dailyClicks: 0, indexedPages: 0 },
        missing: [],
      }),
      providers,
    );
    assert.equal(result.merged.dailyClicks, 42);
    assert.equal(result.outcomes.dailyClicks.status, "success");
  });

  it("10) excluded domain flag matches skip list", () => {
    assert.equal(isSkippedDomain("clickforcamgirls.com"), true);
    assert.equal(isSkippedDomain("telehub.cam"), false);
  });

  it("11) failed refresh does not zero or duplicate main updates", async () => {
    const providers = mockProviders({
      gsc: async () => ({
        dailyClicks: metricFailure("err"),
        indexedPages: metricFailure("err"),
      }),
      crak: async () => ({ monthlyRevenue: metricFailure("err") }),
    });
    const ctx = baseCtx();
    const first = await enrichRowMetrics(ctx, providers);
    const second = await enrichRowMetrics(ctx, providers);
    assert.deepEqual(first.merged, ctx.current);
    assert.deepEqual(second.merged, ctx.current);
    assert.equal(first.mainDbChanged, false);
    assert.equal(second.mainDbChanged, false);
  });

  it("12) KPI History snapshot properties still build with relation", () => {
    const historyDs = {
      properties: {
        Name: { type: "title" },
        "Source record": { type: "relation" },
        Date: { type: "date" },
        "Monthly Revenue": { type: "number" },
        "Daily Clicks": { type: "number" },
        "Indexed Pages": { type: "number" },
      },
    };
    const relationKey = resolveHistoryRelationKey(historyDs);
    assert.equal(relationKey, "Source record");
    const props = buildHistorySnapshotProperties(
      historyDs,
      relationKey,
      "page-abc",
      "2026-10-10",
      "telehub.cam",
      { monthlyRevenue: 10, dailyClicks: 20, indexedPages: 30 },
    );
    assert.equal(props[relationKey].relation[0].id, "page-abc");
    assert.equal(props["Daily Clicks"].number, 20);
  });
});
