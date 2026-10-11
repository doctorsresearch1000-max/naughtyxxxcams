# Cursor — QA DEMO: coherencia LIVE/OFFLINE en perfiles de modelo

**Proyecto QA:** DEMO QA — LIVE/OFFLINE Cam Profiles  
**Run ID:** `csn:run:demo-qa-live-offline`  
**Repositorio de referencia (inspeccionado):** `doctorsresearch1000-max/naughtyxxxcams` (este monorepo Next.js + Cloudflare)  
**NO es producción.** No despliegues ni cambies DNS.

---

## Rol y misión

Eres un ingeniero senior en frontend/React/Next.js. Tu misión es **auditar y corregir** la coherencia del estado **LIVE vs OFFLINE** en las páginas de perfil de modelo, sin romper el reproductor de stream ni el SEO existente.

Debes **inspeccionar el código real** antes de editar. No asumas que todos los badges usan la misma fuente de verdad.

---

## Contexto técnico (estado actual en repo)

Fuentes de verdad que coexisten hoy:

1. **`ModelProfileView.status`** — `"live" | "offline"` en SSR (`src/lib/profile/modelProfile.ts`).
2. **API cliente** — `GET /api/profile/[slug]/live` actualiza performer en `useProfileStreamPlayer` (`src/lib/profile/useProfileStreamPlayer.ts`).
3. **`catalogLive`** — `model.status === "live" && livePerformer?.live !== false` (línea ~161-162).
4. **Badge en feed** — `LiveStreamBadge` usa `performer.live !== false` (`src/components/feed/LiveStreamBadge.tsx`).
5. **UI perfil** — `ModelProfileSlushyView.tsx` usa `model.status === "live"` para props `live={isLive}`.
6. **SEO** — `src/lib/seo/model-profile-metadata.ts` y `profileContentQuality.ts` ramifican por `model.status`.

Riesgo conocido: el comentario en `useProfileStreamPlayer` indica *"Never downgrade to offline when API misses the model"* — puede dejar UI LIVE con catálogo offline o al revés.

---

## Alcance permitido

- Archivos bajo `src/lib/profile/`, `src/components/profile/`, `src/components/feed/LiveStreamBadge.tsx`, rutas `src/app/api/profile/**/live/**` si existen.
- Tests existentes relacionados (`npm run test:seo` si aplica a perfiles).
- Documentar hallazgos en el informe final.

## Fuera de alcance

- Cambios en Notion, secretos, CrakRevenue keys, deploy, DNS.
- Refactors masivos no relacionados con LIVE/OFFLINE.
- Modificar `src/data/mock.ts` salvo que sea imprescindible para un test local (justificar).

---

## Requisitos funcionales

1. **Definición única documentada** en comentario breve o tipo helper: qué significa "live" para UI de perfil vs badge de feed vs SEO metadata.
2. **Perfil offline (SSR `status === "offline"`)** — no debe mostrar badge LIVE animado ni montar iframe interactivo; debe mostrar UI de conversión/offline coherente.
3. **Perfil live con API que devuelve performer offline** — comportamiento explícito y consistente (mantener política de no degradar SSR sin documentar, o corregir con test).
4. **`LiveStreamBadge`** — si `visible` pero performer no live, no mostrar badge (ya parcialmente así); alinear con `catalogLive` donde se use junto.
5. **Accesibilidad** — `aria-live="polite"` en badge se mantiene; no eliminar sin reemplazo.

---

## Plan de ejecución (orden obligatorio)

1. `git status` — rama limpia o documentar cambios previos.
2. Leer `useProfileStreamPlayer.ts` completo y trazar: SSR status → fetch live API → `catalogLive` → `showStreamLayer` / `showConversionUi`.
3. Leer `ModelProfileSlushyView.tsx` — cómo `isLive` afecta layout y CTA.
4. Localizar handler de `/api/profile/[slug]/live` y documentar payload `{ status, performer, embedMode, canMountInteractivePlayer }`.
5. Identificar inconsistencias (lista en informe).
6. Implementar **cambio mínimo** (preferir helper `resolveProfileLiveState(...)` en `src/lib/profile/` si reduce duplicación).
7. Ejecutar pruebas (sección Tests).
8. Informe final con etiquetas de verdad (Implemented / Tested successfully / Not tested).

---

## Casos límite a verificar manualmente o con test

| Caso | Esperado |
|------|----------|
| SSR offline, API no llamada aún | Sin badge LIVE, sin iframe |
| SSR live, API 404/500 | No romper página; política documentada |
| SSR live, API sin performer | No badge engañoso |
| SSR live, performer.live === false | UI coherente (conversion o offline) |
| Desconexión stream (`SM_DISCONNECTED`) | `showConversionUi` true, no iframe colgado |

---

## Criterios de aceptación

- [ ] Una sola función o módulo documentado como fuente de verdad para **UI de perfil** (aunque SEO pueda seguir usando `model.status` con comentario).
- [ ] Ningún badge LIVE visible cuando `catalogLive === false`.
- [ ] `npm run lint` exit 0.
- [ ] `npm run test:seo` exit 0 (o explicar fallo preexistente con evidencia).
- [ ] Informe markdown con archivos tocados y comandos ejecutados.

---

## Tests (ejecutar y pegar salida resumida)

```bash
npm run lint
npm run test:seo
```

Si existe script de perfil indexable, incluirlo. **No afirmes éxito sin salida.**

---

## Evidencias a devolver

1. Lista de archivos modificados con una línea de propósito cada uno.
2. Salida de lint/test (o "Tested unsuccessfully" + motivo).
3. Captura o descripción de 2 perfiles (uno live, uno offline) en `npm run dev` — **Documented only** si no levantas dev server.
4. Enlace a commit o diff.

---

## Condición de terminación

Tarea terminada solo si criterios de aceptación marcados y evidencias adjuntas. Si bloqueado por API externa, estado **Blocked** con pasos para desbloquear.

## Registro en CSN OS (operador)

Tras ejecutar, el operador registrará en Notion (tarea de ejecución vinculada) o vía:

`npm run csn -- resultado --run-external-id=csn:run:demo-qa-live-offline --phase=7 --json=informe.json`

---

*Generado por CSN OS — QA ficticio. Prompt ID: `csn:prompt:demo-qa-live-offline:task-live-offline-v1`*


---

## Tarea focalizada: [QA] Coherencia LIVE/OFFLINE en perfiles de modelo

**Prerrequisitos:** (ninguno registrado)

**Instrucciones de la tarea:**
Abrir la página hijo PROMPT Cursor en el panel CSN OS, copiar todo el contenido a un agente Cursor nuevo, ejecutar en el repo naughtyxxxcams (QA).

**Criterios de aceptación (tarea):**
Lint + test:seo OK; badge LIVE coherente; informe con evidencias.
