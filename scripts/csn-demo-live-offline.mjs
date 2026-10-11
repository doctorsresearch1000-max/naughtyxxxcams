#!/usr/bin/env node
/**
 * Flujo demo verificable: proyecto QA + prompt completo EN NOTION + panel actualizado.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { loadManifest } from "../csn-os/lib/manifest.mjs";
import { getNotion, legacyRowCounts, queryByRichText } from "../csn-os/lib/notion.mjs";
import { ensureOperationalSchema } from "../csn-os/lib/ensure-operational-schema.mjs";
import { createProject, syncExecutionTasksForRun, recordExecutionResult } from "../csn-os/lib/workflow.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const DEMO_LAUNCH = "demo-qa-live-offline";
const DEMO_RUN_EXT = `csn:run:${DEMO_LAUNCH}`;
const DEMO_TASK_EXT = `csn:taskrun:${DEMO_RUN_EXT}:demo-live-offline-v1`;
const PROMPT_PAGE_TITLE = "📋 PROMPT Cursor (copiar) — LIVE/OFFLINE perfiles QA";
const FLOW_PAGE_TITLE = "▶ Flujo demo QA — paso a paso";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rt = (t) => [{ type: "text", text: { content: (t || "").slice(0, 2000) } }];

function chunkText(text, size = 1900) {
  const parts = [];
  for (let i = 0; i < text.length; i += size) parts.push(text.slice(i, i + size));
  return parts;
}

async function deleteAllBlocks(notion, blockId, keepChildPages = false) {
  let cursor;
  const ids = [];
  do {
    const res = await notion.blocks.children.list({ block_id: blockId, page_size: 100, start_cursor: cursor });
    for (const b of res.results) {
      if (keepChildPages && b.type === "child_page") continue;
      ids.push(b.id);
    }
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  for (const id of ids) {
    try {
      await notion.blocks.delete({ block_id: id });
    } catch {
      /* already removed */
    }
    await sleep(80);
  }
  return ids.length;
}

async function appendMarkdownAsBlocks(notion, pageId, markdown) {
  const lines = markdown.split("\n");
  const children = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    if (line.startsWith("# ")) {
      children.push({ object: "block", type: "heading_1", heading_1: { rich_text: rt(line.slice(2)) } });
    } else if (line.startsWith("## ")) {
      children.push({ object: "block", type: "heading_2", heading_2: { rich_text: rt(line.slice(3)) } });
    } else if (line.startsWith("### ")) {
      children.push({ object: "block", type: "heading_3", heading_3: { rich_text: rt(line.slice(4)) } });
    } else if (line.startsWith("- [ ]")) {
      children.push({
        object: "block",
        type: "to_do",
        to_do: { rich_text: rt(line.replace(/^- \[ \]\s*/, "")), checked: false },
      });
    } else if (line.startsWith("- ")) {
      children.push({ object: "block", type: "bulleted_list_item", bulleted_list_item: { rich_text: rt(line.slice(2)) } });
    } else if (line.startsWith("```")) {
      continue;
    } else {
      children.push({ object: "block", type: "paragraph", paragraph: { rich_text: rt(line) } });
    }
  }
  for (let i = 0; i < children.length; i += 80) {
    await notion.blocks.children.append({ block_id: pageId, children: children.slice(i, i + 80) });
    await sleep(350);
  }
}

