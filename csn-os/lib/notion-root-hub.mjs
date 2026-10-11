import { loadManifest } from "./manifest.mjs";
import { getNotion } from "./notion.mjs";
import { deleteBlocksExceptChildPagesAndDatabases, rt } from "./notion-markdown-blocks.mjs";
import { PRIMARY_ENTRY_TITLE } from "./primary-entry-page.mjs";
import { DAY_PLAN } from "./launch-guide-builder.mjs";

const HUB_MARKER = "csn-hub-marker-v7-7day";

function link(label, url) {
  return [{ type: "text", text: { content: label, link: url ? { url } : null } }];
}

function h2(text) {
  return { object: "block", type: "heading_2", heading_2: { rich_text: rt(text) } };
}

function bullet(text) {
  return { object: "block", type: "bulleted_list_item", bulleted_list_item: { rich_text: rt(text) } };
}

async function discoverLaunchGuidePages(notion, rootId) {
  const prefix = "Guía 7 días — Día";
  const found = [];
  let cursor;
  do {
    const res = await notion.blocks.children.list({ block_id: rootId, page_size: 100, start_cursor: cursor });
    for (const b of res.results) {
      if (b.type !== "child_page") continue;
      const p = await notion.pages.retrieve({ page_id: b.id });
      let title = "";
      for (const v of Object.values(p.properties || {})) {
        if (v.type === "title") title = v.title.map((t) => t.plain_text).join("");
      }
      if (!title.startsWith(prefix)) continue;
      const m = title.match(/Día (\d+)/);
      found.push({ day: m ? Number(m[1]) : 0, title, url: p.url });
    }
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  found.sort((a, b) => a.day - b.day);
  return found;
}

export async function syncCanonicalRootHub(manifest, opts = {}) {
  const notion = getNotion();
  const rootId = manifest.rootPageId;
  const runbookUrl = manifest.runbookPageUrl;
  const panelUrl = manifest.panelPageUrl;
  const guidePages = opts.guidePages || (await discoverLaunchGuidePages(notion, rootId));
  const day1 = guidePages.find((p) => p.day === 1);

  await deleteBlocksExceptChildPagesAndDatabases(notion, rootId);

  const blocks = [
    {
      object: "block",
      type: "callout",
      callout: {
        icon: { emoji: "🚀" },
        rich_text: rt(
          `Guía de lanzamiento en 7 días — Aquí aprenderás a pasar de una idea a una web de cams operativa (o un entorno de prueba QA), con tareas, prompts y evidencias en Notion. No necesitas conocer las 14 bases de datos. (${HUB_MARKER})`,
        ),
      },
    },
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: rt(
          "Qué vas a conseguir: un proyecto registrado, dominio e infraestructura planificados, repositorio y feeds documentados, SEO preparado, staging verificado y plan de mantenimiento — siguiendo las 12 fases CSN ya definidas en este sistema.",
        ),
      },
    },
    h2("Empieza aquí — Día 1"),
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: day1
          ? [
              { type: "text", text: { content: "Abre la guía del primer día y sigue los pasos en orden: " } },
              ...link("Día 1 — Definir el proyecto", day1.url),
            ]
          : rt("Ejecuta npm run csn:sync-7day-guide para publicar las páginas de la guía en Notion."),
      },
    },
    bullet("Primera acción práctica: completar el brief y registrar el proyecto (consola /csn-console → Crear sitio, entorno QA para practicar)."),
    h2("Calendario de 7 días"),
    ...DAY_PLAN.flatMap((d) => {
      const pg = guidePages.find((p) => p.day === d.day);
      return [
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: pg
              ? [
                  { type: "text", text: { content: `Día ${d.day}: ${d.title} — ` } },
                  ...link("abrir guía", pg.url),
                  { type: "text", text: { content: ` · Resultado: ${d.outcome.slice(0, 120)}…` } },
                ]
              : rt(`Día ${d.day}: ${d.title} — ${d.outcome}`),
          },
        },
      ];
    }),
    {
      object: "block",
      type: "callout",
      callout: {
        icon: { emoji: "⏳" },
        rich_text: rt(
          "Plazo de 7 días = objetivo de planificación. Compras de dominio, aprobaciones humanas (gates) y despliegue a producción pueden tardar más; la guía lo indica en cada día.",
        ),
      },
    },
    h2("Proyecto en curso y mantenimiento"),
    bullet("Consola guiada (formularios reales): /csn-console — crear, continuar, prompt, resultado."),
    bullet("Si ya tienes launch-key: en la consola → Continuar → ver tarea pendiente y preparar prompt."),
    { object: "block", type: "divider", divider: {} },
    h2("Zona QA (pruebas)"),
    bullet("Usa entorno QA en la consola; no mezcles con tableros de producción ni KPI legacy."),
    { object: "block", type: "divider", divider: {} },
    h2("Referencia técnica (opcional)"),
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          ...link("Runbooks 12 fases", runbookUrl),
          { type: "text", text: { content: " · " } },
          ...link("Panel técnico", panelUrl),
          { type: "text", text: { content: " · Las 14 tablas de datos están debajo de esta página." } },
        ],
      },
    },
  ];

  await notion.blocks.children.append({
    block_id: rootId,
    position: { type: "start" },
    children: blocks,
  });

  const page = await notion.pages.retrieve({ page_id: rootId });
  return { rootUrl: page.url, hubMarker: HUB_MARKER, guidePages };
}

export async function verifyRootHubFirstBlock(notion, rootId) {
  const res = await notion.blocks.children.list({ block_id: rootId, page_size: 5 });
  const first = res.results[0];
  if (!first) return { ok: false, reason: "no blocks" };
  const callout = first?.callout?.rich_text?.map((t) => t.plain_text).join("") || "";
  const okIntro = first?.type === "callout" && callout.includes("Guía de lanzamiento en 7 días");
  const page = await notion.pages.retrieve({ page_id: rootId });
  let title = "";
  for (const v of Object.values(page.properties || {})) {
    if (v.type === "title") title = v.title.map((t) => t.plain_text).join("");
  }
  return {
    ok: okIntro && title === PRIMARY_ENTRY_TITLE,
    firstType: first.type,
    calloutPreview: callout.slice(0, 80),
    pageTitle: title,
  };
}
