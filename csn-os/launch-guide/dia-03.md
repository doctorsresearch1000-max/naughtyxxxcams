# Día 3 — Keywords, arquitectura pSEO y diseño

## 1. Qué vas a conseguir hoy
- **Mapa keywords long tail** con familias y prioridades (sin volúmenes inventados).
- **Arquitectura pSEO** (URLs, plantillas, indexación).
- **Wireframe** navegación + checklist legal en [CSN Knowledge](https://app.notion.com/p/3d7f94b0d3294789846ab221945c5b85).
- Decisión qué familias existen (directorio, categoría, perfil; filtros solo si aportan).

## 2. Antes de empezar
- Cuaderno Día 1.
- Opcional: repo clonado para que Cursor lea rutas reales.

## 3. Tiempo
- **4–6 h** (investigación + documentación).
- No depende de dominio comprado.

## 4. Pasos

### Paso 1 — Investigación keywords (Cursor)
- **Qué:** Ejecutar prompt §5A; pegar resultado en Knowledge «pSEO — Mapa keywords».
- **Comprobar:** Cada fila tiene fuente (repo/brief/hipótesis).
- **Si falla:** sin repo, usar solo brief y marcar hipótesis.

### Paso 2 — Arquitectura pSEO
- **Qué:** Prompt §5B → artículo «pSEO — Arquitectura URLs».
- **Comprobar:** Reglas anti-canibalización escritas.

### Paso 3 — Wireframe y legales
- **Qué:** Prompt §5C → Policy «Checklist legal y páginas».
- **Dónde:** [CSN Knowledge](https://app.notion.com/p/3d7f94b0d3294789846ab221945c5b85)

### Paso 4 — SEO Opportunities (mínimo 2)
- **Qué:** [SEO Opportunities](https://app.notion.com/p/050ba07cbe8f45ca93fa9bb30d9ed739) desde ideas del mapa (título, URL objetivo, prioridad).

### Paso 5 — Notion run
- **Qué:** Current Phase 7 cuando Knowledge tenga los tres artículos.

## 5. Prompts

### 5A — Keywords long tail
```text
# Día 3 — Investigación keywords long tail (pSEO cams)

## Objetivo
Producir un mapa de keywords y arquitectura de URLs para un sitio de webcam. Yo validaré volúmenes fuera de Cursor si hace falta.

## Lo que TÚ (Cursor) puedes hacer
- Inferir patrones de búsqueda del nicho a partir del brief y del código (categorías, atributos, slugs en repo).
- Leer rutas y componentes (ej. perfiles, categorías) si tengo repo abierto.
- Proponer familias de página, intención, URL patrón, riesgo de canibalización.
- Marcar cada fila: Fuente = repo | brief | hipótesis (requiere validación externa).

## Lo que NO debes hacer
- Inventar volúmenes de búsqueda, KD, tráfico o rankings de competidores.
- Afirmar que has consultado Google Search Console o Ahrefs.
- Listar miles de URLs sin justificar datos y utilidad.

## Contexto (editar antes de enviar)
- Brief y mercados/idiomas: [PEGAR DEL CUADERNO]
- Repo (si existe): [URL o ruta local]
- Competidores que YO nombre: [lista o «ninguno aún»]

## Entregables
1. Tabla: familia (directorio / categoría / perfil / otro), intención, ejemplo keyword long tail, URL patrón, plantilla, prioridad P0-P2, riesgo canibalización.
2. Reglas LIVE vs OFFLINE en URLs/títulos solo si los datos del feed lo permiten.
3. Lista de validaciones externas (GSC, búsqueda manual, herramienta SEO) sin inventar resultados.
4. Bloque «Qué pegar en CSN Knowledge» (markdown).
```

### 5B — Arquitectura
```text
# Día 3 — Arquitectura pSEO (familias de página)

Basado en el mapa de keywords ya acordado.

Define para cada familia (directorio, categoría, subcategoría, perfil, búsqueda solo si útil):
- Intención búsqueda
- Patrón URL (ej. /c/[slug], /model/[slug])
- Fuente datos (feed campo X)
- Plantilla React/route
- Enlaces internos entrantes/salientes
- Index: sí/no/condicional
- Riesgos: thin, duplicado, canibalización

NO generar todas las combinaciones de filtros. NO inventar volúmenes.
Entrega: tabla + diagrama texto + política LIVE/OFFLINE en SERP si aplica.
```

### 5C — Legal + wireframe
```text
# Día 3 — Checklist legal y wireframe (documentación)

Brief: [cuaderno]
Repo si existe: [URL]

Mapa páginas + menú texto + checklist age/privacy/terms/2257 (marcar revisión legal humana).
No asesoría jurídica definitiva.
```

## 6. Respuesta Cursor
- Tablas markdown listas para Knowledge; sin métricas falsas.

## 7. Comprobar
- [ ] Mapa keywords + arquitectura + legal
- [ ] ≥2 SEO Opportunities
- [ ] LIVE/OFFLINE documentado si aplica

## 8. Si falla
- Sin repo: arquitectura provisional; marcar «validar con código Día 4».

## 9. Pendiente
- Implementación plantillas → Día 4.
