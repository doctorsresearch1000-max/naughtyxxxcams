# CSN OS — Cursor prompt generation system

**Canonical Notion root:** `3f684cd0-85ae-811f-a929-c4b4ccbcb56a`  
Evidence: 14 child databases, operational runbooks, 31 task rows, QA data (audit `scripts/notion-csn-canonical-audit.json`).  
A second partial root (`3f684cd0-85ae-8115-841a-c9dc40395c58`, 3 empty DBs) is **not** used.

## Artifact mapping

| Artifact | Location |
|----------|----------|
| Network standards | `csn-os/standards/*.md` + SOP Versions (`Artifact Type` = Network Standard) |
| Phase specifications | `csn-os/phase-specs/phase-NN.md` + SOP Versions (Phase Specification) |
| Prompt templates | `csn-os/prompt-templates/*.md` + SOP Versions (Prompt Template) |
| Generated execution prompts | `csn-os/generated-prompts/<prompt-id>.md` + Project Runs (`Generated Prompt Path`) |
| Task definitions | Tasks DB (`Record Type` = Task definition), External ID `csn:taskdef:v1:...` |
| Execution tasks | Tasks DB (`Record Type` = Execution task), External ID `csn:taskrun:<run-external-id>:...` |
| Site / run state | CSN Sites, Project Runs |
| Human approvals | Human Gates |
| Runbooks / templates | CSN Knowledge |

## Commands

```bash
npm run csn:setup          # Schema + Notion artifact registry + task migration
npm run csn:generate-prompt -- --run-external-id=... --phase=5
npm run csn:sandbox-test   # Stage H verification
```

## Source-of-truth hierarchy (for agents)

1. Approved Human Gates for the specific target action  
2. Approved Phase Specification + Network Standards (this repo, referenced from Notion)  
3. Project Run + CSN Sites approved configuration  
4. Execution task state and evidence on the same Project Run  
5. CSN Knowledge runbooks  

Draft or Deprecated artifacts are never authoritative.
