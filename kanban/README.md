# Kanban BBFrance

Le kanban est la liste des tâches du projet. Chaque tâche est une **carte** : un petit fichier texte qui explique ce qu'il faut faire, pourquoi, et comment vérifier que c'est fini.

## Où sont les cartes

Le dossier dans lequel se trouve une carte **est** son état :

| Dossier | Contenu |
|---|---|
| `a-faire/` | Cartes pas encore commencées |
| `en-cours/` | Cartes en train d'être réalisées (une ou deux à la fois) |
| `termine/` | Cartes réalisées et validées |
| `annule/` | Cartes abandonnées sans être réalisées (la raison est écrite dans la carte) |
| `deprecie/` | Cartes terminées dont le résultat a été remplacé depuis (la carte indique par quoi) |
| `epics/` | Les **épics** : grands chantiers qui regroupent plusieurs cartes |

Changer l'état d'une carte = la déplacer d'un dossier à l'autre avec `git mv` (ex. `git mv kanban/a-faire/041-essai-postgres.md kanban/en-cours/`).

Pour voir la liste à jour : `pnpm kanban`. La même commande vérifie que tout est bien rangé ; la CI (vérification automatique sur GitHub) la lance à chaque envoi de code.

## Format d'une carte

Nom du fichier : `NNN-titre-court.md`, où `NNN` est un numéro à 3 chiffres unique (le plus grand numéro existant + 1).

```markdown
---
id: 050
title: Titre court
epic: E03
app: site
depends_on: [041, 046]
adr: 0004
verify: ce qui prouve que c'est fini (commande ou vérification visible)
---

# 050 — Titre court

## Pourquoi
## Action
```

| Champ | Signification |
|---|---|
| `id` | Le numéro, identique au début du nom du fichier |
| `epic` | Le grand chantier de rattachement (`kanban/epics/Exx-*.md`), ou vide |
| `app` | L'application concernée : `site`, `hub`, `packages/ui`… |
| `depends_on` | Les cartes à terminer avant celle-ci (`[]` si aucune) |
| `adr` | Le numéro de la décision écrite (`docs/adr/`) qui justifie la carte, ou vide |
| `verify` | Obligatoire : comment on sait que la carte est finie |

Une carte terminée reçoit une section **« Résultat »** qui dit ce qui a été fait. Une carte annulée reçoit une section **« Annulée »** qui dit pourquoi.

## Les étapes

1. Nouvelle demande : la commande `/card` rédige la carte dans `a-faire/`.
2. Démarrage : la carte passe dans `en-cours/`.
3. Fin : la commande `/ship` lance les vérifications. Après ta validation, la carte passe dans `termine/`.
4. Décision lourde (connexion, base de données, nouvelle bibliothèque, découpage d'une app) : `/council` d'abord, qui produit un ADR.

## Épics

`kanban/epics/Exx-titre.md` : en-tête `id`, `title`, `phase`, et une section « Terminé quand » qui dit quand le chantier est fini.
