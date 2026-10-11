import { notionOptionalBlock, promptFence } from "../guide-product-format.mjs";

const PROMPT = `# Día 3 — Keywords, arquitectura pSEO y especificación de páginas

INSPECCIONA: docs/brief-producto.md, opción A–E, rutas en src/app, campos feed si existen.

## Regla
La arquitectura URL y el wireframe deben coincidir con la opción visual:
- Tube site ≠ TikTok-style en rutas y densidad de grid.
- No interfaz genérica compartida por capricho.

## Keywords
- Familias long tail: categoría, atributo, geo, nombre modelo (si datos).
- Marcar: comprobado | hipótesis | validación externa pendiente.
- NO volúmenes ni KD inventados.

## Por familia de página documentar
- Intención, patrón URL, fuente datos, plantilla React, internal links, meta, index sí/no/condicional, riesgos thin/duplicate/cannibal.

## Páginas a especificar (contenido + comportamiento)
Home, directorio, categorías, perfil, búsqueda/filtros (solo si valor), legales, 404/empty.

## Salida
- docs/pseo-arquitectura.md
- docs/especificacion-paginas.md

No generar miles de URLs de filtros combinados.`;

export function renderDay03() {
  return `# Día 3 — Keywords, arquitectura pSEO y especificación de páginas

## 1. Qué construyes hoy
El **plano SEO y de páginas** que el código seguirá en Días 4–6 (no solo Notion).

## 2. Cómo debe verse / comportarse
Cada familia de URL debe mapear a una **plantilla visual** coherente con A–E (ej. perfil en tube = detalle con media; directorio = grid SEO).

## 3. Antes de empezar
- Opción A–E documentada.
- Repo con rutas inspeccionables.

## 4. Pasos en Cursor
1. Leer rutas y componentes actuales.
2. Prompt §5 → dos docs en \`docs/\`.
3. Lista 5 URLs de muestra para implementar en Día 4.

## 5. Prompt

${promptFence(PROMPT)}

## 6. Archivos
- \`docs/pseo-arquitectura.md\`
- \`docs/especificacion-paginas.md\`
- Ajustes menores de rutas placeholder si hace falta

## 7. Comprobar
- [ ] Cada familia tiene patrón URL + plantilla nombrada en repo
- [ ] LIVE/OFFLINE reflejado en spec si aplica
- [ ] Sin tabla de keywords con volúmenes ficticios

## 8. Si falla
- Sin datos feed → spec con campos «pendiente proveedor».

## 9. Estado
| Mapa keywords | Arquitectura | Spec páginas |

## 10. Desbloquea
**Día 4** — implementación navegable v1.

${notionOptionalBlock()}
`;
}
