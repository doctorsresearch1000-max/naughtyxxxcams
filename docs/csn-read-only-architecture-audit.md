# CSN — Read-Only Architecture & Functional Audit

**Audited at:** 2026-10-11 (UTC)  
**Machine inventory:** `docs/csn-read-only-architecture-audit.json`  
**Collector (read-only):** `scripts/csn-read-only-architecture-audit.mjs`  
**Canonical SOP page ID (manifest):** `3f684cd0-85ae-811f-a929-c4b4ccbcb56a`  
**User URL:** https://www.notion.so/3f684cd085ae811fa929c4b4ccbcb56a

---

## A. Executive summary

CSN today is **two parallel operating models** in Notion, not one:

1. **Legacy production network OS (six full-page databases)** — Spanish-first, manually curated records for **live cam sites** (4 hub rows), **day-to-day ops** (issues, deploys, routines, knowledge), and **KPI History** snapshots (52 + 4 rows) tied to the hub via `KPI History` relations. Repo automation (`notion:sync-kpis`) targets this hub + KPI pair via `NOTION_MAIN_DB_ID` / `NOTION_HISTORY_DB_ID`. **Confidence:** VERIFIED (schemas, counts, descriptions, `sync-kpis.js`).

2. **Isolated SOP / launch stack (14 databases under «Cam Playbook — SOP System»)** — English/Spanish hybrid **12-phase website creation**: `CSN Sites`, `Project Runs`, `Tasks` (340 rows), `Human Gates`, templates in `CSN Knowledge`, empty operational DBs (`CSN Incidents`, `CSN Releases`, `CSN Maintenance`, etc.) ready for sandbox/production launch workflows. Driven by repo manifests (`notion-csn-isolated-manifest.json`, `csn-task-manifest-v2.json`, CLI/console). **Confidence:** VERIFIED.

**Biggest fragmentation sources:**

| Fragmentation | Evidence |
|---------------|----------|
| **Dual site registries** | Legacy hub (4 domains, KPI/GSC fields) vs `CSN Sites` (11 rows, Launch Key, Record Class, External ID) — no shared database ID or relation. **VERIFIED** |
| **Dual task systems** | Legacy `OPERATIONS CENTER` (19 rows after centralization: site summaries + linked copies of actionable specialized rows) vs SOP `Tasks` (340 phase tasks per runs). **VERIFIED** |
| **Parallel incident/deploy/maintenance models** | Legacy bases hold real production history; isolated `CSN Incidents` / `CSN Releases` / `CSN Maintenance` are **empty** (0 rows). **VERIFIED** |
| **Dual knowledge** | `KNOWLEDGE VAULT` (1 operational guía) vs `CSN Knowledge` (12 template/policy articles). **VERIFIED** |
| **Dual KPI** | Legacy KPI History DBs + hub relation vs `Launch KPI Snapshots` (1 QA row) — not wired to `notion:sync-kpis`. **VERIFIED** (repo docs + schemas) |
| **Entry-point sprawl** | Six legacy URLs + SOP root + 7-day guide child pages + runbooks — no single Notion page can embed cross-DB dashboards (full-page DB API limit). **VERIFIED** (prior centralization + API) |
| **Naming drift** | Manifest/docs say «Cam Sites — SOP System»; live page title is **«Cam Playbook — SOP System»**. Same `rootPageId`. **VERIFIED** |

**Audit conclusion:** Simplification should **not** merge these stacks without an explicit mapping policy. The smallest safe path is **centralized navigation + relational bandeja on legacy ops** while keeping the SOP stack for **new site launches** and preserving all historical tables.

---

## B. Functional database inventory

One row per audited database. Row counts from live Notion query at audit time.

