import { getDb } from "./notion.mjs";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function ensureOperationalSchema(notion, manifest) {
  const sites = getDb(manifest, "csnSites").dataSourceId;
  await notion.dataSources.update({
    data_source_id: sites,
    properties: {
      Nicho: { rich_text: {} },
      Stack: { rich_text: {} },
      Monetización: { rich_text: {} },
      "Estado del proyecto": {
        select: {
          options: [
            { name: "Idea", color: "default" },
            { name: "En planificación", color: "yellow" },
            { name: "En desarrollo", color: "blue" },
            { name: "En staging", color: "purple" },
            { name: "En producción", color: "green" },
          ],
        },
      },
      "Objetivo principal": { rich_text: {} },
    },
  });
  await sleep(250);

  const runs = getDb(manifest, "projectRuns").dataSourceId;
  await notion.dataSources.update({
    data_source_id: runs,
    properties: {
      "Prompt Notion URL": { url: {} },
      "Último informe ejecución": { rich_text: {} },
      "Estado verificación": {
        select: {
          options: [
            { name: "No iniciado", color: "default" },
            { name: "En curso", color: "blue" },
            { name: "Bloqueado", color: "red" },
            { name: "Implementado pendiente verificación", color: "yellow" },
            { name: "Verificado en sandbox", color: "orange" },
            { name: "Validado en staging", color: "purple" },
            { name: "Verificado en producción", color: "green" },
            { name: "Rechazado requiere correcciones", color: "red" },
          ],
        },
      },
    },
  });
  await sleep(250);

  const tasks = getDb(manifest, "tasks").dataSourceId;
  await notion.dataSources.update({
    data_source_id: tasks,
    properties: {
      "Prompt Notion URL": { url: {} },
      "Ruta prompt local": { rich_text: {} },
      "Resultado ejecución": { rich_text: {} },
    },
  });
}
