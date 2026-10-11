import { loadManifest } from "./manifest.mjs";
import { getNotion, queryByRichText } from "./notion.mjs";
import { deleteBlocksExceptChildPagesAndDatabases, rt } from "./notion-markdown-blocks.mjs";

const HUB_MARKER = "csn-hub-marker-v2";
const DEMO_RUN_EXT = "csn:run:demo-qa-live-offline";
const DEMO_TASK_EXT = "csn:taskrun:csn:run:demo-qa-live-offline:demo-live-offline-v1";

export async function syncCanonicalRootHub(manifest, links = {}) {
  const notion = getNotion();
  const rootId = manifest.rootPageId;
  const runbookUrl = manifest.runbookPageUrl;
  const panelUrl = manifest.panelPageUrl;

  let runUrl = links.runUrl;
  let taskUrl = links.taskUrl;
  let promptUrl = links.promptUrl;

  if (!runUrl || !taskUrl || !promptUrl) {
    const runsDb = manifest.databases.projectRuns;
    const run = (await queryByRichText(notion, runsDb.dataSourceId, "External ID", DEMO_RUN_EXT))[0];
    if (run) {
      runUrl = run.url;
      promptUrl = run.properties["Prompt Notion URL"]?.url || promptUrl;
    }
    const tasksDb = manifest.databases.tasks;
    const task = (await queryByRichText(notion, tasksDb.dataSourceId, "External ID", DEMO_TASK_EXT))[0];
    if (task) {
      taskUrl = task.url;
      promptUrl = task.properties["Prompt Notion URL"]?.url || promptUrl;
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
          `Empieza aquí — CSN OS es tu centro de lanzamiento de cam sites: eliges un proyecto, abres una tarea técnica, copias el prompt para Cursor, ejecutas en el repositorio y registras el resultado en Notion. Todo lo de QA está marcado como prueba; no mezcles con producción. (${HUB_MARKER})`,
        ),
      },
    },
    { object: "block", type: "heading_2", heading_2: { rich_text: rt("Flujo en 5 pasos") } },
    {
      object: "block",
      type: "numbered_list_item",
      numbered_list_item: {
        rich_text: [
          { type: "text", text: { content: "Abre tu " } },
          { type: "text", text: { content: "proyecto (Project Run)", link: runUrl ? { url: runUrl } : null } },
          { type: "text", text: { content: " — prueba recomendada: DEMO QA LIVE/OFFLINE." } },
        ],
      },
    },
    {
      object: "block",
      type: "numbered_list_item",
      numbered_list_item: {
        rich_text: [
          { type: "text", text: { content: "Abre la " } },
          { type: "text", text: { content: "tarea activa", link: taskUrl ? { url: taskUrl } : null } },
          { type: "text", text: { content: " y revisa criterios de aceptación." } },
        ],
      },
    },
    {
      object: "block",
      type: "numbered_list_item",
      numbered_list_item: {
        rich_text: [
          { type: "text", text: { content: "Copia el " } },
          { type: "text", text: { content: "prompt completo en Notion", link: promptUrl ? { url: promptUrl } : null } },
          { type: "text", text: { content: " (página hija de la tarea o enlace Prompt Notion URL)." } },
        ],
      },
    },
    {
      object: "block",
      type: "numbered_list_item",
      numbered_list_item: {
        rich_text: rt("Pega en un agente Cursor nuevo y ejecuta solo el alcance del prompt (sin deploy ni DNS)."),
      },
    },
    {
      object: "block",
      type: "numbered_list_item",
      numbered_list_item: {
        rich_text: rt(
          "Registra el resultado: actualiza la tarea o ejecuta en el repo npm run csn -- resultado --run-external-id=<run> --phase=N --json=informe.json",
        ),
      },
    },
    { object: "block", type: "heading_3", heading_3: { rich_text: rt("Si una tarea falla") } },
    {
      object: "block",
      type: "bulleted_list_item",
      bulleted_list_item: {
        rich_text: rt("Marca la tarea como Bloqueada y describe el error en Resultado ejecución."),
      },
    },
    {
      object: "block",
      type: "bulleted_list_item",
      bulleted_list_item: {
        rich_text: rt("No avances de fase hasta registrar evidencia; en QA puedes regenerar el prompt con npm run csn -- prompt ..."),
      },
    },
    {
      object: "block",
      type: "bulleted_list_item",
      bulleted_list_item: {
        rich_text: rt("Mantenimiento del hub: npm run csn:sync-hub (republica enlaces sin duplicar bases de datos)."),
      },
    },
    { object: "block", type: "heading_3", heading_3: { rich_text: rt("Referencia: 12 fases") } },
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          { type: "text", text: { content: "Runbooks detallados: " } },
          { type: "text", text: { content: "12-Phase Operational Runbooks", link: runbookUrl ? { url: runbookUrl } : null } },
        ],
      },
    },
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          { type: "text", text: { content: "Acceso secundario — Panel de proyectos: " } },
          { type: "text", text: { content: "abrir", link: panelUrl ? { url: panelUrl } : null } },
        ],
      },
    },
    {
      object: "block",
      type: "divider",
      divider: {},
    },
    {
      object: "block",
      type: "heading_3",
      heading_3: { rich_text: rt("Bases de datos del sistema (14)") },
    },
  ];

  await notion.blocks.children.append({
    block_id: rootId,
    position: { type: "start" },
    children: blocks,
  });

  const page = await notion.pages.retrieve({ page_id: rootId });
  return { rootUrl: page.url, runUrl, taskUrl, promptUrl };
}

export async function verifyRootHubFirstBlock(notion, rootId) {
  const res = await notion.blocks.children.list({ block_id: rootId, page_size: 5 });
  const first = res.results[0];
  if (!first) return { ok: false, reason: "no blocks" };
  const text =
    first.paragraph?.rich_text?.map((t) => t.plain_text).join("") ||
    first.callout?.rich_text?.map((t) => t.plain_text).join("") ||
    "";
  const second = res.results[1];
  const callout = first?.callout?.rich_text?.map((t) => t.plain_text).join("") || "";
  const empieza = first?.type === "callout" && callout.includes("Empieza aquí");
  return { ok: empieza, firstType: first.type, calloutPreview: callout.slice(0, 80) };
}
