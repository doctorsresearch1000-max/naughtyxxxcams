# Día 7 — Preview, pruebas y decisión de lanzamiento

## 1. Qué vas a conseguir hoy
- **URL de preview** (local o pages.dev) registrada como evidencia.
- Checklist pSEO + funcional **pass/fail**.
- Gates producción Pending o N/A (QA).
- KPI snapshot + mantenimiento; decisión escrita lanzar / esperar / no listo.

## 2. Antes de empezar
- Días 4–6 con muestra perfiles.
- Checklist legal Día 3.


### Cómo obtener una URL de preview (staging)

1. **Local (desarrollo):** con el repo abierto en Cursor/terminal, ejecuta lo que indique el README (en este stack suele ser `npm run dev` → `http://localhost:3000`). Eso es preview **local**, válida como evidencia en QA si la anotas en Notion (no es producción).
2. **Cloudflare Pages (si el proyecto ya está conectado):** en el panel Cloudflare → Pages → tu proyecto → pestaña **Deployments** → abre la URL `*.pages.dev` del último deploy de rama preview. Requiere permiso en Cloudflare.
3. **Si no hay deploy:** registra en [CSN Incidents](https://app.notion.com/p/793edf56ea4341cfbaaf2c3dd0976b66) «Preview no disponible — falta deploy» y en Día 7 cierra con checklist **local** probada; no afirmes staging público sin URL.


## 3. Tiempo
- **4–8 h** pruebas; deploy prod otro día.

## 4. Pasos

### Paso 1 — Preview
- **Qué:** Obtener URL según anexo; **example.com no cuenta como preview real**.
- **Evidencia:** [Project Runs](https://app.notion.com/p/d0e397e495e544d28a6899bc6a1e654f) Evidence URL.

### Paso 2 — Validación Cursor
- **Qué:** Prompt §5 con lista exacta de URLs muestra.

### Paso 3 — Staging release
- **Qué:** [CSN Releases](https://app.notion.com/p/aec67ee40ad2476ab498c4207c76fbd7) staging Done si hay deploy; si solo local, Notes «evidencia local».

### Paso 4 — Gate producción
- **Qué:** Production class → gate production_deploy Pending; QA → Notes N/A.

### Paso 5 — KPI + Maintenance
- **Qué:** [Launch KPI Snapshots](https://app.notion.com/p/f01f1be58f36408192d17fbe6eff7ca8) (ceros QA OK); [CSN Maintenance](https://app.notion.com/p/e1dc314841b84783a79e185b0fde5280) ≥2 filas.

### Paso 6 — Decisión
- **Qué:** Notes run: «lanzar / no / esperar aprobación» sin afirmar prod live sin gate.

## 5. Prompt validación
```text
# Día 7 — Validación muestra pSEO + lanzamiento

## Objetivo
Validar muestra representativa y checklist de lanzamiento. Sin deploy producción.

## Preview
[URL localhost o pages.dev]

## Pruebas obligatorias (marcar cada una)
1. Home y navegación a categoría y perfil.
2. Perfil LIVE: badge y CTA coherentes.
3. Perfil OFFLINE: sin stream engañoso.
4. View-source o herramientas dev: title, canonical, meta robots en muestra.
5. Sitemap accesible si existe; contar que no incluya URLs bloqueadas.
6. Age gate y enlaces legales desde footer.
7. Enlaces afiliado no rotos (muestra).

## pSEO muestra
Revisar exactamente: [LISTA 3-5 URLs de perfiles + 2 categorías]

## Límites
- No afirmar indexación Google sin GSC.
- No deploy prod sin gate humano.

## Entregables
- Tabla pass/fail por prueba
- Decisión: listo para pedir deploy / necesita más trabajo / bloqueado por [razón]
- Texto Evidence URL y notas para Project Run
```

## 6. Respuesta Cursor
- Tabla pruebas; bloqueantes vs mejoras.

## 7. Comprobar
- [ ] Evidence URL real (local o pages.dev)
- [ ] Muestra pSEO revisada
- [ ] Gate prod OK
- [ ] Decisión escrita

## 8. Si falla
- Sin preview: no cerrar como «listo prod»; registrar bloqueo e Incidents.

## 9. Pendiente
- Deploy prod, DNS, compras — solo con Approved.
