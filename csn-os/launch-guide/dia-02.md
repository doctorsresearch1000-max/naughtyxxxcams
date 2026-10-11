# Día 2 — Evalúa el dominio y prepara la infraestructura

## 1. Qué vas a conseguir hoy

Tendrás **al menos tres nombres de dominio candidatos** anotados en Notion, **historial revisado** (descartando opciones peligrosas), **un favorito justificado**, **solicitud de compra preparada pero sin pagar**, y un **plan escrito de alojamiento y DNS** (sin tocar DNS de producción).

Puedes **terminar el día con la compra pendiente** de aprobación.

## 2. Qué necesitas antes de empezar

- Haber completado el **Día 1** (Project Run + Site en Notion).
- Tu **cuaderno de proyecto** con nicho e identificador interno.
- Navegador web.
- **Glosario (primera vez):**
  - **Dominio:** la dirección web (ej. `ejemplo.cam`).
  - **Dominio expirado:** un nombre que dejó de renovarse; a veces se puede registrar de nuevo (hay que comprobar disponibilidad y historial).
  - **Wayback Machine (web.archive.org):** archivo histórico de cómo se veía una web en el pasado.
  - **DNS:** el «directorio» que enlaza tu dominio con el servidor donde vive la web; cambiarlo mal puede tumbar el sitio.
  - **Staging / pruebas:** versión de la web en una dirección de prueba, no la que usa el público en producción.

## 3. Tiempo estimado y dependencias

| | |
|--|--|
| **Tiempo orientativo** | 3–5 horas de trabajo; la **compra real** puede tardar días (aprobación + registrador) |
| **Depende de** | Día 1; Human Gate de alcance que permita investigación (sin gasto) |
| **Puede alargarse si** | expireddomains.net limita el acceso o el responsable tarda en aprobar la compra |

## 4. Pasos (sigue este orden)

### Paso 1 — Buscar al menos tres candidatos en expireddomains.net

