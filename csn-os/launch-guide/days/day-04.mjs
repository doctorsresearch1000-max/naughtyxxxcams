import { REPO_REFERENCE } from "../guide-context.mjs";
import { notionOptionalBlock, promptFence } from "../guide-product-format.mjs";

const PROMPT = `# Día 4 — Construcción web funcional v1

INSPECCIONA TODO el repo antes de editar: brief, DESIGN, pseo-arquitectura, especificacion-paginas, opción A–E.

## Implementar en código (no solo markdown)
- App shell: header, footer, nav móvil+desktop según diseño Día 1.
- Home acorde a A–E.
- Directorio/categorías prioritarias (mín. 2 rutas).
- Sistema tarjetas modelo (imagen, nombre, LIVE/OFFLINE, atributos reales o mock QA etiquetado).
- Plantilla maestra perfil: src/lib/profile/*, src/components/profile/*, metadata en src/lib/seo/*
- Responsive, empty states, 404 perfil inexistente.
- Primera pasada metadata (title/description) en plantillas.

## Plantilla perfil — obligatorio
- Slug estable; sin biografía inventada.
- Offline vs live coherente (modelProfile.ts, useProfileStreamPlayer si existe).
- Related links, canonical placeholder, noindex si datos insuficientes.

## Híbrido / TikTok
- Si D: implementar módulo descubrimiento + directorio indexable.
- Si C: interacción esencial SIN sacrificar rutas crawlables.

## Pruebas
- npm run dev → navegar home → categoría → 3 perfiles (mock OK si etiquetado).
- npm run lint / npm test si existen.

## Entregables
- Lista archivos modificados
- Estado: Implementado / Probado local por ruta`;

export function renderDay04() {
  return `# Día 4 — Construcción de la web funcional

## 1. Qué construyes hoy
**Primera versión navegable**: home, listados, **plantilla maestra de perfil** en el repo real.

## 2. Cómo debe verse / comportarse
Exactamente la opción **A–E** del Día 1 — no un tema genérico oscuro/neón por defecto.

## 3. Antes de empezar
- \`docs/pseo-arquitectura.md\` y \`docs/especificacion-paginas.md\`.
- Dev server funcionando.

## 4. Pasos en Cursor
1. Prompt §5 con repo abierto.
2. Implementar en orden: layout → home → categoría → perfil.
3. Probar 3 slugs en navegador; capturar qué es mock.

## 5. Prompt

${promptFence(PROMPT)}

## 6. Archivos (referencia stack ${REPO_REFERENCE})
- \`src/app/**\` rutas
- \`src/components/profile/ModelProfileSlushyView.tsx\` (o equivalente)
- \`src/lib/profile/modelProfile.ts\`
- \`src/lib/seo/model-profile-metadata.ts\`
- \`src/components/feed/**\` tarjetas

## 7. Comprobar visual + funcional
- [ ] Navegación home → categoría → perfil sin 500
- [ ] LIVE/OFFLINE no contradictorio en un perfil offline de prueba
- [ ] Móvil: header usable
- [ ] lint/test si CI existe

## 8. Si falla
- Tests rojos → arreglar o documentar Pendiente con enlace Actions.

## 9. Estado
| Home | Categorías | Perfil | Metadata |

## 10. Desbloquea
**Día 5** — datos y monetización reales.

${notionOptionalBlock()}
`;
}
