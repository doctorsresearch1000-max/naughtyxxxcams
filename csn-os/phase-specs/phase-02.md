---
artifactId: csn:phase:v1:02
artifactType: Phase Specification
phase: 2
version: 1.0.0
status: Approved
scope: network-wide
validationStatus: Approved
standards:
  - csn:standard:v1:gates
  - csn:standard:v1:seo
requiredInputs:
  - projectBrief
---

# Phase 2 — Expired-domain research

## Purpose and outcome
Deliver Phase 2 (Expired-domain research) outcomes for one CSN site launch with traceable evidence.

## Entry criteria
Prior phases complete or N/A; Project Run exists; intake gate Approved or sandbox equivalent.

## Required project inputs
projectBrief, site configuration, outputs from prior phases per handoff contract

## Required research
expireddomains.net filters; web.archive.org; optional Ahrefs/Majestic (non-definitive); GSC if property exists

## Work sequence
1) expireddomains.net Deleted Domains search with documented filters. 2) Export candidates → Domain Candidates (Source=expireddomains.net). 3) Wayback/history per candidate; Block toxic. 4) Score relevance 1-5 in Notes; optional DR field. 5) Shortlist + recommendation. 6) Create Pending domain_candidate gate — no purchase.

## Expected deliverables
Notion records per phase-spec; repo changes only within authorized scope; generated evidence links.

## Acceptance criteria
All execution tasks for phase marked Done with completion conditions met OR explicitly Blocked with reason.

## Tests and validation
Document verification steps; mark Not tested where not executed

## Evidence requirements
Project Run Evidence URL; CSN Releases / Feed Sync Runs / Domain Candidates as applicable

## Failure and recovery
On gate Rejected or missing brief: stop, incident or blocker note, remediation prompt only

## Human approval
domain_candidate before purchase

## Exit criteria and handoff
Current Phase >= 2; handoff package for phase 3 or close at 12
