# CSN prompt assembly contract

## Inputs (resolved in order)

1. **Approved artifacts** — Phase spec + standards with `Validation Status` = Approved in Notion SOP Versions and file at `Repository Path`.
2. **Project Run** — matched by `External ID`; includes `Project Brief`, `Architecture Summary`, phase, evidence URLs.
3. **CSN Sites** — `Record Class`, `Domain`, `Repository URL`, site-level brief.
4. **Human Gates** — rows linked to the same Project Run; only `Approved` rows authorize external actions in operator policy.
5. **Execution tasks** — scoped to the same run via `csn:taskrun:<run-external-id>:...` External IDs.

## Missing inputs

If required fields for the phase are empty, emit `blocked-planning.md` template with explicit missing list. **Do not invent values.**

## Output

- File: `csn-os/generated-prompts/<prompt-id>.md`
- Notion: Project Run `Generated Prompt ID`, `Generated Prompt Path`, `Source Versions`

## Idempotency

Prompt ID is deterministic from run External ID + phase + phase spec version hash. Re-running overwrites the same file and updates Notion metadata.

## Not enforced technically

Gate Status does not block `assemble-prompt` or git push; operators must enforce manually.
