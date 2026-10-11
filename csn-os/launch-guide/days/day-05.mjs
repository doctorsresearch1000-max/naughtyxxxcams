import { notionOptionalBlock, promptFence } from "../guide-product-format.mjs";

const PROMPT = `# Día 5 — Datos, feed y monetización

INSPECCIONA integración real ANTES de cambiar:
- src/lib/crackrevenue/**, APIs feed, env vars documentadas (nombres solo).
- Mapeo campos → tarjetas, filtros, perfil.

## Tareas
1. Tabla campo proveedor → UI (solo campos que existen).
2. Implementar/corregir adaptador feed o documentar mock QA claramente.
3. Probar LIVE/OFFLINE con datos reales O mock etiquetado «QA-MOCK».
4. CTAs afiliado: jerkmateAffiliate / buildJerkmateAffiliateUrl — verificar URLs generadas en 2 perfiles.
5. Errores: duplicados, modelo eliminado, imagen faltante.
6. Secretos: solo GitHub Secrets / Cloudflare — nunca en repo ni chat.

## Si faltan credenciales
- Adapter + fixtures en tests o mock; registrar bloqueo exacto.
- NO afirmar «integración real» hasta llamada API exitosa.

## Entregables
- docs/feed-mapeo.md
- Evidencia: slugs probados + screenshot o descripción CTA`;

export function renderDay05() {
  return `# Día 5 — Datos, feed y monetización

## 1. Qué construyes hoy
La web muestra **datos trazables** y **enlaces de afiliado** comprobados (o mocks QA explícitos).

## 2. Cómo debe verse / comportarse
Tarjetas y perfiles reflejan el feed; CTAs visibles y correctos; sin nombres/atributos inventados.

## 3. Antes de empezar
- Día 4 navegable.
- Acceso a secrets o acuerdo de usar solo mock.

## 4. Pasos en Cursor
1. Prompt §5 → leer código feed.
2. Conectar o mock; recargar 5 perfiles en local.
3. Clic derecho CTA → URL contiene parámetros esperados (sin pegar keys).

## 5. Prompt

${promptFence(PROMPT)}

## 6. Archivos
- \`src/lib/crackrevenue/**\`
- Componentes CTA perfil/tarjeta
- \`.env.example\` si falta documentación de vars

## 7. Comprobar
- [ ] 2 perfiles con datos del feed o mock etiquetado
- [ ] CTA afiliado generado (Implementado/Probado)
- [ ] Sin API keys en git diff

## 8. Si falla
- Sin API key → mock + bloqueo en docs/feed-mapeo.md; Pendiente integración real.

## 9. Estado
| Feed real | Mock QA | Monetización probada |

## 10. Desbloquea
**Día 6** — SEO técnico en rutas reales.

${notionOptionalBlock()}
`;
}