| Database | ID | Rows | Canonical role | Key fields (types) | Relations (out) | Preserve |
|----------|-----|------|----------------|-------------------|-----------------|----------|
| **CAM SITE NETWORK OS** | `3f384cd0-85ae-80bd-be51-c17104511bfa` | 4 | **Production site registry & KPI dashboard** | `Domains`, `Status` (rich_text), GSC, clicks, revenue, `KPI History` (relation), title=`Hosting / Platform` | → KPI History (dual) | All rows; KPI links; GSC URLs; domain strings |
| **OPERATIONS CENTER** | `3f484cd0-85ae-804d-b61a-d87b93c11734` | 19 | **Unified work tray** (site summaries + central tasks linked to specialized rows) | `Next Action` (title), `Status`/`Site` (rich_text), `Issue`/`Deployment`/`Routine`/`Cam Site` (relation), `Due Date` + `Due Date (date)`, `CSN Task Key` | → hub, issues, deploy, routine, KPI | 4 legacy site rows; specialized source IDs via relations |
| **ISSUES & INCIDENTS** | `3f484cd0-85ae-80dd-aedb-f0e4004e88ea` | 8 | **Production incident log** (diagnosis, resolution) | `Task` (title), `Status` (status), `Category`, `Priority`, dates, `Causa`, `Solución aplicada` | → KNOWLEDGE VAULT (`Guía relacionada`) | Full incident history; status timeline |
| **DEPLOYMENTS & RELEASES** | `3f484cd0-85ae-8011-af56-e1adfd30300b` | 7 | **Production deploy audit trail** | `Task`, `Status`, `PR`, `Commit`, `Rama`, `Verificado`, rollback notes | none | Published/preview records; commit/PR evidence |
| **KNOWLEDGE VAULT** | `3f484cd0-85ae-800b-a34c-d0d4101255a0` | 1 | **Legacy network knowledge** (Spanish) | `Nombre`, `Tipo`, `Estado`, `Category`, `Site` | none | Article body in page; vigente state |
| **ROUTINE & MAINTENANCE** | `3f484cd0-85ae-80a8-9091-e7bf1a16ba70` | 9 | **Recurring ops checklist** | `Task`, `Status`, `Frecuencia`, `Category`, `Última ejecución` | none | Cadence definitions; done/pending history |
| **KPI History (legacy 1)** | `00fb3a37-ccb2-4275-bce3-068b7b08b7e4` | 52 | **Time-series KPI snapshots** (automation target) | `Name`, metrics (per schema in JSON) | ↔ hub (dual) | All historical snapshots |
| **KPI History (legacy 2)** | `efdaa399-b73c-4e83-9bbd-f7cdaceb9daa` | 4 | **Secondary KPI store** | same family | ↔ hub | All rows |
| **CSN Sites** | `7b6afa6b-844b-438f-9321-0cdb8ee728ca` | 11 | **SOP site registry** (incl. QA sandboxes) | `Site Name`, `Domain`, `Launch Key`, `Record Class`, `External ID`, `Status` | none in schema | External IDs; QA vs Production class |
| **SOP Versions** | `9ed26a47-a251-42e8-a987-676d698b004c` | 24 | **Phase spec catalog** | Phase metadata, version ids | none | Version lineage |
| **Project Runs** | `d0e397e4-95e5-44d2-8a68-99bc6a1e654f` | 11 | **Launch project state** | `Run Name`, `Current Phase`, `Launch Key`, `External ID`, `Status`, evidence URLs | → CSN Sites, SOP Versions | Run external IDs; phase progress |
| **Tasks** | `30d3973d-e3e3-40b0-957a-9f8c34db43ee` | 340 | **SOP executable task instances** | `Phase`, `External ID`, Instructions, Gates, `Project Run`, `Site` | → Project Runs, Sites, Human Gates | Task external IDs; execution fields |
| **Domain Candidates** | `6b212615-0945-4bc3-b615-faca86776831` | 0 | **Pre-purchase domain research** | Domain, Wayback, DR, Status | → Site, Project Run | Schema ready; no data yet |
| **SEO Opportunities** | `050ba07c-be8f-45ca-93fa-9bb30d9ed739` | 0 | **SEO backlog** | Opportunity, priority | → Site, Run | Empty |
| **Backlink Opportunities** | `ff38edc7-8b1d-43ce-b692-6c630058066e` | 0 | **Link building** | Target, outreach | → Site, Run | Empty |
| **Feed Sync Runs** | `ffc92a97-84af-41a0-b993-6cbfe0ca2831` | 0 | **Feed job log** | Provider, counts | → Site | Empty |
| **CSN Releases** | `aec67ee4-0ad2-476a-b498-c4207c76fbd7` | 0 | **SOP deploy evidence** | Release, SHA, environment | → Site, Run | Empty (future launches) |
| **CSN Incidents** | `793edf56-ea43-41cf-baaf-2c3dd0976b66` | 0 | **SOP incident log** | Severity, detected at | → Site | Empty |
| **CSN Maintenance** | `e1dc3148-41b8-4783-a79e-185b0fde5280` | 0 | **SOP maintenance** | Cadence, next due | → Site | Empty |
| **CSN Knowledge** | `3d7f94b0-d329-4789-846a-b221945c5b85` | 12 | **SOP templates & policies** | Article, category | → Project Run (optional) | Template articles |
| **Launch KPI Snapshots** | `f01f1be5-8f36-4081-92d1-7fbe6eff7ca8` | 1 | **Post-launch KPI (SOP)** | Record Class, captured at | → Site | QA snapshot row |
| **Human Gates** | `80625683-1553-451d-9c84-528f2a3ad654` | 6 | **Approval gates** | Target Type, Status, Limits | → Project Run | Policy templates + approvals |

