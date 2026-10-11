import { notionLinks } from "../guide-context.mjs";
import { PREVIEW_STAGING, SIN_REPOSITORIO, link, promptFence } from "../guide-sections.mjs";
import { PROMPT_MASTER_PROFILE } from "../prompts-pseo.mjs";

export function renderDay04() {
  const u = notionLinks();
  const promptRepo = `# Día 4 — Preparar repo y CI (sin deploy)

Repo: [URL]

1. Clonar/abrir en Cursor.
2. Listar workflows .github/workflows.
3. Comandos: npm install, npm run lint, npm test, npm run build (si existe).
4. Crear rama de trabajo para plantilla perfil.

Entrega: URLs Actions si existen; qué está Probado local vs Pendiente.`;

  return `# Día 4 — Plantilla maestra de perfil (código funcionando)

## 1. Qué vas a conseguir hoy
- Repositorio operativo en tu máquina (o documentado bloqueo).
- **Plantilla de perfil** implementada o corregida en código.
- **Muestra:** 3 perfiles probados (live / offline / datos mínimos).
- Fila ${link("CSN Releases", u.csnReleases)} sandbox + evidencia CI si hay GitHub.

## 2. Antes de empezar
- Arquitectura pSEO Día 3.
- GitHub y Node instalados (para este stack).

${SIN_REPOSITORIO}

## 3. Tiempo
- **6–8 h** si hay que implementar; **2–3 h** si solo ajustes.

## 4. Pasos

### Paso 1 — Repo y CI
- **Qué:** Seguir ${SIN_REPOSITORIO}; prompt repo §5B.
- **Dónde:** ${link("CSN Sites", u.csnSites)} Notes con URL repo.
- **Si no hay repo:** incidente ${link("CSN Incidents", u.csnIncidents)}; solo documentación; **no** marcar plantilla Probada.

### Paso 2 — Implementar plantilla maestra
- **Qué:** Prompt §5A en Cursor con repo abierto.
- **Comprobar:** Cambios en archivos perfil/SEO reales (ver prompt).
- **Muestra:** 3 URLs locales documentadas.

### Paso 3 — Release sandbox
- **Qué:** ${link("CSN Releases", u.csnReleases)} Environment sandbox; Notes con SHA y enlace Actions si existe.

### Paso 4 — Knowledge
- **Qué:** Artículo «Plantilla perfil v1» con rutas y reglas LIVE/OFFLINE.

${PREVIEW_STAGING}

## 5. Prompts

### 5A — Plantilla maestra
${promptFence(PROMPT_MASTER_PROFILE)}

### 5B — Repo y CI
${promptFence(promptRepo)}

## 6. Respuesta Cursor
- Diff lógico, checklist Implementado/Probado; comandos ejecutados.

## 7. Comprobar
- [ ] Repo local corre (dev) o bloqueo documentado
- [ ] 3 perfiles revisados en navegador
- [ ] Release + CI documentados

## 8. Si falla
- CI rojo: anotar URL fallo; no deploy.
- Build local falla: pegar error en Incidents.

## 9. Pendiente
- Deploy preview cloud → Día 7 si permisos Cloudflare.
`;
}
