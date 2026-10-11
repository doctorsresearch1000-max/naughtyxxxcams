# Cursor — QA: documentar almacenamiento de credenciales de afiliado (fase 6)

**Proyecto QA:** {{SITE_NAME}}  
**Run ID:** `{{RUN_EXTERNAL_ID}}`  
**Repositorio:** {{REPOSITORY_URL}}  
**NO almacenar secretos en Notion ni en el repo.**

---

## Objetivo

Documentar **dónde** deben vivir las credenciales CrakRevenue / afiliación (GitHub Secrets, Cloudflare Workers secrets, variables de entorno locales) sin escribir valores reales.

## Alcance

- Buscar referencias a `CRAK`, `affiliate`, `feed` en el código y en docs existentes.
- Redactar un apartado breve en un archivo de documentación del repo (o comentario en README sección ops) con el mapa de secretos **por nombre de variable**, no por valor.

## Restricciones

- No commitear `.env` con secretos.
- No modificar integración legacy de Notion KPI.

## Criterios de aceptación

- [ ] Tabla: nombre variable → entorno (local/staging/prod) → quién rota.
- [ ] Confirmación de que ningún secreto aparece en texto plano en el diff.

## Pruebas

- `rg -i "api[_-]?key|secret|password" src --glob '!*.test.*'` y revisar hallazgos.

*Prompt ID: `{{PROMPT_ID}}`*
