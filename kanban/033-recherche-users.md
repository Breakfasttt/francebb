---
id: 033
title: Une seule recherche d'utilisateurs + useDebounce
status: refine
epic: E05
app: site
depends_on: []
adr: 0001
verify: une seule server action searchUsers ; anciens composants de recherche branchés dessus ; typecheck vert
---

# 033 — Une seule recherche d'utilisateurs + useDebounce

## Action

Fusionner les recherches d'utilisateurs dupliquées en une server action `searchUsers` (auth vérifiée, `select` minimal, sans email) et un hook `common/hooks/useDebounce.ts`.
