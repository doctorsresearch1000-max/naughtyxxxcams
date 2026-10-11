import { loadManifest } from "../lib/manifest.mjs";

/** Enlaces verificados del manifest aislado (no inventar URLs). */
export function notionLinks() {
  const m = loadManifest();
  const db = m.databases;
  return {
    root: m.rootPageUrl,
    projectRuns: db.projectRuns.url,
    csnSites: db.csnSites.url,
    humanGates: db.humanGates.url,
    domainCandidates: db.domainCandidates.url,
    csnKnowledge: db.csnKnowledge.url,
    tasks: db.tasks.url,
    csnReleases: db.csnReleases.url,
    feedSyncRuns: db.feedSyncRuns.url,
    seoOpportunities: db.seoOpportunities.url,
    backlinkOpportunities: db.backlinkOpportunities.url,
    csnIncidents: db.csnIncidents.url,
    csnMaintenance: db.csnMaintenance.url,
    launchKpiSnapshots: db.launchKpiSnapshots.url,
    runbooks: m.runbookPageUrl,
    panel: m.panelPageUrl,
  };
}

/** Títulos visibles en panel y cabecera de jornada. */
export const DAY_HEADINGS = [
  { day: 1, short: "Define tu proyecto", tagline: "Prepara tu idea y registra el proyecto en Notion." },
  { day: 2, short: "Evalúa el dominio y prepara la infraestructura", tagline: "Busca dominios, revisa historial y planifica DNS sin comprar sin permiso." },
  { day: 3, short: "Diseña la estructura y revisa requisitos legales", tagline: "Define páginas, navegación y cumplimiento inicial." },
  { day: 4, short: "Prepara el repositorio y comprueba la calidad", tagline: "Enlaza el código y verifica que las pruebas automáticas funcionan." },
  { day: 5, short: "Configura integraciones y feeds", tagline: "Monetización técnica sin guardar contraseñas en Notion." },
  { day: 6, short: "Prepara el SEO y evalúa autoridad", tagline: "Oportunidades de búsqueda y enlaces; gastos solo con aprobación." },
  { day: 7, short: "Comprueba la web y decide el lanzamiento", tagline: "Staging, validación, métricas y mantenimiento." },
];

export const CUADERNO_BLOQUE = `
## Tu cuaderno de proyecto (rellénalo una vez y consérvalo)

Copia este bloque en un documento propio (Notion, bloc de notas o la descripción de tu Project Run). Lo usarás en los prompts de Cursor.

- **Nombre del sitio (público):** _______________________
- **¿Es una prueba (QA) o lanzamiento real (producción)?** QA / Producción
- **Nicho en una frase:** _______________________
- **Qué debe hacer la web para el visitante:** _______________________
- **Identificador interno del proyecto** (elige una palabra corta, sin espacios, ej. \`mi-cams-oct-2026\`): _______________________
- **URL del repositorio de código** (si ya existe; si no, escribe «pendiente»): _______________________
- **Dominio deseado** (si lo sabes; si no, «por decidir»): _______________________

No necesitas memorizar códigos del sistema: el identificador interno es solo para que tú y tu equipo reconozcáis el mismo proyecto en Notion.
`;

/** Criterios de puntuación dominio — del TEMPLATE operativo (no es una rúbrica detallada inventada). */
export const DOMAIN_SCORE_GUIDE = `
Criterios prácticos para comparar candidatos (puntuación 1–5 en cada fila; suma orientativa):

| Criterio | 1 (peor) | 5 (mejor) |
|----------|----------|-----------|
| Encaje con tu nicho | Nombre confuso o fuera de tema | Nombre claro para tu público |
| Fácil de recordar y escribir | Muy largo o con guiones raros | Corto y memorable |
| Historial en Wayback | Spam, casinos, malware, redirecciones raras | Páginas normales o vacío limpio |
| Extensión (.com, .cam, etc.) | TLD poco adecuado para tu mercado | TLD que tu audiencia reconoce |

**Ahrefs DR u otras métricas de pago:** opcionales. No son obligatorias para terminar el día.

El manifest CSN menciona la plantilla «TEMPLATE: Domain candidate evaluation» en CSN Knowledge; su texto oficial es breve: revisar Wayback, marcar Blocked si es tóxico, y no comprar sin aprobación humana.
`;
