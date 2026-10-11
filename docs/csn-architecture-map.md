# CSN OS — Canonical architecture map (Stage A)

**Selected canonical root:** `3f684cd0-85ae-811f-a929-c4b4ccbcb56a`  
**URL:** https://app.notion.com/p/Cam-Site-Network-OS-SOP-System-Isolated-3f684cd085ae811fa929c4b4ccbcb56a  
**Parent:** page `3f484cd0-85ae-8032-bff1-c16e871e6357` (hub site subpage — integration constraint)

## Why this root

| Criterion | Canonical | Alternate `…8115…` |
|-----------|----------|---------------------|
| Child DBs | 14 / 14 | 3 / 14 |
| Runbooks page | Yes | No |
| Task rows | 31 | 0 |
| Knowledge templates | 12 | 0 |
| QA sandbox data | Yes | No |
| Manifest match | Yes | No |
| Audit score | 273 | 30 |

**Ambiguous tie:** No. Do not use the partial alternate stack. Do not delete either root.

## Existing operational assets (reused)

- Master SOP checklist (root page)
- [12-Phase Operational Runbooks](https://app.notion.com/p/12-Phase-Operational-Runbooks-3f684cd085ae81c486c9f909182fa38c)
- Task manifest v2 rows (migrated to **task definitions**)
- CSN Knowledge `TEMPLATE:*` articles
- Human Gate policy templates + QA approved gate
- Repo: `scripts/notion-csn-*.mjs`, `csn-task-manifest-v2.json`

## Additions (this implementation)

| Component | Location |
|-----------|----------|
| Network standards (9) | `csn-os/standards/*.md` + SOP Versions rows |
| Phase specifications (12) | `csn-os/phase-specs/phase-NN.md` + SOP Versions rows |
| Prompt templates | `csn-os/prompt-templates/*.md` + SOP Versions rows |
| Artifact catalog | `csn-os/artifact-catalog.json` |
| Prompt assembler | `csn-os/lib/assemble-prompt.mjs` |
| Generated prompts | `csn-os/generated-prompts/*.md` |
| Task definition vs execution | Tasks.`Record Type` + External ID namespaces |
| Contracts | `docs/csn-prompt-assembly-contract.md`, `docs/csn-phase-handoff-contract.md` |

## Relations (isolated only)

All relation properties on canonical DBs resolve to other canonical data sources (verified in prior audits). No legacy DB relations added.

## Unresolved / operator actions

- Consolidate or hide the **partial duplicate root** manually in Notion when convenient (not done by automation).
- Configure filtered **views** in Notion UI (API view create not validated for this integration).
- Share a dedicated workspace parent page with the integration to avoid hub-row nesting (optional).
