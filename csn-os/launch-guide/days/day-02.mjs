import { DOMAIN_SCORE_GUIDE, notionLinks } from "../guide-context.mjs";
import { APROBACION_HUMANA, RELACIONAR_EN_NOTION, link, promptFence } from "../guide-sections.mjs";

export function renderDay02() {
  const u = notionLinks();
  const promptA = `# Día 2 — Tabla comparativa dominios (sin Notion)

Yo creo filas en Notion. Tú organizas:
- Nicho: [cuaderno]
- Dominios: [lista]
- Notas Wayback: [pegar]

Entrega: tabla 1-5, párrafo dominio preferido, texto gate compra (Pending, tope USD).
No inventar compra ni Ahrefs.`;

  const promptB = `# Día 2 — Plan DNS/hosting (documentación)

Repo: [URL o desconocido]
QA o prod: [ ]
Dominio preferido: [ ]

Si hay repo: leer README/wrangler. Tabla DNS sin secretos. QA: sin cambios DNS producción.
Entrega: markdown para CSN Knowledge.`;

  return `# Día 2 — Dominio y entorno de trabajo

## 1. Qué vas a conseguir hoy
- ≥3 candidatos en Notion, historial Wayback, favorito justificado.
- Gate compra **Pending** (sin pagar).
- Plan DNS/hosting documentado.
- **Puedes cerrar el día sin comprar el dominio.**

## 2. Antes de empezar
- Día 1 hecho (run + site).
- Glosario: **dominio**, **dominio expirado**, **Wayback** (web.archive.org), **DNS**, **staging** (prueba, no público final).

## 3. Tiempo y dependencias
- **3–5 h** investigación; compra = días (aprobación).
- **Depende:** gate alcance Día 1 si restringe investigación.

${APROBACION_HUMANA}

## 4. Pasos

### Paso 1 — Tres candidatos
- **Qué:** https://www.expireddomains.net/ → Deleted Domains → anota ≥3 nombres.
- **Dónde:** ${link("Domain Candidates", u.domainCandidates)} → New cada uno; Source expireddomains.net; enlaza Site y Project Run.

${RELACIONAR_EN_NOTION}

- **Si falla:** registro en expireddomains → Source manual en Notes.

### Paso 2 — Wayback
- **Qué:** web.archive.org por candidato; Blocked si spam/malware.
- **Dónde:** Notes de cada fila.
- **Si falla:** anotar «sin historial»; no asumir limpio.

### Paso 3 — Comparar
${DOMAIN_SCORE_GUIDE}
- Marca un favorito **In progress**; frase en ${link("Project Runs", u.projectRuns)} Notes.

### Paso 4 — Gate compra (sin pagar)
- **Qué:** ${link("Human Gates", u.humanGates)} → domain_candidate; Target External ID csn:domain:DOMINIO:EXTERNAL_ID_RUN; Limits USD; **Pending**; STOP checkout.

### Paso 5 — Estado gate
- **Qué:** Nota en run: compra pendiente; captura opcional.

### Paso 6 — Decisión escrita
- **Qué:** Notes favorito ≥50 caracteres; Current Phase 3 en run.

### Paso 7 — Plan DNS
- **Qué:** ${link("CSN Knowledge", u.csnKnowledge)} artículo Runbook «DNS — [sitio]»; sin contraseñas; QA: sin DNS producción.

### Paso 8 — Checklist sandbox
- **Qué:** Notes run: hostnames prueba; «DNS prod: sin cambios».

## 5. Prompts Cursor

### Investigación dominios
${promptFence(promptA)}

### Plan DNS
${promptFence(promptB)}

## 6. Respuesta esperada de Cursor
- Tablas y textos para pegar; sin afirmar compra.

## 7. Comprobar
- [ ] ≥3 candidatos + Wayback
- [ ] Favorito + gate Pending
- [ ] Plan DNS en Knowledge
- [ ] Sin pago sin Approved

## 8. Si falla
- Todos malos → nuevos candidatos paso 1.
- Gate rechazado → otro dominio.

## 9. Pendiente
- Compra y DNS real → tras Approved.
- **Siguiente:** Día 3 pSEO.
`;
}