- **Qué hacer:** Entra en https://www.expireddomains.net/ → menú **Deleted Domains**. Filtra por extensión (TLD), longitud y palabras relacionadas con tu nicho. Anota **mínimo 3 dominios** que parezcan disponibles o próximos a ello.
- **Dónde:** Navegador; luego [Domain Candidates](https://app.notion.com/p/6b21261509454bc3b615faca86776831) en Notion → **New** por cada uno.
- **Qué rellenar en Notion:** **Domain** (título), **Source** = expireddomains.net, relación a tu **Site** y **Project Run**, **Status** = Not started.
- **Resultado esperado:** ≥3 filas en Domain Candidates.
- **Comprobar:** Cada fila está ligada a tu mismo Project Run.
- **Si no funciona:** Si el sitio pide registro o no carga, anota candidatos desde otra fuente permitida por tu política y pon Source = «manual» en Notes; no inventes dominios ya comprados.

### Paso 2 — Revisar historial (Wayback) y descartar riesgos

- **Qué hacer:** Para **cada** candidato, abre https://web.archive.org/ y busca el dominio. Mira capturas antiguas.
- **Señales graves (marcar candidato como Blocked en Notion):** spam, malware, casinos no relacionados, phishing, contenido ilegal, redirecciones sospechosas.
- **Dónde:** Wayback + campo **Notes** de cada fila en [Domain Candidates](https://app.notion.com/p/6b21261509454bc3b615faca86776831).
- **Resultado esperado:** Cada candidato tiene Notes con resumen y, si aplica, enlace a captura Wayback.
- **Comprobar:** Ningún candidato activo queda sin Notes.
- **Si falla:** Si Wayback no tiene datos, escribe «sin historial en Wayback»; no asumas que está limpio.

### Paso 3 — Comparar candidatos restantes

- **Qué hacer:** Puntúa los que no están Blocked con la tabla siguiente (copia también en Notes del favorito).

Criterios prácticos para comparar candidatos (puntuación 1–5 en cada fila; suma orientativa):

| Criterio | 1 (peor) | 5 (mejor) |
|----------|----------|-----------|
| Encaje con tu nicho | Nombre confuso o fuera de tema | Nombre claro para tu público |
| Fácil de recordar y escribir | Muy largo o con guiones raros | Corto y memorable |
| Historial en Wayback | Spam, casinos, malware, redirecciones raras | Páginas normales o vacío limpio |
| Extensión (.com, .cam, etc.) | TLD poco adecuado para tu mercado | TLD que tu audiencia reconoce |

**Ahrefs DR u otras métricas de pago:** opcionales. No son obligatorias para terminar el día.

El manifest CSN menciona la plantilla «TEMPLATE: Domain candidate evaluation» en CSN Knowledge; su texto oficial es breve: revisar Wayback, marcar Blocked si es tóxico, y no comprar sin aprobación humana.

- **Dónde:** Notes en Domain Candidates y, al final, Notes de tu [Project Run](https://app.notion.com/p/d0e397e495e544d28a6899bc6a1e654f).
- **Resultado esperado:** Un solo candidato marcado **In progress** como favorito; el resto Not started o Blocked.
- **Comprobar:** En Project Run hay una frase clara: «Dominio preferido: … porque …».
- **Si falla:** Si todos son malos, vuelve al paso 1 con nuevos nombres.

### Paso 4 — Preparar la compra (sin pagar)

- **Qué hacer:** En [Human Gates](https://app.notion.com/p/806256831553451d9c84528f2a3ad654) crea una fila nueva:
  - **Target Type:** domain_candidate
  - **Target External ID:** `csn:domain:[nombre-del-dominio]:[External-ID-de-tu-run]` (sustituye los corchetes por valores reales).
  - **Scope:** «Registrar [dominio exacto] en [registrador que usaréis]».
  - **Limits:** precio máximo en USD (ej. 25).
  - **Status:** **Pending**
- **Regla:** **STOP — no pagues** hasta que un responsable cambie Status a **Approved**.
- **Resultado esperado:** Gate de compra pendiente, ligado a un solo dominio.
- **Comprobar:** Limits incluye tope en dólares.
- **Si falla:** Si no hay quien apruebe hoy, deja Pending; el día sigue siendo válido si los pasos 1–3 y 6 están hechos.

### Paso 5 — Confirmar estado del gate (sin comprar)

- **Qué hacer:** Abre el gate del paso 4. Si es **QA/práctica:** documenta en Notes del Project Run: «Compra pendiente de aprobación — no se realiza checkout». Si es **producción** y sigue Pending: **no** vayas al registrador.
- **Resultado esperado:** Estado del gate escrito en el run (captura o texto).
- **Comprobar:** No hay recibo de compra ni dominio pagado sin Approved.
- **Si está Rejected:** elige otro candidato (paso 3) o escala en [CSN Incidents](https://app.notion.com/p/793edf56ea4341cfbaaf2c3dd0976b66) si hace falta.

### Paso 6 — Escribir la decisión en Notion (fase de selección)

- **Qué hacer:** En el candidato favorito, amplía **Notes** con un párrafo de al menos 50 caracteres: por qué gana frente a los otros. En Project Run, pon **Current Phase** = 3 cuando este texto esté listo.
- **Resultado esperado:** Justificación legible para un revisor humano.
- **Comprobar:** El párrafo menciona criterios de la tabla, no solo «me gusta el nombre».

### Paso 7 — Plan de alojamiento y DNS (solo documentación)

- **Qué hacer:** En [CSN Knowledge](https://app.notion.com/p/3d7f94b0d3294789846ab221945c5b85) crea un artículo **Category = Runbook** titulado «DNS y hosting — [nombre del sitio]». Incluye tabla: tipo de registro (A, CNAME, etc.), nombre (@, www), valor **sin contraseñas** (solo hostnames; ej. proyecto en Cloudflare Pages).
- **Para QA:** en el mismo artículo o en Notes del run, escribe: «No se cambiará DNS de producción; pruebas en example.com o subdominio de staging».
- **Dónde:** [CSN Knowledge](https://app.notion.com/p/3d7f94b0d3294789846ab221945c5b85); enlaza la URL en **Evidence URL** del Project Run si existe el campo.
- **Resultado esperado:** Plan DNS legible; QA deja constancia de no cutover prod.
- **Comprobar:** No hay claves API ni contraseñas en el artículo.
- **Si falla:** Si no conoces Cloudflare aún, describe «pendiente definir con responsable técnico» y lista preguntas abiertas.

### Paso 8 — Checklist sandbox DNS

- **Qué hacer:** En Notes del Project Run, lista numerada: hostnames de prueba, quién los configura, fecha objetivo. Marca explícito: «DNS producción: sin cambios».
- **Resultado esperado:** Checklist marcada mentalmente como completa cuando el texto existe.
- **Comprobar:** Record Class del sitio sigue siendo QA test-only si es prueba.

## 5. Prompt listo para copiar en Cursor

Usa **un prompt por bloque de trabajo** (puedes hacerlo en dos veces: investigación + plan DNS).

### Prompt A — Investigación y tabla comparativa (sin Notion)

```
# Día 2 — Ayuda con dominios candidatos (sin acceso a Notion ni registradores)

## Objetivo
Organizar mi investigación de dominios para un sitio de webcam. Yo crearé las filas en Notion y yo compraré el dominio si hay aprobación.

## Contexto
- Nicho: [PEGA TU NICHO DEL CUADERNO]
- Dominios que estoy valorando: [LISTA 3+ DOMINIOS]
- Resúmenes Wayback que ya vi: [PEGA TUS NOTAS O «pendiente»]

## Qué puedes hacer
1. Sugerir preguntas adicionales para detectar riesgos en el historial.
2. Rellenar una tabla comparativa (criterios 1–5: encaje, memorabilidad, historial, TLD) con justificación breve.
3. Redactar el párrafo «dominio preferido porque…» para pegar en Notion.
4. Redactar Scope y Limits para una solicitud de compra (dominio único, tope USD) — sin afirmar que está comprado.

## Lo que NO debes hacer
- No digas que compraste ni registraste nada.
- No accedas a expireddomains.net ni Wayback (yo ya lo hice o lo haré).
- No inventes métricas Ahrefs; si no tengo datos, di «opcional / no disponible».

## Entregables
Tabla markdown + párrafo de decisión + texto de gate en español.
```

### Prompt B — Plan DNS y hosting (repositorio si existe)

```
# Día 2 — Borrador de plan DNS/hosting (documentación)

## Objetivo
Producir un borrador de artículo «DNS y hosting» que pegaré en CSN Knowledge. Sin secretos.

## Contexto
- Sitio: [NOMBRE]
- QA o producción: [QA / Producción]
- Dominio preferido (puede estar sin comprar): [DOMINIO]
- Repositorio (si existe): [URL GITHUB — o «desconocido»]

## Qué puedes hacer
1. Si tengo repo: leer wrangler.toml, README o docs de deploy y resumir dónde se aloja (ej. Cloudflare Pages).
2. Proponer tabla DNS (apex vs www) solo con hostnames públicos.
3. Para QA: sección explícita «sin cambios en DNS de producción».

## Límites
- No modificar DNS real ni Cloudflare.
- No pegar API keys.

## Entregables
Markdown listo para CSN Knowledge + checklist sandbox en viñetas.
```

## 6. Qué revisar en la respuesta de Cursor

| Éxito | Fallo o bloqueo |
|-------|------------------|
| Tabla con razones concretas | Elige un dominio sin mencionar riesgos Wayback |
| Texto de gate con tope en USD | «Aprobar cualquier compra» |
| Plan DNS sin contraseñas | Incluye tokens o keys |
| Distingue QA (sin prod DNS) | Instrucciones de cutover producción sin gate |

## 7. Cuándo puedes dar el día por terminado

- [ ] ≥3 Domain Candidates en Notion con Source documentado.
- [ ] Wayback/Notes en cada candidato; malos en Blocked.
- [ ] Un favorito In progress con puntuación y párrafo de decisión.
- [ ] Human Gate domain_candidate en **Pending** (o Approved si ya hubo aprobación explícita).
- [ ] **Sin pago** de dominio si el gate no está Approved.
- [ ] Artículo Runbook DNS/hosting en CSN Knowledge (o borrador pegado y enlace anotado).
- [ ] Checklist «sin DNS producción» si es QA.

## 8. Qué queda pendiente

| Pendiente | ¿Puedo seguir con otra cosa? |
|-----------|------------------------------|
| Aprobación de compra | Sí — Día 3 (estructura/legal) no requiere dominio comprado |
| Registro real del dominio | Esperar Approved; no bloquea diseño ni checklist legal |
| Configurar DNS en el registrador | Día 7 o cuando haya staging y gates; hoy solo plan |

**Siguiente jornada:** Día 3 — estructura, UX y requisitos legales.
