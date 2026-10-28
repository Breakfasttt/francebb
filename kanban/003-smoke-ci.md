---
id: 003
title: Tests smoke Playwright + CI GitHub
status: done
epic: E01
app: site
depends_on: []
adr: 
verify: `npm run test:e2e` (11 tests) + workflow `.github/workflows/ci.yml`
---

# 003 — Tests smoke Playwright + CI GitHub

## Action

Smoke sur base jetable `e2e.db`, login `dev-login`, cliquet ESLint (`lint-baseline.json`), CI typecheck/lint/build/smoke.

## Reste

CI jamais exécutée sur GitHub (aucun push).
