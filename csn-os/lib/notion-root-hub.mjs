import { loadManifest } from "./manifest.mjs";
import { getNotion } from "./notion.mjs";
import { deleteBlocksExceptChildPagesAndDatabases, rt } from "./notion-markdown-blocks.mjs";
import { PRIMARY_ENTRY_TITLE } from "./primary-entry-page.mjs";
import { DAY_PLAN } from "./launch-guide-builder.mjs";

const HUB_MARKER = "csn-hub-marker-v8-practical";

function link(label, url) {
  return [{ type: "text", text: { content: label, link: url ? { url } : null } }];
}

function h2(text) {
  return { object: "block", type: "heading_2", heading_2: { rich_text: rt(text) } };
}

function h3(text) {
  return { object: "block", type: "heading_3", heading_3: { rich_text: rt(text) } };
}

function bullet(text) {
  return { object: "block", type: "bulleted_list_item", bulleted_list_item: { rich_text: rt(text) } };
}

async function discoverLaunchGuidePages(notion, rootId) {
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
      if (!title.startsWith("Guía 7 días")) continue;
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
  const db = manifest.databases;
  const guidePages = opts.guidePages || (await discoverLaunchGuidePages(notion, rootId));
  const day1 = guidePages.find((p) => p.day === 1);

  await deleteBlocksExceptChildPagesAndDatabases(notion, rootId);

  const blocks = [
    {
      object: "block",
      type: "heading_1",
      heading_1: { rich_text: rt("CAM SITES — GUÍA DE LANZAMIENTO") },
    },
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: rt(
          `De una idea a tu web de cams en 7 días. Sigue una jornada cada vez. No necesitas conocer el sistema interno. (${HUB_MARKER})`,
        ),
      },
    },
    h2("A. Bienvenida"),
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: rt(
          "Esta guía te lleva paso a paso: definir el proyecto, elegir dominio, preparar el código, integraciones, SEO y comprobar la web antes de lanzar. Usarás Notion para anotar decisiones y Cursor para ayuda en el repositorio. Las compras y los cambios en producción siempre requieren aprobación de una persona responsable.",
        ),
      },
    },
    h2("B. Empieza por aquí"),
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: day1
          ? [
              { type: "text", text: { content: "1. Abre " } },
              ...link("Día 1 — Define tu proyecto", day1.url),
              { type: "text", text: { content: "." } },
            ]
          : rt("1. Abre la guía del Día 1 (ejecuta npm run csn:sync-7day-guide si no ves los enlaces)."),
      },
    },
    bullet("2. Sigue los pasos en orden y usa el prompt que encontrarás al final de esa jornada."),
    bullet("3. Comprueba la lista «Cuándo puedes dar el día por terminado» antes de pasar al día siguiente."),
    h2("C. Tu recorrido (7 días)"),
    ...DAY_PLAN.flatMap((d) => {
      const pg = guidePages.find((p) => p.day === d.day);
      return [
        {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: pg
              ? [
                  { type: "text", text: { content: `Día ${d.day}. ` } },
                  ...link(d.title, pg.url),
                  { type: "text", text: { content: ` — ${d.tagline}` } },
                ]
              : rt(`Día ${d.day}. ${d.title} — ${d.tagline}`),
          },
        },
      ];
    }),
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: rt(
          "Cada jornada incluye instrucciones, un prompt utilizable, comprobaciones y qué hacer si algo falla. Los 7 días son un objetivo de planificación: dominio, aprobaciones e integraciones externas pueden tardar más.",
        ),
      },
    },
    h2("D. Si te quedas bloqueado"),
    bullet("Guarda: captura de pantalla, URL de la página de Notion donde trabajas y el texto exacto del error."),
    bullet("Copia en un bloc la última respuesta de Cursor y marca qué paso del día estabas haciendo."),
    bullet("Bloqueo por permiso: compra de dominio, pago de backlink o deploy producción → espera aprobación (Human Gate en Pending no es fallo tuyo)."),
    bullet("Bloqueo por datos: si falta el repositorio, completa el cuaderno del Día 1 y continúa con los días que no lo requieran."),
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          { type: "text", text: { content: "Registro de problemas graves: " } },
          ...link("CSN Incidents", db.csnIncidents.url),
        ],
      },
    },
    { object: "block", type: "divider", divider: {} },
    h2("Referencia técnica — no necesitas abrirla para seguir la guía"),
    h3("Documentación operativa"),
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          ...link("Runbooks de las 12 fases", runbookUrl),
          { type: "text", text: { content: " · " } },
          ...link("Panel técnico CSN", panelUrl),
        ],
      },
    },
    h3("Tablas de datos (solo si tu equipo te lo pide)"),
    bullet(`Project Runs — ${db.projectRuns.url}`),
    bullet(`CSN Sites — ${db.csnSites.url}`),
    bullet(`Tasks — ${db.tasks.url}`),
    bullet(`Human Gates — ${db.humanGates.url}`),
    bullet(`Domain Candidates — ${db.domainCandidates.url}`),
    bullet(`CSN Knowledge — ${db.csnKnowledge.url}`),
    bullet(`(Resto de tablas: mismas que en el panel técnico; no hace falta abrirlas todas para la guía.)`),
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
  const res = await notion.blocks.children.list({ block_id: rootId, page_size: 8 });
  const texts = res.results.map((b) => {
    if (b.type === "heading_1") return b.heading_1?.rich_text?.map((t) => t.plain_text).join("");
    if (b.type === "paragraph") return b.paragraph?.rich_text?.map((t) => t.plain_text).join("");
    return "";
  });
  const joined = texts.join(" ");
  const page = await notion.pages.retrieve({ page_id: rootId });
  let title = "";
  for (const v of Object.values(page.properties || {})) {
    if (v.type === "title") title = v.title.map((t) => t.plain_text).join("");
  }
  return {
    ok: joined.includes("GUÍA DE LANZAMIENTO") && joined.includes("csn-hub-marker-v8-practical"),
    pageTitle: title,
    expectedTitle: PRIMARY_ENTRY_TITLE,
    titleOk: title === PRIMARY_ENTRY_TITLE,
  };
}
