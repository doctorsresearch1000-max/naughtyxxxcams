import fs from "fs";
import path from "path";
import crypto from "crypto";
import { csnOsRoot } from "./manifest.mjs";
import { parseFrontmatter, fillTemplate } from "./parse-frontmatter.mjs";
import { getNotion, getDb, queryByRichText } from "./notion.mjs";
import { checkPhaseReadiness } from "./workflow.mjs";
import { loadTaskPromptMarkdown } from "./task-prompt-catalog.mjs";
import {
  publishPromptToNotion,
  writeLocalPrompt,
  findTaskByExternalId,
} from "./publish-prompt-notion.mjs";

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

function substituteSimpleVars(template, vars) {
  return template.replace(/\{\{([A-Z0-9_]+)\}\}/g, (_, k) => vars[k] ?? "");
}

async function loadRunContext(manifest, runExternalId) {
  const notion = getNotion();
  const runsDb = getDb(manifest, "projectRuns");
  const runs = await queryByRichText(notion, runsDb.dataSourceId, "External ID", runExternalId);
  if (!runs[0]) throw new Error(`Project Run not found: ${runExternalId}`);
  const run = runs[0];
  const siteRel = run.properties.Site?.relation?.[0]?.id;
  if (!siteRel) throw new Error("Project Run has no Site relation");
  const site = await notion.pages.retrieve({ page_id: siteRel });
  return { notion, run, site };
}

