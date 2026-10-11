---
artifactId: csn:phase:v1:10
artifactType: Phase Specification
phase: 10
version: 1.0.0
status: Approved
scope: network-wide
validationStatus: Approved
standards:
  - csn:standard:v1:testing
  - csn:standard:v1:gates
requiredInputs:
  - projectBrief
  - repositoryUrl
---

# Phase 10 — Staging, QA and hardening

## Purpose and outcome
Deliver Phase 10 (Staging, QA and hardening) outcomes for one CSN site launch with traceable evidence.

## Entry criteria
Prior phases complete or N/A; Project Run exists; intake gate Approved or sandbox equivalent.

## Required project inputs
projectBrief, site configuration, outputs from prior phases per handoff contract

## Required research
Repository tree; Notion run state; applicable standards in csn-os/standards/

## Work sequence
Follow Tasks execution rows for this Project Run at phase 10; update Notion evidence fields; stop on Pending gates for external actions.

## Expected deliverables
Notion records per phase-spec; repo changes only within authorized scope; generated evidence links.

## Acceptance criteria
All execution tasks for phase marked Done with completion conditions met OR explicitly Blocked with reason.

## Tests and validation
Smoke tests on staging URL; document commands actually run

## Evidence requirements
Project Run Evidence URL; CSN Releases / Feed Sync Runs / Domain Candidates as applicable

## Failure and recovery
On gate Rejected or missing brief: stop, incident or blocker note, remediation prompt only

## Human approval
see human-gates standard

## Exit criteria and handoff
Current Phase >= 10; handoff package for phase 11 or close at 12
