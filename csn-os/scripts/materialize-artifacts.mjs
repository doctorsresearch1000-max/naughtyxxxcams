#!/usr/bin/env node
/** Writes standards + phase-spec markdown from embedded catalog (idempotent). */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const STANDARDS = [
  {
    id: "csn:standard:v1:architecture",
    file: "architecture.md",
    name: "Network Architecture Standard",
    version: "1.0.0",
  },
  {
    id: "csn:standard:v1:secrets",
    file: "security-secrets.md",
    name: "Security and Secrets Handling",
    version: "1.0.0",
  },
  {
    id: "csn:standard:v1:repo-ci",
    file: "repository-ci.md",
    name: "Repository and CI Standard",
    version: "1.0.0",
  },
  {
    id: "csn:standard:v1:testing",
    file: "testing-release.md",
    name: "Testing and Release Evidence",
    version: "1.0.0",
  },
  {
    id: "csn:standard:v1:seo",
    file: "seo-indexing.md",
    name: "SEO and Indexation Standard",
    version: "1.0.0",
  },
  {
    id: "csn:standard:v1:feeds",
    file: "feed-integration.md",
    name: "Affiliate and Feed Integration",
    version: "1.0.0",
  },
  {
    id: "csn:standard:v1:compliance",
    file: "content-compliance.md",
    name: "Content and Compliance",
    version: "1.0.0",
  },
  {
    id: "csn:standard:v1:gates",
    file: "human-gates.md",
    name: "Human Approval and Risk Policy",
    version: "1.0.0",
  },
  {
    id: "csn:standard:v1:evidence",
    file: "documentation-evidence.md",
    name: "Documentation and Evidence",
    version: "1.0.0",
  },
];

const STANDARD_BODY = {
  "architecture.md": `Require explicit architecture decision record (ADR) per project: runtime, hosting, CDN, data stores, boundaries, environments, cost envelope, failure modes. Do not assume Cloudflare Pages or any framework without project-specific justification.`,
  "security-secrets.md": `Secrets only in GitHub Actions secrets, Cloudflare/env vaults, or registrar panels — never in Notion, git, or prompts. Reference secret *names* only. Rotate on compromise.`,
  "repository-ci.md": `Inspect repo before destructive refactors. Use feature branches, conventional commits, CI lint/test on PR, document deploy workflows. Pin Node/engine versions.`,
  "testing-release.md": `Label results: Implemented / Tested successfully / Tested unsuccessfully / Not tested / Blocked / Documented only. No passing claims without command output.`,
  "seo-indexing.md": `Verify rendered HTML, canonicals, robots, sitemaps, internal links. Third-party metrics are indicative only, not guarantees.`,
  "feed-integration.md": `Research official API docs; verify auth, rate limits, idempotent ingestion, observability. Log Feed Sync Runs in Notion. No undocumented endpoints.`,
  "content-compliance.md": `Flag legal/age/geo requirements for specialist review; do not assert legal conclusions. Document page inventory and controls.`,
  "human-gates.md": `One gate per target action (domain_candidate, backlink, staging_deploy, production_deploy, project_run). Notion does not enforce deploy/purchase technically.`,
  "documentation-evidence.md": `Link evidence URLs on Project Run; store large prompts in repo csn-os/generated-prompts/; handoff JSON in report.`,
};

const PHASES = [
  { n: 1, title: "Project intake and scope approval", standards: ["csn:standard:v1:gates", "csn:standard:v1:evidence"] },
  { n: 2, title: "Expired-domain research", standards: ["csn:standard:v1:gates", "csn:standard:v1:seo"] },
  { n: 3, title: "Domain selection and registration preparation", standards: ["csn:standard:v1:gates"] },
  { n: 4, title: "Architecture, DNS and hosting", standards: ["csn:standard:v1:architecture", "csn:standard:v1:secrets"] },
  { n: 5, title: "Repository and CI foundation", standards: ["csn:standard:v1:repo-ci", "csn:standard:v1:testing", "csn:standard:v1:secrets"] },
  { n: 6, title: "Affiliate and feed integration", standards: ["csn:standard:v1:feeds", "csn:standard:v1:secrets"] },
  { n: 7, title: "Product, UX, content and compliance", standards: ["csn:standard:v1:compliance"] },
  { n: 8, title: "SEO and indexation", standards: ["csn:standard:v1:seo", "csn:standard:v1:testing"] },
  { n: 9, title: "Authority and backlink strategy", standards: ["csn:standard:v1:gates", "csn:standard:v1:seo"] },
  { n: 10, title: "Staging, QA and hardening", standards: ["csn:standard:v1:testing", "csn:standard:v1:gates"] },
  { n: 11, title: "Production launch", standards: ["csn:standard:v1:gates", "csn:standard:v1:testing"] },
  { n: 12, title: "Measurement, maintenance and handoff", standards: ["csn:standard:v1:evidence", "csn:standard:v1:testing"] },
];

