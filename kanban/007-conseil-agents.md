---
id: 007
title: Conseil des 5 agents + commandes
status: done
epic: E02
app: site
depends_on: [005, 006]
adr: 0001
verify: `/council` sur un vrai sujet produit un ADR conforme
---

# 007 — Conseil des 5 agents + commandes

## Action

`.claude/agents/` : fact-checker, guardian, visionary, player-advocate, moderator. `.claude/commands/` : `council`, `card`, `ship`.

## Vérification

Premier vrai `/council` = ADR-0002 (stratégie migrations, carte 012).
