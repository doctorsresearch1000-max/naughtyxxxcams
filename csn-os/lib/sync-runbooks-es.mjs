import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadManifest } from "./manifest.mjs";
import { getNotion } from "./notion.mjs";
import { deleteAllBlocks, rt } from "./notion-markdown-blocks.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUNBOOKS_JSON = path.join(__dirname, "../../scripts/csn-phase-runbooks.json");

const PHASE_ES = {
  1: "Recepción del proyecto y aprobación humana",
  2: "Investigación de dominios (expireddomains.net)",
  3: "Selección de dominio y preparación del registro",
  4: "DNS y alojamiento (planificación)",
  5: "Repositorio y CI",
  6: "Integración de afiliación / feeds",
  7: "Contenido y cumplimiento",
  8: "Base SEO",
  9: "Outreach de backlinks (con gate)",
  10: "Despliegue en staging y QA",
  11: "Despliegue en producción",
  12: "KPI de lanzamiento y traspaso",
};

const VERIFICATION_ES = {
  tested_sandbox: "Probado en sandbox QA",
  documented_only: "Documentado — pendiente verificación externa",
};

function translateField(key, en) {
  const map = {
    purpose: "Propósito",
    entryCriteria: "Antes de empezar",
    steps: "Pasos",
    tools: "Herramientas",
    notionRecords: "Registros en Notion",
    properties: "Propiedades clave",
    evidence: "Evidencias",
    acceptance: "Criterio de cierre",
    failure: "Si algo falla",
    humanApproval: "Aprobación humana",
    exit: "Salida de fase",
    next: "Siguiente",
  };
  return { label: map[key] || key, text: en };
}

export async function syncRunbooksSpanish(manifest) {
  const notion = getNotion();
  const pageId = manifest.runbookPageId;
  if (!pageId) throw new Error("runbookPageId missing in manifest");
  const phases = JSON.parse(fs.readFileSync(RUNBOOKS_JSON, "utf8")).phases;
  const tasksUrl = manifest.databases.tasks.url;

  await deleteAllBlocks(notion, pageId, false);

  const blocks = [
    {
      object: "block",
      type: "callout",
      callout: {
        icon: { emoji: "📚" },
        rich_text: rt(
          "Referencia de las 12 fases del CSN OS. Para ejecutar trabajo técnico: abre tu Project Run → tarea en Tasks → copia el Prompt Cursor enlazado en la tarea.",
        ),
      },
    },
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          { type: "text", text: { content: "Tareas por fase: " } },
          { type: "text", text: { content: "abrir base Tasks", link: { url: tasksUrl } } },
        ],
      },
    },
  ];

  for (const p of phases) {
    const n = p.phase;
    const titleEs = PHASE_ES[n] || p.title;
    const ver = VERIFICATION_ES[p.verification] || p.verification;
    const toggleChildren = [];
    for (const key of [
      "purpose",
      "entryCriteria",
      "steps",
      "tools",
      "notionRecords",
      "properties",
      "evidence",
      "acceptance",
      "failure",
      "humanApproval",
      "exit",
      "next",
    ]) {
      const { label, text } = translateField(key, p[key]);
      toggleChildren.push({
        object: "block",
        type: "paragraph",
        paragraph: { rich_text: rt(`${label}: ${text}`) },
      });
    }
    toggleChildren.push({
      object: "block",
      type: "bulleted_list_item",
      bulleted_list_item: {
        rich_text: rt(
          `Acción: en Tasks, filtra Fase = ${n} y abre la tarea de ejecución de tu proyecto para generar/copiar el prompt.`,
        ),
      },
    });

    blocks.push({
      object: "block",
      type: "toggle",
      toggle: {
        rich_text: rt(`Fase ${n} — ${titleEs} [${ver}]`),
        children: toggleChildren,
      },
    });
  }

  for (let i = 0; i < blocks.length; i += 15) {
    await notion.blocks.children.append({ block_id: pageId, children: blocks.slice(i, i + 15) });
  }

  const page = await notion.pages.retrieve({ page_id: pageId });
  return page.url;
}