export async function assemblePrompt({ manifest, runExternalId, phase, taskExternalId, publish = true }) {
  const { notion, run, site } = await loadRunContext(manifest, runExternalId);
  const gatesDb = getDb(manifest, "humanGates");

  const spec = loadPhaseSpec(phase);
  const standards = (spec.meta.standards || []).map(loadStandard).filter(Boolean);

  const inputs = {
    projectBrief: rt(run, "Project Brief") || rt(site, "Project Brief"),
    repositoryUrl: rt(site, "Repository URL") || site.properties["Repository URL"]?.url || "",
    architectureDecisionSummary: rt(run, "Architecture Summary"),
  };

  const blockingMissing = (REQUIRED_BY_PHASE[phase] || ["projectBrief"]).filter((k) => !inputs[k]?.trim());

  let readiness = { ready: true, missing: [] };
  const readinessWarnings = [];
  try {
    readiness = await checkPhaseReadiness(runExternalId, phase);
    for (const m of readiness.missing) {
      if (!blockingMissing.includes(m)) readinessWarnings.push(m);
    }
  } catch {
    /* optional */
  }

  const tasksDb = getDb(manifest, "tasks");
  const phaseExec = await notion.dataSources.query({
    data_source_id: tasksDb.dataSourceId,
    filter: {
      and: [
        { property: "Record Type", select: { equals: "Execution task" } },
        { property: "Project Run", relation: { contains: run.id } },
        { property: "Phase", number: { equals: phase } },
      ],
    },
    page_size: 50,
  });

  let targetTasks = phaseExec.results;
  if (taskExternalId) {
    const one = await findTaskByExternalId(notion, manifest, taskExternalId);
    if (one) targetTasks = [one];
  }

  const taskPlan = phaseExec.results
    .map((t) => {
      const title = t.properties.Task?.title?.[0]?.plain_text || "";
      const st = t.properties.Status?.status?.name || "";
      const instr = t.properties.Instructions?.rich_text?.map((x) => x.plain_text).join("") || "";
      const accept = t.properties["Acceptance Criteria"]?.rich_text?.map((x) => x.plain_text).join("") || "";
      return `### ${title} (${st})\n${instr}\n**Aceptación:** ${accept}`;
    })
    .join("\n\n");

  const promptId = taskExternalId
    ? `csn:prompt:${taskExternalId}:${crypto.createHash("sha256").update(`${taskExternalId}:${spec.meta.version}`).digest("hex").slice(0, 12)}`
    : `csn:prompt:${runExternalId}:p${String(phase).padStart(2, "0")}:${crypto
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
    promptTemplate: blockingMissing.length
      ? "csn:prompttpl:v1:blocked-planning"
      : "csn:prompttpl:v1:execution-phase",
  };

  const baseVars = {
    PROMPT_ID: promptId,
    SITE_NAME: site.properties["Site Name"]?.title?.[0]?.plain_text || "Unknown",
    RUN_EXTERNAL_ID: runExternalId,
    REPOSITORY_URL: inputs.repositoryUrl || "(not set)",
  };

  let content;
  const overrideMd = taskExternalId ? loadTaskPromptMarkdown(taskExternalId) : null;
  if (overrideMd && blockingMissing.length === 0) {
    content = substituteSimpleVars(overrideMd, baseVars);
  } else {
    const templateRel = blockingMissing.length
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

    const humanBlock = runGates
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
        blockingMissing.push("production_deploy gate Approved");
      }
    }

    const warnBlock = readinessWarnings.length
      ? `\n\n### Advertencias de preparación (no bloquean QA)\n${readinessWarnings.map((w) => `- ${w}`).join("\n")}`
      : "";

    const vars = {
      ...baseVars,
      GENERATED_AT: new Date().toISOString(),
      SOURCE_VERSIONS_JSON: JSON.stringify(sourceVersions, null, 2),
      PHASE_NUMBER: String(phase),
      PHASE_TITLE: spec.body.match(/^# Phase \d+ — (.+)/m)?.[1] || spec.meta.artifactType,
      RECORD_CLASS: site.properties["Record Class"]?.select?.name || "Unknown",
      DOMAIN: site.properties.Domain?.url || "",
      RUN_NAME: run.properties["Run Name"]?.title?.[0]?.plain_text || "",
      LAUNCH_KEY: rt(run, "Launch Key"),
      PROJECT_BRIEF: inputs.projectBrief || "(empty)",
      APPROVED_DECISIONS: humanBlock || "None recorded on this run.",
      PHASE_SPEC_PATH: spec.path,
      PHASE_SPEC_ARTIFACT_ID: spec.meta.artifactId,
      PHASE_SPEC_VERSION: spec.meta.version || "1.0.0",
      STANDARDS_LIST: standards.map((s) => `${s.meta.artifactId} (${s.path})`).join("; ") || "none",
      PRELIMINARY_INVESTIGATION:
        spec.body.match(/## Required research\n([\s\S]*?)\n##/)?.[1]?.trim() || spec.body.slice(0, 800),
      AUTHORIZED_SCOPE: spec.body.match(/## Work sequence\n([\s\S]*?)\n##/)?.[1]?.trim() || "See phase spec.",
      EXCLUSIONS:
        "No domain purchase, paid backlinks, production DNS, or production deploy without Approved gate for that action. Do not modify legacy Notion KPI hub or unrelated production sites.",
      IMPLEMENTATION_PLAN:
        (spec.body.match(/## Work sequence\n([\s\S]*?)\n## Expected/)?.[1]?.trim() || "") +
        "\n\n## Tareas de ejecución (este proyecto)\n\n" +
        (taskPlan || "(Sin tareas de ejecución para esta fase — ejecutar `npm run csn -- sync-tareas --run-external-id=...`)") +
        warnBlock,
      DELIVERABLES: spec.body.match(/## Expected deliverables\n([\s\S]*?)\n##/)?.[1]?.trim() || "",
      TESTING_PROCEDURE: spec.body.match(/## Tests and validation\n([\s\S]*?)\n##/)?.[1]?.trim() || "",
      ACCEPTANCE_CRITERIA: spec.body.match(/## Acceptance criteria\n([\s\S]*?)\n##/)?.[1]?.trim() || "",
      EVIDENCE_REQUIREMENTS: spec.body.match(/## Evidence requirements\n([\s\S]*?)\n##/)?.[1]?.trim() || "",
      FAILURE_HANDLING: spec.body.match(/## Failure and recovery\n([\s\S]*?)\n##/)?.[1]?.trim() || "",
      HUMAN_APPROVALS: spec.body.match(/## Human approval\n([\s\S]*?)\n##/)?.[1]?.trim() + "\n\n" + humanBlock,
      NEXT_PHASE: String(Math.min(12, phase + 1)),
      HANDOFF_CONTRACT:
        "Update Project Run Current Phase; mark execution tasks Done with evidence; list open gates; attach this prompt path; prepare inputs for next phase per phase spec exit section.",
      MISSING_INPUTS_LIST: blockingMissing.map((m) => `- ${m}`).join("\n") || "None",
      READINESS_NOTE: readinessWarnings.length
        ? `Requisitos de datos: OK. Advertencias: ${readinessWarnings.join("; ")}`
        : readiness.ready
          ? "Requisitos previos: OK (las aprobaciones humanas siguen siendo control manual)."
          : "Revisar advertencias antes de producción; en QA puedes ejecutar con precaución.",
    };

    content = fillTemplate(template, vars);
  }

  const localRelativePath = writeLocalPrompt(promptId, content);
  const outFile = path.join(csnOsRoot(), "..", localRelativePath);

  const publishResults = [];
  if (publish && targetTasks.length > 0 && blockingMissing.length === 0) {
    for (const t of targetTasks) {
      const title = t.properties.Task?.title?.[0]?.plain_text || "Tarea";
      const ext = t.properties["External ID"]?.rich_text?.map((x) => x.plain_text).join("") || "";
      let md = content;
      const taskOverride = loadTaskPromptMarkdown(ext);
      if (taskOverride) {
        md = substituteSimpleVars(taskOverride, { ...baseVars, PROMPT_ID: promptId });
        writeLocalPrompt(promptId + "_" + ext.split(":").pop(), md);
      }
      const pub = await publishPromptToNotion({
        notion,
        manifest,
        taskPageId: t.id,
        taskTitle: title,
        markdown: md,
        promptId,
        localRelativePath,
        runPageId: targetTasks.length === 1 || t === targetTasks[0] ? run.id : undefined,
      });
      publishResults.push({ taskExternalId: ext, ...pub });
    }
  }

  if (publishResults[0]) {
    await notion.pages.update({
      page_id: run.id,
      properties: {
        "Generated Prompt ID": { rich_text: [{ text: { content: promptId.slice(0, 2000) } }] },
        "Generated Prompt Path": { rich_text: [{ text: { content: localRelativePath } }] },
        "Prompt Notion URL": { url: publishResults[0].notionUrl },
        "Source Versions": {
          rich_text: [{ text: { content: JSON.stringify(sourceVersions).slice(0, 2000) } }],
        },
      },
    });
  }

  return {
    promptId,
    path: outFile,
    blocked: blockingMissing.length > 0,
    missing: blockingMissing,
    readinessWarnings,
    sourceVersions,
    notionUrl: publishResults[0]?.notionUrl,
    publishResults,
  };
}
