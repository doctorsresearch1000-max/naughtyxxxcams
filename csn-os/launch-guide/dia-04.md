# Día 4 — Prepara el repositorio y comprueba la calidad

## 1. Qué vas a conseguir hoy

El **enlace al código** documentado en Notion, una fila de **release en entorno sandbox** y **evidencia de que las pruebas automáticas (CI) se ejecutan** en GitHub — sin desplegar a producción.

## 2. Qué necesitas antes de empezar

- URL del repositorio GitHub (HTTPS público o al que tengas acceso).
- Cuenta GitHub para ver **Actions** (pestaña de automatización).

**CI (integración continua):** programa que ejecuta lint y tests cada vez que subes cambios.

## 3. Tiempo estimado y dependencias

| | |
|--|--|
| **Tiempo** | 2–3 horas |
| **Depende de** | Repositorio existente |
| **Si no hay repo** | Usa el día para documentar «repo pendiente» y salta implementación hasta tener URL |

## 4. Pasos

### Paso 1 — Documentar el repositorio

- **Qué hacer:** Copia la URL `https://github.com/...` en Notes del Site o en Knowledge.
- **Dónde:** [CSN Sites](https://app.notion.com/p/7b6afa6b844b438f93210cdb8ee728ca) o [CSN Knowledge](https://app.notion.com/p/3d7f94b0d3294789846ab221945c5b85).
- **Comprobar:** La URL abre el repo correcto.

### Paso 2 — Crear fila de release sandbox

- **Qué hacer:** [CSN Releases](https://app.notion.com/p/aec67ee40ad2476ab498c4207c76fbd7) → **New** · **Environment** = sandbox (o staging) · **Status** = Not started · enlaza Site y Project Run.
- **Comprobar:** Existe al menos una fila de release para tu run.

### Paso 3 — Verificar GitHub Actions

- **Qué hacer:** En GitHub → pestaña **Actions** → abre el último workflow de lint/test en `main` o en un PR reciente. Copia la URL del run.
- **Dónde:** Pega la URL en **Notes** de la fila CSN Releases o en Knowledge.
- **Comprobar:** No marques éxito sin URL real; si falló, anota «falló» y el enlace.
- **Local (opcional):** si tienes Node instalado, en la carpeta del repo: `npm run lint` y `npm test` si el README lo indica.

### Paso 4 — Actualizar release cuando haya SHA

- **Qué hacer:** Si hay commit reciente, pon **Git SHA** corto en la release y **Status** = In progress.

## 5. Prompt listo para copiar en Cursor

```
# Día 4 — Revisión de repo y CI (sin deploy)

## Objetivo
Inspeccionar el repositorio del sitio y decir qué comprobaciones de calidad existen. No desplegar a producción.

## Contexto
- Repo: [URL GITHUB]
- QA o producción: [QA / Producción]

## Tareas
1. Localizar workflows en .github/workflows y resumir qué ejecutan.
2. Indicar comandos locales recomendados (lint, test, build).
3. Listar archivos clave de configuración (package.json, wrangler, etc.).
4. Decir qué evidencia debo pegar en Notion (URL de Actions, SHA).

## Límites
- No ejecutar deploy ni cambiar secrets.
- Etiquetar: Implementado / Solo documentado / No probado.

## Entregables
Informe breve en español + URL sugerida para Notes de CSN Releases.
```

## 6. Qué revisar en la respuesta de Cursor

Éxito: nombra workflows reales del repo. Fallo: «todo verde» sin haber leído el repo.

## 7. Cuándo terminar el día

- [ ] URL de repo en Notion.
- [ ] Fila CSN Releases sandbox.
- [ ] URL de GitHub Actions en Notes (o «pendiente» documentado con motivo).

## 8. Qué queda pendiente

Arreglar CI rojo (día siguiente o incidencia); deploy sigue prohibido sin gates posteriores.
