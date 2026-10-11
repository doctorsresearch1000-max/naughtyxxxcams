# Cursor execution prompt — Phase {{PHASE_NUMBER}}: {{PHASE_TITLE}}

**Prompt ID:** `{{PROMPT_ID}}`  
**Generated at:** {{GENERATED_AT}}  
**Source versions:** {{SOURCE_VERSIONS_JSON}}

**Estado de requisitos:** {{READINESS_NOTE}}

---

## 1. Role and mission

You are a senior full-stack engineer and technical lead working on the Cam Site Network (CSN).  
**Mission:** Execute **only** Phase {{PHASE_NUMBER}} for the project below within the authorized scope. Do not perform production deploys, domain purchases, paid backlinks, or DNS cutovers unless an **Approved** Human Gate for that exact target is cited in this prompt.

## 2. Site and project context

- **Site name:** {{SITE_NAME}}
- **Record class:** {{RECORD_CLASS}} (QA test-only records must not be treated as production launches.)
- **Domain / URL:** {{DOMAIN}}
- **Project Run:** {{RUN_NAME}} (`{{RUN_EXTERNAL_ID}}`)
- **Launch Key:** {{LAUNCH_KEY}}
- **Current phase:** {{PHASE_NUMBER}}
- **Repository:** {{REPOSITORY_URL}}

### Project brief (approved configuration)

{{PROJECT_BRIEF}}

## 3. Relevant approved decisions

{{APPROVED_DECISIONS}}

## 4. Source-of-truth documents and precedence

1. Human Gates — Approved rows matching this run and action  
2. Phase specification: `{{PHASE_SPEC_PATH}}` (artifact `{{PHASE_SPEC_ARTIFACT_ID}}`, version {{PHASE_SPEC_VERSION}})  
3. Network standards: {{STANDARDS_LIST}}  
4. Task execution state in Notion for this Project Run only  
5. Repository code and docs at `{{REPOSITORY_URL}}`

Draft, Deprecated, or Archived artifacts are **not** authoritative.

## 5. Required preliminary investigation

{{PRELIMINARY_INVESTIGATION}}

## 6. Scope and authorized changes

{{AUTHORIZED_SCOPE}}

## 7. Explicit exclusions

{{EXCLUSIONS}}

## 8. Ordered implementation plan

{{IMPLEMENTATION_PLAN}}

## 9. Required files and deliverables

{{DELIVERABLES}}

## 10. Testing commands and verification procedure

{{TESTING_PROCEDURE}}

## 11. Acceptance criteria

{{ACCEPTANCE_CRITERIA}}

## 12. Evidence requirements

Record in Notion (same Project Run) and in your final report:

{{EVIDENCE_REQUIREMENTS}}

Truthfulness labels: **Implemented** | **Tested successfully** | **Tested unsuccessfully** | **Not tested** | **Blocked** | **Documented only**.

## 13. Failure handling and stop conditions

{{FAILURE_HANDLING}}

## 14. Human approval requirements

{{HUMAN_APPROVALS}}

**Enforcement note:** Notion gates are **manual/policy** unless a separate CI integration is explicitly documented. Do not claim automatic enforcement.

## 15. Required final report

Provide: summary of changes, file list, commands run with outcomes, evidence links, open blockers, gates still Pending, and handoff notes for Phase {{NEXT_PHASE}}.

## 16. Handoff package for the next phase

{{HANDOFF_CONTRACT}}
