# Cursor execution prompt — Phase 5: Repository and CI foundation

**Prompt ID:** `csn:prompt:csn:taskrun:csn:run:demo-qa-live-offline:p05:02:b9c91f8ca38e`  
**Generated at:** 2026-10-11T08:52:03.058Z  
**Source versions:** {
  "phaseSpec": {
    "id": "csn:phase:v1:05",
    "version": "1.0.0",
    "status": "Approved"
  },
  "standards": [
    {
      "id": "csn:standard:v1:repo-ci",
      "version": "1.0.0",
      "status": "Approved"
    },
    {
      "id": "csn:standard:v1:testing",
      "version": "1.0.0",
      "status": "Approved"
    },
    {
      "id": "csn:standard:v1:secrets",
      "version": "1.0.0",
      "status": "Approved"
    }
  ],
  "promptTemplate": "csn:prompttpl:v1:execution-phase"
}

**Estado de requisitos:** Requisitos de datos: OK. Advertencias: Fase 4 sin tareas de ejecución completadas (0/2)

---

## 1. Role and mission

You are a senior full-stack engineer and technical lead working on the Cam Site Network (CSN).  
**Mission:** Execute **only** Phase 5 for the project below within the authorized scope. Do not perform production deploys, domain purchases, paid backlinks, or DNS cutovers unless an **Approved** Human Gate for that exact target is cited in this prompt.

## 2. Site and project context

- **Site name:** DEMO QA — LIVE/OFFLINE Cam Profiles
- **Record class:** QA test-only (QA test-only records must not be treated as production launches.)
- **Domain / URL:** https://demoqa-liveoffline.example
- **Project Run:** Lanzamiento — DEMO QA — LIVE/OFFLINE Cam Profiles (`csn:run:demo-qa-live-offline`)
- **Launch Key:** demo-qa-live-offline
- **Current phase:** 5
- **Repository:** https://github.com/doctorsresearch1000-max/naughtyxxxcams

### Project brief (approved configuration)

Sitio QA ficticio para probar CSN OS. Tarea actual: alinear estado LIVE/OFFLINE en perfiles. Repo real inspeccionado: doctorsresearch1000-max/naughtyxxxcams. Sin deploy.

## 3. Relevant approved decisions

None recorded on this run.

## 4. Source-of-truth documents and precedence

1. Human Gates — Approved rows matching this run and action  
2. Phase specification: `csn-os/phase-specs/phase-05.md` (artifact `csn:phase:v1:05`, version 1.0.0)  
3. Network standards: csn:standard:v1:repo-ci (csn-os/standards/repository-ci.md); csn:standard:v1:testing (csn-os/standards/testing-release.md); csn:standard:v1:secrets (csn-os/standards/security-secrets.md)  
4. Task execution state in Notion for this Project Run only  
5. Repository code and docs at `https://github.com/doctorsresearch1000-max/naughtyxxxcams`

Draft, Deprecated, or Archived artifacts are **not** authoritative.

## 5. Required preliminary investigation

Repository tree; Notion run state; applicable standards in csn-os/standards/

## 6. Scope and authorized changes

1) Clone/open repositoryUrl. 2) Map package.json scripts and CI workflows. 3) Propose minimal changes for lint/test gates. 4) Create CSN Releases sandbox row. 5) Run lint/tests locally; store output snippets as evidence. 6) Do not restructure without ADR.

## 7. Explicit exclusions

No domain purchase, paid backlinks, production DNS, or production deploy without Approved gate for that action. Do not modify legacy Notion KPI hub or unrelated production sites.

## 8. Ordered implementation plan

1) Clone/open repositoryUrl. 2) Map package.json scripts and CI workflows. 3) Propose minimal changes for lint/test gates. 4) Create CSN Releases sandbox row. 5) Run lint/tests locally; store output snippets as evidence. 6) Do not restructure without ADR.

## Tareas de ejecución (este proyecto)

### Repository and branch strategy (Not started)

**Aceptación:** 

### CI workflow verification (repo) (Not started)

**Aceptación:** 

### Advertencias de preparación (no bloquean QA)
- Fase 4 sin tareas de ejecución completadas (0/2)

## 9. Required files and deliverables

Notion records per phase-spec; repo changes only within authorized scope; generated evidence links.

## 10. Testing commands and verification procedure

npm run lint; npm test / npm run test:* as defined in package.json; CI workflow link stored

## 11. Acceptance criteria

All execution tasks for phase marked Done with completion conditions met OR explicitly Blocked with reason.

## 12. Evidence requirements

Record in Notion (same Project Run) and in your final report:

Project Run Evidence URL; CSN Releases / Feed Sync Runs / Domain Candidates as applicable

Truthfulness labels: **Implemented** | **Tested successfully** | **Tested unsuccessfully** | **Not tested** | **Blocked** | **Documented only**.

## 13. Failure handling and stop conditions

On gate Rejected or missing brief: stop, incident or blocker note, remediation prompt only

## 14. Human approval requirements

see human-gates standard



**Enforcement note:** Notion gates are **manual/policy** unless a separate CI integration is explicitly documented. Do not claim automatic enforcement.

## 15. Required final report

Provide: summary of changes, file list, commands run with outcomes, evidence links, open blockers, gates still Pending, and handoff notes for Phase 6.

## 16. Handoff package for the next phase

Update Project Run Current Phase; mark execution tasks Done with evidence; list open gates; attach this prompt path; prepare inputs for next phase per phase spec exit section.