**Per-legacy views (operational questions):** see JSON `views[]`. Examples **VERIFIED**:

- Hub: `CSN · 1–7` — network health, Pending/Active sites, ops pointer.
- Ops: `Bandeja · Today/Overdue/…` — calendar work queue; `OC ·` — legacy text-status views.
- Issues/Deploy/Routine: `OC ·` filtered slices for open/upcoming/pending.

---

## C. Website lifecycle map

Reconstructed from **SOP root child pages**, `scripts/csn-phase-runbooks.json`, and database participation. Steps without Notion evidence are marked UNKNOWN.

| Stage | What happens | Mandatory? | Notion structures | Legacy six participation |
|-------|----------------|------------|-------------------|---------------------------|
| 1. Intake / gate | Launch authorized; QA vs Production | **Mandatory** (SOP) | Project Runs, CSN Sites, Human Gates, SOP Versions | **None** — **INFERRED** production sites may pre-exist hub rows without Project Run |
| 2. Domain research | expireddomains → candidates | Conditional (new domain) | Domain Candidates | **None** |
| 3. Domain selection & purchase | Gate `domain_candidate` | Conditional | Human Gates, Domain Candidates | **None** |
| 4–12. Build, feed, SEO, deploy, validate | Phase tasks executed; prompts | **Mandatory** per SOP path | Tasks (340), Project Runs, CSN Knowledge, optional CSN Releases/Incidents/Maintenance (empty) | **None** during greenfield SOP |
| 7-day product guide | Parallel human path (build web) | Optional alternative entry | Child pages Día 1–7 under SOP root | **None** |
| **Production site registry** | Domains, GSC, revenue | **De facto** for live network | — | **CAM SITE NETWORK OS** |
| **Ongoing ops tasks** | Site-level next actions | Operational | — | **OPERATIONS CENTER** (4 legacy + 15 linked tasks) |
| **Incidents** | Break/fix | As needed | CSN Incidents (unused) | **ISSUES & INCIDENTS** (canonical production) |
| **Deploys** | Ship & verify | Per change | CSN Releases (unused) | **DEPLOYMENTS & RELEASES** |
| **Maintenance** | Cadence checks | Recurring | CSN Maintenance (unused) | **ROUTINE & MAINTENANCE** |
| **Knowledge** | Procedures | Reference | CSN Knowledge (templates) | **KNOWLEDGE VAULT** (live guías) |
| **KPI / performance** | Snapshots | Automated + manual | Launch KPI Snapshots | **KPI History** + hub (`notion:sync-kpis`) |

