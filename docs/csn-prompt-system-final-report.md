# CSN OS — Cursor Prompt Generation System (Final Report)

**Status:** Operationally validated for **sandbox prompt assembly** — **not production-ready** for real launches.  
**Generated:** 2026-10-11

## Canonical root (evidence)

| Item | Value |
|------|--------|
| Root ID | `3f684cd0-85ae-811f-a929-c4b4ccbcb56a` |
| URL | https://app.notion.com/p/Cam-Site-Network-OS-SOP-System-Isolated-3f684cd085ae811fa929c4b4ccbcb56a |
| Selection | 14 DBs, runbooks, 31→87 task rows after execution sync, QA + fictional sandbox (audit `scripts/notion-csn-canonical-audit.json`) |
| Alternate (unused) | `3f684cd0-85ae-8115-841a-c9dc40395c58` — 3 empty DBs only |

## Components reused

- 14 isolated databases (unchanged IDs in manifest)
- Operational runbooks page
- CSN Knowledge templates
- Human Gate policy rows + QA gate
- `notion-csn-isolated-manifest.json` (canonical root verified)
- Legacy KPI sync untouched (`notion:sync-kpis` → hub only)

## New / changed

### Repository

| Path | Purpose |
|------|---------|
| `csn-os/standards/*.md` | 9 network standards |
| `csn-os/phase-specs/phase-01..12.md` | Phase specifications |
| `csn-os/prompt-templates/*.md` | Execution + blocked templates |
| `csn-os/artifact-catalog.json` | Registry index |
| `csn-os/lib/assemble-prompt.mjs` | Prompt generator |
| `csn-os/generated-prompts/*.md` | Generated artifacts |
| `scripts/csn-prompt-system-setup.mjs` | Schema + Notion registry + task migration |
| `scripts/csn-prompt-generate.mjs` | CLI wrapper |
| `scripts/csn-prompt-sandbox-test.mjs` | Stage H tests |
| `scripts/notion-csn-audit-canonical.mjs` | Canonical stack audit |
| `docs/csn-architecture-map.md` | Stage A map |
| `docs/csn-prompt-assembly-contract.md` | Assembly contract |
| `docs/csn-phase-handoff-contract.md` | Handoff contract |
| `docs/csn-prompt-system-sandbox-report.md` | Test output (generated) |

### Notion (canonical stack only)

- **SOP Versions:** +23 artifact rows (`Artifact Type`, `Artifact ID`, `Repository Path`, `Validation Status`, …)
- **Tasks:** `Record Type`, `Task Definition Ref`; 31 rows → **Task definition** (External ID `csn:taskdef:v1:*`); +56 **Execution task** rows for QA + fictional runs
- **CSN Sites / Project Runs:** `Repository URL`, `Project Brief`, prompt metadata fields
- **New records:** FICTIONAL-SANDBOX-PROMPT-QA site + run

## Task definition vs execution task

| Kind | External ID pattern | Project Run relation |
|------|---------------------|----------------------|
| Task definition | `csn:taskdef:v1:pNN:MM` | **None** (templates) |
| Execution task | `csn:taskrun:<run-external-id>:pNN:MM` | **Required** |

Generation: `npm run csn:setup` → `syncExecutionTasks` per run (idempotent by External ID).

## Prompt template inventory

| Artifact ID | File | Validation |
|-------------|------|------------|
| `csn:prompttpl:v1:execution-phase` | `csn-os/prompt-templates/execution-phase.md` | Approved in Notion |
| `csn:prompttpl:v1:blocked-planning` | `csn-os/prompt-templates/blocked-planning.md` | Approved in Notion |

## Sample generated prompt

- **Command:** `npm run csn:generate-prompt -- --run-external-id=csn:run:fictional-sandbox-prompt-qa --phase=5`
- **ID:** `csn:prompt:csn:run:fictional-sandbox-prompt-qa:p05:bbc8a1b764ce`
- **File:** `csn-os/generated-prompts/csn_prompt_csn_run_fictional-sandbox-prompt-qa_p05_bbc8a1b764ce.md`
- **Sources:** `csn:phase:v1:05` + standards repo-ci, testing, secrets (all Approved)

## Sandbox tests (Stage H)

Run: `npm run csn:sandbox-test` — **Overall PASS** (see `docs/csn-prompt-system-sandbox-report.md`).

| # | Result |
|---|--------|
| 1 Project isolation | PASS |
| 2 Phase spec resolution | PASS |
| 3 Prompt quality (phase 5) | PASS |
| 4 Missing inputs → blocked | PASS |
| 5 Independent execution tasks | PASS (28 per run, no overlap) |
| 6 Idempotency | PASS (same prompt ID) |
| 7 Gates (manual) | PASS |
| 8 Handoff sections | PASS |
| 9 QA/production separation | PASS |
| 10 Legacy integrity | PASS |

## Human Gate enforcement

| | |
|-|-|
| **Technical** | None — Notion/API do not block deploy, DNS, or purchase |
| **Manual** | Operator checks `Human Gates.Status` per Target External ID |
| **Generator** | Phase 11 adds missing `production_deploy` for non-QA; emits blocked/missing list, does not approve prod |

## Views

`notion.views.create` requires parameters not satisfied in tested calls. **Required filtered views remain manual** (see `docs/notion-csn-operational-report.md` §7).

## Legacy integrity

Hub 4, ops 4, kv 1, routine 9, issues 8, deploy 7, kpi1 52, kpi2 4 — unchanged before/after setup and sandbox tests.

## Remaining blockers / production risks

1. Phase specs are structurally complete but not all phases were externally executed (many **documented only**).
2. No CI integration reads Human Gates.
3. Duplicate partial Notion root still exists — operator cleanup.
4. Real affiliate/GSC/deploy paths unverified.
5. Concurrent Notion upserts may duplicate rows — query-before-create only.

## Human approval still required

Domain purchase, paid backlinks, consequential staging, production deploy, scope beyond gate Limits.

## Commands

```bash
npm run csn:audit
npm run csn:setup
npm run csn:generate-prompt -- --run-external-id=<run> --phase=<1-12>
npm run csn:sandbox-test
```
