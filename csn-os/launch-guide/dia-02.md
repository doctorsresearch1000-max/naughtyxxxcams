# Día 2 — Mercado, dominio y entorno

## 1. Qué construyes hoy
**Contexto de mercado** + **dominio provisional** + **más UI en local** (no una jornada solo de formularios).

## 2. Cómo debe verse / comportarse
La web en local debe **avanzar** (header, grid o feed según Día 1) mientras documentas competencia en paralelo.

## 3. Antes de empezar
- Día 1 cerrado (opción A–E + dev arrancado o bloqueo conocido).
- Brief en `docs/brief-producto.md`.

## 4. Pasos en Cursor
1. Prompt §5 → competencia + dominio (documentos).
2. 1–2 h dominio: Wayback + favorito; gate compra **sin pagar** (ver Notion opcional).
3. Resto: implementar navegación/categorías placeholder según diseño.

## 5. Prompt

```text
# Día 2 — Mercado, dominio y entorno (producto primero)

Inspecciona repo y brief-producto.md del Día 1.

## Mercado (máx. 2–3 h — luego código)
- 3–5 competidores del nicho: layout, categorías, perfiles, CTAs.
- Tabla: qué copiar (patrón) vs diferenciar.
- Sin inventar tráfico ni rankings.

## Dominio (máx. 1–2 h)
- 3 candidatos (expireddomains o manual); Wayback si accesible.
- Elegir favorito provisional; NO comprar sin aprobación humana.
- Plan hosting en texto (Cloudflare Pages, etc.) sin cambiar DNS prod.

## Código (resto del día)
- Continuar UI según opción A–E del Día 1.
- Commit en rama feature/dia-2.

## Archivos
- docs/competencia.md, docs/dominio.md
- Código UI en progreso

## Entregables
- Decisión dominio provisional + competencia documentada
- Progreso visible en localhost
```

## 6. Archivos
- `docs/competencia.md`, `docs/dominio.md`
- Componentes de listado/categoría en `src/`

## 7. Comprobar
- [ ] Tabla competidores con URLs reales visitadas
- [ ] Dominio favorito con notas Wayback (o «sin historio»)
- [ ] Cambio visible en localhost vs Día 1

## 8. Si falla
- Sin tiempo dominio → documentar «pendiente» y seguir UI.
- Compra bloqueada → esperado; seguir en local.

## 9. Estado
| Competencia | Dominio | Código UI |
|-------------|---------|-----------|

## 10. Desbloquea
**Día 3** — keywords y arquitectura URL alineada al layout elegido.

### Dominio (opcional Notion, ≤30 min)
Si registras: [Domain Candidates](https://app.notion.com/p/6b21261509454bc3b615faca86776831) + [Human Gates](https://app.notion.com/p/806256831553451d9c84528f2a3ad654) compra Pending.


## Registro operativo en Notion (opcional — no bloquea el código)

Solo si tu equipo usa CSN para trazabilidad:

- [Project Run](https://app.notion.com/p/d0e397e495e544d28a6899bc6a1e654f) — notas del día, Evidence URL cuando tengas preview.
- [CSN Incidents](https://app.notion.com/p/793edf56ea4341cfbaaf2c3dd0976b66) — bloqueos reales (sin API key, build roto).
- [Human Gates](https://app.notion.com/p/806256831553451d9c84528f2a3ad654) — compras, DNS prod, deploy prod (Pending hasta aprobación).

No crees filas antes de tener un resultado en el producto que registrar.

