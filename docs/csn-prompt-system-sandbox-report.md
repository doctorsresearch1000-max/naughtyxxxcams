# CSN Prompt System — Sandbox Test Report

Generated: 2026-10-11T08:06:34.587Z

Overall: **PASS**

```json
{
  "test1_isolation": {
    "pass": true,
    "fictionalRun": "3f684cd0-85ae-814f-ac05-d5f31475aa36",
    "qaRun": "3f684cd0-85ae-8163-bd91-c543e4878c1c"
  },
  "test2_phaseResolution": {
    "pass": true,
    "sourceVersions": {
      "phaseSpec": {
        "id": "csn:phase:v1:05",
        "version": "1.0.0",
        "status": "Approved"
      },
      "standards": [
        {
          "id": "csn:standard:v1:repo-ci",
          "version": "1.0.0",
          "status": "Approved"
        },
        {
          "id": "csn:standard:v1:testing",
          "version": "1.0.0",
          "status": "Approved"
        },
        {
          "id": "csn:standard:v1:secrets",
          "version": "1.0.0",
          "status": "Approved"
        }
      ],
      "promptTemplate": "csn:prompttpl:v1:execution-phase"
    }
  },
  "test3_promptQuality": {
    "pass": true,
    "blocked": false,
    "path": "/workspace/csn-os/generated-prompts/csn_prompt_csn_run_fictional-sandbox-prompt-qa_p05_bbc8a1b764ce.md"
  },
  "test4_missingInputs": {
    "pass": true,
    "missing": [
      "projectBrief",
      "repositoryUrl"
    ]
  },
  "test5_independentExecTasks": {
    "pass": true,
    "fictionalCount": 28,
    "qaCount": 28,
    "overlap": false
  },
  "test6_idempotency": {
    "pass": true,
    "promptId": "csn:prompt:csn:run:fictional-sandbox-prompt-qa:p05:bbc8a1b764ce"
  },
  "test7_gates": {
    "pass": true,
    "hasPendingProdTemplate": true,
    "note": "Technical enforcement unavailable; prompt must not claim prod authorized without Approved gate"
  },
  "test8_handoff": {
    "pass": true
  },
  "test9_qaSeparation": {
    "pass": true,
    "recordClass": "QA test-only"
  },
  "test10_legacy": {
    "pass": true,
    "before": {
      "hub": 4,
      "ops": 4,
      "kv": 1,
      "routine": 9,
      "issues": 8,
      "deploy": 7,
      "kpi1": 52,
      "kpi2": 4
    },
    "after": {
      "hub": 4,
      "ops": 4,
      "kv": 1,
      "routine": 9,
      "issues": 8,
      "deploy": 7,
      "kpi1": 52,
      "kpi2": 4
    }
  }
}
```

## Sample prompt
Path: `/workspace/csn-os/generated-prompts/csn_prompt_csn_run_fictional-sandbox-prompt-qa_p05_bbc8a1b764ce.md`
