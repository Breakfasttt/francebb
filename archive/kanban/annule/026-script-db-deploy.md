---
id: 026
title: Script npm run db:deploy
epic: E02
app: site
depends_on: [025, 012]
adr: 0002
verify: sur la copie : affiche l'hôte, s'arrête si refus, termine sur « up to date »
---

# 026 — Script npm run db:deploy

## Action

`scripts/db-deploy.mjs` : backup (`scripts/turso-backup.mjs`) → affiche l'hôte cible → confirmation clavier → déploiement (outil retenu par la carte 025) → `migrate status`. Refuse si la variable d'URL est absente ou si le backup échoue.
Ajout du script dans `package.json` (accord user). Procédure dans `README.md` et `DEPLOY.md` (FR), retrait de `db push` du skill `database-ops`.

## Annulée (ADR-0004)

La base de production repart de zéro sur Postgres : plus de base Turso à sauvegarder ni à migrer.
