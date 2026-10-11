# Cursor — QA: verificación de CI y workflows (fase 5)

**Proyecto QA:** {{SITE_NAME}}  
**Run ID:** `{{RUN_EXTERNAL_ID}}`  
**Repositorio:** {{REPOSITORY_URL}}  
**Tarea:** Verificación de workflow CI (GitHub Actions) — solo QA, sin despliegues.

---

## Objetivo

Confirmar que el repositorio tiene un pipeline CI mínimo (lint y/o tests) documentado y ejecutable localmente, y dejar evidencia en el informe de ejecución CSN OS.

## Alcance

- Inspeccionar `.github/workflows/` si existe.
- Ejecutar `npm run lint` y al menos un script de test documentado en `package.json`.
- Proponer cambios **solo** si el workflow está roto o falta un job esencial para este monorepo.

## Fuera de alcance

- Secrets, tokens, deploy a Cloudflare producción, cambios DNS.

## Criterios de aceptación

- [ ] Lista de workflows encontrados con propósito en una línea cada uno.
- [ ] Salida de `npm run lint` (exit 0 o explicación de fallo preexistente con evidencia).
- [ ] Recomendación concreta si falta job de CI para PRs.

## Pruebas

```bash
npm run lint
npm test
```

## Evidencias

Archivos tocados, salidas de comandos, enlace al informe JSON para `npm run csn -- resultado`.

*Prompt ID: `{{PROMPT_ID}}`*