async function ensureChildPage(notion, parentId, title) {
  let cursor;
  do {
    const res = await notion.blocks.children.list({ block_id: parentId, page_size: 100, start_cursor: cursor });
    for (const b of res.results) {
      if (b.type !== "child_page") continue;
      const p = await notion.pages.retrieve({ page_id: b.id });
      const t = Object.values(p.properties).find((x) => x.type === "title");
      if (t?.title?.map((x) => x.plain_text).join("") === title) return p.id;
    }
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  const created = await notion.pages.create({
    parent: { page_id: parentId },
    properties: { title: { title: [{ text: { content: title } }] } },
  });
  return created.id;
}

async function ensureDemoTask(notion, manifest, runId, siteId) {
  const tasksDb = manifest.databases.tasks;
  let task = (await queryByRichText(notion, tasksDb.dataSourceId, "External ID", DEMO_TASK_EXT))[0];
  if (!task) {
    task = await notion.pages.create({
      parent: { database_id: tasksDb.id },
      properties: {
        Task: {
          title: [{ text: { content: "[QA] Coherencia LIVE/OFFLINE en perfiles de modelo" } }],
        },
        "Record Type": { select: { name: "Execution task" } },
        "External ID": { rich_text: rt(DEMO_TASK_EXT) },
        Phase: { number: 7 },
        Status: { status: { name: "In progress" } },
        "Project Run": { relation: [{ id: runId }] },
        Site: { relation: [{ id: siteId }] },
        Instructions: {
          rich_text: rt(
            "Abrir la página hijo PROMPT Cursor en el panel CSN OS, copiar todo el contenido a un agente Cursor nuevo, ejecutar en el repo naughtyxxxcams (QA).",
          ),
        },
        "Acceptance Criteria": {
          rich_text: rt("Lint + test:seo OK; badge LIVE coherente; informe con evidencias."),
        },
      },
    });
  }
  return task;
}

async function rebuildPanel(notion, manifest, links) {
  const panelId = manifest.panelPageId;
  if (!panelId) throw new Error("panelPageId missing — run csn panel first");

  await deleteAllBlocks(notion, panelId, true);

  const blocks = [
    {
      object: "block",
      type: "callout",
      callout: {
        icon: { emoji: "✅" },
        rich_text: rt(
          "EMPIEZA AQUÍ — Proyecto demo QA listo. El prompt completo para Cursor está en Notion (página enlazada abajo). No hace falta terminal solo para leer el prompt.",
        ),
      },
    },
    { object: "block", type: "heading_1", heading_1: { rich_text: rt("Proyecto de prueba activo") } },
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          { type: "text", text: { content: "Nombre: DEMO QA — LIVE/OFFLINE Cam Profiles | Clase: QA test-only\n" } },
          { type: "text", text: { content: "Abrir Project Run → ", link: null } },
          { type: "text", text: { content: "enlace", link: { url: links.runUrl } } },
        ],
      },
    },
    { object: "block", type: "heading_1", heading_1: { rich_text: rt("Pasos (flujo real)") } },
    {
      object: "block",
      type: "numbered_list_item",
      numbered_list_item: {
        rich_text: rt("Abre el Project Run del demo (enlace arriba) y confirma Record Class = QA test-only."),
      },
    },
    {
      object: "block",
      type: "numbered_list_item",
      numbered_list_item: {
        rich_text: [
          { type: "text", text: { content: "Abre la tarea técnica: " } },
          { type: "text", text: { content: "coherencia LIVE/OFFLINE", link: { url: links.taskUrl } } },
        ],
      },
    },
    {
      object: "block",
      type: "numbered_list_item",
      numbered_list_item: {
        rich_text: [
          { type: "text", text: { content: "Copia el PROMPT completo desde: " } },
          { type: "text", text: { content: PROMPT_PAGE_TITLE, link: { url: links.promptUrl } } },
        ],
      },
    },
    {
      object: "block",
      type: "numbered_list_item",
      numbered_list_item: { rich_text: rt("Pega en un agente Cursor nuevo y ejecuta en el repo (solo QA).") },
    },
    {
      object: "block",
      type: "numbered_list_item",
      numbered_list_item: {
        rich_text: [
          { type: "text", text: { content: "Guía detallada: " } },
          { type: "text", text: { content: FLOW_PAGE_TITLE, link: { url: links.flowUrl } } },
        ],
      },
    },
    {
      object: "block",
      type: "numbered_list_item",
      numbered_list_item: {
        rich_text: rt(
          "Tras Cursor: actualiza la tarea en Tasks o ejecuta en terminal: npm run csn -- resultado --run-external-id=csn:run:demo-qa-live-offline --phase=7 --json=informe.json",
        ),
      },
    },
    { object: "block", type: "heading_2", heading_2: { rich_text: rt("Qué falta para continuar") } },
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: rt(
          "Si el prompt no está visible, ejecuta una vez en el repo: npm run csn -- demo-live-offline (regenera páginas). Human Gates: control manual, no bloquean deploy.",
        ),
      },
    },
    { object: "block", type: "heading_2", heading_2: { rich_text: rt("Acceso rápido a bases de datos") } },
    ...Object.values(manifest.databases).map((db) => ({
      object: "block",
      type: "bulleted_list_item",
      bulleted_list_item: {
        rich_text: [
          { type: "text", text: { content: `${db.title}: ` } },
          { type: "text", text: { content: "abrir", link: { url: db.url } } },
        ],
      },
    })),
  ];

  await notion.blocks.children.append({ block_id: panelId, children: blocks });
}

