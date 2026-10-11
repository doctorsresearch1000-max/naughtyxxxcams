import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadManifest } from "../csn-os/lib/manifest.mjs";
import { getNotion } from "../csn-os/lib/notion.mjs";

const MANIFEST_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), "notion-csn-isolated-manifest.json");

const PANEL_TITLE = "CSN OS — Panel de proyectos";

export async function syncProjectPanel() {
  const manifest = loadManifest();
  const notion = getNotion();
  const rootId = manifest.rootPageId;

  let panelId = manifest.panelPageId;
  if (panelId) {
    try {
      await notion.pages.retrieve({ page_id: panelId });
    } catch {
      panelId = null;
    }
  }
  if (!panelId) {
    const search = await notion.search({ query: PANEL_TITLE, page_size: 10 });
    const hit = search.results.find(
      (p) => p.object === "page" && p.parent?.page_id === rootId && p.properties?.title?.title?.[0]?.plain_text === PANEL_TITLE,
    );
    panelId = hit?.id;
  }
  if (!panelId) {
    const page = await notion.pages.create({
      parent: { page_id: rootId },
      properties: { title: { title: [{ text: { content: PANEL_TITLE } }] } },
    });
    panelId = page.id;
    manifest.panelPageUrl = page.url;
  }

  const children = await notion.blocks.children.list({ block_id: panelId, page_size: 5 });
  if (children.results.some((b) => b.type === "heading_1")) {
    manifest.panelPageId = panelId;
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
    return manifest.panelPageUrl || `https://notion.so/${panelId.replace(/-/g, "")}`;
  }

  const dbs = manifest.databases;
  const blocks = [
    {
      object: "block",
      type: "callout",
      callout: {
        icon: { emoji: "🎛️" },
        rich_text: [
          {
            type: "text",
            text: {
              content:
                "Panel operativo CSN OS. Notion guarda el estado; los prompts se generan con la CLI en el repositorio (no hay botón mágico en Notion). Los Human Gates son control manual — no bloquean despliegues técnicamente.",
            },
          },
        ],
      },
    },
    { object: "block", type: "heading_1", heading_1: { rich_text: [{ type: "text", text: { content: "1. Crear proyecto" } }] } },
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          {
            type: "text",
            text: {
              content:
                "Terminal: npm run csn -- schema && npm run csn -- proyecto crear --nombre=\"Mi sitio\" --launch-key=mi-sitio --nicho=... --repo=https://github.com/org/repo",
            },
          },
        ],
      },
    },
    { object: "block", type: "heading_1", heading_1: { rich_text: [{ type: "text", text: { content: "2. Ver plan de trabajo" } }] } },
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [{ type: "text", text: { content: "npm run csn -- plan --run-external-id=csn:run:<launch-key>" } }],
      },
    },
    { object: "block", type: "heading_1", heading_1: { rich_text: [{ type: "text", text: { content: "3. Generar prompt Cursor" } }] } },
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          {
            type: "text",
            text: {
              content:
                "npm run csn -- prompt --run-external-id=csn:run:<launch-key> --phase=5 --print  → copiar salida a un agente Cursor nuevo.",
            },
          },
        ],
      },
    },
    { object: "block", type: "heading_1", heading_1: { rich_text: [{ type: "text", text: { content: "4. Registrar resultado" } }] } },
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          {
            type: "text",
            text: {
              content:
                "Guardar JSON de resultado y: npm run csn -- resultado --run-external-id=... --phase=5 --json=informe.json",
            },
          },
        ],
      },
    },
    { object: "block", type: "heading_1", heading_1: { rich_text: [{ type: "text", text: { content: "Bases de datos" } }] } },
    ...Object.entries(dbs).map(([key, db]) => ({
      object: "block",
      type: "bulleted_list_item",
      bulleted_list_item: {
        rich_text: [
          {
            type: "text",
            text: { content: `${db.title}: ` },
          },
          { type: "text", text: { content: db.url || db.id, link: { url: db.url } } },
        ],
      },
    })),
  ];

  await notion.blocks.children.append({ block_id: panelId, children: blocks });
  const page = await notion.pages.retrieve({ page_id: panelId });
  manifest.panelPageId = panelId;
  manifest.panelPageUrl = page.url;
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
  return page.url;
}
