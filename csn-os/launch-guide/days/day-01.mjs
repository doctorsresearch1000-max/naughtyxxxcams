import { CUADERNO_BLOQUE, notionLinks } from "../guide-context.mjs";
import { APROBACION_HUMANA, RELACIONAR_EN_NOTION, SOP_VERSION_AYUDA, link, promptFence } from "../guide-sections.mjs";

export function renderDay01() {
  const u = notionLinks();
  const prompt = `# Redactar brief y textos Notion — Día 1

NO tienes acceso a Notion. Solo produces texto para que yo pegue.

Contexto (yo relleno):
- Nombre sitio:
- QA o producción:
- Nicho e idiomas:
- Identificador interno:

Tareas:
1. Mejorar brief (público, propuesta, secciones: home, categorías, perfiles modelo, legales).
2. Proponer Run Name y External ID (csn:run:identificador).
3. Redactar Scope/Limits Human Gate (sin gasto si QA).
4. Checklist final.

No inventar dominio comprado ni deploy.`;

  return `# Día 1 — Define tu proyecto

## 1. Qué vas a conseguir hoy (tangible)
- Brief escrito en lenguaje claro.
- Tres filas en Notion: Project Run, CSN Site, Human Gate (alcance).
- Textos listos para copiar desde Cursor.

## 2. Qué necesitas antes de empezar
- Acceso a ${link("Cam Sites — SOP System", u.root)}
- 45–90 minutos
- Decidir QA vs producción

${CUADERNO_BLOQUE}

## 3. Tiempo y dependencias
- **Tiempo:** 1–2 h
- **Depende de:** nada
- **Puede alargarse:** definir quién aprueba gates

${APROBACION_HUMANA}

## 4. Pasos numerados

### Paso 1 — Brief
- **Qué:** Rellena el cuaderno (sobre todo qué hace la web para el visitante).
- **Dónde:** Bloc o Notes del run.
- **Comprobar:** Alguien no técnico lo entiende.
- **Si falla:** Usa el prompt del §5.

### Paso 2 — Project Run
- **Qué:** ${link("Project Runs", u.projectRuns)} → New.
- **Campos:** Run Name; Run Type = QA Sandbox o New Site Launch; Launch Key = identificador; External ID = csn:run:identificador; Status In progress; Current Phase 1.
- **SOP Version:** ver anexo abajo.
- **Comprobar:** Launch Key no vacío.
- **Si falla:** Sin acceso a la base → pedir invitación a Cam Sites SOP System.

${SOP_VERSION_AYUDA}

### Paso 3 — CSN Sites
- **Qué:** ${link("CSN Sites", u.csnSites)} → New → Site Name; Domain = pendiente o dominio futuro; Record Class = QA test-only si es prueba; mismo Launch Key.
- **Relación:** enlaza Site en Project Run.

${RELACIONAR_EN_NOTION}

- **Si falla:** Production marcado por error → corregir a QA test-only.

### Paso 4 — Human Gate alcance
- **Qué:** ${link("Human Gates", u.humanGates)} → New → Target Type project_run; Target External ID = External ID del run; Scope (Notion + código sin compras); Limits 0 USD en QA; Status Pending.
- **Comprobar:** Scope no dice «todo permitido».
- **Si falla:** Sin aprobador → Pending + nota en Notes (ver §8).

## 5. Prompt para Cursor (copiar bloque completo)

${promptFence(prompt)}

## 6. Qué debe devolver Cursor
- Brief mejorado, textos Scope/Limits, checklist.
- Etiquetas: Documentado (no Implementado en código).

## 7. Cómo comprobar
- [ ] Cuaderno completo
- [ ] Project Run + Site relacionados
- [ ] Human Gate creado (Pending OK)

## 8. Si falla o falta permiso
- Gate Pending: continuar Día 2 solo documentación/dominios si Scope lo permite.
- Sin Notion: guardar textos de Cursor y registrar cuando tengas acceso.

## 9. Hecho vs pendiente
- **Hecho:** brief + filas Notion.
- **Pendiente:** aprobación humana, repo (Día 4), dominio comprado (Día 2+).
`;
}
