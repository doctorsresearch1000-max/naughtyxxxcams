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
  { day: 1, short: "Producto, estilo visual y base", tagline: "Brief, elección A–E, design system y app local." },
  { day: 2, short: "Mercado, dominio y entorno", tagline: "Competencia, dominio provisional, sigues en local." },
  { day: 3, short: "Keywords y arquitectura pSEO", tagline: "Mapa long tail + URLs alineadas al diseño elegido." },
  { day: 4, short: "Web funcional v1", tagline: "Home, directorio, categorías, plantilla perfil en código." },
  { day: 5, short: "Feed y monetización", tagline: "Datos reales o mocks QA; CTAs afiliado verificados." },
  { day: 6, short: "SEO técnico y calidad", tagline: "Canonicals, sitemap, muestra 5+2, rendimiento." },
  { day: 7, short: "Validación y lanzamiento", tagline: "PASS/FAIL, preview real, decisión sin prod sin gate." },
];

export const REPO_REFERENCE = "https://github.com/doctorsresearch1000-max/naughtyxxxcams";
