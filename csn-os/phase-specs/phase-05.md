---
artifactId: csn:phase:v1:05
artifactType: Phase Specification
phase: 5
version: 1.0.0
status: Approved
scope: network-wide
validationStatus: Approved
standards:
  - csn:standard:v1:repo-ci
  - csn:standard:v1:testing
  - csn:standard:v1:secrets
requiredInputs:
  - projectBrief
  - repositoryUrl
---

# Phase 5 — Repository and CI foundation

## Purpose and outcome
Deliver Phase 5 (Repository and CI foundation) outcomes for one CSN site launch with traceable evidence.

## Entry criteria
Prior phases complete or N/A; Project Run exists; intake gate Approved or sandbox equivalent.

## Required project inputs
projectBrief, repositoryUrl, architectureDecisionSummary

## Required research
Repository tree; Notion run state; applicable standards in csn-os/standards/

## Work sequence
1) Clone/open repositoryUrl. 2) Map package.json scripts and CI workflows. 3) Propose minimal changes for lint/test gates. 4) Create CSN Releases sandbox row. 5) Run lint/tests locally; store output snippets as evidence. 6) Do not restructure without ADR.

## Expected deliverables
Notion records per phase-spec; repo changes only within authorized scope; generated evidence links.

## Acceptance criteria
All execution tasks for phase marked Done with completion conditions met OR explicitly Blocked with reason.

## Tests and validation
npm run lint; npm test / npm run test:* as defined in package.json; CI workflow link stored

## Evidence requirements
Project Run Evidence URL; CSN Releases / Feed Sync Runs / Domain Candidates as applicable

## Failure and recovery
On gate Rejected or missing brief: stop, incident or blocker note, remediation prompt only

## Human approval
see human-gates standard

## Exit criteria and handoff
Current Phase >= 5; handoff package for phase 6 or close at 12
