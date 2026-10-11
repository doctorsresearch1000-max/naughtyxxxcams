# Guía rápida — CSN OS (uso diario)

## Dónde empezar en Notion

Abre el panel: busca la página **CSN OS — Panel de proyectos** bajo la raíz aislada, o ejecuta:

```bash
npm run csn -- panel
```

## Flujo completo

### 1. Preparar esquema (una vez por entorno)

```bash
npm run csn -- schema
```

### 2. Crear proyecto (QA o producción)

```bash
npm run csn -- proyecto crear \
  --nombre="Mi nuevo sitio" \
  --launch-key=mi-sitio-2026 \
  --nicho="cams" \
  --stack="Next.js + Cloudflare" \
  --repo=https://github.com/tu-org/tu-repo \
  --objetivo="Lanzar MVP en 8 semanas"
```

Por defecto crea **QA test-only**. Para producción: `--production=true` (requiere datos reales y gates).

### 3. Ver plan de 12 fases

```bash
npm run csn -- plan --run-external-id=csn:run:mi-sitio-2026
```

### 4. Generar prompt para Cursor

```bash
npm run csn -- prompt --run-external-id=csn:run:mi-sitio-2026 --phase=5 --print
```

Copia la salida a un **agente Cursor nuevo**. Si está bloqueado, el informe indica qué falta en Notion.

### 5. Registrar resultado tras Cursor

Crea `informe.json`:

```json
{
  "executionStatus": "verified_sandbox",
  "verificationLabel": "Verificado en sandbox",
  "summary": "Lint OK, PR #12",
  "evidenceUrls": ["https://github.com/org/repo/pull/12"],
  "tests": [{ "cmd": "npm run lint", "exit": 0 }],
  "advancePhase": true
}
```

```bash
npm run csn -- resultado --run-external-id=csn:run:mi-sitio-2026 --phase=5 --json=informe.json
```

## Limitaciones honestas

- **Notion no ejecuta** Node ni abre Cursor: la CLI es obligatoria para prompts.
- **Human Gates** no bloquean técnicamente compras ni despliegues.
- **KPI legacy** (`notion:sync-kpis`) no sustituye Launch KPI Snapshots del árbol aislado.
- Filtra vistas de producción: `Record Class` ≠ QA test-only.

## Diagnóstico

```bash
npm run csn -- diagnostico
npm run csn:e2e
```
