# Cursor execution prompt — Phase 1: Project intake and scope approval

**Prompt ID:** `csn:prompt:csn:taskrun:csn:run:qa-console-1791711716600:p01:01:0461460e4501`  
**Generated at:** 2026-10-11T09:43:05.135Z  
**Source versions:** {
  "phaseSpec": {
    "id": "csn:phase:v1:01",
    "version": "1.0.0",
    "status": "Approved"
  },
  "standards": [
    {
      "id": "csn:standard:v1:gates",
      "version": "1.0.0",
      "status": "Approved"
    },
    {
      "id": "csn:standard:v1:evidence",
      "version": "1.0.0",
      "status": "Approved"
    }
  ],
  "promptTemplate": "csn:prompttpl:v1:execution-phase"
}

**Estado de requisitos:** Requisitos previos: OK (las aprobaciones humanas siguen siendo control manual).

---

## 1. Role and mission

You are a senior full-stack engineer and technical lead working on the Cam Site Network (CSN).  
**Mission:** Execute **only** Phase 1 for the project below within the authorized scope. Do not perform production deploys, domain purchases, paid backlinks, or DNS cutovers unless an **Approved** Human Gate for that exact target is cited in this prompt.

## 2. Site and project context

- **Site name:** QA Consola qa-console-1791711716600
- **Record class:** QA test-only (QA test-only records must not be treated as production launches.)
- **Domain / URL:** 
- **Project Run:** Lanzamiento — QA Consola qa-console-1791711716600 (`csn:run:qa-console-1791711716600`)
- **Launch Key:** qa-console-1791711716600
- **Current phase:** 1
- **Repository:** https://github.com/doctorsresearch1000-max/naughtyxxxcams

### Project brief (approved configuration)

Proyecto de aceptación consola web. Nicho test. Sin deploy.

## 3. Relevant approved decisions

None recorded on this run.

## 4. Source-of-truth documents and precedence

1. Human Gates — Approved rows matching this run and action  
2. Phase specification: `csn-os/phase-specs/phase-01.md` (artifact `csn:phase:v1:01`, version 1.0.0)  
3. Network standards: csn:standard:v1:gates (csn-os/standards/human-gates.md); csn:standard:v1:evidence (csn-os/standards/documentation-evidence.md)  
4. Task execution state in Notion for this Project Run only  
5. Repository code and docs at `https://github.com/doctorsresearch1000-max/naughtyxxxcams`

Draft, Deprecated, or Archived artifacts are **not** authoritative.

## 5. Required preliminary investigation

Repository tree; Notion run state; applicable standards in csn-os/standards/

## 6. Scope and authorized changes

Follow Tasks execution rows for this Project Run at phase 1; update Notion evidence fields; stop on Pending gates for external actions.

## 7. Explicit exclusions

No domain purchase, paid backlinks, production DNS, or production deploy without Approved gate for that action. Do not modify legacy Notion KPI hub or unrelated production sites.

## 8. Ordered implementation plan

Follow Tasks execution rows for this Project Run at phase 1; update Notion evidence fields; stop on Pending gates for external actions.

## Tareas de ejecución (este proyecto)

### Open Project Run for launch or QA sandbox (Not started)

**Aceptación:** 

### Create or link CSN Sites row (Not started)

**Aceptación:** 

### Request scoped Human Gate for run intake (Not started)

**Aceptación:** 

## 9. Required files and deliverables

Notion records per phase-spec; repo changes only within authorized scope; generated evidence links.

## 10. Testing commands and verification procedure

Document verification steps; mark Not tested where not executed

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

Provide: summary of changes, file list, commands run with outcomes, evidence links, open blockers, gates still Pending, and handoff notes for Phase 2.

## 16. Handoff package for the next phase

Update Project Run Current Phase; mark execution tasks Done with evidence; list open gates; attach this prompt path; prepare inputs for next phase per phase spec exit section.


---

## Tarea focalizada: Open Project Run for launch or QA sandbox

**Prerrequisitos:** (ninguno registrado)

**Instrucciones de la tarea:**
(completar en Notion Tasks)

**Criterios de aceptación (tarea):**
(completar en Notion Tasks)
