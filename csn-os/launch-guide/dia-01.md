# Día 1 — Define tu proyecto

## 1. Qué vas a conseguir hoy

Al terminar tendrás **tu idea escrita con claridad**, **tres registros en Notion** (ejecución del proyecto, ficha del sitio y solicitud de aprobación de alcance) y **un texto listo** para pedir aprobación antes de gastar dinero o publicar.

## 2. Qué necesitas antes de empezar

- Cuenta con acceso a Notion en la página [Cam Sites — SOP System](https://app.notion.com/p/Cam-Site-Network-OS-SOP-System-Isolated-3f684cd085ae811fa929c4b4ccbcb56a).
- 30–45 minutos sin interrupciones.
- Decisión honesta: ¿esto es **práctica (QA)** o **lanzamiento real (producción)**? En QA puedes usar dominios de ejemplo; en producción necesitarás más aprobaciones después.


## Tu cuaderno de proyecto (rellénalo una vez y consérvalo)

Copia este bloque en un documento propio (Notion, bloc de notas o la descripción de tu Project Run). Lo usarás en los prompts de Cursor.

- **Nombre del sitio (público):** _______________________
- **¿Es una prueba (QA) o lanzamiento real (producción)?** QA / Producción
- **Nicho en una frase:** _______________________
- **Qué debe hacer la web para el visitante:** _______________________
- **Identificador interno del proyecto** (elige una palabra corta, sin espacios, ej. `mi-cams-oct-2026`): _______________________
- **URL del repositorio de código** (si ya existe; si no, escribe «pendiente»): _______________________
- **Dominio deseado** (si lo sabes; si no, «por decidir»): _______________________

No necesitas memorizar códigos del sistema: el identificador interno es solo para que tú y tu equipo reconozcáis el mismo proyecto en Notion.


## 3. Tiempo estimado y dependencias

| | |
|--|--|
| **Tiempo orientativo** | 1–2 horas |
| **Depende de** | Nada (es el primer día) |
| **Puede alargarse si** | Aún no tienes claro el nicho o quién debe aprobar el alcance |

## 4. Pasos (sigue este orden)

### Paso 1 — Escribe el brief del sitio

- **Qué hacer:** Rellena el cuaderno de arriba, sobre todo «qué debe hacer la web» en 5–10 frases (público, idiomas, tipo de modelos/categorías, si habrá blog, etc.).
- **Dónde:** En tu bloc o directamente en Notion al crear el proyecto (paso 2).
- **Resultado esperado:** Un párrafo que cualquier persona entienda sin jerga técnica.
- **Comprobar:** ¿Podrías leérselo a alguien no técnico y que entienda el producto? Si no, amplía.
- **Si falla:** Usa el prompt de Cursor al final de este día para redactar el brief; copia el resultado al cuaderno.

### Paso 2 — Crear la fila «Project Run» (ejecución del proyecto)

- **Qué hacer:** Abre la base [Project Runs](https://app.notion.com/p/d0e397e495e544d28a6899bc6a1e654f) → **New** (nueva fila).
- **Qué rellenar:**
  - **Run Name:** nombre del sitio + «lanzamiento» o «prueba QA».
  - **Run Type:** elige *QA Sandbox* si es prueba, o *New Site Launch* si es producción.
  - **Launch Key:** el identificador interno de tu cuaderno (ej. `mi-cams-oct-2026`).
  - **External ID:** puedes usar `csn:run:` + el mismo identificador (ej. `csn:run:mi-cams-oct-2026`).
  - **Status:** In progress · **Current Phase:** 1.
  - Relaciona **SOP Version** con la versión activa si aparece en la lista.
- **Resultado esperado:** Una página de proyecto visible con fecha de inicio.
- **Comprobar:** Launch Key y External ID no están vacíos.
- **Si falla:** Si no ves la base, confirma que la integración Notion tiene acceso; no uses otra copia del sistema.

### Paso 3 — Crear la ficha del sitio en CSN Sites

- **Qué hacer:** Abre [CSN Sites](https://app.notion.com/p/7b6afa6b844b438f93210cdb8ee728ca) → **New**.
- **Qué rellenar:**
  - **Site Name:** nombre público del sitio.
  - **Domain:** si es QA, puedes poner `https://example.com` o «pendiente»; en producción, el dominio objetivo o «pendiente».
  - **Record Class:** **QA test-only** para pruebas; **Production** solo si es lanzamiento real.
  - **Launch Key:** el mismo del paso 2.
  - Vuelve a [Project Runs](https://app.notion.com/p/d0e397e495e544d28a6899bc6a1e654f) y en tu fila relaciona **Site** con esta ficha.
- **Resultado esperado:** Sitio y proyecto enlazados entre sí.
- **Comprobar:** En Project Run, el campo Site apunta a la ficha correcta.
- **Si falla:** Nunca marques Production si solo estás practicando.

### Paso 4 — Solicitar aprobación de alcance (Human Gate)

- **Qué hacer:** Abre [Human Gates](https://app.notion.com/p/806256831553451d9c84528f2a3ad654) → **New**.
- **Qué rellenar:**
  - **Target Type:** project_run.
  - **Target External ID:** el External ID del Project Run (paso 2).
  - **Scope:** lista concreta de lo permitido (ej. «Solo Notion y documentación; sin compras; sin DNS; sin deploy»).
  - **Limits:** para QA, «gasto máximo 0 USD».
  - **Status:** Pending (hasta que un responsable ponga Approved).
- **Resultado esperado:** Una solicitud de aprobación ligada solo a este proyecto.
- **Comprobar:** Scope menciona tu proyecto, no una aprobación genérica para todo.
- **Si falla:** Si no hay responsable, deja Pending y anota en Notes del run quién debe aprobar.

### Paso 5 — (Opcional) Marcar tareas del Día 1 en Tasks

- **Qué hacer:** En [Tasks](https://app.notion.com/p/30d3973de3e340b0957a9f8c34db43ee), filtra por tu Project Run si puedes; marca **Done** las tres tareas de fase 1 cuando hayas completado los pasos 2–4.
- **Resultado esperado:** Trazabilidad para tu equipo; no es obligatorio para seguir la guía.

## 5. Prompt listo para copiar en Cursor

Pega esto en **Cursor** (en el chat del repositorio del sitio, si ya lo tienes; si no, en cualquier chat y guarda la respuesta):

```
# Redactar brief y textos para Notion — Día 1 (sin acceso a Notion)

## Objetivo
Ayudarme a definir un sitio de webcam y producir textos que yo pegaré manualmente en Notion. NO tienes acceso a Notion: no intentes crear filas ni APIs.

## Contexto (rellena antes de enviar)
- Nombre del sitio: [TU NOMBRE]
- QA o producción: [QA / Producción]
- Nicho: [TU NICHO]
- Identificador interno: [TU IDENTIFICADOR]
- Repositorio: [URL o «pendiente»]

## Qué debes hacer
1. Mejorar el brief en español claro (público, propuesta de valor, secciones principales).
2. Proponer Run Name, Launch Key y External ID coherentes (yo los revisaré).
3. Redactar Scope y Limits para una solicitud de aprobación de alcance (Human Gate) acorde a QA o producción.
4. Lista de comprobación final en viñetas.

## Límites
- No inventes dominios comprados, despliegues ni credenciales.
- No des por hecho acceso a GitHub si puse «pendiente».

## Entregables
Texto listo para copiar en Project Run, CSN Sites y Human Gates.
```

## 6. Qué revisar en la respuesta de Cursor

| Señal de éxito | Problema |
|----------------|----------|
| Brief comprensible en español | Texto genérico sin tu nicho |
| Scope acotado (sin «hacer todo») | Aprobación vaga para cualquier gasto |
| Distingue QA vs producción | Mezcla prueba con lanzamiento real |

## 7. Cuándo puedes dar el día por terminado

- [ ] Cuaderno de proyecto rellenado.
- [ ] Fila en Project Runs con Launch Key y External ID.
- [ ] Ficha en CSN Sites con Record Class correcto (QA test-only si es prueba).
- [ ] Project Run enlazado al Site.
- [ ] Human Gate creado con Scope y Limits (Approved o Pending documentado).

## 8. Qué queda pendiente

- **Aprobación humana:** el gate puede seguir en Pending; puedes empezar el Día 2 en modo documentación si el Scope permite investigar dominios sin comprar.
- **Repositorio:** si aún no existe, los días 4–5 esperarán URL real; no bloquea el Día 2.
