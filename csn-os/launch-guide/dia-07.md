# Día 7 — Validación y preparación del lanzamiento

## 1. Qué construyes hoy
**Veredicto del producto**: qué funciona, qué bloquea lanzamiento, evidencia reproducible.

## 2. Cómo debe verse / comportarse
Igual que Días 4–6 en la muestra; sin regresiones visuales obvias.

## 3. Antes de empezar
- Días 4–6 con estados documentados.
- Preview: `npm run dev` (local) o URL pages.dev si tienes deploy preview.

## 4. Pasos en Cursor
1. Prompt §5 → tabla pruebas.
2. Recorrer manualmente checklist en navegador.
3. Decisión escrita en `docs/launch-readiness.md`.

## 5. Prompt

```text
# Día 7 — Validación y preparación de lanzamiento

INSPECCIONA build actual y docs previos. Sin deploy producción.

## Funcional + visual
Checklist: home→categoría→perfil, móvil+desktop, filtros si existen, LIVE/OFFLINE, imágenes fallback, CTAs, legales/enlaces +18, consola sin errores críticos.

## SEO muestra
5 perfiles + 2 categorías: title, canonical, robots, internal links, 404.

## Preview
- pages.dev o preview CI si existe → usar esa URL.
- Solo localhost → etiquetar «LOCAL ONLY»; no presentar como URL pública.
- No inventar deploy ni indexación Google.

## Salida
Tabla PASS/FAIL | bloqueantes | decisión: solicitar lanzamiento / corregir / bloqueado

## Gates
Producción, compras, DNS → aprobación humana externa a este prompt.
```

## 6. Archivos
- `docs/launch-readiness.md` (crear)
- Fixes menores solo si bloqueantes

## 7. Comprobar
- [ ] Tabla PASS/FAIL completa
- [ ] Evidence URL = local o pages.dev (etiquetado)
- [ ] Sin «listo prod» sin gate humano

## 8. Si falla
- Bloqueante → lista priorizada; no cerrar como listo.

## 9. Estado
| Funcional | SEO muestra | Preview | Decisión |

## 10. Fin calendario
Mantenimiento y deploy prod fuera de esta guía hasta aprobaciones.


## Registro operativo en Notion (opcional — no bloquea el código)

Solo si tu equipo usa CSN para trazabilidad:

- [Project Run](https://app.notion.com/p/d0e397e495e544d28a6899bc6a1e654f) — notas del día, Evidence URL cuando tengas preview.
- [CSN Incidents](https://app.notion.com/p/793edf56ea4341cfbaaf2c3dd0976b66) — bloqueos reales (sin API key, build roto).
- [Human Gates](https://app.notion.com/p/806256831553451d9c84528f2a3ad654) — compras, DNS prod, deploy prod (Pending hasta aprobación).

No crees filas antes de tener un resultado en el producto que registrar.

