import { notionLinks } from "../guide-context.mjs";
import { link, promptFence } from "../guide-sections.mjs";

export function renderDay05() {
  const u = notionLinks();
  const promptFeed = `# Día 5 — Integración feed CrakRevenue / datos modelo

Repo: [URL]
QA o prod: [ ]

1. Localizar fuente performer/model (ej. src/lib/crackrevenue/, APIs feed).
2. Listar campos reales disponibles para plantilla perfil (nombre, slug, live, categorías, imágenes).
3. Documentar env vars (nombres solo): CRAKREVENUE_API_KEY en GitHub Secrets y Cloudflare — nunca valores.
4. Si hay script sync: cómo ejecutarlo en QA o simular con mock etiquetado QA.
5. Verificar que perfiles muestran datos del feed, no inventados.

Sin keys en chat. Sin afirmar sync prod sin log.
Entrega: markdown Policy secretos + pasos Feed Sync Run + qué campos faltan en feed.`;

  return `# Día 5 — Feeds e integración de datos

## 1. Qué vas a conseguir hoy
- Artículo **secretos** (nombres, no valores).
- **Feed Sync Run** en Notion (real o simulado QA).
- Perfiles en preview/local usando **datos reales o mock QA** etiquetado.

## 2. Antes de empezar
- Plantilla Día 4 al menos Implementada en local.
- Acceso a quien gestione secrets (o solo documentar).

## 3. Tiempo
- **3–5 h**

## 4. Pasos

### Paso 1 — Policy secretos
- **Qué:** ${link("CSN Knowledge", u.csnKnowledge)} Policy; prompt §5.
- **Comprobar:** cero claves en Notion.

### Paso 2 — Mapeo campos feed → plantilla
- **Qué:** Tabla en Knowledge «Feed → perfil» desde salida Cursor.

### Paso 3 — Feed Sync Run
- **Qué:** ${link("Feed Sync Runs", u.feedSyncRuns)} New; Rows 0 + Notes «simulado QA» si no hay API.

### Paso 4 — Probar 2 perfiles con datos feed
- **Qué:** localhost; anotar slugs en run Notes.
- **Si falla API:** usar mock del repo; marcar **No probado con API real**.

## 5. Prompt
${promptFence(promptFeed)}

## 6. Respuesta Cursor
- Lista archivos feed; instrucciones sync; sin API keys.

## 7. Comprobar
- [ ] Policy secretos
- [ ] Feed Sync Run
- [ ] 2 perfiles con datos trazables al feed o mock QA

## 8. Si falla
- Sin API key: solo documentado + simulación.

## 9. Pendiente
- Sync producción tras gates.
`;
}
