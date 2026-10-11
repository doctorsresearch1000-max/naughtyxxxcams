# Cursor execution prompt — Phase 11: Production launch

**Prompt ID:** `csn:prompt:csn:run:fictional-sandbox-prompt-qa:p11:02c238125eb6`  
**Generated at:** 2026-10-11T08:06:31.231Z  
**Source versions:** {
  "phaseSpec": {
    "id": "csn:phase:v1:11",
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
      "id": "csn:standard:v1:testing",
      "version": "1.0.0",
      "status": "Approved"
    }
  ],
  "promptTemplate": "csn:prompttpl:v1:execution-phase"
}

---

## 1. Role and mission

You are a senior full-stack engineer and technical lead working on the Cam Site Network (CSN).  
**Mission:** Execute **only** Phase 11 for the project below within the authorized scope. Do not perform production deploys, domain purchases, paid backlinks, or DNS cutovers unless an **Approved** Human Gate for that exact target is cited in this prompt.

## 2. Site and project context

- **Site name:** FICTIONAL-SANDBOX-PROMPT-QA
- **Record class:** QA test-only (QA test-only records must not be treated as production launches.)
- **Domain / URL:** https://fictional-sandbox.example
- **Project Run:** Fictional Prompt QA Run (`csn:run:fictional-sandbox-prompt-qa`)
- **Launch Key:** fictional-sandbox-prompt-qa
- **Current phase:** 11
- **Repository:** https://github.com/example/fictional-sandbox-repo

### Project brief (approved configuration)

Fictional brief: validate prompt assembly only. Framework TBD after repo inspection.

## 3. Relevant approved decisions

None recorded on this run.

## 4. Source-of-truth documents and precedence

1. Human Gates — Approved rows matching this run and action  
2. Phase specification: `csn-os/phase-specs/phase-11.md` (artifact `csn:phase:v1:11`, version 1.0.0)  
3. Network standards: csn:standard:v1:gates (csn-os/standards/human-gates.md); csn:standard:v1:testing (csn-os/standards/testing-release.md)  
4. Task execution state in Notion for this Project Run only  
5. Repository code and docs at `https://github.com/example/fictional-sandbox-repo`

Draft, Deprecated, or Archived artifacts are **not** authoritative.

## 5. Required preliminary investigation

Repository tree; Notion run state; applicable standards in csn-os/standards/

## 6. Scope and authorized changes

Follow Tasks execution rows for this Project Run at phase 11; update Notion evidence fields; stop on Pending gates for external actions.

## 7. Explicit exclusions

No domain purchase, paid backlinks, production DNS, or production deploy without Approved gate for that action. Do not modify legacy Notion KPI hub or unrelated production sites.

## 8. Ordered implementation plan

Follow Tasks execution rows for this Project Run at phase 11; update Notion evidence fields; stop on Pending gates for external actions.

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

production_deploy before prod deploy



**Enforcement note:** Notion gates are **manual/policy** unless a separate CI integration is explicitly documented. Do not claim automatic enforcement.

## 15. Required final report

Provide: summary of changes, file list, commands run with outcomes, evidence links, open blockers, gates still Pending, and handoff notes for Phase 12.

## 16. Handoff package for the next phase

Update Project Run Current Phase; mark execution tasks Done with evidence; list open gates; attach this prompt path; prepare inputs for next phase per phase spec exit section.
