---
id: 074
title: "Réparer les vérifications automatiques de GitHub"
epic: E01
app: outillage
depends_on: []
adr:
verify: un envoi de code sur development lance le workflow CI de GitHub, qui réussit ; le workflow est réactivé (`gh workflow enable CI`)
---

# 074 — Réparer les vérifications automatiques de GitHub

## Pourquoi

Le workflow CI de GitHub (`.github/workflows/ci.yml`, les vérifications lancées par GitHub à chaque envoi de code) échoue en 0 seconde depuis le 28 octobre 2026, avec le message « This run likely failed because of a workflow file issue » : GitHub refuse le fichier lui-même avant de lancer quoi que ce soit. Le dernier lancement réussi date de la carte 014 ; le fichier a été modifié ensuite par la carte 046 (passage à Postgres). Le user recevait un email d'échec à chaque envoi : le workflow a été désactivé le 30 octobre 2026 (`gh workflow disable CI`).

## Action

- Trouver l'erreur du fichier (onglet Actions de GitHub, ou validation locale du YAML) et la corriger. Sans Docker sur le poste du user, mais GitHub peut utiliser un service Postgres dans ses machines.
- Vérifier que les étapes correspondent aux commandes actuelles (typecheck, cliquet ESLint des trois cibles, tests e2e du site et du hub).
- Réactiver le workflow avec `gh workflow enable CI` et contrôler un lancement réussi.
