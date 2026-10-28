---
id: 013
title: Règles ESLint d'architecture
status: refine
epic: E05
app: site
depends_on: []
adr: 
verify: le cliquet compte les nouvelles règles
---

# 013 — Règles ESLint d'architecture

## Action

`no-restricted-syntax` (ESLint natif, pas de plugin) : hex en TSX, `<button>`/`<select>` natifs, imports cross-app (P3). Plafond du cliquet par règle pour ne pas noyer les erreurs existantes. À faire au début de P4.
