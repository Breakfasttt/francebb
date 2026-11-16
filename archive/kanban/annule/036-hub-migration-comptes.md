---
id: 036
title: Migrer les 9 comptes vers le hub
epic: E06
app: hub
depends_on: [035]
adr: 0003
verify: les 9 membres se connectent via le hub sur la copie, sans onboarding
---

# 036 — Migrer les 9 comptes vers le hub

## Action

Backup Turso d'abord. Pour chaque membre : compte hub au même email (vérifié) + lien Discord/Google. Sur une copie de la base d'abord. Bandeau d'annonce 7 jours, puis `AUTH_MODE=hub` en prod ; Auth.js direct gardé 30 jours (flag).

## Annulée (ADR-0004)

La base de production repart de zéro : les membres se réinscriront directement via le hub, il n'y a plus de comptes à migrer.
