# Stage E — Isolated Cam Site Network OS (Notion)

**Status:** Complete (Stage C build + sandbox QA)  
**Completed at (UTC):** 2026-10-11T07:41:14.723Z  
**Scope:** Notion construction and `QA-SANDBOX-NOTION` sandbox tests only.

## Root hierarchy

| Resource | URL / ID |
|----------|----------|
| **Root page** — Cam Site Network OS — SOP System (Isolated) | https://app.notion.com/p/Cam-Site-Network-OS-SOP-System-Isolated-3f684cd085ae8167bf90d1f31b07025e (`3f684cd0-85ae-8167-bf90-d1f31b07025e`) |

**Placement note:** The Notion integration cannot create workspace-private pages. The root page is a child of the same accessible parent used for KPI History (`NOTION_CSN_ISOLATED_PARENT_PAGE_ID` optional override). Legacy **database row property values** were not modified.

## New databases (isolated; internal relations only)

| Database | URL |
|----------|-----|
| CSN Sites | https://app.notion.com/p/8c72480329d244cf9635db698ec34800 |
| SOP Versions | https://app.notion.com/p/7bb21a35e3fb4545b63cecb1adf4ece9 |
| Project Runs | https://app.notion.com/p/9bb6ddac86984a749db5a967436047a1 |
| Tasks | https://app.notion.com/p/025baa959f08432f982a4bd4dd7b5f1b |
| Domain Candidates | https://app.notion.com/p/d1ea7d542253445baa06667270e2688a |
| SEO Opportunities | https://app.notion.com/p/36da9cdf48f14d81a3b6e07409743a3e |
| Backlink Opportunities | https://app.notion.com/p/9496f874dfa447c98c0976c5e05bec43 |
| Feed Sync Runs | https://app.notion.com/p/4c8e976024654e9dbf454c62b6e60bad |
| CSN Releases | https://app.notion.com/p/0c191658f1454c1684a6ab3db7ddee29 |
| CSN Incidents | https://app.notion.com/p/b8489c8fda8e4f22a1c088c312337068 |
| CSN Maintenance | https://app.notion.com/p/361714089a75451e97d573bffa462330 |
| CSN Knowledge | https://app.notion.com/p/55afb219330a430bb44b78be3693563d |
| Launch KPI Snapshots | https://app.notion.com/p/96187b611d53433e9c2f8083378402b9 |
| Human Gates | https://app.notion.com/p/1e929eb194e548fbb4fda8fe05cb3355 |

Machine-readable IDs: `scripts/notion-csn-isolated-manifest.json`.

## Master SOP (12 phases)

On the root page: full **Master SOP (12 phases)** with executable bullets, **Phase 2 expireddomains.net** workflow, and **[Verified]** / **[Unverified]** labels per phase. Supported views are documented for manual creation in Notion UI (API does not expose view definitions).

## Sandbox QA (`QA-SANDBOX-NOTION`)

| Check | Result |
|-------|--------|
| Site row `Record Class` = QA test-only | Pass |
| Launch Key `qa-sandbox-notion-launch-v1` idempotency (2 runs) | Pass — 1 site, 1 project run |
| Task manifest (3 tasks by External ID) | Pass — no duplicates on re-run |
| Human Gate scoped to project_run + limits | Pass |
| Launch KPI Snapshot (QA test-only, zero metrics) | Pass |

QA record IDs: site `3f684cd0-85ae-8190-9ade-c1e2750d9470`, run `3f684cd0-85ae-8114-82ee-cfda48080b19`.

## Legacy integrity (C5 read-back)

Row counts **unchanged** before vs after Stage C:

| Database | Count |
|----------|------:|
| CAM SITE NETWORK OS (hub) | 4 |
| OPERATIONS CENTER | 4 |
| KNOWLEDGE VAULT | 1 |
| ROUTINE & MAINTENANCE | 9 |
| ISSUES & INCIDENTS | 8 |
| DEPLOYMENTS & RELEASES | 7 |
| KPI History (primary) | 52 |
| KPI History (secondary) | 4 |

**Relation isolation:** Automated check — all relations on new databases point only to other isolated data sources (no legacy DB targets).

## Re-run / idempotency

```bash
npm run notion:csn-stage-c
```

Updates `scripts/notion-csn-isolated-manifest.json` and skips existing resources.

## Out of scope (not performed)

Domain purchases, paid backlinks, production deployments, legacy database schema or row edits, external commitments.
