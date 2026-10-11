import { notionLinks } from "../guide-context.mjs";

export function renderDay05() {
  const n = notionLinks();
  return `# Día 5 — Configura integraciones y feeds

## 1. Qué vas a conseguir hoy

Documentación clara de **dónde viven las claves de afiliado** (nunca en Notion) y una fila de **Feed Sync Run** (real o simulada en QA) que demuestra que entiendes el flujo de datos de modelos.

## 2. Qué necesitas antes de empezar

- Repositorio documentado (Día 4).
- Saber qué red de afiliación usaréis (en este stack suele documentarse **CrakRevenue / HasOffers** con clave en GitHub Actions y Cloudflare — ver docs del repo si existen).

## 3. Tiempo estimado y dependencias

| | |
|--|--|
| **Tiempo** | 2–4 horas |
| **Depende de** | Acceso de lectura al repo y a quien gestione secrets |

## 4. Pasos

### Paso 1 — Artículo de política de secretos

- **Qué hacer:** En [CSN Knowledge](${n.csnKnowledge}), **Category = Policy**, lista **nombres** de variables (ej. \`CRAKREVENUE_API_KEY\`) y dónde viven: **GitHub → Settings → Secrets** y **Cloudflare → Environment variables**. Escribe explícito: «valores nunca en Notion».
- **Comprobar:** El artículo no contiene valores de claves.

### Paso 2 — Registrar Feed Sync Run

- **Qué hacer:** [Feed Sync Runs](${n.feedSyncRuns}) → **New** · proveedor · fechas · **Rows Upserted** (0 permitido en QA con Note «simulado») · enlaza Site y Project Run.
- **Comprobar:** Fila existe y está enlazada.

### Paso 3 — Si hay job de feed en el repo

- Pide a Cursor (prompt abajo) que localice scripts o workflows de sincronización; tú ejecutas solo lo que tengas permiso.

## 5. Prompt listo para copiar en Cursor

\`\`\`
# Día 5 — Afiliación y feeds (documentación + código)

## Objetivo
Explicar cómo el repo integra feeds de afiliado y qué secretos necesita, sin exponer valores.

## Contexto
- Repo: [URL]
- QA o producción: [QA / Producción]

## Tareas
1. Buscar referencias a CrakRevenue, HasOffers, feed sync en código y docs.
2. Listar nombres de env vars y dónde configurarlas (GitHub/Cloudflare).
3. Describir pasos para una sincronización de prueba que YO ejecutaré (o marcar «solo documentado»).
4. Texto para Feed Sync Run en Notion (proveedor, filas, notas).

## Límites
- No imprimir API keys.
- No afirmar que el feed corrió en producción sin evidencia.

## Entregables
Markdown para CSN Knowledge + texto para fila Feed Sync Run.
\`\`\`

## 6. Qué revisar en la respuesta de Cursor

Éxito: nombres de secretos sin valores. Fallo: pega claves o inventa IDs de oferta.

## 7. Cuándo terminar el día

- [ ] Artículo Policy de secretos.
- [ ] Feed Sync Run creado (simulado OK en QA).

## 8. Qué queda pendiente

Obtener claves reales del afiliado (humano con cuenta); ejecutar sync en producción (más adelante).
`;
}