**Duplication / manual handoff gaps (VERIFIED / INFERRED):**

- Launch completes in SOP **does not auto-create** hub site row — **INFERRED** (no relation; different registries).
- Production issues logged in legacy **do not appear** in `CSN Incidents` — **VERIFIED** (0 rows).
- Deploy history in legacy **not copied** to `CSN Releases` — **VERIFIED**.
- `Site` in legacy ops is **rich_text**; SOP uses **relation** to `CSN Sites` — manual alignment by name — **VERIFIED**.
- Issue `3f584cd0-85ae-80e6-9c58-ca92ccf3e9db` (Abierto, empty title) excluded from ops bandeja — **VERIFIED** (fix2 report).

**UNKNOWN — HUMAN REVIEW REQUIRED:** Whether any production hub domain was ever created from a `Project Run` row (no shared External ID field on hub).

---

## D. Dependency and overlap matrix

| From → To | Relationship | Duplicate? | Notes |
|-----------|--------------|------------|-------|
| Hub → KPI History | relation (dual) | N/A | Automation writes history — **VERIFIED** |
| Ops → Issue/Deploy/Routine/Hub | relation (single) | **Derived tray rows** | Central tasks point to canonical specialized rows — **VERIFIED** |
| Issues → Knowledge Vault | relation | Distinct | Incident ↔ guía — **VERIFIED** |
| Project Runs → CSN Sites, SOP Versions | relation | N/A | Launch spine — **VERIFIED** |
| Tasks → Project Runs, Sites, Gates | relation | N/A | 340 tasks — **VERIFIED** |
| Legacy hub ↔ CSN Sites | — | **Related but distinct** | 4 vs 11 rows; different schemas — **VERIFIED** |
| ISSUES ↔ CSN Incidents | — | **Parallel models** | Data only in legacy — **VERIFIED** |
| DEPLOY ↔ CSN Releases | — | **Parallel models** | Data only in legacy — **VERIFIED** |
| ROUTINE ↔ CSN Maintenance | — | **Parallel models** | Data only in legacy — **VERIFIED** |
| KV ↔ CSN Knowledge | — | **Overlap type only** | Different content sets — **VERIFIED** |
| Ops ↔ SOP Tasks | — | **Different lifecycle** | Phase tasks vs ops tray — **VERIFIED** |
| Launch KPI ↔ Legacy KPI | — | **Unverified overlap** | 1 QA snapshot vs 56 legacy KPI rows — **INFERRED** not same records |

---

## E. Centralization proposal (recommendation only — not implemented)

**Recommended: Option A + selective D**, with **no database merge** until mapping rules are approved.

| Option | Fit | Verdict |
|--------|-----|---------|
| **A. Keep all DBs; centralize entry** | Matches full-page DB limits; preserves history | **Recommended primary** |
| **B. Single canonical ops DB with typed records** | Partially done in legacy OPS (relations); would still need SOP Tasks for 12-phase launches | **Partial** — extend only on legacy side; do not absorb 340 task rows |
| **C. Consolidate overlapping DBs** | Legacy vs isolated “same name” DBs are **not** row-duplicates | **Not recommended** without migration spec |
| **D. Keep specialized / historical DBs** | Legacy issues/deploy/routine/KPI; SOP Tasks/Runs/Gates | **Required** |

**Target architecture (proposal):**

| Must remain | Role |
|-------------|------|
| All six legacy DBs + both KPI History DBs | Production truth & automation |
| All 14 SOP DBs | Launch / sandbox / future CSN Incidents-Releases-Maintenance |
| SOP root + runbooks + 7-day pages | Human SOP entry |

| Centralize experience (no DB merge) | How |
|-------------------------------------|-----|
| Daily ops | **OPERATIONS CENTER** `Bandeja · *` views + relations to specialized rows |
| Network health | **CAM SITE NETWORK OS** `CSN · *` views |
| New site | **Cam Playbook — SOP System** → Project Runs / Tasks |
| Cross-links | **UNKNOWN** — Notion API cannot add linked-DB blocks on full-page DB parents; manual bookmarks or wiki page **HUMAN** |

