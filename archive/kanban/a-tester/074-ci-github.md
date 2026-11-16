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

## Résultat

Erreur trouvée : trois noms d'étapes contenaient « deux-points suivi d'une espace » sans guillemets (`name: Site : migrations…`, `name: Hub : schéma Prisma…`, `name: Application BBScheme : …`, `name: Application BBQuizz : …`). En YAML (le format du fichier), ce motif annonce une nouvelle clé : le fichier était invalide (« mapping values are not allowed here », ligne 41), et GitHub le refusait avant de lancer quoi que ce soit. Ces noms sont maintenant entre guillemets ; le fichier est vérifié par un analyseur YAML (`python -c "import yaml; yaml.safe_load(...)"`).

Les étapes correspondent aux commandes actuelles (`pnpm kanban`, `typecheck`, `lint:ratchet`, `build`, `test:e2e`, `test:sso` et `test:api` du hub, `scripts/generate-schema.mjs`). Une étape « Tests unitaires du site » (`pnpm --filter @bbfrance/site test:unit`) est ajoutée, car `pnpm check` les lance mais GitHub ne les lançait pas.

Ce qui reste au user, car l'IA n'envoie pas de code et n'agit pas sur GitHub sans demande : envoyer ce changement sur `development`, puis réactiver le workflow, aujourd'hui « désactivé manuellement » (`gh workflow enable CI`), et contrôler un premier lancement. Les tests de bout en bout lancés par GitHub n'ont pas été essayés depuis la carte 014 ; un échec à ce niveau serait une autre carte.
