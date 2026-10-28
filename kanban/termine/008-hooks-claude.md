---
id: 008
title: Hooks Claude : block-deps + lint-edited
epic: E02
app: site
depends_on: []
adr: 0001
verify: `npm i foo` déclenche une demande de confirmation ; une édition .ts avec erreur ESLint remonte l'erreur
---

# 008 — Hooks Claude : block-deps + lint-edited

## Action

`.claude/hooks/block-deps.mjs` (PreToolUse Bash : ajout de dépendance → confirmation user), `.claude/hooks/lint-edited.mjs` (PostToolUse Edit/Write : ESLint sur le fichier). Déclarés dans `.claude/settings.json`. Hook SessionStart reporté en P3 (carte 023).