| Do not consolidate (yet) | Why |
|--------------------------|-----|
| Legacy issues → CSN Incidents | 8 production records vs empty schema |
| Legacy deploy → CSN Releases | Audit trail + Spanish fields |
| Hub → CSN Sites | Different cardinality & KPI vs Launch Key models |
| Tasks (340) → OPERATIONS CENTER | Phase granularity vs actionable tray |

---

## F. Migration risk register

| Risk | Severity | If ignored |
|------|----------|------------|
| Merging legacy + SOP site tables | High | Lost KPI sync keys / wrong domain mapping |
| Deleting “empty” CSN Incidents/Releases | High | Breaks SOP templates & future launch logging |
| Converting ops `Status` rich_text → status enum | Medium | Breaks filters/views; historical strings |
| Absorbing KPI History into Launch KPI Snapshots | High | Breaks `notion:sync-kpis` & 56 historical points |
| Dual task rows without relation discipline | Medium | Duplicate work (mitigated by `CSN Task Key` + relations — **VERIFIED** on ops) |
| Full-page DB — no page body dashboards | Low | UX fragmentation persists without wiki wrapper |
| SOP title rename (Playbook vs Cam Sites) | Low | Operator confusion in docs — update docs only |
| Issue without title | Low | Gap in bandeja coverage |

---

## G. Recommended implementation sequence (proposal only)

1. **Human review** this audit; approve “two-stack” model (legacy production vs SOP launch).
2. **Gate:** Document mapping rule hub domain ↔ `CSN Sites.Domain` (manual or future External ID) — no writes until approved.
3. **Ops:** Use `Bandeja · *` as default entry; resolve empty-title issue.
4. **SOP:** Keep launches in Project Runs/Tasks; on production cutover, **optionally** add hub row (manual procedure).
5. **Do not** populate CSN Incidents from legacy automatically without dedup spec.
6. **Verification gate:** Row-count baselines (`legacyRowCounts`) + relation spot-checks after any future change.

---

## H. Evidence and confidence (selected)

| Conclusion | Level |
|------------|-------|
| Six legacy URLs are full-page databases (`is_inline: false`) | VERIFIED |
| SOP root contains 14 child DBs + 9 child pages (7-day guide, runbooks) | VERIFIED |
| Legacy production data lives in legacy six; SOP operational DBs mostly empty | VERIFIED |
| `notion:sync-kpis` targets legacy main/history DBs | VERIFIED (repo) |
| No Notion relation between hub and CSN Sites | VERIFIED |
| Ops 19 rows with Issue/Deployment/Routine relations | VERIFIED |
| Launch KPI not used by sync-kpis | INFERRED (env + docs) |
| Production sites created only via SOP | UNKNOWN |
| Operator daily workflow order | UNKNOWN |

---

## Verification statement (mandatory)

| Check | Result |
|-------|--------|
| Notion pages, databases, properties, views, or records changed during this audit | **No** — `countsStart` === `countsEnd` for all legacy/KPI counts |
| Application code or deployment configuration changed | **No** — only additive audit script + report files in repo (this delivery) |
| Successfully inspected | Six legacy DBs; KPI legacy 1 & 2; 14 manifest DBs; SOP root `3f684cd0-85ae-811f-a929-c4b4ccbcb56a`; runbook page ID from manifest |
| Not verified | Live operator habits; whether hub rows map 1:1 to CSN Sites; runtime UI behavior of `Bandeja · Today` |
| Side effects | **Read-only** API calls (`retrieve`, `query`, `views.list/retrieve`, `blocks.children.list`). Transient rate-limit warnings during view enumeration; no writes. |

**STOP:** No implementation should proceed until you approve a target architecture.

---

*To refresh inventory:* `node scripts/csn-read-only-architecture-audit.mjs`
