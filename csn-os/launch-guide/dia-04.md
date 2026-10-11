# Día 4 — Plantilla maestra de perfil (código funcionando)

## 1. Qué vas a conseguir hoy
- Repositorio operativo en tu máquina (o documentado bloqueo).
- **Plantilla de perfil** implementada o corregida en código.
- **Muestra:** 3 perfiles probados (live / offline / datos mínimos).
- Fila [CSN Releases](https://app.notion.com/p/aec67ee40ad2476ab498c4207c76fbd7) sandbox + evidencia CI si hay GitHub.

## 2. Antes de empezar
- Arquitectura pSEO Día 3.
- GitHub y Node instalados (para este stack).


### Si aún no tienes repositorio de código

**Opción A — Ya tienes cuenta GitHub:** crea un repositorio vacío privado o usa una plantilla Next.js acordada con tu equipo. Copia la URL `https://github.com/usuario/repo` al cuaderno.

**Opción B — Usas este stack de referencia (monorepo cam Next.js):** clona o haz fork de `https://github.com/doctorsresearch1000-max/naughtyxxxcams` solo si tu alcance lo autoriza (QA). Abre el proyecto en Cursor.

**Opción C — Sin acceso GitHub hoy:** marca en Notion «repo pendiente» y en Día 4 ejecuta solo el prompt de lectura si alguien te pasa un ZIP; **no** puedes marcar CI ni plantilla como «probado» hasta tener el código local.

Etiqueta siempre: **Documentado** | **Implementado** | **Probado** | **Pendiente**.


## 3. Tiempo
- **6–8 h** si hay que implementar; **2–3 h** si solo ajustes.

## 4. Pasos

### Paso 1 — Repo y CI
- **Qué:** Seguir 
### Si aún no tienes repositorio de código

**Opción A — Ya tienes cuenta GitHub:** crea un repositorio vacío privado o usa una plantilla Next.js acordada con tu equipo. Copia la URL `https://github.com/usuario/repo` al cuaderno.

**Opción B — Usas este stack de referencia (monorepo cam Next.js):** clona o haz fork de `https://github.com/doctorsresearch1000-max/naughtyxxxcams` solo si tu alcance lo autoriza (QA). Abre el proyecto en Cursor.

**Opción C — Sin acceso GitHub hoy:** marca en Notion «repo pendiente» y en Día 4 ejecuta solo el prompt de lectura si alguien te pasa un ZIP; **no** puedes marcar CI ni plantilla como «probado» hasta tener el código local.

Etiqueta siempre: **Documentado** | **Implementado** | **Probado** | **Pendiente**.
; prompt repo §5B.
- **Dónde:** [CSN Sites](https://app.notion.com/p/7b6afa6b844b438f93210cdb8ee728ca) Notes con URL repo.
- **Si no hay repo:** incidente [CSN Incidents](https://app.notion.com/p/793edf56ea4341cfbaaf2c3dd0976b66); solo documentación; **no** marcar plantilla Probada.

### Paso 2 — Implementar plantilla maestra
- **Qué:** Prompt §5A en Cursor con repo abierto.
- **Comprobar:** Cambios en archivos perfil/SEO reales (ver prompt).
- **Muestra:** 3 URLs locales documentadas.

### Paso 3 — Release sandbox
- **Qué:** [CSN Releases](https://app.notion.com/p/aec67ee40ad2476ab498c4207c76fbd7) Environment sandbox; Notes con SHA y enlace Actions si existe.

### Paso 4 — Knowledge
- **Qué:** Artículo «Plantilla perfil v1» con rutas y reglas LIVE/OFFLINE.


### Cómo obtener una URL de preview (staging)

1. **Local (desarrollo):** con el repo abierto en Cursor/terminal, ejecuta lo que indique el README (en este stack suele ser `npm run dev` → `http://localhost:3000`). Eso es preview **local**, válida como evidencia en QA si la anotas en Notion (no es producción).
2. **Cloudflare Pages (si el proyecto ya está conectado):** en el panel Cloudflare → Pages → tu proyecto → pestaña **Deployments** → abre la URL `*.pages.dev` del último deploy de rama preview. Requiere permiso en Cloudflare.
3. **Si no hay deploy:** registra en [CSN Incidents](https://app.notion.com/p/793edf56ea4341cfbaaf2c3dd0976b66) «Preview no disponible — falta deploy» y en Día 7 cierra con checklist **local** probada; no afirmes staging público sin URL.


## 5. Prompts

### 5A — Plantilla maestra
```text
# Día 4 — Plantilla maestra de perfil de modelo

## Objetivo
Diseñar e implementar (o corregir) la plantilla reutilizable de perfil en el repositorio real. Trabajo en código; yo registro evidencia en Notion.

## Repositorio
[URL GITHUB — obligatorio para marcar «Implementado»]

## Archivos de referencia en este stack (inspeccionar, no asumir)
- src/lib/profile/modelProfile.ts — ModelProfileView, status live/offline
- src/components/profile/ModelProfileSlushyView.tsx — UI perfil
- src/lib/seo/model-profile-metadata.ts — metadata SEO
- src/lib/profile/useProfileStreamPlayer.ts — LIVE API cliente
- Rutas bajo src/app/ que sirven /model o perfil (buscar profileSlug)

## Requisitos de la plantilla
1. Identidad: nombre artístico, slug estable, sin inventar biografía factual.
2. LIVE/OFFLINE coherente entre badge, reproductor y metadata (documentar fuente de verdad).
3. Categorías/atributos solo si existen en datos del feed.
4. Title/description/canonical únicos por perfil; no duplicar solo cambiando nombre.
5. Estados vacíos: sin foto, sin categoría, modelo eliminado del feed.
6. Enlaces internos a categoría y perfiles relacionados con reglas claras.
7. Móvil y rendimiento: no cargar iframe live si offline.

## Alcance
- Editar solo archivos de perfil/SEO necesarios.
- Sin deploy, sin secretos, sin Notion API.

## Muestra antes de escalar
Implementar o verificar **3 perfiles** (1 live, 1 offline, 1 datos mínimos) con datos reales o mock QA etiquetado.

## Entregables
- Resumen de cambios y archivos tocados.
- Checklist: Implementado / Probado local / Solo documentado.
- Capturas o rutas locales a probar (ej. /model/[slug]).
- Texto para CSN Knowledge «Plantilla perfil v1».
```

### 5B — Repo y CI
```text
# Día 4 — Preparar repo y CI (sin deploy)

Repo: [URL]

1. Clonar/abrir en Cursor.
2. Listar workflows .github/workflows.
3. Comandos: npm install, npm run lint, npm test, npm run build (si existe).
4. Crear rama de trabajo para plantilla perfil.

Entrega: URLs Actions si existen; qué está Probado local vs Pendiente.
```

## 6. Respuesta Cursor
- Diff lógico, checklist Implementado/Probado; comandos ejecutados.

## 7. Comprobar
- [ ] Repo local corre (dev) o bloqueo documentado
- [ ] 3 perfiles revisados en navegador
- [ ] Release + CI documentados

## 8. Si falla
- CI rojo: anotar URL fallo; no deploy.
- Build local falla: pegar error en Incidents.

## 9. Pendiente
- Deploy preview cloud → Día 7 si permisos Cloudflare.
