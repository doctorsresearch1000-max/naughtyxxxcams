# Phase handoff and acceptance contract

A phase may transition only when:

1. **Deliverables** — Notion rows and repo artifacts listed in the phase spec exist or are explicitly N/A for QA.
2. **Acceptance** — Execution tasks for the phase are `Done` with completion conditions met, or `Blocked` with documented reason.
3. **Evidence** — Project Run `Evidence URL` and/or linked release/sync/candidate rows updated.
4. **Gates** — No external action required by next phase without applicable `Approved` gate (manual check).
5. **Handoff artifact** — Generated prompt for the *next* phase or remediation prompt for failures.
6. **State** — `Current Phase` updated on Project Run.

**Manual control:** Notion does not prevent advancing `Current Phase` without the above; label as operator policy.

## Failed gate

If a required gate is `Rejected` or `Pending` for a consequential action, produce a **remediation** or **blocked planning** prompt only — do not mark phase complete or authorize next phase implementation prompts.
