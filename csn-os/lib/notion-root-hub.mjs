import { loadManifest } from "./manifest.mjs";
import { getNotion, queryByRichText } from "./notion.mjs";
import { deleteBlocksExceptChildPagesAndDatabases, rt } from "./notion-markdown-blocks.mjs";
import { PRIMARY_ENTRY_TITLE } from "./primary-entry-page.mjs";

const HUB_MARKER = "csn-hub-marker-v3";
const DEMO_RUN_EXT = "csn:run:demo-qa-live-offline";
const DEMO_TASK_EXT = "csn:taskrun:csn:run:demo-qa-live-offline:demo-live-offline-v1";

function link(label, url) {
  return [
    { type: "text", text: { content: label, link: url ? { url } : null } },
  ];
}

export async function syncCanonicalRootHub(manifest, links = {}) {
  const notion = getNotion();
  const rootId = manifest.rootPageId;
  const dbs = manifest.databases;
  const runbookUrl = manifest.runbookPageUrl;
  const panelUrl = manifest.panelPageUrl;

  let runUrl = links.runUrl;
  let taskUrl = links.taskUrl;
  let promptUrl = links.promptUrl;
  const promptLinks = links.promptLinks || [];

  if (!runUrl || !taskUrl || !promptUrl) {
    const run = (await queryByRichText(notion, dbs.projectRuns.dataSourceId, "External ID", DEMO_RUN_EXT))[0];
    if (run) {
      runUrl = run.url;
      promptUrl = run.properties["Prompt Notion URL"]?.url || promptUrl;
    }
    const task = (await queryByRichText(notion, dbs.tasks.dataSourceId, "External ID", DEMO_TASK_EXT))[0];
    if (task) {
      taskUrl = task.url;
      promptUrl = task.properties["Prompt Notion URL"]?.url || promptUrl;
    }
  }

  if (!promptLinks.length) {
    for (const ext of [
      DEMO_TASK_EXT,
      `csn:taskrun:${DEMO_RUN_EXT}:p05:02`,
      `csn:taskrun:${DEMO_RUN_EXT}:p06:01`,
    ]) {
      const row = (await queryByRichText(notion, dbs.tasks.dataSourceId, "External ID", ext))[0];
      if (!row) continue;
      const u = row.properties["Prompt Notion URL"]?.url;
      const name = row.properties.Task?.title?.[0]?.plain_text || ext;
      if (u) promptLinks.push({ name, url: u });
    }
  }

  await deleteBlocksExceptChildPagesAndDatabases(notion, rootId);

  const blocks = [
    {
      object: "block",
      type: "callout",
      callout: {
        icon: { emoji: "▶️" },
        rich_text: rt(
          `Empieza aquí — ${PRIMARY_ENTRY_TITLE} es tu centro operativo: proyecto → tarea → prompt Cursor → ejecución → resultado. Los registros QA son solo prueba; no mezcles con producción ni KPI legacy. (${HUB_MARKER})`,
        ),
      },
    },
    {
      object: "block",
      type: "callout",
      callout: {
        icon: { emoji: "🔒" },
        rich_text: rt(
          "CSN OS aislado: sin relaciones con OPERATIONS / KNOWLEDGE / KPI History legacy. Las filas QA test-only no alimentan lanzamientos de producción.",
        ),
      },
    },
    { object: "block", type: "heading_2", heading_2: { rich_text: rt("A. Cómo empezar o continuar") } },
    {
      object: "block",
      type: "numbered_list_item",
      numbered_list_item: {
        rich_text: [
          { type: "text", text: { content: "Nuevo proyecto: crea filas en " } },
          ...link("CSN Sites", dbs.csnSites.url),
          { type: "text", text: { content: " + " } },
          ...link("Project Runs", dbs.projectRuns.url),
          { type: "text", text: { content: " (o usa el proyecto demo QA enlazado abajo)." } },
        ],
      },
    },
    {
      object: "block",
      type: "numbered_list_item",
      numbered_list_item: {
        rich_text: [
          { type: "text", text: { content: "Continuar: abre tu " } },
          ...link("Project Run", runUrl),
          { type: "text", text: { content: " y la " } },
          ...link("tarea activa", taskUrl),
        ],
      },
    },
    {
      object: "block",
      type: "numbered_list_item",
      numbered_list_item: {
        rich_text: [
          { type: "text", text: { content: "Copia el " } },
          ...link("prompt en Notion", promptUrl),
          { type: "text", text: { content: " (página hija de la tarea o campo Prompt Notion URL)." } },
        ],
      },
    },
    {
      object: "block",
      type: "numbered_list_item",
      numbered_list_item: {
        rich_text: rt("Ejecuta en Cursor solo el alcance del prompt. Sin deploy, DNS ni compras sin gate humano."),
      },
    },
    {
      object: "block",
      type: "numbered_list_item",
      numbered_list_item: {
        rich_text: rt(
          "Registra resultado en la tarea o: npm run csn -- resultado --run-external-id=<run> --phase=N --json=informe.json",
        ),
      },
    },
    { object: "block", type: "heading_2", heading_2: { rich_text: rt("B. Proyectos") } },
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          { type: "text", text: { content: "Sitios: " } },
          ...link("CSN Sites", dbs.csnSites.url),
          { type: "text", text: { content: " | Lanzamientos: " } },
          ...link("Project Runs", dbs.projectRuns.url),
          { type: "text", text: { content: " — filtra Record Class = QA test-only para pruebas." } },
        ],
      },
    },
    { object: "block", type: "heading_2", heading_2: { rich_text: rt("C. Tareas y plan técnico") } },
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          { type: "text", text: { content: "Abre " } },
          ...link("Tasks", dbs.tasks.url),
          {
            type: "text",
            text: {
              content:
                " → filtra por tu Project Run. Cada tarea de ejecución tiene instrucciones, criterios de aceptación y prompt.",
            },
          },
        ],
      },
    },
    { object: "block", type: "heading_2", heading_2: { rich_text: rt("D. Prompts Cursor (QA demo)") } },
    ...promptLinks.map((p) => ({
      object: "block",
      type: "bulleted_list_item",
      bulleted_list_item: {
        rich_text: [
          { type: "text", text: { content: `${p.name}: ` } },
          { type: "text", text: { content: "abrir prompt", link: { url: p.url } } },
        ],
      },
    })),
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: rt(
          "Generar/regenerar: npm run csn -- prompt --run-external-id=<run> --phase=N (publica en Notion y rellena Prompt Notion URL).",
        ),
      },
    },
    { object: "block", type: "heading_2", heading_2: { rich_text: rt("E. Resultados y siguiente paso") } },
    {
      object: "block",
      type: "bulleted_list_item",
      bulleted_list_item: {
        rich_text: rt(
          "Campos: Resultado ejecución, Required Evidence, Último informe ejecución en el Project Run. Un fallo no marca la tarea como Done.",
        ),
      },
    },
    {
      object: "block",
      type: "bulleted_list_item",
      bulleted_list_item: {
        rich_text: rt("Siguiente paso: npm run csn -- plan --run-external-id=<run> tras registrar el informe."),
      },
    },
    { object: "block", type: "heading_2", heading_2: { rich_text: rt("F. Runbooks (12 fases)") } },
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          { type: "text", text: { content: "Referencia en español: " } },
          { type: "text", text: { content: "Runbooks operativos", link: runbookUrl ? { url: runbookUrl } : null } },
          { type: "text", text: { content: " | Panel secundario: " } },
          { type: "text", text: { content: "abrir", link: panelUrl ? { url: panelUrl } : null } },
        ],
      },
    },
    { object: "block", type: "heading_3", heading_3: { rich_text: rt("Si una tarea falla") } },
    {
      object: "block",
      type: "bulleted_list_item",
      bulleted_list_item: { rich_text: rt("Estado Bloqueada + motivo en Resultado ejecución.") },
    },
    {
      object: "block",
      type: "bulleted_list_item",
      bulleted_list_item: { rich_text: rt("Regenera prompt si cambió el contexto; no avances de fase sin evidencia.") },
    },
    { object: "block", type: "divider", divider: {} },
    { object: "block", type: "heading_3", heading_3: { rich_text: rt("Bases de datos del sistema (14)") } },
  ];

  await notion.blocks.children.append({
    block_id: rootId,
    position: { type: "start" },
    children: blocks,
  });

  const page = await notion.pages.retrieve({ page_id: rootId });
  return { rootUrl: page.url, runUrl, taskUrl, promptUrl, promptLinks };
}

export async function verifyRootHubFirstBlock(notion, rootId) {
  const res = await notion.blocks.children.list({ block_id: rootId, page_size: 5 });
  const first = res.results[0];
  if (!first) return { ok: false, reason: "no blocks" };
  const callout = first?.callout?.rich_text?.map((t) => t.plain_text).join("") || "";
  const empieza = first?.type === "callout" && callout.includes("Empieza aquí");
  const page = await notion.pages.retrieve({ page_id: rootId });
  let title = "";
  for (const v of Object.values(page.properties || {})) {
    if (v.type === "title") title = v.title.map((t) => t.plain_text).join("");
  }
  return {
    ok: empieza && title === PRIMARY_ENTRY_TITLE,
    firstType: first.type,
    calloutPreview: callout.slice(0, 80),
    pageTitle: title,
  };
}
