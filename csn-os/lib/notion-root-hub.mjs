import { loadManifest } from "./manifest.mjs";
import { getNotion } from "./notion.mjs";
import { deleteBlocksExceptChildPagesAndDatabases, rt } from "./notion-markdown-blocks.mjs";
import { PRIMARY_ENTRY_TITLE } from "./primary-entry-page.mjs";
import { buildHubSnapshots } from "./project-ux.mjs";

const HUB_MARKER = "csn-hub-marker-v6";

function link(label, url) {
  return [{ type: "text", text: { content: label, link: url ? { url } : null } }];
}

function para(...parts) {
  return { object: "block", type: "paragraph", paragraph: { rich_text: parts } };
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

function codeLine(cmd) {
  return {
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: [{ type: "text", text: { content: cmd }, annotations: { code: true } }],
    },
  };
}

export async function syncCanonicalRootHub(manifest) {
  const notion = getNotion();
  const rootId = manifest.rootPageId;
  const dbs = manifest.databases;
  const runbookUrl = manifest.runbookPageUrl;
  const panelUrl = manifest.panelPageUrl;

  const { production, qa, productionCards } = await buildHubSnapshots();

  await deleteBlocksExceptChildPagesAndDatabases(notion, rootId);

  const blocks = [
    {
      object: "block",
      type: "callout",
      callout: {
        icon: { emoji: "🎯" },
        rich_text: rt(
          `Centro de acciones — ${PRIMARY_ENTRY_TITLE}. Elige crear un sitio, continuar un proyecto en curso o revisar mantenimiento. No necesitas abrir las 14 bases de datos para el día a día. (${HUB_MARKER})`,
        ),
      },
    },
    {
      object: "block",
      type: "callout",
      callout: {
        icon: { emoji: "🔒" },
        rich_text: rt(
          "Proyectos de prueba (QA) no cuentan como lanzamientos de producción. Sin deploy, DNS ni compras sin aprobación humana explícita.",
        ),
      },
    },
    {
      object: "block",
      type: "callout",
      callout: {
        icon: { emoji: "🖥️" },
        rich_text: rt(
          "Consola operativa (formularios reales, servidor autorizado): abre /csn-console en el despliegue del repo. Requiere token CSN_CONSOLE_TOKEN (no es la clave de Notion). Notion no ejecuta acciones; la consola sí.",
        ),
      },
    },

    h2("A. Crear un sitio nuevo"),
    bullet("Preferido: formulario en /csn-console (crea en Notion vía API del servidor)."),
    bullet("Alternativa CLI con acceso al repo:"),
    codeLine(
      'npm run csn -- proyecto crear --nombre="Mi sitio" --launch-key=mi-sitio --brief="Objetivo, nicho y alcance" --repo=https://github.com/org/repo --production=true',
    ),
    bullet("Para pruebas aisladas, omite --production=true (por defecto es entorno QA)."),
    bullet("Si falta el resumen del proyecto, el sistema crea el registro pero bloqueará prompts hasta completar el brief."),
    bullet("Después de crear: npm run csn -- continuar --launch-key=mi-sitio"),

    h2("B. Continuar un proyecto"),
    ...(production.length
      ? production.map((p) => {
          const card = productionCards.find((c) => c.launchKey === p.launchKey);
          const nt = card?.nextTask;
          const blockers = card?.readinessMissing?.length
            ? ` Bloqueos: ${card.readinessMissing.slice(0, 2).join("; ")}.`
            : "";
          return bullet(
            `${p.siteName} — fase ${p.currentPhase} (${p.phaseNameEs}), avance ${p.progressPercent}% (${p.tasksDone}/${p.tasksTotal} tareas).${blockers}`,
          );
        })
      : [
          bullet(
            "Aún no hay proyectos de producción registrados. Crea uno en la sección A o completa el brief de un sitio QA antes de pasar a producción.",
          ),
        ]),
    ...production.slice(0, 6).flatMap((p) => {
      const card = productionCards.find((c) => c.launchKey === p.launchKey);
      const nt = card?.nextTask;
      const parts = [
        { type: "text", text: { content: `▸ ${p.siteName}: ` } },
        ...link("abrir proyecto", p.runUrl),
      ];
      if (nt) {
        parts.push({ type: "text", text: { content: " · Tarea: " } });
        parts.push(...link(nt.title || "tarea", nt.taskUrl));
        if (nt.promptUrl) {
          parts.push({ type: "text", text: { content: " · " } });
          parts.push(...link("prompt Cursor", nt.promptUrl));
        }
      }
      return [para(...parts), codeLine(`npm run csn -- continuar --launch-key=${p.launchKey}`)];
    }),
    bullet("Listar todos: npm run csn -- proyectos"),
    bullet("Generar prompt de la fase actual: npm run csn -- prompt --launch-key=<clave-del-proyecto>"),

    h2("C. Mantener un sitio existente"),
    bullet(
      "Consulta tareas de mantenimiento e incidencias vinculadas al sitio (datos en Notion; sin automatización de tickets).",
    ),
    codeLine("npm run csn -- mantener --launch-key=<clave-del-proyecto>"),
    para(
      { type: "text", text: { content: "Vistas de datos (secundario): " } },
      ...link("Mantenimiento", dbs.csnMaintenance.url),
      { type: "text", text: { content: " · " } },
      ...link("Incidencias", dbs.csnIncidents.url),
      { type: "text", text: { content: " · " } },
      ...link("Conocimiento", dbs.csnKnowledge.url),
    ),

    { object: "block", type: "divider", divider: {} },
    h2("Referencia técnica (no es el flujo diario)"),
    para(
      { type: "text", text: { content: "Runbooks de las 12 fases: " } },
      ...link("12-Phase Operational Runbooks", runbookUrl),
      { type: "text", text: { content: " · Especificaciones de fase = catálogo en SOP Versions (no copiar a Cursor)." } },
    ),
    para(
      { type: "text", text: { content: "Diagnóstico / panel técnico: " } },
      ...link("CSN OS Panel", panelUrl),
      { type: "text", text: { content: " · npm run csn -- diagnostico" } },
    ),

    h2("Zona QA y pruebas automatizadas"),
    bullet(`${qa.length} proyecto(s) de prueba. No mezclar con tableros de producción.`),
    ...qa.slice(0, 5).map((p) =>
      para(
        { type: "text", text: { content: `[QA] ${p.siteName} — ` } },
        ...link("proyecto", p.runUrl),
        { type: "text", text: { content: " · " } },
        { type: "text", text: { content: `continuar: npm run csn -- continuar --launch-key=${p.launchKey}` } },
      ),
    ),
    bullet("Ejemplo técnico LIVE/OFFLINE vive solo en QA; no aparece en la lista de producción arriba."),

    h3("Si una tarea falla"),
    bullet("La tarea queda en estado Bloqueada; corrige y vuelve a generar el prompt si cambió el contexto."),
    bullet("Registrar éxito: informe JSON con executionStatus verified_sandbox o verified_production y evidenceUrls."),

    { object: "block", type: "divider", divider: {} },
    h3("Bases de datos del sistema (14) — uso avanzado"),
    para({ type: "text", text: { content: "Las tablas siguen debajo de esta página para edición directa cuando haga falta." } }),
  ];

  await notion.blocks.children.append({
    block_id: rootId,
    position: { type: "start" },
    children: blocks,
  });

  const page = await notion.pages.retrieve({ page_id: rootId });
  return {
    rootUrl: page.url,
    hubMarker: HUB_MARKER,
    productionCount: production.length,
    qaCount: qa.length,
  };
}

export async function verifyRootHubFirstBlock(notion, rootId) {
  const res = await notion.blocks.children.list({ block_id: rootId, page_size: 5 });
  const first = res.results[0];
  if (!first) return { ok: false, reason: "no blocks" };
  const callout = first?.callout?.rich_text?.map((t) => t.plain_text).join("") || "";
  const okIntro = first?.type === "callout" && callout.includes("Centro de acciones");
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