async function main() {
  const manifest = loadManifest();
  const notion = getNotion();
  const legacyBefore = await legacyRowCounts(notion);
  await ensureOperationalSchema(notion, manifest);

  const promptMd = fs.readFileSync(
    path.join(__dirname, "../csn-os/prompts/DEMO-QA-live-offline-profiles.md"),
    "utf8",
  );
  const outPath = path.join(__dirname, "../csn-os/generated-prompts/DEMO-QA-live-offline-profiles.md");
  fs.writeFileSync(outPath, promptMd);

  const proj = await createProject({
    siteName: "DEMO QA — LIVE/OFFLINE Cam Profiles",
    launchKey: DEMO_LAUNCH,
    isQa: true,
    domain: "https://demoqa-liveoffline.example",
    niche: "Live cams (ficticio QA)",
    stack: "Next.js 16 + OpenNext Cloudflare (repo naughtyxxxcams)",
    monetization: "Afiliación CrakRevenue (solo documentación en QA)",
    projectGoal: "Validar flujo CSN OS con tarea técnica LIVE/OFFLINE",
    repositoryUrl: "https://github.com/doctorsresearch1000-max/naughtyxxxcams",
    projectBrief:
      "Sitio QA ficticio para probar CSN OS. Tarea actual: alinear estado LIVE/OFFLINE en perfiles. Repo real inspeccionado: doctorsresearch1000-max/naughtyxxxcams. Sin deploy.",
  });

  await syncExecutionTasksForRun(notion, manifest, DEMO_RUN_EXT);
  const runPage = (await queryByRichText(notion, manifest.databases.projectRuns.dataSourceId, "External ID", DEMO_RUN_EXT))[0];
  const task = await ensureDemoTask(notion, manifest, runPage.id, proj.siteId);

  const panelId = manifest.panelPageId;
  const promptPageId = await ensureChildPage(notion, panelId, PROMPT_PAGE_TITLE);
  const flowPageId = await ensureChildPage(notion, panelId, FLOW_PAGE_TITLE);

  await deleteAllBlocks(notion, promptPageId, false);
  await appendMarkdownAsBlocks(notion, promptPageId, promptMd);

  await deleteAllBlocks(notion, flowPageId, false);
  const flowMd = `# Flujo demo QA

1. Panel principal → proyecto demo arriba.
2. Tarea: coherencia LIVE/OFFLINE.
3. Página «${PROMPT_PAGE_TITLE}» → seleccionar todo → copiar.
4. Cursor → agente nuevo → pegar → ejecutar.
5. Registrar resultado en Tasks o CLI resultado.

**Limitación:** Notion no abre Cursor automáticamente.`;
  await appendMarkdownAsBlocks(notion, flowPageId, flowMd);

  const promptPage = await notion.pages.retrieve({ page_id: promptPageId });
  const flowPage = await notion.pages.retrieve({ page_id: flowPageId });
  const runUrl = runPage.url;
  const taskUrl = task.url || (await notion.pages.retrieve({ page_id: task.id })).url;

  await notion.pages.update({
    page_id: runPage.id,
    properties: {
      "Generated Prompt ID": { rich_text: rt("csn:prompt:demo-qa-live-offline:task-live-offline-v1") },
      "Generated Prompt Path": { rich_text: rt("Notion: " + PROMPT_PAGE_TITLE) },
      "Current Phase": { number: 7 },
    },
  });

  await rebuildPanel(notion, manifest, {
    runUrl,
    taskUrl,
    promptUrl: promptPage.url,
    flowUrl: flowPage.url,
  });

  const panel = await notion.pages.retrieve({ page_id: panelId });
  let promptNotionBlockCount = 0;
  {
    let bc;
    do {
      const pr = await notion.blocks.children.list({
        block_id: promptPageId,
        page_size: 100,
        start_cursor: bc,
      });
      promptNotionBlockCount += pr.results.length;
      bc = pr.has_more ? pr.next_cursor : undefined;
    } while (bc);
  }
  const legacyAfter = await legacyRowCounts(notion);

  const evidence = {
    panelUrl: panel.url,
    promptPageUrl: promptPage.url,
    flowPageUrl: flowPage.url,
    runExternalId: DEMO_RUN_EXT,
    runUrl,
    taskUrl,
    taskExternalId: DEMO_TASK_EXT,
    promptFileRepo: outPath,
    promptNotionBlockCount,
    promptPreview: promptMd.slice(0, 400),
    legacyOk: JSON.stringify(legacyBefore) === JSON.stringify(legacyAfter),
    legacyBefore,
    legacyAfter,
  };

  fs.writeFileSync(path.join(__dirname, "../docs/csn-demo-flow-evidence.json"), JSON.stringify(evidence, null, 2));

  // Simulated execution record (sandbox)
  const reportPath = path.join(__dirname, "../csn-os/execution-reports/demo-qa-informe-ejemplo.json");
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        executionStatus: "verified_sandbox",
        verificationLabel: "Verificado en sandbox",
        summary: "Registro de ejemplo — operador reemplazará tras Cursor real",
        evidenceUrls: [promptPage.url],
        tests: [{ cmd: "npm run csn -- demo-live-offline", exit: 0 }],
        advancePhase: false,
      },
      null,
      2,
    ),
  );
  await recordExecutionResult(DEMO_RUN_EXT, 7, JSON.parse(fs.readFileSync(reportPath, "utf8")));

  console.log(JSON.stringify(evidence, null, 2));
}

main().catch((e) => {
  console.error(e.body?.message || e.message || e);
  process.exit(1);
});
