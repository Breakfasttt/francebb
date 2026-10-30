---
id: 066
title: Bases locales vues comme démarrées alors qu'elles sont arrêtées
epic:
app: site
depends_on: []
adr:
verify: pnpm db:start démarre une base arrêtée et ne fait rien sur une base déjà démarrée
---

# 066 — Bases locales vues comme démarrées alors qu'elles sont arrêtées

## Pourquoi

Repéré pendant la carte 017. `scripts/local-postgres.mjs` décide qu'une base locale tourne en cherchant le mot `running` dans l'état renvoyé par Prisma. Or l'état d'une base arrêtée est `not_running`, qui contient aussi ce mot : le script croit la base démarrée et ne la lance pas. Il a fallu la démarrer à la main avec `npx prisma dev start bbfrance-site`.

## Action

- Comparer l'état exact (ou un mot entier) au lieu de chercher une partie du texte.
- Vérifier les deux cas : base arrêtée puis démarrée, et base déjà démarrée.
