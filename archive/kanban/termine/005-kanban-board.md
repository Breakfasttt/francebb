---
id: 005
title: Kanban à frontmatter + BOARD.md généré
epic: E02
app: site
depends_on: []
adr: 0001
verify: `npm run board -- --check`
---

# 005 — Kanban à frontmatter + BOARD.md généré

## Action

Cartes `kanban/NNN-slug.md` à frontmatter YAML (source de vérité, pas de dossiers par statut), épics `kanban/epics/`, `scripts/board.mjs` génère `kanban/BOARD.md` et valide (ids, statuts, épics, dépendances). Vérifié en CI.
