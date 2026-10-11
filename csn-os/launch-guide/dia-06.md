# Día 6 — SEO técnico, calidad y rendimiento

## 1. Qué construyes hoy
**Reglas pSEO aplicadas en código** + auditoría reproducible.

## 2. Cómo debe verse / comportarse
View-source de muestra: títulos únicos; perfiles thin con noindex o no en sitemap.

## 3. Antes de empezar
- Rutas de perfil/categoría funcionando con datos Día 5.

## 4. Pasos en Cursor
1. Prompt §5.
2. `npm run build` si existe; revisar sitemap generado.
3. Completar tabla 5+2 URLs.

## 5. Prompt

```text
# Día 6 — SEO técnico, calidad y rendimiento

INSPECCIONA rutas y plantillas implementadas en Días 4–5.

## Implementar o corregir
- title/description únicos por plantilla
- canonical, robots/noindex para no elegibles
- sitemap (solo URLs canónicas elegibles según docs/pseo-arquitectura.md)
- internal links, 404 perfil
- offline/eliminado según política
- JSON-LD solo si datos reales lo permiten
- rendimiento: imágenes, lazy load, LCP básico en muestra
- coherencia HTML inicial vs estado LIVE/OFFLINE vs metadata

## Muestra obligatoria
- 5 perfiles + 2 categorías (si existen datos)
- Tabla PASS/FAIL por comprobación

## Sin
- Umbral mágico de palabras
- Afirmar indexación Google

## Entregables
- docs/seo-tecnico-auditoria.md con archivo:línea por hallazgo
```

## 6. Archivos
- `src/lib/seo/**`, sitemap route, robots
- `profileContentQuality` o similar si existe

## 7. Comprobar
- [ ] 5 perfiles + 2 categorías auditados
- [ ] sitemap no lista URLs prohibidas por arquitectura
- [ ] 404 en slug inventado

## 8. Si falla
- Build falla → priorizar errores antes de SEO.

## 9. Estado
| Metadata | Sitemap | Rendimiento muestra |

## 10. Desbloquea
**Día 7** — validación integral.


## Registro operativo en Notion (opcional — no bloquea el código)

Solo si tu equipo usa CSN para trazabilidad:

- [Project Run](https://app.notion.com/p/d0e397e495e544d28a6899bc6a1e654f) — notas del día, Evidence URL cuando tengas preview.
- [CSN Incidents](https://app.notion.com/p/793edf56ea4341cfbaaf2c3dd0976b66) — bloqueos reales (sin API key, build roto).
- [Human Gates](https://app.notion.com/p/806256831553451d9c84528f2a3ad654) — compras, DNS prod, deploy prod (Pending hasta aprobación).

No crees filas antes de tener un resultado en el producto que registrar.