function phaseBody(p) {
  const common = {
    purpose: `Deliver Phase ${p.n} (${p.title}) outcomes for one CSN site launch with traceable evidence.`,
    entry: `Prior phases complete or N/A; Project Run exists; intake gate Approved or sandbox equivalent.`,
    inputs: p.n === 1
      ? "projectBrief (required), businessModel, geos, monetization, contentType, budgetLimits, successMetrics, technicalConstraints"
      : p.n === 5
        ? "projectBrief, repositoryUrl, architectureDecisionSummary"
        : "projectBrief, site configuration, outputs from prior phases per handoff contract",
    research: p.n === 2
      ? "expireddomains.net filters; web.archive.org; optional Ahrefs/Majestic (non-definitive); GSC if property exists"
      : p.n === 6
        ? "Official affiliate/network API documentation; existing repo integration patterns"
        : "Repository tree; Notion run state; applicable standards in csn-os/standards/",
    sequence: `Follow Tasks execution rows for this Project Run at phase ${p.n}; update Notion evidence fields; stop on Pending gates for external actions.`,
    deliverables: "Notion records per phase-spec; repo changes only within authorized scope; generated evidence links.",
    acceptance: "All execution tasks for phase marked Done with completion conditions met OR explicitly Blocked with reason.",
    tests: p.n === 5
      ? "npm run lint; npm test / npm run test:* as defined in package.json; CI workflow link stored"
      : p.n === 10
        ? "Smoke tests on staging URL; document commands actually run"
        : "Document verification steps; mark Not tested where not executed",
    evidence: "Project Run Evidence URL; CSN Releases / Feed Sync Runs / Domain Candidates as applicable",
    failure: "On gate Rejected or missing brief: stop, incident or blocker note, remediation prompt only",
    gates: p.n === 2 ? "domain_candidate before purchase" : p.n === 11 ? "production_deploy before prod deploy" : "see human-gates standard",
    exit: `Current Phase >= ${p.n}; handoff package for phase ${p.n + 1} or close at 12`,
  };
  if (p.n === 2) {
    common.sequence =
      "1) expireddomains.net Deleted Domains search with documented filters. 2) Export candidates → Domain Candidates (Source=expireddomains.net). 3) Wayback/history per candidate; Block toxic. 4) Score relevance 1-5 in Notes; optional DR field. 5) Shortlist + recommendation. 6) Create Pending domain_candidate gate — no purchase.";
  }
  if (p.n === 5) {
    common.sequence =
      "1) Clone/open repositoryUrl. 2) Map package.json scripts and CI workflows. 3) Propose minimal changes for lint/test gates. 4) Create CSN Releases sandbox row. 5) Run lint/tests locally; store output snippets as evidence. 6) Do not restructure without ADR.";
  }
  return common;
}

function writeStandard(s) {
  const dir = path.join(root, "standards");
  fs.mkdirSync(dir, { recursive: true });
  const fp = path.join(dir, s.file);
  const body = STANDARD_BODY[s.file] || "See CSN OS operator documentation.";
  const md = `---
artifactId: ${s.id}
artifactType: Network Standard
version: ${s.version}
status: Approved
scope: network-wide
validationStatus: Approved
---

# ${s.name}

${body}
`;
  fs.writeFileSync(fp, md);
}

function writePhase(p) {
  const b = phaseBody(p);
  const fp = path.join(root, "phase-specs", `phase-${String(p.n).padStart(2, "0")}.md`);
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  const md = `---
artifactId: csn:phase:v1:${String(p.n).padStart(2, "0")}
artifactType: Phase Specification
phase: ${p.n}
version: 1.0.0
status: Approved
scope: network-wide
validationStatus: Approved
standards:
${p.standards.map((x) => `  - ${x}`).join("\n")}
requiredInputs:
  - projectBrief
${p.n >= 5 ? "  - repositoryUrl\n" : ""}${p.n === 4 ? "  - architectureDecisionSummary\n" : ""}---

# Phase ${p.n} — ${p.title}

## Purpose and outcome
${b.purpose}

## Entry criteria
${b.entry}

## Required project inputs
${b.inputs}

## Required research
${b.research}

## Work sequence
${b.sequence}

## Expected deliverables
${b.deliverables}

## Acceptance criteria
${b.acceptance}

## Tests and validation
${b.tests}

## Evidence requirements
${b.evidence}

## Failure and recovery
${b.failure}

## Human approval
${b.gates}

## Exit criteria and handoff
${b.exit}
`;
  fs.writeFileSync(fp, md);
}

for (const s of STANDARDS) writeStandard(s);
for (const p of PHASES) writePhase(p);

const catalog = {
  standards: STANDARDS.map((s) => ({ ...s, path: `csn-os/standards/${s.file}` })),
  phases: PHASES.map((p) => ({
    phase: p.n,
    artifactId: `csn:phase:v1:${String(p.n).padStart(2, "0")}`,
    path: `csn-os/phase-specs/phase-${String(p.n).padStart(2, "0")}.md`,
  })),
  promptTemplates: [
    { artifactId: "csn:prompttpl:v1:execution-phase", path: "csn-os/prompt-templates/execution-phase.md" },
    { artifactId: "csn:prompttpl:v1:blocked-planning", path: "csn-os/prompt-templates/blocked-planning.md" },
  ],
};
fs.writeFileSync(path.join(root, "artifact-catalog.json"), JSON.stringify(catalog, null, 2) + "\n");
console.log("Materialized", STANDARDS.length, "standards and", PHASES.length, "phase specs.");
