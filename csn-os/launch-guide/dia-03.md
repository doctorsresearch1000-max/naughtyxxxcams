# Día 3 — Diseña la estructura y revisa requisitos legales

## 1. Qué vas a conseguir hoy

Un **mapa de páginas** (inicio, categorías, perfil de modelo, legales) y un **checklist de cumplimiento** (edad, privacidad, términos, 2257 si aplica) guardado en Notion, con huecos marcados para revisión humana cuando haga falta.

## 2. Qué necesitas antes de empezar

- Día 1 completado (Site en Notion).
- Brief del cuaderno de proyecto.
- **UX:** la experiencia que vive el visitante (menús, filtros, fichas de modelo).

## 3. Tiempo estimado y dependencias

| | |
|--|--|
| **Tiempo** | 2–4 horas |
| **Depende de** | Brief claro (Día 1) |
| **No depende de** | Dominio comprado |

## 4. Pasos

### Paso 1 — Listar páginas obligatorias

- **Qué hacer:** En papel o Notion, lista: Home, listados, perfil, búsqueda, contacto, **Política de privacidad**, **Términos**, **Aviso +18 / age gate**, y **2257** si operas en jurisdicciones que lo exigen.
- **Dónde:** Borrador en [CSN Knowledge](https://app.notion.com/p/3d7f94b0d3294789846ab221945c5b85) → **New**, **Category = Policy**, título «Checklist legal y páginas — [sitio]».
- **Resultado:** Cada ítem con columna «¿Existe? / Pendiente / Responsable».
- **Comprobar:** No dejas legales en blanco sin marcar «pendiente abogado».

### Paso 2 — Esquema de navegación

- **Qué hacer:** Dibuja o describe menú principal y 2 niveles de categorías acordes a tu nicho.
- **Dónde:** Misma página Knowledge o Notes del [Project Run](https://app.notion.com/p/d0e397e495e544d28a6899bc6a1e654f).
- **Comprobar:** Un visitante nuevo entiende dónde encontrar modelos en vivo vs offline.

### Paso 3 — Registrar huecos como incidencias si bloquean

- **Qué hacer:** Si falta texto legal crítico, crea fila en [CSN Incidents](https://app.notion.com/p/793edf56ea4341cfbaaf2c3dd0976b66) con severidad y «bloquea lanzamiento: sí/no».
- **Comprobar:** Incidencia enlazada al Site si aplica.

### Paso 4 — Marcar fase en el run

- **Qué hacer:** Cuando el checklist esté al menos «In progress» completo, anota en Project Run **Current Phase** = 7.

## 5. Prompt listo para copiar en Cursor

```
# Día 3 — Estructura del sitio y checklist legal (solo documentación)

## Objetivo
Proponer mapa de páginas y checklist de cumplimiento para un sitio de webcam. Yo pegaré el resultado en CSN Knowledge. No eres abogado: marca «revisión legal humana» donde corresponda.

## Contexto
- Nicho y países objetivo: [TU BRIEF]
- QA o producción: [QA / Producción]
- Repo (si existe): [URL — Cursor puede leer rutas src/app o pages para ver qué ya existe]

## Tareas
1. Mapa de páginas (lista + una frase por página).
2. Wireframe en texto del menú principal.
3. Checklist legal: age gate, privacy, terms, 2257 — estado sugerido (existe / falta / N/A) según el repo si lo tienes.
4. Lista de riesgos si lanzamos sin ítem X.

## Límites
- No redactar políticas legales finales como si fueran asesoramiento jurídico.
- No afirmar que las páginas ya están publicadas.

## Entregables
Markdown para CSN Knowledge + lista de incidencias sugeridas.
```

## 6. Qué revisar en la respuesta de Cursor

Éxito: mapa alineado con tu brief; legales marcados para revisión humana. Fallo: promete cumplimiento legal sin revisión.

## 7. Cuándo terminar el día

- [ ] Artículo Policy en CSN Knowledge con checklist y responsables.
- [ ] Esquema de navegación guardado.
- [ ] Incidencias creadas solo si hay bloqueos reales.

## 8. Qué queda pendiente

Revisión legal profesional; diseño visual detallado (puede ir en paralelo al Día 4).
