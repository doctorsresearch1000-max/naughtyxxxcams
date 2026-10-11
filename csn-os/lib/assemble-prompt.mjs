import fs from "fs";
import path from "path";
import crypto from "crypto";
import { csnOsRoot } from "./manifest.mjs";
import { parseFrontmatter, fillTemplate } from "./parse-frontmatter.mjs";
import { getNotion, getDb, queryByRichText } from "./notion.mjs";

const REQUIRED_BY_PHASE = {
  1: ["projectBrief"],
  2: ["projectBrief"],
  3: ["projectBrief"],
  4: ["projectBrief", "architectureDecisionSummary"],
  5: ["projectBrief", "repositoryUrl"],
  6: ["projectBrief", "repositoryUrl"],
  7: ["projectBrief"],
  8: ["projectBrief", "repositoryUrl"],
  9: ["projectBrief"],
  10: ["projectBrief", "repositoryUrl"],
  11: ["projectBrief", "repositoryUrl"],
  12: ["projectBrief"],
};

function readRepoFile(rel) {
  const fp = path.join(csnOsRoot(), "..", rel.replace(/^csn-os\//, "csn-os/"));
  const alt = path.join(csnOsRoot(), rel.replace(/^csn-os\//, ""));
  const p = fs.existsSync(fp) ? fp : alt;
  return fs.readFileSync(p, "utf8");
}

function loadPhaseSpec(phase) {
  const fp = path.join(csnOsRoot(), "phase-specs", `phase-${String(phase).padStart(2, "0")}.md`);
  const raw = fs.readFileSync(fp, "utf8");
  const { meta, body } = parseFrontmatter(raw);
  return { meta, body, path: `csn-os/phase-specs/phase-${String(phase).padStart(2, "0")}.md` };
}

function loadStandard(artifactId) {
  const catalog = JSON.parse(fs.readFileSync(path.join(csnOsRoot(), "artifact-catalog.json"), "utf8"));
  const s = catalog.standards.find((x) => x.id === artifactId);
  if (!s) return null;
  const raw = fs.readFileSync(path.join(csnOsRoot(), "standards", s.file), "utf8");
  const { meta, body } = parseFrontmatter(raw);
  return { meta, body, path: s.path };
}

function rt(page, name) {
  const p = page.properties?.[name];
  if (p?.type === "rich_text") return p.rich_text?.map((t) => t.plain_text).join("") || "";
  if (p?.type === "url") return p.url || "";
  return "";
}

export async function assemblePrompt({ manifest, runExternalId, phase }) {
  const notion = getNotion();
  const runsDb = getDb(manifest, "projectRuns");
  const sitesDb = getDb(manifest, "csnSites");
  const gatesDb = getDb(manifest, "humanGates");

  const runs = await queryByRichText(notion, runsDb.dataSourceId, "External ID", runExternalId);
  if (!runs[0]) throw new Error(`Project Run not found: ${runExternalId}`);
  const run = runs[0];

  const siteRel = run.properties.Site?.relation?.[0]?.id;
  if (!siteRel) throw new Error("Project Run has no Site relation");
  const site = await notion.pages.retrieve({ page_id: siteRel });

  const spec = loadPhaseSpec(phase);
  const standards = (spec.meta.standards || []).map(loadStandard).filter(Boolean);

  const inputs = {
    projectBrief: rt(run, "Project Brief") || rt(site, "Project Brief"),
    repositoryUrl: rt(site, "Repository URL") || site.properties["Repository URL"]?.url || "",
    architectureDecisionSummary: rt(run, "Architecture Summary"),
  };

  const missing = (REQUIRED_BY_PHASE[phase] || ["projectBrief"]).filter((k) => !inputs[k]?.trim());

  const promptId = `csn:prompt:${runExternalId}:p${String(phase).padStart(2, "0")}:${crypto
    .createHash("sha256")
    .update(`${runExternalId}:${phase}:${spec.meta.version}`)
    .digest("hex")
    .slice(0, 12)}`;

  const sourceVersions = {
    phaseSpec: { id: spec.meta.artifactId, version: spec.meta.version, status: spec.meta.status },
    standards: standards.map((s) => ({
      id: s.meta.artifactId,
      version: s.meta.version,
      status: s.meta.status,
    })),
    promptTemplate: missing.length
      ? "csn:prompttpl:v1:blocked-planning"
      : "csn:prompttpl:v1:execution-phase",
  };

  const templateRel = missing.length
    ? "csn-os/prompt-templates/blocked-planning.md"
    : "csn-os/prompt-templates/execution-phase.md";
  const template = readRepoFile(templateRel);

  const gates = await notion.dataSources.query({
    data_source_id: gatesDb.dataSourceId,
    page_size: 50,
  });
  const runGates = gates.results.filter((g) =>
    g.properties["Project Run"]?.relation?.some((r) => r.id === run.id),
  );

  let humanBlock = runGates
    .map((g) => {
      const title = g.properties.Gate?.title?.[0]?.plain_text || "Gate";
      const st = g.properties.Status?.select?.name;
      const typ = g.properties["Target Type"]?.select?.name;
      const tid = rt(g, "Target External ID");
      return `- ${title} (${typ}) ${tid}: **${st}**`;
    })
    .join("\n");

  if (phase === 11) {
    const prod = runGates.find(
      (g) =>
        g.properties["Target Type"]?.select?.name === "production_deploy" &&
        g.properties.Status?.select?.name === "Approved",
    );
    if (!prod && inputs.projectBrief && !rt(site, "Record Class").includes("QA")) {
      missing.push("production_deploy gate Approved");
    }
  }

  const vars = {
    PROMPT_ID: promptId,
    GENERATED_AT: new Date().toISOString(),
    SOURCE_VERSIONS_JSON: JSON.stringify(sourceVersions, null, 2),
    PHASE_NUMBER: String(phase),
    PHASE_TITLE: spec.body.match(/^# Phase \d+ — (.+)/m)?.[1] || spec.meta.artifactType,
    SITE_NAME: site.properties["Site Name"]?.title?.[0]?.plain_text || "Unknown",
    RECORD_CLASS: site.properties["Record Class"]?.select?.name || "Unknown",
    DOMAIN: site.properties.Domain?.url || "",
    RUN_NAME: run.properties["Run Name"]?.title?.[0]?.plain_text || "",
    RUN_EXTERNAL_ID: runExternalId,
    LAUNCH_KEY: rt(run, "Launch Key"),
    REPOSITORY_URL: inputs.repositoryUrl || "(not set — required for this phase)",
    PROJECT_BRIEF: inputs.projectBrief || "(empty)",
    APPROVED_DECISIONS: humanBlock || "None recorded on this run.",
    PHASE_SPEC_PATH: spec.path,
    PHASE_SPEC_ARTIFACT_ID: spec.meta.artifactId,
    PHASE_SPEC_VERSION: spec.meta.version || "1.0.0",
    STANDARDS_LIST: standards.map((s) => `${s.meta.artifactId} (${s.path})`).join("; ") || "none",
    PRELIMINARY_INVESTIGATION: spec.body.match(/## Required research\n([\s\S]*?)\n##/)?.[1]?.trim() || spec.body.slice(0, 800),
    AUTHORIZED_SCOPE: spec.body.match(/## Work sequence\n([\s\S]*?)\n##/)?.[1]?.trim() || "See phase spec.",
    EXCLUSIONS:
      "No domain purchase, paid backlinks, production DNS, or production deploy without Approved gate for that action. Do not modify legacy Notion KPI hub or unrelated production sites.",
    IMPLEMENTATION_PLAN: spec.body.match(/## Work sequence\n([\s\S]*?)\n## Expected/)?.[1]?.trim() || "",
    DELIVERABLES: spec.body.match(/## Expected deliverables\n([\s\S]*?)\n##/)?.[1]?.trim() || "",
    TESTING_PROCEDURE: spec.body.match(/## Tests and validation\n([\s\S]*?)\n##/)?.[1]?.trim() || "",
    ACCEPTANCE_CRITERIA: spec.body.match(/## Acceptance criteria\n([\s\S]*?)\n##/)?.[1]?.trim() || "",
    EVIDENCE_REQUIREMENTS: spec.body.match(/## Evidence requirements\n([\s\S]*?)\n##/)?.[1]?.trim() || "",
    FAILURE_HANDLING: spec.body.match(/## Failure and recovery\n([\s\S]*?)\n##/)?.[1]?.trim() || "",
    HUMAN_APPROVALS: spec.body.match(/## Human approval\n([\s\S]*?)\n##/)?.[1]?.trim() + "\n\n" + humanBlock,
    NEXT_PHASE: String(Math.min(12, phase + 1)),
    HANDOFF_CONTRACT:
      "Update Project Run Current Phase; mark execution tasks Done with evidence; list open gates; attach this prompt path; prepare inputs for next phase per phase spec exit section.",
    MISSING_INPUTS_LIST: missing.map((m) => `- ${m}`).join("\n") || "None",
  };

  const content = fillTemplate(template, vars);
  const outDir = path.join(csnOsRoot(), "generated-prompts");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `${promptId.replace(/:/g, "_")}.md`);
  fs.writeFileSync(outFile, content);

  await notion.pages.update({
    page_id: run.id,
    properties: {
      "Generated Prompt ID": { rich_text: [{ text: { content: promptId.slice(0, 2000) } }] },
      "Generated Prompt Path": {
        rich_text: [{ text: { content: path.relative(path.join(csnOsRoot(), ".."), outFile) } }],
      },
      "Source Versions": {
        rich_text: [{ text: { content: JSON.stringify(sourceVersions).slice(0, 2000) } }],
      },
    },
  });

  return {
    promptId,
    path: outFile,
    blocked: missing.length > 0,
    missing,
    sourceVersions,
  };
}
