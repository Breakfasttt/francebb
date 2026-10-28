---
id: 046
title: Passer le site et le hub sur Postgres
status: ready
epic: E02
app: site
depends_on: [041]
adr: 0004
verify: tous les tests passent sur Postgres en local et en déploiement de test
---

# 046 — Passer le site et le hub sur Postgres

## Pourquoi

Suite de l'essai 041 : remplacer SQLite/Turso par Postgres partout.

## Action

Schéma Prisma du site et du hub en Postgres, une seule migration de départ chacun, `prisma migrate deploy` lancé au déploiement. Base locale selon le résultat de 041. Tests (site et hub) sur Postgres local. Réécrire `DEPLOY.md`, le README et le skill `database-ops`.
