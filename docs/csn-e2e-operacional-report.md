# E2E operacional CSN OS

2026-10-11T09:12:41.209Z

**PASS**

```json
{
  "A": {
    "siteExternalId": "csn:site:e2e-qa-1791709841650",
    "runExternalId": "csn:run:e2e-qa-1791709841650",
    "siteId": "3f684cd0-85ae-816a-8a97-f78141727e45",
    "runId": "3f684cd0-85ae-817a-a81a-ce68698b0564",
    "launchKey": "e2e-qa-1791709841650",
    "executionTasks": {
      "created": 28,
      "reused": 0
    }
  },
  "B": {
    "runExternalId": "csn:run:e2e-qa-1791709841650",
    "runName": "Lanzamiento — E2E QA e2e-qa-1791709841650",
    "currentPhase": 1,
    "recordClass": "QA test-only",
    "domain": "",
    "phases": {
      "1": {
        "id": 1,
        "nameEs": "Intake y aprobación de alcance",
        "nameEn": "Intake & human gate",
        "summaryEs": "Definir el proyecto, crear registros y obtener aprobación de alcance antes de gastar o desplegar.",
        "gates": [
          "project_run"
        ],
        "tasksTotal": 3,
        "tasksDone": 0,
        "status": "current",
        "blockers": []
      },
      "2": {
        "id": 2,
        "nameEs": "Investigación de dominios expirados",
        "nameEn": "Domain research",
        "summaryEs": "Buscar candidatos en expireddomains.net, revisar historial y puntuar sin comprar.",
        "gates": [],
        "tasksTotal": 4,
        "tasksDone": 0,
        "status": "locked",
        "blockers": []
      },
      "3": {
        "id": 3,
        "nameEs": "Selección y preparación de registro",
        "nameEn": "Domain selection",
        "summaryEs": "Elegir dominio y preparar compra; requiere gate domain_candidate Approved.",
        "gates": [
          "domain_candidate"
        ],
        "tasksTotal": 2,
        "tasksDone": 0,
        "status": "locked",
        "blockers": []
      },
      "4": {
        "id": 4,
        "nameEs": "Arquitectura, DNS y hosting",
        "nameEn": "DNS & hosting",
        "summaryEs": "Documentar arquitectura y DNS; sin cutover de producción sin gate.",
        "gates": [
          "staging_deploy"
        ],
        "tasksTotal": 2,
        "tasksDone": 0,
        "status": "locked",
        "blockers": [
          "Sin dominio: omitir cutover DNS de producción; usar staging/ejemplo."
        ]
      },
      "5": {
        "id": 5,
        "nameEs": "Repositorio y CI",
        "nameEn": "Repository & CI",
        "summaryEs": "Inspeccionar repo, CI y evidencias de lint/test.",
        "gates": [],
        "tasksTotal": 2,
        "tasksDone": 0,
        "status": "locked",
        "blockers": []
      },
      "6": {
        "id": 6,
        "nameEs": "Afiliación e integración de feeds",
        "nameEn": "Affiliate / feed",
        "summaryEs": "APIs oficiales, secretos fuera de Notion, registrar Feed Sync Runs.",
        "gates": [],
        "tasksTotal": 2,
        "tasksDone": 0,
        "status": "locked",
        "blockers": []
      },
      "7": {
        "id": 7,
        "nameEs": "Producto, UX, contenido y cumplimiento",
        "nameEn": "Content & compliance",
        "summaryEs": "Páginas legales y UX; escalar temas legales a revisión humana.",
        "gates": [],
        "tasksTotal": 1,
        "tasksDone": 0,
        "status": "locked",
        "blockers": []
      },
      "8": {
        "id": 8,
        "nameEs": "SEO e indexación",
        "nameEn": "SEO baseline",
        "summaryEs": "Oportunidades SEO, sitemap y verificación en sitio renderizado.",
        "gates": [],
        "tasksTotal": 2,
        "tasksDone": 0,
        "status": "locked",
        "blockers": []
      },
      "9": {
        "id": 9,
        "nameEs": "Autoridad y backlinks",
        "nameEn": "Backlink outreach",
        "summaryEs": "Oportunidades de enlace; pagos requieren gate backlink.",
        "gates": [
          "backlink"
        ],
        "tasksTotal": 2,
        "tasksDone": 0,
        "status": "locked",
        "blockers": []
      },
      "10": {
        "id": 10,
        "nameEs": "Staging, QA y endurecimiento",
        "nameEn": "Staging & QA",
        "summaryEs": "Release en staging/sandbox, pruebas y Evidence URL.",
        "gates": [
          "staging_deploy"
        ],
        "tasksTotal": 3,
        "tasksDone": 0,
        "status": "locked",
        "blockers": []
      },
      "11": {
        "id": 11,
        "nameEs": "Lanzamiento a producción",
        "nameEn": "Production deploy",
        "summaryEs": "Solo con gate production_deploy Approved; no automatizado.",
        "gates": [
          "production_deploy"
        ],
        "tasksTotal": 2,
        "tasksDone": 0,
        "status": "locked",
        "blockers": [
          "N/A en QA test-only para producción."
        ]
      },
      "12": {
        "id": 12,
        "nameEs": "Medición, mantenimiento y handoff",
        "nameEn": "KPI & handoff",
        "summaryEs": "Launch KPI Snapshot (aislado), mantenimiento y cierre del run.",
        "gates": [],
        "tasksTotal": 3,
        "tasksDone": 0,
        "status": "locked",
        "blockers": []
      }
    },
    "nextRecommendedPhase": 1
  },
  "B_pass": true,
  "C": {
    "pass": true,
    "path": "/workspace/csn-os/generated-prompts/csn_prompt_csn_run_e2e-qa-1791709841650_p05_bd1ad17bb12d.md",
    "notionUrl": "https://app.notion.com/p/Prompt-Cursor-Repository-and-branch-strategy-3f684cd085ae81529a08d4ebfa0a7db7"
  },
  "D": {
    "pass": true,
    "missing": [
      "Fase 10 sin tareas de ejecución completadas (0/3)"
    ]
  },
  "E": {
    "pass": true,
    "rec": {
      "reportId": "csn:report:csn:run:e2e-qa-1791709841650:p05:1791709871570",
      "path": "/workspace/csn-os/execution-reports/csn_run_e2e-qa-1791709841650/phase-05.json",
      "nextRecommended": {
        "phase": 1,
        "runExternalId": "csn:run:e2e-qa-1791709841650",
        "hint": "npm run csn -- prompt --run-external-id=csn:run:e2e-qa-1791709841650 --phase=1"
      },
      "taskStatus": "Done"
    }
  },
  "F": {
    "pass": true,
    "phase5done": 2
  },
  "G": {
    "pass": true
  },
  "H": {
    "pass": true
  }
}
```
