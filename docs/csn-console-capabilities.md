# CSN OS — Capacidades vs interfaz (auditoría)

| Capacidad | Implementación actual | Limitación | Solución implementada |
|-----------|----------------------|------------|------------------------|
| Crear proyecto + tareas | `createProject` → Notion API | Notion no ejecuta Node | **Consola web** `POST /api/csn/projects` |
| Plan y progreso | `getWorkPlan`, conteo tareas Done/Total | Sin tareas → «Sin datos suficientes» | Vista `GET /api/csn/projects/[lk]` |
| Siguiente tarea | `findNextTaskForRun` | Solo datos Notion | Mostrado en Continuar |
| Prompt Cursor | `assemblePrompt` + Notion publish | No ejecuta Cursor | Botón «Preparar prompt» + copiar |
| Registrar resultado | `recordExecutionResult` | Exige evidencia en éxito | Formulario Resultado |
| Mantenimiento | DB Incidents/Maintenance + relación Site | Sin backlog automático | Listado + crear incidencia/rutina vía API |
| Secretos Notion | `NOTION_API_KEY` en servidor | No en cliente | Solo rutas `/api/csn/*` |
| Auth consola | `CSN_CONSOLE_TOKEN` header | Sin SSO aún | Token en sessionStorage |

## Interfaces existentes

| Interfaz | Ejecuta acciones | Notas |
|----------|------------------|-------|
| Notion portada | No | Enlaces e instrucciones; v6 apunta a `/csn-console` |
| CLI `npm run csn` | Sí (local/CI) | Mismo motor que la consola |
| **Consola `/csn-console`** | Sí (vía API Next.js) | Flujo guiado QA/producción |
| GitHub Actions | No integrado CSN | No usado en este cambio |

## Acceso

- URL: `/csn-console` (mismo despliegue Next.js / Cloudflare que el repo).
- Variables: `NOTION_API_KEY`, `CSN_CONSOLE_TOKEN` (servidor).

## Pruebas

`npm run csn:console-acceptance` → `docs/csn-console-acceptance.json`
