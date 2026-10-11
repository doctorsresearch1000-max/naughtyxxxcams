import { loadManifest } from "../lib/manifest.mjs";

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

export const DAY_HEADINGS = [
  { day: 1, short: "Define tu proyecto", tagline: "Brief, público, alcance y registros mínimos en Notion." },
  { day: 2, short: "Dominio y entorno de trabajo", tagline: "Candidatos de dominio, aprobaciones y plan DNS sin comprar sin permiso." },
  { day: 3, short: "Keywords, arquitectura pSEO y diseño", tagline: "Mapa long tail, familias de URL, legales y wireframe." },
  { day: 4, short: "Plantilla maestra de perfil", tagline: "Primera versión funcional en el repositorio (muestra de perfiles)." },
  { day: 5, short: "Feeds e integración de datos", tagline: "Conectar o simular el proveedor; secretos fuera de Notion." },
  { day: 6, short: "SEO técnico y reglas de indexación", tagline: "Canonicals, sitemap, elegibilidad pSEO y QA de muestra." },
  { day: 7, short: "Preview, pruebas y decisión", tagline: "Validación real, evidencias y gates de lanzamiento." },
];

export const CUADERNO_BLOQUE = `
## Tu cuaderno de proyecto (rellénalo una vez)

- **Nombre del sitio (público):**
- **QA (prueba) o producción:**
- **Nicho y países/idiomas:**
- **Qué debe hacer la web para el visitante (5-10 frases):**
- **Identificador interno (una palabra, ej. mi-cams-2026):**
- **URL del repositorio:** (o «pendiente»)
- **Dominio objetivo:** (o «por decidir»)
- **Responsable de aprobaciones (nombre o «pendiente»):**
`;

export const DOMAIN_SCORE_GUIDE = `
| Criterio | 1 (peor) | 5 (mejor) |
|----------|----------|-----------|
| Encaje con tu nicho | Confuso | Claro para tu público |
| Memorabilidad | Largo o raro | Corto y memorable |
| Historial Wayback | Spam/malware | Limpio o vacío |
| TLD | Poco adecuado | Adecuado al mercado |

Métricas de pago (Ahrefs, etc.): opcionales.
`;
