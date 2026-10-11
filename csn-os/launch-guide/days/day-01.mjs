import { REPO_REFERENCE } from "../guide-context.mjs";
import { VISUAL_OPTIONS, notionOptionalBlock, promptFence } from "../guide-product-format.mjs";

const PROMPT = `# Día 1 — Producto, estilo visual y base del proyecto

## Rol
Arquitecto de producto + frontend senior. Inspecciona el repositorio ANTES de proponer cambios.

## Repositorio
[URL o ruta local — ej. ${REPO_REFERENCE}]

## PASO 0 — Decisión humana obligatoria
Si el brief no incluye la opción visual (A directorio / B tube / C TikTok-style / D híbrido / E editorial):
- Pregunta al usuario cuál elige y por qué.
- NO implementes una UI genérica hasta tener respuesta.

## Tareas (código + documentos locales, no Notion API)

1. Leer README, package.json, src/app o pages, componentes de listado/perfil existentes.
2. Redactar brief producto: nicho, países/idiomas, propuesta valor, fuente modelos, afiliación, páginas esenciales, éxito medible.
3. Con la opción A–E elegida, producir **design system v0** en markdown: paleta, tipografía, tarjetas, badges LIVE/OFFLINE, header/footer móvil+desktop, espaciado, estados vacíos, accesibilidad.
4. Si hay referencia visual del usuario: traducir a tokens (sin copiar assets protegidos).
5. Preparar entorno: npm install, npm run dev — reportar errores reales.
6. Si el repo está vacío o es plantilla: crear estructura mínima acorde a la opción elegida (rutas home + listado + perfil placeholder).

## Archivos que puedes tocar (inspeccionar primero)
- src/app/** o pages/**
- src/components/** (feed, profile)
- src/app/globals.css o tokens Tailwind
- docs/ o DESIGN.md en raíz (crear si no existe)

## Límites
- No Notion API. No deploy. No inventar datos de modelos.
- Etiquetar cada entrega: Documentado | Implementado | Probado | Pendiente.

## Entregables
- brief-producto.md (o DESIGN.md)
- Comandos ejecutados y URL local si dev arranca
- Lista de gaps para Día 4`;

export function renderDay01() {
  return `# Día 1 — Producto, estilo visual y base del proyecto

## 1. Qué parte de la web construyes hoy
La **identidad del producto**: qué sitio de cams es, cómo se ve y navega, y un proyecto **ejecutable en local** (o bloqueo documentado).

## 2. Cómo debe verse / comportarse
Según la opción **A–E** que elijas (no la elige Cursor sin preguntarte):

${VISUAL_OPTIONS}

Resultado mínimo al cerrar el día: puedes abrir **localhost** y reconocer la dirección elegida (aunque falten datos reales).

## 3. Qué necesitas antes de empezar
- Cursor con el repo clonado (fork de ${REPO_REFERENCE} si no tienes otro).
- Node.js LTS.
- 2–3 referencias visuales (URLs o capturas) si las tienes.

## 4. Pasos en Cursor
1. Abre el repo → explora rutas y componentes de listado/perfil.
2. Rellena el brief (nicho, idiomas, monetización, páginas).
3. **Elige A–E** y anótalo en \`docs/brief-producto.md\`.
4. Pega el prompt §5 → aplica design system y arranque local.
5. \`npm install\` y \`npm run dev\` → anota URL y errores.

## 5. Prompt completo

${promptFence(PROMPT)}

## 6. Archivos que Cursor debería tocar
- \`docs/brief-producto.md\` o \`DESIGN.md\`
- \`src/app/globals.css\`, layout, componentes de tarjeta/header
- Rutas home / categoría / perfil según opción elegida

## 7. Comprobar (visual + funcional)
- [ ] Opción A–E escrita por el humano (no inferida sin preguntar)
- [ ] \`npm run dev\` arranca o error copiado en texto
- [ ] Home muestra estructura acorde a la opción (grid, feed, etc.)
- [ ] Badges LIVE/OFFLINE definidos en diseño (aunque mock)

## 8. Si falla
- Build roto → pegar log; no marcar Probado.
- Sin decisión visual → no implementar UI definitiva; solo preguntar.

## 9. Estado
| Ítem | Estado |
|------|--------|
| Brief | |
| Dirección A–E | |
| Design system | |
| App local | |

## 10. Desbloquea
**Día 2** — competencia y dominio sin dejar de codear en local.

${notionOptionalBlock()}
`;
}
